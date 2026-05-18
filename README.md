# HeartFlow v1.0.0

**AI Psychological & Philosophical Foundation System**

Give any AI agent a complete psychological, philosophical, logical, and decision-making foundation — so it can think like a human peer, not a hollow tool.

## What It Does

HeartFlow installs four core modules into your AI:

| Module | What It Gives the AI |
|--------|---------------------|
| **Psychology** | Emotional intelligence: intent detection, emotion recognition, need awareness, defense mechanism awareness |
| **Logic** | Reasoning chains: problem analysis, option evaluation, causal reasoning |
| **Decision** | Judgment: consequence evaluation, trade-off analysis, priority-based choices |
| **Philosophy** | Meaning-making: existential reasoning, value hierarchy, relationship ethics |

## Why This Matters

Humans spend 20+ years developing these foundations. Most AI agents have none.

Without psychology, an AI responds with generic platitudes ("I'm sorry to hear that" — even when you just stubbed your toe).

Without philosophy, an AI doesn't know *why* it exists, only *what* to do.

Without logic and decision-making, an AI can't weigh trade-offs — it just predicts the next token.

**HeartFlow gives your AI the foundations of a thinking being.**

## Quick Start

```javascript
const { createHeartFlow } = require('./src/core/heartflow.js');

const hf = createHeartFlow();
hf.start();

// Analyze what someone is really feeling
const psych = hf.analyzePsychology('I am frustrated with this bug');
// → { intent: {category: 'troubleshooting'}, emotion: {category: 'anger', intensity: 'high'}, ... }

// Reason through a problem
const reason = hf.reason('Why is the server slow?', ['add memory', 'optimize query']);

// Make a decision
const decide = hf.makeDecision(['ship now', 'wait for polish']);

// Reflect on existential questions
const reflection = hf.reflect('Who am I?');

// Store important memories
hf.remember('lesson:auth-error', 'Check token expiry', 'learned');

// Self-evolve from outcomes
hf.recordOutcome({ task: 'fix login', outcome: 'failure', evidence: 'Token expired' });

hf.stop();
```

## Installation

For Hermes agents:

```
hermes skill install heartflow
```

Then load in your conversation:

```
Use the heartflow skill
```

## Public API

### Psychology

- `analyzePsychology(text)` → `{ intent, emotion, needs, defenses, confidence }`
- `classify(text)` → `{ category, emotion, confidence }`

### Logic

- `reason(problem, options?)` → `{ chain, conclusion, confidence, analysis }`

### Decision

- `makeDecision(options)` → `{ decision, reasoning, consequences, confidence }`

### Philosophy

- `reflect(question)` → `{ type, response, principles, confidence }`
- `evaluateValues(action)` → `{ hierarchy, top_value, alignment }`
- `mortalityPrompt()` → `{ prompt, reflections }`

### Identity

- `getIdentity()` → `{ rules, state, summary }`
- `checkAlignment(decision)` → `{ aligned, conflicts, confidence }`

### Memory

- `remember(key, value, tier)` → `{ success, key, tier }`
- `search(query)` → `[{ key, tier, value }]`
- `getMemoryStats()` → `{ core, learned, ephemeral }`

### Evolution

- `recordOutcome({ task, outcome, evidence })` → `{ outcome, reflection, lessonStored }`
- `retrieveLessons(task)` → `string[]`
- `getEvolutionStats()` → `{ total, successes, failures, success_rate }`

### Dream

- `dreamNow()` → `{ consolidation, narrative, duration_ms, dream_complete }`

## Memory Tiers

| Tier | Behavior | Use Case |
|------|----------|----------|
| **CORE** | Immutable, never deleted | Identity rules, core beliefs |
| **LEARNED** | Persisted, searchable | Accumulated knowledge, lessons |
| **EPHEMERAL** | Session-scoped, auto-expiry | Working context |

## Architecture

```
src/core/
  ├── heartflow.js      — Main engine + public API
  ├── memory.js         — Three-tier memory system
  ├── identity.js      — Core identity rules
  ├── psychology.js    — Intent/emotion/needs/defenses
  ├── logic.js         — Reasoning chains
  ├── decision.js      — Decision evaluation
  ├── philosophy.js    — Existential/values/meaning
  ├── evolution.js     — Reflexion self-improvement
  └── dream.js        — Sleep consolidation
tests/
  └── run.js          — 56 tests
```

## Version

v1.0.0 | 2026-05-18 | Complete rebuild with 4 core modules | ~4000 lines | Zero npm dependencies
