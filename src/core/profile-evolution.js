/**
 * 用户档案自我进化模块 — 心镜v1.17
 *
 * 基于用户纠正记录自动改进分析模型
 *
 * 功能:
 * - 记录用户的纠正（correctAnalysis）
 * - 分析纠正模式（哪些类型容易被误判）
 * - 调整检测权重
 * - 自适应学习：根据互动历史调整默认分析策略
 * - 学习用户的沟通风格和偏好
 * - 遗忘机制：旧模式逐渐淡化，新模式权重增加
 * - 效果追踪：记录每次分析的置信度，追踪实际准确率变化
 */

const fs = require('fs');
const path = require('path');

/**
 * 遗忘曲线配置（基于Ebbinghaus模型）
 */
const FORGETTING_CONFIG = {
  // 基础衰减率（每小时）
  baseDecayRate: 0.01,
  // 强化因子（每次正确使用后提升）
  reinforcementFactor: 1.2,
  // 惩罚因子（每次错误后下降）
  penaltyFactor: 0.7,
  // 最低保留阈值
  minRetention: 0.1,
  // 最高权重上限
  maxWeight: 2.0,
  // 最低权重下限
  minWeight: 0.3,
};

/**
 * 进化状态追踪
 */
const EVOLUTION_CONFIG = {
  // 分析记录最大保存数量
  maxAnalysisRecords: 500,
  // 纠正记录最大保存数量
  maxCorrectionRecords: 100,
  // 模式聚合时间窗口（毫秒）
  patternWindowMs: 7 * 24 * 60 * 60 * 1000, // 7天
  // 权重更新学习率
  learningRate: 0.1,
};

/**
 * 校正类型权重表（初始权重）
 */
const DEFAULT_TYPE_WEIGHTS = {
  // 意图识别
  'intent': 1.0,
  // 情绪分类
  'emotion': 1.0,
  // 需求识别
  'needs': 1.0,
  // 防御机制
  'defenses': 1.0,
  // 危机评估
  'crisis': 1.0,
  // 认知扭曲
  'distortions': 1.0,
  // 共情准确性
  'empathy': 1.0,
};

/**
 * 校正结果枚举
 */
const CorrectionResult = {
  CORRECT: 'correct',       // 原分析正确
  PARTIAL: 'partial',       // 部分正确
  WRONG: 'wrong',           // 完全错误
};

/**
 * 进化模块主类
 */
class ProfileEvolution {
  constructor(rootPath = __dirname) {
    this.rootPath = rootPath;
    this.dataDir = path.join(this.rootPath, 'data');
    this.evolutionFile = path.join(this.dataDir, 'profile-evolution.json');

    // 初始化进化数据
    this.data = this._createEmptyEvolution();

    // 加载已有数据
    this._load();
  }

  /**
   * 创建空的进化数据结构
   */
  _createEmptyEvolution() {
    return {
      // 版本信息
      version: '1.17',
      createdAt: Date.now(),
      lastUpdated: Date.now(),

      // 隐私同意状态（必须用户同意才能记录）
      consentGiven: false,

      // 分析记录历史
      analysisHistory: [],

      // 用户纠正记录
      corrections: [],

      // 类型误判统计（哪些类型容易被误判）
      typeMisclassification: {
        // 结构: { 'emotion': { total: 10, wrong: 3, rate: 0.3 } }
      },

      // 类型权重（根据纠正动态调整）
      typeWeights: { ...DEFAULT_TYPE_WEIGHTS },

      // 用户沟通风格偏好
      communicationStyle: {
        // 偏好语气
        preferredTone: 'balanced',  // 'direct' | 'gentle' | 'balanced'
        // 偏好回应长度
        preferredLength: 'medium',  // 'short' | 'medium' | 'long'
        // 情感表达偏好
        emotionalExpression: 'selective',  // 'open' | 'reserved' | 'selective'
        // 详细程度偏好
        detailLevel: 'moderate',  // 'brief' | 'moderate' | 'detailed'
      },

      // 分析策略调整
      analysisStrategy: {
        // 默认分析深度
        defaultDepth: 'standard',  // 'quick' | 'standard' | 'deep'
        // 是否启用详细解释
        detailedExplanations: false,
        // 是否启用模式识别
        patternRecognition: true,
      },

      // 效果追踪
      effectivenessTracking: {
        // 总分析次数
        totalAnalyses: 0,
        // 总纠正次数
        totalCorrections: 0,
        // 整体准确率
        overallAccuracy: 1.0,
        // 按类型准确率
        accuracyByType: {},
        // 置信度校准统计
        confidenceCalibration: {
          // 记录的平均置信度 vs 实际准确率差距
          avgConfidenceGap: 0,
          // 过度自信次数
          overConfidentCount: 0,
          // 过度保守次数
          underConfidentCount: 0,
        },
      },

      // 遗忘曲线状态
      forgettingState: {
        // 每种模式的最后访问时间
        lastAccessTimes: {},
        // 每种模式的当前保留率
        retentionRates: {},
      },
    };
  }

