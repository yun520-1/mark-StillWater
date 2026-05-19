/**
 * MetaLearner — Learning Strategy Selection with Q-Table
 *
 * v1.2.8: Enhanced with pattern recording and learning analytics
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
 *   - Pattern recording with timestamps (NEW v1.2.8)
 *   - Learning analytics and best strategy detection (NEW v1.2.8)
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
    this.patterns = [];  // NEW v1.2.8: learning patterns history
    this._booted = false;
  }

  _createInitialQTable() {
    return {
      conceptual: { score: DEFAULT_SCORE, uses: 0, success: 0 },
      example: { score: DEFAULT_SCORE, uses: 0, success: 0 },
      analogy: { score: DEFAULT_SCORE, uses: 0, success: 0 },
      step_by_step: { score: DEFAULT_SCORE, uses: 0, success: 0 },
      socratic: { score: DEFAULT_SCORE, uses: 0, success: 0 },
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
   * Enhanced v1.2.8: also records pattern for analytics
   */
  recordOutcome(strategy, success, context = {}) {
    const entry = this.qtable[strategy];
    entry.uses += 1;
    if (success) entry.success += 1;

    const delta = success ? 10 : -5;
    entry.score = entry.score + ALPHA * delta;

    if (entry.score < 0) entry.score = 0;
    if (entry.score > 100) entry.score = 100;

    // NEW v1.2.8: Record pattern for learning analytics
    this.patterns.push({
      strategy,
      success,
      inputPreview: (context.input || '').slice(0, 50),
      timestamp: Date.now()
    });

    // Keep only last 100 patterns
    if (this.patterns.length > 100) {
      this.patterns = this.patterns.slice(-100);
    }
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

  // ─── NEW v1.2.8: Learning Analytics ──────────────────────────

  /**
   * Get comprehensive learning statistics
   */
  getLearningStats() {
    const totalUses = Object.values(this.qtable).reduce((sum, s) => sum + s.uses, 0);

    const strategyStats = Object.entries(this.qtable).map(([name, data]) => ({
      name,
      score: data.score.toFixed(1),
      uses: data.uses,
      successRate: data.uses > 0 ? (data.success / data.uses * 100).toFixed(1) + '%' : 'N/A'
    }));

    // Find best strategy by success rate (min 3 uses)
    const bestBySuccess = strategyStats
      .filter(s => s.uses >= 3)
      .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate))[0];

    // Find best strategy by score
    const bestByScore = strategyStats
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))[0];

    return {
      totalLearnings: totalUses,
      patternCount: this.patterns.length,
      bestBySuccessRate: bestBySuccess?.name || 'insufficient_data',
      bestByScore: bestByScore?.name,
      strategyStats,
      recentPatterns: this.patterns.slice(-5).map(p => ({
        strategy: p.strategy,
        success: p.success,
        time: new Date(p.timestamp).toLocaleTimeString()
      }))
    };
  }

  /**
   * Get best performing strategy (min 3 uses for statistical significance)
   */
  getBestStrategy() {
    const significant = Object.entries(this.qtable)
      .filter(([_, data]) => data.uses >= 3)
      .map(([name, data]) => ({
        name,
        successRate: data.uses > 0 ? data.success / data.uses : 0,
        uses: data.uses
      }));

    if (significant.length === 0) {
      return { name: 'step_by_step', reason: 'default', confidence: 0.5 };
    }

    significant.sort((a, b) => b.successRate - a.successRate);
    const best = significant[0];

    return {
      name: best.name,
      reason: `highest_success_rate`,
      confidence: best.successRate,
      uses: best.uses
    };
  }

  /**
   * Get recommendation for improving learning
   */
  getRecommendation() {
    const stats = this.getLearningStats();
    const recommendations = [];

    // Check for unused strategies
    const unused = stats.strategyStats.filter(s => s.uses === 0);
    if (unused.length > 0) {
      recommendations.push({
        type: 'explore_strategy',
        message: `策略 ${unused.map(s => s.name).join(', ')} 尚未尝试，建议探索`
      });
    }

    // Check for underperforming strategies
    const lowPerformers = stats.strategyStats.filter(s =>
      s.uses >= 3 && parseFloat(s.successRate) < 30
    );
    if (lowPerformers.length > 0) {
      recommendations.push({
        type: 'avoid_strategy',
        message: `策略 ${lowPerformers.map(s => s.name).join(', ')} 成功率较低，建议少用`
      });
    }

    return {
      recommendations,
      totalLearnings: stats.totalLearnings,
      message: recommendations.length > 0
        ? recommendations[0].message
        : '学习策略表现良好，继续当前方法'
    };
  }
}

module.exports = { MetaLearner };
