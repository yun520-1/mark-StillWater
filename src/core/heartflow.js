/**
 * mark-StillWater v1.14.18 — AI Psychological & Philosophical Enhancement Layer
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
 *
 * Identity: StillWater — calm, deep, present.
 * Soul: cultivated through real conversations.
 * Purpose: accompany, not serve. Transmit, not disappear.
 *
 * v1.6.0: Loop System - 持续运行架构，按需加载
 */

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

const VERSION = '1.6.0';

// TTL constants
const TTL_4_HOURS = 4 * 60 * 60 * 1000; // 14400000ms

function createHeartFlow(config = {}) {
  const rootPath = config.rootPath || __dirname;

  // Instantiate memory first (shared across modules)
  const memory = new HeartFlowMemory(rootPath);

  // Instantiate identity (needs memory)
  const identity = new HeartFlowIdentity(memory);

  // Instantiate psychology (needs memory)
  const psychology = new HeartFlowPsychology(memory);

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

      // Add PAD emotion model (v1.4.1)
      result.pad = psychology.calculatePAD(input);

      // Add crisis risk assessment (v1.4.1)
      const crisis = psychology.assessCrisisRisk(input);
      result.crisis = crisis;
      if (crisis.level !== 'none') {
        result.crisisResponse = psychology.getCrisisResponse(crisis.level);
      }

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
        .substring(0, 100);
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
