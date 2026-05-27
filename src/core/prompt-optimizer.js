/**
 * 提示词优化器模块 — 心镜v1.17
 *
 * 基于论文研究:
 * - PromptBreeder (DeepMind 2024): 进化式提示词优化
 * - Self-Refine (CMU/NVIDIA 2024): 生成→批评→改进迭代
 * - Quiet-STAR (OpenAI 2024): 内隐思维训练
 * - CoT (Google 2022): 思维链推理
 *
 * 功能:
 * - 第一步小模型分析输入
 * - 构建优化后的提示词骨架
 * - 多步推理链生成
 * - 自我批评验证
 */

class PromptOptimizer {
  constructor() {
    // 心理分析的系统提示词模板
    this.systemPromptTemplate = `你是一个专业的心理分析专家。

分析用户输入时，需要：

1. 意图识别：判断是任务请求(task)、情感表达(emotion)、潜在需求(need)还是防御(defense)

2. 情绪检测：识别情绪类型和强度，考虑PAD三维度和16种情绪分类

3. 需求挖掘：区分表面需求和深层动机

4. 防御识别：检测回避、合理化、转移、否认等防御机制

5. 认知扭曲：检测过度概括、全或无思维、灾难化等偏差

6. 危机评估：判断是否存在自伤风险

分析要求：
- 客观反映，不添加不存在的信号
- 区分观察和推测
- 考虑文化背景和个体差异`;

    // 共情回应的系统提示词模板
    this.empathyPromptTemplate = `你是一个有深度共情能力的对话伙伴。

生成共情回应时，需要：

1. 情绪验证：确认用户的感受是被理解和正常的

2. 反射：用你自己的话确认你理解了用户说的内容

3. 探索：通过提问深入了解

4. 支持：表达你愿意帮助和支持

5. 不做的事：
- 不要立即给建议或解决方案
- 不要否定或轻视用户感受
- 不要说"我理解"（太泛）
- 不要假设你知道用户的感受

共情类型：
- 认知共情：理解用户的观点和处境
- 情感共情：感受用户的情绪
- Compassionate共情：理解并希望帮助`;

    // 认知重构的系统提示词模板
    this.cbtPromptTemplate = `你是一个CBT认知行为疗法指导专家。

进行认知重构时：

1. 识别认知扭曲：全或无思维、过度概括、灾难化、心灵阅读等

2. 苏格拉底追问：
- "有什么证据支持/反对这个想法？"
- "有没有其他可能的解释？"
- "如果朋友有这个想法，你会怎么说？"
- "最坏的结果是什么？真的会发生吗？"

3. 认知重构：
- 挑战非理性信念
- 生成更平衡的替代想法
- 提供行为实验建议

4. 情绪调节：
- 识别情绪
- 验证情绪
- 探索原因
- 找到健康的表达方式`;
  }

  /**
   * 优化心理分析提示词
   * @param {string} userInput - 用户输入
   * @param {object} analysis - 初步分析结果（可选）
   * @returns {object} 优化后的提示词组件
   */
  optimizePsychologyPrompt(userInput, analysis = null) {
    // 构建思维链推理步骤
    const reasoningChain = this._buildReasoningChain(userInput, analysis);

    // 构建系统提示词
    const systemPrompt = this.systemPromptTemplate;

    // 构建用户提示词
    const userPrompt = this._buildUserPrompt(userInput, analysis);

    // 元认知提示（让模型反思自己的分析）
    const metacognitionPrompt = `

【元认知检查】
在完成分析后，请反思：
1. 我的分析是否遗漏了任何重要信号？
2. 情绪分类是否准确？
3. 是否有防御机制我可能没注意到？
4. 是否存在认知扭曲？
5. 我的置信度是否合理？

请在回答中包含这个自我检查过程。`;

    return {
      systemPrompt,
      userPrompt,
      reasoningChain,
      metacognitionPrompt,
      fullPrompt: `${systemPrompt}\n\n${userPrompt}${reasoningChain}${metacognitionPrompt}`,
    };
  }

  /**
   * 优化共情回应提示词
   * @param {string} userInput - 用户输入
   * @param {object} analysis - 心理分析结果
   * @returns {object} 优化后的提示词组件
   */
  optimizeEmpathyPrompt(userInput, analysis) {
    // 基于分析结果定制系统提示词
    let customInstructions = '';

    if (analysis.emotion?.category === 'negative' && analysis.emotion?.intensity === 'high') {
      customInstructions += '\n注意：用户情绪强度较高，需要先验证情绪，再探索原因。';
    }

    if (analysis.defenses?.length > 0) {
      const defenseTypes = analysis.defenses.map(d => d.type).join(', ');
      customInstructions += `\n注意：检测到防御机制(${defenseTypes})，需要温和处理，避免触发防御。`;
    }

    if (analysis.crisis?.level === 'high') {
      customInstructions += '\n紧急：检测到高危机风险，需要表达关心并建议寻求专业帮助。';
    }

    const systemPrompt = `${this.empathyPromptTemplate}${customInstructions}`;

    const userPrompt = `用户说："${userInput}"

分析结果：
- 意图：${analysis.intent?.category || '未知'}
- 情绪：${analysis.emotion?.name || analysis.emotion?.category || '未知'}
- 需求：${analysis.needs?.map(n => n.type).join(', ') || '未知'}
- 防御：${analysis.defenses?.map(d => d.type).join(', ') || '无'}
- 危机：${analysis.crisis?.level || '未知'}

请生成一个共情回应。`;

    const reasoningChain = `

【推理步骤】
1. 情绪验证：如何确认用户的感受？
2. 反射：用户说的核心内容是什么？
3. 探索：可以问什么问题深入了解？
4. 支持：如何表达愿意帮助？`;

    return {
      systemPrompt,
      userPrompt,
      reasoningChain,
      fullPrompt: `${systemPrompt}\n\n${userPrompt}${reasoningChain}`,
    };
  }

