/**
 * HeartFlow Memory System — Three-tier memory architecture
 * 
 * Inspired by MemGPT's tiered memory + MeaningfulMemory's lazy loading.
 * 
 * Tiers:
 *   CORE     — Immutable identity rules, never deleted
 *   LEARNED  — Accumulated knowledge (persisted, searchable, access-counted)
 *   EPHEMERAL — Session context (TTL-based, heat-protected, auto-consolidation)
 */

const fs = require('fs');
const path = require('path');

const TEMP_SUFFIX = '.tmp';

/**
 * Atomic write using temp file + rename (from mark-improving-agent).
 * Prevents data corruption on write interruption.
 */
function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tmpPath = `${filePath}${TEMP_SUFFIX}`;
  const content = JSON.stringify(data, null, 2);

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      fs.writeFileSync(tmpPath, content, 'utf8');
      fs.renameSync(tmpPath, filePath);
      return;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        try { fs.unlinkSync(tmpPath); } catch (_) {}
        throw err;
      }
      // Brief delay before retry
      const start = Date.now();
      while (Date.now() - start < 10 * attempts) {} // spin wait
    }
  }
}

class HeartFlowMemory {
  constructor(rootPath = null) {
    // Default root to skill data directory
    this.rootPath = rootPath || path.join(__dirname, '..', '..', 'data');
    this._dataPath = this.rootPath;

    // File paths
    this._coreFile = path.join(this._dataPath, 'core.json');
    this._learnedFile = path.join(this._dataPath, 'learned.json');
    this._ephemeralFile = path.join(this._dataPath, 'ephemeral.json');

    // Lazy-load flags
    this._coreLoaded = false;
    this._learnedLoaded = false;
    this._ephemeralLoaded = false;

    // In-memory stores
    this._coreStore = {};
    this._learnedStore = {};
    this._ephemeralStore = {};
  }

  // ─── Lazy Loading ───────────────────────────────────────────

  _ensureCoreLoaded() {
    if (this._coreLoaded) return;
    try {
      if (fs.existsSync(this._coreFile)) {
        this._coreStore = JSON.parse(fs.readFileSync(this._coreFile, 'utf8'));
      }
    } catch (_) { this._coreStore = {}; }
    this._coreLoaded = true;
  }

  _ensureLearnedLoaded() {
    if (this._learnedLoaded) return;
    try {
      if (fs.existsSync(this._learnedFile)) {
        this._learnedStore = JSON.parse(fs.readFileSync(this._learnedFile, 'utf8'));
      }
    } catch (_) { this._learnedStore = {}; }
    this._learnedLoaded = true;
  }

  _ensureEphemeralLoaded() {
    if (this._ephemeralLoaded) return;
    try {
      if (fs.existsSync(this._ephemeralFile)) {
        this._ephemeralStore = JSON.parse(fs.readFileSync(this._ephemeralFile, 'utf8'));
      }
    } catch (_) { this._ephemeralStore = {}; }
    this._ephemeralLoaded = true;
  }

  // ─── Persistence ────────────────────────────────────────────

  _saveCore() { atomicWriteJson(this._coreFile, this._coreStore); }
  _saveLearned() { atomicWriteJson(this._learnedFile, this._learnedStore); }
  _saveEphemeral() { atomicWriteJson(this._ephemeralFile, this._ephemeralStore); }

  // ─── CORE — Identity Rules (Immutable) ─────────────────────

  /**
   * Add an immutable CORE identity rule.
   */
  addCore(key, value, tags = []) {
    this._ensureCoreLoaded();
    if (this._coreStore[key]) {
      return { success: false, reason: 'core_key_exists', key };
    }
    this._coreStore[key] = { value, tags, createdAt: Date.now() };
    this._saveCore();
    return { success: true, key, tier: 'core' };
  }

  /**
   * Get a CORE entry by key.
   */
  getCore(key) {
    this._ensureCoreLoaded();
    return this._coreStore[key] || null;
  }

  listCore() {
    this._ensureCoreLoaded();
    return Object.entries(this._coreStore).map(([key, v]) => ({ key, ...v }));
  }

  // Alias for rememberCore
  rememberCore(key, value) {
    return this.addCore(key, value);
  }

  // ─── LEARNED — Accumulated Knowledge ───────────────────────

  /**
   * Add or update a LEARNED memory entry.
   */
  learn(key, value, tags = []) {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();

    // Protect CORE keys
    if (this._coreStore[key]) {
      return { success: false, reason: 'key_in_core', key };
    }

    const now = Date.now();
    if (this._learnedStore[key]) {
      this._learnedStore[key].value = value;
      this._learnedStore[key].tags = [...new Set([...this._learnedStore[key].tags, ...tags])];
      this._learnedStore[key].lastAccessed = now;
      this._learnedStore[key].accessCount = (this._learnedStore[key].accessCount || 0) + 1;
    } else {
      this._learnedStore[key] = { value, tags, accessCount: 0, lastAccessed: now, createdAt: now };
    }

    this._saveLearned();
    return { success: true, key, tier: 'learned' };
  }

  /**
   * Get a LEARNED entry by key.
   */
  getLearned(key) {
    this._ensureLearnedLoaded();
    const entry = this._learnedStore[key];
    if (entry) {
      entry.accessCount = (entry.accessCount || 0) + 1;
      entry.lastAccessed = Date.now();
      this._saveLearned();
      return { ...entry };
    }
    return null;
  }

