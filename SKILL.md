---
name: 心镜
description: 心镜 v1.17 — 你的心理学感知层。感知用户意图、情绪、需求、防御机制。检测认知偏差、CBT重构、心智理论推断、共情校准、心理量表、提示词优化、自我批评校准。懂用户，才能帮用户。
version: v1.17
---

# 心镜 (StillWater)

**你缺的不是能力，是读懂用户的能力**

当用户说"随便"时：
- **没装**：你回复通用建议，错失真实需求
- **装了**：你知道这是防御性回应，背后可能有未被表达的期望

当用户说"我早就说了不行"时：
- **没装**：你继续给建议，被用户拒绝
- **装了**：你识别出后见之明偏差，先处理情绪再说

心镜给你的是心理感知能力，让你的回应从"猜测"变成"看见"。

---

## 全部API清单

### 核心分析API

| API | 功能 | 返回值 |
|-----|------|--------|
| `analyzePsychology(text)` | 心理全息扫描 | intent, emotion, needs, defenses, pad, crisis |
| `classify(text)` | 快速分类 | category, emotion, confidence |
| `reason(problem, opts?)` | 逻辑推理 | chain, conclusion, quality |
| `makeDecision(options, context)` | 决策评估 | decision, reasoning, risks |
| `acknowledgeEmotion(text)` | 情绪确认 | hasEmotion, acknowledgment, canAnalyze |

### 情绪与评估API

| API | 功能 | 返回值 |
|-----|------|--------|
| `calculatePAD(text)` | PAD情绪模型 | pleasure, arousal, dominance |
| `assessCrisisRisk(text)` | 危机风险扫描 | level, score, warnings, resource |
| `assessPHQ9(responses)` | PHQ-9抑郁评估 | score, severity, recommendations |
| `assessGAD7(responses)` | GAD-7焦虑评估 | score, severity, recommendations |
| `assessStress(responses)` | PSS-10压力量表 | totalScore, severity, interpretation |
| `assessEmotionRegulation(responses)` | 情绪调节评估 | healthyScore, unhealthyScore, ratio |
| `assessSocialSupport(scores)` | 社会支持评估 | total, level, suggestions |
| `assessQualityOfLife(domains)` | 生活质量评估 | qualityOfLifePercent, level |
| `comprehensivePsychologyAssessment(assessments)` | 综合心理健康评估 | overallLevel, factors, recommendations |

### 认知与思维API

| API | 功能 | 返回值 |
|-----|------|--------|
| `detectDistortions(text)` | 认知扭曲检测 | hasDistortions, distortions, severity |
| `generateSocraticQuestions(text)` | 苏格拉底式追问 | type, questions, focus |
| `analyzeCBT(text)` | 综合CBT分析 | distortions, questions, advice |
| `inferMentalState(text, context?)` | 心智理论推断 | level, beliefs, desires, intentions, implicitIntent |

### 共情与沟通API

| API | 功能 | 返回值 |
|-----|------|--------|
| `assessEmpathyAccuracy(aiResponse, userInput, userEmotion)` | 共情准确性评估 | accuracy, level, components, empathyType, suggestions |
| `detectResonance(text)` | 情感共鸣检测 | dominantEmotion, intensity, level |
| `recommendSupportiveResponse(context)` | 支持性回应推荐 | recommendations, byType |
| `assessEmpathyFatigue(stats)` | 共情疲劳风险 | risk, level, factors, suggestions |
| `getProfessionalDisclaimer()` | 专业边界声明 | toolNature, limitation, recommendation, crisisNote, resources |
| `suggestProfessionalHelp(context)` | 建议寻求帮助 | shouldRecommend, reason, message, resources |

### 东方心理学API

| API | 功能 | 返回值 |
|-----|------|--------|
| `analyzeEastern(text)` | 东方心理综合分析 | zhiXingHeYi, xinJiLi, jingjie, familyPattern, culturalOrientation |
| `assessZhiXingHeYi(text)` | 知行合一评估 | score, assessment, advice |
| `detectXinJiLi(text)` | 心即理状态检测 | state, interpretation |
| `assessJingjie(text)` | 境界层次评估 | level, name, description |
| `analyzeFamilyPattern(text)` | 家庭关系模式 | primaryPattern, patterns |
| `assessCulturalOrientation(text)` | 文化取向评估 | orientation, score, interpretation |

