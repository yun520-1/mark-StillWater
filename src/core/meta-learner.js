/**
 * MetaLearner — Learning Strategy Selection with Q-Table
 *
 * v1.0.3: Selects optimal learning strategy based on input content.
 *
 * 5 strategies:
 *   - conceptual: 概念/理论/原理
 *   - example: 例子/案例/实例
 *   - analogy: 类比/比喻/相似
 *   - step_by_step: 步骤/过程/阶段
 *   - socratic: 为什么/为何/原因
 *
 * Features:
 *   - Keyword-based strategy selection
 *   - Q-table learning from outcomes (success/failure)
 *   - Concept extraction from text
 */

const STRATEGY_KEYWORDS = {
  conceptual: ['概念', '理论', '原理', '本质', '定义', '是什么', '什么是'],
  example: ['例子', '示例', '案例', '实例', '例如', '比如', 'such as', 'for example'],
  analogy: ['类比', '比喻', '相似', '如同', '犹如', 'like', 'similar to', '比起'],
  step_by_step: ['步骤', '过程', '阶段', '依次', '逐步', 'first', 'then', 'next', 'finally'],
  socratic: ['为什么', '为何', '原因', '理由', '怎样', '如何', 'why', 'how', 'reason'],
};

const ALPHA = 0.3;
const DEFAULT_SCORE = 50.0;

class MetaLearner {
  constructor() {
    this.qtable = this._createInitialQTable();
    this._booted = false;
  }

  _createInitialQTable() {
    return {
      conceptual: { score: DEFAULT_SCORE, uses: 0 },
      example: { score: DEFAULT_SCORE, uses: 0 },
      analogy: { score: DEFAULT_SCORE, uses: 0 },
      step_by_step: { score: DEFAULT_SCORE, uses: 0 },
      socratic: { score: DEFAULT_SCORE, uses: 0 },
    };
  }

  /**
   * Select the best learning strategy for input
   */
  selectStrategy(input) {
    const scores = this._classifyByKeywords(input);
    const strategy = this._selectBestStrategy(scores);
    const hits = scores.get(strategy) || 0;
    const confidence = Math.min(1, (hits + 1) / 4);
    return { strategy, confidence };
  }

  _classifyByKeywords(input) {
    const scores = new Map();

    for (const [strategy, keywords] of Object.entries(STRATEGY_KEYWORDS)) {
      let count = 0;
      for (const kw of keywords) {
        if (input.includes(kw)) count++;
      }
      scores.set(strategy, count);
    }

    return scores;
  }

  _selectBestStrategy(scores) {
    let best = 'conceptual';
    let maxScore = -1;

    for (const [strategy, score] of scores) {
      if (score > maxScore) {
        maxScore = score;
        best = strategy;
      }
    }

    return best;
  }

  /**
   * Learn from input — extract concepts
   */
  learn(input) {
    const sentences = input.split(/[。！？\n]+/).filter(s => s.trim().length > 0);
    const concepts = [];
    const meaningfulSentences = [];

    const conceptKeywords = ['是', '为', '指', '表示', '代表', '意味着'];
    for (const sent of sentences) {
      const trimmed = sent.trim();
      if (trimmed.length < 4) continue;

      let foundConcept = false;
      for (const kw of conceptKeywords) {
        if (trimmed.includes(kw)) {
          const parts = trimmed.split(kw);
          if (parts[0] && parts[0].trim().length > 1) {
            concepts.push(parts[0].trim().slice(-20));
            foundConcept = true;
          }
        }
      }
      if (!foundConcept && trimmed.length > 5) {
        meaningfulSentences.push(trimmed.slice(0, 40));
      }
    }

    const uniqueConcepts = [...new Set(concepts)].slice(0, 10);
    if (uniqueConcepts.length === 0 && meaningfulSentences.length > 0) {
      for (const s of meaningfulSentences.slice(0, 5)) {
        if (s.length > 4) uniqueConcepts.push(s.slice(0, 20));
      }
    }

    const quality = uniqueConcepts.length >= 5 ? 'high' :
                    uniqueConcepts.length >= 2 ? 'medium' : 'low';

    const summary = meaningfulSentences.length > 0
      ? meaningfulSentences.slice(0, 3).join('; ')
      : input.slice(0, 100);

    return {
      summary,
      concepts: uniqueConcepts,
      quality,
    };
  }

  /**
   * Record outcome of learning — update Q-table
   */
  recordOutcome(strategy, success) {
    const entry = this.qtable[strategy];
    entry.uses += 1;

    const delta = success ? 10 : -5;
    entry.score = entry.score + ALPHA * delta;

    if (entry.score < 0) entry.score = 0;
    if (entry.score > 100) entry.score = 100;
  }

  /**
   * Get current strategy scores
   */
  getStrategyScores() {
    return { ...this.qtable };
  }

  /**
   * Get learning strategy description
   */
  getStrategyDescription(strategy) {
    const descriptions = {
      conceptual: '概念理解型 — 追问"是什么"，抓住本质定义',
      example: '案例学习型 — 寻找具体例子，通过实例理解',
      analogy: '类比推理型 — 用已知类比未知，建立联系',
      step_by_step: '分步执行型 — 强调过程和步骤，循序渐进',
      socratic: '苏格拉底型 — 追问为什么，探究深层原因',
    };
    return descriptions[strategy] || '未知策略';
  }
}

module.exports = { MetaLearner };
