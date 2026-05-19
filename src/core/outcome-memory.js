/**
 * OutcomeMemory v1.2.6 — Outcome-Weighted Memory System
 *
 * Tracks lessons learned with outcome-based weighting:
 *   - Success lessons get higher weight (1.5x bonus)
 *   - Failure lessons get lower weight (0.7x penalty)
 *   - Recency decay via half-life (default: 7 days)
 *   - Priority queue for retrieving high-value lessons
 *
 * Inspired by: TradeMemory Protocol + mark-improving-agent outcome-memory.ts
 * Key insight: "Not all lessons are equal — weight by outcome quality"
 *
 * Complements SelfCorrections (user corrections) with task outcome tracking.
 * v1.2.6: Initial implementation
 */

const fs = require('fs');
const path = require('path');

const TEMP_SUFFIX = '.tmp';

const DEFAULT_CONFIG = {
  maxEntries: 1000,
  successWeightBonus: 1.5,
  failureWeightPenalty: 0.7,
  neutralWeight: 0.5,
  recencyHalfLifeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  minWeightThreshold: 0.05,
};

/**
 * @typedef {Object} OutcomeEntry
 * @property {string} id
 * @property {string} content - Lesson content
 * @property {'success'|'failure'|'neutral'} outcome
 * @property {number} outcomeScore - 0.0-1.0, quality of outcome
 * @property {number} weight - computed: outcomeScore * recency_factor * outcome_multiplier
 * @property {string[]} tags
 * @property {string} taskId - optional task identifier
 * @property {number} createdAt - timestamp
 * @property {number} lastAccessedAt
 * @property {number} accessCount
 * @property {string} contextSnapshot - brief context when stored
 */

/**
 * @typedef {Object} OutcomeMemoryStats
 * @property {number} total
 * @property {Object} byOutcome - {success: n, failure: n, neutral: n}
 * @property {number} avgWeight
 * @property {Array<{tag: string, count: number}>} topTags
 */

class OutcomeMemory {
  constructor(rootPath = null) {
    this.rootPath = rootPath || path.join(__dirname, '..', '..', 'data');
    this._dataPath = this.rootPath;
    this._file = path.join(this._dataPath, 'outcome-memory.json');
    this._entries = [];
    this._loaded = false;
    this._dirty = false;
    this._counter = 0;
    this._config = { ...DEFAULT_CONFIG };
  }

  // ─── Persistence ────────────────────────────────────────────

  _ensureLoaded() {
    if (this._loaded) return;
    try {
      if (fs.existsSync(this._file)) {
        const data = JSON.parse(fs.readFileSync(this._file, 'utf8'));
        if (Array.isArray(data)) {
          this._entries = data;
        }
      }
    } catch (_) {
      this._entries = [];
    }
    this._loaded = true;
  }

