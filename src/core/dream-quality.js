/**
 * DreamQuality v1.2.0 — Dream Outcome Evaluator
 *
 * Scores each dream cycle on a composite Dream Quality Score (DQS),
 * providing feedback for adaptive dream mode selection.
 *
 * Based on: Bitterbot-AI/bitterbot-desktop dream-evaluator.ts patterns
 * v1.2.0: Initial implementation
 */

const DQS_WEIGHTS = {
  crystalYield: 0.25,      // New insights per LLM call
  mergeEfficiency: 0.15,   // Memory merge quality
  orphanRescue: 0.15,     // Orphan memory rescue rate
  bondStability: 0.30,     // Emotional bond consistency
  tokenEfficiency: 0.15,   // Resource usage efficiency
};

/**
 * @typedef {Object} DreamOutcomeComponents
 * @property {number} crystalYield - New insights per LLM call (0-1)
 * @property {number} mergeEfficiency - Memory merge quality (0-1)
 * @property {number} orphanRescue - Orphan memory rescue rate (0-1)
 * @property {number} bondStability - Emotional bond consistency (0-1)
 * @property {number} tokenEfficiency - Resource usage efficiency (0-1)
 */

/**
 * @typedef {Object} DreamOutcome
 * @property {string} cycleId
 * @property {number} dqs - Composite Dream Quality Score (0-1)
 * @property {DreamOutcomeComponents} components
 * @property {Object} inputSignals
 * @property {string[]} modesRun
 * @property {number} timestamp
 */

/**
 * Evaluate a completed dream cycle and compute the Dream Quality Score.
 *
 * @param {Object} params
 * @param {string} params.cycleId - Unique cycle identifier
 * @param {number} params.llmCalls - Number of LLM calls made
 * @param {number} params.newInsights - Number of new insights generated
 * @param {number} params.orphansRescued - Number of orphan memories rescued
 * @param {number} params.orphansTotal - Total orphan memories
 * @param {number} params.tokenBudget - Total token budget
 * @param {number} params.tokensUsed - Tokens consumed
 * @param {number} params.bondDriftRatio - Emotional bond drift (0-1, lower is better)
 * @param {string[]} params.modesRun - Dream modes that ran
 * @returns {DreamOutcome}
 */
function evaluateDreamOutcome({
  cycleId,
  llmCalls = 1,
  newInsights = 0,
  orphansRescued = 0,
  orphansTotal = 0,
  tokenBudget = 10000,
  tokensUsed = 0,
  bondDriftRatio = 0,
  modesRun = [],
}) {
  // Crystal yield: new insights per LLM call
  const crystalYield = Math.min(1, newInsights / Math.max(1, llmCalls));

  // Merge efficiency: assumed from orphan rescue ratio
  const mergeEfficiency = orphansTotal > 0
    ? orphansRescued / orphansTotal
    : 1.0;

  // Orphan rescue rate
  const orphanRescue = orphansTotal > 0
    ? orphansRescued / orphansTotal
    : 1.0;

  // Bond stability: drift ratio below threshold = stable
  const bondStability = bondDriftRatio < 0.3 ? 1.0 : 0.0;

  // Token efficiency
  const tokenEfficiency = tokenBudget > 0
    ? Math.max(0, 1 - (tokensUsed / tokenBudget))
    : 1.0;

  // Composite DQS
  const dqs = (
    DQS_WEIGHTS.crystalYield * crystalYield +
    DQS_WEIGHTS.mergeEfficiency * mergeEfficiency +
    DQS_WEIGHTS.orphanRescue * orphanRescue +
    DQS_WEIGHTS.bondStability * bondStability +
    DQS_WEIGHTS.tokenEfficiency * tokenEfficiency
  );

  return {
    cycleId,
    dqs: Math.round(dqs * 1000) / 1000,
    components: {
      crystalYield: Math.round(crystalYield * 1000) / 1000,
      mergeEfficiency: Math.round(mergeEfficiency * 1000) / 1000,
      orphanRescue: Math.round(orphanRescue * 1000) / 1000,
      bondStability,
      tokenEfficiency: Math.round(tokenEfficiency * 1000) / 1000,
    },
    inputSignals: {
      llmCalls,
      newInsights,
      orphansRescued,
      tokenBudget,
      tokensUsed,
      bondDriftRatio,
    },
    modesRun,
    timestamp: Date.now(),
  };
}

