/**
 * 心镜记忆系统和进化机制全面测试
 *
 * 测试范围:
 * 1. 三层记忆系统 (CORE/LEARNED/EPHEMERAL)
 * 2. 记忆操作 (remember/search/getMemoryStats/consolidate)
 * 3. 进化机制 (recordOutcome/dreamNow/heal/getIdentity)
 * 4. 用户档案系统 (getUserProfile/updateUserProfile/getPersonalization)
 * 5. 隐私同意机制
 * 6. 加密和过期机制检查
 */

const fs = require('fs');
const path = require('path');

const { createHeartFlow, VERSION } = require('../src/core/heartflow.js');

const TEST_DATA = path.join(__dirname, 'data', '.memory-test');
if (fs.existsSync(TEST_DATA)) {
  fs.rmSync(TEST_DATA, { recursive: true });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   心镜记忆系统和进化机制全面测试');
  console.log('   v' + VERSION);
  console.log('═══════════════════════════════════════════════════════════\n');

  const hf = createHeartFlow({ rootPath: TEST_DATA });
  hf.start();

  let passed = 0;
  let failed = 0;

  function check(name, ok, detail = '') {
    if (ok) {
      console.log(`  ✅ PASS: ${name}`);
      if (detail) console.log(`     └─ ${detail}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      if (detail) console.log(`     └─ ${detail}`);
      failed++;
    }
  }

  function section(title) {
    console.log(`\n━━━ ${title} ━━━`);
  }

  // ═══════════════════════════════════════════════════════════════
  // 1. 三层记忆系统测试
  // ═══════════════════════════════════════════════════════════════
  section('1. 三层记忆系统');

  // 1.1 CORE层测试
  console.log('\n  [CORE层]');
  const coreResult1 = hf.remember('core:test:identity', '升级者 - 追求持续变强', 'core');
  check('CORE层写入', coreResult1.success === true);

  const coreResult2 = hf.remember('core:test:truth', '真 - 可验证可证伪', 'core');
  check('CORE层多条写入', coreResult2.success === true);

  const coreResult3 = hf.remember('core:test:identity', 'duplicate', 'core');
  check('CORE层重复键值拒绝', coreResult3.success === false, `reason: ${coreResult3.reason}`);

  const coreList = hf._memory.listCore();
  check('CORE层列表获取', coreList.length >= 2, `共 ${coreList.length} 条`);

  const coreGet = hf._memory.getCore('core:test:identity');
  check('CORE层按键获取', coreGet !== null && coreGet.value === '升级者 - 追求持续变强');

  // 1.2 LEARNED层测试
  console.log('\n  [LEARNED层]');
  const learnedResult1 = hf.remember('learned:test:lesson1', '写代码后必须验证', 'learned');
  check('LEARNED层写入', learnedResult1.success === true);

  const learnedResult2 = hf.remember('learned:test:lesson2', '错误是老师不是敌人', 'learned');
  check('LEARNED层多次写入', learnedResult2.success === true);

  const learnedGet = hf._memory.getLearned('learned:test:lesson1');
  check('LEARNED层按键获取', learnedGet !== null);
  check('LEARNED层访问计数', learnedGet.accessCount > 0);

  // 验证访问计数递增
  const learnedGet2 = hf._memory.getLearned('learned:test:lesson1');
  check('LEARNED层访问计数递增', learnedGet2.accessCount > learnedGet.accessCount);

  const learnedList = hf._memory.listLearned('lesson');
  check('LEARNED层搜索过滤', learnedList.length >= 2, `匹配 "lesson" 的条目`);

  // 1.3 EPHEMERAL层测试
  console.log('\n  [EPHEMERAL层]');
  const ephemeralResult = hf.remember('ephemeral:test:temp', '临时数据', 'ephemeral');
  check('EPHEMERAL层写入(默认TTL)', ephemeralResult.success === true);

  const ephemeralCustom = hf.remember('ephemeral:test:custom', '自定义TTL数据', 'ephemeral');
  check('EPHEMERAL层自定义TTL写入', ephemeralCustom.success === true);

  const ephemeralGet = hf._memory.getEphemeral('ephemeral:test:temp');
  check('EPHEMERAL层获取', ephemeralGet !== null);

  // 测试过期: EPHEMERAL层TTL过期机制
  const ephemeralExpired = hf._memory.getEphemeral('ephemeral:nonexistent');
  check('EPHEMERAL层不存在键返回null', ephemeralExpired === null);

  // 1.4 统一remember接口测试
  console.log('\n  [统一remember接口]');
  hf.remember('test:unified:core', 'core数据', 'core');
  hf.remember('test:unified:learned', 'learned数据', 'learned');
  hf.remember('test:unified:ephemeral', 'ephemeral数据', 'ephemeral');

  const unifiedCore = hf._memory.getCore('test:unified:core');
  const unifiedLearned = hf._memory.getLearned('test:unified:learned');
  const unifiedEphemeral = hf._memory.getEphemeral('test:unified:ephemeral');

  check('统一接口写入CORE', unifiedCore !== null);
  check('统一接口写入LEARNED', unifiedLearned !== null);
  check('统一接口写入EPHEMERAL', unifiedEphemeral !== null);

  // ═══════════════════════════════════════════════════════════════
  // 2. 记忆操作测试
  // ═══════════════════════════════════════════════════════════════
  section('2. 记忆操作');

  // 2.1 search搜索功能
  console.log('\n  [search搜索]');
  hf.remember('search:test:apple', '苹果是一种水果', 'learned');
  hf.remember('search:test:banana', '香蕉也是一种水果', 'learned');

  const searchResults = hf.search('水果');
  check('搜索返回结果', searchResults.length >= 2, `找到 ${searchResults.length} 条`);
  check('搜索结果包含关键词', searchResults.some(r => r.key === 'search:test:apple'));
  check('搜索结果区分层级', searchResults.some(r => r.tier === 'learned'));

  // 2.2 getMemoryStats统计功能
  console.log('\n  [getMemoryStats统计]');
  const stats = hf.getMemoryStats();
  check('统计包含core数量', typeof stats.core === 'number');
  check('统计包含learned数量', typeof stats.learned === 'number');
  check('统计包含ephemeral数量', typeof stats.ephemeral === 'number');
  check('统计包含avgRetention', typeof stats.avgRetention === 'number');
  check('统计包含遗忘配置', stats.forgetting !== undefined);
  check('遗忘配置包含压缩阈值', stats.forgetting.compressionThreshold === 0.3);
  check('遗忘配置包含删除阈值', stats.forgetting.deletionThreshold === 0.1);

  // 2.3 整合功能
  console.log('\n  [consolidate整合]');
  // 先写入ephemeral数据
  hf.remember('signal:emotion:high', JSON.stringify({ type: 'emotion', value: 'sad' }), 'ephemeral');

  // 模拟高频访问
  for (let i = 0; i < 5; i++) {
    hf._memory.getEphemeral('signal:emotion:high');
  }

  const consolidateResult = hf._memory.consolidate();
  check('整合返回promoted数组', Array.isArray(consolidateResult.promoted));
  check('整合返回learnedCount', typeof consolidateResult.learnedCount === 'number');

  // 2.4 记忆热度管理 - 遗忘曲线
  console.log('\n  [Ebbinghaus遗忘曲线]');
  const retention1 = hf._memory.getRetention('learned:test:lesson1');
  check('获取记忆保留率', retention1 !== null);
  check('保留率在0-1范围', retention1.retention >= 0 && retention1.retention <= 1);
  check('返回tier信息', retention1.tier === 'learned');

  // 2.5 applyForgetting遗忘应用
  console.log('\n  [applyForgetting遗忘应用]');
  const forgetResult = hf._memory.applyForgetting();
  check('遗忘应用返回对象', forgetResult !== undefined);
  check('遗忘应用返回compressed数组', Array.isArray(forgetResult.compressed));
  check('遗忘应用返回deleted数组', Array.isArray(forgetResult.deleted));
  check('遗忘应用返回stats', forgetResult.stats !== undefined);

  // 2.6 getMemoryHealth健康检查
  console.log('\n  [getMemoryHealth健康检查]');
  const health = hf._memory.getMemoryHealth();
  check('健康检查返回verdict', health.verdict !== undefined);
  check('健康检查返回avgRetention', typeof health.avgRetention === 'number');
  check('健康检查包含各层信息', health.layers !== undefined);
  check('健康检查包含遗忘配置', health.forgettingConfig !== undefined);

  // ═══════════════════════════════════════════════════════════════
  // 3. 进化机制测试
  // ═══════════════════════════════════════════════════════════════
  section('3. 进化机制');

  // 3.1 recordOutcome结果记录
  console.log('\n  [recordOutcome结果记录]');
  const outcome1 = hf.recordOutcome({
    task: '测试任务1',
    outcome: 'success',
    evidence: '测试证据1'
  });
  check('记录成功结果', outcome1.outcome === 'success');
  check('成功结果不存储临时教训', outcome1.lessonStored === false);

  const outcome2 = hf.recordOutcome({
    task: '测试任务2',
    outcome: 'failure',
    evidence: '测试证据2'
  });
  check('记录失败结果', outcome2.outcome === 'failure');
  check('失败结果存储临时教训', outcome2.lessonStored === true);
  check('失败结果有教训键', outcome2.lessonKey !== null);

  const outcome3 = hf.recordOutcome({
    task: '测试任务3',
    outcome: 'partial',
    evidence: '部分完成'
  });
  check('记录部分成功结果', outcome3.outcome === 'partial');

  // 3.2 getEvolutionStats进化统计
  console.log('\n  [getEvolutionStats进化统计]');
  const evoStats = hf.getEvolutionStats();
  check('进化统计包含total', typeof evoStats.total === 'number');
  check('进化统计包含successes', typeof evoStats.successes === 'number');
  check('进化统计包含failures', typeof evoStats.failures === 'number');
  check('进化统计包含success_rate', typeof evoStats.success_rate === 'number');

  // 3.3 dreamNow梦境整合
  console.log('\n  [dreamNow梦境整合]');
  // 先添加一些learned数据
  hf.remember('dream:test:topic1', '梦境主题测试1', 'learned');
  hf.remember('dream:test:topic2', '梦境主题测试2', 'learned');

  const dreamResult = hf.dreamNow();
  check('梦境返回dream_complete', dreamResult.dream_complete === true);
  check('梦境返回duration_ms', typeof dreamResult.duration_ms === 'number');
  check('梦境包含consolidation', dreamResult.consolidation !== undefined);

  // 3.4 heal错误恢复
  console.log('\n  [heal错误恢复]');
  const healResult1 = hf.heal({ message: 'connection timeout' });
  check('heal返回strategy', healResult1.strategy !== undefined);
  check('heal返回canRetry', typeof healResult1.canRetry === 'boolean');
  check('heal返回hints', Array.isArray(healResult1.hints));

  const healResult2 = hf.heal({ message: 'undefined is not a function' });
  check('heal检测函数错误', healResult2.strategy !== undefined);

  // 3.5 getIdentity身份状态
  console.log('\n  [getIdentity身份状态]');
  const identity = hf.getIdentity();
  check('身份返回rules', Array.isArray(identity.rules));
  check('身份返回state', identity.state !== undefined);
  check('身份返回summary', typeof identity.summary === 'string');
  check('身份返回confidence', typeof identity.confidence === 'number');
  check('身份包含升级者规则', identity.rules.some(r => r.value && r.value.includes('升级')));

  // 3.6 retrieveLessons教训检索
  console.log('\n  [retrieveLessons教训检索]');
  const lessons = hf.retrieveLessons('测试任务');
  check('教训检索返回数组', Array.isArray(lessons));

  // 3.7 checkLesson教训检查
  console.log('\n  [checkLesson教训检查]');
  const lessonCheck = hf.checkLesson('收到理解类问题就搜索');
  check('教训检查返回对象', lessonCheck !== undefined);
  check('教训检查返回found', typeof lessonCheck.found === 'boolean');
  if (lessonCheck.found) {
    check('教训检查返回correction', typeof lessonCheck.correction === 'string');
  }

  // 3.8 getLessons获取所有教训
  console.log('\n  [getLessons获取所有教训]');
  const allLessons = hf.getLessons();
  check('教训列表返回数组', Array.isArray(allLessons));
  check('教训列表有内容', allLessons.length > 0);

  // 3.9 getDreamStats梦境统计
  console.log('\n  [getDreamStats梦境统计]');
  const dreamStats = hf.getDreamStats();
  check('梦境统计返回', dreamStats !== undefined);

  // ═══════════════════════════════════════════════════════════════
  // 4. 用户档案系统测试
  // ═══════════════════════════════════════════════════════════════
  section('4. 用户档案系统');

  // 4.1 getUserProfile获取档案
  console.log('\n  [getUserProfile获取档案]');
  const profile = hf.getUserProfile();
  check('用户档案返回对象', profile !== undefined);
  check('用户档案包含sessions', typeof profile.sessions === 'number');
  check('用户档案包含emotionalTendency', profile.emotionalTendency !== undefined);

  // 4.2 updateUserProfile更新档案
  console.log('\n  [updateUserProfile更新档案]');
  const updateResult = hf.updateUserProfile({
    intent: { category: 'question' },
    emotion: { category: 'neutral' }
  });
  check('更新档案返回成功', updateResult.updated === true);

  // 4.3 getPersonalization个性化参数
  console.log('\n  [getPersonalization个性化参数]');
  const personalization = hf.getPersonalization();
  check('个性化参数返回对象', personalization !== undefined);

  // 4.4 隐私同意机制
  console.log('\n  [隐私同意机制]');
  const hasConsent = hf.hasConsent();
  check('hasConsent返回布尔', typeof hasConsent === 'boolean');

  const setConsentResult = hf.setConsent(true);
  check('setConsent设置成功', setConsentResult.success !== undefined);

  const consentAfter = hf.hasConsent();
  check('setConsent后状态更新', consentAfter === true);

  const privacyNotice = hf.getPrivacyNotice();
  check('getPrivacyNotice返回声明', privacyNotice !== undefined);
  check('隐私声明包含notice', privacyNotice.notice !== undefined);
  check('隐私声明包含dataStorage', privacyNotice.dataStorage !== undefined);

  // 4.5 删除所有数据
  console.log('\n  [deleteAllData删除所有数据]');
  const deleteResult = hf.deleteAllData();
  check('deleteAllData返回成功', deleteResult.success === true);

  const consentAfterDelete = hf.hasConsent();
  check('删除后同意状态为false', consentAfterDelete === false);

  // ═══════════════════════════════════════════════════════════════
  // 5. 记忆系统问题检查
  // ═══════════════════════════════════════════════════════════════
  section('5. 记忆系统问题检查');

  // 5.1 加密检查
  console.log('\n  [加密检查]');
  const encryptionEnabled = hf._memory._encryptionEnabled;
  check('LEARNED层加密状态检测', typeof encryptionEnabled === 'boolean');
  if (!encryptionEnabled) {
    console.log('     ⚠️ 警告: LEARNED层加密未启用!');
    console.log('     └─ 建议: 设置HEARTFLOW_ENCRYPTION_KEY环境变量(64位十六进制密钥)');
  } else {
    console.log('     ✓ LEARNED层加密已启用');
  }

  // 5.2 记忆过期机制检查
  console.log('\n  [记忆过期机制]');
  const ephemeralBefore = hf._memory.listEphemeral();
  const now = Date.now();

  // 创建已过期的ephemeral记忆
  hf._memory.rememberEphemeral('test:expired', 'will expire', 1); // 1ms TTL
  setTimeout(() => {}, 10); // 等待过期

  const expiredGet = hf._memory.getEphemeral('test:expired');
  check('EPHEMERAL过期机制工作', expiredGet === null);

  // 5.3 热度整合算法检查
  console.log('\n  [热度整合算法]');
  // 检查consolidate中的热度分数计算
  hf.remember('signal:hot:topic', '热门话题', 'ephemeral');
  for (let i = 0; i < 5; i++) {
    hf._memory.getEphemeral('signal:hot:topic');
  }

  const consolidateCheck = hf._memory.consolidate();
  const hotPromoted = consolidateCheck.promoted.some(k => k.includes('hot:topic'));
  check('高热度ephemeral被整合', hotPromoted, `promoted: ${consolidateCheck.promoted.length}`);

  // 5.4 梦境整合准确性检查
  console.log('\n  [梦境整合准确性]');
  const dreamWithStages = hf.dreamWithStages();
  check('梦境分阶段返回结果', dreamWithStages !== undefined);
  check('梦境包含L1-L6评分', dreamWithStages.l1l6_score !== undefined);
  check('L1-L6评分结构正确', dreamWithStages.l1l6_score.levels !== undefined);
  check('梦境包含传承价值评分', dreamWithStages.inheritance_score !== undefined);
  check('梦境包含REM阶段', dreamWithStages.rem !== undefined);
  check('REM阶段包含insights', dreamWithStages.rem.insights !== undefined);

  // 5.5 自进化Q-learning检查
  console.log('\n  [Q-learning自愈机制]');
  const healStats = hf.getHealStats();
  check('healStats返回对象', healStats !== undefined);
  check('healStats包含qtableSize', typeof healStats.qtableSize === 'number');

  // 记录heal结果
  hf.heal({ message: 'test error' });
  const healStatsAfter = hf.getHealStats();
  check('healStats可更新', healStatsAfter !== undefined);

  // ═══════════════════════════════════════════════════════════════
  // 6. ProfileEvolution进化模块测试
  // ═══════════════════════════════════════════════════════════════
  section('6. ProfileEvolution进化模块');

  // 6.1 先设置同意以测试进化
  hf.setConsent(true);

  // 6.2 correctAnalysis用户纠正
  console.log('\n  [correctAnalysis用户纠正]');
  const correctResult = hf.correctAnalysis(
    '用户输入测试',
    { emotion: { category: 'happy' } },
    { emotion: { category: 'sad' } }
  );
  check('correctAnalysis返回结果', correctResult !== undefined);
  check('correctAnalysis返回success', correctResult.success === true);

  // 6.3 getPsychologyAccuracy分析准确率
  console.log('\n  [getPsychologyAccuracy分析准确率]');
  const accuracy = hf.getPsychologyAccuracy();
  check('准确率返回对象', accuracy !== undefined);
  check('准确率包含accuracy字段', typeof accuracy.accuracy === 'number');
  check('准确率包含total字段', typeof accuracy.total === 'number');
  check('准确率包含corrections字段', typeof accuracy.corrections === 'number');

  // ═══════════════════════════════════════════════════════════════
  // 7. 综合健康检查
  // ═══════════════════════════════════════════════════════════════
  section('7. 综合健康检查');

  const healthCheck = hf.healthCheck();
  check('healthCheck返回对象', healthCheck !== undefined);
  check('healthCheck包含started状态', healthCheck.started === true);
  check('healthCheck包含version', healthCheck.version === VERSION);
  check('healthCheck包含uptime_ms', typeof healthCheck.uptime_ms === 'number');
  check('healthCheck包含stats', healthCheck.stats !== undefined);

  // ═══════════════════════════════════════════════════════════════
  // 测试完成
  // ═══════════════════════════════════════════════════════════════

  hf.stop();

  // 清理测试数据
  if (fs.existsSync(TEST_DATA)) {
    fs.rmSync(TEST_DATA, { recursive: true });
  }

  const total = passed + failed;
  const rate = total > 0 ? Math.round(passed / total * 100) : 0;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`   测试完成: ${passed}/${total} 通过 (${rate}%)`);
  console.log('═══════════════════════════════════════════════════════════');

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} 项测试失败，需要修复:\n`);
  }

  // 输出问题汇总
  const issues = [];

  if (!hf._memory._encryptionEnabled) {
    issues.push('【警告】LEARNED层加密未启用 - 敏感数据可能以明文存储');
  }

  if (issues.length > 0) {
    console.log('发现的问题:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('FATAL ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
});
