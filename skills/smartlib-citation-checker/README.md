# SmartLib Citation Checker

> **中文** · [English below](#english)

基于 SmartLib 文献检索 API 的智能引用核查与纠错技能。适用于 WorkBuddy / SkillHub / ClawHub 等 AI Agent 平台。

**特别适用于：验证 AI 生成的参考文献是否真实存在，防止 AI 幻觉。**

[![Version](https://img.shields.io/badge/version-1.5-blue)](./SKILL.md)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Platform](https://img.shields.io/badge/platform-WorkBuddy%20|%20SkillHub%20|%20ClawHub-orange)]()

---

## 简介

**SmartLib Citation Checker** 对用户提交的论文稿件或 AI 生成的参考文献进行**真实性核查**与**格式纠错**。基于 SmartLib 全球文献检索 API（覆盖 8000 万篇中文期刊全文 + 10 亿篇全球文献元数据），自动解析引用、联网核查、逐字段比对差异，最终输出一份结构化的 HTML 核查报告。

支持 **GB/T 7714、APA、MLA、Chicago、BibTeX** 五种主流参考文献格式，**修正后输出格式始终与原始输入格式保持一致**。

---

## 适用场景

### 🤖 场景一：AI 幻觉验真（核心价值）

使用豆包、ChatGPT、Kimi、文心一言等 AI 工具辅助写论文时，AI 可能"编造"根本不存在的文献（即 AI 幻觉）。用本技能可以快速批量核查 AI 给出的所有参考文献是否真实，防止论文因引用不实文献而被拒稿或质疑。

> **样例**：用户使用豆包 AI 获得了一组参考文献，提交核查后，部分文献被标记为 ❌ 未找到（AI 编造），部分有字段错误（AI 记错了年份/作者），部分验证通过 ✅。完整报告见 [`examples/citation_check_ai_hallucination_sample.html`](./examples/citation_check_ai_hallucination_sample.html)。

### 📄 场景二：论文初稿审查

作者在投稿前，对论文稿件中的参考文献进行自查。核查作者姓名拼写、年份、期刊名、页码等是否准确，一键导出修正后的完整参考文献列表。

> **样例**：47 条 APA 格式参考文献的完整核查报告，见 [`examples/citation_check_paper_draft_sample.html`](./examples/citation_check_paper_draft_sample.html)。

### 📋 场景三：粘贴式批量核查

直接粘贴参考文献列表，快速验证真实性并导出修正版本。

---

## 功能特性

| 能力 | 说明 |
|------|------|
| **多格式解析** | 自动识别 GB/T 7714、APA 7、MLA 9、Chicago、BibTeX 格式，支持 .bib 文件 |
| **真实性核查** | 通过 SmartLib API 联网核查每条文献是否真实存在，标记 ✅ / ❌ / ⚠️ |
| **AI 幻觉检测** | 对 AI 编造的不存在文献明确标注 ❌ 未找到，帮助识别幻觉内容 |
| **信息比对** | 原始引用 vs 数据库记录逐字段比对（作者、年份、期刊、DOI 等） |
| **差异标记** | `[删除]` / `[新增]` 直观标记错误与修正（HTML+CSS 样式区分） |
| **格式保持** | 修正后输出格式 = 原始输入格式，双列表头同步标注 |
| **多格式导出** | 核查报告含 GB/T 7714、MLA、Chicago、BibTeX 额外格式 Tab 切换 |
| **统计分析** | 引用数量 >= 3 时自动输出年份分布、期刊集中度、作者分析图表 |
| **批量下载** | 支持全量下载 + 单条下载（Blob + createObjectURL） |
| **验证链接** | 每条匹配文献附带可点击的 SmartLib 验证链接 |
| **凭证引导** | API 未配置时自动给出三选项：申请 / 配置 / 先看样例 |

---

## 依赖

- **smartlib-literature-search** skill（必须，提供 SmartLib 文献检索 API 接入能力）
- SmartLib API 凭证（APPID + APPSECRET）
  - 在线申请：**https://www.vipslib.com/apply.html**
  - 邮件申请：**vipsmart@vipslib.com**（1 个工作日内回复）

---

## 安装

### WorkBuddy 用户

将本技能文件夹放入 `~/.workbuddy/skills/`（用户级）或 `{workspace}/.workbuddy/skills/`（项目级）：

```bash
cp -r smartlib-citation-checker ~/.workbuddy/skills/
```

### SkillHub / ClawHub 用户

通过平台技能市场安装，或直接导入 `SKILL.md`。

---

## 使用方式

在 WorkBuddy 对话中直接触发：

```
核查这篇论文的参考文献
```
```
帮我验证一下豆包/ChatGPT/Kimi 给的这些参考文献是否真实：
[1] Li, J., & Wang, X. (2023). Deep learning for medical imaging...
[2] Zhang, Y. et al. (2024). A survey on large language models...
```
```
检查 paper.pdf 里的引用是否有错误
```

**触发关键词**：核查参考文献、检查引用是否真实、纠正引用格式、文献校验、引用核查、AI生成的参考文献验真、citation check、verify references

---

## 输出示例

运行后生成一个完整的 HTML 核查报告，包含以下区块：

1. **报告头部** — 标题、核查时间、汇总徽章（总数 / 有差异 / 未找到 / 验证通过）
2. **核查结果表格** — 6 列：`#` / `状态` / `原始参考文献 (格式名)` / `修正后文献 (格式名，与原始格式一致)` / `主要差异` / `验证`
3. **修正后参考文献纯文本** — 全部引用按序拼接，纯净可复制
4. **多格式导出** — Tab 页签切换 GB/T 7714 / MLA / Chicago / BibTeX
5. **统计分析** — 年份分布、期刊分布、作者分析、机构来源（文献 >= 3）
6. **整体建议** — 基于分析结果的具体改进建议

> 📄 **样例一（论文稿件）**：[`examples/citation_check_paper_draft_sample.html`](./examples/citation_check_paper_draft_sample.html) — 47条 APA 参考文献完整核查报告
>
> 📄 **样例二（AI幻觉）**：[`examples/citation_check_ai_hallucination_sample.html`](./examples/citation_check_ai_hallucination_sample.html) — 豆包 AI 生成 30 篇酵母菌胰岛素主题文献的幻觉核查报告

---

## API 凭证申请

本技能依赖 SmartLib API。若未配置凭证，技能会自动弹出引导：

1. 技能自动检测凭证是否已配置
2. 如未配置，给出三选项：**申请** / **配置已有凭证** / **先查看样例报告**
3. 申请信息发送至 vipsmart@vipslib.com，或前往 [在线申请页](https://www.vipslib.com/apply.html)
4. 预计 1 个工作日内回复

**获取凭证后**，配置命令：
```
/config set SMARTLIB_APPID 你的APPID
/config set SMARTLIB_APPSECRET 你的APPSECRET
```

---

## 工作流程

```
用户提交引用（论文/AI生成/粘贴文本）
    │
    ▼
加载 smartlib-literature-search 依赖
    │
    ▼
检测 API Key → 已配置时静默通过 / 未配置时引导申请
    │
    ├── 并行 ──────────────────────────┐
    ▼                                  ▼
Step 1: 解析引用                Token 一次性获取并缓存
(本地计算，<1s)                 (网络请求，<2s)
    │                                  │
    └── 并行完成 ──────────────────────┘
    │
    ▼
Step 2: 联网核查（⚡ 并行检索，每批8条，智能终止回退）
    │
    ▼
Step 3: 匹配比对 — 逐字段对比原始 vs 数据库
    │
    ▼
Step 4: 差异分析 — 标记错误字段
    │
    ▼
Step 5: 生成报告 — 输出 HTML 核查报告
```

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| **1.5** | 2026-05-22 | **性能优化**：并行检索（8条/批）+ Token 缓存复用 + 智能提前终止回退 + 进度反馈；30条文献等待 60-120s → 8-15s |
| 1.4 | 2026-05-22 | 强化依赖加载；API Key 未配置时三选项引导；扩充 AI 幻觉验真场景；全文中英双语；新增豆包 AI 幻觉样例 |
| 1.3 | 2026-05-21 | 双列表头格式标注；纯文本框去重优化 |
| 1.2 | 2026-05-21 | 格式保持原则：修正输出 = 原始格式 |
| 1.1 | 2026-05-21 | 修正样例 APA 格式一致性 |
| 1.0 | 2026-05-21 | 初始定版 |

详见 [SKILL.md](./SKILL.md) § 版本历史。

---

## 作者

- **张亚东** — 重庆维普智图数据科技有限公司
- GitHub: [J-levee](https://github.com/J-levee)

---

## 相关项目

- [SmartLib 文献检索](https://github.com/J-levee/vip-smartlib) — 10 亿+文献元数据 API
- [经纶·知识服务平台](https://www.vipslib.com) — 企业级知识服务

---

## 许可

MIT License — 代码开源，商用 API 需授权。

---

<a name="english"></a>

---

# SmartLib Citation Checker — English

> Smart citation verification and correction skill powered by SmartLib API. Works on WorkBuddy / SkillHub / ClawHub platforms.
>
> **Especially useful for: detecting AI hallucinations in references generated by tools like Doubao, ChatGPT, or Kimi.**

---

## Overview

**SmartLib Citation Checker** verifies whether academic references in paper drafts or AI-generated citation lists actually exist, and corrects errors in author names, years, journal titles, and DOIs. Powered by SmartLib API (80M Chinese journal articles + 1B global literature metadata).

Supports **GB/T 7714, APA, MLA, Chicago, BibTeX** — corrected output always matches the original input format.

---

## Use Cases

### 🤖 Case 1: AI Hallucination Detection (Core Value)

AI writing tools (Doubao, ChatGPT, Kimi, etc.) sometimes generate fake references that don't actually exist. Use this skill to verify all AI-provided citations at once and identify hallucinations before submission.

> **Sample**: A user submits references provided by Doubao AI. Results: some marked ❌ Not Found (AI-fabricated), some have field errors (wrong year/author), some pass ✅. Full report: [`examples/citation_check_ai_hallucination_sample.html`](./examples/citation_check_ai_hallucination_sample.html)

### 📄 Case 2: Paper Draft Review

Authors self-check all references before journal submission — verify author spellings, years, journal names, page numbers, and export a corrected reference list.

> **Sample**: Full verification report for 47 APA references. See [`examples/citation_check_paper_draft_sample.html`](./examples/citation_check_paper_draft_sample.html)

### 📋 Case 3: Paste-and-Verify

Paste a reference list directly, verify authenticity, and download the corrected version.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-format Parsing** | Auto-detect GB/T 7714, APA 7, MLA 9, Chicago, BibTeX; supports .bib files |
| **Authenticity Check** | Live verification via SmartLib API, flagged as ✅ / ❌ / ⚠️ |
| **AI Hallucination Detection** | Non-existent references clearly labeled ❌ Not Found |
| **Field Comparison** | Original vs. database: author, year, journal, DOI, etc. |
| **Diff Markers** | `[删除]` / `[新增]` (deleted/added) inline diff with CSS highlighting |
| **Format Preservation** | Corrected output always matches original input format |
| **Multi-format Export** | Tab switching: GB/T 7714 / MLA / Chicago / BibTeX |
| **Citation Analytics** | Year distribution, journal concentration, author frequency (≥3 refs) |
| **Batch Download** | Full list or individual download via Blob + createObjectURL |
| **Verification Links** | Clickable SmartLib detail links for each verified reference |
| **Credential Guidance** | If API key missing: 3 options — apply / configure / preview sample |

---

## Dependencies

- **smartlib-literature-search** skill (required — provides SmartLib API access)
- SmartLib API credentials (APPID + APPSECRET)
  - Online application: **https://www.vipslib.com/apply.html**
  - Email: **vipsmart@vipslib.com** (reply within 1 business day)

---

## Installation

### WorkBuddy

```bash
cp -r smartlib-citation-checker ~/.workbuddy/skills/
```

### SkillHub / ClawHub

Install from the skill marketplace, or import `SKILL.md` directly.

---

## Usage

Trigger with natural language in WorkBuddy:

```
Verify the references in this paper
```
```
Check if these AI-generated citations are real:
[1] Li, J., & Wang, X. (2023). Deep learning for medical imaging...
[2] Zhang, Y. et al. (2024). A survey on large language models...
```

**Keywords**: verify references, check citations, citation hallucination, AI-generated references, 核查参考文献

---

## API Credentials

If credentials are not configured, the skill will automatically guide you:

1. Auto-detects missing credentials
2. Presents 3 options: **Apply** / **Configure existing** / **Preview sample report**
3. Apply at [https://www.vipslib.com/apply.html](https://www.vipslib.com/apply.html) or email vipsmart@vipslib.com
4. Reply within 1 business day

Once received:
```
/config set SMARTLIB_APPID your_appid
/config set SMARTLIB_APPSECRET your_appsecret
```

---

## Author

- **Yadong Zhang** — Chongqing VIP Smart Data Technology Co., Ltd.
- GitHub: [J-levee](https://github.com/J-levee)

---

## License

MIT License — Code is open source; commercial API use requires authorization.

---

## Related Projects

- [SmartLib Literature Search](https://github.com/J-levee/vip-smartlib) — 1B+ literature metadata API
- [Jinglun Knowledge Service Platform](https://www.vipslib.com) — Enterprise knowledge service
