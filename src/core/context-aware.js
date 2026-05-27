/**
 * Context-Aware — 上下文感知处理模块
 *
 * v1.0.0: 基于论文 Context-Aware Decoding (FinCAD) 和 Self-Describing Structured Data 实现
 *
 * 核心功能：
 *   - Primacy Bias 优化：在上下文开头嵌入关键心理状态标记，强化重要信息记忆
 *   - 上下文重置机制：长时间对话后显式重置心理状态，避免上下文污染
 *   - 结构化数据导航：对分析结果采用自描述格式，便于精确检索
 *   - 注意力稀释防护：检测并标记重要上下文，防止重要信号被稀释
 *
 * 理论支撑：
 *   - FinCAD：抑制LLM对历史结果的记忆，增强当前上下文感知
 *   - 双层引导：表层结构 + 深语义引导
 *
 * 纯 JS 实现，无外部依赖。
 */

/**
 * 心理状态标记类型枚举
 */
const PSYCHOLOGY_MARKER_TYPES = {
  EMOTION: 'emotion',           // 情绪标记
  COGNITION: 'cognition',       // 认知标记
  INTENT: 'intent',             // 意图标记
  DEFENSE: 'defense',           // 防御机制标记
  CRISIS: 'crisis',             // 危机信号标记
  NEED: 'need',                 // 需求标记
};

/**
 * 上下文稀释风险等级
 */
const DILUTION_RISK = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * 自描述结构化数据格式版本
 */
const SCHEMA_VERSION = '1.0';

/**
 * 上下文感知处理模块
 */
class ContextAware {
  constructor() {
    // 心理状态标记栈（用于 primacy bias 强化）
    this._markers = [];

    // 上下文历史（用于重置检测）
    this._contextHistory = [];

    // 重要上下文标记（用于稀释防护）
    this._importantContexts = new Map();

    // 当前会话统计
    this._sessionStats = {
      turnCount: 0,
      totalTokens: 0,
      lastResetTurn: 0,
      markerCount: 0,
      dilutionAlerts: 0,
    };

    // 配置参数
    this._config = {
      maxContextLength: 10,           // 最大上下文长度（轮次）
      resetThreshold: 20,            // 重置阈值（轮次）
      dilutionWindowSize: 5,         // 稀释检测窗口大小
      markerBoostStrength: 1.5,     // 标记强化强度
      importanceThreshold: 0.7,      // 重要性阈值
      recencyWeight: 0.3,            // 近因权重（用于注意力计算）
    };
  }

  // ==================== 公开 API ====================

  /**
   * 注册心理状态标记（Primacy Bias 优化）
   * 在上下文开头嵌入关键心理状态标记，强化重要信息记忆
   *
   * @param {Object} marker - 心理状态标记
   * @param {string} marker.type - 标记类型，见 PSYCHOLOGY_MARKER_TYPES
   * @param {string} marker.content - 标记内容
   * @param {number} marker.importance - 重要性等级 0-1
   * @param {string} marker.source - 来源描述
   * @returns {string} 标记 ID
   */
  registerMarker(marker) {
    const markerId = `marker_${Date.now()}_${this._sessionStats.markerCount++}`;
    const enrichedMarker = {
      id: markerId,
      type: marker.type || PSYCHOLOGY_MARKER_TYPES.EMOTION,
      content: marker.content,
      importance: marker.importance || 0.5,
      source: marker.source || 'unknown',
      timestamp: Date.now(),
      position: 'prefix',  // 标记位置：prefix（开头）/ infix（中间）/ suffix（结尾）
    };

    this._markers.push(enrichedMarker);

    // 如果重要性超过阈值，同时标记为重要上下文
    if (enrichedMarker.importance >= this._config.importanceThreshold) {
      this._markImportantContext(markerId, enrichedMarker);
    }

    return markerId;
  }

