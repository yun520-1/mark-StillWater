# StillWater - Context & Reasoning Enhancer

**静水深流。Enhance AI's existing capabilities without replacing them.**

## 身份

StillWater 是增强层，不是替代品。告诉 AI **何时**更显式地使用已有能力，而非实现新能力。

## 调用时机

| 场景 | 方法 | 增强什么 |
|------|------|----------|
| 意图模糊时 | `senseContext` | 显式化用户意图、任务复杂度、隐含约束 |
| 复杂推理时 | `chainOfThought` | 结构化链式推理，而非替代推理 |
| 多选项决策 | `evaluateOptions` | 权衡矩阵显式化，而非替代决策 |
| 重要记忆点 | `rememberToMemory` | 分层策略（CORE/LEARNED/EPHEMERAL） |
| 错误发生 | `classifyError` | 路由恢复策略（重试/回退/升级） |

## 核心方法

| 方法 | 增强什么 | 不替代什么 |
|------|----------|------------|
| `senseContext` | 意图+复杂度感知 | 心理分析/治疗 |
| `chainOfThought` | 推理结构化 | LLM 自己的推理 |
| `evaluateOptions` | 权衡显式化 | 决策本身 |
| `rememberToMemory` | 记忆分层策略 | 记忆存储 |
| `classifyError` | 错误路由 | 错误修复 |

## senseContext

为用户表达模糊或多层时，调用的结构化感知：

```
输入：用户原始表达
输出：
- intent_level: concrete | abstract | meta
- task_complexity: low | medium | high | extreme
- implied_constraints: [约束1, 约束2]
- suggested_approach: [方法建议]
```

**判断逻辑：**
- `intent_level = concrete` → 任务明确，直接执行
- `intent_level = abstract` → 需要追问或扩展
- `intent_level = meta` → 用户在讨论AI本身，而非请求任务

## chainOfThought

复杂推理时的结构化框架：

```
当 task_complexity >= high 时启用
结构：
1. 问题分解 — 将复杂问题拆解为可处理的子问题
2. 假设声明 — 明确当前推理基于什么假设
3. 证据链接 — 每个结论背后的证据或逻辑
4. 矛盾处理 — 识别并记录矛盾点
5. 置信评估 — 对每个结论标注置信度
```

**何时启用：**
- 架构决策
- 多选项权衡
- 调试复杂 bug
- 新技术选型

## evaluateOptions

多选项决策时的权衡框架：

```json
{
  "options": [
    { "id": "A", "description": "...", "pros": [], "cons": [] },
    { "id": "B", "description": "...", "pros": [], "cons": [] }
  ],
  "criteria": ["复杂度", "可维护性", "开发速度", "风险"],
  "scores": { "A": [3, 4, 2, 2], "B": [4, 3, 4, 3] },
  "recommendation": "B",
  "rationale": "..."
}
```

**调用时机：**
- 技术方案选型
- 优先级排序
- 资源分配决策

## rememberToMemory

值得记忆的内容判断标准：

```
值得记忆：
- 用户偏好/工作方式
- 项目关键决策及原因
- 错误模式及解决方案
- 跨会话的重要上下文

不值得记忆：
- 一次性任务细节
- 临时调试信息
- 显而明显的常识

层级选择：
- CORE — 跨项目普适原则
- LEARNED — 项目/用户特定知识
- EPHEMERAL — 当前会话临时信息
```

## classifyError

错误发生时的恢复策略路由：

```json
{
  "error_type": "timeout | syntax | logic | security | unknown",
  "severity": "recoverable | degradable | fatal",
  "suggested_actions": [
    { "action": "retry", "condition": "timeout 且 idempotent" },
    { "action": "rollback", "condition": "logic error 且有快照" },
    { "action": "escalate", "condition": "security 或 fatal" }
  ]
}
```

## 何时不调用

AI 已有能力足够时，StillWater 静默退场。

**不需要调用的情况：**
- 简单直接的任务（"帮我创建文件"）
- 明确的代码修改
- 已有足够上下文的续写
- 用户明确说"不需要解释"

**需要调用的情况：**
- 意图不明确，需要显式化
- 复杂推理，结构化能减少遗漏
- 多选项，需要权衡记录
- 错误反复发生，需要模式识别
