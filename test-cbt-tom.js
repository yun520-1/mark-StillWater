/**
 * 心镜认知偏差检测和CBT重构功能测试
 *
 * 测试内容:
 * 1. 认知扭曲检测 (detectDistortions)
 * 2. CBT综合分析 (analyzeCBT)
 * 3. 苏格拉底式追问 (generateSocraticQuestions)
 * 4. Theory of Mind 心智推断 (inferMentalState)
 */

const { createHeartFlow } = require('./src/core/heartflow.js');

// 创建引擎实例
const engine = createHeartFlow({ rootPath: __dirname });
engine.start();

console.log('='.repeat(60));
console.log('心镜认知偏差检测和CBT重构功能测试');
console.log('='.repeat(60));

// 测试场景
const testCases = [
  {
    name: '场景1: 过度概括 + 全或无思维',
    text: '我总是失败，永远不可能成功',
    expected: ['overgeneralization', 'all-or-nothing']
  },
  {
    name: '场景2: 跳跃式结论',
    text: '他们一定在背后说我坏话',
    expected: ['jumping-conclusions']
  },
  {
    name: '场景3: 全或无思维 + 应该陈述',
    text: '如果我不完美，就是失败',
    expected: ['all-or-nothing', 'should-statements']
  },
  {
    name: '场景4: 过度概括 + 情绪化推理',
    text: '这次失败了，我永远都做不好',
    expected: ['overgeneralization', 'emotional-reasoning']
  }
];

// 颜色输出
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

// 测试1: 认知扭曲检测
console.log('\n' + colors.cyan('【测试1】认知扭曲检测 (detectDistortions)'));
console.log('-'.repeat(50));

testCases.forEach((tc, idx) => {
  console.log(`\n${colors.yellow(`[${idx + 1}] ${tc.name}`)}`);
  console.log(`输入: "${tc.text}"`);

  const result = engine.detectDistortions(tc.text);

  console.log(`检测结果: ${result.hasDistortions ? colors.green('有扭曲') : colors.red('无扭曲')}`);
  console.log(`严重程度: ${result.severity}`);

  if (result.distortions && result.distortions.length > 0) {
    console.log('检测到的扭曲:');
    result.distortions.forEach((d, i) => {
      const matched = tc.expected.includes(d.type);
      const icon = matched ? colors.green('✓') : colors.red('✗');
      console.log(`  ${icon} ${d.name} (${d.type}) - 置信度: ${(d.confidence * 100).toFixed(0)}%`);
      console.log(`     证据: "${d.matchedPatterns.join(', ')}"`);
    });
  } else {
    console.log(colors.red('  未检测到任何扭曲!'));
  }

  console.log(`总结: ${result.summary}`);
});

// 测试2: CBT综合分析
console.log('\n' + colors.cyan('【测试2】CBT综合分析 (analyzeCBT)'));
console.log('-'.repeat(50));

testCases.forEach((tc, idx) => {
  console.log(`\n${colors.yellow(`[${idx + 1}] ${tc.name}`)}`);
  console.log(`输入: "${tc.text}"`);

  const result = engine.analyzeCBT(tc.text);

  // 扭曲分析
  console.log('\n  [扭曲检测]');
  if (result.distortions.hasDistortions) {
    console.log(`    严重程度: ${result.distortions.severity}`);
    result.distortions.distortions.forEach(d => {
      console.log(`    - ${d.name}: ${d.matchedPatterns.join(', ')}`);
    });
  } else {
    console.log('    ' + colors.red('未检测到扭曲'));
  }

  // 苏格拉底追问
  console.log('\n  [苏格拉底追问]');
  if (result.questions.questions && result.questions.questions.length > 0) {
    console.log(`    类型: ${result.questions.type}`);
    console.log(`    焦点: ${result.questions.focus}`);
    result.questions.questions.slice(0, 3).forEach((q, i) => {
      console.log(`    ${i + 1}. ${q}`);
    });
  } else {
    console.log('    ' + colors.red('无追问生成'));
  }

  // 认知重构建议
  console.log('\n  [认知重构建议]');
  if (result.advice.hasAdvice) {
    result.advice.advice.forEach(a => {
      console.log(`    扭曲类型: ${a.distortion}`);
      console.log(`    技术: ${a.technique}`);
      console.log(`    重构建议: ${a.restructured}`);
    });
  } else {
    console.log('    ' + colors.yellow('无需重构'));
  }

  // 建议行动
  console.log('\n  [建议行动]');
  if (result.recommendations.actions) {
    result.recommendations.actions.forEach(a => {
      console.log(`    - ${a}`);
    });
  }
});

