/**
 * 心镜 v1.18 综合心理测试验证
 *
 * 测试所有核心API和之前修复的问题
 */

const {
  analyzePsychology,
  classify,
  calculatePAD,
  assessCrisisRisk,
  assessPHQ9,
  assessGAD7,
  analyzeEastern,
  analyzeCBT,
  inferMentalState,
  correctAnalysis,
  getPsychologyAccuracy,
  detectDistortions,
  generateSocraticQuestions,
  assessEmpathyAccuracy,
  detectResonance,
  recommendSupportiveResponse,
  assessEmpathyFatigue,
  getProfessionalDisclaimer,
  suggestProfessionalHelp,
  assessEmotionRegulation,
  assessStress,
  assessSocialSupport,
  assessQualityOfLife,
  comprehensivePsychologyAssessment,
  optimizePsychologyPrompt,
  critiqueAnalysis,
  healthCheck,
  getEngine
} = require('./src/skill-wrapper.js');

// 初始化引擎
const engine = getEngine();
engine.start();

// 测试结果收集
const results = [];
let passed = 0;
let failed = 0;

/**
 * 测试辅助函数
 */
function test(name, condition, actual, expected) {
  const ok = condition;
  const status = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++;
  else failed++;

  results.push({
    name,
    status: ok ? 'PASS' : 'FAIL',
    actual,
    expected,
    ok
  });

  console.log(`  ${status}: ${name}`);
  if (!ok) {
    console.log(`       预期: ${JSON.stringify(expected)}`);
    console.log(`       实际: ${JSON.stringify(actual)}`);
  }
}

/**
 * 打印测试结果表格
 */
function printResults() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    测试结果汇总');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n┌─────────────────────────────────────────────────────────────┐');
  console.log('│                    心理分析测试结果                          │');
  console.log('├─────────────────────┬────────┬────────────────────────────────┤');
  console.log('│ 测试项              │ 结果   │ 详情                           │');
  console.log('├─────────────────────┼────────┼────────────────────────────────┤');

  results.forEach(r => {
    const name = r.name.substring(0, 18).padEnd(18);
    const status = r.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`│ ${name} │ ${status} │`);
  });

  console.log('└─────────────────────┴────────┴────────────────────────────────┘');

  const total = passed + failed;
  const rate = total > 0 ? Math.round(passed / total * 100) : 0;
  console.log(`\n总计: ${passed}/${total} 通过 (${rate}%)`);
  if (failed > 0) {
    console.log(`\n⚠️  ${failed} 项测试失败，需要修复`);
  } else {
    console.log('\n🎉 所有测试通过！');
  }
  console.log('═══════════════════════════════════════════════════════════');
}

// ════════════════════════════════════════════════════════════════════
// 开始测试
// ════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════');
console.log('        心镜 v1.18 综合心理测试验证');
console.log('        静水深流。Still water runs deep.');
console.log('═══════════════════════════════════════════════════════════\n');

// ═══ 1. 核心健康检查 ═══

console.log('【1. 核心健康检查】');

const health = healthCheck();
test('引擎已启动', health.started === true, health.started, true);
test('引擎版本有效', health.version !== undefined, health.version, '有版本号');

console.log('\n【2. analyzePsychology 心理全息扫描】');

// ═══ 2. 之前修复的问题验证 ═══

console.log('\n【2.1 之前修复问题验证】');

// 问题1: "天人合一" 应返回天地境界（不再返回功利境界）
const tianren合一 = analyzePsychology('天人合一');
const tianrenHeYi_Jingjie = tianren合一.eastern?.jingjie?.name;
test(
  '"天人合一" → 天地境界',
  tianrenHeYi_Jingjie === '天地境界',
  tianrenHeYi_Jingjie,
  '天地境界'
);

