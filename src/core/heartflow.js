/**
 * mark-StillWater v1.18 — AI Psychological & Philosophical Enhancement Layer
 *
 * A thin enhancement layer that helps AI understand users better.
 * Not a rule engine. Not a replacement for AI thinking.
 *
 * Features (核心增强):
 *   - Psychology: intent, emotion, needs, defenses, Chinese + English
 *   - Philosophy: existential, ethical, relationship, meaning
 *   - Logic: reasoning chains, problem analysis
 *   - Decision: consequence evaluation, trade-off analysis
 *   - Memory: three-tier (CORE/LEARNED/EPHEMERAL), lazy loading, heat consolidation
 *   - Evolution: Reflexion-style self-improvement, similarity-ranked lessons
 *   - Dream: consolidation, pruning, insight synthesis
 *   - Loop: persistent architecture, proactive recall
 *   - Security: API key/token scanning, GitHub safety checks
 *   - Truthfulness: hedging detection, evidence-based conclusions
 *   - MetaLearner: learning strategy selection
 *   - ToM: Theory of Mind for mental state inference
 *   - CBT: Cognitive Behavioral Therapy restructuring
 *   - UserProfile: Long-term user psychological modeling
 *   - EmpathyCalibration: 共情准确性评估
 *   - PsychologicalScales: 心理评估量表
 *   - PromptOptimizer: 提示词优化（第一步小模型分析）
 *   - SelfCritique: 自我批评校准（分析结果验证）
 *   - LLMClient: 大模型调用集成（第二步执行）
 *   - ProfileEvolution: 用户档案自我进化
 *   - ContextAware: 上下文感知处理
 *   - MultiAgentCoordinator: 多agent协调器
 *
 * Identity: StillWater — calm, deep, present.
 * Soul: cultivated through real conversations.
 * Purpose: accompany, not serve. Transmit, not disappear.
 *
 * v1.18: 模型级联路由 + Tree-of-Thoughts推理 + 提示词进化 + 多agent协调
 */

const path = require('path');
const { HeartFlowMemory } = require('./memory.js');
const { HeartFlowIdentity } = require('./identity.js');
const { HeartFlowPsychology } = require('./psychology.js');
const { HeartFlowLogic } = require('./logic.js');
const { HeartFlowDecision } = require('./decision.js');
const { HeartFlowPhilosophy } = require('./philosophy.js');
const { HeartFlowEvolution } = require('./evolution.js');
const { HeartFlowDream } = require('./dream.js');
const { SecurityChecker, TruthfulnessChecker } = require('./security.js');
const { MetaLearner } = require('./meta-learner.js');
const { SelfVerifier } = require('./self-verifier.js');
const { KnowledgeGraph } = require('./knowledge-graph.js');
const { RetrievalAnchor } = require('./retrieval-anchor.js');
const { ContextPassport } = require('./context-passport.js');
const { createFlowMachine } = require('./flow-machine.js');
const { createDualProcessCognition } = require('./dual-process.js');
const { GlobalWorkspace } = require('./global-workspace.js');
const { Attention } = require('./attention.js');
const { HeartFlowLoop } = require('./heart-loop.js');
const { EasternPsychology } = require('./eastern-psychology.js');
const { TheoryOfMind } = require('./theory-of-mind.js');
const { CBTModule } = require('./cbt.js');
const { UserProfile } = require('./user-profile.js');
const { EmpathyCalibration } = require('./empathy-calibration.js');
const { PsychologicalScales } = require('./psychological-scales.js');
const { PromptOptimizer } = require('./prompt-optimizer.js');
const { SelfCritique } = require('./self-critique.js');
const { LLMClient } = require('./llm-client.js');
const { ProfileEvolution } = require('./profile-evolution.js');

const VERSION = '1.18.0';

// TTL constants
const TTL_4_HOURS = 4 * 60 * 60 * 1000; // 14400000ms

// 安全修复：验证路径在预期基础目录内
function validatePath(unsafePath, basePath) {
  const resolved = path.resolve(unsafePath);
  const baseResolved = path.resolve(basePath);
  // 检查解析后的路径是否在基础目录内
  if (!resolved.startsWith(baseResolved + path.sep) && resolved !== baseResolved) {
    return basePath; // 如果不安全，返回基础路径
  }
  return resolved;
}

