/**
 * ContextPassport — Decision Context Tracker
 *
 * v1.0.5: Tracks the context chain at each reasoning/decision point so that
 * when errors occur, the recovery system has full context to make better decisions.
 *
 * Inspired by mark-improving-agent's Context Passport chain concept.
 * Simplified Pure JS implementation — no external dependencies.
 *
 * Features:
 *   - Stamp creation at each decision/reasoning point
 *   - Chain of context (what led to this decision)
 *   - Assumptions captured at decision time
 *   - Alternatives considered but rejected
 *   - Recovery-ready context export
 */

class ContextPassport {
  constructor() {
    this._stamps = [];
    this._current = null;
    this._MAX_STAMPS = 50;
  }

  /**
   * Create a new context stamp — marks entry into a reasoning/decision context.
   * @param {object} meta - { task, phase, intent }
   * @returns {string} stampId
   */
  enter(meta = {}) {
    const stampId = `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = Date.now();

    // Finalize previous stamp if exists
    if (this._current) {
      this._current.exitAt = now;
    }

    this._current = {
      stampId,
      task: meta.task || '',
      phase: meta.phase || 'reasoning', // reasoning|decision|action|verification
      intent: meta.intent || '',
      createdAt: now,
      exitAt: null,
      assumptions: [],
      alternatives: [],  // options considered but rejected
      acceptedOption: null,
      context: {},        // free-form key/value context
      annotations: [],    // notes added during execution
      outcome: null,      // success|failure|partial
    };

    return stampId;
  }

  /**
   * Record an assumption at current context.
   */
  assume(text) {
    if (!this._current) return;
    this._current.assumptions.push(text);
  }

  /**
   * Record an alternative option that was considered but rejected.
   */
  considerRejected(option, reason = '') {
    if (!this._current) return;
    this._current.alternatives.push({ option, reason, at: Date.now() });
  }

  /**
   * Record the option that was accepted.
   */
  accept(option, reason = '') {
    if (!this._current) return;
    this._current.acceptedOption = { option, reason, at: Date.now() };
  }

  /**
   * Add free-form context key/value.
   */
  annotate(key, value) {
    if (!this._current) return;
    this._current.context[key] = value;
  }

  /**
   * Add a note to current stamp.
   */
  note(text) {
    if (!this._current) return;
    this._current.annotations.push({ text, at: Date.now() });
  }

  /**
   * Record outcome and exit current stamp.
   */
  exit(outcome = 'success') {
    if (!this._current) return;
    this._current.outcome = outcome;
    this._current.exitAt = Date.now();

    // Push to stamps history
    this._stamps.push(this._current);
    if (this._stamps.length > this._MAX_STAMPS) {
      this._stamps = this._stamps.slice(-this._MAX_STAMPS);
    }

    const finished = this._current;
    this._current = null;
    return finished;
  }

  /**
   * Get the current open stamp (if any).
   */
  getCurrent() {
    return this._current;
  }

  /**
   * Get recent stamps (most recent first).
   */
  getRecent(count = 10) {
    return this._stamps.slice(-count).reverse();
  }

  /**
   * Get stamps by task pattern.
   */
  getByTask(taskPattern) {
    const pat = taskPattern.toLowerCase();
    return this._stamps.filter(s => s.task.toLowerCase().includes(pat));
  }

  /**
   * Export context chain for a given stamp — used by SelfHealer for recovery.
   * Returns structured context object for error recovery decisions.
   */
  exportForRecovery(stampId) {
    const stamp = this._stamps.find(s => s.stampId === stampId) || this._current;
    if (!stamp) return null;

    return {
      stampId: stamp.stampId,
      task: stamp.task,
      phase: stamp.phase,
      intent: stamp.intent,
      assumptions: stamp.assumptions,
      acceptedOption: stamp.acceptedOption,
      rejectedAlternatives: stamp.alternatives,
      context: stamp.context,
      annotations: stamp.annotations,
      duration_ms: stamp.exitAt ? stamp.exitAt - stamp.createdAt : Date.now() - stamp.createdAt,
      outcome: stamp.outcome,
      chain: this._buildChain(stamp),
    };
  }

  _buildChain(stamp) {
    // Build the reasoning chain summary
    const chain = [];
    if (stamp.assumptions.length > 0) {
      chain.push(`assumed: ${stamp.assumptions.join('; ')}`);
    }
    if (stamp.acceptedOption) {
      chain.push(`decided: ${stamp.acceptedOption.option} (reason: ${stamp.acceptedOption.reason})`);
    }
    if (stamp.alternatives.length > 0) {
      chain.push(`rejected: ${stamp.alternatives.map(a => a.option).join(', ')}`);
    }
    return chain;
  }

  /**
   * Get context summary for verification (SelfVerifier integration).
   */
  getSummary() {
    return {
      totalStamps: this._stamps.length,
      currentOpen: this._current !== null,
      recentOutcomes: this._stamps.slice(-5).map(s => s.outcome),
      phases: [...new Set(this._stamps.map(s => s.phase))],
    };
  }

  /**
   * Clear all stamps.
   */
  clear() {
    this._stamps = [];
    this._current = null;
  }
}

module.exports = { ContextPassport };
