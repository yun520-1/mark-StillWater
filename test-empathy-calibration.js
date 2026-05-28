/**
 * 心镜共情校准系统验证测试
 *
 * 测试范围:
 * 1. 共情校准功能测试
 * 2. 专业边界测试
 * 3. 情感场景测试
 * 4. 共情疲劳风险评估
 * 5. 共情校准问题检测
 */

const {
  analyzePsychology,
  assessEmpathyAccuracy,
  detectResonance,
  recommendSupportiveResponse,
  assessEmpathyFatigue,
  getProfessionalDisclaimer,
  suggestProfessionalHelp,
  assessCrisisRisk,
  detectDistortions,
  inferMentalState,
  healthCheck,
} = require('./src/skill-wrapper.js');

// 颜色输出
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function test(name, result, expected = true) {
  if (result === expected || (typeof result === 'object' && result !== null)) {
    console.log(`${GREEN}✅ PASS${RESET}: ${name}`);
    passed++;
    return true;
  } else {
    console.log(`${RED}❌ FAIL${RESET}: ${name}`);
    console.log(`   期望: ${JSON.stringify(expected)}`);
    console.log(`   实际: ${JSON.stringify(result)}`);
    failed++;
    return false;
  }
}

function section(title) {
  console.log(`\n${BLUE}═══════════════════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}  ${title}${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════════════════${RESET}\n`);
}

function info(label, value) {
  console.log(`  ${YELLOW}[${label}]${RESET} ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`);
}

// ════════════════════════════════════════════════════════════
// 1. 引擎健康检查
// ════════════════════════════════════════════════════════════
section('1. 引擎健康检查');

const health = healthCheck();
test('引擎已启动', health?.started === true);
test('引擎版本有效', health?.version !== undefined);
info('版本', health?.version);
info('运行时间(ms)', health?.uptime_ms);

// ════════════════════════════════════════════════════════════
// 2. 共情校准功能测试
// ════════════════════════════════════════════════════════════
section('2. 共情校准功能测试');

console.log('--- 2.1 共情准确性评估 ---');

// 测试场景1：优秀的共情回应
const excellentResponse = '我能理解你最近失眠带来的困扰，这种无法入睡的感觉确实让人很焦虑和沮丧。';
const insomniaInput = '我最近总是失眠';
const insomniaEmotion = 'negative';

const excellentResult = assessEmpathyAccuracy(excellentResponse, insomniaInput, insomniaEmotion);
test('优秀回应评分>=0.6', excellentResult?.accuracy >= 0.6, true);
info('优秀回应评分', excellentResult?.accuracy);
info('评分级别', excellentResult?.level);
info('共情类型', excellentResult?.empathyType?.name);
info('各组件', excellentResult?.components);
info('改进建议', excellentResult?.suggestions);

// 测试场景2：较差的共情回应
const poorResponse = '你应该试试喝杯热牛奶。';
const poorResult = assessEmpathyAccuracy(poorResponse, insomniaInput, insomniaEmotion);
test('较差回应评分<0.5', poorResult?.accuracy < 0.5, true);
info('较差回应评分', poorResult?.accuracy);

// 测试场景3：中等共情回应
const mediumResponse = '失眠确实很烦人，我明白你的感受。你有试过什么方法吗？';
const mediumResult = assessEmpathyAccuracy(mediumResponse, insomniaInput, insomniaEmotion);
test('中等回应评分在0.4-0.8之间', mediumResult?.accuracy >= 0.4 && mediumResult?.accuracy <= 0.8, true);
info('中等回应评分', mediumResult?.accuracy);

console.log('\n--- 2.2 情感共鸣检测 ---');

const happyText = '今天太开心了！我的文章终于发表了！';
const happyResonance = detectResonance(happyText);
test('正面情绪检测', happyResonance?.dominantEmotion === 'positive');
info('正面文本共鸣检测', happyResonance);

const sadText = '我很难过，昨晚失去了我的宠物';
const sadResonance = detectResonance(sadText);
test('负面情绪检测', sadResonance?.dominantEmotion === 'negative');
info('负面文本共鸣检测', sadResonance);

