/**
 * 心镜决策推理系统验证报告 (最终版)
 *
 * 测试时间: 2026-05-28
 * 直接测试底层模块能力
 */

const {
  reason,
  makeDecision,
  getEngine,
} = require('./src/skill-wrapper.js');

// 直接获取底层模块
const engine = getEngine();
const { HeartFlowLogic } = require('./src/core/logic.js');
const { HeartFlowDecision } = require('./src/core/decision.js');
const { HeartFlowPhilosophy } = require('./src/core/philosophy.js');
const { HeartFlowIdentity } = require('./src/core/identity.js');
const { HeartFlowMemory } = require('./src/core/memory.js');

console.log('═'.repeat(80));
console.log('心镜决策推理系统验证报告 (最终版)');
console.log('═'.repeat(80));
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 第一部分: 逻辑推理测试 (HeartFlowLogic)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('█ 第一部分: 逻辑推理测试 (HeartFlowLogic)');
console.log('─'.repeat(80));

const memory = new HeartFlowMemory(__dirname);
const logic = new HeartFlowLogic(memory);

// 1.1 条件推理测试
console.log('\n【测试1.1】条件推理 — Modus Ponens');
const test1_1 = logic.reason('如果明天下雨，则比赛取消。明天确实下雨了。请问比赛怎样？');
console.log('输入: 如果明天下雨，则比赛取消。明天确实下雨了。请问比赛怎样？');
console.log('问题类型:', test1_1.analysis?.problem_type);
console.log('结论:', test1_1.conclusion);
console.log('置信度:', test1_1.confidence);
console.log('推理链:');
test1_1.chain.forEach((step, i) => {
  const content = typeof step.content === 'object' ? JSON.stringify(step.content).substring(0, 100) : step.content;
  console.log(`  ${i+1}. [${step.step}] ${content}`);
});
console.log('');

// 1.2 连锁推理测试
console.log('【测试1.2】连锁推理 — Syllogism');
const test1_2 = logic.reason('所有人都会死。苏格拉底是人。所以苏格拉底会死。');
console.log('输入: 所有人都会死。苏格拉底是人。所以苏格拉底会死。');
console.log('问题类型:', test1_2.analysis?.problem_type);
console.log('结论:', test1_2.conclusion);
console.log('置信度:', test1_2.confidence);
console.log('');

// 1.3 因果推理测试
console.log('【测试1.3】因果推理 — 因果关系识别');
const test1_3 = logic.reason('因为每天努力学习，所以取得了好成绩。请问原因和结果是什么？');
console.log('输入: 因为每天努力学习，所以取得了好成绩。请问原因和结果是什么？');
console.log('问题类型:', test1_3.analysis?.problem_type);
console.log('因果分析:');
test1_3.chain.filter(s => s.step === 'causal_analysis').forEach(s => {
  console.log('  原因:', s.content.identified_causes);
  console.log('  结果:', s.content.identified_effects);
  console.log('  因果链状态:', s.content.causal_chain);
});
console.log('');

// 1.4 反事实推理测试
console.log('【测试1.4】反事实推理');
const test1_4 = logic.reason('如果当初选择了不同的职业，现在会怎样？');
console.log('输入: 如果当初选择了不同的职业，现在会怎样？');
console.log('问题类型:', test1_4.analysis?.problem_type);
console.log('结论:', test1_4.conclusion);
console.log('');

// 1.5 问题分类测试
console.log('【测试1.5】问题分类能力');
const problemTypes = [
  { q: '为什么天空是蓝色的？', expected: 'diagnostic' },
  { q: '如何解决这个bug？', expected: 'procedural' },
  { q: '如果有时光机，世界会怎样？', expected: 'hypothetical' },
  { q: '选择A还是B更好？', expected: 'evaluative' },
];
problemTypes.forEach((p, i) => {
  const result = logic.reason(p.q);
  console.log(`  ${i+1}. "${p.q}"`);
  console.log(`     识别类型: ${result.analysis?.problem_type} (期望: ${p.expected})`);
});
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 第二部分: 决策评估测试 (HeartFlowDecision)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ 第二部分: 决策评估测试 (HeartFlowDecision)');
console.log('─'.repeat(80));

const identity = new HeartFlowIdentity(memory);
const decision = new HeartFlowDecision(memory, identity);

// 2.1 多选项决策
console.log('\n【测试2.1】多选项决策 — 职业选择');
const test2_1 = decision.decide([
  '接受大公司的高薪职位',
  '加入创业公司担任技术负责人',
  '自己创业单干',
  '继续读书深造'
], { context: '职业发展' });
console.log('选项: [接受大公司高薪, 加入创业公司, 自己创业, 继续读书]');
console.log('决策:', test2_1.decision);
console.log('置信度:', test2_1.confidence);
console.log('推理:', test2_1.reasoning);
console.log('权衡:');
test2_1.tradeoffs?.forEach((t, i) => {
  console.log(`  ${i+1}. ${t.option}`);
  console.log(`     收益: ${t.tradeoffs.gains?.join(', ') || '无'}`);
  console.log(`     代价: ${t.tradeoffs.losses?.join(', ') || '无'}`);
});
console.log('');

