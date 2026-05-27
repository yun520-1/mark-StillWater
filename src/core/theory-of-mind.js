/**
 * Theory of Mind (ToM) 模块 — 心镜v1.16
 *
 * 基于论文:
 * - A Survey of Theory of Mind in LLMs (arXiv:2502.06470)
 * - Minding Language Models' (Lack of) Theory of Mind (arXiv:2306.00924)
 * - SymbolicToM: 零样本增强LLM ToM能力
 *
 * 功能:
 * - 推断他人心理状态（信念、意图、情绪）
 * - 检测隐含意图和未说出的需求
 * - 识别社交线索和关系动态
 * - 预测他人行为
 */

class TheoryOfMind {
  constructor(memory = null) {
    this.memory = memory;

    // ToM层级（基于心理学研究）
    this.tomLevels = [
      { level: 1, name: '基本情绪感知', description: '直接识别明显情绪', accuracy: 0.9 },
      { level: 2, name: '意图推断', description: '从行为推断意图', accuracy: 0.75 },
      { level: 3, name: '信念归因', description: '理解他人有不同于现实信念的能力', accuracy: 0.6 },
      { level: 4, name: '隐含意图检测', description: '识别没说出的真实意图', accuracy: 0.5 },
      { level: 5, name: '复杂关系建模', description: '理解权力动态、期望、社会规范', accuracy: 0.4 },
    ];

    // 心理状态关键词
    this.mentalStateSignals = {
      belief: ['认为', '相信', '觉得', '以为', '指望', '期望', '希望', 'wish', 'believe', 'think', 'expect', 'hope'],
      desire: ['想要', '需要', '渴望', '希望', '愿意', 'want', 'need', 'desire', 'wish', 'hope'],
      emotion: ['开心', '生气', '难过', '害怕', '担心', '失望', '沮丧', 'happy', 'angry', 'sad', 'fear', 'worry', 'disappointed'],
      intention: ['打算', '准备', '计划', '故意', '刻意', 'intend', 'plan', 'purpose', 'deliberately'],
      knowledge: ['知道', '了解', '懂得', '清楚', 'know', 'understand', 'aware', 'realize'],
    };

    // 社交线索模式
    this.socialSignals = {
      power: ['命令', '要求', '指责', '教导', '领导', '跟随', '服从', 'command', 'order', 'blame', 'teach'],
      intimacy: ['亲密', '信任', '秘密', '分享', 'close', 'trust', 'secret', 'share'],
      reciprocity: ['回报', '欠', '感谢', '帮忙', '回报', 'owe', 'thanks', 'help', 'reciprocate'],
      consistency: ['总是', '从不', '每次', '一直', 'always', 'never', 'every', 'consistently'],
    };
  }

  /**
   * 推断说话者的心理状态
   * @param {string} text - 用户输入
   * @param {object} context - 上下文信息（可选）
   * @returns {object} ToM分析结果
   */
  inferMentalState(text, context = {}) {
    const lower = text.toLowerCase();

    // 检测各维度心理状态
    const beliefs = this._detectSignals(lower, this.mentalStateSignals.belief);
    const desires = this._detectSignals(lower, this.mentalStateSignals.desire);
    const emotions = this._detectSignals(lower, this.mentalStateSignals.emotion);
    const intentions = this._detectSignals(lower, this.mentalStateSignals.intention);
    const knowledge = this._detectSignals(lower, this.mentalStateSignals.knowledge);

    // 检测社交动态
    const socialDynamics = this._detectSocialDynamics(lower);

    // 计算ToM复杂度得分
    const complexity = this._calculateComplexity(beliefs, desires, emotions, intentions, knowledge, socialDynamics);

    // 推断心理状态层级
    const tomLevel = this._inferTomLevel(complexity, beliefs, intentions, socialDynamics);

    // 生成隐含意图分析
    const implicitIntent = this._inferImplicitIntent(text, context, beliefs, desires, socialDynamics);

    return {
      level: tomLevel,
      levelName: this.tomLevels[tomLevel - 1]?.name || '未知',
      beliefs,
      desires,
      emotions,
      intentions,
      knowledge,
      socialDynamics,
      complexity,
      implicitIntent,
      confidence: this.tomLevels[tomLevel - 1]?.accuracy || 0.5,
      warnings: this._generateWarnings(tomLevel, beliefs, intentions, socialDynamics),
    };
  }

  /**
   * 检测信号
   */
  _detectSignals(text, keywords) {
    const found = [];
    for (const kw of keywords) {
      if (text.includes(kw)) {
        found.push(kw);
      }
    }
    return {
      count: found.length,
      signals: found.slice(0, 5),
      detected: found.length > 0,
    };
  }

  /**
   * 检测社交动态
   */
  _detectSocialDynamics(text) {
    const dynamics = {};

    for (const [type, keywords] of Object.entries(this.socialSignals)) {
      const found = keywords.filter(k => text.includes(k));
      if (found.length > 0) {
        dynamics[type] = { count: found.length, signals: found.slice(0, 3) };
      }
    }

    return {
      types: Object.keys(dynamics),
      details: dynamics,
      hasSocialContent: Object.keys(dynamics).length > 0,
    };
  }

