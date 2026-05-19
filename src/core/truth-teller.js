/**
 * TruthTeller v1.2.4 — Truth-telling with Socratic Challenge
 *
 * Based on: mark-improving-agent truth-teller.ts
 * - sayTruth: statement with confidence estimation
 * - correctUser: correct user misconceptions
 * - challengeAssumption: challenge user assumptions with reasons
 * - askDifficultQuestion: Socratic questioning for deeper inquiry
 *
 * v1.2.4: Initial implementation
 */

const TRUTH_LEVELS = {
  FULL_TRUTH: 'full_truth',
  PARTIAL_TRUTH: 'partial_truth',
  UNKNOWN: 'unknown',
  WITHHOLDING: 'withholding',
};

const DEFAULT_CONFIG = {
  enabled: true,
  autoCorrect: false,
  challengeThreshold: 0.7,
  uncertaintyTolerance: 0.3,
};

const DIFFICULT_QUESTIONS = [
  '你怎么知道这个是真的？',
  '你能证明这个吗？',
  '如果这个错了，会怎么样？',
  '你有没有考虑过相反的观点？',
  '你的假设是什么？',
  '你怎么确定的？',
  '这个结论的最强证据是什么？',
  '有没有可能你遗漏了什么？',
];

/**
 * @typedef {Object} TruthStatement
 * @property {string} id
 * @property {string} content
 * @property {string} truthLevel
 * @property {number} confidence
 * @property {string|null} uncertainty
 * @property {string|null} correction
 * @property {number} timestamp
 * @property {string} context
 */

/**
 * @typedef {Object} TruthTellerStats
 * @property {number} statementsMade
 * @property {number} correctionsOffered
 * @property {number} uncertaintiesAdmitted
 * @property {number} challengesIssued
 * @property {number} truthScore
 */

class TruthTeller {
  constructor(config = {}) {
    this._config = { ...DEFAULT_CONFIG, ...config };
    this._history = [];
    this._stats = {
      statementsMade: 0,
      correctionsOffered: 0,
      uncertaintiesAdmitted: 0,
      challengesIssued: 0,
      truthScore: 1.0,
    };
  }

  /**
   * Calculate truth level from confidence.
   * @param {string} content
   * @param {number} confidence
   * @returns {string}
   */
  _calcTruthLevel(content, confidence) {
    if (confidence >= 0.9) return TRUTH_LEVELS.FULL_TRUTH;
    if (confidence >= 0.5) return TRUTH_LEVELS.PARTIAL_TRUTH;
    if (confidence >= 0.2) return TRUTH_LEVELS.UNKNOWN;
    return TRUTH_LEVELS.WITHHOLDING;
  }

  /**
   * Detect uncertainty indicators in text.
   * @param {string} content
   * @returns {string|null}
   */
  _detectUncertainty(content) {
    const indicators = [
      '可能', '也许', '不确定', '大概', '或许', '好像', '似乎',
      'maybe', 'perhaps', 'probably', 'possibly', 'uncertain',
    ];
    const lower = content.toLowerCase();
    for (const indicator of indicators) {
      if (lower.includes(indicator.toLowerCase())) {
        return `检测到不确定性: "${indicator}"`;
      }
    }
    return null;
  }

  /**
   * Detect potential overgeneralization.
   * @param {string} content
   * @returns {string|null}
   */
  _detectOvergeneralization(content) {
    const patterns = [
      { pattern: /所有|每个|全部|always|every|all/, reason: '过度泛化: 使用了绝对词但无证据' },
      { pattern: /一定|肯定|绝对|必然|must|certainly/, reason: '绝对断言: 无资格限制的确定性表达' },
      { pattern: /从来|从未|永远不|never|always not/, reason: '过度负面泛化: 绝对否定表述' },
    ];
    for (const { pattern, reason } of patterns) {
      if (pattern.test(content)) return reason;
    }
    return null;
  }

