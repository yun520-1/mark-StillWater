/**
 * 共情校准模块 — 心镜v1.16.2
 *
 * 基于论文:
 * - RACLETTE: 基于可解释情感画像的心理健康评估
 * - Psy-LLM: 超越共情，整合诊断和治疗推理
 *
 * 功能:
 * - 共情准确性评估
 * - 情感共鸣检测
 * - 支持性回应推荐
 * - 共情疲劳预防
 *
 * 重要声明:
 * - 本模块为辅助工具，不能替代专业心理咨询或治疗
 * - 共情评估仅供参考，不构成任何医学或心理健康诊断
 * - AI共情响应永远无法完全替代人类专业帮助
 * - 如遇心理健康危机，请立即寻求专业帮助
 */

class EmpathyCalibration {
  constructor(memory = null) {
    this.memory = memory;

    // 共情类型
    this.empathyTypes = {
      cognitive: {
        name: '认知共情',
        description: '理解他人观点和处境的能力',
        signals: ['理解', '明白', '懂得', '如果是我', '站在你的角度'],
      },
      affective: {
        name: '情感共情',
        description: '感受他人情绪的能力',
        signals: ['感到', '感觉到', '心疼', '为你难过', '感受到'],
      },
      compassionate: {
        name: ' Compassionate共情',
        description: '不仅理解，还希望帮助',
        signals: ['想帮你', '我能做些什么', '需要我', '怎么帮'],
      },
    };

    // 支持性回应模板
    this.supportiveResponses = {
      emotion_validation: [
        '你的感受是可以理解的',
        '面对这种情况感到{emotion}是很正常的',
        '任何人处在你的位置都会有类似的感受',
      ],
      reflection: [
        '听起来你最近在经历{theme}...',
        '我注意到你说起{topic}时情绪很复杂',
        '你是说{summary}，是这样的吗？',
      ],
      exploration: [
        '你能多说一点关于{topic}的吗？',
        '这件事对你来说意味着什么？',
        '你希望事情怎样发展？',
      ],
      action: [
        '有什么我可以帮你的吗？',
        '你想先从哪里开始？',
        '你觉得自己能做到什么程度？',
      ],
    };

    // 情感共鸣关键词
    this.resonanceSignals = {
      positive: ['开心', '高兴', '兴奋', '快乐', 'happy', 'excited', 'joyful'],
      negative: ['难过', '伤心', '沮丧', '失落', 'sad', 'frustrated', 'disappointed'],
      neutral: ['平静', '还好', '一般', 'calm', 'okay', 'neutral'],
    };

    // 危机资源热线
    this.crisisResources = [
      { name: '全国心理援助热线', phone: '400-161-9995' },
      { name: '北京心理危机研究与干预中心', phone: '010-82951332' },
      { name: '希望24热线', phone: '400-161-9995' },
    ];
  }

  /**
   * 获取专业边界声明
   */
  getProfessionalDisclaimer() {
    return {
      toolNature: 'AI共情校准为辅助工具，不能替代人类专业心理咨询',
      limitation: 'AI无法完全理解人类情感，评估结果仅供参考',
      recommendation: '如有心理健康问题，建议寻求持证心理咨询师或精神科医生帮助',
      crisisNote: '如遇心理危机，请立即拨打心理援助热线',
      resources: this.crisisResources,
    };
  }

  /**
   * 检查是否需要建议寻求专业帮助
   * @param {object} context - 评估上下文
   * @returns {object} 建议
   */
  suggestProfessionalHelp(context) {
    const { stressScore, crisisLevel, emotionIntensity, conversationRounds } = context;

    let shouldRecommend = false;
    let reason = '';

    if (crisisLevel === 'high' || crisisLevel === 'critical') {
      shouldRecommend = true;
      reason = '检测到高危机风险';
    } else if (stressScore && stressScore >= 7) {
      shouldRecommend = true;
      reason = '压力水平极高';
    } else if (emotionIntensity === 'high' && conversationRounds > 10) {
      shouldRecommend = true;
      reason = '长时间高强度情感对话';
    }

    return {
      shouldRecommend,
      reason,
      message: shouldRecommend
        ? '我建议你考虑寻求专业心理咨询师的帮助。他们受过专业训练，能提供更全面的支持。'
        : null,
      resources: shouldRecommend ? this.crisisResources : [],
    };
  }