  /**
   * 计算复杂度
   */
  _calculateComplexity(beliefs, desires, emotions, intentions, knowledge, social) {
    let score = 0;
    score += beliefs.detected ? 2 : 0;
    score += desires.detected ? 2 : 0;
    score += emotions.detected ? 1 : 0;
    score += intentions.detected ? 2 : 0;
    score += knowledge.detected ? 1 : 0;
    score += social.hasSocialContent ? 3 : 0;
    return Math.min(score, 10);
  }

  /**
   * 推断ToM层级
   */
  _inferTomLevel(complexity, beliefs, intentions, social) {
    if (complexity >= 8 || (social.hasSocialContent && intentions.detected)) {
      return 5;
    } else if (complexity >= 6 || (beliefs.detected && intentions.detected)) {
      return 4;
    } else if (complexity >= 4 || beliefs.detected) {
      return 3;
    } else if (complexity >= 2 || intentions.detected) {
      return 2;
    }
    return 1;
  }

  /**
   * 推断隐含意图
   * 基于Psy-LLM研究：心理咨询中用户常隐藏真实意图
   */
  _inferImplicitIntent(text, context, beliefs, desires, social) {
    const implicitIntents = [];

    // 检测"求助但不说"的模式
    if (desires.detected && !this._hasDirectRequest(text)) {
      implicitIntents.push({
        type: 'hidden_request',
        description: '可能有未直接说出的请求',
        confidence: 0.6,
        example: '当有人说"我最近很忙"时，可能是在请求帮助或理解',
      });
    }

    // 检测防御性隐含意图
    if (social.types.includes('power') && this._hasNegation(text)) {
      implicitIntents.push({
        type: 'power_dynamics',
        description: '可能涉及权力动态或身份认同',
        confidence: 0.5,
        example: '关于"应该"的讨论可能反映权威期望或自我期待',
      });
    }

    // 检测回避模式
    if (this._hasEvasion(text) && !this._hasDirectAnswer(text)) {
      implicitIntents.push({
        type: 'avoidance',
        description: '可能在回避某些话题',
        confidence: 0.7,
        example: '模糊回答可能表示不愿深入或不知道如何表达',
      });
    }

    // 检测期望未满足
    if (beliefs.detected && this._hasNegativeEmotion(text)) {
      implicitIntents.push({
        type: 'unmet_expectation',
        description: '可能有未满足的期望',
        confidence: 0.6,
        example: '"我觉得应该..."后跟负面情绪表示期望受挫',
      });
    }

    return {
      detected: implicitIntents.length > 0,
      intents: implicitIntents,
      summary: implicitIntents.length > 0
        ? `检测到${implicitIntents.length}种可能的隐含意图`
        : '未检测到明显的隐含意图',
    };
  }

  _hasDirectRequest(text) {
    const patterns = ['帮我', '能不能', '可以帮我', '请', '希望你能', '你需要', '你应该'];
    return patterns.some(p => text.includes(p));
  }

  _hasNegation(text) {
    return ['不', '没', '不是', '没有', '不会', "don’t", 'not'].some(n => text.includes(n));
  }

  _hasEvasion(text) {
    const patterns = ['不知道', '算了', '没什么', '也还好', "i don't know", 'whatever', 'nevermind'];
    return patterns.some(p => text.includes(p));
  }

  _hasDirectAnswer(text) {
    return ['是', '对', '没错', '是的', 'yes', 'yeah', 'correct'];
  }

  _hasNegativeEmotion(text) {
    const negative = ['难过', '伤心', '失望', '生气', '愤怒', '沮丧', 'sad', 'angry', 'disappointed', 'frustrated'];
    return negative.some(n => text.includes(n));
  }

  /**
   * 生成警告
   */
  _generateWarnings(tomLevel, beliefs, intentions, social) {
    const warnings = [];

    // 低ToM层级警告
    if (tomLevel <= 2 && beliefs.detected) {
      warnings.push({
        type: 'limited_tom',
        message: '检测到复杂心理状态，但系统ToM能力有限，请谨慎推理',
        severity: 'medium',
      });
    }

    // 高风险隐含意图
    if (social.types.includes('power') && intentions.detected) {
      warnings.push({
        type: 'potential_conflict',
        message: '可能涉及人际冲突或期望不一致',
        severity: 'medium',
      });
    }

    return warnings;
  }

  /**
   * 评估ToM准确性（基于用户反馈校准）
   * 借鉴 RACLETTE 系统的可解释情感画像
   */
  calibrateWithFeedback(userCorrection, aiInference) {
    // 记录推理与实际不符的情况
    return {
      recorded: true,
      accuracyImpact: userCorrection.correct
        ? { delta: 0.05, reason: '推理被确认正确' }
        : { delta: -0.1, reason: '推理被纠正，需调整模型' },
      adjustedConfidence: Math.max(0.1, Math.min(0.95,
        aiInference.confidence + (userCorrection.correct ? 0.05 : -0.1)
      )),
    };
  }
}

module.exports = { TheoryOfMind };