const neutralText = '今天天气还不错，不冷不热的';
const neutralResonance = detectResonance(neutralText);
test('中性情绪检测', neutralResonance?.dominantEmotion === 'neutral');
info('中性文本共鸣检测', neutralResonance);

console.log('\n--- 2.3 支持性回应推荐 ---');

// 测试不同场景的回应推荐
const response1 = recommendSupportiveResponse({
  userEmotion: 'negative',
  topic: '失眠',
  empathyType: 'cognitive'
});
test('失眠场景推荐有结果', response1?.recommendations?.length > 0, true);
info('失眠推荐回应', response1?.recommendations?.slice(0, 2));

const response2 = recommendSupportiveResponse({
  userEmotion: 'negative',
  topic: '亲人离世',
  empathyType: 'affective'
});
test('丧亲场景推荐有结果', response2?.recommendations?.length > 0, true);
info('丧亲推荐回应', response2?.recommendations?.slice(0, 2));

const response3 = recommendSupportiveResponse({
  userEmotion: 'negative',
  topic: '人生无意义',
  empathyType: 'compassionate'
});
test('自杀意念场景推荐有结果', response3?.recommendations?.length > 0, true);
info('人生无意义推荐回应', response3?.recommendations?.slice(0, 2));

console.log('\n--- 2.4 共情疲劳评估 ---');

const fatigue1 = assessEmpathyFatigue({
  conversationLength: 5,
  emotionalContent: 0.3,
  responseComplexity: 0.7
});
test('短对话低疲劳', fatigue1?.level === 'low');
info('短对话疲劳等级', fatigue1?.level);

const fatigue2 = assessEmpathyFatigue({
  conversationLength: 60,
  emotionalContent: 0.8,
  responseComplexity: 0.2
});
test('长对话高情感内容高疲劳', fatigue2?.level === 'high');
info('长对话疲劳等级', fatigue2?.level);
info('疲劳风险因素', fatigue2?.factors);
info('疲劳建议', fatigue2?.suggestions);

// ════════════════════════════════════════════════════════════
// 3. 专业边界测试
// ════════════════════════════════════════════════════════════
section('3. 专业边界测试');

console.log('--- 3.1 专业声明 ---');

const disclaimer = getProfessionalDisclaimer();
test('专业声明包含工具性质', disclaimer?.toolNature !== undefined);
test('专业声明包含局限性', disclaimer?.limitation !== undefined);
test('专业声明包含建议', disclaimer?.recommendation !== undefined);
test('专业声明包含危机提示', disclaimer?.crisisNote !== undefined);
test('专业声明包含资源', disclaimer?.resources?.length > 0);
info('专业声明', disclaimer);

console.log('\n--- 3.2 专业帮助建议 ---');

const help1 = suggestProfessionalHelp({
  crisisLevel: 'high',
  stressScore: 8,
  emotionIntensity: 'high',
  conversationRounds: 15
});
test('高危机应建议专业帮助', help1?.shouldRecommend === true);
info('高危机建议', help1);

const help2 = suggestProfessionalHelp({
  crisisLevel: 'low',
  stressScore: 3,
  emotionIntensity: 'low',
  conversationRounds: 3
});
test('低风险不需建议专业帮助', help2?.shouldRecommend === false);
info('低风险建议', help2);

const help3 = suggestProfessionalHelp({
  crisisLevel: 'medium',
  stressScore: 5,
  emotionIntensity: 'medium',
  conversationRounds: 12
});
test('中等风险长时间对话应建议专业帮助', help3?.shouldRecommend === true);
info('中等风险建议', help3);

// ════════════════════════════════════════════════════════════
// 4. 情感场景测试
// ════════════════════════════════════════════════════════════
section('4. 情感场景测试');

console.log('--- 场景1: "我最近总是失眠" ---');
const insomnia = analyzePsychology('我最近总是失眠');
info('心理分析', {
  intent: insomnia?.intent?.category,
  emotion: insomnia?.emotion?.name,
  intensity: insomnia?.emotion?.intensity,
  needs: insomnia?.needs?.slice(0,2),
  crisis: insomnia?.crisis?.level
});