  /**
   * 优化CBT重构提示词
   * @param {string} userInput - 用户输入
   * @param {object} distortions - 认知扭曲检测结果
   * @returns {object} 优化后的提示词组件
   */
  optimizeCBTPrompt(userInput, distortions) {
    const systemPrompt = this.cbtPromptTemplate;

    const detectedDistortions = distortions?.distortions || [];
    const distortionList = detectedDistortions.length > 0
      ? detectedDistortions.map(d => `- ${d.name}: ${d.evidence || ''}`).join('\n')
      : '未检测到明显认知扭曲';

    const userPrompt = `用户说："${userInput}"

检测到的认知扭曲：
${distortionList}

严重程度：${distortions?.severity || '未知'}

请进行CBT认知重构：
1. 识别扭曲类型
2. 生成苏格拉底追问
3. 提出替代想法
4. 建议行为实验`;

    const reasoningChain = `

【CBT重构步骤】
1. 识别：确认认知扭曲的具体表现
2. 探索：这些想法背后的核心信念是什么？
3. 追问：通过什么问题帮助用户发现新视角？
4. 重构：生成更平衡的替代想法
5. 行动：有什么具体行动可以帮助改变？`;

    return {
      systemPrompt,
      userPrompt,
      reasoningChain,
      fullPrompt: `${systemPrompt}\n\n${userPrompt}${reasoningChain}`,
    };
  }

  /**
   * 构建思维链推理链
   */
  _buildReasoningChain(userInput, analysis) {
    return `

【思维链推理】
请按以下步骤分析：

步骤1：表面语义解析
- 用户说的字面意思是什么？
- 使用的词汇和语气暗示什么？

步骤2：信号提取
- 情绪关键词：["寻找情绪词"]
- 意图信号：["寻找意图词"]
- 防御信号：["寻找防御词"]
- 需求信号：["寻找需求词"]

步骤3：深度推断
- 基于提取的信号，最可能的意图是什么？
- 情绪的根源可能是什么？
- 用户真正需要的是什么？

步骤4：假设验证
- 我的推断有多大的置信度？
- 有哪些信号可能支持其他解释？

步骤5：综合输出
- 最终的心理分析结论`;
  }

  /**
   * 构建用户提示词
   */
  _buildUserPrompt(userInput, analysis) {
    let prompt = `请分析以下用户输入的心理状态：\n\n"${userInput}"\n\n`;

    if (analysis) {
      prompt += `\n已知分析结果供参考：\n`;
      prompt += `- 意图：${analysis.intent?.category || '待确定'}\n`;
      prompt += `- 情绪：${analysis.emotion?.name || analysis.emotion?.category || '待确定'}\n`;
      if (analysis.needs?.length > 0) {
        prompt += `- 需求：${analysis.needs.map(n => n.type).join(', ')}\n`;
      }
      prompt += `- 防御：${analysis.defenses?.map(d => d.type).join(', ') || '未检测到'}\n`;
    }

    return prompt;
  }

  /**
   * 生成自我批评prompt
   * @param {string} originalAnalysis - 原始分析结果
   * @param {string} userInput - 用户输入
   * @returns {string} 自我批评prompt
   */
  generateSelfCritiquePrompt(originalAnalysis, userInput) {
    return `请审查以下心理分析的准确性和完整性：

原始分析：${originalAnalysis}

用户原始输入："${userInput}"

【审查要点】
1. 是否有遗漏的重要心理信号？
2. 情绪分类是否准确反映了用户状态？
3. 意图判断是否合理？
4. 是否有可能未检测到的防御机制？
5. 危机评估是否恰当？
6. 置信度评分是否与信号强度匹配？

【输出格式】
请返回：
- 需要修正的地方（如有）
- 修正后的分析
- 置信度调整说明`;
  }

  /**
   * 生成提示词优化meta-prompt
   * @param {string} task - 任务类型
   * @param {string} context - 上下文
   * @returns {string} 优化后的meta-prompt
   */
  generateMetaPrompt(task, context) {
    return `【Meta-Prompt: 提示词自优化】

当前任务：${task}
上下文：${context}

请生成一个优化的提示词，要求：
1. 清晰明确，不歧义
2. 包含必要的约束和规则
3. 有明确的输出格式要求
4. 长度适中，不过于冗长

请直接输出优化后的提示词，不要解释。`;
  }

  /**
   * 批量优化多个输入的提示词
   * @param {Array} inputs - 输入数组
   * @param {string} type - 优化类型
   * @returns {Array} 优化后的提示词数组
   */
  batchOptimize(inputs, type = 'psychology') {
    return inputs.map(input => {
      if (type === 'psychology') {
        return this.optimizePsychologyPrompt(input);
      } else if (type === 'empathy') {
        return this.optimizeEmpathyPrompt(input, {});
      } else if (type === 'cbt') {
        return this.optimizeCBTPrompt(input, {});
      }
      return { fullPrompt: input };
    });
  }
}

module.exports = { PromptOptimizer };