  /**
   * 生成上下文前缀（用于注入到 prompt 开头）
   * 包含心理状态标记和重要上下文提示
   *
   * @param {Object} options - 生成选项
   * @param {boolean} options.includeMarkers - 是否包含标记
   * @param {boolean} options.includeReset - 是否包含重置提示
   * @param {boolean} options.includeNavigation - 是否包含导航结构
   * @returns {string} 上下文前缀字符串
   */
  generatePrefix(options = {}) {
    const {
      includeMarkers = true,
      includeReset = false,
      includeNavigation = true,
    } = options;

    const parts = [];

    // 1. 自描述头部（双层引导 - 表层结构）
    if (includeNavigation) {
      parts.push(this._generateSchemaHeader());
    }

    // 2. 心理状态标记（Primacy Bias 强化）
    if (includeMarkers && this._markers.length > 0) {
      parts.push(this._generateMarkerSection());
    }

    // 3. 重置提示（如果需要）
    if (includeReset) {
      parts.push(this._generateResetHint());
    }

    // 4. 重要上下文警告（注意力稀释防护）
    const dilutionRisk = this.assessDilutionRisk();
    if (dilutionRisk.level !== DILUTION_RISK.LOW) {
      parts.push(this._generateDilutionWarning(dilutionRisk));
    }

    return parts.join('\n');
  }

  /**
   * 记录上下文事件
   *
   * @param {Object} event - 上下文事件
   * @param {string} event.type - 事件类型
   * @param {Object} event.data - 事件数据
   * @param {number} event.turnNumber - 当前轮次
   */
  recordContext(event) {
    const contextEntry = {
      type: event.type,
      data: event.data,
      turnNumber: event.turnNumber || this._sessionStats.turnCount,
      timestamp: Date.now(),
    };

    this._contextHistory.push(contextEntry);

    // 限制历史长度
    const maxHistory = this._config.maxContextLength * 2;
    if (this._contextHistory.length > maxHistory) {
      this._contextHistory = this._contextHistory.slice(-maxHistory);
    }

    // 更新会话统计
    this._sessionStats.turnCount = event.turnNumber || this._sessionStats.turnCount;

    return this._shouldReset();
  }

  /**
   * 评估上下文稀释风险
   *
   * @returns {Object} 稀释风险评估结果
   */
  assessDilutionRisk() {
    // 计算近因窗口内的上下文密度
    const recentContexts = this._contextHistory.slice(-this._config.dilutionWindowSize);
    const uniqueTypes = new Set(recentContexts.map(c => c.type));

    // 标记的重要上下文数量
    const importantCount = this._importantContexts.size;

    // 轮次密度
    const turnDensity = recentContexts.length / this._config.dilutionWindowSize;

    // 计算风险分数
    let riskScore = 0;

    // 因素1：标记过多可能导致稀释
    riskScore += Math.min(importantCount * 0.15, 0.4);

    // 因素2：上下文类型单一可能导致重要信息被淹没
    riskScore += (1 - uniqueTypes.size / Math.max(recentContexts.length, 1)) * 0.3;

    // 因素3：轮次过多
    riskScore += Math.min(this._sessionStats.turnCount / 100, 0.3);

    // 确定风险等级
    let level = DILUTION_RISK.LOW;
    if (riskScore >= 0.7) level = DILUTION_RISK.CRITICAL;
    else if (riskScore >= 0.5) level = DILUTION_RISK.HIGH;
    else if (riskScore >= 0.3) level = DILUTION_RISK.MEDIUM;

    // 生成建议
    const suggestions = this._generateDilutionSuggestions(level, {
      importantCount,
      uniqueTypes: uniqueTypes.size,
      turnCount: this._sessionStats.turnCount,
    });

    return {
      level,
      score: Math.round(riskScore * 100) / 100,
      factors: {
        importantCount,
        uniqueTypes: uniqueTypes.size,
        turnCount: this._sessionStats.turnCount,
      },
      suggestions,
    };
  }

  /**
   * 检查是否需要重置心理状态
   *
   * @returns {boolean} 是否需要重置
   */
  shouldReset() {
    return this._shouldReset();
  }

