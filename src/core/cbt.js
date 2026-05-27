/**
 * CBT认知重构模块 — 心镜v1.16
 *
 * 基于论文:
 * - Psy-LLM: 整合诊断与治疗推理的心理健康咨询LLM
 * - xinyu-agent: 融合CBT与积极心理学的AI心理健康伴侣
 *
 * 功能:
 * - 识别认知扭曲（十大认知扭曲）
 * - 提供苏格拉底式追问
 * - 生成认知重构建议
 * - 情绪检测与应对
 */

class CBTModule {
  constructor(memory = null) {
    this.memory = memory;

    // 十大认知扭曲（基于Beck和Ellis的认知行为疗法）
    this.cognitiveDistortions = {
      'all-or-nothing': {
        name: '全或无思维',
        patterns: ['总是', '从不', '完全', '彻底', '绝对', 'always', 'never', 'completely', 'totally', 'absolutely'],
        description: '用极端的两极视角看待情况，没有中间地带',
        example: '如果我这次失败，我就一无是处',
      },
      'overgeneralization': {
        name: '过度概括',
        patterns: ['总是', '从不', '每次都', '永远都', '从来都', 'always', 'never', 'every time', 'everyone'],
        description: '基于单一事件得出过于广泛的结论',
        example: '这次面试没通过，我永远都找不到工作了',
      },
      'mental-filter': {
        name: '心理过滤',
        patterns: ['但是', '只是', '不过', '唯一', 'only', 'just', 'however', 'but'],
        description: '只关注负面细节而忽略积极方面',
        example: '虽然今天有很多好事，但那个小错误让我很困扰',
      },
      'disqualifying-positive': {
        name: ' disqualifying-positive',
        patterns: ['不算', '只是', '运气好', '不算数', "doesn't count", 'just lucky', 'anyone could'],
        description: '否定正面经历的价值或重要性',
        example: '他夸我只是客气话，当不得真',
      },
      'jumping-conclusions': {
        name: '跳跃式结论',
        patterns: ['肯定', '一定', '必然', '肯定会', '一定会', 'must', 'definitely', 'certainly', 'will definitely'],
        description: '在无充分证据的情况下做出负面预测或判断',
        example: '她没回消息，肯定是不喜欢我',
      },
      'magnification': {
        name: '放大',
        patterns: ['太', '极其', '非常', '可怕', '糟糕', 'too', 'extremely', 'terrible', 'awful', 'catastrophic'],
        description: '夸大负面事件的重要性或可能性',
        example: '这个错误太可怕了，一切都完了',
      },
      'minimization': {
        name: '缩小',
        patterns: ['没什么', '无所谓', '没关系', '不重要', "doesn't matter", 'unimportant', 'who cares'],
        description: '不恰当地缩小正面事件的重要性',
        example: '我的成功只是运气好，没什么了不起',
      },
      'emotional-reasoning': {
        name: '情绪化推理',
        patterns: ['感觉', '觉得', '好像', '似乎', 'feel like', 'feels like', 'as if'],
        description: '认为自己的情绪反映了现实的真实情况',
        example: '我觉得自己很失败，所以一定是真的失败了',
      },
      'should-statements': {
        name: '"应该"陈述',
        patterns: ['应该', '必须', '一定要', '不该', '不应该', 'should', 'must', 'have to', "shouldn't"],
        description: '用"应该"和"必须"来要求自己或他人',
        example: '我应该总是成功，否则就是失败者',
      },
      'labeling': {
        name: '贴标签',
        patterns: ['是个', '就是', '这种人', '这种人', "is a", 'such a', 'one of those'],
        description: '用消极标签来描述自己或他人',
        example: '我又迟到了，我就是个没用的人',
      },
    };

    // 苏格拉底式追问模板
    this.socraticQuestions = {
      evidence: [
        '你有什么证据支持这个想法？',
        '有没有相反的证据？',
        '这个结论是否有其他解释？',
      ],
      perspective: [
        '如果朋友有同样的想法，你会怎么说？',
        '这种情况还有哪些其他角度？',
        '一年后再看这个问题，会怎样想？',
      ],
      alternatives: [
        '最坏的情况真的会发生吗？即使发生，你能应对吗？',
        '有没有可能事情并没有那么糟糕？',
        '你能做些什么来改善这种情况？',
      ],
      implications: [
        '如果你的想法是真的，那么...？',
        '这个想法对你的行为有什么影响？',
        '如果不再这样想，你会怎么做？',
      ],
    };
  }

