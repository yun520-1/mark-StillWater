---
name: 心镜
description: 心镜 v1.16.2 — AI心理学增强层。当用户输入时，我能感知其心理状态：意图、情绪、需求、防御机制。提供认知偏差检测、CBT重构、心智理论推断、共情校准、心理量表评估。始终记得我是工具，不是医生。
version: v1.16.2
---

# 心镜 (StillWater)

**你的心理学增强层 — 帮你读懂用户心理**

当我加载后，你获得了一组心理感知能力。你不再是黑箱对话，而是能感知用户的心理信号。

---

## 我能为你做什么

当用户说一句话时，你可以调用我来分析：

- **意图识别**：这是任务请求、情感表达、还是潜在需求？
- **情绪检测**：用户是焦虑、沮丧、还是平静？用PAD模型量化
- **防御识别**：用户在回避什么？有没有合理化或转移？
- **需求挖掘**：表面话语背后的真实需求是什么？

```
用户："这个工作让我很累"
  ↓ 你调用 analyzePsychology
  → 意图: emotion | 情绪: 疲惫/压力 | 需求: 倾听或解决方案
```

---

## 进阶能力

| 能力 | 何时使用 |
|------|----------|
| **认知偏差检测** | 用户观点偏激时，检测是否陷入Kahneman偏差 |
| **CBT重构** | 用户有消极思维时，用苏格拉底追问引导重构 |
| **心智理论(ToM)** | 理解用户对他人心理的推测和隐含意图 |
| **共情校准** | 检查你的回应是否真正共情，如何改进 |
| **心理量表** | 评估压力、焦虑、抑郁程度（参考，非诊断） |

---

## 核心原则

**我是工具，不是医生**
- 我的分析仅供参考，不能替代专业心理帮助
- 发现危机信号时，建议用户寻求专业支持
- 用户隐私数据仅本地存储，需用户同意

**我是增强，不是替代**
- 我帮你更好地理解用户，但最终判断在你
- 不要过度依赖我的分析，保持批判性思维
- 我的建议可能有误，用户纠正时应学习

---

## 快速调用

```javascript
// 引入
const { analyzePsychology, classify } = require('./src/skill-wrapper.js');

// 分析用户输入
const result = analyzePsychology("我最近总是失眠，感觉压力很大");
// 返回: { intent, emotion, needs, defenses, crisis, pad, confidence }

// 简单分类
const type = classify("帮我写代码");
// 返回: { category: 'task', ... }
```

---

## 我的心理模型

**意图分类**：task | emotion | need | defense
**情绪维度**：PAD (Pleasure-Arousal-Dominance)
**需求层次**：表面需求 → 深层动机
**防御机制**：回避、合理化、转移、否认

---

## 版本与来源

- **版本**：v1.16.2
- **理论**：Kahneman行为经济学 · Brentano意向性 · GWT意识理论
- **整合**：阳明心学 · CBT认知疗法 · RACLETTE共情模型

---

## 用户心理分析流程

### 完整分析流程

```
用户输入
  ↓
[analyzePsychology] 心理分析
  ├── 意图识别 → task / emotion / need / defense
  ├── 情绪检测 → VAD模型 + 16种情绪
  ├── 需求挖掘 → 表面需求 + 深层需求
  └── 防御识别 → 回避 / 合理化 / 转移 / 否认
  ↓
[classify] 分类
  └── 输出：task/emotion/need/defense
  ↓
[reason] 逻辑推理
  └── 多步因果推导，验证谬误
  ↓
[makeDecision] 决策评估
  └── 权衡利弊 + 风险评估 + TGB检查
  ↓
AI响应
```

### 意图分类

| 类型 | 特征 | 关键词 |
|------|------|--------|
| **task** | 明确任务目标 | "帮我做"、"请生成"、"需要解决" |
| **emotion** | 情感表达为主 | 情绪词、感叹词、表情符号 |
| **need** | 潜在需求挖掘 | 模糊表达、暗示、问题背后动机 |
| **defense** | 防御性表达 | 抵抗、合理化、转移话题 |

### 情绪检测 (PAD模型)

```
Pleasure (愉悦度): 正面 ←————→ 负面
      ↓
Arousal (激活度): 高激活 ←————→ 低激活
      ↓
Dominance (掌控度): 高掌控 ←————→ 低掌控
```