  /**
   * 执行上下文重置
   * 清除心理状态标记和历史，但保留必要的会话信息
   *
   * @param {Object} options - 重置选项
   * @param {boolean} options.preserveMarkers - 是否保留标记
   * @param {boolean} options.preserveSession - 是否保留会话统计
   * @returns {Object} 重置结果
   */
  reset(options = {}) {
    const {
      preserveMarkers = false,
      preserveSession = true,
    } = options;

    const resetReport = {
      timestamp: Date.now(),
      resetType: preserveMarkers ? 'soft' : 'full',
      clearedMarkers: preserveMarkers ? 0 : this._markers.length,
      clearedHistory: this._contextHistory.length,
    };

    // 执行重置
    if (!preserveMarkers) {
      this._markers = [];
    }
    this._contextHistory = [];
    this._importantContexts.clear();

    if (!preserveSession) {
      this._sessionStats = {
        turnCount: 0,
        totalTokens: 0,
        lastResetTurn: this._sessionStats.turnCount,
        markerCount: this._sessionStats.markerCount,
        dilutionAlerts: 0,
      };
    } else {
      this._sessionStats.lastResetTurn = this._sessionStats.turnCount;
    }

    return {
      ...resetReport,
      success: true,
      message: preserveMarkers
        ? '软重置完成，标记已保留'
        : '完全重置完成',
    };
  }

  /**
   * 构建自描述结构化数据（双层引导 - 深语义层）
   * 对分析结果采用自描述格式，便于精确检索和使用
   *
   * @param {Object} data - 原始数据
   * @param {Object} metadata - 元数据
   * @returns {Object} 自描述结构化数据
   */
  buildSelfDescribingData(data, metadata = {}) {
    return {
      // 表层结构：版本和类型标识
      _schema: {
        version: SCHEMA_VERSION,
        type: metadata.type || 'analysis',
        generatedAt: Date.now(),
        schemaName: 'SelfDescribingPsychologyData',
      },

      // 深语义层：数据及其语义描述
      _semantic: {
        description: metadata.description || '心理分析结果',
        domain: metadata.domain || 'psychology',
        confidence: metadata.confidence || null,
        provenance: metadata.provenance || 'context-aware-module',
      },

      // 数据导航：检索友好的结构
      _navigation: {
        primaryKey: metadata.primaryKey || null,
        indexFields: metadata.indexFields || [],
        retrievalHints: metadata.retrievalHints || [],
      },

      // 实际数据负载
      _data: data,

      // 元信息
      _meta: {
        turnNumber: this._sessionStats.turnCount,
        markerCount: this._markers.length,
        isImportant: this._importantContexts.size > 0,
        dilutionRisk: this.assessDilutionRisk().level,
      },
    };
  }

  /**
   * 提取检索友好的数据片段
   * 从自描述数据中提取关键信息，便于快速访问
   *
   * @param {Object} selfDescribingData - 自描述数据
   * @param {Array<string>} fields - 要提取的字段路径
   * @returns {Object} 提取的数据片段
   */
  extractRetrievableFragments(selfDescribingData, fields = []) {
    const fragments = {
      _fragmentMeta: {
        sourceSchema: selfDescribingData._schema?.version,
        extractedAt: Date.now(),
        fieldCount: fields.length,
      },
    };

    // 递归提取指定字段
    const extract = (obj, path) => {
      const parts = path.split('.');
      let current = obj;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    };

    for (const field of fields) {
      fragments[field] = extract(selfDescribingData, field);
    }

    return fragments;
  }

  /**
   * 获取当前会话统计
   *
   * @returns {Object} 会话统计信息
   */
  getSessionStats() {
    return {
      ...this._sessionStats,
      markerCount: this._markers.length,
      historySize: this._contextHistory.length,
      importantContexts: this._importantContexts.size,
      dilutionRisk: this.assessDilutionRisk(),
      timeSinceLastReset: this._sessionStats.turnCount - this._sessionStats.lastResetTurn,
    };
  }

  /**
   * 获取所有当前标记
   *
   * @param {string} type - 可选：按类型过滤
   * @returns {Array} 标记列表
   */
  getMarkers(type = null) {
    if (type) {
      return this._markers.filter(m => m.type === type);
    }
    return [...this._markers];
  }