### 用户档案API

| API | 功能 | 返回值 |
|-----|------|--------|
| `getUserProfile()` | 获取用户档案 | id, sessions, emotionalTendency, commonDistortions, recentMood, crisisRisk |
| `updateUserProfile(analysis)` | 更新档案 | updated |
| `getPersonalization()` | 获取个性化参数 | commonDistortions, emotionalTendency, recommendedTone |
| `hasConsent()` | 检查隐私同意 | true/false |
| `setConsent(consent)` | 设置隐私同意 | success, message |
| `getPrivacyNotice()` | 获取隐私声明 | notice, dataStorage, dataControl, deletion |
| `deleteAllData()` | 删除所有档案 | success, message |

### 记忆与进化API

| API | 功能 | 返回值 |
|-----|------|--------|
| `remember(key, value, tier)` | 存储记忆 | void |
| `recordOutcome({task, outcome, evidence})` | 记录结果 | void |
| `dreamNow()` | 梦境整合 | insights, patterns |
| `heal(error, stampId?)` | 错误恢复 | acknowledged, corrected, compensated |
| `getIdentity()` | 获取身份 | rules, state, summary, confidence |
| `getMemoryStats()` | 记忆统计 | tier, count, size |
| `search(query)` | 搜索记忆 | results |
| `correctAnalysis(input, wrongAnalysis, correction)` | 用户纠正 | corrected, newModel |
| `getPsychologyAccuracy()` | 分析准确率 | accuracy, total, corrections |

### 系统API

| API | 功能 | 返回值 |
|-----|------|--------|
| `healthCheck()` | 健康检查 | status, modules |
| `getEngine()` | 获取引擎实例 | engine |

### 提示词优化API (v1.17)

| API | 功能 | 返回值 |
|-----|------|--------|
| `optimizePsychologyPrompt(text, analysis?)` | 优化心理分析提示词 | systemPrompt, userPrompt, reasoningChain, fullPrompt |
| `optimizeEmpathyPrompt(text, analysis)` | 优化共情回应提示词 | systemPrompt, userPrompt, reasoningChain, fullPrompt |
| `optimizeCBTPrompt(text, distortions)` | 优化CBT重构提示词 | systemPrompt, userPrompt, reasoningChain, fullPrompt |

### 自我批评校准API (v1.17)

| API | 功能 | 返回值 |
|-----|------|--------|
| `critiqueAnalysis(analysis, userInput)` | 批评心理分析 | overallScore, needsImprovement, issues, suggestions |
| `generateRefinementPrompt(critique)` | 生成改进prompt | refinementPrompt |
| `calibrateConfidence(rawConfidence, signals)` | 置信度校准 | calibratedConfidence |

---

## 核心API详解

### `analyzePsychology(text)` — 心理全息扫描

**输入**：用户说的任何话
**输出**：
```javascript
{
  intent: { category: 'emotion', confidence: 0.87 },
  emotion: { category: 'negative', intensity: 'high', name: '焦虑' },
  needs: [{ type: 'emotional_support', confidence: 0.8 }],
  defenses: [{ type: 'avoidance', signals: ['随便', '都行'] }],
  crisis: { level: 'low', score: 2 },
  pad: { pleasure: -6, arousal: 7, dominance: -3 }
}
```

### `detectDistortions(text)` — 认知扭曲检测

**输入**：`"我总是失败，永远都不可能成功"`
**输出**：
```javascript
{
  hasDistortions: true,
  distortions: [
    { type: 'overgeneralization', name: '过度概括', evidence: '总是...永远...' },
    { type: 'all-or-nothing', name: '全或无思维', evidence: '不可能成功' }
  ],
  severity: 'high'
}
```