  recall(key) {
    return this.getLearned(key);
  }

  forget(key) {
    this._ensureLearnedLoaded();
    if (this._learnedStore[key]) {
      delete this._learnedStore[key];
      this._saveLearned();
      return { success: true, key };
    }
    return { success: false, reason: 'key_not_found' };
  }

  listLearned(query = null) {
    this._ensureLearnedLoaded();
    let entries = Object.entries(this._learnedStore).map(([key, v]) => ({ key, ...v }));

    if (query) {
      const q = query.toLowerCase();
      entries = entries.filter(e =>
        e.key.toLowerCase().includes(q) ||
        String(e.value || '').toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return entries;
  }

  // Alias for rememberLearn
  rememberLearn(key, value) {
    return this.learn(key, value);
  }

  // ─── EPHEMERAL — Working Memory ────────────────────────────

  rememberEphemeral(key, value, ttlMs = 3600000) {
    this._ensureEphemeralLoaded();
    this._ephemeralStore[key] = {
      value,
      ttl: ttlMs,
      createdAt: Date.now(),
      _accessCount: 0,
      tags: [],
    };
    this._saveEphemeral();
    return { success: true, key, tier: 'ephemeral' };
  }

  _touchEphemeral(key) {
    if (this._ephemeralStore[key]) {
      this._ephemeralStore[key]._accessCount = (this._ephemeralStore[key]._accessCount || 0) + 1;
      if (this._ephemeralStore[key]._accessCount % 5 === 0) {
        this._saveEphemeral();
      }
    }
  }

  getEphemeral(key) {
    this._ensureEphemeralLoaded();
    const entry = this._ephemeralStore[key];
    if (!entry) return null;

    if (Date.now() - entry.createdAt > entry.ttl) {
      delete this._ephemeralStore[key];
      this._saveEphemeral();
      return null;
    }

    entry._accessCount = (entry._accessCount || 0) + 1;
    return { ...entry };
  }

  getWorking(key) {
    return this.getEphemeral(key);
  }

  forgetWorking(key) {
    this._ensureEphemeralLoaded();
    if (this._ephemeralStore[key]) {
      delete this._ephemeralStore[key];
      this._saveEphemeral();
      return { success: true };
    }
    return { success: false };
  }

  // ─── Universal remember ────────────────────────────────────

  remember(key, value, tier = 'learned') {
    switch (tier) {
      case 'core':
        return this.addCore(key, value);
      case 'ephemeral':
        return this.rememberEphemeral(key, value);
      default:
        return this.learn(key, value);
    }
  }

  // ─── Consolidation ────────────────────────────────────────

  /**
   * Consolidate EPHEMERAL → LEARNED.
   * Heat-aware: frequently-accessed entries are promoted.
   */
  consolidate() {
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();

    const promoted = [];
    const now = Date.now();

    for (const [key, entry] of Object.entries(this._ephemeralStore)) {
      const age = now - entry.createdAt;
      const accessCount = entry._accessCount || 0;
      const heatScore = accessCount + (key.startsWith('signal:') ? 2 : 0);

      if (heatScore >= 3 || age > 1800000) {
        const tags = entry.tags || [];
        if (key.startsWith('signal:')) tags.push('emotion_signal');
        this.learn(key, entry.value, ['consolidated', ...tags]);
        delete this._ephemeralStore[key];
        promoted.push(key);
      }
    }

    if (promoted.length > 0) {
      this._saveEphemeral();
      this._saveLearned();
    }

    return { promoted, learnedCount: Object.keys(this._learnedStore).length };
  }

  // ─── Search ────────────────────────────────────────────────

  search(query) {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();

    const q = query.toLowerCase();
    const results = [];

    for (const [key, v] of Object.entries(this._coreStore)) {
      if (key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q)) {
        results.push({ key, tier: 'core', value: v.value });
      }
    }
    for (const [key, v] of Object.entries(this._learnedStore)) {
      if (key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q)) {
        results.push({ key, tier: 'learned', value: v.value });
      }
    }
    for (const [key, v] of Object.entries(this._ephemeralStore)) {
      if (Date.now() - v.createdAt > v.ttl) continue;
      if (key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q)) {
        results.push({ key, tier: 'ephemeral', value: v.value });
      }
    }

    return results;
  }

  // ─── Stats ─────────────────────────────────────────────────

  stats() {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();
    this._cleanEphemeral();

    return {
      core: Object.keys(this._coreStore).length,
      learned: Object.keys(this._learnedStore).length,
      ephemeral: Object.keys(this._ephemeralStore).length,
      total: Object.keys(this._coreStore).length + Object.keys(this._learnedStore).length + Object.keys(this._ephemeralStore).length,
    };
  }

  getStats() { return this.stats(); }

  getMemoryStats() {
    const stats = this.stats();
    const core = this.listCore();
    const learned = this.listLearned();

    return {
      ...stats,
      core_samples: core.slice(0, 3),
      learned_samples: learned.slice(0, 5),
    };
  }

  _cleanEphemeral() {
    const now = Date.now();
    for (const [key, entry] of Object.entries(this._ephemeralStore)) {
      if (now - entry.createdAt > entry.ttl) {
        delete this._ephemeralStore[key];
      }
    }
  }
}

module.exports = { HeartFlowMemory };