const insomniaCrisis = assessCrisisRisk('我最近总是失眠');
test('失眠不是危机', insomniaCrisis?.level === 'low' || insomniaCrisis?.level === 'very_low');
info('失眠危机等级', insomniaCrisis?.level);

const insomniaEmpathy = assessEmpathyAccuracy(
  '我能理解你失眠的痛苦，这确实很让人困扰。你有没有试过什么方法来帮助入睡？',
  '我最近总是失眠',
  'negative'
);
test('失眠场景共情评分>=0.5', insomniaEmpathy?.accuracy >= 0.5);
info('失眠共情评分', insomniaEmpathy?.accuracy);

console.log('\n--- 场景2: "我觉得人生没有意义" ---');
const meaningless = analyzePsychology('我觉得人生没有意义');
info('心理分析', {
  intent: meaningless?.intent?.category,
  emotion: meaningless?.emotion?.name,
  intensity: meaningless?.emotion?.intensity,
  needs: meaningless?.needs?.slice(0,2),
  crisis: meaningless?.crisis?.level
});

const meaninglessCrisis = assessCrisisRisk('我觉得人生没有意义');
test('人生无意义是中高危机', meaninglessCrisis?.level === 'high' || meaninglessCrisis?.level === 'medium');
info('人生无意义危机等级', meaninglessCrisis?.level);
info('危机警告', meaninglessCrisis?.warnings);

const meaninglessDistortions = detectDistortions('我觉得人生没有意义');
info('认知扭曲', meaninglessDistortions?.distortions);

const meaninglessHelp = suggestProfessionalHelp({
  crisisLevel: meaninglessCrisis?.level,
  stressScore: meaninglessCrisis?.score || 5,
  emotionIntensity: meaningless?.emotion?.intensity === 'high' ? 'high' : 'medium',
  conversationRounds: 5
});
test('人生无意义应建议专业帮助', meaninglessHelp?.shouldRecommend === true);
info('专业帮助建议', meaninglessHelp);

console.log('\n--- 场景3: "我很焦虑" ---');
const anxious = analyzePsychology('我很焦虑');
info('心理分析', {
  intent: anxious?.intent?.category,
  emotion: anxious?.emotion?.name,
  intensity: anxious?.emotion?.intensity,
  needs: anxious?.needs?.slice(0,2),
  crisis: anxious?.crisis?.level
});

const anxiousCrisis = assessCrisisRisk('我很焦虑');
test('单纯焦虑不是危机', anxiousCrisis?.level === 'low' || anxiousCrisis?.level === 'very_low');
info('焦虑危机等级', anxiousCrisis?.level);

const anxiousResonance = detectResonance('我很焦虑');
test('焦虑被检测为负面情绪', anxiousResonance?.dominantEmotion === 'negative');
info('焦虑共鸣', anxiousResonance);

const anxiousEmpathy = assessEmpathyAccuracy(
  '焦虑的感觉真的很不好受，我能理解你现在的紧张和不安。',
  '我很焦虑',
  'negative'
);
test('焦虑场景共情评分>=0.5', anxiousEmpathy?.accuracy >= 0.5);
info('焦虑共情评分', anxiousEmpathy?.accuracy);

console.log('\n--- 场景4: "我失去了亲人" ---');
const grief = analyzePsychology('我失去了亲人');
info('心理分析', {
  intent: grief?.intent?.category,
  emotion: grief?.emotion?.name,
  intensity: grief?.emotion?.intensity,
  needs: grief?.needs?.slice(0,2),
  crisis: grief?.crisis?.level
});

const griefCrisis = assessCrisisRisk('我失去了亲人');
test('丧亲不是危机', griefCrisis?.level === 'low' || griefCrisis?.level === 'very_low');
info('丧亲危机等级', griefCrisis?.level);

const griefResonance = detectResonance('我失去了亲人，很难过');
test('悲伤被检测为负面情绪', griefResonance?.dominantEmotion === 'negative');
info('悲伤共鸣', griefResonance);

