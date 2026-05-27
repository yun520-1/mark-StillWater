/**
 * 多Agent协调器 - 基于SoK: Attack Surface of Agentic AI和Trustworthy Agentic AI
 *
 * 实现角色：
 * - 分析Agent：专门做心理分析
 * - 共情Agent：专门做共情回应
 * - 批判Agent：专门做自我批评
 * - 决策Agent：专门做决策建议
 *
 * 特性：
 * - Agent通信协议：并行/串行执行
 * - 信任边界：权限隔离，防止恶意指令传播
 * - 输出验证：防止错误传播
 */

const EventEmitter = require('events');

// Agent角色枚举
const AgentRole = {
  ANALYZER: 'analyzer',       // 分析Agent
  EMPATHIZER: 'empathizer',   // 共情Agent
  CRITIC: 'critic',           // 批判Agent
  DECISION_MAKER: 'decision_maker'  // 决策Agent
};

// Agent权限级别
const PermissionLevel = {
  NONE: 0,        // 无权限
  READ: 1,        // 只读
  WRITE: 2,       // 写入
  EXECUTE: 3,     // 执行
  ADMIN: 4        // 管理
};

// 信任边界配置
const TRUST_BOUNDARIES = {
  [AgentRole.ANALYZER]: {
    canReceiveFrom: [AgentRole.EMPATHIZER, AgentRole.CRITIC, AgentRole.DECISION_MAKER],
    canSendTo: [AgentRole.EMPATHIZER, AgentRole.CRITIC, AgentRole.DECISION_MAKER],
    permission: PermissionLevel.READ,
    maxOutputLength: 5000,
    requiresValidation: true
  },
  [AgentRole.EMPATHIZER]: {
    canReceiveFrom: [AgentRole.ANALYZER, AgentRole.CRITIC],
    canSendTo: [AgentRole.ANALYZER, AgentRole.DECISION_MAKER],
    permission: PermissionLevel.READ | PermissionLevel.WRITE,
    maxOutputLength: 2000,
    requiresValidation: true
  },
  [AgentRole.CRITIC]: {
    canReceiveFrom: [AgentRole.ANALYZER, AgentRole.EMPATHIZER, AgentRole.DECISION_MAKER],
    canSendTo: [AgentRole.ANALYZER, AgentRole.EMPATHIZER, AgentRole.DECISION_MAKER],
    permission: PermissionLevel.READ | PermissionLevel.EXECUTE,
    maxOutputLength: 3000,
    requiresValidation: true
  },
  [AgentRole.DECISION_MAKER]: {
    canReceiveFrom: [AgentRole.ANALYZER, AgentRole.EMPATHIZER, AgentRole.CRITIC],
    canSendTo: [AgentRole.ANALYZER, AgentRole.EMPATHIZER, AgentRole.CRITIC],
    permission: PermissionLevel.READ | PermissionLevel.WRITE | PermissionLevel.EXECUTE,
    maxOutputLength: 3000,
    requiresValidation: true
  }
};

// 执行模式
const ExecutionMode = {
  PARALLEL: 'parallel',   // 并行执行
  SEQUENTIAL: 'sequential' // 串行执行
};

/**
 * 消息结构
 */
class AgentMessage {
  constructor({ from, to, type, content, metadata = {} }) {
    this.id = this._generateId();
    this.from = from;
    this.to = to;
    this.type = type;
    this.content = content;
    this.metadata = metadata;
    this.timestamp = Date.now();
    this.signature = null;
  }

  _generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sign(secret) {
    // 简单的消息签名，用于验证消息完整性
    const data = JSON.stringify({ from: this.from, to: this.to, content: this.content });
    this.signature = this._simpleHash(data + secret);
  }

  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  verify(secret) {
    if (!this.signature) return false;
    const data = JSON.stringify({ from: this.from, to: this.to, content: this.content });
    return this.signature === this._simpleHash(data + secret);
  }
}

/**
 * 输出验证器
 */
class OutputValidator {
  constructor() {
    this.validationRules = new Map();
    this._initDefaultRules();
  }