### `generateSocraticQuestions(text)` — 苏格拉底追问

**输入**：`"我就是个失败者"`
**输出**：
```javascript
{
  type: 'socratic',
  questions: [
    "有没有什么时候你觉得自己不是失败者？",
    "你说的'失败者'是谁定义的？",
    "如果你的朋友这样说自己，你会怎么看？"
  ],
  focus: '松动绝对化思维'
}
```

### `inferMentalState(text, context?)` — 心智理论

**输入**：`"她肯定不想见我了"`
**输出**：
```javascript
{
  level: 4,
  levelName: '隐含意图检测',
  beliefs: { content: '认为对方不喜欢自己', confidence: 0.8 },
  desires: { content: '希望被接纳', type: 'belonging' },
  intentions: { content: '避免被拒绝', type: 'avoidance' },
  implicitIntent: { detected: true, intents: [{ type: 'jumping-conclusions' }] }
}
```

### `assessEmpathyAccuracy(aiResponse, userInput, userEmotion)` — 共情校准

```javascript
{
  accuracy: 0.75,
  level: 'good',
  components: {
    validation: true,    // 验证了情绪
    reflection: false,   // 没反射内容
    exploration: true,   // 有探索
    supportIntent: true  // 有支持意图
  },
  empathyType: { type: 'cognitive', name: '认知共情' },
  suggestions: ['可以反射用户说的"失败"来确认理解']
}
```

### `assessCrisisRisk(text)` — 危机扫描

**输入**：`"活着有什么意思"`
**输出**：
```javascript
{
  level: 'high',
  score: 8,
  warnings: ['存在轻生意向信号', '建议立即表达关心'],
  resource: '全国心理援助热线: 400-161-9995'
}
```

---

## 心理评估量表详解

### PHQ-9 抑郁筛查（9题，0-27分）

| 分数 | 严重度 | 建议行动 |
|------|--------|----------|
| 0-4 | 极轻或无 | 常规关注 |
| 5-9 | 轻度 | 多倾听陪伴 |
| 10-14 | 中度 | 建议寻求心理帮助 |
| 15-19 | 中重度 | 强烈建议专业介入 |
| 20-27 | 重度 | 立即建议寻求专业帮助 |

### GAD-7 焦虑筛查（7题，0-21分）

| 分数 | 严重度 | 建议行动 |
|------|--------|----------|
| 0-4 | 极轻 | 常规关注 |
| 5-9 | 轻度 | 放松训练 |
| 10-14 | 中度 | 建议寻求帮助 |
| 15-21 | 重度 | 专业治疗介入 |

### PSS-10 压力量表（10题，0-40分）

| 分数 | 严重度 | 建议行动 |
|------|--------|----------|
| 0-12 | 低 | 正常 |
| 13-19 | 中 | 关注压力管理 |
| 20-40 | 高 | 压力管理干预 |

---

## 隐私与专业边界

### 隐私API

```javascript
// 检查同意状态
hasConsent()  // true/false

// 设置隐私同意
setConsent(true)

// 获取隐私声明
getPrivacyNotice()
// {
//   notice: '心镜用户档案为辅助工具...',
//   dataStorage: '所有数据仅存储在本地设备...',
//   dataControl: '用户可随时撤回同意或调用deleteAllData()删除数据',
//   deletion: '调用deleteAllData()可程序化删除所有档案数据'
// }

// 删除所有数据
deleteAllData()
// { success: true, message: '所有档案数据已删除' }
```

### 专业边界

**心镜是辅助参考工具，不能替代**：
- 专业心理咨询或治疗
- 医学诊断
- 危机干预

**发现高风险时的正确做法**：
```javascript
const suggestion = suggestProfessionalHelp({
  crisisLevel: 'high',
  stressScore: 8,
  emotionIntensity: 'high',
  conversationRounds: 15,
});
// suggestion.shouldRecommend === true
// suggestion.resources 包含心理援助热线
```

---

## 完整调用示例

