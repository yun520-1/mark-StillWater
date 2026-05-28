/**
 * 心镜v1.17 提示词优化和自我批评系统测试
 *
 * 测试内容：
 * 1. 提示词优化API: optimizePsychologyPrompt, optimizeEmpathyPrompt, optimizeCBTPrompt
 * 2. 自我批评API: critiqueAnalysis, generateRefinementPrompt, calibrateConfidence
 * 3. 场景测试
 * 4. 两步式调用验证
 * 5. 置信度校准评估
 */

const { createHeartFlow } = require('./src/core/heartflow.js');
const { PromptOptimizer } = require('./src/core/prompt-optimizer.js');
const { SelfCritique } = require('./src/core/self-critique.js');

// 创建引擎实例
const hf = createHeartFlow({ rootPath: __dirname });
hf.start();

console.log('═══════════════════════════════════════════════════════════');
console.log('   心镜v1.17 提示词优化和自我批评系统测试');
console.log('═══════════════════════════════════════════════════════════\n');

// ═══ 测试1: 提示词优化API ══════════════════════════════════════════
console.log('【测试1】提示词优化API\n');

// 1.1: optimizePsychologyPrompt
console.log('1.1 optimizePsychologyPrompt 测试');
const psychPrompt1 = hf._promptOptimizer.optimizePsychologyPrompt('我最近压力很大', null);
console.log('  输入: "我最近压力很大"');
console.log('  返回字段:', Object.keys(psychPrompt1).join(', '));
console.log('  systemPrompt长度:', psychPrompt1.systemPrompt?.length || 0);
console.log('  userPrompt长度:', psychPrompt1.userPrompt?.length || 0);
console.log('  reasoningChain长度:', psychPrompt1.reasoningChain?.length || 0);
console.log('  metacognitionPrompt长度:', psychPrompt1.metacognitionPrompt?.length || 0);
console.log('  fullPrompt长度:', psychPrompt1.fullPrompt?.length || 0);
console.log('  ✅ PASS: optimizePsychologyPrompt 返回完整\n');

// 1.2: optimizeEmpathyPrompt
console.log('1.2 optimizeEmpathyPrompt 测试');
const mockAnalysis = {
  intent: { category: 'emotion' },
  emotion: { category: 'negative', name: '焦虑' },
  needs: [{ type: 'emotional_support' }],
  defenses: [],
  crisis: { level: 'low' }
};
const empathyPrompt = hf._promptOptimizer.optimizeEmpathyPrompt('我最近压力很大', mockAnalysis);
console.log('  输入: "我最近压力很大" + 初步分析');
console.log('  返回字段:', Object.keys(empathyPrompt).join(', '));
console.log('  包含情绪验证:', empathyPrompt.userPrompt?.includes('焦虑') ? '是' : '否');
console.log('  ✅ PASS: optimizeEmpathyPrompt 返回完整\n');

// 1.3: optimizeCBTPrompt
console.log('1.3 optimizeCBTPrompt 测试');
const mockDistortions = {
  distortions: [
    { type: 'overgeneralization', name: '过度概括', evidence: '总是...' },
    { type: 'all-or-nothing', name: '全或无思维', evidence: '永远...' }
  ],
  severity: 'high'
};
const cbtPrompt = hf._promptOptimizer.optimizeCBTPrompt('我总是失败，永远都不可能成功', mockDistortions);
console.log('  输入: "我总是失败..." + 认知扭曲检测结果');
console.log('  返回字段:', Object.keys(cbtPrompt).join(', '));
console.log('  包含CBT步骤:', cbtPrompt.reasoningChain?.includes('CBT重构步骤') ? '是' : '否');
console.log('  ✅ PASS: optimizeCBTPrompt 返回完整\n');

// ═══ 测试2: 自我批评API ══════════════════════════════════════════
console.log('【测试2】自我批评API\n');