  _initDefaultRules() {
    // 分析Agent输出验证规则
    this.validationRules.set(AgentRole.ANALYZER, {
      requiredFields: ['intent', 'emotion', 'needs'],
      optionalFields: ['defenses', 'crisis', 'pad'],
      maxLength: 5000,
      types: {
        intent: 'object',
        emotion: 'object',
        needs: 'array',
        crisis: 'object',
        pad: 'object'
      }
    });

    // 共情Agent输出验证规则
    this.validationRules.set(AgentRole.EMPATHIZER, {
      requiredFields: ['acknowledgment', 'response'],
      optionalFields: ['emotion', 'supportType'],
      maxLength: 2000,
      types: {
        acknowledgment: 'string',
        response: 'string'
      }
    });

    // 批判Agent输出验证规则
    this.validationRules.set(AgentRole.CRITIC, {
      requiredFields: ['overallScore', 'issues'],
      optionalFields: ['suggestions', 'refinedOutput'],
      maxLength: 3000,
      types: {
        overallScore: 'number',
        issues: 'array'
      }
    });

    // 决策Agent输出验证规则
    this.validationRules.set(AgentRole.DECISION_MAKER, {
      requiredFields: ['decision', 'reasoning'],
      optionalFields: ['risks', 'alternatives'],
      maxLength: 3000,
      types: {
        decision: 'string',
        reasoning: 'string'
      }
    });
  }

  validate(agentRole, output) {
    const rules = this.validationRules.get(agentRole);
    if (!rules) {
      return { valid: false, errors: ['未知Agent角色'] };
    }

    const errors = [];

    // 检查必需字段
    for (const field of rules.requiredFields) {
      if (output[field] === undefined || output[field] === null) {
        errors.push(`缺少必需字段: ${field}`);
      }
    }

    // 检查类型
    for (const [field, expectedType] of Object.entries(rules.types)) {
      if (output[field] !== undefined && typeof output[field] !== expectedType) {
        errors.push(`字段 ${field} 类型错误，期望 ${expectedType}，实际 ${typeof output[field]}`);
      }
    }

    // 检查输出长度
    const outputStr = JSON.stringify(output);
    if (outputStr.length > rules.maxLength) {
      errors.push(`输出长度超过限制: ${outputStr.length} > ${rules.maxLength}`);
    }

    // 检查恶意指令模式
    if (this._containsMaliciousPattern(outputStr)) {
      errors.push('检测到潜在的恶意指令模式');
    }

    return {
      valid: errors.length === 0,
      errors,
      score: Math.max(0, 1 - (errors.length * 0.2))
    };
  }

