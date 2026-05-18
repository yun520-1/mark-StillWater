/**
 * ReflectionEngine v1.0.9 — Self-Reflection from Memory
 *
 * Generates self-reflections from memory entries:
 *   - Detects SUCCESS/FAILURE patterns
 *   - Identifies actionable insights
 *   - Generates goal-directed reflections
 *
 * Based on: daima/src/reflection_engine.py (Reflexion paper 2304.03442)
 * v1.0.9: Initial implementation
 */

const ReflectionType = {
  SUCCESS: 'success',
  FAILURE: 'failure',
  NEUTRAL: 'neutral',
  PATTERN: 'pattern',
  ADVICE: 'advice',
};

const SUCCESS_SIGNALS = [
  '突破', '解决', '成功', '顺利', '太棒了', '谢谢', '有效', '完成', '满意',
  'proud', 'great', 'excellent', 'amazing', 'solved', 'fixed', 'thank', 'worked',
];

const FAILURE_SIGNALS = [
  '失败', '糟糕', '困难', '压力', '累', '难过', '沮丧', '失望', '不行',
  'failed', 'stuck', 'hard', 'tired', 'frustrated', 'failed', 'wrong', 'error',
];

/**
 * @typedef {Object} Reflection
 * @property {string} id
 * @property {number} timestamp
 * @property {string} rtype - ReflectionType value
 * @property {string} observation
 * @property {string} analysis
 * @property {string} inference
 * @property {boolean} actionable
 * @property {number} confidence
 * @property {string[]} tags
 */

class ReflectionEngine {
  constructor(memory) {
    this.memory = memory;
    this.reflections = [];
    this._counter = 0;
  }

  _nextId() {
    this._counter += 1;
    return `refl_${Date.now()}_${this._counter}`;
  }

  /**
   * Reflect on a set of memory entries.
   * @param {Array<{content: string, emotion?: string, outcome?: string}>} memories
   * @param {string|null} currentGoal
   * @returns {Reflection[]}
   */
  reflect(memories, currentGoal = null) {
    const results = [];
    if (!memories || memories.length === 0) return results;

    const recent = memories.slice(0, 3);
    const successEntries = [];
    const failureEntries = [];

    for (const m of recent) {
      const content = (m.content || '').toLowerCase();
      if (SUCCESS_SIGNALS.some(s => content.includes(s.toLowerCase()))) {
        successEntries.push(m);
      } else if (FAILURE_SIGNALS.some(s => content.includes(s.toLowerCase()))) {
        failureEntries.push(m);
      }
    }

    for (const e of successEntries) {
      results.push(this._makeReflection(
        ReflectionType.SUCCESS,
        `Positive event: ${(e.content || '').substring(0, 60)}`,
        'This interaction effectively addressed user needs; user expressed satisfaction or positive emotion',
        'Continue using similar response strategies; maintain current emotional resonance approach',
        ['success', e.emotion || 'unknown']
      ));
    }

    for (const e of failureEntries) {
      results.push(this._makeReflection(
        ReflectionType.FAILURE,
        `Negative event: ${(e.content || '').substring(0, 60)}`,
        'User expressed negative emotion; current strategy did not effectively address the issue',
        'Try a more empathetic listening posture; increase emotional validation; reduce direct advice giving',
        ['failure', e.emotion || 'unknown']
      ));
    }

    if (memories.length >= 3) {
      const pattern = this._detectPattern(memories);
      if (pattern) {
        results.push(this._makeReflection(
          ReflectionType.PATTERN,
          pattern.observation,
          pattern.analysis,
          pattern.inference,
          ['pattern']
        ));
      }
    }

    if (currentGoal) {
      const goalReflection = this._goalDirected(currentGoal, memories);
      if (goalReflection) {
        results.push(goalReflection);
      }
    }

    for (const r of results) {
      this.reflections.push(r);
    }

    return results;
  }

  _makeReflection(rtype, observation, analysis, inference, tags) {
    return {
      id: this._nextId(),
      timestamp: Date.now(),
      rtype,
      observation,
      analysis,
      inference,
      actionable: rtype === ReflectionType.ADVICE || rtype === ReflectionType.FAILURE,
      confidence: 0.7,
      tags,
    };
  }

  _detectPattern(memories) {
    if (memories.length < 3) return null;

    const emotions = memories.slice(-3).map(m => m.emotion || 'neutral');
    const uniqueEmotions = new Set(emotions);

    if (uniqueEmotions.size === 1) {
      return {
        observation: `Three consecutive same-type emotions: ${emotions[0]}`,
        analysis: 'User is repeatedly expressing in the same emotional state — this indicates a persistent issue',
        inference: 'Need to explore the emotional root more deeply rather than surface-level responses',
      };
    }
    return null;
  }

  _goalDirected(goal, memories) {
    const goalRelated = memories.filter(m =>
      (m.content || '').toLowerCase().includes(goal.toLowerCase())
    );

    if (goalRelated.length >= 2) {
      const outcomes = goalRelated
        .filter(m => m.outcome)
        .map(m => m.outcome);

      if (outcomes.length > 0) {
        return this._makeReflection(
          ReflectionType.ADVICE,
          `Goal '${goal}' has ${goalRelated.length} related memories`,
          `Of these, ${outcomes.length} have outcome records`,
          'Consider reviewing these outcomes to optimize strategy for this goal',
          ['goal', goal]
        );
      }
    }
    return null;
  }

  /**
   * Get actionable insights from reflections.
   */
  getActionableInsights() {
    return this.reflections
      .filter(r => r.actionable && r.confidence >= 0.6)
      .map(r => ({
        inference: r.inference,
        type: r.rtype,
        confidence: r.confidence,
      }));
  }

  /**
   * Get reflection summary stats.
   */
  getSummary() {
    if (this.reflections.length === 0) {
      return { total: 0 };
    }

    const byType = {};
    for (const r of this.reflections) {
      byType[r.rtype] = (byType[r.rtype] || 0) + 1;
    }

    return {
      total: this.reflections.length,
      by_type: byType,
      actionable: this.reflections.filter(r => r.actionable).length,
    };
  }

  /**
   * Get stats for health check.
   */
  getStats() {
    return {
      totalReflections: this.reflections.length,
      ...this.getSummary(),
    };
  }
}

module.exports = { ReflectionEngine, ReflectionType };