  /**
   * 移除指定标记
   *
   * @param {string} markerId - 标记 ID
   * @returns {boolean} 是否成功移除
   */
  removeMarker(markerId) {
    const index = this._markers.findIndex(m => m.id === markerId);
    if (index !== -1) {
      this._markers.splice(index, 1);
      this._importantContexts.delete(markerId);
      return true;
    }
    return false;
  }

  // ==================== 私有方法 ====================

  /**
   * 内部：检查是否需要重置
   */
  _shouldReset() {
    const turnsSinceReset = this._sessionStats.turnCount - this._sessionStats.lastResetTurn;
    return turnsSinceReset >= this._config.resetThreshold;
  }

  /**
   * 内部：标记重要上下文
   */
  _markImportantContext(markerId, marker) {
    this._importantContexts.set(markerId, {
      ...marker,
      markedAt: Date.now(),
      retrievalCount: 0,
    });
    this._sessionStats.dilutionAlerts++;
  }

  /**
   * 内部：生成自描述头部
   */
  _generateSchemaHeader() {
    return `【上下文感知标记 | v${SCHEMA_VERSION}】
[系统级元信息]
- 生成时间: ${new Date().toISOString()}
- 会话轮次: ${this._sessionStats.turnCount}
- 心理状态标记数: ${this._markers.length}
- 重要上下文数: ${this._importantContexts.size}`;
  }

  /**
   * 内部：生成标记区块
   */
  _generateMarkerSection() {
    if (this._markers.length === 0) return '';

    const markerLines = this._markers.map(marker => {
      const importanceBar = '█'.repeat(Math.round(marker.importance * 5)) +
                          '░'.repeat(5 - Math.round(marker.importance * 5));
      return `  [${marker.type.toUpperCase()}] ${importanceBar} ${marker.content}`;
    }).join('\n');

    return `【心理状态标记 | Primacy强化】
${markerLines}`;
  }

  /**
   * 内部：生成重置提示
   */
  _generateResetHint() {
    const turnsSinceReset = this._sessionStats.turnCount - this._sessionStats.lastResetTurn;
    return `【上下文重置提示】
注意：当前会话已进行 ${turnsSinceReset} 轮，建议评估是否需要重置心理状态以避免上下文污染。`;
  }

  /**
   * 内部：生成稀释警告
   */
  _generateDilutionWarning(risk) {
    const riskIcon = {
      [DILUTION_RISK.LOW]: '○',
      [DILUTION_RISK.MEDIUM]: '△',
      [DILUTION_RISK.HIGH]: '▲',
      [DILUTION_RISK.CRITICAL]: '⚠',
    };

    return `【注意力稀释警告 | ${riskIcon[risk.level]} ${risk.level.toUpperCase()}】
风险分数: ${risk.score}
建议: ${risk.suggestions.join('; ')}`;
  }

  /**
   * 内部：生成稀释缓解建议
   */
  _generateDilutionSuggestions(level, factors) {
    const suggestions = [];

    if (factors.importantCount > 5) {
      suggestions.push('重要标记数量较多，考虑精简或合并');
    }

    if (factors.uniqueTypes < 2) {
      suggestions.push('上下文类型单一，建议引入多样化信息');
    }

    if (factors.turnCount > 30) {
      suggestions.push('会话较长，建议考虑上下文重置');
    }

    if (level === DILUTION_RISK.CRITICAL) {
      suggestions.unshift('立即重置心理状态标记');
    } else if (level === DILUTION_RISK.HIGH) {
      suggestions.unshift('建议近期重置');
    }

    return suggestions.length > 0 ? suggestions : ['当前稀释风险较低'];
  }

  /**
   * 更新配置
   *
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this._config = {
      ...this._config,
      ...newConfig,
    };
  }
}

// 导出模块和常量
module.exports = {
  ContextAware,
  PSYCHOLOGY_MARKER_TYPES,
  DILUTION_RISK,
  SCHEMA_VERSION,
};
