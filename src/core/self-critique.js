/**
 * 自我批评校准模块 — 心镜v1.17
 *
 * 基于论文研究:
 * - Self-Refine (CMU/NVIDIA 2024): 生成→批评→改进迭代
 * - Constitutional AI (Anthropic 2022): AI反馈替代人工
 * - LLM-as-a-Judge (DeepMind 2024): 用大模型评估质量
 * - Self-critique LLMs (DeepMind 2024): 自我评估事实性和安全性
 *
 * 功能:
 * - 分析结果的自我验证
 * - 置信度校准
 * - 遗漏信号检测
 * - 迭代改进
 */

class SelfCritique {
  constructor() {
    // 批评维度
    this.critiqueDimensions = [
      {
        key: 'signalCompleteness',
        name: '信号完整性',
        description: '是否遗漏了重要的心理信号',
        weight: 0.2,
      },
      {
        key: 'emotionAccuracy',
        name: '情绪准确性',
        description: '情绪分类是否准确',
        weight: 0.25,
      },
      {
        key: 'intentValidity',
        name: '意图合理性',
        description: '意图判断是否合理',
        weight: 0.2,
      },
      {
        key: 'defenseDetection',
        name: '防御检测',
        description: '防御机制是否被正确识别',
        weight: 0.15,
      },
      {
        key: 'confidenceCalibration',
        name: '置信度匹配',
        description: '置信度是否与信号强度匹配',
        weight: 0.2,
      },
    ];

    // 常见遗漏模式
    this.commonMissedPatterns = [
      {
        pattern: ' sarcastic OR 讽刺',
        likelyMissing: '可能是反讽或隐藏情绪',
      },
      {
        pattern: '说没关系 OR 说没事',
        likelyMissing: '可能是在压抑真实感受',
      },
      {
        pattern: '总是 OR 从来不',
        likelyMissing: '可能的过度概括认知扭曲',
      },
      {
        pattern: '我觉得 OR 我感觉',
        likelyMissing: '可能是主观感受而非客观事实',
      },
    ];
  }

  /**
   * 批评心理分析结果
   * @param {object} analysis - 原始分析结果
   * @param {string} userInput - 用户输入
   * @returns {object} 批评结果和改进建议
   */
  critiqueAnalysis(analysis, userInput) {
    const issues = [];
    const scores = {};

    // 检查信号完整性
    const signalCompleteness = this._checkSignalCompleteness(analysis, userInput);
    scores.signalCompleteness = signalCompleteness.score;
    if (signalCompleteness.issues.length > 0) {
      issues.push(...signalCompleteness.issues);
    }

    // 检查情绪准确性
    const emotionAccuracy = this._checkEmotionAccuracy(analysis, userInput);
    scores.emotionAccuracy = emotionAccuracy.score;
    if (emotionAccuracy.issues.length > 0) {
      issues.push(...emotionAccuracy.issues);
    }

    // 检查意图合理性
    const intentValidity = this._checkIntentValidity(analysis, userInput);
    scores.intentValidity = intentValidity.score;
    if (intentValidity.issues.length > 0) {
      issues.push(...intentValidity.issues);
    }

    // 检查防御检测
    const defenseDetection = this._checkDefenseDetection(analysis, userInput);
    scores.defenseDetection = defenseDetection.score;
    if (defenseDetection.issues.length > 0) {
      issues.push(...defenseDetection.issues);
    }

    // 检查置信度匹配
    const confidenceCalibration = this._checkConfidenceCalibration(analysis);
    scores.confidenceCalibration = confidenceCalibration.score;
    if (confidenceCalibration.issues.length > 0) {
      issues.push(...confidenceCalibration.issues);
    }

    // 计算总体评分
    let totalScore = 0;
    for (const dim of this.critiqueDimensions) {
      totalScore += (scores[dim.key] || 0) * dim.weight;
    }

    // 检测常见遗漏模式
    const missedSignals = this._detectMissedPatterns(userInput, analysis);

    return {
      overallScore: Math.round(totalScore * 100) / 100,
      needsImprovement: totalScore < 0.7 || issues.length > 2,
      scores,
      issues,
      missedSignals,
      suggestions: this._generateSuggestions(issues, missedSignals),
      refinedAnalysis: totalScore < 0.8 ? this._refineAnalysis(analysis, issues, missedSignals) : null,
    };
  }