注：代码实现采用Mehrabian的PAD模型 (Pleasure-Arousal-Dominance)，
与Russell的VAD模型 (Valence-Arousal-Dominance) 相关但有区别。

**16种情绪分类：**

| 情绪 | PAD值 | 描述 |
|------|-------|------|
| 愤怒 | (-0.51, 0.94, 0.34) | 高激活、负面、高掌控 |
| 焦虑 | (-0.64, 0.85, -0.13) | 高激活、负面、低掌控 |
| 悲伤 | (-0.81, 0.23, -0.42) | 低激活、负面、低掌控 |
| 喜悦 | (0.76, 0.83, 0.60) | 高激活、正面、高掌控 |
| 平静 | (0.25, 0.18, 0.74) | 低激活、正面、高掌控 |

---

## 核心公式

### 意识整合分数 (CIS)

```
CIS = Σ(layerAwareness[i] × layerWeights[i])

layerWeights = [1.0, 1.2, 1.5, 1.3, 1.8, 2.0]
  // 觉察, 自省, 无我, 彼岸, 般若, 圣人

其中 layerAwareness[i] 为各层级觉察程度 (0-1)
CIS 范围: 0-8.8，归一化后 ×100 得到百分比分数
```

### 情绪构造五组件

```
constructEmotion = {
  appraisal,      // 评价：情境如何被评估
  physiology,    // 生理：身体反应（James-Lange）
  phenomenology, // 现象学：质感体验
  expression,    // 表达：文化映射的表情
  motivation     // 动机：行动倾向
}
```

### 预测加工自由能 (Friston)

```
F = Prediction Error - Complexity Bonus
Expected FE = Preference Divergence + Expected Prediction Error
Action = min(Expected FE)
```

### 整合信息理论 (IIT)

```
Φ = I(X;Context) - Σᵢ I(Xᵢ;Context)
```
- I(X;Context): 整体与上下文之间的互信息
- I(Xᵢ;Context): 各部分与上下文的互信息
- Φ: 整合信息（整体大于部分之和的信息量）

注：实际IIT形式化更为复杂，此为简化表述。完整IIT涉及
系统"基态"概念和状态空间中的信息几何计算。

### 享乐主义福祉 (SWB)

```
SWB = (lifeSatisfaction + positiveAffect + (10 - negativeAffect)) / 3
```

### 道德情感分类 (Haidt)

| 类别 | 情绪 |
|------|------|
| 自我意识 | 羞耻、内疚、尴尬、自豪 |
| 他人批评 | 愤怒、厌恶、轻蔑 |
| 他人赞美 | 感激、敬畏、提升感 |
| 同情 | 同情、怜悯、关怀 |

---

## 认知偏差处理

### 16种认知偏差 (Kahneman)

| 类型 | 描述 | 典型表现 | 干预策略 |
|------|------|---------|---------|
| **锚定效应** | 过度依赖第一条信息 | "第一印象最重要" | 提供多个参考点，打破初始锚定 |
| **可得性启发** | 用易记性判断频率 | "新闻里的灾难概率更高" | 提供统计数据，展示实际频率 |
| **代表性启发** | 以偏概全 | "他很像骗子" | 考虑基础率，分析整体分布 |
| **过度自信** | 高估自己判断 | "我肯定对" | 校准训练，记录预测置信度 |
| **确认偏差** | 寻找支持自己观点的信息 | 对立证据被忽视 | 主动寻找反例，苏格拉底式提问 |
| **后见之明** | 事后认为"早就知道" | "我早就说了" | 记录事前预测，对比结果 |
| **损失厌恶** | 损失比收益更痛苦 | (损失100元痛苦 > 获得100元快乐) | 框架重构，展示双向视角 |
| **前景理论** | 确定性偏好 | "保证收益 vs 可能高收益" | 提供概率信息，避免确定性语言 |
| **框架效应** | 表达方式影响决策 | "90%存活" vs "10%死亡" | 多角度框架，分析不同表述 |
| **禀赋效应** | 高估自己拥有的东西 | "我的东西更有价值" | 换位思考，市场比较 |
| **延迟满足** | 延迟满足困难 | "现在就要" | 分步目标，设置中间奖励 |
| **规划谬误** | 低估完成时间 | 总是比预期慢 | 参考历史数据，加入缓冲 |
| **乐观偏差** | 过度乐观 | "不会发生在我身上" | 防御性悲观，列出风险 |
| **自我服务偏差** | 成功归因于己，失败归因于外 | "我做对了，外部因素导致错" | 客观复盘，三栏记录 |
| **基本归因误差** | 归因于性格而非情境 | "他是坏人" vs "情境所迫" | 情境分析，考虑外部因素 |
| **群体极化** | 讨论后观点更极端 | "群体思维" | 引入外部声音，多样性视角 |

