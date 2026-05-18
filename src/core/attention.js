/**
 * Attention — Global Workspace Theory Attention Selection
 *
 * v1.0.8: Inspired by Baars GWT attention mechanism and Shanahan's "Consciousness Engine".
 * The attention filter determines what enters the Global Workspace.
 *
 * Key concepts:
 *   - Attention acts as a bottleneck/sieve
 *   - Only attended information becomes conscious
 *   - Competition between stimuli for attentional resources
 *   - Based on salience, relevance, recency, intensity
 *
 * This module decides which competing "streams" of information
 * get broadcast through the Global Workspace.
 *
 * Pure JS, no dependencies.
 */

class Attention {
  constructor() {
    this._streams = new Map();   // source -> { content, salience, timestamp, strength }
    this._attended = null;      // currently attended stream key
    this._history = [];          // attention history
    this._MAX_STREAMS = 10;
    this._MAX_HISTORY = 30;
    this._DECAY_RATE = 0.02;   // salience decay per second
  }

  /**
   * Present a stimulus to the attention system.
   * Returns true if it won attention this cycle.
   */
  present(source, content, salience = 0.5, strength = 1.0) {
    // Apply recency boost for new content
    const recencyBoost = 1.0;
    const effectiveSalience = salience * recencyBoost;

    const entry = {
      content,
      salience: effectiveSalience,
      strength,
      timestamp: Date.now(),
      competing: false,
    };

    // If we already have this source, compare salience
    if (this._streams.has(source)) {
      const existing = this._streams.get(source);
      entry.salience = Math.max(existing.salience, effectiveSalience);
      entry.strength = Math.max(existing.strength, strength);
    }

    this._streams.set(source, entry);

    // Bound streams
    if (this._streams.size > this._MAX_STREAMS) {
      this._evictLowSalience();
    }

    // Check if this wins attention
    const winner = this._selectWinner(source);
    if (winner === source) {
      this._attended = source;
      this._history.push({ source, content, salience: effectiveSalience, at: Date.now() });
      if (this._history.length > this._MAX_HISTORY) {
        this._history.shift();
      }
      return true;
    }

    return false;
  }

  /**
   * Select winner via competitive attention.
   */
  _selectWinner(candidateSource) {
    const now = Date.now();

    // Apply decay and find best
    let bestSource = null;
    let bestScore = -Infinity;

    for (const [source, entry] of this._streams) {
      // Decay based on time
      const age = (now - entry.timestamp) / 1000;
      const decayedSalience = entry.salience * Math.exp(-this._DECAY_RATE * age);

      // Winner-takes-all: +bonus if currently attended
      const attentionBonus = (source === this._attended) ? 0.1 : 0;

      // Strength bonus
      const strengthBonus = entry.strength * 0.1;

      const score = decayedSalience + attentionBonus + strengthBonus;

      if (score > bestScore) {
        bestScore = score;
        bestSource = source;
      }
    }

    // Only switch if significantly better (hysteresis)
    if (bestSource !== this._attended && this._attended !== null) {
      const currentEntry = this._streams.get(this._attended);
      if (currentEntry) {
        const currentAge = (now - currentEntry.timestamp) / 1000;
        const currentScore = currentEntry.salience * Math.exp(-this._DECAY_RATE * currentAge) + 0.1;
        if (bestScore < currentScore + 0.15) {
          return this._attended; // Stay with current
        }
      }
    }

    return bestSource;
  }

  /**
   * Evict lowest salience stream.
   */
  _evictLowSalience() {
    let lowest = null;
    let lowestSalience = Infinity;

    for (const [source, entry] of this._streams) {
      if (entry.salience < lowestSalience) {
        lowestSalience = entry.salience;
        lowest = source;
      }
    }

    if (lowest) {
      this._streams.delete(lowest);
    }
  }

  /**
   * Get current attended content.
   */
  getAttended() {
    if (!this._attended) return null;
    const entry = this._streams.get(this._attended);
    if (!entry) return null;
    return {
      source: this._attended,
      content: entry.content,
      salience: entry.salience,
    };
  }

  /**
   * Get all competing streams.
   */
  getStreams() {
    const now = Date.now();
    const result = [];
    for (const [source, entry] of this._streams) {
      const age = (now - entry.timestamp) / 1000;
      result.push({
        source,
        content: entry.content.substring(0, 80),
        salience: entry.salience,
        decayedSalience: Math.round(entry.salience * Math.exp(-this._DECAY_RATE * age) * 100) / 100,
        isAttended: source === this._attended,
        age_seconds: Math.round(age),
      });
    }
    return result.sort((a, b) => b.decayedSalience - a.decayedSalience);
  }

  /**
   * Get attention history.
   */
  getHistory(count = 20) {
    return this._history.slice(-count).reverse();
  }

  /**
   * Clear all streams.
   */
  clear() {
    this._streams.clear();
    this._attended = null;
  }

  /**
   * Boost salience of a stream (e.g., from emotion engine).
   */
  boost(source, amount = 0.2) {
    const entry = this._streams.get(source);
    if (entry) {
      entry.salience = Math.min(1.0, entry.salience + amount);
    }
  }

  /**
   * Get summary stats.
   */
  getStats() {
    return {
      streamCount: this._streams.size,
      attended: this._attended,
      historySize: this._history.length,
      topSalience: this._streams.size > 0
        ? Math.max(...[...this._streams.values()].map(e => e.salience))
        : 0,
    };
  }
}

module.exports = { Attention };