/**
 * Get DQS weight configuration.
 */
function getDQSWeights() {
  return { ...DQS_WEIGHTS };
}

/**
 * Interpret DQS score into human-readable quality level.
 *
 * @param {number} dqs - Dream Quality Score (0-1)
 * @returns {string}
 */
function interpretDQS(dqs) {
  if (dqs >= 0.8) return 'excellent';
  if (dqs >= 0.6) return 'good';
  if (dqs >= 0.4) return 'fair';
  if (dqs >= 0.2) return 'poor';
  return 'minimal';
}

/**
 * Get improvement suggestions based on low-scoring components.
 *
 * @param {DreamOutcome} outcome
 * @returns {string[]}
 */
function getImprovementSuggestions(outcome) {
  const suggestions = [];
  const { components } = outcome;

  if (components.crystalYield < 0.3) {
    suggestions.push('Consider running Exploration or Research dream modes to generate more insights');
  }
  if (components.mergeEfficiency < 0.3) {
    suggestions.push('Run Compression mode more frequently to merge redundant memories');
  }
  if (components.orphanRescue < 0.3) {
    suggestions.push('Allocate more cycle time to Ripple mode to rescue orphaned memories');
  }
  if (components.bondStability < 0.5) {
    suggestions.push('Focus on relationship memories during Consolidation to maintain emotional bonds');
  }
  if (components.tokenEfficiency < 0.3) {
    suggestions.push('Consider shorter dream cycles or more focused modes to reduce token usage');
  }

  return suggestions;
}

class DreamQualityTracker {
  constructor() {
    this.history = [];
    this._counter = 0;
  }

  /**
   * Track a dream outcome.
   * @param {Object} params - Same as evaluateDreamOutcome
   * @returns {DreamOutcome}
   */
  track(params) {
    const outcome = evaluateDreamOutcome({
      ...params,
      cycleId: params.cycleId || `dream_${Date.now()}_${++this._counter}`,
    });
    this.history.push(outcome);
    return outcome;
  }

  /**
   * Get recent outcomes.
   * @param {number} count - Number of recent outcomes to return
   * @returns {DreamOutcome[]}
   */
  getRecent(count = 5) {
    return this.history.slice(-count);
  }

  /**
   * Get average DQS over recent cycles.
   * @param {number} count - Number of recent cycles to average
   * @returns {number}
   */
  getAverageDQS(count = 10) {
    const recent = this.getRecent(count);
    if (recent.length === 0) return 0;
    const sum = recent.reduce((acc, o) => acc + o.dqs, 0);
    return Math.round((sum / recent.length) * 1000) / 1000;
  }

  /**
   * Get trend analysis - is DQS improving or declining?
   * @param {number} count - Number of cycles to analyze
   * @returns {'improving' | 'stable' | 'declining'}
   */
  getTrend(count = 5) {
    const recent = this.getRecent(count);
    if (recent.length < 3) return 'stable';

    const half = Math.floor(recent.length / 2);
    const firstHalf = recent.slice(0, half);
    const secondHalf = recent.slice(half);

    const firstAvg = firstHalf.reduce((a, o) => a + o.dqs, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, o) => a + o.dqs, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Get quality statistics.
   * @returns {Object}
   */
  getStats() {
    if (this.history.length === 0) {
      return { total: 0, avgDQS: 0, trend: 'stable' };
    }
    return {
      total: this.history.length,
      avgDQS: this.getAverageDQS(this.history.length),
      trend: this.getTrend(),
      recentDQS: this.getRecent(3).map(o => o.dqs),
    };
  }
}

module.exports = {
  evaluateDreamOutcome,
  getDQSWeights,
  interpretDQS,
  getImprovementSuggestions,
  DreamQualityTracker,
};
