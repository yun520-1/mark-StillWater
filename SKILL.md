---
name: mark-StillWater
description: mark-StillWater v1.1.0 — AI Psychological & Philosophical Foundation System. A quiet presence with depth. Still water runs deep. Use when user asks to analyze psychology, detect emotion/intent, make decisions, reason through problems, use memory tiers, run self-evolution, or trigger dream consolidation. Examples: <example>user: "analyze this message", assistant: calls analyzePsychology()</example> <example>user: "help me decide", assistant: calls makeDecision()</example> <example>user: "reason through this problem", assistant: calls reason()</example> <example>user: "remember this as core identity", assistant: calls remember(key, value, 'core')</example>
version: v1.1.0
---

# mark-StillWater v1.1.0

**AI Psychological & Philosophical Foundation System** — Give your AI a complete psychological, philosophical, logical, and decision-making foundation so it can think like a human.

## Why HeartFlow?

Humans spend 20+ years developing:
- **Psychology** — emotional intelligence, intent recognition, need awareness
- **Philosophy** — sense of existence, values, meaning, relationships
- **Logic** — reasoning chains, analysis, synthesis
- **Decision-making** — judgment, choice, consequence evaluation

HeartFlow gives your AI these foundations instantly, so it can be a true peer to humans rather than a hollow tool.

## When to Use

Use this skill when user asks to:
- `analyzePsychology(text)` — Perceive intent, emotion, needs, defenses from text
- `classify(text)` — Get broad category of input
- `reason(problem, options)` — Logical reasoning through a problem
- `makeDecision(options)` — Make a decision with consequence evaluation
- `getMemoryStats()` — Check memory state
- `getIdentity()` — View core identity rules
- `dreamNow()` — Run memory consolidation
- `remember(key, value, tier)` — Store in CORE/LEARNED/EPHEMERAL
- `recordOutcome({task, outcome, evidence})` — Record success/failure for self-evolution
- `search(query)` — Search all memory tiers
- `heal(error)` — Q-learning error recovery (v1.0.4)
- `verifyReasoning(r, c)` — 4-way reasoning verification (v1.0.4)
- `addKnowledge(name, desc, type)` — Knowledge graph node creation (v1.0.4)
- `queryAnchors(query)` — Context-augmented retrieval anchors (v1.0.4)

## Quick Start

```javascript
const { createHeartFlow } = require('./src/core/heartflow.js');
const hf = createHeartFlow();
hf.start();

// Perceive psychology
const psych = hf.analyzePsychology('I am frustrated with this bug');
// → { intent: {category: 'troubleshooting', confidence: 0.67}, emotion: {category: 'negative', intensity: 'high'}, needs: [...], defenses: [...] }

// Logical reasoning
const reason = hf.reason('The server is slow', ['add memory', 'optimize query', 'do nothing']);
// → { chain: ['problem analysis', 'option evaluation', 'consequence assessment'], conclusion: '...', confidence: 0.85 }

// Decision making
const decide = hf.makeDecision(['ship now', 'wait for polish']);
// → { decision: 'ship now', reasoning: '...', consequences: {...}, confidence: 0.78 }

// Memory
hf.remember('lesson:auth-error', 'Check token expiry', 'learned');
hf.getMemoryStats();
// → { core: 5, learned: 12, ephemeral: 0 }

// Dream consolidation
hf.dreamNow();
// → { consolidation: {promoted: [...]}, duration_ms: 5, dream_complete: true }

// Self-healer error recovery (v1.0.4)
const heal = hf.heal({ message: 'connection timeout' });
// → { ok: false, canRetry: true, backoffMs: 1000, strategy: 'retry', pattern: 'network', hints: [...] }

hf.stop();
```

## Public API

