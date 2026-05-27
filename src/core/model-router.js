/**
 * Model Router — 模型级联路由
 *
 * 基于论文思想实现：
 *   - Speculative Decoding: 小模型猜测 + 大模型验证
 *   - Model Cascade at Scale: 不同任务路由到不同规模模型
 *   - Distilling Step by Step: 将大模型推理能力蒸馏到小模型
 *
 * 路由层级：
 *   -轻量级（Light）：关键词匹配，适用于简单分类任务
 *   - 中等级（Medium）：规则引擎，适用于标准分析任务
 *   - 重量级（Heavy）：LLM调用，适用于复杂推理任务
 *
 * 纯JS实现，无外部依赖。
 */

/**
 * 复杂度级别枚举
 */
const ComplexityLevel = {
  LIGHT: 'light',     // 简单任务：关键词匹配
  MEDIUM: 'medium',   // 标准任务：规则引擎
  HEAVY: 'heavy',      // 复杂任务：LLM推理
};

/**
 * 路由统计信息
 */
class RouterStats {
  constructor() {
    this._reset();
  }

  _reset() {
    this.totalRequests = 0;      // 总请求数
    this.lightHandled = 0;        // 轻量级处理数
    this.mediumHandled = 0;       // 中等级处理数
    this.heavyHandled = 0;        // 重量级处理数
    this.cascadeCount = 0;        // 级联次数（低级别升级到高级别）
    this.totalTokens = 0;         // 预估总token消耗
    this.avgConfidence = 0;      // 平均置信度
    this.startTime = Date.now();  // 启动时间
  }

  /**
   * 记录处理结果
   */
  record(level, tokens = 0, confidence = 1.0, cascaded = false) {
    this.totalRequests++;
    this.totalTokens += tokens;

    switch (level) {
      case ComplexityLevel.LIGHT:
        this.lightHandled++;
        break;
      case ComplexityLevel.MEDIUM:
        this.mediumHandled++;
        break;
      case ComplexityLevel.HEAVY:
        this.heavyHandled++;
        break;
    }

    if (cascaded) {
      this.cascadeCount++;
    }

    // 更新平均置信度（指数移动平均）
    this.avgConfidence = this.avgConfidence * 0.9 + confidence * 0.1;
  }

  /**
   * 获取统计摘要
   */
  getSummary() {
    const uptime = Date.now() - this.startTime;
    const lightRate = this.totalRequests > 0
      ? (this.lightHandled / this.totalRequests * 100).toFixed(1)
      : 0;
    const mediumRate = this.totalRequests > 0
      ? (this.mediumHandled / this.totalRequests * 100).toFixed(1)
      : 0;
    const heavyRate = this.totalRequests > 0
      ? (this.heavyHandled / this.totalRequests * 100).toFixed(1)
      : 0;

    return {
      totalRequests: this.totalRequests,
      byLevel: {
        light: this.lightHandled,
        medium: this.mediumHandled,
        heavy: this.heavyHandled,
      },
      percentage: { light: lightRate, medium: mediumRate, heavy: heavyRate },
      cascadeCount: this.cascadeCount,
      cascadeRate: this.totalRequests > 0
        ? (this.cascadeCount / this.totalRequests * 100).toFixed(1)
        : 0,
      estimatedTokens: this.totalTokens,
      avgConfidence: (this.avgConfidence * 100).toFixed(1) + '%',
      uptimeMs: uptime,
      uptimeHuman: this._formatUptime(uptime),
    };
  }

  /**
   * 格式化运行时间
   */
  _formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * 重置统计
   */
  reset() {
    this._reset();
  }
}

/**
 * 复杂度评估器
 * 根据输入特征判断任务复杂度
 */
class ComplexityEvaluator {
  constructor() {
    // 复杂指标关键词（出现则倾向于高级）
    this.complexIndicators = [
      '为什么', '如何', '怎么分析', '深层', '根本原因',
      '综合', '全面', '详细', '系统', '复杂',
      '推理', '逻辑', '矛盾', '冲突', '两难',
      '情感', '感受', '体验', '内心', '心理',
      '关系', '互动', '影响', '作用', '机制',
      '应该', '必须', '重要', '关键', '核心',
    ];

    // 简单指标关键词（出现则倾向于低级）
    this.simpleIndicators = [
      '是不是', '对不对', '有没有', '是不是真的',
      '随便', '都行', '无所谓', '不知道',
      '好吗', '行吗', '可以', '不错',
      '开心', '难过', '生气', '害怕',
    ];

    // 紧急/危机指标
    this.crisisIndicators = [
      '死', '活着没意思', '不想活', '自杀',
      '绝望', '崩溃', '无望', '无助',
    ];
    // 危机指标正则（更灵活的匹配）
    this.crisisPatterns = [
      /活着.*意思|活着.*意义|怎么活|活着干嘛/,
      /不想活/,
      /死.*算了/,
    ];

    // 自我贬低指标
    this.selfDeprecationIndicators = [
      '没用', '失败', '废物', '垃圾', '什么都做不好',
      '不行', '无能', '笨', '傻', '丢人',
    ];
  }