  /**
   * 检查信号完整性
   */
  _checkSignalCompleteness(analysis, userInput) {
    const issues = [];
    let score = 1.0;

    // 检查是否缺少PAD值
    if (!analysis.pad) {
      issues.push('缺少PAD情绪维度分析');
      score -= 0.15;
    }

    // 检查是否缺少危机评估
    if (!analysis.crisis) {
      issues.push('缺少危机风险评估');
      score -= 0.2;
    }

    // 检查是否缺少防御识别
    if (!analysis.defenses || analysis.defenses.length === 0) {
      // 检查是否真的没有防御
      const defenseSignals = ['但是', '其实', '不过', '可能', '大概'];
      const hasDefenseSignal = defenseSignals.some(s => userInput.includes(s));
      if (hasDefenseSignal) {
        issues.push('可能遗漏了防御机制信号');
        score -= 0.15;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * 检查情绪准确性
   */
  _checkEmotionAccuracy(analysis, userInput) {
    const issues = [];
    let score = 1.0;

    // 获取分析的情绪
    const analysisEmotion = analysis.emotion?.category || analysis.emotion?.name;

    // 检查用户输入中的情绪词
    const emotionKeywords = {
      positive: ['开心', '高兴', '快乐', '兴奋', '满意', '舒服'],
      negative: ['难过', '伤心', '生气', '愤怒', '害怕', '担心', '焦虑', '压力', '累', '痛苦', '沮丧'],
      neutral: ['平静', '还好', '一般', '普通'],
    };

    let detectedEmotion = null;
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(kw => userInput.includes(kw))) {
        detectedEmotion = emotion;
        break;
      }
    }

    // 如果检测到的情绪与分析不符
    if (detectedEmotion && analysisEmotion) {
      const match = detectedEmotion === analysisEmotion ||
        (detectedEmotion === 'negative' && analysisEmotion === '焦虑') ||
        (detectedEmotion === 'negative' && analysisEmotion === '沮丧');

      if (!match && analysis.confidence > 0.8) {
        issues.push(`情绪检测可能不准确：检测到${detectedEmotion}，但分析为${analysisEmotion}`);
        score -= 0.2;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * 检查意图合理性
   */
  _checkIntentValidity(analysis, userInput) {
    const issues = [];
    let score = 1.0;

    const intent = analysis.intent?.category;

    // 检查意图与内容是否匹配
    if (intent === 'task') {
      const taskSignals = ['帮我', '请', '需要', '做', '写', '生成'];
      if (!taskSignals.some(s => userInput.includes(s))) {
        issues.push('意图判断为task但缺少任务请求信号');
        score -= 0.15;
      }
    }

    if (intent === 'emotion') {
      const emotionSignals = ['感觉', '觉得', '心情', '情绪', '...'];
      if (!emotionSignals.some(s => userInput.includes(s))) {
        issues.push('意图判断为emotion但缺少情绪表达信号');
        score -= 0.15;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * 检查防御检测
   */
  _checkDefenseDetection(analysis, userInput) {
    const issues = [];
    let score = 1.0;

    // 检查是否遗漏了合理的防御
    const defenseSignals = {
      avoidance: ['随便', '都行', '无所谓', '没什么'],
      rationalization: ['因为', '所以', '合理', '其实'],
      displacement: ['但是', '不过', '然而', '反而'],
      denial: ['不是', '没有', '我不觉得', '不可能'],
    };

    for (const [defense, signals] of Object.entries(defenseSignals)) {
      const hasSignal = signals.some(s => userInput.includes(s));
      const detected = analysis.defenses?.some(d => d.type === defense);

      if (hasSignal && !detected) {
        issues.push(`可能遗漏了${defense}防御机制`);
        score -= 0.1;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * 检查置信度匹配
   */
  _checkConfidenceCalibration(analysis) {
    const issues = [];
    let score = 1.0;

    const confidence = analysis.confidence || analysis.intent?.confidence || 0.5;

    // 检查是否有矛盾的信号
    const hasWeakSignals = analysis.needs?.length === 0 && analysis.defenses?.length === 0;

    if (confidence > 0.8 && hasWeakSignals) {
      issues.push('置信度偏高：没有检测到明显信号但置信度高');
      score -= 0.2;
    }

    // 检查PAD值与情绪是否匹配
    if (analysis.pad && analysis.emotion) {
      const pad = analysis.pad;
      const emotion = analysis.emotion;

      if (emotion.category === 'positive' && pad.pleasure < 0) {
        issues.push('PAD愉悦度与情绪分类不匹配');
        score -= 0.15;
      }
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * 检测常见遗漏模式
   */
  _detectMissedPatterns(userInput, analysis) {
    const missed = [];

    for (const item of this.commonMissedPatterns) {
      if (userInput.includes(item.pattern) && !analysis.missedSignals?.includes(item.pattern)) {
        missed.push({
          pattern: item.pattern,
          likelyMissing: item.likelyMissing,
        });
      }
    }

    return missed;
  }

  /**
   * 生成改进建议
   */
  _generateSuggestions(issues, missedSignals) {
    const suggestions = [];

    if (issues.some(i => i.includes('遗漏'))) {
      suggestions.push('建议更仔细地检查用户输入中的隐含信号');
    }

    if (issues.some(i => i.includes('置信度'))) {
      suggestions.push('建议根据实际检测到的信号强度调整置信度');
    }

    if (missedSignals.length > 0) {
      suggestions.push('注意检测可能的隐含信号：' + missedSignals.map(s => s.likelyMissing).join(', '));
    }

    if (suggestions.length === 0) {
      suggestions.push('分析质量良好，无需特别改进');
    }

    return suggestions;
  }

  /**
   * 改进分析
   */
  _refineAnalysis(analysis, issues, missedSignals) {
    // 创建改进后的分析副本
    const refined = { ...analysis };

    // 添加遗漏信号警告
    if (missedSignals.length > 0) {
      refined.warnings = [...(refined.warnings || []), ...missedSignals.map(s => s.likelyMissing)];
    }

    // 降低置信度如果有issue
    if (issues.length > 0) {
      refined.confidence = Math.max(0.3, (refined.confidence || 0.5) * (1 - issues.length * 0.1));
    }

    return refined;
  }

  /**
   * 生成迭代改进prompt
   * @param {object} critique - 批评结果
   * @returns {string} 改进prompt
   */
  generateRefinementPrompt(critique) {
    if (!critique.needsImprovement) {
      return '当前分析质量良好，可以直接使用。';
    }

    return `【分析需要改进】

发现的问题：
${critique.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

可能的遗漏信号：
${critique.missedSignals.length > 0
      ? critique.missedSignals.map(s => `- ${s.pattern}: ${s.likelyMissing}`).join('\n')
      : '无'
    }

建议：
${critique.suggestions.join('\n')}

请基于以上反馈重新分析用户输入，生成改进后的分析结果。`;
  }

  /**
   * 置信度校准
   * @param {number} rawConfidence - 原始置信度
   * @param {object} signals - 信号强度
   * @returns {number} 校准后的置信度
   */
  calibrateConfidence(rawConfidence, signals) {
    const signalCount = Object.values(signals).filter(Boolean).length;
    const expectedConfidence = Math.min(0.9, 0.3 + signalCount * 0.15);

    // 如果原始置信度与基于信号的预期差距太大，进行校准
    if (Math.abs(rawConfidence - expectedConfidence) > 0.3) {
      return Math.round(expectedConfidence * 100) / 100;
    }

    return rawConfidence;
  }
}

module.exports = { SelfCritique };
