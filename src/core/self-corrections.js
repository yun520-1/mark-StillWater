/**
 * SelfCorrections v1.2.2 — Self-Improving Corrections Tracker
 *
 * Tracks user corrections and promotes patterns to memory:
 *   - Log corrections from user feedback
 *   - Detect repeated patterns (3x = promote)
 *   - Integrate with ReflectionEngine for self-improvement
 *
 * Based on: clawhub skill self-improving corrections.md
 * v1.2.2: Initial implementation
 */

const MAX_CORRECTIONS_LOG = 50;
const PATTERN_PROMOTE_THRESHOLD = 3;

/**
 * @typedef {Object} Correction
 * @property {string} id
 * @property {number} timestamp
 * @property {string} correction - What the user corrected
 * @property {string} context - Trigger context
 * @property {string} domain - Domain (code-style, communication, project, etc.)
 * @property {number} count - Occurrence count
 * @property {string} status - 'new' | 'tracking' | 'promoted' | 'archived'
 */

const CorrectionDomain = {
  CODE_STYLE: 'code_style',
  COMMUNICATION: 'communication',
  PROJECT: 'project',
  PREFERENCE: 'preference',
  BEHAVIOR: 'behavior',
};

const CORRECTION_SIGNALS = [
  'no,', "that's not right", 'actually,', "you're wrong",
  'i prefer', 'remember that', 'i told you', 'stop doing',
  'why do you keep', 'not like this', 'should be', '不对', '不是这样',
  '记得', '我说过', '不要', '总是', '从来',
];

class SelfCorrections {
  constructor() {
    this.corrections = [];
    this._counter = 0;
  }

  /**
   * Detect if text contains a correction signal.
   * @param {string} text
   * @returns {boolean}
   */
  isCorrection(text) {
    const lower = (text || '').toLowerCase();
    return CORRECTION_SIGNALS.some(signal =>
      lower.includes(signal.toLowerCase())
    );
  }

  /**
   * Log a correction from user.
   * @param {string} correction - What the user said
   * @param {string} context - Context where correction happened
   * @param {string} domain - Domain category
   * @returns {Correction}
   */
  logCorrection(correction, context = '', domain = CorrectionDomain.BEHAVIOR) {
    // Check for existing similar correction
    const existing = this.corrections.find(c =>
      this._similar(c.correction, correction)
    );

    if (existing) {
      existing.count += 1;
      existing.timestamp = Date.now();

      // Promote if threshold reached
      if (existing.count >= PATTERN_PROMOTE_THRESHOLD) {
        existing.status = 'promoted';
      }
      return existing;
    }

    // Create new correction
    const newCorrection = {
      id: `corr_${Date.now()}_${++this._counter}`,
      timestamp: Date.now(),
      correction: correction.substring(0, 200),
      context: context.substring(0, 100),
      domain,
      count: 1,
      status: 'new',
    };

    this.corrections.push(newCorrection);

    // Trim if over limit
    if (this.corrections.length > MAX_CORRECTIONS_LOG) {
      this.corrections = this.corrections.slice(-MAX_CORRECTIONS_LOG);
    }

    return newCorrection;
  }

  /**
   * Check if two corrections are similar (simple fuzzy match).
   * @param {string} a
   * @param {string} b
   * @returns {boolean}
   */
  _similar(a, b) {
    const normA = a.toLowerCase().replace(/[^a-z0-9一-鿿]/g, '').substring(0, 50);
    const normB = b.toLowerCase().replace(/[^a-z0-9一-鿿]/g, '').substring(0, 50);
    if (normA === normB) return true;
    if (normA.includes(normB) || normB.includes(normA)) return true;
    return false;
  }

  /**
   * Get corrections by status.
   * @param {string} status
   * @returns {Correction[]}
   */
  getByStatus(status) {
    return this.corrections.filter(c => c.status === status);
  }

  /**
   * Get corrections by domain.
   * @param {string} domain
   * @returns {Correction[]}
   */
  getByDomain(domain) {
    return this.corrections.filter(c => c.domain === domain);
  }

  /**
   * Get promoted corrections (patterns to remember).
   * @returns {Correction[]}
   */
  getPromoted() {
    return this.getByStatus('promoted');
  }

  /**
   * Get tracking corrections (patterns in progress).
   * @returns {Correction[]}
   */
  getTracking() {
    return this.getByStatus('tracking');
  }

  /**
   * Archive a correction.
   * @param {string} id
   */
  archive(id) {
    const corr = this.corrections.find(c => c.id === id);
    if (corr) {
      corr.status = 'archived';
    }
  }

  /**
   * Get statistics.
   * @returns {Object}
   */
  getStats() {
    const byStatus = {
      new: 0,
      tracking: 0,
      promoted: 0,
      archived: 0,
    };
    const byDomain = {};

    for (const c of this.corrections) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byDomain[c.domain] = (byDomain[c.domain] || 0) + 1;
    }

    return {
      total: this.corrections.length,
      byStatus,
      byDomain,
      promotedCount: byStatus.promoted,
      trackingCount: byStatus.tracking + byStatus.new,
    };
  }

  /**
   * Export corrections for memory integration.
   * @returns {Array<{key: string, value: string, tier: string}>}
   */
  exportForMemory() {
    const promoted = this.getPromoted();
    return promoted.map(c => ({
      key: `correction:${c.domain}:${c.id}`,
      value: c.correction,
      tier: 'learned',
      tags: ['correction', c.domain, `count:${c.count}`],
    }));
  }
}

module.exports = {
  SelfCorrections,
  CorrectionDomain,
  CORRECTION_SIGNALS,
  MAX_CORRECTIONS_LOG,
  PATTERN_PROMOTE_THRESHOLD,
};