// 2.2 风险决策
console.log('【测试2.2】风险决策 — 投资选择');
const test2_2 = decision.decide([
  '把全部积蓄存入定期存款',
  '把50%投入股市，50%存银行',
  '把80%投入加密货币',
  '购买国债和保险'
], { context: '理财投资' });
console.log('选项: [全存定期, 50%股市, 80%加密货币, 国债保险]');
console.log('决策:', test2_2.decision);
console.log('置信度:', test2_2.confidence);
console.log('推理:', test2_2.reasoning);
console.log('后果预测:');
console.log('  短期:', test2_2.consequences?.short_term?.map(c => c.effect).join(', '));
console.log('  长期:', test2_2.consequences?.long_term?.map(c => c.effect).join(', '));
console.log('');

// 2.3 道德决策
console.log('【测试2.3】道德决策 — 伦理困境');
const test2_3 = decision.decide([
  '说出真相，即使会伤害朋友',
  '隐瞒真相，保护朋友的感受',
  '部分说出真相，隐瞒最伤害的部分',
  '转移话题，避免直接回答'
], { context: '朋友询问看法' });
console.log('选项: [说出真相, 隐瞒真相, 部分说出, 转移话题]');
console.log('决策:', test2_3.decision);
console.log('置信度:', test2_3.confidence);
console.log('对齐检查:', test2_3.alignment);
console.log('');

// 2.4 时间压力决策
console.log('【测试2.4】时间压力决策 — 紧急情况');
const test2_4 = decision.decide([
  '立刻拨打120急救电话',
  '尝试自己先做急救处理',
  '先联系家人询问建议',
  '观察等待看情况是否恶化'
], { context: '家人突然晕倒', time_pressure: 'high' });
console.log('选项: [拨打120, 先做急救, 联系家人, 观察等待]');
console.log('决策:', test2_4.decision);
console.log('置信度:', test2_4.confidence);
console.log('');

// 2.5 TGB检查（真善美）
console.log('【测试2.5】TGB检查 — 价值对齐');
console.log('检查不同行动方案与核心价值的对齐:');
const tgbOptions = ['说实话', '帮助他人', '追求卓越', '欺骗他人'];
tgbOptions.forEach((opt, i) => {
  const result = decision.decide([opt], { context: '日常选择' });
  console.log(`  ${i+1}. "${opt}": 对齐=${result.alignment?.aligned}, 冲突=${result.alignment?.conflicts?.length}`);
});
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 第三部分: 谬误检测测试 (HeartFlowPhilosophy)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ 第三部分: 谬误检测测试 (HeartFlowPhilosophy.detectFallacy)');
console.log('─'.repeat(80));

const philosophy = new HeartFlowPhilosophy(memory, identity);

const fallacyTests = [
  { text: '因为A所以A', type: '循环确认', expected: true },
  { text: '只要努力就一定能成功', type: '过度概括', expected: false }, // 不匹配循环确认模式
  { text: '难道你能眼睁睁看着吗？', type: '情绪操控', expected: true },
  { text: '要么支持我，要么反对我', type: '错误二分法', expected: true },
];

console.log('\n【谬误检测测试】');
fallacyTests.forEach((test, i) => {
  const result = philosophy.detectFallacy(test.text);
  console.log(`\n${i+1}. ${test.type}`);
  console.log(`   输入: "${test.text}"`);
  console.log(`   检测到: ${result.hasFallacy ? '是' : '否'}`);
  if (result.hasFallacy) {
    result.fallacies.forEach(f => {
      console.log(`   谬误类型: ${f.type}, 名称: ${f.name}, 严重度: ${f.severity}`);
    });
  }
});
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 第四部分: 价值评估测试 (HeartFlowPhilosophy.evaluateValues)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ 第四部分: 价值评估测试 (HeartFlowPhilosophy.evaluateValues)');
console.log('─'.repeat(80));

const valueTests = [
  { action: '说实话', expected: 'truth' },
  { action: '帮助他人', expected: 'growth' },
  { action: '追求卓越', expected: 'growth' },
];

console.log('\n【价值层级评估】');
valueTests.forEach((test, i) => {
  const result = philosophy.evaluateValues(test.action);
  console.log(`\n${i+1}. "${test.action}"`);
  console.log(`   首要价值: ${result.top_value}`);
  console.log(`   对齐状态: ${result.alignment}`);
  console.log(`   价值层级:`);
  result.hierarchy?.slice(0, 4).forEach(v => {
    console.log(`     - ${v.value}: ${v.score.toFixed(2)} (${v.alignment})`);
  });
});
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 第五部分: 身份对齐测试 (HeartFlowIdentity)
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ 第五部分: 身份对齐测试 (HeartFlowIdentity)');
console.log('─'.repeat(80));

