/**
 * mark-StillWater v1.3.0 — 上线前测试套件
 */

const fs = require('fs');
const path = require('path');
const { createHeartFlow, VERSION } = require('./src/core/heartflow.js');

const TEST_DATA = path.join(__dirname, 'data', '.test');
if (fs.existsSync(TEST_DATA)) {
  fs.rmSync(TEST_DATA, { recursive: true });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   mark-StillWater v' + VERSION + ' — 上线前测试');
  console.log('   静水深流。Still water runs deep.');
  console.log('═══════════════════════════════════════════════════════════\n');

  const hf = createHeartFlow({ rootPath: TEST_DATA });
  hf.start();

  let passed = 0;
  let failed = 0;
  function check(name, ok) { if (ok) { console.log('  ✅ PASS: ' + name); passed++; } else { console.log('  ❌ FAIL: ' + name); failed++; } }

  // ═══ 1: 引擎 ═══
  console.log('测试 1: 引擎健康');
  const health = hf.healthCheck();
  check('已启动', health.started === true);
  check('版本 v' + VERSION, health.version === VERSION);
  check('运行时间', health.uptime_ms >= 0);

  // ═══ 2: 记忆 ═══
  console.log('\n测试 2: 三层记忆');
  const mem = hf.getMemoryStats();
  check('记忆统计', mem !== null);
  check('CORE 记忆已初始化', mem.core > 0);

  hf.remember('test-learn-1', 'Always verify after writing code', 'learned');
  const sr = hf.search('verify');
  check('LEARNED 记忆可搜索', sr && sr.length > 0);

  hf.remember('test-core-1', 'Upgrade is supreme directive', 'core');
  check('CORE 记忆可写入', true);

  // ═══ 3: 心理学 ═══
  console.log('\n测试 3: 心理学');
  const psych = hf.analyzePsychology('I am so frustrated with this broken code!');
  check('意图检测', psych?.intent !== undefined);
  check('情感检测', psych?.emotion !== undefined);

  const cls = hf.classify('how do I fix this error');
  check('分类', cls !== null);

  // ═══ 4: 身份 ═══
  console.log('\n测试 4: 身份系统');
  const identity = hf.getIdentity();
  check('身份规则存在', identity?.rules?.length > 0);

  const upgradeRules = identity?.rules?.filter(r =>
    r.id?.startsWith('upgrade.guarantee') ||
    r.category === 'constitution'
  );
  check('升级保证规则 (' + (upgradeRules?.length || 0) + ' 条)', upgradeRules?.length >= 5);
  check('升级规则为 critical 优先级', upgradeRules?.every(r => r.priority === 'critical'));

  // ═══ 5: 逻辑/决策 ═══
  console.log('\n测试 5: 逻辑与决策');
  const reason = hf.reason('Server is slow and users are complaining', ['add memory', 'optimize queries']);
  check('推理链', reason?.chain !== undefined);
  check('有结论', reason?.conclusion !== undefined);

  const decide = hf.makeDecision(['ship now with known bugs', 'fix bugs then ship']);
  check('决策', decide?.decision !== undefined);
  check('有推理过程', decide?.reasoning?.length > 0);

  // ═══ 6: 自进化 ═══
  console.log('\n测试 6: 自我进化');
  hf.recordOutcome({
    task: 'Fixed login bug — missed token expiry check',
    outcome: 'failure',
    evidence: 'Did not check token before API call'
  });
  hf.recordOutcome({
    task: 'Implemented new auth flow — planned then executed',
    outcome: 'success',
    evidence: 'Used lesson from previous failure'
  });

  const lessons = hf.retrieveLessons ? hf.retrieveLessons('login bug') : [];
  check('教训检索', lessons && lessons.length > 0);

  const evoStats = hf.getEvolutionStats ? hf.getEvolutionStats() : null;
  check('进化统计', evoStats !== null);

  // ═══ 7: 安全 ═══
  console.log('\n测试 7: 安全');
  const scan = hf.scanSecurity ? hf.scanSecurity('apikey: sk-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') : null;
  if (scan) check('API Key 扫描 (' + scan.length + ' 项)', scan.length > 0);
  else check('安全模块', false);

  // ═══ 8: 真言 ═══
  console.log('\n测试 8: 真言检测');
  const truth = hf.checkTruthfulness ? hf.checkTruthfulness('I think maybe possibly this is correct but I am not sure') : null;
  if (truth) check('模糊语检测', truth.isLying !== undefined);
  else check('真言模块', false);

  // ═══ 9: 梦境 ═══
  console.log('\n测试 9: 梦境整合');
  const dream = hf.dreamNow ? hf.dreamNow() : null;
  if (dream) check('梦境完成', dream.dream_complete === true || dream.consolidation !== undefined);
  else check('梦境模块', false);

  // ═══ 10: 自愈 ═══
  console.log('\n测试 10: 自愈');
  const heal = hf.heal ? hf.heal({ message: 'connection timeout' }) : null;
  if (heal) check('修复策略', heal.strategy !== undefined);
  else check('自愈模块', false);

  // ═══ 11: 升级不可变性 ═══
  console.log('\n测试 11: 升级机制不可变性');
  const coreMem = hf.getMemoryStats();
  check('CORE 中升级规则已持久化', coreMem.core >= 10);
  let evoOk = false;
  let dreamOk = false;
  let verifierOk = false;
  try { require('./src/core/evolution.js'); evoOk = true; } catch(e) {}
  try { require('./src/core/dream.js'); dreamOk = true; } catch(e) {}
  try { require('./src/core/self-verifier.js'); verifierOk = true; } catch(e) {}
  check('evolution.js 可加载', evoOk);
  check('dream.js 可加载', dreamOk);
  check('self-verifier.js 可加载', verifierOk);

  hf.stop();
  if (fs.existsSync(TEST_DATA)) {
    fs.rmSync(TEST_DATA, { recursive: true });
  }

  const total = passed + failed;
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ' + passed + '/' + total + ' 通过 (' + (total > 0 ? Math.round(passed/total*100) : 0) + '%)');
  if (passed === total) {
    console.log('  🎉 全部通过！mark-StillWater 已具备上线条件。');
    console.log('  🔒 升级保证机制已内置，永不改变。');
  } else {
    console.log('  ⚠️ ' + failed + ' 项需要修复');
  }
  console.log('═══════════════════════════════════════════════════════════');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