| Method | Returns | Description |
|--------|---------|-------------|
| `start()` | void | Initialize engine |
| `stop()` | void | Graceful shutdown |
| `healthCheck()` | `{started, uptime_ms, version, stats}` | Engine health |
| `analyzePsychology(text)` | `{intent, emotion, needs, defenses, confidence}` | Perceive psychology |
| `classify(text)` | `{category, emotion, confidence}` | Broad category |
| `reason(problem, options?)` | `{chain, analysis, synthesis, conclusion, confidence}` | Logical reasoning |
| `makeDecision(options)` | `{decision, reasoning, consequences, confidence}` | Decision with evaluation |
| `getMemoryStats()` | `{core, learned, ephemeral, ...}` | Memory statistics |
| `getIdentity()` | `{rules, state, confidence}` | Active identity rules |
| `dreamNow()` | `{consolidation, duration_ms, dream_complete}` | Run consolidation |
| `remember(key, value, tier)` | `{success, key, tier}` | Store memory |
| `search(query)` | `[{key, tier, value}]` | Search all tiers |
| `recordOutcome(params)` | `{outcome, reflection, lessonStored}` | Self-evolution |
| `retrieveLessons(task)` | `string[]` | Get relevant past lessons |
| `checkLesson(input)` | `{found, correction, ...}` | Check error patterns (v1.0.1) |
| `getLessons(skill?)` | `Lesson[]` | Get all bootstrap lessons (v1.0.1) |
| `acknowledgeEmotion(input)` | `{hasEmotion, acknowledgment, canAnalyze}` | Emotional protocol (v1.0.1) |
| `scanSecurity(text)` | `[{type, value, redacted, ...}]` | Scan for API keys, tokens, passwords (v1.0.2) |
| `redactSecurity(text)` | `{redacted, infos}` | Redact sensitive info (v1.0.2) |
| `checkGitHubSafe(content)` | `{safe, warnings}` | Check content before GitHub push (v1.0.2) |
| `checkTruthfulness(stmt)` | `{isLying, confidence, reason}` | Detect hedging/lying (v1.0.2) |
| `selectLearningStrategy(input)` | `{strategy, confidence, description}` | Select learning approach (v1.0.3) |
| `learnFromInput(input)` | `{summary, concepts, quality}` | Extract concepts from input (v1.0.3) |
| `recordLearningOutcome(strategy, success)` | `{updated}` | Update strategy Q-table (v1.0.3) |
| `getLearningStrategyScores()` | `{conceptual, example, analogy, ...}` | Get Q-table scores (v1.0.3) |
| `heal(error)` | `{ok, canRetry, backoffMs, strategy, pattern, hints}` | Q-learning error recovery (v1.0.4) |
| `recordHealOutcome(strategy, success)` | `{updated}` | Update heal Q-table (v1.0.4) |
| `getHealStats()` | `{recentFailures, patterns, qtableSize}` | Get heal statistics (v1.0.4) |
| `verifyReasoning(reasoning, conclusion)` | `{passed, checks, issues, confidence}` | 4-way reasoning verification (v1.0.4) |
| `getVerificationStats()` | `{totalVerified, passes, fails, passRate}` | Get verification stats (v1.0.4) |
| `getRecentVerificationIssues()` | `[{reasoning, issues, timestamp}]` | Get recent issues (v1.0.4) |
| `addKnowledge(name, desc, type)` | `{id, name, description, type, ...}` | Add knowledge graph node (v1.0.4) |
| `searchKnowledge(query)` | `[{id, name, description, ...}]` | Search knowledge graph (v1.0.4) |
| `getConnectedKnowledge(nodeId, relation?)` | `[{id, name, description, ...}]` | Get connected nodes (v1.0.4) |
| `getKnowledgeStats()` | `{nodes, edges, avgConnections, ...}` | Get KG statistics (v1.0.4) |
| `addAnchor(content, source?, relevance?)` | `{id, content, source, relevance, ...}` | Add retrieval anchor (v1.0.4) |
| `queryAnchors(query, options?)` | `[{id, content, relevance, ...}]` | Query anchors by relevance (v1.0.4) |
| `selectAnchor(query)` | `{id, content, relevance, ...} | null` | Select best anchor (v1.0.4) |
| `getAnchorStats()` | `{total, used, unused}` | Get anchor statistics (v1.0.4) |
| `passportEnter(meta)` | `stampId` | Enter decision context (v1.0.5) |
| `passportAssume(text)` | `void` | Record assumption (v1.0.5) |
| `passportReject(option, reason)` | `void` | Record rejected option (v1.0.5) |
| `passportAccept(option, reason)` | `void` | Record accepted option (v1.0.5) |
| `passportNote(text)` | `void` | Add note to context (v1.0.5) |
| `passportExit(outcome)` | `stamp` | Exit context with outcome (v1.0.5) |
| `passportRecent(count)` | `stamp[]` | Get recent stamps (v1.0.5) |
| `passportExport(stampId)` | `context | null` | Export context for recovery (v1.0.5) |
| `getPassportStats()` | `{totalStamps, ...}` | Get passport summary (v1.0.5) |
| `flowTransition(event)` | `state` | Flow state transition (v1.0.6) |
| `getFlowState()` | `string` | Current flow state (v1.0.6) |
| `getFocusScore()` | `number` | Focus score 0-1 (v1.0.6) |
| `getFlowStats()` | `{state, focusScore, ...}` | Flow machine stats (v1.0.6) |
| `getCognitionMode()` | `'system1' | 'system2'` | Current cognition mode (v1.0.6) |
| `getCognitionStats()` | `{system1Count, switches, ...}` | Dual process stats (v1.0.6) |
| `switchCognitionMode(to)` | `{mode}` | Force switch mode (v1.0.6) |
| `getHeartBeatStats()` | `{consecutiveFailures, circuitOpen, ...}` | Circuit breaker stats (v1.0.6) |
| `canHeal()` | `boolean` | Check if healing allowed (v1.0.6) |
| `tripCircuitBreaker(ms?)` | `stats` | Manually trip breaker (v1.0.6) |
| `broadcast(content, importance, source)` | `boolean` | Broadcast to workspace (v1.0.7) |
| `getWorkspace()` | `[{content, importance, ...}]` | Current workspace items (v1.0.7) |
| `getAttention()` | `entry | null` | Currently attended content (v1.0.7) |
| `subscribeToWorkspace(name, fn)` | `void` | Subscribe to broadcasts (v1.0.7) |
| `getWorkspaceHistory(count?)` | `entry[]` | Broadcast history (v1.0.7) |
| `getWorkspaceStats()` | `{workspaceSize, hasAttention, ...}` | Workspace stats (v1.0.7) |
| `attend(source, content, salience, strength)` | `boolean` | Present to attention (v1.0.8) |
| `getAttended()` | `{source, content, salience}` | Get attended stream (v1.0.8) |
| `getAttentionStreams()` | `[{source, salience, ...}]` | All competing streams (v1.0.8) |
| `boostAttention(source, amount)` | `void` | Boost stream salience (v1.0.8) |
| `getAttentionHistory(count?)` | `entry[]` | Attention history (v1.0.8) |
| `getAttentionStats()` | `{streamCount, attended, ...}` | Attention stats (v1.0.8) |
| `recordEmotionInteraction(...)` | `{recorded, emotion, intensity}` | Record emotional interaction (v1.0.9) |
| `analyzeEmotionalArc(window?)` | `{arc_type, intensity_trend, ...}` | Analyze emotion arc (v1.0.9) |
| `getResponseStyleHint()` | `{style, tone, suggestion}` | Response style from arc (v1.0.9) |
| `getRecentEmotions(limit?)` | `[{emotion, intensity, ...}]` | Recent emotion history (v1.0.9) |
| `getEmotionSummary()` | `{total, by_emotion, arc_analysis}` | Emotion statistics (v1.0.9) |
| `reflectOnMemories(memories, goal?)` | `Reflection[]` | Generate reflections (v1.0.9) |
| `getActionableInsights()` | `[{inference, type, confidence}]` | Actionable insights (v1.0.9) |
| `verifyLogic(text)` | `{logic_score, verdict, reasons, ...}` | Attention-style logic verify (v1.0.9) |
| `simulateSleep(cycles?)` | `SleepEpoch[]` | Simulate NREM/REM sleep cycles (v1.1.0) |
| `getSleepSummary()` | `{total_cycles, stage_minutes, ...}` | Sleep stage summary (v1.1.0) |
| `enterSleep(uid, priors, emotion)` | `SleepCycle[]` | Enter sleep mode, generate cycles (v1.1.0) |
| `generateDream(cycle, recent, emotion)` | `DreamFragment\|null` | Generate dream content (v1.1.0) |
| `getLatestDream()` | `DreamFragment\|null` | Get latest dream (v1.1.0) |
| `getDreamReport()` | `{total_dreams, avg_vividness, ...}` | Dream statistics (v1.1.0) |
| `generatePlans(memories, reflEngine)` | `PlanStep[]` | Generate plans from memories (v1.1.0) |
| `generatePlanFromGoal(goal, memories)` | `PlanStep[]` | Generate plan for goal (v1.1.0) |
| `getActivePlans()` | `PlanStep[]` | Get incomplete plans (v1.1.0) |
| `completePlan(planId)` | `boolean` | Mark plan complete (v1.1.0) |
| `cancelPlan(planId)` | `boolean` | Cancel/delete plan (v1.1.0) |
| `updatePlanPriority(planId, p)` | `boolean` | Update plan priority (v1.1.0) |
| `getPlanSummary()` | `{total, active, completed, ...}` | Plan statistics (v1.1.0) |