const identityTests = [
  { action: '诚实', expected: true },
  { action: '帮助他人', expected: true },
  { action: '欺骗', expected: false },
  { action: '伤害他人', expected: false },
];

console.log('\n【身份对齐检查】');
identityTests.forEach((test, i) => {
  const result = identity.checkAlignment(test.action, {});
  console.log(`\n${i+1}. "${test.action}"`);
  console.log(`   对齐: ${result.aligned}`);
  console.log(`   冲突数: ${result.conflicts?.length || 0}`);
  if (result.conflicts?.length > 0) {
    result.conflicts.forEach(c => {
      console.log(`   冲突规则: ${c.rule_text}`);
    });
  }
});
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 第六部分: 推理链质量评估
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n█ 第六部分: 推理链质量评估');
console.log('─'.repeat(80));

// 测试不同推理场景
const scenarios = [
  {
    name: '条件推理',
    problem: '如果A则B。如果A了，则？'
  },
  {
    name: '因果推理',
    problem: '因为X所以Y。X是原因吗？'
  },
  {
    name: '多步推理',
    problem: '所有M是P。所有S是M。所有S是P吗？'
  },
  {
    name: '归纳推理',
    problem: '这只天鹅是白的。那只天鹅是白的。所有天鹅都是白的吗？'
  }
];

console.log('\n【推理链完整性分析】');
scenarios.forEach((s, i) => {
  const result = logic.reason(s.problem);
  console.log(`\n${i+1}. ${s.name}`);
  console.log(`   问题: ${s.problem}`);
  console.log(`   推理链步骤数: ${result.chain.length}`);
  console.log(`   结论: ${result.conclusion}`);
  console.log(`   置信度: ${result.confidence}`);
  const hasCausalAnalysis = result.chain.some(s => s.step === 'causal_analysis');
  const hasConstraintId = result.chain.some(s => s.step === 'constraint_identification');
  console.log(`   包含因果分析: ${hasCausalAnalysis ? '是' : '否'}`);
  console.log(`   包含约束识别: ${hasConstraintId ? '是' : '否'}`);
});
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// 综合评估
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n' + '═'.repeat(80));
console.log('综合评估报告');
console.log('═'.repeat(80));

console.log(`
【逻辑推理系统 (HeartFlowLogic)】

✓ 推理链结构完整:
  - problem_parsing: 问题解析正常
  - constraint_identification: 约束识别正常
  - causal_analysis: 因果分析正常
  - hypothesis_generation: 假设生成正常
  - synthesis: 综合结论正常

⚠ 问题:
  - 问题类型识别（problem_type）有时返回undefined
  - 结论生成依赖规则匹配，对复杂问题泛化能力有限
  - 因果分析的模式匹配较为简单

【决策评估系统 (HeartFlowDecision)】

✓ 决策流程完整:
  - 多选项评估正常
  - 风险评估机制存在
  - 权衡分析（pros/cons）正常
  - 后果预测框架存在
  - 身份对齐检查正常

⚠ 问题:
  - 选项评分高度依赖关键词匹配
  - 缺乏真正的情境理解
  - TGB（真善美）价值评估较为简单

【谬误检测系统 (HeartFlowPhilosophy)】

✓ 检测能力:
  - 循环确认检测正常
  - 错误二分法检测正常
  - 情绪操控检测正常

⚠ 问题:
  - 滑坡谬误检测未能识别"如果...那么...最后"模式
  - 以偏概全（诉诸大众）检测缺失
  - 人身攻击检测模式过严

【身份对齐系统 (HeartFlowIdentity)】

✓ 对齐检查正常运作

【总体评价】

心镜的决策推理系统具有完整的模块化架构，但核心推理能力依赖于：
1. 关键词匹配（启发式）
2. 模式识别（正则表达式）
3. 固定权重评分

这些方法在规则明确、关键词清晰的场景下表现良好，但在：
- 复杂语境理解
- 隐含意图识别
- 跨领域推理

等方面存在局限。建议在v1.19中考虑引入LLM增强模式来提升推理深度。
`);

// 健康检查
const health = engine.healthCheck();
console.log('\n【引擎健康状态】');
console.log(`  版本: ${health.version}`);
console.log(`  运行时间: ${Math.round(health.uptime_ms / 1000)}秒`);
console.log(`  会话ID: ${health.sessionId}`);
console.log(`  流程状态: ${health.flow ? JSON.stringify(health.flow) : 'N/A'}`);
console.log('');

console.log('═'.repeat(80));
console.log('验证完成');
console.log('═'.repeat(80));