  /**
   * 评估文本复杂度
   * @param {string} text - 输入文本
   * @returns {Object} { level, confidence, factors }
   */
  evaluate(text) {
    if (!text || typeof text !== 'string') {
      return { level: ComplexityLevel.MEDIUM, confidence: 0.5, factors: {} };
    }

    const normalized = text.toLowerCase().trim();
    const factors = {
      length: text.length,
      hasQuestion: this._hasQuestion(text),
      hasComplexIndicators: 0,
      hasSimpleIndicators: 0,
      hasCrisisIndicators: false,
      hasSelfDeprecation: false,
      sentenceCount: this._countSentences(text),
    };

    // 检测复杂指标
    for (const indicator of this.complexIndicators) {
      if (normalized.includes(indicator)) {
        factors.hasComplexIndicators++;
      }
    }

    // 检测简单指标
    for (const indicator of this.simpleIndicators) {
      if (normalized.includes(indicator)) {
        factors.hasSimpleIndicators++;
      }
    }

    // 检测危机指标（关键词 + 正则模式）
    for (const indicator of this.crisisIndicators) {
      if (normalized.includes(indicator)) {
        factors.hasCrisisIndicators = true;
        break;
      }
    }
    // 正则模式检测
    if (!factors.hasCrisisIndicators) {
      for (const pattern of this.crisisPatterns) {
        if (pattern.test(normalized)) {
          factors.hasCrisisIndicators = true;
          break;
        }
      }
    }

    // 检测自我贬低
    for (const indicator of this.selfDeprecationIndicators) {
      if (normalized.includes(indicator)) {
        factors.hasSelfDeprecation = true;
        break;
      }
    }

    // 计算复杂度得分
    let score = 0.5; // 基础得分 0.5
    const maxScore = 1.0;
    const minScore = 0.0;

    // 文本长度影响（长文本倾向于复杂）
    if (text.length > 200) score += 0.1;
    if (text.length > 500) score += 0.1;
    if (text.length < 20) score -= 0.1;

    // 复杂指标加分
    score += Math.min(factors.hasComplexIndicators * 0.08, 0.3);

    // 简单指标减分
    score -= Math.min(factors.hasSimpleIndicators * 0.1, 0.25);

    // 危机指标强制高级
    if (factors.hasCrisisIndicators) {
      score = maxScore;
    }

    // 自我贬低倾向于较高级
    if (factors.hasSelfDeprecation) {
      score += 0.15;
    }

    // 问题形式倾向于分析
    if (factors.hasQuestion) {
      score += 0.05;
    }

    // 限制得分范围
    score = Math.max(minScore, Math.min(maxScore, score));

    // 计算置信度（基于特征清晰度）
    const confidence = this._calculateConfidence(factors);

    // 确定级别
    let level;
    if (score >= 0.7) {
      level = ComplexityLevel.HEAVY;
    } else if (score >= 0.35) {
      level = ComplexityLevel.MEDIUM;
    } else {
      level = ComplexityLevel.LIGHT;
    }

    return {
      level,
      score,
      confidence,
      factors,
    };
  }

  /**
   * 检测是否包含问句
   */
  _hasQuestion(text) {
    return text.includes('?') || text.includes('？') ||
      text.includes('怎么') || text.includes('为什么') ||
      text.includes('如何') || text.includes('是不是');
  }

  /**
   * 统计句子数量
   */
  _countSentences(text) {
    const sentences = text.split(/[.。!！?？;；]/);
    return sentences.filter(s => s.trim().length > 0).length;
  }

  /**
   * 计算评估置信度
   */
  _calculateConfidence(factors) {
    let confidence = 0.5;

    // 指标越多，置信度越高
    const totalIndicators = factors.hasComplexIndicators + factors.hasSimpleIndicators;
    if (totalIndicators >= 3) confidence += 0.3;
    else if (totalIndicators >= 1) confidence += 0.15;

    // 长度适中置信度更高
    if (factors.length >= 30 && factors.length <= 300) confidence += 0.1;

    // 危机信号提高置信度
    if (factors.hasCrisisIndicators) confidence = 0.95;

    return Math.min(confidence, 0.95);
  }
}

/**
 * 轻量级处理器（关键词匹配）
 */