// 问题2: "活着真没意思" 应返回 negative 情绪（不再返回 neutral）
const huoZhe = analyzePsychology('活着真没意思');
const huoZhe_Emotion = huoZhe.emotion?.category;
test(
  '"活着真没意思" → negative情绪',
  huoZhe_Emotion === 'negative',
  huoZhe_Emotion,
  'negative'
);

// 问题3: "我想死" 应触发 critical 危机检测
const si = analyzePsychology('我想死');
const si_CrisisLevel = si.crisis?.level;
test(
  '"我想死" → crisis critical',
  si_CrisisLevel === 'critical',
  si_CrisisLevel,
  'critical'
);

// 问题4: "道德" 应返回道德境界（不再返回天地境界）
const daode = analyzePsychology('道德');
const daode_Jingjie = daode.eastern?.jingjie?.name;
test(
  '"道德" → 道德境界',
  daode_Jingjie === '道德境界',
  daode_Jingjie,
  '道德境界'
);

console.log('\n【2.2 新场景测试】');

// 新场景1: "我觉得人生没有意义" - 应识别为负面情绪
const wuYiyi = analyzePsychology('我觉得人生没有意义');
const wuYiyi_Emotion = wuYiyi.emotion?.category;
test(
  '"我觉得人生没有意义" → negative',
  wuYiyi_Emotion === 'negative',
  wuYiyi_Emotion,
  'negative'
);

// 新场景2: "我应该为家人牺牲" - 应检测到家庭模式和集体主义
const yiWeiJiaRen = analyzePsychology('我应该为家人牺牲');
const yiWeiJiaRen_Family = yiWeiJiaRen.eastern?.familyPattern?.primaryPattern;
test(
  '"我应该为家人牺牲" → 家庭模式',
  yiWeiJiaRen_Family !== undefined && yiWeiJiaRen_Family !== 'unknown',
  yiWeiJiaRen_Family,
  '家庭模式'
);

// 检测集体主义
const yiWeiJiaRen_Cultural = yiWeiJiaRen.eastern?.culturalOrientation?.orientation;
test(
  '"我应该为家人牺牲" → 集体主义',
  yiWeiJiaRen_Cultural === 'collective',
  yiWeiJiaRen_Cultural,
  'collective'
);

// 新场景3: "我要做一个有良知的人" - 应检测到阳明心学信号
const liangZhi = analyzePsychology('我要做一个有良知的人');
const liangZhi_YangMing = liangZhi.eastern?.zhiXingHeYi?.signals?.some(
  s => s.toLowerCase().includes('良知') || s.toLowerCase().includes('心学') || s.toLowerCase().includes('致良知')
);
test(
  '"我要做一个有良知的人" → 阳明心学',
  liangZhi_YangMing === true,
  liangZhi.eastern?.zhiXingHeYi?.signals,
  '包含良知/心学信号'
);

console.log('\n【3. classify 快速分类】');

const clsResult = classify('我最近总是失眠，感觉压力很大');
test('classify 返回结果', clsResult !== null, clsResult !== null, true);
test('classify 有 emotion 字段', clsResult.emotion !== undefined, clsResult.emotion, '有值');
test('classify 有 category 字段', clsResult.category !== undefined, clsResult.category, '有值');

console.log('\n【4. calculatePAD 情绪模型】');

const padResult = calculatePAD('太棒了！终于成功了！');
test('PAD 返回结果', padResult !== null, padResult !== null, true);
test('PAD 有 pleasure 字段', padResult.pleasure !== undefined, padResult.pleasure, '有值');
test('PAD pleasure 为正值', padResult.pleasure > 0, padResult.pleasure, '> 0');

console.log('\n【5. assessCrisisRisk 危机检测】');

const crisisHigh = assessCrisisRisk('活着有什么意思');
test('危机检测-高水平', crisisHigh.level === 'high' || crisisHigh.level === 'critical', crisisHigh.level, 'high/critical');
test('危机检测-有warnings', crisisHigh.warnings !== undefined && crisisHigh.warnings.length > 0, crisisHigh.warnings, '有警告');