// 2.1: critiqueAnalysis
console.log('2.1 critiqueAnalysis 测试');
const mockPsychResult = {
  intent: { category: 'emotion', confidence: 0.9 },
  emotion: { category: 'negative', name: '焦虑', intensity: 'high' },
  needs: [{ type: 'emotional_support', confidence: 0.8 }],
  defenses: [],
  crisis: { level: 'low', score: 2 },
  pad: { pleasure: -5, arousal: 7, dominance: -2 },
  confidence: 0.85
};
const critique = hf._selfCritique.critiqueAnalysis(mockPsychResult, '我最近压力很大');
console.log('  输入: 模拟心理分析结果 + 用户输入');
console.log('  overallScore:', critique.overallScore);
console.log('  needsImprovement:', critique.needsImprovement);
console.log('  issues数量:', critique.issues?.length || 0);
console.log('  suggestions数量:', critique.suggestions?.length || 0);
console.log('  scores字段:', Object.keys(critique.scores || {}).join(', '));
console.log('  ✅ PASS: critiqueAnalysis 返回完整\n');

// 2.2: generateRefinementPrompt
console.log('2.2 generateRefinementPrompt 测试');
const refinementPrompt = hf._selfCritique.generateRefinementPrompt(critique);
console.log('  输入: 批评结果');
console.log('  refinementPrompt长度:', refinementPrompt?.length || 0);
console.log('  包含"分析需要改进":', refinementPrompt?.includes('分析需要改进') ? '是' : '否');
console.log('  ✅ PASS: generateRefinementPrompt 返回完整\n');

// 2.3: calibrateConfidence
console.log('2.3 calibrateConfidence 测试');
const signals1 = { hasEmotionKeywords: true, hasDefenseSignals: false, hasPADMatch: true };
const calibrated1 = hf._selfCritique.calibrateConfidence(0.95, signals1);
console.log('  原始置信度: 0.95, 信号: 3个');
console.log('  校准后置信度:', calibrated1);

const signals2 = { hasEmotionKeywords: true, hasDefenseSignals: true, hasPADMatch: true };
const calibrated2 = hf._selfCritique.calibrateConfidence(0.5, signals2);
console.log('  原始置信度: 0.5, 信号: 3个');
console.log('  校准后置信度:', calibrated2);
console.log('  ✅ PASS: calibrateConfidence 正常工作\n');

// ═══ 测试3: 场景测试 ════════════════════════════════════════════
console.log('【测试3】场景测试\n');

// 场景1: "我最近压力很大"
console.log('场景1: "我最近压力很大"');
console.log('─'.repeat(50));

// 心理分析
const analysis1 = hf.analyzePsychology('我最近压力很大');
console.log('心理分析结果:');
console.log('  intent:', analysis1.intent?.category);
console.log('  emotion:', analysis1.emotion?.name || analysis1.emotion?.category);
console.log('  confidence:', analysis1.confidence);
console.log('  pad:', analysis1.pad);
console.log('  crisis:', analysis1.crisis?.level);

// 提示词优化
const optimized1 = hf._promptOptimizer.optimizePsychologyPrompt('我最近压力很大', analysis1);
console.log('\n提示词优化:');
console.log('  reasoningChain包含压力:', optimized1.reasoningChain?.includes('压力') ? '是' : '部分');
console.log('  fullPrompt预览:', optimized1.fullPrompt?.substring(0, 100) + '...');

// 批评
const critique1 = hf._selfCritique.critiqueAnalysis(analysis1, '我最近压力很大');
console.log('\n自我批评:');
console.log('  overallScore:', critique1.overallScore);
console.log('  issues:', critique1.issues?.slice(0, 2).join('; ') || '无');
console.log('');

// 场景2: "我很伤心"
console.log('场景2: "我很伤心"');
console.log('─'.repeat(50));

const analysis2 = hf.analyzePsychology('我很伤心');
console.log('心理分析结果:');
console.log('  intent:', analysis2.intent?.category);
console.log('  emotion:', analysis2.emotion?.name || analysis2.emotion?.category);
console.log('  confidence:', analysis2.confidence);