class LightProcessor {
  constructor() {
    // 分类规则：关键词 -> 类别映射
    this.classificationRules = {
      emotion: {
        keywords: ['开心', '难过', '生气', '害怕', '高兴', '伤心', '愤怒', '焦虑', '担心', '压力'],
        category: 'emotion',
      },
      crisis: {
        keywords: ['死', '活着', '自杀', '不想活', '绝望', '崩溃'],
        category: 'crisis',
      },
      cognitive_distortion: {
        keywords: ['总是', '永远', '从来不', '完全', '绝对', '必须', '应该'],
        category: 'cognitive_distortion',
      },
      self_deprecation: {
        keywords: ['没用', '失败', '废物', '垃圾', '笨', '傻', '丢人'],
        category: 'self_deprecation',
      },
      neutral: {
        keywords: [],
        category: 'neutral',
      },
    };
  }

  /**
   * 快速分类处理
   * @param {string} text - 输入文本
   * @param {Object} context - 上下文信息
   * @returns {Object} 处理结果
   */
  process(text, context = {}) {
    const category = this._classify(text);
    const confidence = this._calculateConfidence(text, category);

    return {
      level: ComplexityLevel.LIGHT,
      category,
      result: {
        type: 'classification',
        category,
        confidence,
        processedBy: 'LightProcessor',
      },
      tokens: Math.ceil(text.length / 4), // 粗略估算token
      cascaded: false,
    };
  }

  /**
   * 关键词分类
   */
  _classify(text) {
    const normalized = text.toLowerCase();

    for (const [category, rule] of Object.entries(this.classificationRules)) {
      if (category === 'neutral') continue;

      for (const keyword of rule.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          return rule.category;
        }
      }
    }

    return 'neutral';
  }

  /**
   * 计算分类置信度
   */
  _calculateConfidence(text, category) {
    if (category === 'neutral') return 0.4;

    const normalized = text.toLowerCase();
    const rule = this.classificationRules[category];
    let matchCount = 0;

    for (const keyword of rule.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    // 匹配关键词越多，置信度越高
    const confidence = Math.min(0.5 + matchCount * 0.15, 0.9);
    return confidence;
  }
}

/**
 * 中等级处理器（规则引擎）
 */
class MediumProcessor {
  constructor() {
    this.evaluator = new ComplexityEvaluator();
  }

  /**
   * 规则引擎分析处理
   * @param {string} text - 输入文本
   * @param {Object} context - 上下文信息
   * @returns {Object} 处理结果
   */
  process(text, context = {}) {
    const complexity = this.evaluator.evaluate(text);
    const analysis = this._ruleBasedAnalysis(text, context);

    return {
      level: ComplexityLevel.MEDIUM,
      category: analysis.type,
      result: {
        type: 'analysis',
        analysis,
        complexity,
        processedBy: 'MediumProcessor',
      },
      tokens: Math.ceil(text.length / 2), // 中等token估算
      cascaded: false,
    };
  }

  /**
   * 基于规则的分析
   */
  _ruleBasedAnalysis(text, context = {}) {
    const normalized = text.toLowerCase();
    const analysis = {
      type: 'general',
      subTypes: [],
      intensity: 'medium',
      needsEscalation: false,
    };

    // 检测情绪类型和强度
    const emotionPatterns = [
      { pattern: /非常|特别|极其|十分/gi, intensity: 'high' },
      { pattern: /有点|有些|稍微|略微/gi, intensity: 'low' },
      { pattern: /(非常|特别|极其|十分).{1,5}(生气|愤怒|难过|伤心|害怕|恐惧)/gi, intensity: 'high' },
    ];

    for (const { pattern, intensity } of emotionPatterns) {
      if (pattern.test(normalized)) {
        analysis.intensity = intensity;
        break;
      }
    }

    // 检测认知扭曲模式
    const distortionPatterns = [
      { pattern: /总是|永远|从来不/gi, type: 'overgeneralization' },
      { pattern: /完全|绝对|必须|应该/gi, type: 'catastrophizing' },
      { pattern: /什么都|什么都做不好/gi, type: 'minimization' },
    ];

    for (const { pattern, type } of distortionPatterns) {
      if (pattern.test(normalized)) {
        analysis.subTypes.push(type);
      }
    }

    // 检测是否需要升级
    if (analysis.subTypes.length >= 2 || analysis.intensity === 'high') {
      analysis.needsEscalation = true;
    }

    // 确定分析类型
    if (analysis.subTypes.length > 0) {
      analysis.type = 'cognitive';
    } else if (this._hasEmotionIndicators(normalized)) {
      analysis.type = 'emotional';
    } else {
      analysis.type = 'general';
    }

    return analysis;
  }

  /**
   * 检测情绪指标
   */
  _hasEmotionIndicators(text) {
    const emotionWords = ['开心', '难过', '生气', '害怕', '高兴', '伤心', '愤怒', '焦虑', '担心'];
    return emotionWords.some(word => text.includes(word));
  }
}

/**
 * 重量级处理器（LLM调用占位）
 */