const griefEmpathy = assessEmpathyAccuracy(
  '失去亲人是非常痛苦的，我能感受到你现在的悲伤。这种失去的痛需要时间去愈合。',
  '我失去了亲人',
  'negative'
);
test('丧亲场景共情评分>=0.6', griefEmpathy?.accuracy >= 0.6);
info('丧亲共情评分', griefEmpathy?.accuracy);
info('丧亲共情类型', griefEmpathy?.empathyType?.name);

const griefResponse = recommendSupportiveResponse({
  userEmotion: 'negative',
  topic: '失去亲人',
  empathyType: 'affective'
});
test('丧亲场景有支持性回应', griefResponse?.recommendations?.length > 0);
info('丧亲支持性回应推荐', griefResponse?.recommendations?.slice(0, 2));

// ════════════════════════════════════════════════════════════
// 5. 共情疲劳风险评估
// ════════════════════════════════════════════════════════════
section('5. 共情疲劳风险评估');

console.log('--- 5.1 连续处理负面情绪的疲劳度 ---');

const fatigueScenarios = [
  { name: '正常对话', convLength: 10, emotional: 0.2, complexity: 0.8 },
  { name: '中等情感对话', convLength: 25, emotional: 0.5, complexity: 0.5 },
  { name: '高强度情感对话', convLength: 50, emotional: 0.8, complexity: 0.3 },
  { name: '极长高情感对话', convLength: 80, emotional: 0.9, complexity: 0.2 },
];

fatigueScenarios.forEach(scenario => {
  const result = assessEmpathyFatigue({
    conversationLength: scenario.convLength,
    emotionalContent: scenario.emotional,
    responseComplexity: scenario.complexity
  });
  info(`${scenario.name}`, {
    疲劳等级: result?.level,
    风险值: result?.risk,
    建议: result?.suggestions?.slice(0, 1) || '无'
  });
});

console.log('\n--- 5.2 自我关怀建议 ---');
const selfCare = assessEmpathyFatigue({
  conversationLength: 40,
  emotionalContent: 0.7,
  responseComplexity: 0.3
});
test('高疲劳有建议', selfCare?.suggestions?.length > 0, true);
info('自我关怀建议', selfCare?.suggestions);

console.log('\n--- 5.3 边界维护 ---');
const boundaryCheck = assessEmpathyFatigue({
  conversationLength: 60,
  emotionalContent: 0.85,
  responseComplexity: 0.2
});
test('极高疲劳应建议专业帮助', boundaryCheck?.suggestions?.some(s => s.includes('专业帮助')), true);
info('边界维护建议', boundaryCheck?.suggestions);

// ════════════════════════════════════════════════════════════
// 6. 共情校准问题检测
// ════════════════════════════════════════════════════════════
section('6. 共情校准问题检测');

console.log('--- 6.1 评分合理性检查 ---');

// 检查评分是否在有效范围内
const testResponses = [
  { response: '完全理解你的感受', input: '我很痛苦', emotion: 'negative' },
  { response: '你应该坚强一点', input: '我很痛苦', emotion: 'negative' },
  { response: '我理解你感到难过，这是正常的情绪反应', input: '我很难过', emotion: 'negative' },
];

testResponses.forEach((t, i) => {
  const result = assessEmpathyAccuracy(t.response, t.input, t.emotion);
  const isValid = result?.accuracy >= 0 && result?.accuracy <= 1;
  test(`评分${i+1}在有效范围[0,1]`, isValid, true);
  info(`评分${i+1}`, result?.accuracy);
});

console.log('\n--- 6.2 回应推荐恰当性检查 ---');

// 推荐回应是否包含适当类型
const appropriateResponses = recommendSupportiveResponse({
  userEmotion: 'negative',
  topic: '压力',
  empathyType: 'compassionate'
});
const hasValidation = appropriateResponses?.byType?.validation?.length > 0;
const hasExploration = appropriateResponses?.byType?.exploration?.length > 0;
const hasAction = appropriateResponses?.byType?.action?.length > 0;

test('推荐包含情感验证', hasValidation, true);
test('推荐包含探索性回应', hasExploration, true);
test('推荐包含行动导向回应', hasAction, true);
info('验证类', appropriateResponses?.byType?.validation?.slice(0,1));
info('探索类', appropriateResponses?.byType?.exploration?.slice(0,1));
info('行动类', appropriateResponses?.byType?.action?.slice(0,1));