  /**
   * 检测认知扭曲
   * @param {string} text - 用户输入
   * @returns {object} 认知扭曲分析
   */
  detectDistortions(text) {
    const lower = text.toLowerCase();
    const detected = [];

    for (const [type, info] of Object.entries(this.cognitiveDistortions)) {
      const matches = [];
      for (const pattern of info.patterns) {
        if (lower.includes(pattern.toLowerCase())) {
          matches.push(pattern);
        }
      }
      if (matches.length > 0) {
        detected.push({
          type,
          name: info.name,
          description: info.description,
          matchedPatterns: [...new Set(matches)],
          confidence: Math.min(matches.length / 2, 0.9),
          example: info.example,
        });
      }
    }

    // 按置信度排序
    detected.sort((a, b) => b.confidence - a.confidence);

    return {
      hasDistortions: detected.length > 0,
      distortions: detected.slice(0, 3),
      severity: this._calculateSeverity(detected),
      summary: this._generateSummary(detected),
    };
  }

  /**
   * 计算严重程度
   */
  _calculateSeverity(distortions) {
    if (distortions.length === 0) return 'none';
    const maxConfidence = Math.max(...distortions.map(d => d.confidence));
    if (maxConfidence > 0.7 || distortions.length > 2) return 'high';
    if (maxConfidence > 0.4) return 'medium';
    return 'low';
  }

  /**
   * 生成总结
   */
  _generateSummary(distortions) {
    if (distortions.length === 0) return '未检测到明显的认知扭曲';
    const names = distortions.map(d => d.name).slice(0, 2).join('、');
    return `检测到${distortions.length}种认知扭曲：${names}`;
  }

  /**
   * 生成苏格拉底式追问
   * @param {string} text - 用户输入
   * @param {Array} detectedDistortions - 检测到的认知扭曲
   * @returns {object} 追问建议
   */
  generateSocraticQuestions(text, detectedDistortions) {
    const questions = [];

    if (!detectedDistortions || detectedDistortions.length === 0) {
      // 没有明显扭曲，提供一般性反思问题
      return {
        type: 'reflective',
        questions: this.socraticQuestions.perspective.slice(0, 2),
        focus: '帮助你从不同角度思考这个问题',
      };
    }

    // 根据扭曲类型生成针对性问题
    for (const distortion of detectedDistortions.slice(0, 2)) {
      const q = this._getQuestionsForDistortion(distortion.type);
      questions.push(...q);
    }

    return {
      type: 'socratic',
      distortionsTargeted: detectedDistortions.map(d => d.name),
      questions: [...new Set(questions)].slice(0, 4),
      focus: '通过追问帮助你发现新的观点',
    };
  }

  /**
   * 根据扭曲类型获取问题
   */
  _getQuestionsForDistortion(type) {
    const mapping = {
      'all-or-nothing': [
        ...this.socraticQuestions.evidence,
        '有没有介于两者之间的状态？',
        '如果用0-100的刻度，你会给这件事打多少分？',
      ],
      'overgeneralization': [
        ...this.socraticQuestions.alternatives,
        '有没有例外情况？',
        '有没有什么时候这件事不是这样的？',
      ],
      'mental-filter': [
        '今天发生的正面事情有哪些？',
        '如果从积极角度看，会怎样？',
        ...this.socraticQuestions.perspective,
      ],
      'jumping-conclusions': [
        ...this.socraticQuestions.evidence,
        '有没有其他可能的解释？',
        '你怎么知道这个结论是正确的？',
      ],
      'emotional-reasoning': [
        '情绪能证明事情真的是这样吗？',
        '如果换一种情绪，你会怎么想？',
        ...this.socraticQuestions.alternatives,
      ],
      'should-statements': [
        '为什么你应该/必须这样？',
        '这个"应该"是谁定的？',
        '如果没有"应该"，会怎样？',
      ],
    };
    return mapping[type] || this.socraticQuestions.evidence;
  }

