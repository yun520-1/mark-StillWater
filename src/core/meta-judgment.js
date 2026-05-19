/**
 * MetaJudgment v1.2.1 — 50% Threshold Decision + Recursive TGB Review
 *
 * Core formula: P(判定) ∧ P(元判定) ∧ 有目标 → 持续进步
 *
 * Based on: User's original insight (2026-04-25)
 * - L1: Initial judgment at 50% threshold
 * - L2: Meta-judgment (judging the judgment) with 真善美 review
 * - L3: Goal judgment (are we making progress?)
 *
 * v1.2.1: Initial implementation
 */

const TGB_THRESHOLD = 0.5;
const JUDGMENT_THRESHOLD = 0.5;

/**
 * @typedef {Object} JudgmentResult
 * @property {boolean} decision - Accept/revise decision
 * @property {number} l1Score - L1 initial judgment score
 * @property {Object} l2TGB - L2 真善美 scores
 * @property {boolean} l3GoalMet - L3 goal progress
 * @property {string} reasoning - Decision reasoning
 * @property {number} confidence - Overall confidence
 */

/**
 * Score text on 真善美 (Truth-Goodness-Beauty) dimensions.
 *
 * @param {string} text - Text to score
 * @returns {{真: number, 善: number, 美: number, overall: number}}
 */
function scoreTGB(text) {
  const lower = (text || '').toLowerCase();

  // Truth indicators
  const truthWords = ['真', 'truth', 'real', 'fact', 'actual', '确实', '准确', '正确', '事实', '实证'];
  const truthScore = truthWords.filter(w => lower.includes(w.toLowerCase())).length / truthWords.length;

  // Goodness indicators
  const goodWords = ['善', 'good', 'right', 'kind', 'help', 'care', '正确', '善良', '有益', '价值'];
  const goodScore = goodWords.filter(w => lower.includes(w.toLowerCase())).length / goodWords.length;

  // Beauty indicators
  const beautyWords = ['美', 'beauty', 'elegant', 'simple', '和谐', '优雅', '优美', '美好', '平衡'];
  const beautyScore = beautyWords.filter(w => lower.includes(w.toLowerCase())).length / beautyWords.length;

  return {
    真: Math.min(1, truthScore * 2),
    善: Math.min(1, goodScore * 2),
    美: Math.min(1, beautyScore * 2),
    overall: (truthScore + goodScore + beautyScore) / 3,
  };
}

/**
 * Check if making progress on goal.
 *
 * @param {boolean} hasGoal - Whether a goal exists
 * @param {number} currentProgress - Current progress (0-1)
 * @param {number} previousProgress - Previous progress (0-1)
 * @returns {boolean}
 */
function checkGoalProgress(hasGoal, currentProgress = 0, previousProgress = 0) {
  if (!hasGoal) return true; // No goal = can't regress
  const isImproving = currentProgress > previousProgress;
  const isStable = Math.abs(currentProgress - previousProgress) < 0.1;
  return isImproving || isStable;
}

/**
 * Perform meta-judgment on input text.
 *
 * @param {Object} params
 * @param {string} params.text - Input text to judge
 * @param {number} [params.l1Score=0.5] - L1 initial judgment score (0-1)
 * @param {boolean} [params.hasGoal=true] - Whether goal exists
 * @param {number} [params.currentProgress=0.5] - Current goal progress
 * @param {number} [params.previousProgress=0.4] - Previous goal progress
 * @returns {JudgmentResult}
 */
function metaJudge({
  text,
  l1Score = 0.5,
  hasGoal = true,
  currentProgress = 0.5,
  previousProgress = 0.4,
}) {
  // L2: 真善美审查
  const l2TGB = scoreTGB(text);

  // L3: 目标判定
  const l3GoalMet = checkGoalProgress(hasGoal, currentProgress, previousProgress);

  // 综合判定
  const l1Pass = l1Score >= JUDGMENT_THRESHOLD;
  const l2Pass = l2TGB.善 >= TGB_THRESHOLD;
  const l3Pass = l3GoalMet;

  const decision = l1Pass && l2Pass && l3Pass;

  const reasoning = decision
    ? `L1(${l1Score.toFixed(2)} ≥ ${JUDGMENT_THRESHOLD}) ∧ L2(善=${l2TGB.善.toFixed(2)} ≥ ${TGB_THRESHOLD}) ∧ L3(${l3GoalMet ? '有进步' : '停滞'}) → 接受`
    : `L1(${l1Score.toFixed(2)} ${l1Pass ? '✓' : '✗'}) ∨ L2(善=${l2TGB.善.toFixed(2)} ${l2Pass ? '✓' : '✗'}) ∨ L3(${l3GoalMet ? '✓' : '✗'}) → 需修正`;

  return {
    decision,
    l1Score,
    l2TGB,
    l3GoalMet,
    reasoning,
    confidence: (l1Score + l2TGB.overall + (l3GoalMet ? 1 : 0.5)) / 3,
  };
}

class MetaJudgment {
  constructor() {
    this.history = [];
    this._counter = 0;
  }

  /**
   * Judge a decision or text.
   * @param {Object} params - Same as metaJudge
   * @returns {JudgmentResult}
   */
  judge(params) {
    const result = metaJudge(params);
    result.id = `mj_${Date.now()}_${++this._counter}`;
    result.timestamp = Date.now();
    this.history.push(result);
    return result;
  }

  /**
   * Judge a decision outcome.
   * @param {string} decision - The decision made
   * @param {boolean} success - Whether it succeeded
   * @param {Object} context - Additional context
   * @returns {JudgmentResult}
   */
  judgeOutcome(decision, success, context = {}) {
    const l1Score = success ? 0.8 : 0.3;
    return this.judge({
      text: decision,
      l1Score,
      hasGoal: context.hasGoal !== false,
      currentProgress: context.currentProgress || 0.5,
      previousProgress: context.previousProgress || 0.4,
    });
  }

  /**
   * Get judgment history.
   * @param {number} count - Number of recent judgments
   * @returns {JudgmentResult[]}
   */
  getHistory(count = 10) {
    return this.history.slice(-count);
  }

  /**
   * Get judgment statistics.
   * @returns {Object}
   */
  getStats() {
    if (this.history.length === 0) {
      return { total: 0, acceptRate: 0 };
    }
    const accepted = this.history.filter(r => r.decision).length;
    return {
      total: this.history.length,
      acceptRate: accepted / this.history.length,
      recentDecisions: this.history.slice(-5).map(r => ({
        id: r.id,
        decision: r.decision,
        l1: r.l1Score.toFixed(2),
        善: r.l2TGB.善.toFixed(2),
      })),
    };
  }
}

module.exports = {
  metaJudge,
  scoreTGB,
  checkGoalProgress,
  MetaJudgment,
  JUDGMENT_THRESHOLD,
  TGB_THRESHOLD,
};