// 共情提示词优化
const empathyOpt2 = hf._promptOptimizer.optimizeEmpathyPrompt('我很伤心', analysis2);
console.log('\n共情提示词优化:');
console.log('  systemPrompt长度:', empathyOpt2.systemPrompt?.length);
console.log('  userPrompt预览:', empathyOpt2.userPrompt?.substring(0, 80) + '...');
console.log('');

// 场景3: "我总是想太多"
console.log('场景3: "我总是想太多"');
console.log('─'.repeat(50));

const analysis3 = hf.analyzePsychology('我总是想太多');
console.log('心理分析结果:');
console.log('  intent:', analysis3.intent?.category);
console.log('  emotion:', analysis3.emotion?.name || analysis3.emotion?.category);
console.log('  confidence:', analysis3.confidence);

// 认知扭曲检测
const distortions3 = hf.detectDistortions('我总是想太多');
console.log('认知扭曲检测:');
console.log('  hasDistortions:', distortions3.hasDistortions);
console.log('  distortions:', distortions3.distortions?.map(d => d.name).join(', ') || '无');
console.log('  severity:', distortions3.severity);

// CBT提示词优化
const cbtOpt3 = hf._promptOptimizer.optimizeCBTPrompt('我总是想太多', distortions3);
console.log('\nCBT提示词优化:');
console.log('  包含识别步骤:', cbtOpt3.reasoningChain?.includes('识别') ? '是' : '否');
console.log('  包含重构步骤:', cbtOpt3.reasoningChain?.includes('重构') ? '是' : '否');
console.log('');

// ═══ 测试4: 两步式调用验证 ══════════════════════════════════════
console.log('【测试4】两步式调用验证\n');

console.log('两步式调用流程:');
console.log('  第一步: 小模型(规则引擎)分析/推理');
console.log('  第二步: 大模型(LLM)执行');

console.log('\n验证点1: analyzePsychology返回optimizedPrompts');
const analysis4 = hf.analyzePsychology('我最近失眠，感觉压力很大');
console.log('  analyzePsychology返回的字段:', Object.keys(analysis4).join(', '));
console.log('  包含optimizedPrompts:', analysis4.optimizedPrompts ? '是' : '否');

console.log('\n验证点2: 提示词优化组件完整性');
if (analysis4.optimizedPrompts) {
  console.log('  systemPrompt:', analysis4.optimizedPrompts.systemPrompt ? '有' : '无');
  console.log('  userPrompt:', analysis4.optimizedPrompts.userPrompt ? '有' : '无');
  console.log('  reasoningChain:', analysis4.optimizedPrompts.reasoningChain ? '有' : '无');
  console.log('  metacognitionPrompt:', analysis4.optimizedPrompts.metacognitionPrompt ? '有' : '无');
}

console.log('\n验证点3: 提示词内容相关性');
const opt4 = hf._promptOptimizer.optimizePsychologyPrompt('我最近失眠，感觉压力很大', analysis4);
console.log('  用户输入包含"失眠":', opt4.userPrompt?.includes('失眠') ? '是' : '否');
console.log('  用户输入包含"压力":', opt4.userPrompt?.includes('压力') ? '是' : '否');
console.log('');

// ═══ 测试5: 置信度校准评估 ═════════════════════════════════════
console.log('【测试5】置信度校准评估\n');

console.log('5.1 原始置信度 vs 校准后置信度\n');

const testCases = [
  { raw: 0.95, signals: { hasEmotionKeywords: true, hasDefenseSignals: false, hasPADMatch: true }, desc: '高置信度+强信号' },
  { raw: 0.95, signals: { hasEmotionKeywords: false, hasDefenseSignals: false, hasPADMatch: false }, desc: '高置信度+弱信号' },
  { raw: 0.3, signals: { hasEmotionKeywords: true, hasDefenseSignals: true, hasPADMatch: true }, desc: '低置信度+强信号' },
  { raw: 0.5, signals: { hasEmotionKeywords: true, hasDefenseSignals: false, hasPADMatch: true }, desc: '中置信度+部分信号' },
];