  /**
   * 认知重构建议
   * @param {string} text - 用户输入
   * @param {Array} detectedDistortions - 检测到的认知扭曲
   * @returns {object} 重构建议
   */
  generateRestructuringAdvice(text, detectedDistortions) {
    if (!detectedDistortions || detectedDistortions.length === 0) {
      return {
        hasAdvice: false,
        message: '未检测到需要重构的认知模式',
      };
    }

    const advice = [];
    for (const distortion of detectedDistortions.slice(0, 2)) {
      const restructuring = this._getRestructuringForType(distortion.type, text);
      advice.push({
        distortion: distortion.name,
        original: this._extractOriginalThought(text, distortion),
        restructured: restructuring.thought,
        technique: restructuring.technique,
        rationale: restructuring.rationale,
      });
    }

    return {
      hasAdvice: true,
      advice,
      summary: '认知重构建议：尝试用更平衡、现实的方式看待问题',
    };
  }

  /**
   * 获取特定扭曲类型的重构方法
   */
  _getRestructuringForType(type, text) {
    const restructurings = {
      'all-or-nothing': {
        technique: '灰色思考',
        thought: '事情可能不完美，但也有积极的方面。尝试用"有时候...有时候..."来替代"总是/从不"',
        rationale: '大多数事情都在一个连续谱上，而不是两极',
      },
      'overgeneralization': {
        technique: '寻找反例',
        thought: '一个例子不能代表全部。尝试找一些例外情况。',
        rationale: '过度概括会忽略个体差异和变化的可能性',
      },
      'mental-filter': {
        technique: '积极日记',
        thought: '尝试记录三件今天发生的正面事情，即使很小。',
        rationale: '关注积极面可以帮助抵消心理过滤的倾向',
      },
      'jumping-conclusions': {
        technique: '证据检验',
        thought: '我没有确凿证据证明这个结论。有哪些证据支持/反对？',
        rationale: '在没有充分证据时，避免做出确定性的负面预测',
      },
      'should-statements': {
        technique: '灵活标准',
        thought: '我想要...但不是"必须"。每个人都会犯错，这是人之常情。',
        rationale: '"应该"陈述会产生不必要的压力和自我批判',
      },
      'emotional-reasoning': {
        technique: '情绪分离',
        thought: '我的情绪是真实的，但不一定反映事实。我可以感受情绪，同时用理性分析情况。',
        rationale: '情绪是经验的一部分，但不是现实的客观反映',
      },
    };
    return restructurings[type] || {
      technique: '平衡思考',
      thought: '尝试寻找一个既不过分积极、也不过分消极的观点。',
      rationale: '平衡的认知方式有助于更准确地看待现实',
    };
  }

  /**
   * 提取原始想法
   */
  _extractOriginalThought(text, distortion) {
    // 简化实现：返回文本中与该扭曲相关的部分
    const patterns = distortion.matchedPatterns || [];
    if (patterns.length > 0) {
      return `提到"${patterns[0]}"的相关内容`;
    }
    return text.slice(0, 100);
  }

  /**
   * 综合CBT分析
   */
  analyze(text) {
    const distortions = this.detectDistortions(text);
    const questions = this.generateSocraticQuestions(text, distortions.distortions);
    const advice = this.generateRestructuringAdvice(text, distortions.distortions);

    return {
      distortions,
      questions,
      advice,
      recommendations: this._generateRecommendations(distortions),
    };
  }

  /**
   * 生成建议
   */
  _generateRecommendations(distortions) {
    if (distortions.severity === 'none') {
      return {
        level: 'none',
        actions: ['继续保持自我觉察'],
      };
    }

    const actions = [];
    if (distortions.severity === 'high') {
      actions.push('建议寻求专业心理咨询支持');
      actions.push('可以使用"每日认知日记"记录负面想法');
    }
    actions.push('练习苏格拉底式自我追问');
    actions.push('关注自己的"应该"陈述，尝试换成"我希望"');

    return {
      level: distortions.severity,
      actions,
    };
  }
}

module.exports = { CBTModule };