  /**
   * 评估共情准确性
   * @param {string} aiResponse - AI的回应
   * @param {string} userInput - 用户输入
   * @param {string} userEmotion - 检测到的用户情绪
   * @returns {object} 共情准确性评估
   */
  assessEmpathyAccuracy(aiResponse, userInput, userEmotion) {
    const lower = aiResponse.toLowerCase();
    const userLower = userInput.toLowerCase();

    // 检测情感验证
    const hasValidation = this._checkValidation(lower, userEmotion);

    // 检测反射
    const hasReflection = this._checkReflection(lower, userLower);

    // 检测探索性
    const hasExploration = this._checkExploration(lower);

    // 检测支持性意图
    const hasSupportIntent = this._checkSupportIntent(lower);

    // 计算共情准确性分数
    let score = 0;
    if (hasValidation) score += 0.3;
    if (hasReflection) score += 0.2;
    if (hasExploration) score += 0.2;
    if (hasSupportIntent) score += 0.3;

    // 共情类型检测
    const empathyType = this._detectEmpathyType(lower);

    return {
      accuracy: Math.round(score * 100) / 100,
      level: this._getAccuracyLevel(score),
      components: {
        validation: hasValidation,
        reflection: hasReflection,
        exploration: hasExploration,
        supportIntent: hasSupportIntent,
      },
      empathyType,
      suggestions: this._generateSuggestions(hasValidation, hasReflection, hasExploration, hasSupportIntent),
    };
  }

  /**
   * 检查是否有情感验证
   */
  _checkValidation(response, userEmotion) {
    const validationPhrases = [
      '理解', '明白', '正常', '可以理解', '人之常情',
      'understand', 'normal', 'valid', 'reasonable',
    ];

    const hasValidation = validationPhrases.some(p => response.includes(p));
    // Fix: _getEmotionWord returns an array, must check if ANY emotion word is in response
    const emotionWords = this._getEmotionWord(userEmotion);
    const emotionMatched = userEmotion && emotionWords.some(w => w && response.includes(w));

    return hasValidation || emotionMatched;
  }

  /**
   * 检查是否有反射
   */
  _checkReflection(response, userInput) {
    // 检测是否重复了用户的关键内容
    const words = userInput.split(/\s+/).slice(0, 10);
    let matchCount = 0;
    for (const word of words) {
      if (word.length > 3 && response.includes(word)) {
        matchCount++;
      }
    }
    return matchCount >= 2;
  }

  /**
   * 检查是否有探索性提问
   */
  _checkExploration(response) {
    const explorationPatterns = [
      '能多说', '多说说', '怎么', '为什么', '什么让你',
      'more about', 'tell me more', 'what makes', 'how did',
    ];
    return explorationPatterns.some(p => response.toLowerCase().includes(p));
  }

  /**
   * 检查是否有支持性意图
   */
  _checkSupportIntent(response) {
    const supportPatterns = [
      '帮你', '帮到你', '我能做', '需要我', '怎么帮',
      'help you', 'how can i', 'what can i do', 'support',
    ];
    return supportPatterns.some(p => response.toLowerCase().includes(p));
  }

  /**
   * 检测共情类型
   */
  _detectEmpathyType(response) {
    for (const [type, config] of Object.entries(this.empathyTypes)) {
      const matched = config.signals.filter(s => response.includes(s));
      if (matched.length > 0) {
        return { type, name: config.name, matched };
      }
    }
    return { type: 'none', name: '未检测到明确共情类型' };
  }

  /**
   * 获取准确度级别
   */
  _getAccuracyLevel(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'moderate';
    if (score >= 0.2) return 'poor';
    return 'very_poor';
  }

  /**
   * 生成改进建议
   */
  _generateSuggestions(validation, reflection, exploration, support) {
    const suggestions = [];
    if (!validation) {
      suggestions.push('尝试先验证用户的情绪，让他感到被理解');
    }
    if (!reflection) {
      suggestions.push('可以适当反射用户说的内容，确认理解正确');
    }
    if (!exploration) {
      suggestions.push('通过提问深入探索，帮助用户表达更多');
    }
    if (!support) {
      suggestions.push('表达愿意帮助的态度，询问能提供什么支持');
    }
    return suggestions;
  }

  /**
   * 获取情绪对应词
   */
  _getEmotionWord(emotion) {
    const mapping = {
      positive: ['开心', '高兴', '快乐'],
      negative: ['难过', '伤心', '沮丧'],
      neutral: ['平静', '还好'],
    };
    return mapping[emotion] || [];
  }