// 测试3: 苏格拉底式追问
console.log('\n' + colors.cyan('【测试3】苏格拉底式追问 (generateSocraticQuestions)'));
console.log('-'.repeat(50));

testCases.forEach((tc, idx) => {
  console.log(`\n${colors.yellow(`[${idx + 1}] ${tc.name}`)}`);
  console.log(`输入: "${tc.text}"`);

  const result = engine.generateSocraticQuestions(tc.text);

  console.log(`追问类型: ${result.type}`);
  console.log(`焦点: ${result.focus}`);

  if (result.distortionsTargeted && result.distortionsTargeted.length > 0) {
    console.log(`针对扭曲: ${result.distortionsTargeted.join(', ')}`);
  }

  console.log('追问问题:');
  result.questions.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q}`);
  });
});

// 测试4: Theory of Mind心智推断
console.log('\n' + colors.cyan('【测试4】Theory of Mind心智推断 (inferMentalState)'));
console.log('-'.repeat(50));

const tomTestCases = [
  { name: '推断他人心理-跳跃式结论', text: '她肯定不想见我了' },
  { name: '基本情绪感知', text: '我觉得很开心' },
  { name: '意图推断', text: '我想找个新工作' },
  { name: '隐含意图检测', text: '我最近很忙，没时间' }
];

tomTestCases.forEach((tc, idx) => {
  console.log(`\n${colors.yellow(`[${idx + 1}] ${tc.name}`)}`);
  console.log(`输入: "${tc.text}"`);

  const result = engine.inferMentalState(tc.text);

  console.log(`ToM层级: ${result.level} - ${result.levelName}`);
  console.log(`置信度: ${(result.confidence * 100).toFixed(0)}%`);

  console.log('心理状态分析:');
  console.log(`  信念: ${result.beliefs.detected ? result.beliefs.signals.join(', ') : '未检测到'}`);
  console.log(`  欲望: ${result.desires.detected ? result.desires.signals.join(', ') : '未检测到'}`);
  console.log(`  情绪: ${result.emotions.detected ? result.emotions.signals.join(', ') : '未检测到'}`);
  console.log(`  意图: ${result.intentions.detected ? result.intentions.signals.join(', ') : '未检测到'}`);
  console.log(`  知识: ${result.knowledge.detected ? result.knowledge.signals.join(', ') : '未检测到'}`);

  if (result.socialDynamics.hasSocialContent) {
    console.log(`社交动态: ${result.socialDynamics.types.join(', ')}`);
  }

  if (result.implicitIntent.detected) {
    console.log(colors.yellow('  隐含意图检测:'));
    result.implicitIntent.intents.forEach(intent => {
      console.log(`    - ${intent.type}: ${intent.description} (置信度: ${(intent.confidence * 100).toFixed(0)}%)`);
    });
  }

  if (result.warnings && result.warnings.length > 0) {
    console.log(colors.red('  警告:'));
    result.warnings.forEach(w => {
      console.log(`    - ${w.type}: ${w.message}`);
    });
  }
});

// 测试5: 16种认知偏差的识别覆盖
console.log('\n' + colors.cyan('【测试5】认知偏差库覆盖检查'));
console.log('-'.repeat(50));

// 检查CBT模块中的认知扭曲定义
const cbtModule = engine._cbt;
const distortionTypes = Object.keys(cbtModule.cognitiveDistortions);
console.log(`认知扭曲类型总数: ${distortionTypes.length}`);
console.log('\n扭曲类型列表:');
distortionTypes.forEach((type, idx) => {
  const info = cbtModule.cognitiveDistortions[type];
  console.log(`  ${idx + 1}. ${type}`);
  console.log(`     名称: ${info.name}`);
  console.log(`     模式数: ${info.patterns.length}`);
});

// 测试6: 苏格拉底追问质量评估
console.log('\n' + colors.cyan('【测试6】苏格拉底追问质量评估'));
console.log('-'.repeat(50));

const qualityQuestions = [
  '我就是个失败者',
  '我必须永远成功',
  '每个人都比我强'
];

qualityQuestions.forEach((text, idx) => {
  console.log(`\n[${idx + 1}] 输入: "${text}"`);
  const result = engine.generateSocraticQuestions(text);

  console.log(`追问类型: ${result.type}`);
  console.log('问题列表:');
  result.questions.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q}`);
  });

  // 检查追问是否引导反思
  const hasReflection = result.questions.some(q =>
    q.includes('如果') || q.includes('怎么') || q.includes('有没有')
  );
  const hasPerspective = result.questions.some(q =>
    q.includes('朋友') || q.includes('角度') || q.includes('他人')
  );
  const hasEvidence = result.questions.some(q =>
    q.includes('证据') || q.includes('证明')
  );

  console.log(colors.blue('  质量指标:'));
  console.log(`    引导反思: ${hasReflection ? colors.green('✓') : colors.red('✗')}`);
  console.log(`    多视角: ${hasPerspective ? colors.green('✓') : colors.red('✗')}`);
  console.log(`    证据检验: ${hasEvidence ? colors.green('✓') : colors.red('✗')}`);
});