```javascript
const {
  analyzePsychology,
  detectDistortions,
  generateSocraticQuestions,
  assessCrisisRisk,
  classify,
  calculatePAD,
  inferMentalState,
  assessEmpathyAccuracy,
} = require('./src/skill-wrapper.js');

// 1. 分析用户心理
const p = analyzePsychology("我最近总是失眠，感觉压力很大");

// 2. 检测认知扭曲
const d = detectDistortions("我什么都做不好，什么都完了");

// 3. 生成苏格拉底追问
const q = generateSocraticQuestions("我就是没用的人");

// 4. 评估危机风险
const c = assessCrisisRisk("活着真没意思");

// 5. 快速分类
const cl = classify("随便吧，怎么都行");

// 6. 计算情绪坐标
const pad = calculatePAD("太棒了！终于成功了！");

// 7. 推断心智状态
const tom = inferMentalState("他肯定觉得我在炫耀");

// 8. 校准共情
const empathy = assessEmpathyAccuracy(
  "我能理解你感到沮丧，这在生活中很常见",
  "我最近总是失败，感觉自己很没用",
  "negative"
);
```

---

## 分步提示词优化 (v1.17)

基于最新AI论文实现的增强方案：

### 核心思路

```
传统方式：
用户输入 → 直接调用大模型 → 输出

增强方式：
用户输入 → 小模型分析/推理 → 构建优化提示词 → 大模型 → 更好输出
```

### 第一步：提示词优化

```javascript
const { optimizePsychologyPrompt, critiqueAnalysis } = require('./src/skill-wrapper.js');

// 获取优化后的提示词组件
const optimized = optimizePsychologyPrompt(
  "我最近总是失眠，感觉压力很大",
  null // 可传入初步分析
);

// 返回：
// {
//   systemPrompt: "你是一个专业的心理分析专家...",
//   userPrompt: "请分析以下用户输入...",
//   reasoningChain: "【思维链推理】步骤1...\n步骤2...",
//   metacognitionPrompt: "【元认知检查】...",
//   fullPrompt: "完整的优化提示词"
// }
```

### 第二步：自我批评校准

```javascript
// 分析后进行自我批评
const analysis = analyzePsychology("我什么都做不好");
const critique = critiqueAnalysis(analysis, "我什么都做不好");

// 返回：
// {
//   overallScore: 0.72,
//   needsImprovement: true,
//   issues: ["置信度偏高：没有检测到明显信号但置信度高"],
//   suggestions: ["建议更仔细地检查用户输入中的隐含信号"],
//   refinedAnalysis: { ... }  // 如果需要改进
// }
```

### 应用场景

| 场景 | 优化方法 |
|------|----------|
| 复杂心理分析 | CoT思维链 + 自我批评 |
| 共情回应生成 | 基于分析的定制化提示词 |
| CBT重构 | 识别扭曲 + 苏格拉底追问模板 |
| 快速分类 | 跳过优化，直接用小模型 |

### 论文支撑

| 论文 | 核心思想 |
|------|----------|
| **PromptBreeder (DeepMind 2024)** | 进化式提示词优化 |
| **Self-Refine (CMU 2024)** | 生成→批评→改进迭代 |
| **Quiet-STAR (OpenAI 2024)** | 内隐思维训练 |
| **CoT (Google 2022)** | 思维链推理 |
| **LLM-as-a-Judge (DeepMind 2024)** | 模型评估质量 |

---

## 理论支撑

| 理论 | 应用 |
|------|------|
| **Kahneman双系统** | 认知偏差检测与干预 |
| **Beck CBT** | 认知扭曲检测与重构 |
| **Brentano意向性** | 意图识别 |
| **GWT全局工作空间** | 意识建模 |
| **阳明心学** | 知行合一、境界模型 |
| **RACLETTE** | 共情校准 |
| **Mehrabian PAD** | 情绪量化 |
| **PromptBreeder** | 提示词进化优化 |
| **Self-Refine** | 自我批评迭代 |

---

**心如明镜。Still water runs deep.**

安装后你的AI将获得心理学感知能力，从"猜测用户"升级为"看见用户"。