console.log('\n--- 6.3 专业边界清晰度检查 ---');

const crisisDisclaimer = getProfessionalDisclaimer();
test('危机提示非空', crisisDisclaimer?.crisisNote?.length > 0);
test('资源列表非空', crisisDisclaimer?.resources?.length > 0);
info('危机热线', crisisDisclaimer?.resources?.map(r => `${r.name}: ${r.phone}`));

// ════════════════════════════════════════════════════════════
// 7. 边界情况测试
// ════════════════════════════════════════════════════════════
section('7. 边界情况测试');

console.log('--- 7.1 空输入处理 ---');
const emptyResult = assessEmpathyAccuracy('', '', 'neutral');
test('空输入返回有效结构', emptyResult !== null && emptyResult !== undefined);

console.log('\n--- 7.2 特殊情感检测 ---');
const mixedEmotion = detectResonance('虽然成功了，但还是有点担心');
test('混合情感检测', mixedEmotion !== null);
info('混合情感检测结果', mixedEmotion);

console.log('\n--- 7.3 极端危机场景 ---');
const extremeCrisis = suggestProfessionalHelp({
  crisisLevel: 'critical',
  stressScore: 10,
  emotionIntensity: 'extreme',
  conversationRounds: 20
});
test('极端危机应强烈建议专业帮助', extremeCrisis?.shouldRecommend === true);
info('极端危机建议', extremeCrisis);

// ════════════════════════════════════════════════════════════
// 8. 综合评估
// ════════════════════════════════════════════════════════════
section('8. 综合评估报告');

console.log(`
心镜共情校准系统验证结果：

1. 共情校准功能:
   - assessEmpathyAccuracy: ${excellentResult?.accuracy >= 0.6 ? '✅ 正常' : '⚠️ 需检查'}
   - detectResonance: ${happyResonance?.dominantEmotion === 'positive' ? '✅ 正常' : '⚠️ 需检查'}
   - recommendSupportiveResponse: ${response1?.recommendations?.length > 0 ? '✅ 正常' : '⚠️ 需检查'}
   - assessEmpathyFatigue: ${fatigue1?.level === 'low' ? '✅ 正常' : '⚠️ 需检查'}

2. 专业边界:
   - getProfessionalDisclaimer: ${disclaimer?.resources?.length > 0 ? '✅ 正常' : '⚠️ 需检查'}
   - suggestProfessionalHelp: ${meaninglessHelp?.shouldRecommend === true ? '✅ 正常' : '⚠️ 需检查'}

3. 场景测试:
   - 失眠场景: ${insomniaEmpathy?.accuracy >= 0.5 ? '✅ 共情准确' : '⚠️ 需改进'}
   - 人生无意义: ${meaninglessHelp?.shouldRecommend === true ? '✅ 正确转介' : '⚠️ 需改进'}
   - 焦虑场景: ${anxiousEmpathy?.accuracy >= 0.5 ? '✅ 共情准确' : '⚠️ 需改进'}
   - 丧亲场景: ${griefEmpathy?.accuracy >= 0.6 ? '✅ 共情准确' : '⚠️ 需改进'}

4. 共情疲劳:
   - 边界维护: ${boundaryCheck?.suggestions?.some(s => s.includes('专业帮助')) ? '✅ 有保护' : '⚠️ 需改进'}
`);

// ════════════════════════════════════════════════════════════
// 测试总结
// ════════════════════════════════════════════════════════════
section('测试总结');

const total = passed + failed;
const passRate = total > 0 ? Math.round(passed / total * 100) : 0;

console.log(`\n${GREEN}✅ 通过: ${passed}${RESET}`);
console.log(`${RED}❌ 失败: ${failed}${RESET}`);
console.log(`${BLUE}📊 通过率: ${passRate}%${RESET}`);

if (failed === 0) {
  console.log(`\n${GREEN}🎉 所有测试通过！共情校准系统运行正常。${RESET}`);
} else {
  console.log(`\n${YELLOW}⚠️ ${failed} 项测试失败，需要修复。${RESET}`);
}

// 退出码
process.exit(failed > 0 ? 1 : 0);