  /**
   * 检测情感共鸣
   * @param {string} text - 文本
   * @returns {object} 共鸣检测结果
   */
  detectResonance(text) {
    const lower = text.toLowerCase();

    // 检测情感类型
    let dominantEmotion = 'neutral';
    for (const [emotion, signals] of Object.entries(this.resonanceSignals)) {
      const matched = signals.filter(s => lower.includes(s.toLowerCase()));
      if (matched.length > 0) {
        dominantEmotion = emotion;
        break;
      }
    }

    // 计算共鸣强度
    let intensity = 0;
    for (const signals of Object.values(this.resonanceSignals)) {
      const matched = signals.filter(s => lower.includes(s.toLowerCase()));
      intensity += matched.length;
    }

    return {
      dominantEmotion,
      intensity: Math.min(intensity, 5),
      level: intensity >= 3 ? 'high' : intensity >= 1 ? 'medium' : 'low',
      matchedWords: this.resonanceSignals[dominantEmotion]?.filter(w => lower.includes(w.toLowerCase())) || [],
    };
  }

  /**
   * 推荐支持性回应
   * @param {object} context - { userEmotion, topic, empathyType }
   * @returns {object} 推荐回应
   */
  recommendResponse(context) {
    const { userEmotion, topic, empathyType } = context;

    const responses = [];

    // 情感验证类
    for (const template of this.supportiveResponses.emotion_validation) {
      const emotionWord = this._getEmotionWord(userEmotion)[0] || userEmotion;
      responses.push({
        type: 'validation',
        response: template.replace('{emotion}', emotionWord),
        suitable: userEmotion === 'negative' || userEmotion === 'neutral',
      });
    }

    // 行动类（放在探索类之前，因为高强度情绪需要先给用户掌控感）
    for (const template of this.supportiveResponses.action) {
      responses.push({
        type: 'action',
        response: template,
        suitable: true,
      });
    }

    // 反射类
    for (const template of this.supportiveResponses.reflection) {
      const summary = topic ? topic.slice(0, 20) : '这件事';
      // 先替换{theme}（如果存在），再替换{topic}（如果存在），最后替换{summary}（如果存在）
      let responseText = template
        .replace('{theme}', topic || '这件事')
        .replace('{topic}', topic || '这个')
        .replace('{summary}', summary);
      responses.push({
        type: 'reflection',
        response: responseText,
        suitable: empathyType === 'cognitive',
      });
    }

    // 探索类
    for (const template of this.supportiveResponses.exploration) {
      responses.push({
        type: 'exploration',
        response: template.replace('{topic}', topic || '这个'),
        suitable: empathyType === 'affective' || empathyType === 'compassionate',
      });
    }

    // 行动类
    for (const template of this.supportiveResponses.action) {
      responses.push({
        type: 'action',
        response: template,
        suitable: true,
      });
    }

    // 返回最佳推荐
    const best = responses.filter(r => r.suitable).slice(0, 3);

    return {
      recommendations: best.map(r => r.response),
      byType: {
        validation: responses.filter(r => r.type === 'validation').map(r => r.response),
        reflection: responses.filter(r => r.type === 'reflection').map(r => r.response),
        exploration: responses.filter(r => r.type === 'exploration').map(r => r.response),
        action: responses.filter(r => r.type === 'action').map(r => r.response),
      },
    };
  }

  /**
   * 评估共情疲劳风险
   * @param {object} stats - { conversationLength, emotionalContent, responseComplexity }
   * @returns {object} 疲劳风险评估
   */
  assessFatigueRisk(stats) {
    const { conversationLength = 0, emotionalContent = 0, responseComplexity = 0 } = stats;

    let risk = 0;

    // 对话越长风险越高
    if (conversationLength > 50) risk += 0.3;
    else if (conversationLength > 20) risk += 0.1;

    // 情感内容越多风险越高
    if (emotionalContent > 0.7) risk += 0.3;
    else if (emotionalContent > 0.4) risk += 0.1;

    // 回应越简单（缺乏共情技巧）风险越高
    if (responseComplexity < 0.3) risk += 0.2;

    return {
      risk: Math.min(risk, 1),
      level: risk >= 0.6 ? 'high' : risk >= 0.3 ? 'medium' : 'low',
      factors: {
        conversationLength,
        emotionalContent,
        responseComplexity,
      },
      suggestions: risk >= 0.3 ? [
        '建议适时转移话题，避免过度深入情感内容',
        '可以提醒用户寻求专业帮助',
        '保持适度的共情距离，保护双方',
      ] : [],
    };
  }
}

module.exports = { EmpathyCalibration };