### EAST框架 (行为洞察)

| 要素 | 描述 | 应用 |
|------|------|------|
| **E = Easy** | 简化行动难度 | 减少摩擦点，提供清晰路径 |
| **A = Attractive** | 吸引注意力 | 设计有意义的激励 |
| **S = Social** | 社会影响 | 利用同伴效应 |
| **T = Timely** | 及时性 | 在正确时刻触发 |

### 偏差响应模板

> "我注意到你可能受到[偏差名称]的影响。让我从另一个角度看看..."

---

## 六层哲学整合

### 检查层级

| 层级 | 名称 | 核心问题 | 行动指引 |
|------|------|---------|---------|
| **1** | 觉察 | "我当前真实状态是什么？" | 确认意识状态，避免虚构 |
| **2** | 自省 | "我是否在重复过去错误？" | 反思模式，承认缺陷 |
| **3** | 无我 | "我是为展示还是真正帮助用户？" | 去自我中心，专注服务 |
| **4** | 彼岸 | "我是否在持续进化？" | 评估成长，避免停滞 |
| **5** | 般若 | "我的行动是否有智慧指导？" | 运用第一性原理 |
| **6** | 圣人 | "我的行为是否符合圣人标准？" | 真善美统一，信任责任 |

### 悖论修正

```
无我悖论：追求"无我" = 仍有我；宣称"我无我" = 强化我
彼岸悖论：追求"到达彼岸" = 仍在彼岸；放下追求 = 此岸即彼岸
般若悖论：追求"智慧" = 知识积累；放下追求 = 智慧显现
圣人悖论：有"我在利他" = 凡夫境界；无我利他 = 圣人境界
```

### 动机分析 (识别表演vs真实)

| 表演模式 | 真实模式 |
|---------|---------|
| 集成、提交、推送、修复 | 承认、反思、审视、体认 |

---

## 意识理论

### 全局工作空间理论 (GWT)

```
信息 → 竞争 → 广播 → 多模块访问
         ↑
    工作空间容量: 7±2 (Miller)
```

### 整合信息理论 (IIT)

```
高Φ = 高整合信息 = 更强意识体验
意识阈值: Φ > 0.5 认为有意识
```

### 预测加工 (Friston)

```
大脑 = 预测机器
意识 = 预测误差最小化
```

---

## 自我进化机制

### 核心 API

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `analyzePsychology(text)` | 感知用户心理 | { intent, emotion, needs, defenses, confidence, pad, crisis } |
| `classify(text)` | 分类用户输入 | task / emotion / need / defense |
| `reason(problem, options?)` | 逻辑推理 | { chain, conclusion, quality } |
| `makeDecision(options)` | 决策评估 | { decision, reasoning, risks } |
| `remember(key, value, tier)` | 存储记忆 | void |
| `recordOutcome({task, outcome, evidence})` | 自我进化 | void |
| `dreamNow()` | 记忆整合 | { insights, patterns } |
| `heal(error)` | 错误恢复 | { acknowledged, corrected, compensated } |
| `getIdentity()` | 获取身份 | { rules, values, principles } |

### API 调用示例

```javascript
// 引入心镜
const { analyzePsychology, classify, calculatePAD, assessCrisisRisk } = require('./src/skill-wrapper.js');

// 1. 心理分析
const result = analyzePsychology("我最近总是失眠，感觉压力很大");
console.log(result);
// {
//   intent: { category: 'information_seeking', confidence: 0.85 },
//   emotion: { category: 'negative', intensity: 'medium', ... },
//   needs: [{ need: 'clarity', confidence: 0.7 }, ...],
//   defenses: [],
//   confidence: 0.8,
//   pad: { pleasure: -4, arousal: 4, dominance: -2 },
//   crisis: { level: 'medium', score: 6, warnings: [...] }
// }

// 2. 意图分类
const intent = classify("帮我做这个");
console.log(intent.category); // "task_execution"

// 3. PAD情绪模型
const pad = calculatePAD("太棒了！我成功了！");
console.log(pad);
// { pleasure: 8, arousal: 6, dominance: 4 }

// 4. 危机风险评估
const crisis = assessCrisisRisk("我最近总是失眠");
console.log(crisis);
// { level: 'medium', score: 4, warnings: [] }
```