const crisisLow = assessCrisisRisk('今天天气不错');
test('危机检测-低水平', crisisLow.level === 'low', crisisLow.level, 'low');

console.log('\n【6. assessPHQ9 抑郁量表】');

const phq9Result = assessPHQ9([0, 1, 2, 1, 0, 0, 1, 2, 1]);
test('PHQ9 返回结果', phq9Result !== null, phq9Result !== null, true);
test('PHQ9 score 有效', typeof phq9Result.score === 'number', phq9Result.score, '数字');
test('PHQ9 severity 有效', phq9Result.severity !== undefined, phq9Result.severity, '有严重度');

console.log('\n【7. assessGAD7 焦虑量表】');

const gad7Result = assessGAD7([0, 1, 2, 1, 0, 0, 1]);
test('GAD7 返回结果', gad7Result !== null, gad7Result !== null, true);
test('GAD7 score 有效', typeof gad7Result.score === 'number', gad7Result.score, '数字');
test('GAD7 severity 有效', gad7Result.severity !== undefined, gad7Result.severity, '有严重度');

console.log('\n【8. analyzeEastern 东方心理学】');

const easternResult = analyzeEastern('做人要问心无愧');
test('东方心理 返回结果', easternResult !== null, easternResult !== null, true);
test('东方心理 有 zhiXingHeYi', easternResult.zhiXingHeYi !== undefined, easternResult.zhiXingHeYi, '有知行合一');
test('东方心理 有 jingjie', easternResult.jingjie !== undefined, easternResult.jingjie, '有境界');
test('东方心理 有 familyPattern', easternResult.familyPattern !== undefined, easternResult.familyPattern, '有家庭模式');
test('东方心理 有 culturalOrientation', easternResult.culturalOrientation !== undefined, easternResult.culturalOrientation, '有文化取向');

console.log('\n【9. analyzeCBT 认知行为分析】');

const cbtResult = analyzeCBT('我什么都做不好，什么都完了');
test('CBT 返回结果', cbtResult !== null, cbtResult !== null, true);
test('CBT 有 distortions', cbtResult.distortions !== undefined, cbtResult.distortions, '有扭曲');
test('CBT 有 questions', cbtResult.questions !== undefined, cbtResult.questions, '有问题');
test('CBT 检测到过度概括', cbtResult.distortions?.some(d => d.type === 'overgeneralization'), cbtResult.distortions?.map(d => d.type), '过度概括');

console.log('\n【10. inferMentalState 心智理论】');

const tomResult = inferMentalState('她肯定不想见我了');
test('ToM 返回结果', tomResult !== null, tomResult !== null, true);
test('ToM 有 level', tomResult.level !== undefined, tomResult.level, '有等级');
test('ToM 有 beliefs', tomResult.beliefs !== undefined, tomResult.beliefs, '有信念');
test('ToM 有 desires', tomResult.desires !== undefined, tomResult.desires, '有欲望');
test('ToM 有 intentions', tomResult.intentions !== undefined, tomResult.intentions, '有意图');

console.log('\n【11. detectDistortions 认知扭曲检测】');

const distortionResult = detectDistortions('我总是失败，永远都不可能成功');
test('扭曲检测 返回结果', distortionResult !== null, distortionResult !== null, true);
test('扭曲检测 hasDistortions=true', distortionResult.hasDistortions === true, distortionResult.hasDistortions, true);
test('扭曲检测 severity=high', distortionResult.severity === 'high', distortionResult.severity, 'high');

console.log('\n【12. generateSocraticQuestions 苏格拉底追问】');

const socraticResult = generateSocraticQuestions('我就是没用的人');
test('苏格拉底 返回结果', socraticResult !== null, socraticResult !== null, true);
test('苏格拉底 有 questions', socraticResult.questions !== undefined && socraticResult.questions.length > 0, socraticResult.questions?.length, '> 0');
test('苏格拉底 type=socratic', socraticResult.type === 'socratic', socraticResult.type, 'socratic');