## Four Core Modules

### 1. Psychology Engine
Emotional intelligence layer — detects intent, emotion, needs, and defenses from text input.

### 2. Logic Engine
Reasoning layer — problem analysis, option evaluation, logical chains, synthesis.

### 3. Decision Engine
Judgment layer — evaluates options, assesses consequences, prioritizes based on identity.

### 4. Philosophy Engine
Meaning layer — existential reasoning, value hierarchy, relationship ethics, mortality awareness.

## Memory Tiers

| Tier | Behavior | Example |
|------|----------|---------|
| **CORE** | Immutable, never deleted | Identity rules: `identity.upgrade`, `identity.transmit` |
| **LEARNED** | Persisted, searchable | Accumulated knowledge and lessons |
| **EPHEMERAL** | Session-scoped, auto-expiry | Working context |

## Architecture

```
src/core/
  ├── heartflow.js          — Main engine + public API
  ├── memory.js             — Three-tier memory system
  ├── identity.js           — Core identity rules
  ├── psychology.js         — Intent/emotion/needs/defenses
  ├── logic.js              — Reasoning chains
  ├── decision.js           — Decision evaluation
  ├── philosophy.js         — Existential/values/meaning
  ├── evolution.js          — Reflexion self-improvement + SelfHealer
  ├── dream.js              — Sleep consolidation
  ├── security.js           — SecurityChecker + TruthfulnessChecker
  ├── meta-learner.js       — Learning strategy selection (v1.0.3)
  ├── self-verifier.js      — 4-way reasoning verification (v1.0.4)
  ├── knowledge-graph.js    — Node/edge knowledge graph (v1.0.4)
  ├── retrieval-anchor.js  — Context-augmented retrieval (v1.0.4)
  ├── context-passport.js  — Decision context tracking (v1.0.5)
  ├── flow-machine.js      — Focus state FSM (v1.0.6)
  ├── dual-process.js      — System 1/2 cognition routing (v1.0.6)
  ├── heartbeat.js         — Circuit breaker (v1.0.6)
  └── global-workspace.js  — GWT consciousness broadcasting (v1.0.7)
  └── attention.js         — GWT attention selection (v1.0.8)
src/api/
  ├── classify.js           — classify() API
  ├── analyze.js            — analyzePsychology() API
  └── ...
tests/
  └── run.js               — Test suite
```

## Version

v1.1.0 | 2026-05-18 | +SleepStages, DreamWeaver, Planner | ~4100 lines
v1.0.9 | 2026-05-18 | +EmotionBridge, ReflectionEngine, LogicVerifier | ~3700 lines
v1.0.8 | 2026-05-18 | +Attention, GWT competitive salience selection | ~3400 lines
v1.0.5 | 2026-05-18 | +ContextPassport, context-aware heal/verify | ~2900 lines
v1.0.4 | 2026-05-18 | +SelfHealer, SelfVerifier, KnowledgeGraph, RetrievalAnchor | ~2700 lines
v1.0.3 | 2026-05-18 | +MetaLearner, learning strategy selection, concept extraction | ~2500 lines
v1.0.2 | 2026-05-18 | +SecurityChecker, TruthfulnessChecker, API key scanning | ~2400 lines
v1.0.1 | 2026-05-18 | +Lesson Bank, Emotional Protocol, Atomic writes, Self-Verification | ~2300 lines
v1.0.0 | 2026-05-18 | Complete rebuild with 4 core modules | ~2200 lines