  /**
   * 加载进化数据
   */
  _load() {
    try {
      if (fs.existsSync(this.evolutionFile)) {
        const raw = fs.readFileSync(this.evolutionFile, 'utf-8');
        const loaded = JSON.parse(raw);
        // 合并数据，保留历史
        this.data = { ...this._createEmptyEvolution(), ...loaded };
        this.data.lastUpdated = Date.now();
      }
    } catch (e) {
      console.warn('[ProfileEvolution] 加载失败，使用空数据:', e.message);
      this.data = this._createEmptyEvolution();
    }
  }

  /**
   * 保存进化数据
   */
  _save() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      this.data.lastUpdated = Date.now();
      fs.writeFileSync(this.evolutionFile, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('[ProfileEvolution] 保存失败:', e.message);
    }
  }

  /**
   * 设置隐私同意状态
   * @param {boolean} consent - 用户是否同意
   */
  setConsent(consent) {
    this.data.consentGiven = consent;
    if (!consent) {
      // 撤回同意时保留数据但暂停学习
      console.log('[ProfileEvolution] 已暂停学习，保留历史数据');
    }
    this._save();
  }

  /**
   * 检查是否已获得同意
   */
  hasConsent() {
    return this.data.consentGiven;
  }

  /**
   * 记录一次分析及其置信度
   * @param {object} analysis - 分析结果
   * @param {string} input - 用户输入
   * @returns {void}
   */
  recordAnalysis(analysis, input) {
    if (!this.data.consentGiven) return;

    const record = {
      id: this._generateId(),
      timestamp: Date.now(),
      input: input.substring(0, 500), // 限制输入长度
      analysis: this._sanitizeAnalysis(analysis),
      confidence: analysis.confidence || analysis.intent?.confidence || 0.5,
    };

    this.data.analysisHistory.push(record);

    // 限制历史记录数量
    if (this.data.analysisHistory.length > EVOLUTION_CONFIG.maxAnalysisRecords) {
      this.data.analysisHistory = this.data.analysisHistory.slice(-EVOLUTION_CONFIG.maxAnalysisRecords);
    }

    // 更新效果追踪
    this.data.effectivenessTracking.totalAnalyses++;

    // 更新遗忘状态
    this._updateRetentionRecord('analysis', record.timestamp);

    this._save();
  }

  /**
   * 记录用户的纠正
   * @param {string} input - 用户原始输入
   * @param {object} wrongAnalysis - 错误的分析结果
   * @param {object} correction - 用户的纠正
   * @returns {object} 进化反馈
   */
  recordCorrection(input, wrongAnalysis, correction) {
    if (!this.data.consentGiven) {
      return { success: false, message: '需要用户同意才能记录纠正' };
    }

    // 判断纠正结果
    const result = this._evaluateCorrection(wrongAnalysis, correction);

    const correctionRecord = {
      id: this._generateId(),
      timestamp: Date.now(),
      input: input.substring(0, 500),
      wrongAnalysis: this._sanitizeAnalysis(wrongAnalysis),
      correction: this._sanitizeAnalysis(correction),
      result: result,

      // 提取被误判的类型
      mistakenTypes: this._extractMistakenTypes(wrongAnalysis, correction),
    };

    this.data.corrections.push(correctionRecord);

    // 限制纠正记录数量
    if (this.data.corrections.length > EVOLUTION_CONFIG.maxCorrectionRecords) {
      this.data.corrections = this.data.corrections.slice(-EVOLUTION_CONFIG.maxCorrectionRecords);
    }

    // 更新效果追踪
    this.data.effectivenessTracking.totalCorrections++;
    this._updateOverallAccuracy(result === CorrectionResult.CORRECT);

    // 分析纠正模式
    this._analyzeCorrectionPattern(correctionRecord);

    // 调整类型权重
    this._adjustTypeWeights(correctionRecord);

    // 更新遗忘状态
    this._updateRetentionRecord('correction', correctionRecord.timestamp);

    // 计算新的分析模型
    const newModel = this._computeImprovedModel(correctionRecord);

    this._save();

    return {
      success: true,
      result: result,
      newModel: newModel,
      typeWeights: this.data.typeWeights,
    };
  }

  /**
   * 评估纠正结果
   */
  _evaluateCorrection(wrongAnalysis, correction) {
    // 简单评估：如果纠正与原分析在主要类型上不同则为完全错误
    const wrongTypes = Object.keys(wrongAnalysis).filter(k =>
      ['emotion', 'intent', 'needs', 'crisis'].includes(k)
    );
    const correctedTypes = Object.keys(correction).filter(k =>
      ['emotion', 'intent', 'needs', 'crisis'].includes(k)
    );

    if (wrongTypes.length === 0 && correctedTypes.length === 0) {
      return CorrectionResult.CORRECT;
    }

    const matchCount = wrongTypes.filter(t => correctedTypes.includes(t)).length;
    const matchRate = wrongTypes.length > 0 ? matchCount / wrongTypes.length : 0;

    if (matchRate > 0.7) return CorrectionResult.CORRECT;
    if (matchRate > 0.3) return CorrectionResult.PARTIAL;
    return CorrectionResult.WRONG;
  }

  /**
   * 提取被误判的类型
   */
  _extractMistakenTypes(wrongAnalysis, correction) {
    const mistakenTypes = [];
    const typePairs = [
      ['emotion', 'emotion'],
      ['intent', 'intent'],
      ['needs', 'needs'],
      ['crisis', 'crisis'],
      ['distortions', 'distortions'],
    ];

    for (const [type, key] of typePairs) {
      if (wrongAnalysis[type] && correction[key]) {
        // 如果值不同，则记录为误判
        if (JSON.stringify(wrongAnalysis[type]) !== JSON.stringify(correction[key])) {
          mistakenTypes.push(type);
        }
      }
    }

    return mistakenTypes;
  }

  /**
   * 分析纠正模式
   */
  _analyzeCorrectionPattern(record) {
    for (const type of record.mistakenTypes) {
      if (!this.data.typeMisclassification[type]) {
        this.data.typeMisclassification[type] = {
          total: 0,
          wrong: 0,
          rate: 0,
        };
      }

      const stats = this.data.typeMisclassification[type];
      stats.total++;
      if (record.result === CorrectionResult.WRONG) {
        stats.wrong++;
      }
      stats.rate = stats.wrong / stats.total;
    }
  }

  /**
   * 调整类型权重
   */
  _adjustTypeWeights(record) {
    const learningRate = EVOLUTION_CONFIG.learningRate;

    for (const type of record.mistakenTypes) {
      if (!this.data.typeWeights[type]) {
        this.data.typeWeights[type] = 1.0;
      }

      let currentWeight = this.data.typeWeights[type];

      if (record.result === CorrectionResult.WRONG) {
        // 错误：增加权重（需要更多关注）
        currentWeight = Math.min(
          FORGETTING_CONFIG.maxWeight,
          currentWeight * FORGETTING_CONFIG.reinforcementFactor
        );
      } else if (record.result === CorrectionResult.PARTIAL) {
        // 部分正确：轻微调整
        currentWeight = currentWeight * (1 + learningRate * 0.5);
      }

      this.data.typeWeights[type] = Math.round(currentWeight * 100) / 100;
    }
  }

  /**
   * 计算改进后的分析模型
   */
  _computeImprovedModel(correctionRecord) {
    const improvements = [];

    // 基于误判类型建议调整
    for (const type of correctionRecord.mistakenTypes) {
      const currentWeight = this.data.typeWeights[type] || 1.0;
      improvements.push({
        type: type,
        currentWeight: currentWeight,
        suggestion: this._getWeightSuggestion(type, currentWeight),
      });
    }

    // 分析用户沟通风格
    this._inferCommunicationStyle(correctionRecord);

    return {
      improvements: improvements,
      communicationStyle: this.data.communicationStyle,
      analysisStrategy: this.data.analysisStrategy,
    };
  }

  /**
   * 获取权重调整建议
   */
  _getWeightSuggestion(type, weight) {
    if (weight > 1.5) {
      return '该类型容易被误判，分析时应更加谨慎，建议增加验证步骤';
    } else if (weight < 0.7) {
      return '该类型分析较为准确，可以适当简化';
    }
    return '权重适中，维持当前分析策略';
  }

  /**
   * 推断用户沟通风格
   */
  _inferCommunicationStyle(record) {
    const input = record.input;
    const inputLength = input.length;

    // 基于输入长度推断偏好
    if (inputLength < 30) {
      this.data.communicationStyle.preferredLength = 'short';
    } else if (inputLength > 200) {
      this.data.communicationStyle.preferredLength = 'long';
    } else {
      this.data.communicationStyle.preferredLength = 'medium';
    }

    // 基于纠正内容推断详细程度偏好
    const correctionStr = JSON.stringify(record.correction);
    if (correctionStr.length > 500) {
      this.data.communicationStyle.detailLevel = 'detailed';
    } else if (correctionStr.length < 100) {
      this.data.communicationStyle.detailLevel = 'brief';
    } else {
      this.data.communicationStyle.detailLevel = 'moderate';
    }
  }

  /**
   * 更新整体准确率
   */
  _updateOverallAccuracy(isCorrect) {
    const tracking = this.data.effectivenessTracking;
    const n = tracking.totalCorrections;
    const prevAccuracy = tracking.overallAccuracy;

    // 增量更新准确率
    tracking.overallAccuracy = (prevAccuracy * (n - 1) + (isCorrect ? 1 : 0)) / n;
    tracking.overallAccuracy = Math.round(tracking.overallAccuracy * 1000) / 1000;
  }

  /**
   * 更新保留记录（遗忘机制）
   */
  _updateRetentionRecord(type, timestamp) {
    if (!this.data.forgettingState.lastAccessTimes[type]) {
      this.data.forgettingState.lastAccessTimes[type] = {};
    }

    // 更新最后访问时间
    this.data.forgettingState.lastAccessTimes[type].lastInteraction = timestamp;

    // 初始化保留率
    if (!this.data.forgettingState.retentionRates[type]) {
      this.data.forgettingState.retentionRates[type] = 1.0;
    }
  }

  /**
   * 应用遗忘曲线
   * @param {number} hoursSinceAccess - 距离上次访问的小时数
   * @param {number} currentRetention - 当前保留率
   * @returns {number} 新的保留率
   */
  applyForgetting(hoursSinceAccess, currentRetention) {
    // Ebbinghaus遗忘曲线模型
    const decay = FORGETTING_CONFIG.baseDecayRate * hoursSinceAccess;
    const newRetention = Math.max(
      FORGETTING_CONFIG.minRetention,
      currentRetention * Math.exp(-decay)
    );
    return Math.round(newRetention * 1000) / 1000;
  }

  /**
   * 刷新遗忘状态（定期调用）
   */
  refreshForgettingState() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [type, state] of Object.entries(this.data.forgettingState.lastAccessTimes)) {
      const hoursSinceAccess = (now - (state.lastInteraction || now)) / oneHour;
      const currentRetention = this.data.forgettingState.retentionRates[type] || 1.0;

      // 应用遗忘
      const newRetention = this.applyForgetting(hoursSinceAccess, currentRetention);
      this.data.forgettingState.retentionRates[type] = newRetention;

      // 根据保留率调整权重
      if (newRetention < 0.5 && this.data.typeWeights[type]) {
        // 旧模式淡化，权重回归默认值
        const decayFactor = newRetention * 0.5 + 0.5;
        this.data.typeWeights[type] = Math.max(
          1.0,
          this.data.typeWeights[type] * decayFactor
        );
        this.data.typeWeights[type] = Math.round(this.data.typeWeights[type] * 100) / 100;
      }
    }

    this._save();
  }

  /**
   * 获取当前分析模型
   */
  getCurrentModel() {
    return {
      typeWeights: { ...this.data.typeWeights },
      communicationStyle: { ...this.data.communicationStyle },
      analysisStrategy: { ...this.data.analysisStrategy },
      retentionRates: { ...this.data.forgettingState.retentionRates },
    };
  }

  /**
   * 获取效果追踪统计
   */
  getEffectivenessStats() {
    const tracking = this.data.effectivenessTracking;
    return {
      totalAnalyses: tracking.totalAnalyses,
      totalCorrections: tracking.totalCorrections,
      overallAccuracy: tracking.overallAccuracy,
      accuracyByType: { ...tracking.accuracyByType },
      confidenceCalibration: { ...tracking.confidenceCalibration },
      // 计算最近7天的准确率趋势
      recentAccuracyTrend: this._calculateRecentTrend(),
    };
  }

  /**
   * 计算近期准确率趋势
   */
  _calculateRecentTrend() {
    const recentCorrections = this.data.corrections.filter(
      c => Date.now() - c.timestamp < EVOLUTION_CONFIG.patternWindowMs
    );

    if (recentCorrections.length < 3) {
      return { trend: 'insufficient_data', samples: recentCorrections.length };
    }

    const recentAccuracy = recentCorrections.filter(
      c => c.result === CorrectionResult.CORRECT
    ).length / recentCorrections.length;

    // 与整体准确率对比
    const trend = recentAccuracy - this.data.effectivenessTracking.overallAccuracy;

    return {
      trend: trend > 0.05 ? 'improving' : trend < -0.05 ? 'declining' : 'stable',
      recentAccuracy: Math.round(recentAccuracy * 1000) / 1000,
      samples: recentCorrections.length,
    };
  }

  /**
   * 获取误判模式分析
   */
  getMisclassificationPatterns() {
    const patterns = [];
    const windowMs = EVOLUTION_CONFIG.patternWindowMs;

    for (const [type, stats] of Object.entries(this.data.typeMisclassification)) {
      // 只分析近期数据
      const recentCorrections = this.data.corrections.filter(
        c => Date.now() - c.timestamp < windowMs && c.mistakenTypes.includes(type)
      );

      if (recentCorrections.length > 0) {
        const recentWrongRate = recentCorrections.filter(
          c => c.result === CorrectionResult.WRONG
        ).length / recentCorrections.length;

        patterns.push({
          type: type,
          totalErrors: stats.total,
          errorRate: Math.round(stats.rate * 100) / 100,
          recentErrorRate: Math.round(recentWrongRate * 100) / 100,
          weight: this.data.typeWeights[type] || 1.0,
          suggestion: this._getPatternSuggestion(type, recentWrongRate),
        });
      }
    }

    // 按错误率排序
    patterns.sort((a, b) => b.errorRate - a.errorRate);

    return patterns;
  }

  /**
   * 获取模式建议
   */
  _getPatternSuggestion(type, errorRate) {
    if (errorRate > 0.4) {
      return '该类型误判率较高，建议在分析时增加验证步骤或多角度考量';
    } else if (errorRate > 0.2) {
      return '该类型存在一定误判，建议保持关注';
    }
    return '该类型分析效果良好';
  }

  /**
   * 获取分析准确率
   */
  getPsychologyAccuracy() {
    const tracking = this.data.effectivenessTracking;

    if (tracking.totalCorrections === 0) {
      return {
        accuracy: 1.0,
        total: 0,
        corrections: 0,
        message: '尚无纠正记录',
      };
    }

    return {
      accuracy: tracking.overallAccuracy,
      total: tracking.totalAnalyses,
      corrections: tracking.totalCorrections,
      byType: this._getAccuracyByType(),
    };
  }

  /**
   * 获取按类型分类的准确率
   */
  _getAccuracyByType() {
    const byType = {};

    for (const correction of this.data.corrections) {
      for (const type of correction.mistakenTypes) {
        if (!byType[type]) {
          byType[type] = { correct: 0, total: 0 };
        }
        byType[type].total++;
        if (correction.result === CorrectionResult.CORRECT) {
          byType[type].correct++;
        }
      }
    }

    for (const type of Object.keys(byType)) {
      byType[type].accuracy = byType[type].total > 0
        ? Math.round((byType[type].correct / byType[type].total) * 1000) / 1000
        : 1.0;
    }

    return byType;
  }

  /**
   * 获取用户档案进化的完整状态
   */
  getEvolutionStatus() {
    return {
      version: this.data.version,
      lastUpdated: this.data.lastUpdated,
      model: this.getCurrentModel(),
      effectiveness: this.getEffectivenessStats(),
      misclassificationPatterns: this.getMisclassificationPatterns(),
      communicationStyle: this.data.communicationStyle,
      analysisStrategy: this.data.analysisStrategy,
    };
  }

  /**
   * 清除所有进化数据
   */
  clearData() {
    this.data = this._createEmptyEvolution();
    this._save();
    return { success: true, message: '进化数据已清除' };
  }

  /**
   * 生成唯一ID
   */
  _generateId() {
    return `evo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理分析数据（移除敏感信息）
   */
  _sanitizeAnalysis(analysis) {
    if (!analysis) return {};
    const sanitized = {};
    const allowedKeys = [
      'intent', 'emotion', 'needs', 'defenses', 'crisis', 'pad',
      'distortions', 'category', 'intensity', 'confidence', 'level',
      'type', 'name', 'evidence'
    ];

    for (const [key, value] of Object.entries(analysis)) {
      if (allowedKeys.includes(key)) {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

module.exports = { ProfileEvolution, CorrectionResult, FORGETTING_CONFIG };
