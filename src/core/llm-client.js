/**
 * LLM客户端模块 — 心镜v1.18
 *
 * 封装LLM调用，支持多provider：
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude)
 *
 * 两步式调用：
 * 第一步：小模型分析/推理 → 构建优化提示词
 * 第二步：大模型执行 → 获取更准确的心理分析
 */

class LLMClient {
  constructor(config = {}) {
    // Provider配置
    this.providers = {
      openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: config.openaiModel || 'gpt-4',
        apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY,
      },
      anthropic: {
        baseUrl: 'https://api.anthropic.com/v1',
        model: config.anthropicModel || 'claude-3-sonnet-20240229',
        apiKey: config.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      },
    };

    // 当前provider
    this.currentProvider = config.provider || 'openai';

    // 超时配置
    this.timeout = config.timeout || 30000;

    // 是否启用LLM调用
    this.enabled = config.enabled !== false && (!!this.providers.openai.apiKey || !!this.providers.anthropic.apiKey);
  }

  /**
   * 检查LLM调用是否可用
   */
  isAvailable() {
    return this.enabled;
  }

  /**
   * 调用LLM生成文本
   * @param {string} systemPrompt - 系统提示词
   * @param {string} userPrompt - 用户提示词
   * @param {object} options - 额外选项
   * @returns {Promise<object>} 解析后的响应
   */
  async generate(systemPrompt, userPrompt, options = {}) {
    if (!this.isAvailable()) {
      return {
        success: false,
        error: 'LLM调用不可用：未配置API密钥',
        fallback: true,
      };
    }

    const provider = this.providers[this.currentProvider];

    try {
      if (this.currentProvider === 'openai') {
        return await this._callOpenAI(provider, systemPrompt, userPrompt, options);
      } else if (this.currentProvider === 'anthropic') {
        return await this._callAnthropic(provider, systemPrompt, userPrompt, options);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  /**
   * 调用OpenAI API
   */
  async _callOpenAI(provider, systemPrompt, userPrompt, options = {}) {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      timeout: this.timeout,
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API错误: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      content,
      raw: data,
      provider: 'openai',
      model: provider.model,
    };
  }

  /**
   * 调用Anthropic API
   */
  async _callAnthropic(provider, systemPrompt, userPrompt, options = {}) {
    const response = await fetch(`${provider.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: this.timeout,
      body: JSON.stringify({
        model: provider.model,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API错误: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    return {
      success: true,
      content,
      raw: data,
      provider: 'anthropic',
      model: provider.model,
    };
  }

  /**
   * 解析LLM响应为心理分析格式
   * @param {string} content - LLM响应内容
   * @returns {object} 解析后的分析结果
   */
  parsePsychologyResponse(content) {
    // 尝试解析为JSON
    try {
      // 尝试提取JSON代码块
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // JSON解析失败，尝试文本解析
    }

    // 如果无法解析为JSON，返回原始内容和解析提示
    return {
      raw: content,
      parsed: false,
      intent: this._extractIntent(content),
      emotion: this._extractEmotion(content),
      needs: this._extractNeeds(content),
      defenses: this._extractDefenses(content),
    };
  }

  /**
   * 从文本中提取意图
   */
  _extractIntent(text) {
    const intentKeywords = {
      task: ['任务', '帮我', '请', '执行'],
      emotion: ['感觉', '觉得', '心情', '情绪'],
      need: ['需要', '想要', '希望'],
      defense: ['但是', '其实', '不过'],
    };

    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      if (keywords.some(k => text.includes(k))) {
        return { category: intent, confidence: 0.8 };
      }
    }
    return { category: 'unknown', confidence: 0.3 };
  }

  /**
   * 从文本中提取情绪
   */
  _extractEmotion(text) {
    const emotionKeywords = {
      positive: ['开心', '高兴', '快乐', '棒', '好'],
      negative: ['难过', '伤心', '生气', '焦虑', '压力', '累'],
    };

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(k => text.includes(k))) {
        return { category: emotion, intensity: 'medium' };
      }
    }
    return { category: 'neutral', intensity: 'low' };
  }

  /**
   * 从文本中提取需求
   */
  _extractNeeds(text) {
    const needs = [];
    const needKeywords = ['需要', '想要', '希望', '期待'];

    for (const kw of needKeywords) {
      if (text.includes(kw)) {
        needs.push({ type: 'emotional_support', confidence: 0.7 });
        break;
      }
    }
    return needs;
  }

  /**
   * 从文本中提取防御机制
   */
  _extractDefenses(text) {
    const defenses = [];
    const defenseKeywords = ['但是', '其实', '不过', '可能'];

    for (const kw of defenseKeywords) {
      if (text.includes(kw)) {
        defenses.push({ type: 'deflection', signals: [kw] });
      }
    }
    return defenses;
  }

  /**
   * 切换provider
   */
  setProvider(provider) {
    if (this.providers[provider]) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }

  /**
   * 配置provider
   */
  configureProvider(provider, config) {
    if (this.providers[provider]) {
      this.providers[provider] = { ...this.providers[provider], ...config };
      this.enabled = !!this.providers.openai.apiKey || !!this.providers.anthropic.apiKey;
      return true;
    }
    return false;
  }
}

/**
 * 创建默认LLM客户端
 */
function createLLMClient(config = {}) {
  return new LLMClient(config);
}

module.exports = { LLMClient, createLLMClient };