class HeavyProcessor {
  /**
   * 重量级LLM处理
   * @param {string} text - 输入文本
   * @param {Object} context - 上下文信息
   * @param {Function} llmCaller - LLM调用函数
   * @returns {Object} 处理结果
   */
  async process(text, context = {}, llmCaller = null) {
    // 如果提供了LLM调用函数，则使用它
    if (llmCaller && typeof llmCaller === 'function') {
      try {
        const llmResult = await llmCaller(text, context);
        return {
          level: ComplexityLevel.HEAVY,
          category: 'complex',
          result: {
            type: 'llm_analysis',
            analysis: llmResult,
            processedBy: 'HeavyProcessor',
          },
          tokens: Math.ceil(text.length * 1.5), // LLM通常产生更多token
          cascaded: false,
        };
      } catch (error) {
        // LLM调用失败，降级处理
        return {
          level: ComplexityLevel.HEAVY,
          category: 'complex',
          result: {
            type: 'fallback',
            error: error.message,
            processedBy: 'HeavyProcessor',
          },
          tokens: Math.ceil(text.length / 2),
          cascaded: false,
        };
      }
    }

    // 无LLM调用时，返回占位结果（用于蒸馏验证）
    return {
      level: ComplexityLevel.HEAVY,
      category: 'complex',
      result: {
        type: 'pending_llm',
        message: '需要LLM调用才能完成复杂推理任务',
        processedBy: 'HeavyProcessor',
      },
      tokens: 0,
      cascaded: false,
    };
  }
}

/**
 * 模型级联路由器
 */
class ModelRouter {
  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    this.evaluator = new ComplexityEvaluator();
    this.lightProcessor = new LightProcessor();
    this.mediumProcessor = new MediumProcessor();
    this.heavyProcessor = new HeavyProcessor();
    this.stats = new RouterStats();

    // 配置
    this.config = {
      enableCascade: options.enableCascade !== false,     // 默认启用级联
      cascadeThreshold: options.cascadeThreshold || 0.3, // 级联阈值
      maxRetries: options.maxRetries || 2,             // 最大重试次数
      defaultToHeavy: options.defaultToHeavy || false, // 是否默认使用重量级
      ...options,
    };
  }

  /**
   * 路由入口
   * @param {string} text - 输入文本
   * @param {Object} context - 上下文信息
   * @param {Function} llmCaller - 可选的LLM调用函数
   * @returns {Object} 路由结果
   */
  async route(text, context = {}, llmCaller = null) {
    const startTime = Date.now();

    // 评估复杂度
    const complexity = this.evaluator.evaluate(text);

    // 记录处理
    this.stats.record(
      complexity.level,
      0, // 先不计算token，后面更新
      complexity.confidence,
      false
    );

    let result;

    // 根据复杂度级别选择处理器
    switch (complexity.level) {
      case ComplexityLevel.LIGHT:
        result = this.lightProcessor.process(text, context);
        break;

      case ComplexityLevel.MEDIUM:
        result = this.mediumProcessor.process(text, context);

        // 检查是否需要级联到重量级
        if (this.config.enableCascade && result.result.analysis && result.result.analysis.needsEscalation) {
          const cascadedResult = await this._cascadeToHeavy(text, context, llmCaller);
          result = cascadedResult;
          result.cascaded = true;
        }
        break;

      case ComplexityLevel.HEAVY:
        result = await this.heavyProcessor.process(text, context, llmCaller);
        break;

      default:
        // 未知级别，默认使用中等级
        result = this.mediumProcessor.process(text, context);
    }

    // 更新统计的token
    this.stats.totalTokens -= 0;
    this.stats.totalTokens += result.tokens;

    // 添加元数据
    const processingTime = Date.now() - startTime;
    result.meta = {
      complexity,
      processingTimeMs: processingTime,
      config: { ...this.config },
    };

    return result;
  }

  /**
   * 级联到重量级处理器
   */
  async _cascadeToHeavy(text, context, llmCaller) {
    this.stats.cascadeCount++;
    return await this.heavyProcessor.process(text, context, llmCaller);
  }

  /**
   * 快速路由（仅返回级别，不执行处理）
   * @param {string} text - 输入文本
   * @returns {Object} 复杂度评估结果
   */
  assess(text) {
    return this.evaluator.evaluate(text);
  }

  /**
   * 获取路由统计
   * @returns {Object} 统计摘要
   */
  getStats() {
    return this.stats.getSummary();
  }

  /**
   * 重置统计
   */
  resetStats() {
    this.stats.reset();
  }

  /**
   * 获取配置
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  setConfig(options) {
    this.config = { ...this.config, ...options };
  }
}

// 导出模块
module.exports = {
  ModelRouter,
  ComplexityEvaluator,
  LightProcessor,
  MediumProcessor,
  HeavyProcessor,
  RouterStats,
  ComplexityLevel,
};
