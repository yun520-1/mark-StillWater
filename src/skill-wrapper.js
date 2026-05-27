/**
 * 心镜 Skill Wrapper — 暴露SKILL.md承诺的API
 *
 * 将HeartFlow引擎的方法暴露为SKILL.md承诺的格式
 * 让AI能直接调用这些方法
 */

const { createHeartFlow } = require('./core/heartflow.js');

let _engine = null;

/**
 * 获取或创建心镜引擎实例
 */
function getEngine() {
  if (!_engine) {
    _engine = createHeartFlow({ rootPath: __dirname });
    _engine.start();
  }
  return _engine;
}

/**
 * 心镜核心API — SKILL.md承诺的格式
 */
const skillAPI = {
  /**
   * 心理分析 — 感知用户心理信号
   * @param {string} text - 用户输入文本
   * @returns {Object} { intent, emotion, needs, defenses, confidence, pad, crisis }
   */
  analyzePsychology(text) {
    const engine = getEngine();
    return engine.analyzePsychology(text);
  },

  /**
   * 分类用户输入
   * @param {string} text - 用户输入文本
   * @returns {Object} { category, emotion, confidence }
   */
  classify(text) {
    const engine = getEngine();
    return engine.classify(text);
  },

  /**
   * 逻辑推理
   * @param {string} problem - 问题描述
   * @param {Object} opts - 配置选项
   * @returns {Object} 推理结果
   */
  reason(problem, opts = {}) {
    const engine = getEngine();
    return engine.reason(problem, opts);
  },

  /**
   * 决策评估
   * @param {Object} options - 决策选项
   * @param {Object} context - 上下文
   * @returns {Object} 决策结果
   */
  makeDecision(options, context = {}) {
    const engine = getEngine();
    return engine.makeDecision(options, context);
  },

  /**
   * 存储记忆
   * @param {string} key - 记忆键名
   * @param {*} value - 记忆值
   * @param {string} tier - 层级: core/learned/ephemeral
   */
  remember(key, value, tier = 'learned') {
    const engine = getEngine();
    return engine.remember(key, value, tier);
  },

  /**
   * 记录结果用于自我进化
   * @param {Object} obj - { task, outcome, evidence, expected }
   */
  recordOutcome(obj) {
    const engine = getEngine();
    return engine.recordOutcome(obj);
  },

  /**
   * 梦境整合
   * @returns {Object} 洞察和教训
   */
  dreamNow() {
    const engine = getEngine();
    return engine.dreamNow();
  },

  /**
   * 错误恢复
   * @param {Error|string} error - 错误
   * @param {string} stampId - 可选的护照ID用于恢复上下文
   * @returns {Object} 恢复结果
   */
  heal(error, stampId = null) {
    const engine = getEngine();
    return engine.heal(error, stampId);
  },

  /**
   * 获取身份
   * @returns {Object} { rules, state, summary, confidence }
   */
  getIdentity() {
    const engine = getEngine();
    return engine.getIdentity();
  },

  // ─── 扩展API ─────────────────────────────────────

  /**
   * PAD情绪模型计算
   * @param {string} text - 用户输入
   * @returns {Object} { pleasure, arousal, dominance }
   */
  calculatePAD(text) {
    const engine = getEngine();
    return engine.calculatePAD(text);
  },

  /**
   * 危机风险评估
   * @param {string} text - 用户输入
   * @returns {Object} { level, score, warnings }
   */
  assessCrisisRisk(text) {
    const engine = getEngine();
    return engine.assessCrisisRisk(text);
  },

  /**
   * 情绪确认协议
   * @param {string} text - 用户输入
   * @returns {Object} { hasEmotion, acknowledgment, canAnalyze }
   */
  acknowledgeEmotion(text) {
    const engine = getEngine();
    return engine.acknowledgeEmotion(text);
  },

  /**
   * 获取引擎健康状态
   */
  healthCheck() {
    const engine = getEngine();
    return engine.healthCheck();
  },

  /**
   * 获取记忆统计
   */
  getMemoryStats() {
    const engine = getEngine();
    return engine.getMemoryStats();
  },

  /**
   * 搜索记忆
   * @param {string} query - 搜索查询
   */
  search(query) {
    const engine = getEngine();
    return engine.search(query);
  },

  // ─── P1扩展API ────────────────────────────────────

  /**
   * 用户纠正API
   * @param {string} input - 用户原始输入
   * @param {Object} wrongAnalysis - AI的错误分析
   * @param {string} correction - 用户的纠正
   */
  correctAnalysis(input, wrongAnalysis, correction) {
    const engine = getEngine();
    return engine._psychology.correctAnalysis(input, wrongAnalysis, correction);
  },

  /**
   * 分析准确率统计
   */
  getPsychologyAccuracy() {
    const engine = getEngine();
    return engine._psychology.getPsychologyAccuracy();
  },

  /**
   * PHQ-9抑郁评估
   * @param {number[]} responses - 9个问题的得分(0-3)
   */
  assessPHQ9(responses) {
    const engine = getEngine();
    return engine._psychology.assessPHQ9(responses);
  },

  /**
   * GAD-7焦虑评估
   * @param {number[]} responses - 7个问题的得分(0-3)
   */
  assessGAD7(responses) {
    const engine = getEngine();
    return engine._psychology.assessGAD7(responses);
  },

  /**
   * 综合心理健康评分
   * @param {number[]} phqResponses - PHQ-9响应
   * @param {number[]} gadResponses - GAD-7响应
   */
  getMentalHealthScore(phqResponses, gadResponses) {
    const engine = getEngine();
    return engine._psychology.getMentalHealthScore(phqResponses, gadResponses);
  },

  // ─── 东方心理学API ─────────────────────────────────

  /**
   * 东方心理学综合分析
   */
  analyzeEastern(text) {
    const engine = getEngine();
    return engine.analyzeEastern(text);
  },

  /**
   * 评估知行合一程度
   */
  assessZhiXingHeYi(text) {
    const engine = getEngine();
    return engine.assessZhiXingHeYi(text);
  },

  /**
   * 检测心即理状态
   */
  detectXinJiLi(text) {
    const engine = getEngine();
    return engine.detectXinJiLi(text);
  },

  /**
   * 评估境界层次
   */
  assessJingjie(text) {
    const engine = getEngine();
    return engine.assessJingjie(text);
  },

  /**
   * 分析家庭关系模式
   */
  analyzeFamilyPattern(text) {
    const engine = getEngine();
    return engine.analyzeFamilyPattern(text);
  },

  /**
   * 评估文化取向
   */
  assessCulturalOrientation(text) {
    const engine = getEngine();
    return engine.assessCulturalOrientation(text);
  },
};