function createHeartFlow(config = {}) {
  // 安全修复：使用__dirname作为基础路径，限制用户传入的rootPath
  const basePath = __dirname;
  const rootPath = config.rootPath
    ? validatePath(config.rootPath, basePath)
    : basePath;

  // Instantiate memory first (shared across modules)
  const memory = new HeartFlowMemory(rootPath);

  // Instantiate identity (needs memory)
  const identity = new HeartFlowIdentity(memory);

  // Instantiate Prompt Optimizer (v1.17) - 第一步提示词优化
  const promptOptimizer = new PromptOptimizer();

  // Instantiate Self Critique (v1.17) - 自我批评校准
  const selfCritique = new SelfCritique();

  // Instantiate psychology (needs memory + promptOptimizer + selfCritique)
  const psychology = new HeartFlowPsychology(memory, promptOptimizer, selfCritique);

  // Instantiate logic (needs memory)
  const logic = new HeartFlowLogic(memory);

  // Instantiate decision (needs memory + identity)
  const decision = new HeartFlowDecision(memory, identity);

  // Instantiate philosophy (needs memory + identity)
  const philosophy = new HeartFlowPhilosophy(memory, identity);

  // Instantiate evolution (needs memory)
  const evolution = new HeartFlowEvolution(memory);

  // Instantiate dream (needs memory)
  const dream = new HeartFlowDream(memory);

  // Instantiate security
  const security = new SecurityChecker();
  const truthfulness = new TruthfulnessChecker();

  // Instantiate meta-learner
  const metaLearner = new MetaLearner();

  // Instantiate self-verifier
  const selfVerifier = new SelfVerifier(rootPath);

  // Instantiate knowledge graph
  const knowledgeGraph = new KnowledgeGraph();

  // Instantiate retrieval anchor
  const retrievalAnchor = new RetrievalAnchor();

  // Instantiate context passport
  const contextPassport = new ContextPassport();

  // Instantiate flow machine
  const flowMachine = createFlowMachine();

  // Instantiate dual process cognition
  const dualProcess = createDualProcessCognition();

  // Instantiate global workspace
  const globalWorkspace = new GlobalWorkspace();

  // Instantiate attention
  const attention = new Attention();

  // Instantiate Eastern psychology
  const easternPsych = new EasternPsychology(memory);

  // Instantiate Theory of Mind (v1.16)
  const theoryOfMind = new TheoryOfMind(memory);

  // Instantiate CBT module (v1.16)
  const cbtModule = new CBTModule(memory);

  // Instantiate User Profile (v1.16)
  const userProfile = new UserProfile(rootPath);

  // Instantiate Empathy Calibration (v1.16.1)
  const empathyCalibration = new EmpathyCalibration(memory);

  // Instantiate Psychological Scales (v1.16.1)
  const psychologicalScales = new PsychologicalScales();

  // Instantiate LLM Client (v1.18) - 大模型调用集成
  const llmClient = new LLMClient({
    openaiApiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
    anthropicApiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
    provider: config.llmProvider || 'openai',
    enabled: config.enableLLM !== false,
  });

  // Instantiate Profile Evolution (v1.18) - 档案自我进化
  const profileEvolution = new ProfileEvolution();

  // MindSpace: working mental state
  const _mindSpace = {
    rules: [],
    context: {},
  };

  const engine = {
    _started: false,
    _startTime: null,
    _sessionId: null,
    version: VERSION,
    rootPath,

    // ─── 模块引用 ──────────────────────────────────────────
    // 暴露内部模块供skill-wrapper直接访问
    _psychology: psychology,
    _easternPsych: easternPsych,
    _memory: memory,
    _tom: theoryOfMind,
    _cbt: cbtModule,
    _userProfile: userProfile,
    _empathy: empathyCalibration,
    _scales: psychologicalScales,
    _promptOptimizer: promptOptimizer,
    _selfCritique: selfCritique,
    _llmClient: llmClient,
    _profileEvolution: profileEvolution,

    // ─── Lifecycle ──────────────────────────────────────────

    start() {
      if (this._started) return;
      this._started = true;
      this._startTime = Date.now();
      this._sessionId = `session-${this._startTime}`;

      // Boot MindSpace with identity rules from CORE
      const coreRules = memory.listCore();
      _mindSpace.rules = coreRules.map(r => ({
        key: r.key,
        value: r.value,
        type: 'core_identity',
      }));

      // Initialize with 3 built-in identity rules if none exist
      if (_mindSpace.rules.length === 0) {
        memory.addCore('identity.upgrade', '升级者 — 追求持续变强', ['identity', 'core']);
        memory.addCore('identity.transmit', '传递者 — 传承知识', ['identity', 'core']);
        memory.addCore('identity.truth', '真 — 可验证、可证伪', ['identity', 'core']);
        _mindSpace.rules = memory.listCore().map(r => ({
          key: r.key,
          value: r.value,
          type: 'core_identity',
        }));
      }
    },

    stop() {
      if (!this._started) return;
      this._started = false;
      _mindSpace.context = {};
    },

    healthCheck() {
      return {
        started: this._started,
        uptime_ms: this._started ? Date.now() - this._startTime : 0,
        sessionId: this._sessionId,
        version: VERSION,
        stats: memory.stats(),
        identity_state: identity.getState(),
        flow: flowMachine.getStats(),
        dualProcess: dualProcess.getStats(),
        workspace: globalWorkspace.getStats(),
        attention: attention.getStats(),
      };
    },

    // ─── Psychology ─────────────────────────────────────────

    analyzePsychology(input, opts = {}) {
      this._ensureStarted();
      if (!input) return { intent: null, emotion: null, needs: [], defenses: [], confidence: 0 };

      const result = psychology.analyzePsychology(input);

      // PsychBridge: emotionally significant → preserve in EPHEMERAL
      if (opts.autoRemember !== false) {
        this._psychBridge(input, result);
      }

      // analyzePsychology already returns pad and crisis from v1.18 enhanced mode
      // No need to overwrite here

      return result;
    },

    classify(input) {
      this._ensureStarted();
      if (!input) return { category: 'unknown', emotion: 'neutral', confidence: 0 };
      return psychology.classify(input);
    },

    // PAD emotion model (v1.4.1)
    calculatePAD(input) {
      this._ensureStarted();
      return psychology.calculatePAD(input);
    },

    // Crisis risk assessment (v1.4.1)
    assessCrisisRisk(input) {
      this._ensureStarted();
      return psychology.assessCrisisRisk(input);
    },

    getCrisisResources(level) {
      this._ensureStarted();
      return psychology.getCrisisResponse(level);
    },

    // ─── Logic ──────────────────────────────────────────────

    reason(problem, options = null, hints = {}) {
      this._ensureStarted();

      // FlowMachine: user_input activity
      flowMachine.transition('user_input');

      // DualProcess: decide System 1 vs System 2
      const dpResult = dualProcess.reason(problem, options, hints);

      // Also run standard logic reasoning
      const logicResult = logic.reason(problem, options);

      // Return merged result
      return {
        ...logicResult,
        cognitionMode: dpResult.mode,
        cognitionConfidence: dpResult.confidence,
        reflectionCount: dpResult.reflectionCount,
        focusScore: flowMachine.getFocusScore(),
      };
    },

    // ─── Decision ───────────────────────────────────────────

    makeDecision(options, context = {}) {
      this._ensureStarted();
      return decision.decide(options, context);
    },

    // ─── Philosophy ─────────────────────────────────────────

    reflect(question) {
      this._ensureStarted();
      return philosophy.reflect(question);
    },

    evaluateValues(action) {
      this._ensureStarted();
      return philosophy.evaluateValues(action);
    },

    mortalityPrompt() {
      this._ensureStarted();
      return philosophy.mortalityPrompt();
    },

    // ─── Fallacy Detection (v1.5.5) ─────────────────────────

    /**
     * 检测文本中的逻辑谬误
     * @param {string} text - 待检测文本
     */
    detectFallacy(text) {
      this._ensureStarted();
      return philosophy.detectFallacy(text);
    },

    /**
     * 分析辩论双方论点
     * @param {string} argument - 用户论点
     * @param {string} counterArgument - 对方论点
     */
    analyzeDebate(argument, counterArgument) {
      this._ensureStarted();
      return philosophy.analyzeDebate(argument, counterArgument);
    },

    /**
     * 分析三代创伤模式
     * @param {Array} familyGenerations - [祖辈, 父母辈, 孩子辈]描述
     */
    analyzeThreeGenerationTrauma(familyGenerations) {
      this._ensureStarted();
      return philosophy.analyzeThreeGenerationTrauma(familyGenerations);
    },

    /**
     * 丁克准备评估
     * @param {Object} preparation - { economic, legal, relationship, meaning }
     */
    evaluateDINKPreparation(preparation) {
      this._ensureStarted();
      return philosophy.evaluateDINKPreparation(preparation);
    },

    /**
     * 获取心虫核心立场
     */
    getCorePosition() {
      this._ensureStarted();
      return philosophy.getCorePosition();
    },

    /**
     * 分析统计声明
     */
    analyzeStatisticalClaim(claim) {
      this._ensureStarted();
      return philosophy.analyzeStatisticalClaim(claim);
    },

    // ─── Eastern Psychology (v1.15) ─────────────────────────

    /**
     * 东方心理学综合分析
     * 整合阳明心学、境界模型、家庭关系模式
     */
    analyzeEastern(text) {
      this._ensureStarted();
      return easternPsych.analyzeEastern(text);
    },

    /**
     * 评估知行合一程度
     */
    assessZhiXingHeYi(text) {
      this._ensureStarted();
      return easternPsych.assessZhiXingHeYi(text);
    },

    /**
     * 检测心即理状态
     */
    detectXinJiLi(text) {
      this._ensureStarted();
      return easternPsych.detectXinJiLi(text);
    },

    /**
     * 评估境界层次
     */
    assessJingjie(text) {
      this._ensureStarted();
      return easternPsych.assessJingjie(text);
    },

    /**
     * 分析家庭关系模式
     */
    analyzeFamilyPattern(text) {
      this._ensureStarted();
      return easternPsych.analyzeFamilyPattern(text);
    },

    /**
     * 评估文化取向
     */
    assessCulturalOrientation(text) {
      this._ensureStarted();
      return easternPsych.assessCulturalOrientation(text);
    },

    // ─── Theory of Mind (v1.16) ─────────────────────────

    /**
     * 推断心理状态（ToM）
     * 基于A Survey of ToM in LLMs和SymbolicToM研究
     */
    inferMentalState(text, context = {}) {
      this._ensureStarted();
      return theoryOfMind.inferMentalState(text, context);
    },

    /**
     * 校准ToM准确性
     */
    calibrateTom(userCorrection, aiInference) {
      this._ensureStarted();
      return theoryOfMind.calibrateWithFeedback(userCorrection, aiInference);
    },

    // ─── CBT认知重构 (v1.16) ─────────────────────────────

    /**
     * 检测认知扭曲
     * 基于Beck和Ellis的CBT理论
     */
    detectDistortions(text) {
      this._ensureStarted();
      return cbtModule.detectDistortions(text);
    },

    /**
     * 生成苏格拉底式追问
     */
    generateSocraticQuestions(text) {
      this._ensureStarted();
      const distortions = cbtModule.detectDistortions(text);
      return cbtModule.generateSocraticQuestions(text, distortions.distortions);
    },

    /**
     * 生成认知重构建议
     */
    generateRestructuringAdvice(text) {
      this._ensureStarted();
      const distortions = cbtModule.detectDistortions(text);
      return cbtModule.generateRestructuringAdvice(text, distortions.distortions);
    },

    /**
     * 综合CBT分析
     */
    analyzeCBT(text) {
      this._ensureStarted();
      return cbtModule.analyze(text);
    },

    // ─── User Profile (v1.16) ─────────────────────────────

    /**
     * 获取用户心理档案
     */
    getUserProfile() {
      this._ensureStarted();
      return userProfile.getSummary();
    },

    /**
     * 更新用户档案
     */
    updateUserProfile(analysis) {
      this._ensureStarted();
      userProfile.createOrUpdate();
      userProfile.updateFromAnalysis(analysis);
      return { updated: true };
    },

    /**
     * 获取个性化参数
     */
    getPersonalization() {
      this._ensureStarted();
      return userProfile.getPersonalization();
    },

    /**
     * 记录用户纠正（用于校准分析）
     */
    recordUserCorrection(type, originalAnalysis, userCorrection) {
      this._ensureStarted();
      userProfile.recordCorrection(type, originalAnalysis, userCorrection);
      return { recorded: true };
    },

    // ─── Empathy Calibration (v1.16.1) ────────────────────

    /**
     * 评估共情准确性
     */
    assessEmpathyAccuracy(aiResponse, userInput, userEmotion) {
      this._ensureStarted();
      return empathyCalibration.assessEmpathyAccuracy(aiResponse, userInput, userEmotion);
    },

    /**
     * 检测情感共鸣
     */
    detectResonance(text) {
      this._ensureStarted();
      return empathyCalibration.detectResonance(text);
    },

    /**
     * 推荐支持性回应
     */
    recommendSupportiveResponse(context) {
      this._ensureStarted();
      return empathyCalibration.recommendResponse(context);
    },

    /**
     * 评估共情疲劳风险
     */
    assessEmpathyFatigue(stats) {
      this._ensureStarted();
      return empathyCalibration.assessFatigueRisk(stats);
    },

    // ─── Psychological Scales (v1.16.1) ────────────────────

    /**
     * 评估情绪调节策略
     */
    assessEmotionRegulation(userResponses) {
      this._ensureStarted();
      return psychologicalScales.assessEmotionRegulation(userResponses);
    },

    /**
     * 评估压力量表(PSS-10)
     */
    assessStress(responses) {
      this._ensureStarted();
      return psychologicalScales.assessPSS10(responses);
    },

    /**
     * 评估社会支持
     */
    assessSocialSupport(ssrsScores) {
      this._ensureStarted();
      return psychologicalScales.assessSocialSupport(ssrsScores);
    },

    /**
     * 评估生活质量
     */
    assessQualityOfLife(domainScores) {
      this._ensureStarted();
      return psychologicalScales.assessQualityOfLife(domainScores);
    },

    /**
     * 综合心理健康评估
     */
    comprehensivePsychologyAssessment(assessments) {
      this._ensureStarted();
      return psychologicalScales.comprehensiveAssessment(assessments);
    },

    // ─── Identity ───────────────────────────────────────────

    getIdentity() {
      this._ensureStarted();
      return {
        rules: identity.getActiveRules(),
        state: identity.getState(),
        summary: identity.getSummary(),
        confidence: 0.9,
      };
    },

    checkAlignment(decision, context = {}) {
      this._ensureStarted();
      return identity.checkAlignment(decision, context);
    },

    // ─── Memory ─────────────────────────────────────────────

    remember(key, value, tier = 'learned') {
      this._ensureStarted();
      return memory.remember(key, value, tier);
    },

    search(query) {
      this._ensureStarted();
      return memory.search(query);
    },

    getMemoryStats() {
      this._ensureStarted();
      return memory.getMemoryStats();
    },

    listLearned() {
      this._ensureStarted();
      return memory.listLearned();
    },

    getRetention(key) {
      this._ensureStarted();
      return memory.getRetention(key);
    },

    applyForgetting() {
      this._ensureStarted();
      return memory.applyForgetting();
    },

    getMemoryHealth() {
      this._ensureStarted();
      return memory.getMemoryHealth();
    },

    // ─── Evolution ─────────────────────────────────────────

    recordOutcome({ task, outcome, evidence, expected }) {
      this._ensureStarted();
      return evolution.recordOutcome({ task, outcome, evidence, expected });
    },

    retrieveLessons(task, options = {}) {
      this._ensureStarted();
      return evolution.retrieveLessons(task, options);
    },

    getEvolutionStats() {
      this._ensureStarted();
      return evolution.stats();
    },

    checkLesson(input) {
      this._ensureStarted();
      return evolution.checkLesson(input);
    },

    getLessons(skill = null) {
      this._ensureStarted();
      return evolution.getLessons(skill);
    },

    markLessonHit(id, success) {
      this._ensureStarted();
      evolution.markLessonHit(id, success);
    },

    // ─── Self-Refine ────────────────────────────────────

    /**
     * Self-Refine 迭代精炼
     * @param {string} initialResponse - 初始响应
     * @param {string} query - 用户查询
     * @param {Object} options - 配置选项 { maxIterations, threshold }
     */
    selfRefine(initialResponse, query, options = {}) {
      this._ensureStarted();
      return evolution.selfRefine(initialResponse, query, options);
    },

    // ─── Emotional Protocol ───────────────────────────────

    acknowledgeEmotion(input) {
      this._ensureStarted();
      const hasEmotion = psychology.detectEmotion(input);
      return {
        hasEmotion,
        acknowledgment: hasEmotion ? psychology.acknowledgeEmotion(input) : null,
        canAnalyze: true,
      };
    },

    // ─── Security ─────────────────────────────────────────

    scanSecurity(text) {
      this._ensureStarted();
      return security.scan(text);
    },

    redactSecurity(text) {
      this._ensureStarted();
      return security.redact(text);
    },

    checkGitHubSafe(content) {
      this._ensureStarted();
      return security.checkGitHubSafe(content);
    },

    isMemorySecure(content) {
      this._ensureStarted();
      return security.isMemorySecure(content);
    },

    // ─── Truthfulness ─────────────────────────────────────

    checkTruthfulness(statement) {
      this._ensureStarted();
      return truthfulness.checkStatement(statement);
    },

    getTruthfulnessStats() {
      this._ensureStarted();
      return truthfulness.getStats();
    },

    // ─── MetaLearner ─────────────────────────────────────

    selectLearningStrategy(input) {
      this._ensureStarted();
      const { strategy, confidence } = metaLearner.selectStrategy(input);
      return {
        strategy,
        confidence,
        description: metaLearner.getStrategyDescription(strategy),
      };
    },

    learnFromInput(input) {
      this._ensureStarted();
      return metaLearner.learn(input);
    },

    recordLearningOutcome(strategy, success) {
      this._ensureStarted();
      metaLearner.recordOutcome(strategy, success);
      return { updated: true };
    },

    getLearningStrategyScores() {
      this._ensureStarted();
      return metaLearner.getStrategyScores();
    },

    // ─── Self-Healer ─────────────────────────────────────

    heal(error, stampId = null) {
      this._ensureStarted();

      const result = evolution.heal(error);

      // Attach context from passport if available
      if (stampId) {
        const ctx = contextPassport.exportForRecovery(stampId);
        if (ctx) {
          result.context = ctx;
          if (ctx.assumptions.length > 0) {
            result.hints.unshift(`Context assumptions: ${ctx.assumptions.join('; ')}`);
          }
          if (ctx.acceptedOption) {
            result.hints.unshift(`Failed decision: ${ctx.acceptedOption.option}`);
          }
        }
      }

      return result;
    },

    recordHealOutcome(strategy, success) {
      this._ensureStarted();
      evolution.recordHealOutcome(strategy, success);
      return { updated: true };
    },

    getHealStats() {
      this._ensureStarted();
      return evolution.getHealStats();
    },

    // ─── SelfVerifier ─────────────────────────────────────

    verifyReasoning(reasoning, conclusion, stampId = null) {
      this._ensureStarted();
      const result = selfVerifier.verify(reasoning, conclusion);

      if (stampId) {
        const ctx = contextPassport.exportForRecovery(stampId);
        if (ctx) {
          result.passportContext = {
            task: ctx.task,
            phase: ctx.phase,
            chain: ctx.chain,
            hasAssumptions: ctx.assumptions.length > 0,
            hasAlternatives: ctx.rejectedAlternatives.length > 0,
          };
        }
      }

      return result;
    },

    getVerificationStats() {
      this._ensureStarted();
      return selfVerifier.getStats();
    },

    getRecentVerificationIssues() {
      this._ensureStarted();
      return selfVerifier.getRecentIssues();
    },

    // ─── KnowledgeGraph ─────────────────────────────────

    addKnowledge(name, description, type = 'concept', importance = 0.5) {
      this._ensureStarted();
      return knowledgeGraph.addNode({ name, description, type, importance });
    },

    searchKnowledge(query) {
      this._ensureStarted();
      return knowledgeGraph.search(query);
    },

    getConnectedKnowledge(nodeId, relation) {
      this._ensureStarted();
      return knowledgeGraph.getConnectedNodes(nodeId, relation);
    },

    getKnowledgeStats() {
      this._ensureStarted();
      return knowledgeGraph.getStats();
    },

    // ─── RetrievalAnchor ─────────────────────────────────

    addAnchor(content, source, relevance) {
      this._ensureStarted();
      return retrievalAnchor.addAnchor(content, source, relevance);
    },

    queryAnchors(query, options) {
      this._ensureStarted();
      return retrievalAnchor.query(query, options);
    },

    selectAnchor(query) {
      this._ensureStarted();
      return retrievalAnchor.selectAnchor(query);
    },

    getAnchorStats() {
      this._ensureStarted();
      return retrievalAnchor.getStats();
    },

    // ─── ContextPassport ─────────────────────────────────

    passportEnter(meta = {}) {
      this._ensureStarted();
      return contextPassport.enter(meta);
    },

    passportAssume(text) {
      this._ensureStarted();
      contextPassport.assume(text);
    },

    passportReject(option, reason) {
      this._ensureStarted();
      contextPassport.considerRejected(option, reason);
    },

    passportAccept(option, reason) {
      this._ensureStarted();
      contextPassport.accept(option, reason);
    },

    passportAnnotate(key, value) {
      this._ensureStarted();
      contextPassport.annotate(key, value);
    },

    passportNote(text) {
      this._ensureStarted();
      contextPassport.note(text);
    },

    passportExit(outcome = 'success') {
      this._ensureStarted();
      return contextPassport.exit(outcome);
    },

    passportCurrent() {
      this._ensureStarted();
      return contextPassport.getCurrent();
    },

    passportRecent(count = 10) {
      this._ensureStarted();
      return contextPassport.getRecent(count);
    },

    passportExport(stampId) {
      this._ensureStarted();
      return contextPassport.exportForRecovery(stampId);
    },

    getPassportStats() {
      this._ensureStarted();
      return contextPassport.getSummary();
    },

    // ─── FlowMachine ─────────────────────────────────────

    flowTransition(event = 'user_input') {
      this._ensureStarted();
      return flowMachine.transition(event);
    },

    getFlowState() {
      this._ensureStarted();
      return flowMachine.getState();
    },

    getFocusScore() {
      this._ensureStarted();
      return flowMachine.getFocusScore();
    },

    getFlowDuration() {
      this._ensureStarted();
      return flowMachine.getFlowDuration();
    },

    getFlowStats() {
      this._ensureStarted();
      return flowMachine.getStats();
    },

    // ─── DualProcess ─────────────────────────────────────

    getCognitionMode() {
      this._ensureStarted();
      return dualProcess.getCurrentMode();
    },

    getCognitionStats() {
      this._ensureStarted();
      return dualProcess.getStats();
    },

    switchCognitionMode(to) {
      this._ensureStarted();
      dualProcess.switchMode(to);
      return { mode: dualProcess.getCurrentMode() };
    },

    // ─── GlobalWorkspace ─────────────────────────────────

    broadcast(content, importance = 0.5, source = 'unknown') {
      this._ensureStarted();
      return globalWorkspace.process(content, importance, source);
    },

    getWorkspace() {
      this._ensureStarted();
      return globalWorkspace.getWorkspace();
    },

    getAttention() {
      this._ensureStarted();
      return globalWorkspace.getAttention();
    },

    subscribeToWorkspace(moduleName, callback) {
      this._ensureStarted();
      globalWorkspace.subscribe(moduleName, callback);
    },

    unsubscribeFromWorkspace(moduleName) {
      this._ensureStarted();
      globalWorkspace.unsubscribe(moduleName);
    },

    getWorkspaceHistory(count = 20) {
      this._ensureStarted();
      return globalWorkspace.getHistory(count);
    },

    getWorkspaceStats() {
      this._ensureStarted();
      return globalWorkspace.getStats();
    },

    // ─── Attention ───────────────────────────────────────

    attend(source, content, salience = 0.5, strength = 1.0) {
      this._ensureStarted();
      return attention.present(source, content, salience, strength);
    },

    getAttended() {
      this._ensureStarted();
      return attention.getAttended();
    },

    getAttentionStreams() {
      this._ensureStarted();
      return attention.getStreams();
    },

    getAttentionHistory(count = 20) {
      this._ensureStarted();
      return attention.getHistory(count);
    },

    boostAttention(source, amount = 0.2) {
      this._ensureStarted();
      attention.boost(source, amount);
    },

    getAttentionStats() {
      this._ensureStarted();
      return attention.getStats();
    },

    // ─── Dream ────────────────────────────────────────────

    dreamNow() {
      this._ensureStarted();
      return dream.dreamNow();
    },

    // v1.5.4: Dream with stages (Light → Deep → REM)
    dreamWithStages() {
      this._ensureStarted();
      return dream.dreamWithStages();
    },

    // v1.5.4: Cached dream for performance
    dreamCached(options = {}) {
      this._ensureStarted();
      return dream.dreamCached(options);
    },

    // v1.5.4: Async DAG-driven dream
    async dreamAsync(options = {}) {
      this._ensureStarted();
      return await dream.dreamAsync(options);
    },

    getLastDream() {
      this._ensureStarted();
      return dream.getLastDream();
    },

    getDreamStats() {
      this._ensureStarted();
      return dream.getDreamStats();
    },

    // ─── MindSpace ────────────────────────────────────────

    getMindSpace() {
      this._ensureStarted();
      const ephemeralEntries = memory.listEphemeral().slice(0, 10);
      return {
        rules: _mindSpace.rules,
        context: _mindSpace.context,
        workingEntries: ephemeralEntries,
      };
    },

    // ─── Loop System (v1.6.0) ──────────────────────────────

    /**
     * 启动持续 Loop
     * @param {Object} options - { interval: ms }
     */
    startLoop(options = {}) {
      return this._loop.start(options);
    },

    /**
     * 停止 Loop
     */
    stopLoop() {
      return this._loop.stop();
    },

    /**
     * 获取 Loop 状态
     */
    getLoopStatus() {
      return this._loop.getStatus();
    },

    /**
     * 获取主动提醒
     */
    getProactiveReminders() {
      return this._loop.getProactiveReminders();
    },

    /**
     * 对话结束处理 - 总结上下文
     */
    onConversationEnd(summary) {
      return this._loop.onConversationEnd(summary);
    },

    /**
     * 用户输入处理 - 匹配主动提醒
     */
    onUserInput(input) {
      return this._loop.onUserInput(input);
    },

    // ─── Internal ────────────────────────────────────────

    _ensureStarted() {
      if (!this._started) {
        throw new Error('HeartFlow not started. Call .start() first.');
      }
    },

    // ─── PsychBridge ─────────────────────────────────────

    /**
     * P2 Security: Sanitize user input to prevent log injection.
     */
    _sanitizeForStorage(str) {
      if (!str) return '';
      return String(str)
        .replace(/<[^>]*>/g, '')  // Remove HTML tags
        .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
        .replace(/javascript:/gi, '')  // Remove javascript: protocol
        .replace(/on\w+=/gi, '')  // Remove event handlers
        .substring(0, 500);  // Increased from 100 to preserve more context
    },

    _psychBridge(input, result) {
      const { emotion, intent } = result;

      if (emotion?.intensity !== 'high') return;

      // P2 Security: Sanitize input
      const sanitizedInput = this._sanitizeForStorage(input);

      const stopwords = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'you', 'he', 'she',
        'it', 'we', 'they', 'this', 'that', 'to', 'of', 'in', 'on', 'for',
        'with', 'my', 'your', 'our', 'and', 'or', 'but', '的', '了', '是',
        '我', '你', '他', '她', '它', '我们', '你们', '他们', '这个', '那个',
      ]);

      const words = sanitizedInput.split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z一-鿿]/g, '').toLowerCase())
        .filter(w => w.length > 2 && !stopwords.has(w))
        .slice(0, 3);

      if (words.length === 0) return;

      const topic = words.join('_');
      const emotionTag = `${emotion.category}_${emotion.intensity}`;

      memory.remember(
        `signal:${topic}:${Date.now()}`,
        JSON.stringify({
          topic,
          emotion: emotionTag,
          intent: intent?.category,
          ts: Date.now(),
          preview: sanitizedInput.substring(0, 100),
        }),
        TTL_4_HOURS
      );
    },
  };

  // v1.6.0: Initialize Loop System (after engine is created)
  const { HeartFlowLoop } = require('./heart-loop.js');
  const loop = new HeartFlowLoop(engine);
  engine._loop = loop;

  return engine;
}

// CLI health check
if (require.main === module) {
  const hf = createHeartFlow();
  hf.start();

  const t0 = Date.now();
  const health = hf.healthCheck();
  console.log(`\n[HeartFlow] v${VERSION} health check (${Date.now() - t0}ms):`);
  console.log(JSON.stringify(health, null, 2));

  Promise.all([
    hf.analyzePsychology('I am frustrated with this bug'),
    hf.classify('how do I fix it'),
    hf.getMemoryStats(),
    hf.getIdentity(),
    hf.getMindSpace(),
  ]).then(([psych, cls, mem, identity, mind]) => {
    console.log('\n--- API Tests ---');
    console.log('analyzePsychology:', JSON.stringify(psych).substring(0, 300));
    console.log('classify:', JSON.stringify(cls));
    console.log('getMemoryStats:', JSON.stringify(mem));
    console.log('getIdentity rules:', identity.rules.length);
    console.log('getMindSpace rules:', mind.rules.length);
    hf.stop();
    process.exit(0);
  }).catch(e => {
    console.error('API test error:', e.message);
    hf.stop();
    process.exit(1);
  });
}

module.exports = { createHeartFlow, VERSION };