// 测试7: 综合场景测试
console.log('\n' + colors.cyan('【测试7】综合场景测试'));
console.log('-'.repeat(50));

const complexScenarios = [
  {
    name: '复杂场景: 求职被拒后的自我否定',
    text: '这次面试又失败了，我永远都找不到工作了。我就是个没用的人。'
  },
  {
    name: '复杂场景: 人际关系猜测',
    text: '同事没跟我打招呼，他肯定对我有意见，我怎么做都不对。'
  }
];

complexScenarios.forEach((scenario, idx) => {
  console.log(`\n${colors.yellow(`[${idx + 1}] ${scenario.name}`)}`);
  console.log(`输入: "${scenario.text}"`);

  // CBT分析
  const cbtResult = engine.analyzeCBT(scenario.text);
  console.log('\n  CBT分析结果:');
  console.log(`    扭曲数量: ${cbtResult.distortions.distortions.length}`);
  console.log(`    严重程度: ${cbtResult.distortions.severity}`);
  console.log(`    扭曲类型: ${cbtResult.distortions.distortions.map(d => d.name).join(', ')}`);

  // ToM分析
  const tomResult = engine.inferMentalState(scenario.text);
  console.log('\n  ToM分析结果:');
  console.log(`    层级: ${tomResult.level} - ${tomResult.levelName}`);
  console.log(`    隐含意图: ${tomResult.implicitIntent.detected ? '是' : '否'}`);
  if (tomResult.implicitIntent.detected) {
    tomResult.implicitIntent.intents.forEach(intent => {
      console.log(`      - ${intent.type}: ${intent.description}`);
    });
  }
});

// 总结
console.log('\n' + '='.repeat(60));
console.log('测试完成');
console.log('='.repeat(60));

// 输出认知扭曲类型统计
console.log('\n认知扭曲检测统计:');
console.log(`  总扭曲类型数: ${distortionTypes.length}`);
console.log('  类型列表:', distortionTypes.join(', '));

engine.stop();