  _persist() {
    if (!this._dirty) return;
    const dir = path.dirname(this._file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const tmpPath = `${this._file}${TEMP_SUFFIX}`;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        fs.writeFileSync(tmpPath, JSON.stringify(this._entries, null, 2), 'utf8');
        fs.renameSync(tmpPath, this._file);
        this._dirty = false;
        return;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          try { fs.unlinkSync(tmpPath); } catch (_) {}
          throw err;
        }
        const start = Date.now();
        while (Date.now() - start < 10 * attempts) {} // spin wait
      }
    }
  }

  // ─── Core Operations ───────────────────────────────────────

  /**
   * Store a new outcome-weighted memory.
   * @param {Object} params
   * @returns {OutcomeEntry}
   */
  store({ content, outcome, outcomeScore = 0.8, tags = [], taskId = null, contextSnapshot = null }) {
    this._ensureLoaded();
    const now = Date.now();
    const recencyFactor = this._calculateRecencyFactor(now, now);

    let weight;
    switch (outcome) {
      case 'success':
        weight = outcomeScore * this._config.successWeightBonus * recencyFactor;
        break;
      case 'failure':
        weight = outcomeScore * this._config.failureWeightPenalty * recencyFactor;
        break;
      default:
        weight = outcomeScore * this._config.neutralWeight * recencyFactor;
    }

    const entry = {
      id: `outcome_${Date.now()}_${++this._counter}`,
      content: content.substring(0, 500),
      outcome,
      outcomeScore: Math.max(0, Math.min(1, outcomeScore)),
      weight,
      tags,
      taskId,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 0,
      contextSnapshot: contextSnapshot ? contextSnapshot.substring(0, 200) : null,
    };

    this._entries.push(entry);
    this._dirty = true;
    this._enforceCapacity();

    return entry;
  }

  /**
   * Retrieve weighted memories, sorted by weight descending.
   * @param {Object} params
   * @returns {OutcomeEntry[]}
   */
  retrieve({ query = null, tags = null, minWeight = null, limit = 10, outcomeFilter = null } = {}) {
    this._ensureLoaded();
    const now = Date.now();
    let results = [...this._entries];

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(e =>
        tags.some(tag => e.tags.includes(tag))
      );
    }

    // Filter by outcome
    if (outcomeFilter && outcomeFilter.length > 0) {
      results = results.filter(e => outcomeFilter.includes(e.outcome));
    }

    // Recalculate weights with current time
    results = results.map(e => ({
      ...e,
      weight: this._recalculateWeight(e, now),
    }));

    // Filter by minimum weight
    if (minWeight !== null) {
      results = results.filter(e => e.weight >= minWeight);
    }

    // Text search
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(e =>
        e.content.toLowerCase().includes(q) ||
        (e.contextSnapshot && e.contextSnapshot.toLowerCase().includes(q))
      );
    }

    // Sort by weight descending
    results.sort((a, b) => b.weight - a.weight);

    // Limit results
    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }

  /**
   * Record that a memory was accessed.
   * @param {string} id
   * @returns {OutcomeEntry|null}
   */
  access(id) {
    this._ensureLoaded();
    const entry = this._entries.find(e => e.id === id);
    if (!entry) return null;

    entry.accessCount++;
    entry.lastAccessedAt = Date.now();
    entry.weight = this._recalculateWeight(entry, Date.now());
    this._dirty = true;

    return entry;
  }

  /**
   * Update outcome score for an existing entry.
   * @param {string} id
   * @param {number} newScore
   * @param {string} newOutcome
   * @returns {OutcomeEntry|null}
   */
  updateOutcome(id, newScore, newOutcome) {
    this._ensureLoaded();
    const entry = this._entries.find(e => e.id === id);
    if (!entry) return null;

    entry.outcomeScore = Math.max(0, Math.min(1, newScore));
    entry.outcome = newOutcome;
    entry.weight = this._recalculateWeight(entry, Date.now());
    this._dirty = true;

    return entry;
  }

  // ─── Weight Calculation ─────────────────────────────────────

  _calculateRecencyFactor(createdAt, now) {
    const ageMs = now - createdAt;
    const halfLife = this._config.recencyHalfLifeMs;
    return Math.pow(0.5, ageMs / halfLife);
  }

  _recalculateWeight(entry, now) {
    const recencyFactor = this._calculateRecencyFactor(entry.createdAt, now);
    switch (entry.outcome) {
      case 'success':
        return entry.outcomeScore * this._config.successWeightBonus * recencyFactor;
      case 'failure':
        return entry.outcomeScore * this._config.failureWeightPenalty * recencyFactor;
      default:
        return entry.outcomeScore * this._config.neutralWeight * recencyFactor;
    }
  }

  // ─── Maintenance ───────────────────────────────────────────

  _enforceCapacity() {
    if (this._entries.length <= this._config.maxEntries) return;

    const now = Date.now();
    const sorted = this._entries
      .map(e => ({ id: e.id, weight: this._recalculateWeight(e, now) }))
      .sort((a, b) => a.weight - b.weight);

    const toRemove = sorted.slice(0, this._entries.length - this._config.maxEntries);
    const removeIds = new Set(toRemove.map(t => t.id));
    this._entries = this._entries.filter(e => !removeIds.has(e.id));
  }

  /**
   * Prune entries below weight threshold.
   * @returns {number} Number of entries pruned
   */
  prune() {
    this._ensureLoaded();
    const now = Date.now();
    let pruned = 0;

    // Prune entries below threshold AND at least 1 day old
    this._entries = this._entries.filter(e => {
      const currentWeight = this._recalculateWeight(e, now);
      if (currentWeight < this._config.minWeightThreshold) {
        const ageMs = now - e.createdAt;
        if (ageMs > 24 * 60 * 60 * 1000) {
          pruned++;
          return false;
        }
      }
      return true;
    });

    if (pruned > 0) {
      this._dirty = true;
    }

    return pruned;
  }

  // ─── Statistics ────────────────────────────────────────────

  /**
   * Get statistics about stored memories.
   * @returns {OutcomeMemoryStats}
   */
  getStats() {
    this._ensureLoaded();
    const now = Date.now();

    const byOutcome = { success: 0, failure: 0, neutral: 0 };
    let totalWeight = 0;
    const tagCounts = new Map();

    for (const entry of this._entries) {
      byOutcome[entry.outcome]++;
      const weight = this._recalculateWeight(entry, now);
      totalWeight += weight;

      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const topTags = [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: this._entries.length,
      byOutcome,
      avgWeight: this._entries.length > 0 ? totalWeight / this._entries.length : 0,
      topTags,
    };
  }

  /**
   * Get entries by outcome type.
   * @param {string} outcome
   * @returns {OutcomeEntry[]}
   */
  getByOutcome(outcome) {
    this._ensureLoaded();
    return this._entries.filter(e => e.outcome === outcome);
  }

  /**
   * Get recent entries.
   * @param {number} count
   * @returns {OutcomeEntry[]}
   */
  getRecent(count = 10) {
    this._ensureLoaded();
    return [...this._entries]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count);
  }

  /**
   * Clear all entries.
   */
  clear() {
    this._entries = [];
    this._dirty = true;
    this._persist();
  }

  /**
   * Force persist to disk.
   */
  persist() {
    this._persist();
  }
}

/**
 * Factory to create OutcomeMemory instance.
 * @param {string|null} rootPath
 * @returns {OutcomeMemory}
 */
function createOutcomeMemory(rootPath = null) {
  return new OutcomeMemory(rootPath);
}

module.exports = { OutcomeMemory, createOutcomeMemory };
