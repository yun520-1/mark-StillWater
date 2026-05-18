/**
 * mark-StillWater v1.1.0 — Test Suite
 *
 * A quiet presence with depth. Still water runs deep.
 *
 * Run: node tests/run.js
 */

const { createHeartFlow, VERSION } = require('../src/core/heartflow.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// --- Tests ---

console.log('\nmark-StillWater v1.1.0 Test Suite');
console.log('='.repeat(40));

const hf = createHeartFlow();

// Lifecycle
console.log('\n[Lifecycle]');
test('start() initializes without error', () => {
  hf.start();
  assert(hf._started === true);
});

test('healthCheck() returns correct version', () => {
  const h = hf.healthCheck();
  assertEqual(h.version, VERSION);
  assert(h.started === true);
  assert(h.uptime_ms >= 0);
});

test('stop() cleans up state', () => {
  hf.stop();
  assert(hf._started === false);
});

// Psychology
console.log('\n[Psychology]');
hf.start();

test('analyzePsychology() returns all fields', () => {
  const result = hf.analyzePsychology('I am frustrated with this bug');
  assert(result.intent !== undefined);
  assert(result.emotion !== undefined);
  assert(result.needs !== undefined);
  assert(result.defenses !== undefined);
  assert(result.confidence !== undefined);
});

test('analyzePsychology() detects frustration', () => {
  const result = hf.analyzePsychology('I am frustrated with this bug');
  assert(result.emotion.category === 'negative');
  assert(result.emotion.intensity === 'high');
});

test('classify() returns category', () => {
  const result = hf.classify('How do I fix this error?');
  assert(result.category !== undefined);
  assert(result.emotion !== undefined);
  assert(result.confidence !== undefined);
});

test('classify() detects troubleshooting', () => {
  const result = hf.classify('This bug is driving me crazy');
  assert(result.category === 'troubleshooting');
});

// Logic
console.log('\n[Logic]');
test('reason() works without options', () => {
  const result = hf.reason('Why is the server slow?');
  assert(result.chain !== undefined);
  assert(result.conclusion !== undefined);
  assert(result.confidence !== undefined);
});

test('reason() works with options', () => {
  const result = hf.reason('Which approach is better?', ['add memory', 'optimize query', 'do nothing']);
  assert(result.chain !== undefined);
  assert(result.conclusion !== undefined);
  assert(result.analysis.reasoning_type === 'evaluative');
});

test('reason() analyzes problem type', () => {
  const result = hf.reason('Why did the test fail?');
  assert(result.analysis.problem_type === 'diagnostic');
});

// Decision
console.log('\n[Decision]');
test('makeDecision() selects best option', () => {
  const result = hf.makeDecision(['ship now', 'wait for polish']);
  assert(result.decision !== null);
  assert(result.reasoning !== undefined);
  assert(result.confidence > 0);
});

test('makeDecision() evaluates consequences', () => {
  const result = hf.makeDecision(['add feature', 'fix bug']);
  assert(result.consequences !== undefined);
});

test('makeDecision() handles single option', () => {
  const result = hf.makeDecision(['only option']);
  assertEqual(result.decision, 'only option');
  assertEqual(result.confidence, 0.95);
});

test('makeDecision() handles empty options', () => {
  const result = hf.makeDecision([]);
  assertEqual(result.decision, null);
  assertEqual(result.confidence, 0);
});

// Philosophy
console.log('\n[Philosophy]');
test('reflect() handles existential question', () => {
  const result = hf.reflect('Who am I?');
  assert(result.type === 'existential');
  assert(result.response !== undefined);
});

test('reflect() handles ethical question', () => {
  const result = hf.reflect('Is this the right thing to do?');
  assert(result.type === 'ethical');
  assert(result.frameworks !== undefined);
});

test('evaluateValues() returns hierarchy', () => {
  const result = hf.evaluateValues('be honest and grow');
  assert(result.hierarchy !== undefined);
  assert(result.top_value !== undefined);
});

test('mortalityPrompt() returns reflection prompts', () => {
  const result = hf.mortalityPrompt();
  assert(result.prompt !== undefined);
  assert(result.reflections !== undefined);
  assert(Array.isArray(result.reflections));
});

// Identity
console.log('\n[Identity]');
test('getIdentity() returns rules and state', () => {
  const result = hf.getIdentity();
  assert(result.rules !== undefined);
  assert(result.state !== undefined);
  assert(result.summary !== undefined);
});

test('getIdentity() has correct rules count', () => {
  const result = hf.getIdentity();
  assert(result.summary.totalRules > 10);
});

test('checkAlignment() evaluates decisions', () => {
  const result = hf.checkAlignment('be honest');
  assert(result.aligned !== undefined);
  assert(result.conflicts !== undefined);
});

// Memory
console.log('\n[Memory]');
test('remember() stores in learned tier by default', () => {
  const result = hf.remember('test:key', 'test value');
  assertEqual(result.success, true);
  assertEqual(result.tier, 'learned');
});

test('remember() stores in core tier', () => {
  // Use unique key to avoid conflict
  const result = hf.remember('test:core_unique_key', 'core value', 'core');
  assertEqual(result.success, true);
  assertEqual(result.tier, 'core');
});

test('search() finds stored memories', () => {
  hf.remember('test:searchable', 'searchable content');
  const results = hf.search('searchable');
  assert(results.length > 0);
  assert(results.some(r => r.key === 'test:searchable'));
});

test('getMemoryStats() returns counts', () => {
  const stats = hf.getMemoryStats();
  assert(stats.core !== undefined);
  assert(stats.learned !== undefined);
  assert(stats.ephemeral !== undefined);
});

// Evolution
console.log('\n[Evolution]');
test('recordOutcome() stores success', () => {
  const result = hf.recordOutcome({
    task: 'test task',
    outcome: 'success',
    evidence: 'Completed successfully'
  });
  assertEqual(result.outcome, 'success');
  // success does NOT store a lesson (only failures do)
  assert(result.lessonStored === false);
});

test('recordOutcome() stores failure with lesson', () => {
  const result = hf.recordOutcome({
    task: 'test failure',
    outcome: 'failure',
    evidence: 'Error occurred'
  });
  assertEqual(result.outcome, 'failure');
  assert(result.reflection !== undefined);
});

test('retrieveLessons() finds lessons', () => {
  const lessons = hf.retrieveLessons('test');
  assert(Array.isArray(lessons));
});

test('getEvolutionStats() returns counts', () => {
  const stats = hf.getEvolutionStats();
  assert(stats.total !== undefined);
  assert(stats.successes !== undefined);
});

// Dream
console.log('\n[Dream]');
test('dreamNow() completes cycle', () => {
  const result = hf.dreamNow();
  assert(result.dream_complete === true);
  assert(result.consolidation !== undefined);
  assert(result.duration_ms !== undefined);
});

test('getLastDream() returns last dream', () => {
  const result = hf.getLastDream();
  assert(result.dream_complete !== undefined);
});

// Error handling
console.log('\n[Error Handling]');
hf.stop();
test('throws when not started', () => {
  let threw = false;
  try {
    hf.analyzePsychology('test');
  } catch (e) {
    threw = true;
    assert(e.message.includes('not started'));
  }
  assert(threw);
});
hf.start();

// Summary
console.log('\n' + '='.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`mark-StillWater v${VERSION} test suite complete.\n`);

hf.stop();

process.exit(failed > 0 ? 1 : 0);