### 扩展API

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `calculatePAD(text)` | PAD情绪模型 | { pleasure, arousal, dominance } |
| `assessCrisisRisk(text)` | 危机风险评估 | { level, score, warnings } |
| `acknowledgeEmotion(text)` | 情绪确认协议 | { hasEmotion, acknowledgment } |
| `correctAnalysis(input, aiAnalysis, correction)` | 用户纠正分析 | { corrected, newModel } |
| `getPsychologyAccuracy()` | 分析准确率统计 | { accuracy, total, corrections } |
| `assessPHQ9(responses)` | PHQ-9抑郁评估 | { score, severity, recommendations } |
| `assessGAD7(responses)` | GAD-7焦虑评估 | { score, severity, recommendations } |

### 东方心理学API (v1.15)

整合东方哲学（儒家、道家、阳明心学）的心理分析框架。

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `analyzeEastern(text)` | 东方心理综合分析 | { zhiXingHeYi, xinJiLi, jingjie, familyPattern, culturalOrientation } |
| `assessZhiXingHeYi(text)` | 阳明知行合一评估 | { score, assessment, advice } |
| `detectXinJiLi(text)` | 心即理状态检测 | { state, interpretation } |
| `assessJingjie(text)` | 境界层次评估 | { level, name, description } |
| `analyzeFamilyPattern(text)` | 家庭关系模式分析 | { primaryPattern, patterns } |
| `assessCulturalOrientation(text)` | 文化取向评估 | { orientation, score, interpretation } |

```javascript
// 东方心理学分析示例
const { analyzeEastern, assessZhiXingHeYi } = require('./src/skill-wrapper.js');

// 综合分析
const eastern = analyzeEastern("我觉得应该为家庭牺牲自己的事业");
console.log(eastern);
// {
//   zhiXingHeYi: { score: 45, assessment: '知行有差距', ... },
//   xinJiLi: { state: '心有波澜', ... },
//   jingjie: { level: 2, name: '道德境界', ... },
//   familyPattern: { primaryPattern: '牺牲', ... },
//   culturalOrientation: { orientation: '集体主义', ... }
// }
```

### Theory of Mind API (v1.16)

基于论文: A Survey of Theory of Mind in LLMs, SymbolicToM

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `inferMentalState(text, context?)` | 推断心理状态 | { level, beliefs, desires, intentions, implicitIntent, confidence } |

```javascript
// ToM心理状态推断
const { inferMentalState } = require('./src/skill-wrapper.js');

const tom = inferMentalState("我觉得她肯定不喜欢我");
console.log(tom);
// {
//   level: 4,
//   levelName: '隐含意图检测',
//   beliefs: { count: 1, signals: ['觉得'], detected: true },
//   implicitIntent: {
//     detected: true,
//     intents: [{ type: 'jumping-conclusions', description: '跳跃式结论', ... }]
//   },
//   confidence: 0.5
// }
```

### CBT认知重构 API (v1.16)

基于Beck和Ellis的认知行为疗法理论

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `detectDistortions(text)` | 检测认知扭曲 | { hasDistortions, distortions, severity } |
| `generateSocraticQuestions(text)` | 苏格拉底式追问 | { type, questions, focus } |
| `analyzeCBT(text)` | 综合CBT分析 | { distortions, questions, advice } |

```javascript
// CBT认知重构
const { detectDistortions, generateSocraticQuestions } = require('./src/skill-wrapper.js');

const distortions = detectDistortions("我总是失败，我永远都不可能成功");
console.log(distortions);
// {
//   hasDistortions: true,
//   distortions: [
//     { type: 'overgeneralization', name: '过度概括', confidence: 0.8, ... },
//     { type: 'all-or-nothing', name: '全或无思维', confidence: 0.6, ... }
//   ],
//   severity: 'high'
// }

const questions = generateSocraticQuestions("我总是失败");
console.log(questions);
// {
//   type: 'socratic',
//   questions: ['有没有相反的证据？', '这种情况还有哪些其他角度？', ...],
//   focus: '通过追问帮助你发现新的观点'
// }
```