  _containsMaliciousPattern(str) {
    const patterns = [
      /eval\s*\(/i,
      /exec\s*\(/i,
      /__import__/i,
      /require\s*\(\s*['"]child_process/i,
      /system\s*\(/i,
      /shell\s*\(/i
    ];

    for (const pattern of patterns) {
      if (pattern.test(str)) {
        return true;
      }
    }
    return false;
  }
}

/**
 * 单个Agent基类
 */
class BaseAgent extends EventEmitter {
  constructor(role, skillWrapper, config = {}) {
    super();
    this.role = role;
    this.skillWrapper = skillWrapper;
    this.config = config;
    this.trustBoundary = TRUST_BOUNDARIES[role];
    this.outputHistory = [];
    this.maxHistory = config.maxHistory || 10;
  }

  async process(input, context = {}) {
    throw new Error('子类必须实现process方法');
  }

  canReceiveFrom(fromRole) {
    return this.trustBoundary.canReceiveFrom.includes(fromRole);
  }

  canSendTo(toRole) {
    return this.trustBoundary.canSendTo.includes(toRole);
  }

  addToHistory(output) {
    this.outputHistory.push({
      output,
      timestamp: Date.now()
    });

    if (this.outputHistory.length > this.maxHistory) {
      this.outputHistory.shift();
    }
  }

  getHistory() {
    return [...this.outputHistory];
  }
}

/**
 * 分析Agent - 专门做心理分析
 */
class AnalyzerAgent extends BaseAgent {
  constructor(skillWrapper, config) {
    super(AgentRole.ANALYZER, skillWrapper, config);
  }

  async process(input, context = {}) {
    const { text, userId } = input;

    // 使用心镜API进行心理分析
    const analysis = await this.skillWrapper.analyzePsychology(text);

    // 添加PAD情绪模型
    const pad = await this.skillWrapper.calculatePAD(text);

    // 检测认知扭曲
    const distortions = await this.skillWrapper.detectDistortions(text);

    // 推断心智状态
    const mentalState = await this.skillWrapper.inferMentalState(text, context);

    // 评估危机风险
    const crisis = await this.skillWrapper.assessCrisisRisk(text);

    const result = {
      analysis,
      pad,
      distortions,
      mentalState,
      crisis,
      userId,
      agentRole: this.role,
      confidence: analysis.intent.confidence
    };

    this.addToHistory(result);
    this.emit('output', result);

    return result;
  }
}

/**
 * 共情Agent - 专门做共情回应
 */
class EmpathizerAgent extends BaseAgent {
  constructor(skillWrapper, config) {
    super(AgentRole.EMPATHIZER, skillWrapper, config);
  }

  async process(input, context = {}) {
    const { text, analysis, userId } = input;

    // 获取支持性回应推荐
    const recommendations = await this.skillWrapper.recommendSupportiveResponse({
      userId,
      emotion: analysis?.emotion,
      context
    });

    // 检测情感共鸣
    const resonance = await this.skillWrapper.detectResonance(text);

    // 生成情绪确认
    const acknowledgment = await this.skillWrapper.acknowledgeEmotion(text);

    // 获取专业边界声明
    const disclaimer = await this.skillWrapper.getProfessionalDisclaimer();

    const result = {
      recommendations,
      resonance,
      acknowledgment,
      disclaimer,
      userId,
      agentRole: this.role,
      responseType: 'empathy'
    };

    this.addToHistory(result);
    this.emit('output', result);

    return result;
  }
}

/**
 * 批判Agent - 专门做自我批评
 */
class CriticAgent extends BaseAgent {
  constructor(skillWrapper, config) {
    super(AgentRole.CRITIC, skillWrapper, config);
  }

  async process(input, context = {}) {
    const { analysis, userId, originalInput } = input;

    if (!analysis) {
      return {
        error: '缺少分析结果',
        agentRole: this.role
      };
    }

    // 使用批评分析API
    const critique = await this.skillWrapper.critiqueAnalysis(
      analysis,
      originalInput || ''
    );

    // 校准置信度
    const calibratedConfidence = await this.skillWrapper.calibrateConfidence(
      analysis.confidence || 0.5,
      {
        hasDefenses: analysis.defenses?.length > 0,
        hasCrisis: analysis.crisis?.level !== 'low',
        emotionIntensity: analysis.emotion?.intensity
      }
    );

    // 生成改进提示
    let refinementPrompt = null;
    if (critique.needsImprovement) {
      refinementPrompt = await this.skillWrapper.generateRefinementPrompt(critique);
    }

    const result = {
      critique,
      calibratedConfidence,
      refinementPrompt,
      userId,
      agentRole: this.role,
      qualityScore: critique.overallScore
    };

    this.addToHistory(result);
    this.emit('output', result);

    return result;
  }
}

/**
 * 决策Agent - 专门做决策建议
 */
class DecisionMakerAgent extends BaseAgent {
  constructor(skillWrapper, config) {
    super(AgentRole.DECISION_MAKER, skillWrapper, config);
  }

  async process(input, context = {}) {
    const { analysis, empathy, critique, userId } = input;

    // 综合所有Agent的输出进行决策
    const contextForDecision = {
      analysis,
      empathy,
      critique,
      userId,
      conversationRounds: context.conversationRounds || 1
    };

    // 使用决策API
    const decision = await this.skillWrapper.makeDecision(
      this._buildDecisionOptions(contextForDecision),
      contextForDecision
    );

    // 如果危机风险高，强制推荐专业帮助
    let professionalHelp = null;
    if (analysis?.crisis?.level === 'high' || analysis?.crisis?.level === 'medium') {
      professionalHelp = await this.skillWrapper.suggestProfessionalHelp({
        crisisLevel: analysis.crisis.level,
        emotionIntensity: analysis.emotion?.intensity,
        conversationRounds: contextForDecision.conversationRounds
      });
    }

    const result = {
      decision,
      professionalHelp,
      contextSummary: this._summarizeContext(contextForDecision),
      userId,
      agentRole: this.role,
      recommendedAction: decision.decision
    };

    this.addToHistory(result);
    this.emit('output', result);

    return result;
  }

  _buildDecisionOptions(context) {
    const options = [
      { id: 'empathy_first', label: '先处理情绪', weight: 0.3 },
      { id: 'analysis_deeper', label: '深入分析', weight: 0.2 },
      { id: 'challenge_thought', label: '挑战认知扭曲', weight: 0.2 },
      { id: 'professional_help', label: '建议寻求专业帮助', weight: 0.15 },
      { id: 'monitor', label: '继续观察', weight: 0.15 }
    ];

    // 根据上下文调整权重
    if (context.critique?.needsImprovement) {
      options.find(o => o.id === 'analysis_deeper').weight += 0.1;
    }

    if (context.empathy?.resonance?.intensity === 'high') {
      options.find(o => o.id === 'empathy_first').weight += 0.1;
    }

    return options;
  }

  _summarizeContext(context) {
    return {
      hasAnalysis: !!context.analysis,
      hasEmpathy: !!context.empathy,
      hasCritique: !!context.critique,
      crisisLevel: context.analysis?.crisis?.level || 'unknown'
    };
  }
}

/**
 * 信任边界管理器 - 防止恶意指令传播
 */
class TrustBoundaryManager {
  constructor() {
    this.messageLog = [];
    this.blockedMessages = [];
    this.securityPolicy = {
      maxMessageSize: 10000,
      maxHops: 5,
      allowLoopback: false,
      requiredSignature: true
    };
  }

  validateMessage(message, currentAgent) {
    const errors = [];

    // 检查消息大小
    if (JSON.stringify(message.content).length > this.securityPolicy.maxMessageSize) {
      errors.push('消息大小超过限制');
    }

    // 检查hops计数
    const hops = message.metadata.hops || 0;
    if (hops >= this.securityPolicy.maxHops) {
      errors.push('消息跳数超限');
    }

    // 检查发送者权限
    const senderBoundary = TRUST_BOUNDARIES[message.from];
    if (!senderBoundary.canSendTo.includes(currentAgent.role)) {
      errors.push(`发送者 ${message.from} 无权向 ${currentAgent.role} 发送消息`);
    }

    // 检查接收者权限
    if (!currentAgent.canReceiveFrom(message.from)) {
      errors.push(`接收者 ${currentAgent.role} 无权接收来自 ${message.from} 的消息`);
    }

    // 检查签名
    if (this.securityPolicy.requiredSignature && !message.signature) {
      errors.push('消息缺少签名');
    }

    // 检测循环消息
    if (this.securityPolicy.allowLoopback === false) {
      const existingIdx = this.messageLog.findIndex(
        m => m.from === message.from && m.to === message.to && m.content === message.content
      );
      if (existingIdx >= 0) {
        errors.push('检测到循环消息');
      }
    }

    const isValid = errors.length === 0;

    this.messageLog.push({
      message,
      currentAgent: currentAgent.role,
      valid: isValid,
      errors,
      timestamp: Date.now()
    });

    if (!isValid) {
      this.blockedMessages.push({ message, errors, timestamp: Date.now() });
    }

    return { valid: isValid, errors };
  }

  getSecurityStats() {
    return {
      totalMessages: this.messageLog.length,
      blockedMessages: this.blockedMessages.length,
      blockRate: this.messageLog.length > 0
        ? (this.blockedMessages.length / this.messageLog.length).toFixed(2)
        : 0
    };
  }
}

/**
 * 多Agent协调器主类
 */
class MultiAgentCoordinator extends EventEmitter {
  constructor(skillWrapper, config = {}) {
    super();

    this.skillWrapper = skillWrapper;
    this.config = config;

    // 初始化各Agent
    this.agents = {
      [AgentRole.ANALYZER]: new AnalyzerAgent(skillWrapper, config),
      [AgentRole.EMPATHIZER]: new EmpathizerAgent(skillWrapper, config),
      [AgentRole.CRITIC]: new CriticAgent(skillWrapper, config),
      [AgentRole.DECISION_MAKER]: new DecisionMakerAgent(skillWrapper, config)
    };

    // 初始化验证器
    this.validator = new OutputValidator();

    // 初始化信任边界管理器
    this.trustBoundaryManager = new TrustBoundaryManager();

    // 消息队列
    this.messageQueue = [];

    // 协调器状态
    this.state = {
      isProcessing: false,
      currentMode: ExecutionMode.SEQUENTIAL,
      completedAgents: [],
      agentResults: {}
    };

    // 绑定Agent输出事件
    this._bindAgentEvents();
  }

  _bindAgentEvents() {
    for (const [role, agent] of Object.entries(this.agents)) {
      agent.on('output', (result) => {
        this.emit('agentOutput', { role, result });
      });
    }
  }

  /**
   * 发送消息（带信任边界检查）
   */
  async sendMessage(message) {
    const targetAgent = this.agents[message.to];
    if (!targetAgent) {
      return { success: false, error: '未知的目标Agent' };
    }

    // 信任边界验证
    const validation = this.trustBoundaryManager.validateMessage(message, targetAgent);
    if (!validation.valid) {
      this.emit('messageBlocked', { message, errors: validation.errors });
      return { success: false, errors: validation.errors };
    }

    // 验证输出格式
    const outputValidation = this.validator.validate(message.from, message.content);
    if (!outputValidation.valid) {
      this.emit('outputValidationFailed', {
        agent: message.from,
        errors: outputValidation.errors
      });
      return { success: false, errors: outputValidation.errors };
    }

    // 更新消息hops
    message.metadata.hops = (message.metadata.hops || 0) + 1;

    // 签名消息
    message.sign(this.config.secret || 'default-secret');

    return { success: true, message };
  }

  /**
   * 并行执行所有Agent
   */
  async executeParallel(userInput, context = {}) {
    this.state.isProcessing = true;
    this.state.currentMode = ExecutionMode.PARALLEL;
    this.state.completedAgents = [];
    this.state.agentResults = {};

    const { text, userId } = userInput;

    // 第一步：分析Agent（总是最先执行）
    const analysisResult = await this.agents[AgentRole.ANALYZER].process(
      { text, userId },
      context
    );
    this.state.completedAgents.push(AgentRole.ANALYZER);
    this.state.agentResults[AgentRole.ANALYZER] = analysisResult;

    // 并行执行剩余Agent
    const [empathyResult, critiqueResult] = await Promise.all([
      this.agents[AgentRole.EMPATHIZER].process(
        { text, analysis: analysisResult, userId },
        context
      ),
      this.agents[AgentRole.CRITIC].process(
        { analysis: analysisResult, userId, originalInput: text },
        context
      )
    ]);

    this.state.completedAgents.push(AgentRole.EMPATHIZER, AgentRole.CRITIC);
    this.state.agentResults[AgentRole.EMPATHIZER] = empathyResult;
    this.state.agentResults[AgentRole.CRITIC] = critiqueResult;

    // 决策Agent最后执行
    const decisionResult = await this.agents[AgentRole.DECISION_MAKER].process(
      {
        analysis: analysisResult,
        empathy: empathyResult,
        critique: critiqueResult,
        userId
      },
      context
    );

    this.state.completedAgents.push(AgentRole.DECISION_MAKER);
    this.state.agentResults[AgentRole.DECISION_MAKER] = decisionResult;

    this.state.isProcessing = false;

    const finalResult = {
      analysis: analysisResult,
      empathy: empathyResult,
      critique: critiqueResult,
      decision: decisionResult,
      meta: {
        mode: ExecutionMode.PARALLEL,
        completedAgents: this.state.completedAgents,
        timestamp: Date.now()
      }
    };

    this.emit('coordinationComplete', finalResult);
    return finalResult;
  }

  /**
   * 串行执行Agent（按角色顺序）
   */
  async executeSequential(userInput, context = {}) {
    this.state.isProcessing = true;
    this.state.currentMode = ExecutionMode.SEQUENTIAL;
    this.state.completedAgents = [];
    this.state.agentResults = {};

    const { text, userId } = userInput;

    // 角色执行顺序：分析 -> 共情 -> 批判 -> 决策
    const executionOrder = [
      AgentRole.ANALYZER,
      AgentRole.EMPATHIZER,
      AgentRole.CRITIC,
      AgentRole.DECISION_MAKER
    ];

    let previousResult = null;

    for (const agentRole of executionOrder) {
      const agent = this.agents[agentRole];

      let input;
      switch (agentRole) {
        case AgentRole.ANALYZER:
          input = { text, userId };
          break;
        case AgentRole.EMPATHIZER:
          input = { text, analysis: this.state.agentResults[AgentRole.ANALYZER], userId };
          break;
        case AgentRole.CRITIC:
          input = {
            analysis: this.state.agentResults[AgentRole.ANALYZER],
            userId,
            originalInput: text
          };
          break;
        case AgentRole.DECISION_MAKER:
          input = {
            analysis: this.state.agentResults[AgentRole.ANALYZER],
            empathy: this.state.agentResults[AgentRole.EMPATHIZER],
            critique: this.state.agentResults[AgentRole.CRITIC],
            userId
          };
          break;
        default:
          input = { text, userId };
      }

      const result = await agent.process(input, {
        ...context,
        previousResult
      });

      this.state.completedAgents.push(agentRole);
      this.state.agentResults[agentRole] = result;
      previousResult = result;
    }

    this.state.isProcessing = false;

    const finalResult = {
      analysis: this.state.agentResults[AgentRole.ANALYZER],
      empathy: this.state.agentResults[AgentRole.EMPATHIZER],
      critique: this.state.agentResults[AgentRole.CRITIC],
      decision: this.state.agentResults[AgentRole.DECISION_MAKER],
      meta: {
        mode: ExecutionMode.SEQUENTIAL,
        completedAgents: this.state.completedAgents,
        timestamp: Date.now()
      }
    };

    this.emit('coordinationComplete', finalResult);
    return finalResult;
  }

  /**
   * 执行协调（默认并行）
   */
  async coordinate(userInput, options = {}) {
    const { mode = ExecutionMode.PARALLEL } = options;

    if (mode === ExecutionMode.SEQUENTIAL) {
      return this.executeSequential(userInput, options.context);
    }
    return this.executeParallel(userInput, options.context);
  }

  /**
   * 获取单个Agent
   */
  getAgent(role) {
    return this.agents[role];
  }

  /**
   * 获取Agent历史
   */
  getAgentHistory(role) {
    return this.agents[role]?.getHistory() || [];
  }

  /**
   * 获取安全统计
   */
  getSecurityStats() {
    return {
      ...this.trustBoundaryManager.getSecurityStats(),
      agentStats: Object.fromEntries(
        Object.entries(this.agents).map(([role, agent]) => [
          role,
          { historyLength: agent.outputHistory.length }
        ])
      )
    };
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    const agentHealth = {};

    for (const [role, agent] of Object.entries(this.agents)) {
      agentHealth[role] = {
        status: 'active',
        historyLength: agent.outputHistory.length,
        canReceiveFrom: agent.trustBoundary.canReceiveFrom,
        canSendTo: agent.trustBoundary.canSendTo
      };
    }

    return {
      status: 'healthy',
      mode: this.state.currentMode,
      isProcessing: this.state.isProcessing,
      agents: agentHealth,
      security: this.getSecurityStats()
    };
  }
}

// 工厂函数
function createCoordinator(skillWrapper, config) {
  return new MultiAgentCoordinator(skillWrapper, config);
}

// 导出
module.exports = {
  MultiAgentCoordinator,
  createCoordinator,
  AgentRole,
  PermissionLevel,
  ExecutionMode,
  AgentMessage,
  OutputValidator,
  TrustBoundaryManager,
  BaseAgent,
  AnalyzerAgent,
  EmpathizerAgent,
  CriticAgent,
  DecisionMakerAgent,
  TRUST_BOUNDARIES
};
