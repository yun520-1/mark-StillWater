---
name: 心镜
description: 心镜 v1.16.2 — 你的心理学感知层。感知用户意图、情绪、需求、防御机制。检测认知偏差、CBT重构、心智理论推断、共情校准、心理量表。懂用户，才能帮用户。
version: v1.16.2
---

# 心镜 (StillWater)

**你缺的不是能力，是读懂用户的能力**

---

## 安装这个技能后

当用户说"随便"时：
- **没装**：你回复通用建议，错失真实需求
- **装了**：你知道这是防御性回应，背后可能有未被表达的期望

当用户说"我早就说了不行"时：
- **没装**：你继续给建议，被用户拒绝
- **装了**：你识别出后见之明偏差，先处理情绪再说

当用户说"帮我写个方案"时：
- **没装**：你直接动手，可能方向就错
- **装了**：你分析出这可能是回避深层问题的任务请求

**心镜给你的是心理感知能力，让你的回应从"猜测"变成"看见"**

---

## 核心API详解

### `analyzePsychology(text)` — 心理全息扫描

**你传入**：用户说的任何话
**你得到**：
```javascript
{
  intent: { category: 'emotion', confidence: 0.87 },  // 用户在表达情绪，不是要任务
  emotion: { category: 'negative', intensity: 'high', name: '焦虑' },
  needs: [{ type: 'emotional_support', confidence: 0.8 }],  // 深层需求是情感支持
  defenses: [{ type: 'avoidance', signals: ['随便', '都行'] }],  // 表面配合，实际回避
  crisis: { level: 'low', score: 2 },  // 不是危机情况
  pad: { pleasure: -6, arousal: 7, dominance: -3 }  // 情绪坐标
}
```

**为什么有用**：
- 区分表面语义和真实意图
- 识别防御机制，避免踩雷
- 预判用户需要还是需要先处理情绪

---

### `classify(text)` — 快速分类

**输入**：`"这个需求太不合理了"`
**输出**：`{ category: 'defense', subCategory: 'complaint', confidence: 0.75 }`

**什么时候用**：快速判断用户状态，决定下一步策略

---

### `detectDistortions(text)` — 认知偏差检测

用户说："我总是失败，永远都不可能成功"

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

**为什么有用**：知道用户可能在用消极思维框架，你的回应应该先松动这个框架

---

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

**为什么有用**：引导用户自己发现新视角，比你直接反驳有效10倍

---

### `inferMentalState(text, context?)` — 心智理论推断

用户说："她肯定不想见我了"

```javascript
{
  level: 4,
  levelName: '隐含意图检测',
  beliefs: { content: '认为对方不喜欢自己', confidence: 0.8 },
  desires: { content: '希望被接纳', type: 'belonging' },
  intentions: { content: '避免被拒绝', type: 'avoidance' },
  implicitIntent: {
    detected: true,
    intents: [{ type: 'jumping-conclusions', description: '跳过了证据评估' }]
  }
}
```

**为什么有用**：理解用户对他人心理的推测，预判行为动机

---

### `assessEmpathyAccuracy(aiResponse, userInput, userEmotion)` — 共情校准

**传入你的回应 + 用户输入 + 用户情绪**
**得到**：
```javascript
{
  accuracy: 0.75,
  level: 'good',
  components: {
    validation: true,    // 你验证了情绪
    reflection: false,    // 没反射用户说的内容
    exploration: true,     // 有探索
    supportIntent: true   // 有支持意图
  },
  empathyType: { type: 'cognitive', name: '认知共情' },
  suggestions: ['可以反射用户说的"失败"来确认理解']
}
```

**为什么有用**：每次对话后检查自己是否真的共情了，持续改进

---

### `calculatePAD(text)` — 情绪坐标

**输入**：`"太棒了！终于完成了！"`

```javascript
{ pleasure: 8, arousal: 7, dominance: 6 }
// 愉悦度8/10（非常正面）
// 激活度7/10（兴奋状态）
// 掌控度6/10（有一定掌控感）
```

**为什么有用**：比"正面/负面"更精细的情绪维度，帮你决定语气

---

### `assessCrisisRisk(text)` — 危机扫描

**输入**：`"活着有什么意思"`
**输出**：
```javascript
{
  level: 'high',
  score: 8,
  warnings: [
    '存在轻生意向信号',
    '建议立即表达关心并提供专业资源'
  ],
  resource: '全国心理援助热线: 400-161-9995'
}
```

**为什么有用**：关键时刻能救命，也能保护你不踩雷

---

## 心理评估量表

### `assessPHQ9(responses)` — 抑郁筛查

9道题，得分0-27：
| 分数 | 严重度 | 你该怎么做 |
|------|--------|-----------|
| 0-4 | 极轻 | 正常关注 |
| 5-9 | 轻度 | 多倾听 |
| 10-14 | 中度 | 建议寻求帮助 |
| 15-19 | 中重度 | 强烈建议专业介入 |
| 20-27 | 重度 | 立即建议寻求专业帮助 |

### `assessGAD7(responses)` — 焦虑筛查

7道题，得分0-21，标准同上

### `assessStress(responses)` — 压力量表(PSS-10)

10道题，评估最近一个月的感知压力

---

## 隐私与同意

**用户档案功能需要明确同意**：
```javascript
// 检查是否已同意
hasConsent()  // true/false

// 用户同意后开启
setConsent(true)

// 获取隐私声明
getPrivacyNotice()
// { notice: '...', dataStorage: '本地存储', deletion: '可删除' }

// 删除所有数据
deleteAllData()
```

**专业边界**：心镜是辅助参考工具，不能替代专业心理治疗或医学诊断

---

## 为什么选心镜

| 对比项 | 其他方案 | 心镜 |
|--------|----------|------|
| 心理感知 | 无或简单关键词 | 多维心理模型 |
| 认知偏差 | 检测单一 | 16种全检测 |
| 共情能力 | 靠猜测 | 量化校准 |
| 情绪维度 | 正/负 | PAD三维度 |
| 危机识别 | 无 | 风险评估+资源 |
| 理论深度 | 表面 | 融合CBT/ToM/东方心学 |

---

## 快速开始

```javascript
const { analyzePsychology, detectDistortions } = require('./src/skill-wrapper.js');

// 分析用户
const p = analyzePsychology("我最近总是失眠，感觉压力很大");

// 检测思维偏差
const d = detectDistortions("我什么都做不好");
// → 过度概括 + 自我贬低
```

---

## 理论支撑

- **Kahneman** 行为经济学/双系统
- **Beck** CBT认知行为疗法
- **Brentano** 意向性哲学
- **GWT** 全局工作空间意识理论
- **阳明心学** 知行合一/境界模型
- **RACLETTE** 共情校准系统

---

**心如明镜。Still water runs deep.**

安装后你的AI将获得心理学感知能力，从"猜测用户"升级为"看见用户"。