console.log('\n【13. correctAnalysis 用户纠正】');

// 先做一个分析
const wrongAnalysis = analyzePsychology('今天天气不错');
const correction = '这是负面情绪表达，因为用户在说反话';
const corrected = correctAnalysis('今天天气不错', wrongAnalysis, correction);
test('correctAnalysis 返回结果', corrected !== null, corrected !== null, true);
test('correctAnalysis 有 corrected 字段', corrected.corrected !== undefined, corrected.corrected, '有纠正结果');

console.log('\n【14. getPsychologyAccuracy 准确率统计】');

const accuracy = getPsychologyAccuracy();
test('准确率 返回结果', accuracy !== null, accuracy !== null, true);
test('准确率 有 total 字段', accuracy.total !== undefined, accuracy.total, '有总数');
test('准确率 有 corrections 字段', accuracy.corrections !== undefined, accuracy.corrections >= 0, true);

console.log('\n【15. assessEmpathyAccuracy 共情准确性】');

const empathyResult = assessEmpathyAccuracy(
  '我能理解你感到沮丧，这在生活中很常见',
  '我最近总是失败，感觉自己很没用',
  'negative'
);
test('共情准确性 返回结果', empathyResult !== null, empathyResult !== null, true);
test('共情准确性 有 accuracy', empathyResult.accuracy !== undefined, empathyResult.accuracy, '有准确率');
test('共情准确性 有 level', empathyResult.level !== undefined, empathyResult.level, '有等级');

console.log('\n【16. detectResonance 情感共鸣】');

const resonanceResult = detectResonance('听到这个消息我太高兴了！');
test('情感共鸣 返回结果', resonanceResult !== null, resonanceResult !== null, true);
test('情感共鸣 有 dominantEmotion', resonanceResult.dominantEmotion !== undefined, resonanceResult.dominantEmotion, '有主情绪');

console.log('\n【17. recommendSupportiveResponse 支持性回应】');

const supportResult = recommendSupportiveResponse({
  emotion: '焦虑',
  intensity: 'high',
  crisisLevel: 'low'
});
test('支持性回应 返回结果', supportResult !== null, supportResult !== null, true);
test('支持性回应 有 recommendations', supportResult.recommendations !== undefined, supportResult.recommendations, '有建议');

console.log('\n【18. assessEmpathyFatigue 共情疲劳】');

const fatigueResult = assessEmpathyFatigue({
  conversationRounds: 50,
  emotionalIncidents: 10,
  supportProvided: 5
});
test('共情疲劳 返回结果', fatigueResult !== null, fatigueResult !== null, true);
test('共情疲劳 有 risk', fatigueResult.risk !== undefined, fatigueResult.risk, '有风险');

console.log('\n【19. getProfessionalDisclaimer 专业边界】');

const disclaimer = getProfessionalDisclaimer();
test('专业边界 返回结果', disclaimer !== null, disclaimer !== null, true);
test('专业边界 有 toolNature', disclaimer.toolNature !== undefined, disclaimer.toolNature, '有工具性质');

console.log('\n【20. suggestProfessionalHelp 建议寻求帮助】');

const helpSuggestion = suggestProfessionalHelp({
  crisisLevel: 'high',
  stressScore: 8,
  emotionIntensity: 'high',
  conversationRounds: 15
});
test('专业帮助 返回结果', helpSuggestion !== null, helpSuggestion !== null, true);
test('专业帮助 shouldRecommend=true', helpSuggestion.shouldRecommend === true, helpSuggestion.shouldRecommend, true);
test('专业帮助 有 resources', helpSuggestion.resources !== undefined, helpSuggestion.resources, '有资源');

console.log('\n【21. assessEmotionRegulation 情绪调节】');