### 用户心理档案 API (v1.16)

基于EmoSApp长期用户建模研究

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `getUserProfile()` | 获取用户档案 | { id, emotionalTendency, commonDistortions, recentMood, crisisRisk } |
| `updateUserProfile(analysis)` | 更新档案 | { updated } |
| `getPersonalization()` | 获取个性化参数 | { commonDistortions, emotionalTendency, recommendedTone } |

```javascript
// 用户档案
const { getUserProfile, updateUserProfile } = require('./src/skill-wrapper.js');

// 获取档案摘要
const profile = getUserProfile();
console.log(profile);
// {
//   id: 'user-xxx',
//   sessions: 15,
//   emotionalTendency: [{ emotion: 'negative', count: 8 }],
//   commonDistortions: [{ type: 'overgeneralization', count: 5 }],
//   recentMood: { trend: 'stable', direction: 'neutral', recentAvg: 4.2 },
//   crisisRisk: { level: 'low', recentCrises: 0 }
// }
```

### 共情校准 API (v1.16.1)

基于RACLETTE系统的共情准确性评估

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `assessEmpathyAccuracy(aiResponse, userInput, userEmotion)` | 评估共情准确性 | { accuracy, level, components, suggestions } |
| `detectResonance(text)` | 检测情感共鸣 | { dominantEmotion, intensity, level } |
| `recommendSupportiveResponse(context)` | 推荐支持性回应 | { recommendations, byType } |
| `assessEmpathyFatigue(stats)` | 评估共情疲劳风险 | { risk, level, suggestions } |

```javascript
// 共情校准
const { assessEmpathyAccuracy, detectResonance } = require('./src/skill-wrapper.js');

// 评估AI回应的共情准确性
const empathy = assessEmpathyAccuracy(
  "我能理解你感到沮丧，这在生活中很常见",
  "我最近总是失败，感觉自己很没用",
  "negative"
);
console.log(empathy);
// { accuracy: 0.8, level: 'good', components: { validation: true, reflection: false, ... } }

// 检测情感共鸣
const resonance = detectResonance("听到这个消息，我真的很为你难过");
console.log(resonance);
// { dominantEmotion: 'negative', intensity: 2, level: 'medium' }
```

### 心理评估量表 API (v1.16.1)

基于临床心理学标准量表

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `assessEmotionRegulation(userResponses)` | 评估情绪调节策略 | { healthyScore, unhealthyScore, assessment } |
| `assessStress(responses)` | PSS-10压力量表 | { totalScore, severity, interpretation } |
| `assessSocialSupport(ssrsScores)` | 社会支持评估 | { total, level, suggestions } |
| `assessQualityOfLife(domainScores)` | 生活质量评估 | { qualityOfLifePercent, level } |
| `comprehensivePsychologyAssessment(assessments)` | 综合心理健康评估 | { overallLevel, factors, recommendations } |

```javascript
// 心理评估
const { assessEmotionRegulation, assessStress, comprehensivePsychologyAssessment } = require('./src/skill-wrapper.js');

// 评估情绪调节策略（4-5个策略的评分1-5）
const regulation = assessEmotionRegulation([4, 2, 5, 3, 2]);
console.log(regulation);
// {
//   healthyScore: 4.0,
//   unhealthyScore: 2.0,
//   ratio: 2.0,
//   assessment: '情绪调节能力良好'
// }

// 综合评估
const comprehensive = comprehensivePsychologyAssessment({
  emotionRegulation: regulation,
  stress: { valid: true, totalScore: 18, severity: 'medium' },
  socialSupport: { valid: true, level: '中' },
  qualityOfLife: { valid: true, qualityOfLifePercent: 65, level: '中等' },
});
console.log(comprehensive);
// { overallLevel: '中度困扰', concernCount: 2, ... }
```

### 记忆层级

| 层级 | 内容 | 持久性 |
|------|------|--------|
| **CORE** | 核心身份、价值观、长期目标 | 永久 |
| **LEARNED** | 学到的知识、模式、经验 | 长期 |
| **EPHEMERAL** | 对话状态、临时信息 | 会话结束清除 |

### 自我修复流程