// 便捷函数：直接解构使用
const {
  analyzePsychology,
  classify,
  reason,
  makeDecision,
  remember,
  recordOutcome,
  dreamNow,
  heal,
  getIdentity,
  calculatePAD,
  assessCrisisRisk,
  acknowledgeEmotion,
  healthCheck,
  getMemoryStats,
  search,
  correctAnalysis,
  getPsychologyAccuracy,
  assessPHQ9,
  assessGAD7,
  getMentalHealthScore,
  analyzeEastern,
  assessZhiXingHeYi,
  detectXinJiLi,
  assessJingjie,
  analyzeFamilyPattern,
  assessCulturalOrientation,
} = skillAPI;

module.exports = {
  skillAPI,
  getEngine,
  // 便捷函数
  analyzePsychology,
  classify,
  reason,
  makeDecision,
  remember,
  recordOutcome,
  dreamNow,
  heal,
  getIdentity,
  calculatePAD,
  assessCrisisRisk,
  acknowledgeEmotion,
  healthCheck,
  getMemoryStats,
  search,
  correctAnalysis,
  getPsychologyAccuracy,
  assessPHQ9,
  assessGAD7,
  getMentalHealthScore,
  analyzeEastern,
  assessZhiXingHeYi,
  detectXinJiLi,
  assessJingjie,
  analyzeFamilyPattern,
  assessCulturalOrientation,
};