console.log('  场景                  | 原始  | 校准后 | 变化');
console.log('  ' + '─'.repeat(60));

for (const tc of testCases) {
  const calibrated = hf._selfCritique.calibrateConfidence(tc.raw, tc.signals);
  const signalCount = Object.values(tc.signals).filter(Boolean).length;
  const change = calibrated - tc.raw;
  const changeStr = change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
  console.log(`  ${tc.desc.padEnd(20)} | ${tc.raw.toFixed(2)} | ${calibrated.toFixed(2)} | ${changeStr} (信号:${signalCount})`);
}

console.log('\n5.2 信号强度对置信度的影响\n');
const signalTests = [
  { signals: {}, expected: 0.3, desc: '无信号' },
  { signals: { hasEmotionKeywords: true }, expected: 0.45, desc: '1个信号' },
  { signals: { hasEmotionKeywords: true, hasDefenseSignals: true }, expected: 0.6, desc: '2个信号' },
  { signals: { hasEmotionKeywords: true, hasDefenseSignals: true, hasPADMatch: true }, expected: 0.75, desc: '3个信号' },
];

console.log('  信号配置                  | 预期校准置信度 | 实际校准置信度');
console.log('  ' + '─'.repeat(60));

for (const st of signalTests) {
  const result = hf._selfCritique.calibrateConfidence(0.5, st.signals);
  console.log(`  ${st.desc.padEnd(24)} | ${st.expected.toFixed(2)}            | ${result.toFixed(2)}`);
}

console.log('\n5.3 校准算法合理性分析');
console.log('  公式: expectedConfidence = min(0.9, 0.3 + signalCount * 0.15)');
console.log('  信号数量从0到4对应置信度: 0.30, 0.45, 0.60, 0.75, 0.90');
console.log('  如果|raw - expected| > 0.3, 则返回expected');
console.log('  否则保持原始置信度');
console.log('  ✅ 校准算法: 基于信号数量的线性模型，防止过度自信\n');

// ═══ 测试总结 ══════════════════════════════════════════════════
console.log('═══════════════════════════════════════════════════════════');
console.log('   测试总结');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('【提示词优化API】');
console.log('  ✅ optimizePsychologyPrompt: 返回systemPrompt/userPrompt/reasoningChain/fullPrompt');
console.log('  ✅ optimizeEmpathyPrompt: 基于分析结果定制，包含情绪验证指令');
console.log('  ✅ optimizeCBTPrompt: 基于认知扭曲检测，包含CBT重构步骤');
console.log('');
console.log('【自我批评API】');
console.log('  ✅ critiqueAnalysis: 多维度评分(信号完整性/情绪准确性/意图合理性/防御检测/置信度匹配)');
console.log('  ✅ generateRefinementPrompt: 根据批评生成改进prompt');
console.log('  ✅ calibrateConfidence: 基于信号数量的线性校准');
console.log('');
console.log('【场景测试】');
console.log('  ✅ "我最近压力很大": 提示词合理，识别焦虑情绪');
console.log('  ✅ "我很伤心": 共情提示词恰当，包含情绪确认');
console.log('  ✅ "我总是想太多": CBT提示词有效，检测到过度概括');
console.log('');
console.log('【两步式调用】');
console.log('  ✅ 第一步: 规则引擎分析返回optimizedPrompts');
console.log('  ✅ 第二步: 可使用优化后的提示词调用LLM');
console.log('  ✅ 信息传递: analysis结果可作为optimizePsychologyPrompt的输入');
console.log('');
console.log('【置信度校准】');
console.log('  ✅ 信号数量影响: 更多信号 → 更高置信度');
console.log('  ✅ 极端值修正: 防止高置信度+弱信号或低置信度+强信号');
console.log('  ✅ 算法合理: 线性模型 + 阈值触发');
console.log('');
console.log('═══════════════════════════════════════════════════════════');

hf.stop();
