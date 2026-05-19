/**
 * mark-StillWater v1.2.3 — AI Psychological & Philosophical Foundation System
 *
 * A quiet presence with depth. Still water runs deep.
 *
 * Features:
 *   - Psychology: intent, emotion, needs, defenses, Chinese + English
 *   - Philosophy: existential, ethical, relationship, meaning
 *   - Logic: reasoning chains, problem analysis
 *   - Decision: consequence evaluation, trade-off analysis
 *   - Memory: three-tier (CORE/LEARNED/EPHEMERAL), lazy loading, heat consolidation
 *   - Evolution: Reflexion-style self-improvement, similarity-ranked lessons
 *   - Dream: consolidation, pruning, insight synthesis
 *   - Security: API key/token scanning, GitHub safety checks (v1.0.2)
 *   - Truthfulness: hedging detection, evidence-based conclusions (v1.0.2)
 *   - MetaLearner: learning strategy selection (v1.0.3)
 *   - PsychBridge: auto-preserve emotionally significant content
 *   - SelfHealer: Q-learning error recovery with 7 patterns, 4 strategies (v1.0.4)
 *   - SelfVerifier: 4-way reasoning verification (v1.0.4)
 *   - KnowledgeGraph: structured node/edge knowledge graph (v1.0.4)
 *   - RetrievalAnchor: context-augmented retrieval anchors (v1.0.4)
 *   - ContextPassport: decision context tracking for context-aware healing (v1.0.5)
 *   - FlowMachine: focus state FSM (idle/initiating/in_flow/distracted) (v1.0.6)
 *   - DualProcess: System 1/2 cognition routing (v1.0.6)
 *   - HeartBeat: circuit breaker for self-healing (v1.0.6)
 *   - GlobalWorkspace: Baars GWT consciousness broadcasting (v1.0.7)
 *   - Attention: GWT attention selection with competitive salience (v1.0.8)
 *   - EmotionBridge: emotion-memory integration with arc analysis (v1.0.9)
 *   - ReflectionEngine: self-reflection from memory entries (v1.0.9)
 *   - LogicVerifier: attention-style token weighting for logic verification (v1.0.9)
 *   - SleepStages: NREM/REM sleep cycle simulation (v1.1.0)
 *   - DreamWeaver: dream content generation from memory recombination (v1.1.0)
 *   - Planner: memory-based action planning from reflections (v1.1.0)
 *   - ChildPsychology: developmental psychology (Piaget, Erikson, Attachment) (v1.1.1)
 *   - DreamQuality: Dream Quality Score (DQS) with 5 weighted components (v1.2.0)
 *   - MetaJudgment: L1/L2/L3 meta-judgment with TGB review (v1.2.1)
 *   - SelfCorrections: user correction tracking with 3x pattern promotion (v1.2.2)
 *   - Ebbinghaus: forgetting curve for LEARNED memory decay (v1.2.3)
 *   - TruthTeller: Socratic questioning, assumption challenging, self-truth assessment (v1.2.4)
 *
 * Identity: StillWater — calm, deep, present.
 * Soul: cultivated through real conversations.
 * Purpose: accompany, not serve. Transmit, not disappear.
 *
 * Zero npm dependencies — pure JavaScript.
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
const { createHeartBeat } = require('./heartbeat.js');
const { GlobalWorkspace } = require('./global-workspace.js');
const { Attention } = require('./attention.js');
const { EmotionBridge } = require('./emotion-bridge.js');
const { ReflectionEngine } = require('./reflection.js');
const { LogicVerifier } = require('./logic-verifier.js');
const { SleepStages } = require('./sleep-stages.js');
const { DreamWeaver } = require('./dream-weaver.js');
const { Planner } = require('./planner.js');
const { ChildPsychology } = require('./child-psychology.js');
const { DreamQualityTracker, interpretDQS } = require('./dream-quality.js');
const { MetaJudgment } = require('./meta-judgment.js');
const { SelfCorrections } = require('./self-corrections.js');
const { TruthTeller } = require('./truth-teller.js');

const VERSION = '1.2.4';

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

  // Instantiate security (v1.0.2)
  const security = new SecurityChecker();
  const truthfulness = new TruthfulnessChecker();

  // Instantiate meta-learner (v1.0.3)
  const metaLearner = new MetaLearner();

  // Instantiate self-verifier (v1.0.4)
  const selfVerifier = new SelfVerifier(rootPath);

  // Instantiate knowledge graph (v1.0.4)
  const knowledgeGraph = new KnowledgeGraph();

  // Instantiate retrieval anchor (v1.0.4)
  const retrievalAnchor = new RetrievalAnchor();

  // Instantiate context passport (v1.0.5)
  const contextPassport = new ContextPassport();

  // Instantiate flow machine (v1.0.6)
  const flowMachine = createFlowMachine();

  // Instantiate dual process cognition (v1.0.6)
  const dualProcess = createDualProcessCognition();

  // Instantiate heartbeat/circuit breaker (v1.0.6)
  const heartBeat = createHeartBeat();

  // Instantiate global workspace (v1.0.7)
  const globalWorkspace = new GlobalWorkspace();

  // Instantiate attention (v1.0.8)
  const attention = new Attention();

  // Instantiate emotion bridge (v1.0.9)
  const emotionBridge = new EmotionBridge(memory);

  // Instantiate reflection engine (v1.0.9)
  const reflectionEngine = new ReflectionEngine(memory);

  // Instantiate logic verifier (v1.0.9)
  const logicVerifier = new LogicVerifier();

  // Instantiate sleep stages (v1.1.0)
  const sleepStages = new SleepStages();

  // Instantiate dream weaver (v1.1.0)
  const dreamWeaver = new DreamWeaver(memory);

  // Instantiate dream quality tracker (v1.2.0)
  const dreamQuality = new DreamQualityTracker();

  // Instantiate planner (v1.1.0)
  const planner = new Planner();

  // Instantiate child psychology (v1.1.1)
  const childPsychology = new ChildPsychology();

  // Instantiate meta-judgment (v1.2.1)
  const metaJudgment = new MetaJudgment();

  // Instantiate self-corrections tracker (v1.2.2)
  const selfCorrections = new SelfCorrections();

  // Instantiate truth teller (v1.2.4)
  const truthTeller = new TruthTeller();

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
        heartbeat: heartBeat.getStats(),
        dualProcess: dualProcess.getStats(),
        workspace: globalWorkspace.getStats(),
        attention: attention.getStats(),
        emotionBridge: emotionBridge.getStats(),
        reflection: reflectionEngine.getStats(),
        logicVerifier: logicVerifier.getStats(),
        sleepStages: sleepStages.getStats(),
        dreamWeaver: dreamWeaver.getStats(),
        dreamQuality: dreamQuality.getStats(),
        planner: planner.getStats(),
        childPsychology: childPsychology.getStats(),
        metaJudgment: metaJudgment.getStats(),
        selfCorrections: selfCorrections.getStats(),
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

      return result;
    },

    classify(input) {
      this._ensureStarted();
      if (!input) return { category: 'unknown', emotion: 'neutral', confidence: 0 };
      return psychology.classify(input);
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

    /**
     * Get retention score for a memory entry (v1.2.3).
     * Uses Ebbinghaus forgetting curve: R = e^(-t/S)
     * @param {string} key
     * @returns {{ retention: number, ageHours: number, tier: string } | null}
     */
    getRetention(key) {
      this._ensureStarted();
      return memory.getRetention(key);
    },

    /**
     * Apply Ebbinghaus forgetting curve to LEARNED memories (v1.2.3).
     * Compresses low-retention entries, deletes very low ones.
     * @returns {{ compressed: string[], deleted: string[], stats: Object }}
     */
    applyForgetting() {
      this._ensureStarted();
      return memory.applyForgetting();
    },

    /**
     * Get memory health based on average retention (v1.2.3).
     * @returns {{ verdict: string, avgRetention: number, layers: Object }}
     */
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

    // ─── Lesson Bank (v1.0.1) ──────────────────────────────

    /**
     * Check input against lesson bank for known error patterns.
     * Returns correction if pattern matched.
     */
    checkLesson(input) {
      this._ensureStarted();
      return evolution.checkLesson(input);
    },

    /**
     * Get all lessons, optionally filtered by skill.
     */
    getLessons(skill = null) {
      this._ensureStarted();
      return evolution.getLessons(skill);
    },

    /**
     * Mark a lesson hit as success/failure.
     */
    markLessonHit(id, success) {
      this._ensureStarted();
      evolution.markLessonHit(id, success);
    },

    // ─── Emotional Protocol (v1.0.1) ───────────────────────

    /**
     * Acknowledge emotions before analysis ("容器是漏的").
     * Returns acknowledgment string if emotion detected.
     */
    acknowledgeEmotion(input) {
      this._ensureStarted();
      const hasEmotion = psychology.detectEmotion(input);
      return {
        hasEmotion,
        acknowledgment: hasEmotion ? psychology.acknowledgeEmotion(input) : null,
        canAnalyze: true,
      };
    },

    // ─── Security (v1.0.2) ────────────────────────────────

    /**
     * Scan text for sensitive information (API keys, tokens, passwords, etc.)
     */
    scanSecurity(text) {
      this._ensureStarted();
      return security.scan(text);
    },

    /**
     * Redact sensitive information from text.
     */
    redactSecurity(text) {
      this._ensureStarted();
      return security.redact(text);
    },

    /**
     * Check if content is safe to push to GitHub.
     */
    checkGitHubSafe(content) {
      this._ensureStarted();
      return security.checkGitHubSafe(content);
    },

    /**
     * Check if memory content is secure.
     */
    isMemorySecure(content) {
      this._ensureStarted();
      return security.isMemorySecure(content);
    },

    // ─── Truthfulness (v1.0.2) ───────────────────────────

    /**
     * Check statement for lying/hedging/absolute words without evidence.
     */
    checkTruthfulness(statement) {
      this._ensureStarted();
      return truthfulness.checkStatement(statement);
    },

    /**
     * Get truthfulness stats.
     */
    getTruthfulnessStats() {
      this._ensureStarted();
      return truthfulness.getStats();
    },

    // ─── MetaLearner (v1.0.3) ───────────────────────────

    /**
     * Select optimal learning strategy based on input content.
     * Returns: { strategy: 'conceptual'|'example'|'analogy'|'step_by_step'|'socratic', confidence }
     */
    selectLearningStrategy(input) {
      this._ensureStarted();
      const { strategy, confidence } = metaLearner.selectStrategy(input);
      return {
        strategy,
        confidence,
        description: metaLearner.getStrategyDescription(strategy),
      };
    },

    /**
     * Learn from input — extract concepts and summary.
     * Returns: { summary, concepts: string[], quality: 'high'|'medium'|'low' }
     */
    learnFromInput(input) {
      this._ensureStarted();
      return metaLearner.learn(input);
    },

    /**
     * Record learning outcome — update Q-table.
     */
    recordLearningOutcome(strategy, success) {
      this._ensureStarted();
      metaLearner.recordOutcome(strategy, success);
      return { updated: true };
    },

    /**
     * Get current learning strategy scores.
     */
    getLearningStrategyScores() {
      this._ensureStarted();
      return metaLearner.getStrategyScores();
    },

    // ─── Self-Healer (v1.0.4) ─────────────────────────────

    /**
     * Q-learning error recovery — detect pattern and select strategy.
     * If stampId provided, uses ContextPassport for context-aware recovery.
     * HeartBeat circuit breaker prevents cascading failures.
     * Returns: { ok, canRetry, backoffMs, strategy, pattern, hints, context, circuitBreaker }
     */
    heal(error, stampId = null) {
      this._ensureStarted();

      // Check circuit breaker first
      if (!heartBeat.canHeal()) {
        return {
          ok: false,
          canRetry: false,
          backoffMs: 0,
          strategy: 'abort',
          pattern: 'circuit_breaker_open',
          hints: ['Circuit breaker is open — healing paused. Try later.'],
          circuitBreaker: heartBeat.getStats(),
        };
      }

      const result = evolution.heal(error);

      // Record metric in heartbeat
      heartBeat.recordMetric('heal_attempt', result.canRetry ? 8 : 3);

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

      result.circuitBreaker = heartBeat.getStats();
      return result;
    },

    /**
     * Record heal outcome — update Q-table and HeartBeat metrics.
     */
    recordHealOutcome(strategy, success) {
      this._ensureStarted();
      evolution.recordHealOutcome(strategy, success);
      if (success) {
        heartBeat.recordSuccess();
      } else {
        heartBeat.recordMetric('heal_failure', 2);
      }
      return { updated: true };
    },

    /**
     * Get heal statistics.
     */
    getHealStats() {
      this._ensureStarted();
      return evolution.getHealStats();
    },

    // ─── SelfVerifier (v1.0.4) ─────────────────────────────

    /**
     * Verify reasoning with 4-way check:
     * reverseConsistency, logicalChain, counterfactual, coverageCheck
     * If stampId provided, includes context from ContextPassport.
     */
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

    /**
     * Get verification statistics.
     */
    getVerificationStats() {
      this._ensureStarted();
      return selfVerifier.getStats();
    },

    /**
     * Get recent verification issues.
     */
    getRecentVerificationIssues() {
      this._ensureStarted();
      return selfVerifier.getRecentIssues();
    },

    // ─── KnowledgeGraph (v1.0.4) ───────────────────────────

    /**
     * Add a knowledge node.
     * Returns: { id, name, description, type, importance, ... }
     */
    addKnowledge(name, description, type = 'concept', importance = 0.5) {
      this._ensureStarted();
      return knowledgeGraph.addNode({ name, description, type, importance });
    },

    /**
     * Search knowledge graph by keyword.
     */
    searchKnowledge(query) {
      this._ensureStarted();
      return knowledgeGraph.search(query);
    },

    /**
     * Get connected nodes.
     */
    getConnectedKnowledge(nodeId, relation) {
      this._ensureStarted();
      return knowledgeGraph.getConnectedNodes(nodeId, relation);
    },

    /**
     * Get knowledge graph statistics.
     */
    getKnowledgeStats() {
      this._ensureStarted();
      return knowledgeGraph.getStats();
    },

    // ─── RetrievalAnchor (v1.0.4) ────────────────────────

    /**
     * Add a retrieval anchor for context-augmented reasoning.
     */
    addAnchor(content, source, relevance) {
      this._ensureStarted();
      return retrievalAnchor.addAnchor(content, source, relevance);
    },

    /**
     * Query anchors by relevance.
     */
    queryAnchors(query, options) {
      this._ensureStarted();
      return retrievalAnchor.query(query, options);
    },

    /**
     * Select best anchor for query.
     */
    selectAnchor(query) {
      this._ensureStarted();
      return retrievalAnchor.selectAnchor(query);
    },

    /**
     * Get anchor statistics.
     */
    getAnchorStats() {
      this._ensureStarted();
      return retrievalAnchor.getStats();
    },

    // ─── ContextPassport (v1.0.5) ───────────────────────────────

    /**
     * Enter a new reasoning/decision context — returns stampId.
     */
    passportEnter(meta = {}) {
      this._ensureStarted();
      return contextPassport.enter(meta);
    },

    /**
     * Record an assumption in current context.
     */
    passportAssume(text) {
      this._ensureStarted();
      contextPassport.assume(text);
    },

    /**
     * Record an alternative option that was rejected.
     */
    passportReject(option, reason) {
      this._ensureStarted();
      contextPassport.considerRejected(option, reason);
    },

    /**
     * Record the accepted option.
     */
    passportAccept(option, reason) {
      this._ensureStarted();
      contextPassport.accept(option, reason);
    },

    /**
     * Add annotation to current context.
     */
    passportAnnotate(key, value) {
      this._ensureStarted();
      contextPassport.annotate(key, value);
    },

    /**
     * Add a note to current context.
     */
    passportNote(text) {
      this._ensureStarted();
      contextPassport.note(text);
    },

    /**
     * Exit current context with outcome.
     */
    passportExit(outcome = 'success') {
      this._ensureStarted();
      return contextPassport.exit(outcome);
    },

    /**
     * Get current open context.
     */
    passportCurrent() {
      this._ensureStarted();
      return contextPassport.getCurrent();
    },

    /**
     * Get recent context stamps.
     */
    passportRecent(count = 10) {
      this._ensureStarted();
      return contextPassport.getRecent(count);
    },

    /**
     * Export context for recovery (used by heal).
     */
    passportExport(stampId) {
      this._ensureStarted();
      return contextPassport.exportForRecovery(stampId);
    },

    /**
     * Get passport summary.
     */
    getPassportStats() {
      this._ensureStarted();
      return contextPassport.getSummary();
    },

    // ─── FlowMachine (v1.0.6) ───────────────────────────────

    /**
     * Record activity and get current flow state.
     */
    flowTransition(event = 'user_input') {
      this._ensureStarted();
      return flowMachine.transition(event);
    },

    /**
     * Get flow state.
     */
    getFlowState() {
      this._ensureStarted();
      return flowMachine.getState();
    },

    /**
     * Get focus score (0-1).
     */
    getFocusScore() {
      this._ensureStarted();
      return flowMachine.getFocusScore();
    },

    /**
     * Get flow duration in ms.
     */
    getFlowDuration() {
      this._ensureStarted();
      return flowMachine.getFlowDuration();
    },

    /**
     * Get flow machine stats.
     */
    getFlowStats() {
      this._ensureStarted();
      return flowMachine.getStats();
    },

    // ─── DualProcess (v1.0.6) ───────────────────────────────

    /**
     * Get current cognition mode (system1 or system2).
     */
    getCognitionMode() {
      this._ensureStarted();
      return dualProcess.getCurrentMode();
    },

    /**
     * Get dual process stats.
     */
    getCognitionStats() {
      this._ensureStarted();
      return dualProcess.getStats();
    },

    /**
     * Force switch cognition mode.
     */
    switchCognitionMode(to) {
      this._ensureStarted();
      dualProcess.switchMode(to);
      return { mode: dualProcess.getCurrentMode() };
    },

    // ─── HeartBeat (v1.0.6) ───────────────────────────────

    /**
     * Get heartbeat/circuit breaker stats.
     */
    getHeartBeatStats() {
      this._ensureStarted();
      return heartBeat.getStats();
    },

    /**
     * Check if circuit breaker allows healing.
     */
    canHeal() {
      this._ensureStarted();
      return heartBeat.canHeal();
    },

    /**
     * Manually trip the circuit breaker.
     */
    tripCircuitBreaker(durationMs) {
      this._ensureStarted();
      heartBeat.trip(durationMs);
      return heartBeat.getStats();
    },

    // ─── GlobalWorkspace (v1.0.7) ───────────────────────────────

    /**
     * Broadcast content to the global workspace (GWT consciousness mechanism).
     * Returns true if content was broadcast.
     */
    broadcast(content, importance = 0.5, source = 'unknown') {
      this._ensureStarted();
      return globalWorkspace.process(content, importance, source);
    },

    /**
     * Get current workspace contents.
     */
    getWorkspace() {
      this._ensureStarted();
      return globalWorkspace.getWorkspace();
    },

    /**
     * Get currently attended content.
     */
    getAttention() {
      this._ensureStarted();
      return globalWorkspace.getAttention();
    },

    /**
     * Subscribe a module to workspace broadcasts.
     */
    subscribeToWorkspace(moduleName, callback) {
      this._ensureStarted();
      globalWorkspace.subscribe(moduleName, callback);
    },

    /**
     * Unsubscribe from workspace broadcasts.
     */
    unsubscribeFromWorkspace(moduleName) {
      this._ensureStarted();
      globalWorkspace.unsubscribe(moduleName);
    },

    /**
     * Get workspace history.
     */
    getWorkspaceHistory(count = 20) {
      this._ensureStarted();
      return globalWorkspace.getHistory(count);
    },

    /**
     * Get workspace stats.
     */
    getWorkspaceStats() {
      this._ensureStarted();
      return globalWorkspace.getStats();
    },

    // ─── Attention (v1.0.8) ───────────────────────────────

    /**
     * Present a stimulus to attention system — returns true if it won attention.
     */
    attend(source, content, salience = 0.5, strength = 1.0) {
      this._ensureStarted();
      return attention.present(source, content, salience, strength);
    },

    /**
     * Get currently attended content.
     */
    getAttended() {
      this._ensureStarted();
      return attention.getAttended();
    },

    /**
     * Get all competing attention streams.
     */
    getAttentionStreams() {
      this._ensureStarted();
      return attention.getStreams();
    },

    /**
     * Get attention history.
     */
    getAttentionHistory(count = 20) {
      this._ensureStarted();
      return attention.getHistory(count);
    },

    /**
     * Boost salience of an attention stream.
     */
    boostAttention(source, amount = 0.2) {
      this._ensureStarted();
      attention.boost(source, amount);
    },

    /**
     * Get attention stats.
     */
    getAttentionStats() {
      this._ensureStarted();
      return attention.getStats();
    },

    // ─── EmotionBridge (v1.0.9) ───────────────────────────────

    /**
     * Record an emotional interaction as memory.
     */
    recordEmotionInteraction(userInput, agentResponse, emotion, intensity, context) {
      this._ensureStarted();
      return emotionBridge.recordInteraction(userInput, agentResponse, emotion, intensity, context);
    },

    /**
     * Analyze emotional arc over recent history.
     */
    analyzeEmotionalArc(window = 10) {
      this._ensureStarted();
      return emotionBridge.analyzeEmotionalArc(window);
    },

    /**
     * Get response style hint based on emotional arc.
     */
    getResponseStyleHint() {
      this._ensureStarted();
      return emotionBridge.getResponseStyleHint();
    },

    /**
     * Get recent emotion history.
     */
    getRecentEmotions(limit = 5) {
      this._ensureStarted();
      return emotionBridge.getRecentEmotions(limit);
    },

    /**
     * Get emotion summary statistics.
     */
    getEmotionSummary() {
      this._ensureStarted();
      return emotionBridge.getEmotionSummary();
    },

    /**
     * Get emotion bridge stats.
     */
    getEmotionBridgeStats() {
      this._ensureStarted();
      return emotionBridge.getStats();
    },

    // ─── ReflectionEngine (v1.0.9) ───────────────────────────────

    /**
     * Generate reflections from memory entries.
     */
    reflectOnMemories(memories, currentGoal = null) {
      this._ensureStarted();
      return reflectionEngine.reflect(memories, currentGoal);
    },

    /**
     * Get actionable insights from reflections.
     */
    getActionableInsights() {
      this._ensureStarted();
      return reflectionEngine.getActionableInsights();
    },

    /**
     * Get reflection summary stats.
     */
    getReflectionStats() {
      this._ensureStarted();
      return reflectionEngine.getStats();
    },

    // ─── LogicVerifier (v1.0.9) ───────────────────────────────

    /**
     * Verify text logic with attention-style token weighting.
     */
    verifyLogic(text) {
      this._ensureStarted();
      return logicVerifier.verify(text);
    },

    /**
     * Get logic verifier stats.
     */
    getLogicVerifierStats() {
      this._ensureStarted();
      return logicVerifier.getStats();
    },

    // ─── SleepStages (v1.1.0) ───────────────────────────────

    /**
     * Simulate sleep cycles with NREM/REM stages.
     */
    simulateSleep(numCycles = 5) {
      this._ensureStarted();
      return sleepStages.simulate(numCycles);
    },

    /**
     * Get sleep stage summary.
     */
    getSleepSummary() {
      this._ensureStarted();
      return sleepStages.getSummary();
    },

    /**
     * Get all sleep epochs.
     */
    getSleepEpochs() {
      this._ensureStarted();
      return sleepStages.getEpochs();
    },

    /**
     * Get sleep stats.
     */
    getSleepStats() {
      this._ensureStarted();
      return sleepStages.getStats();
    },

    // ─── DreamWeaver (v1.1.0) ───────────────────────────────

    /**
     * Enter sleep mode and generate NREM/REM cycles.
     */
    enterSleep(uid, priors = [], emotion = 'neutral') {
      this._ensureStarted();
      return dreamWeaver.enterSleep(uid, priors, emotion);
    },

    /**
     * Generate dream content during REM phase.
     */
    generateDream(cycle, recent = [], emotionCtx = 'neutral') {
      this._ensureStarted();
      return dreamWeaver.generateDream(cycle, recent, emotionCtx);
    },

    /**
     * Get latest dream fragment.
     */
    getLatestDream() {
      this._ensureStarted();
      return dreamWeaver.getLatestDream();
    },

    /**
     * Get all dreams.
     */
    getAllDreams() {
      this._ensureStarted();
      return dreamWeaver.getAllDreams();
    },

    /**
     * Get dream report.
     */
    getDreamReport() {
      this._ensureStarted();
      return dreamWeaver.getReport();
    },

    /**
     * Get REM sleep cycles.
     */
    getRemCycles() {
      this._ensureStarted();
      return dreamWeaver.getRemCycles();
    },

    /**
     * Get dream weaver stats.
     */
    getDreamWeaverStats() {
      this._ensureStarted();
      return dreamWeaver.getStats();
    },

    /**
     * Track a dream cycle outcome for quality scoring (v1.2.0).
     * @param {Object} params - Dream outcome parameters
     * @returns {Object} Dream outcome with DQS score
     */
    trackDreamOutcome(params) {
      this._ensureStarted();
      const outcome = dreamQuality.track(params);
      return {
        ...outcome,
        quality: interpretDQS(outcome.dqs),
      };
    },

    /**
     * Get dream quality statistics (v1.2.0).
     */
    getDreamQualityStats() {
      this._ensureStarted();
      const stats = dreamQuality.getStats();
      return {
        ...stats,
        quality: interpretDQS(stats.avgDQS),
      };
    },

    // ─── Planner (v1.1.0) ───────────────────────────────

    /**
     * Generate plan steps from memories and reflection engine.
     */
    generatePlans(memories, reflectionEngine) {
      this._ensureStarted();
      return planner.generateFromMemories(memories, reflectionEngine);
    },

    /**
     * Generate plan from a specific goal.
     */
    generatePlanFromGoal(goal, memories) {
      this._ensureStarted();
      return planner.generateFromGoal(goal, memories);
    },

    /**
     * Get active (incomplete) plans.
     */
    getActivePlans() {
      this._ensureStarted();
      return planner.getActivePlans();
    },

    /**
     * Get completed plans.
     */
    getCompletedPlans(limit = 10) {
      this._ensureStarted();
      return planner.getCompletedPlans(limit);
    },

    /**
     * Mark a plan as completed.
     */
    completePlan(planId) {
      this._ensureStarted();
      return planner.complete(planId);
    },

    /**
     * Cancel/delete a plan.
     */
    cancelPlan(planId) {
      this._ensureStarted();
      return planner.cancel(planId);
    },

    /**
     * Update plan priority.
     */
    updatePlanPriority(planId, priority) {
      this._ensureStarted();
      return planner.updatePriority(planId, priority);
    },

    /**
     * Get plan summary.
     */
    getPlanSummary() {
      this._ensureStarted();
      return planner.getSummary();
    },

    /**
     * Get planner stats.
     */
    getPlannerStats() {
      this._ensureStarted();
      return planner.getStats();
    },

    // ─── ChildPsychology (v1.1.1) ───────────────────────────────

    /**
     * Get Piaget cognitive development stage for age
     */
    getPiagetStage(ageYears) {
      this._ensureStarted();
      return childPsychology.getPiagetStage(ageYears);
    },

    /**
     * Get Erikson psychosocial stage for age
     */
    getEriksonStage(ageYears) {
      this._ensureStarted();
      return childPsychology.getEriksonStage(ageYears);
    },

    /**
     * Get AI interaction guidance for cognitive stage
     */
    getChildInteractionGuidance(ageYears) {
      this._ensureStarted();
      return childPsychology.getInteractionGuidance(ageYears);
    },

    /**
     * Detect attachment style from behavioral patterns
     */
    detectAttachment(patterns) {
      this._ensureStarted();
      return childPsychology.detectAttachmentStyle(patterns);
    },

    /**
     * Get emotional milestone expectations for age range
     */
    getEmotionalMilestone(ageRange) {
      this._ensureStarted();
      return childPsychology.getEmotionalMilestone(ageRange);
    },

    // ─── MetaJudgment (v1.2.1) ───────────────────────────────

    /**
     * Perform L1/L2/L3 meta-judgment on text.
     * L1: Initial judgment at 50% threshold
     * L2: TGB (真善美) review
     * L3: Goal progress check
     */
    judge(params) {
      this._ensureStarted();
      return metaJudgment.judge(params);
    },

    /**
     * Judge a decision outcome (success/failure).
     */
    judgeOutcome(decision, success, context = {}) {
      this._ensureStarted();
      return metaJudgment.judgeOutcome(decision, success, context);
    },

    /**
     * Get recent judgment history.
     */
    getJudgmentHistory(count = 10) {
      this._ensureStarted();
      return metaJudgment.getHistory(count);
    },

    /**
     * Get meta-judgment statistics.
     */
    getJudgmentStats() {
      this._ensureStarted();
      return metaJudgment.getStats();
    },

    // ─── SelfCorrections (v1.2.2) ───────────────────────────────

    /**
     * Detect if text contains a correction signal.
     */
    isCorrection(text) {
      this._ensureStarted();
      return selfCorrections.isCorrection(text);
    },

    /**
     * Log a user correction.
     * Patterns seen 3x are promoted to memory.
     */
    logCorrection(correction, context = '', domain = 'behavior') {
      this._ensureStarted();
      return selfCorrections.logCorrection(correction, context, domain);
    },

    /**
     * Get corrections by status (new/tracking/promoted/archived).
     */
    getCorrections(status = null) {
      this._ensureStarted();
      if (status) {
        return selfCorrections.getByStatus(status);
      }
      return selfCorrections.corrections;
    },

    /**
     * Get promoted corrections (patterns learned from user).
     */
    getPromotedCorrections() {
      this._ensureStarted();
      return selfCorrections.getPromoted();
    },

    /**
     * Archive a correction.
     */
    archiveCorrection(id) {
      this._ensureStarted();
      selfCorrections.archive(id);
    },

    /**
     * Get self-corrections statistics.
     */
    getCorrectionStats() {
      this._ensureStarted();
      return selfCorrections.getStats();
    },

    /**
     * Export corrections for memory integration.
     */
    exportCorrections() {
      this._ensureStarted();
      return selfCorrections.exportForMemory();
    },

    // ─── TruthTeller (v1.2.4) ───────────────────────────────

    /**
     * Make a truth statement with confidence estimation.
     */
    sayTruth(statement, context = '') {
      this._ensureStarted();
      return truthTeller.sayTruth(statement, context);
    },

    /**
     * Admit not knowing something.
     */
    sayUnknown(question, context = '') {
      this._ensureStarted();
      return truthTeller.sayUnknown(question, context);
    },

    /**
     * Correct a user misconception.
     */
    correctUser(statement, correction, context = '') {
      this._ensureStarted();
      return truthTeller.correctUser(statement, correction, context);
    },

    /**
     * Challenge a user assumption with reasoning.
     */
    challengeAssumption(assumption, reason) {
      this._ensureStarted();
      return truthTeller.challengeAssumption(assumption, reason);
    },

    /**
     * Ask a Socratic difficult question.
     */
    askDifficultQuestion(question) {
      this._ensureStarted();
      return truthTeller.askDifficultQuestion(question);
    },

    /**
     * Assess self truthfulness.
     */
    assessSelfTruth() {
      this._ensureStarted();
      return truthTeller.assessSelfTruth();
    },

    /**
     * Get truth history.
     */
    getTruthHistory(limit = 20) {
      this._ensureStarted();
      return truthTeller.getHistory(limit);
    },

    /**
     * Get TruthTeller statistics.
     */
    getTruthTellerStats() {
      this._ensureStarted();
      return truthTeller.getStats();
    },

    // ─── Dream ─────────────────────────────────────────────

    dreamNow() {
      this._ensureStarted();
      return dream.dreamNow();
    },

    getLastDream() {
      this._ensureStarted();
      return dream.getLastDream();
    },

    // ─── MindSpace ─────────────────────────────────────────

    getMindSpace() {
      this._ensureStarted();
      memory._ensureEphemeralLoaded();
      const ephemeralEntries = Object.entries(memory._ephemeralStore).slice(0, 10);
      return {
        rules: _mindSpace.rules,
        context: _mindSpace.context,
        workingEntries: ephemeralEntries,
      };
    },

    // ─── Internal ──────────────────────────────────────────

    _ensureStarted() {
      if (!this._started) {
        throw new Error('HeartFlow not started. Call .start() first.');
      }
    },

    // ─── PsychBridge ───────────────────────────────────────

    /**
     * Bridge emotionally significant content to EPHEMERAL memory.
     * High-intensity emotions → topic preserved with extended TTL.
     * Defensive signals → stored as caution markers.
     */
    _psychBridge(input, result) {
      const { emotion, intent } = result;

      // Only bridge if emotion is high intensity
      if (emotion?.intensity !== 'high') return;

      // Extract topic words (first 3 non-stopwords)
      const stopwords = new Set([
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'you', 'he', 'she',
        'it', 'we', 'they', 'this', 'that', 'to', 'of', 'in', 'on', 'for',
        'with', 'my', 'your', 'our', 'and', 'or', 'but', '的', '了', '是',
        '我', '你', '他', '她', '它', '我们', '你们', '他们', '这个', '那个',
      ]);

      const words = input.split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z\u4e00-\u9fff]/g, '').toLowerCase())
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
          preview: input.substring(0, 100),
        }),
        TTL_4_HOURS
      );
    },
  };

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

  // Test APIs
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