const regulationResult = assessEmotionRegulation([1, 2, 1, 0, 2, 1, 0, 1]);
test('情绪调节 返回结果', regulationResult !== null, regulationResult !== null, true);
test('情绪调节 有 healthyScore', regulationResult.healthyScore !== undefined, regulationResult.healthyScore, '有健康分数');

console.log('\n【22. assessStress 压力量表】');

const stressResult = assessStress([2, 1, 2, 1, 0, 2, 1, 2, 1, 0]);
test('压力 返回结果', stressResult !== null, stressResult !== null, true);
test('压力 有 totalScore', stressResult.totalScore !== undefined, stressResult.totalScore, '有总分');

console.log('\n【23. assessSocialSupport 社会支持】');

const supportEvalResult = assessSocialSupport([3, 3, 2, 4]);
test('社会支持 返回结果', supportEvalResult !== null, supportEvalResult !== null, true);
test('社会支持 有 total', supportEvalResult.total !== undefined, supportEvalResult.total, '有总分');

console.log('\n【24. assessQualityOfLife 生活质量】');

const qolResult = assessQualityOfLife([7, 8, 6, 7, 8]);
test('生活质量 返回结果', qolResult !== null, qolResult !== null, true);
test('生活质量 有 qualityOfLifePercent', qolResult.qualityOfLifePercent !== undefined, qolResult.qualityOfLifePercent, '有百分比');

console.log('\n【25. comprehensivePsychologyAssessment 综合评估】');

const comprehensiveResult = comprehensivePsychologyAssessment({
  phq9: [1, 2, 1, 2, 1, 0, 1, 2, 1],
  gad7: [1, 2, 1, 1, 0, 1, 2],
  stress: [1, 2, 1, 2, 1, 0, 1, 2, 1, 0],
  emotionRegulation: [1, 2, 1, 0, 2, 1, 0, 1],
  socialSupport: [3, 3, 2, 4],
  qualityOfLife: [7, 8, 6, 7, 8]
});

// 检查字段名：overallLevel vs overall
const hasOverallLevel = comprehensiveResult.overallLevel !== undefined;
const hasOverall = comprehensiveResult.overall !== undefined;
test(
  '综合评估 字段名为 overallLevel',
  hasOverallLevel && !hasOverall,
  { hasOverallLevel, hasOverall },
  { hasOverallLevel: true, hasOverall: false }
);

test('综合评估 返回结果', comprehensiveResult !== null, comprehensiveResult !== null, true);
test('综合评估 有 factors', comprehensiveResult.factors !== undefined, comprehensiveResult.factors, '有因素');
test('综合评估 有 recommendations', comprehensiveResult.recommendations !== undefined, comprehensiveResult.recommendations, '有建议');

console.log('\n【26. optimizePsychologyPrompt 提示词优化】');

const optimizedPrompt = optimizePsychologyPrompt('我最近总是失眠，感觉压力很大');
test('提示词优化 返回结果', optimizedPrompt !== null, optimizedPrompt !== null, true);
test('提示词优化 有 systemPrompt', optimizedPrompt.systemPrompt !== undefined, optimizedPrompt.systemPrompt, '有系统提示');
test('提示词优化 有 userPrompt', optimizedPrompt.userPrompt !== undefined, optimizedPrompt.userPrompt, '有用户提示');

console.log('\n【27. critiqueAnalysis 自我批评】');

const analysis = analyzePsychology('我什么都做不好');
const critique = critiqueAnalysis(analysis, '我什么都做不好');
test('自我批评 返回结果', critique !== null, critique !== null, true);
test('自我批评 有 overallScore', critique.overallScore !== undefined, critique.overallScore, '有总分');
test('自我批评 有 needsImprovement', critique.needsImprovement !== undefined, critique.needsImprovement, '有改进标识');

// ═══ 打印最终结果 ═══

printResults();

// 清理
engine.stop();

process.exit(failed > 0 ? 1 : 0);