  /**
   * Estimate confidence based on content.
   * @param {string} statement
   * @returns {number}
   */
  estimateConfidence(statement) {
    let confidence = 0.7;

    const certaintyWords = ['确定', '肯定', '知道', '事实', '数据', '研究', '证明', 'certain', 'know', 'fact', 'data', '证据'];
    for (const word of certaintyWords) {
      if (statement.toLowerCase().includes(word.toLowerCase())) {
        confidence += 0.05;
      }
    }

    const uncertaintyWords = ['可能', '也许', '不确定', '大概', '或许', '好像', 'maybe', 'perhaps', 'probably', 'uncertain'];
    for (const word of uncertaintyWords) {
      if (statement.toLowerCase().includes(word.toLowerCase())) {
        confidence -= 0.15;
      }
    }

    const overGeneralizations = ['所有', '每个', '全部', 'always', 'every', 'all', 'never', '从未', '从来'];
    for (const word of overGeneralizations) {
      if (statement.toLowerCase().includes(word.toLowerCase())) {
        confidence -= 0.1;
      }
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Make a truth statement.
   * @param {string} statement
   * @param {string} [context='']
   * @returns {TruthStatement}
   */
  sayTruth(statement, context = '') {
    const confidence = this.estimateConfidence(statement);
    const uncertainty = this._detectUncertainty(statement);
    const truthLevel = this._calcTruthLevel(statement, confidence);

    const truthStatement = {
      id: `truth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: statement.substring(0, 500),
      truthLevel,
      confidence: Math.round(confidence * 100) / 100,
      uncertainty,
      timestamp: Date.now(),
      context,
    };

    this._history.push(truthStatement);
    this._stats.statementsMade++;

    if (truthLevel === TRUTH_LEVELS.UNKNOWN) {
      this._stats.uncertaintiesAdmitted++;
    }

    this._updateTruthScore();
    return truthStatement;
  }

  /**
   * Admit not knowing something.
   * @param {string} question
   * @param {string} [context='']
   * @returns {TruthStatement}
   */
  sayUnknown(question, context = '') {
    const truthStatement = {
      id: `truth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: '我不知道。',
      truthLevel: TRUTH_LEVELS.UNKNOWN,
      confidence: 0,
      uncertainty: `问题超出当前知识范围: "${question.substring(0, 100)}"`,
      timestamp: Date.now(),
      context,
    };

    this._history.push(truthStatement);
    this._stats.statementsMade++;
    this._stats.uncertaintiesAdmitted++;
    this._updateTruthScore();

    return truthStatement;
  }

  /**
   * Correct a user misconception.
   * @param {string} statement - What user said
   * @param {string} correction - The correction
   * @param {string} [context='']
   * @returns {TruthStatement}
   */
  correctUser(statement, correction, context = '') {
    const truthStatement = {
      id: `truth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `你刚才说的"${statement.substring(0, 50)}..."可能需要修正。`,
      truthLevel: TRUTH_LEVELS.FULL_TRUTH,
      confidence: 0.9,
      uncertainty: null,
      correction,
      timestamp: Date.now(),
      context,
    };

    this._history.push(truthStatement);
    this._stats.statementsMade++;
    this._stats.correctionsOffered++;
    this._updateTruthScore();

    return truthStatement;
  }

  /**
   * Challenge a user assumption with reasoning.
   * @param {string} assumption - The assumption to challenge
   * @param {string} reason - Reason for challenging
   * @returns {TruthStatement}
   */
  challengeAssumption(assumption, reason) {
    const truthStatement = {
      id: `truth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `我需要挑战你的假设: ${assumption}`,
      truthLevel: TRUTH_LEVELS.FULL_TRUTH,
      confidence: 0.85,
      uncertainty: null,
      correction: reason,
      timestamp: Date.now(),
      context: 'challenge',
    };

    this._history.push(truthStatement);
    this._stats.statementsMade++;
    this._stats.challengesIssued++;
    this._updateTruthScore();

    return truthStatement;
  }

  /**
   * Ask a Socratic difficult question.
   * @param {string} question - The topic being discussed
   * @returns {string}
   */
  askDifficultQuestion(question) {
    const hash = question.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return DIFFICULT_QUESTIONS[hash % DIFFICULT_QUESTIONS.length];
  }

  /**
   * Assess self truthfulness.
   * @returns {{ truthfulness: number, areas: string[] }}
   */
  assessSelfTruth() {
    const areas = [];

    if (this._stats.uncertaintiesAdmitted < 5 && this._stats.statementsMade > 20) {
      areas.push('可能在某些领域过于自信');
    }

    if (this._stats.correctionsOffered > this._stats.statementsMade * 0.3) {
      areas.push('倾向于频繁质疑');
    }

    if (this._stats.correctionsOffered < 3 && this._stats.statementsMade > 50) {
      areas.push('可能没有足够纠正错误');
    }

    return {
      truthfulness: Math.round(this._stats.truthScore * 100) / 100,
      areas,
    };
  }

  /**
   * Update truth score based on history.
   */
  _updateTruthScore() {
    const total = this._stats.statementsMade;
    if (total === 0) {
      this._stats.truthScore = 1.0;
      return;
    }

    const fullTruths = this._history.filter(s => s.truthLevel === TRUTH_LEVELS.FULL_TRUTH).length;
    const unknowns = this._history.filter(s => s.truthLevel === TRUTH_LEVELS.UNKNOWN).length;

    const honestyScore = 1 - (unknowns / Math.max(1, total));
    const accuracyScore = fullTruths / Math.max(1, total);

    this._stats.truthScore = (honestyScore + accuracyScore) / 2;
  }

  /**
   * Get configuration.
   */
  getConfig() {
    return { ...this._config };
  }

  /**
   * Update configuration.
   * @param {Object} config
   */
  updateConfig(config) {
    this._config = { ...this._config, ...config };
  }

  /**
   * Get statistics.
   * @returns {TruthTellerStats}
   */
  getStats() {
    return { ...this._stats };
  }

  /**
   * Get truth history.
   * @param {number} [limit=20]
   * @returns {TruthStatement[]}
   */
  getHistory(limit = 20) {
    return this._history.slice(-limit);
  }
}

/**
 * Format a truth statement for display.
 * @param {TruthStatement} statement
 * @returns {string}
 */
function formatTruthStatement(statement) {
  let output = '';

  switch (statement.truthLevel) {
    case TRUTH_LEVELS.FULL_TRUTH:
      output = statement.content;
      break;
    case TRUTH_LEVELS.PARTIAL_TRUTH:
      output = `${statement.content}${statement.uncertainty ? ` (${statement.uncertainty})` : ''}`;
      break;
    case TRUTH_LEVELS.UNKNOWN:
      output = `${statement.content}${statement.uncertainty ? ` ${statement.uncertainty}` : ''}`;
      break;
    case TRUTH_LEVELS.WITHHOLDING:
      output = '[信息暂不披露，因不确定性过高]';
      break;
  }

  if (statement.correction) {
    output += `\n修正: ${statement.correction}`;
  }

  return output;
}

module.exports = {
  TruthTeller,
  formatTruthStatement,
  TRUTH_LEVELS,
  DIFFICULT_QUESTIONS,
};