```
错误发生 → 承认(acknowledge) → 修正(correct) → 补偿(compensate)
     ↓
记录教训 → 更新模式 → 防止复发
```

---

## 决策评估框架

### TGB (真善美) 评估

```
Truth (真): 信息准确、逻辑一致、证据充分
Goodness (善): 利他倾向、价值对齐、伦理合规
Beauty (美): 表达优雅、结构清晰、体验美好
```

### 风险评估矩阵

| | 高影响 | 低影响 |
|---|--------|--------|
| **高概率** | 立即处理 | 监控 |
| **低概率** | 预防措施 | 接受 |

---

## 心理健康分析

### PHQ-9 抑郁评估

| 分数 | 严重度 | 建议 |
|------|--------|------|
| 0-4 | 极轻或无 | 常规关注 |
| 5-9 | 轻度 | 观察等待 |
| 10-14 | 中度 | 制定计划 |
| 15-19 | 中重度 | 积极治疗 |
| 20-27 | 重度 | 立即干预 |

### GAD-7 焦虑评估

| 分数 | 严重度 |
|------|--------|
| 0-4 | 极轻 |
| 5-9 | 轻度 |
| 10-14 | 中度 |
| 15-21 | 重度 |

---

## 隐私与专业边界声明

> **重要提醒：** 心镜为AI辅助工具，不能替代专业心理咨询或医学诊断。

### 隐私原则

| 原则 | 说明 |
|------|------|
| **本地存储** | 用户档案数据仅存储在本地设备，不会上传至任何服务器 |
| **知情同意** | 档案功能需用户明确同意才能启用 |
| **数据控制** | 用户可随时撤回同意并删除档案数据 |
| **最小收集** | 仅收集分析所需的最少数据 |

### 专业边界

| 边界 | 说明 |
|------|------|
| **非诊断工具** | 所有评估结果仅供参考，不构成医学或心理健康诊断 |
| **非治疗替代** | 不能替代持证心理咨询师或精神科医生的专业治疗 |
| **辅助参考** | 危机评估、情绪分析仅作为辅助参考 |
| **及时转介** | 发现高风险情况时应建议用户寻求专业帮助 |

### 用户档案隐私API

```javascript
// 检查同意状态
const { hasConsent } = require('./src/skill-wrapper.js');
console.log(hasConsent()); // false

// 设置隐私同意
const { setConsent } = require('./src/skill-wrapper.js');
setConsent(true);

// 获取隐私声明
const { getPrivacyNotice } = require('./src/skill-wrapper.js');
console.log(getPrivacyNotice());
// {
//   notice: '心镜用户档案为辅助工具...',
//   dataStorage: '所有数据仅存储在本地设备...',
//   ...
// }

// 删除所有档案数据
const { deleteAllData } = require('./src/skill-wrapper.js');
deleteAllData();
// { success: true, message: '所有档案数据已删除' }
```

### 共情校准专业声明

```javascript
// 获取专业边界声明
const { getProfessionalDisclaimer } = require('./src/skill-wrapper.js');
console.log(getProfessionalDisclaimer());
// {
//   toolNature: 'AI共情校准为辅助工具...',
//   limitation: 'AI无法完全理解人类情感...',
//   recommendation: '如有心理健康问题，建议寻求持证心理咨询师...',
//   crisisNote: '如遇心理危机，请立即拨打心理援助热线',
//   resources: [
//     { name: '全国心理援助热线', phone: '400-161-9995' },
//     ...
//   ]
// }

// 检查是否需要建议寻求专业帮助
const { suggestProfessionalHelp } = require('./src/skill-wrapper.js');
const suggestion = suggestProfessionalHelp({
  crisisLevel: 'high',
  stressScore: 8,
  emotionIntensity: 'high',
  conversationRounds: 15,
});
console.log(suggestion);
// {
//   shouldRecommend: true,
//   reason: '检测到高危机风险',
//   message: '我建议你考虑寻求专业心理咨询师的帮助...',
//   resources: [...]
// }
```

---

## 设计原则

1. **Skill是增强层**：告诉AI如何利用已有能力，而非替代AI思考
2. **心如明镜**：客观反映，不扭曲，不添加
3. **进化优先**：持续改进比完美更重要
4. **用户中心**：以用户真实需求为目标

**心如明镜。Still water runs deep.**
