/**
 * HeartFlow Analysis Trace System — ReAct 风格分析轨迹
 *
 * 基于论文:
 *   - Datarus-R1: ReAct风格笔记本格式，包含推理步骤、代码执行、错误追踪、自我修正
 *   - Explore-Execute Chain: 探索阶段+执行阶段分离
 *
 * 轨迹元素:
 *   - thought: 思考步骤 - 推理过程中的思考
 *   - action: 执行的动作 - 采取的具体行动
 *   - observation: 观察结果 - 行动后的观察和结果
 *   - reflection: 自我反思 - 对推理过程的反思
 *   - correction: 修正 - 当发现错误时的修正
 *
 * AHA-moment检测: 当假设被推翻时进行1-2次修订
 *
 * v1.0.0: 初始版本
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 日志前缀
const LOGGER_PREFIX = '[AnalysisTrace]';

// 存储配置
const STORAGE_DIR = path.join(__dirname, 'data', 'traces');
const MAX_TRACE_ENTRIES = 1000;

/**
 * 轨迹条目类型
 * @typedef {Object} TraceEntry
 * @property {string} id - 唯一标识符
 * @property {number} step - 步骤序号
 * @property {string} thought - 思考步骤
 * @property {string} action - 执行的动作
 * @property {string} observation - 观察结果
 * @property {string} [reflection] - 自我反思
 * @property {string} [correction] - 修正内容
 * @property {boolean} isAhaMoment - 是否为AHA时刻
 * @property {number} timestamp - 时间戳
 * @property {Object} metadata - 元数据
 */

/**
 * AHA时刻检测结果
 * @typedef {Object} AHADetection
 * @property {boolean} detected - 是否检测到AHA时刻
 * @property {string} [originalAssumption] - 被推翻的原始假设
 * @property {string} [newInsight] - 新洞察
 * @property {number} revisionCount - 修订次数
 */

/**
 * 轨迹统计信息
 * @typedef {Object} TraceStats
 * @property {number} totalSteps - 总步骤数
 * @property {number} ahaMoments - AHA时刻数量
 * @property {number} corrections - 修正数量
 * @property {number} avgReflectionLength - 平均反思长度
 */

/**
 * 创建唯一ID
 * @returns {string}
 */
function createId() {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * 确保存储目录存在
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * 创建新的轨迹条目
 * @param {Object} params - 轨迹参数
 * @param {string} params.thought - 思考步骤
 * @param {string} params.action - 执行的动作
 * @param {string} params.observation - 观察结果
 * @param {string} [params.reflection] - 自我反思
 * @param {string} [params.correction] - 修正内容
 * @param {Object} [params.metadata] - 元数据
 * @returns {TraceEntry}
 */
function createEntry({ thought, action, observation, reflection, correction, metadata = {} }) {
  return {
    id: createId(),
    step: 0, // 稍后计算
    thought: thought || '',
    action: action || '',
    observation: observation || '',
    reflection: reflection || null,
    correction: correction || null,
    isAhaMoment: false,
    timestamp: Date.now(),
    metadata
  };
}

/**
 * AnalysisTrace 类 - 管理分析轨迹
 */
class AnalysisTrace {
  /**
   * @param {string} [traceId] - 轨迹ID，不提供则自动生成
   */
  constructor(traceId = null) {
    /** @type {string} */
    this.id = traceId || createId();
    /** @type {TraceEntry[]} */
    this.entries = [];
    /** @type {number} */
    this.currentStep = 0;
    /** @type {string} */
    this.sessionId = null;
    /** @type {Object} */
    this.context = {};
    /** @type {string[]} */
    this.assumptions = []; // 追踪假设
    /** @type {number} */
    this.revisionCount = 0;
  }

  /**
   * 添加思考步骤
   * @param {string} thought - 思考内容
   * @returns {AnalysisTrace} - 返回this以支持链式调用
   */
  think(thought) {
    this.entries.push(createEntry({
      thought,
      action: '',
      observation: ''
    }));
    return this;
  }

  /**
   * 添加思考和动作
   * @param {string} thought - 思考内容
   * @param {string} action - 执行的动作
   * @returns {AnalysisTrace}
   */
  act(thought, action) {
    this.entries.push(createEntry({
      thought,
      action,
      observation: ''
    }));
    return this;
  }

  /**
   * 添加观察结果
   * @param {string} observation - 观察结果
   * @returns {AnalysisTrace}
   */
  observe(observation) {
    if (this.entries.length === 0) {
      throw new Error('无法添加观察：轨迹为空，请先调用 think() 或 act()');
    }
    const lastEntry = this.entries[this.entries.length - 1];
    lastEntry.observation = observation;
    return this;
  }

  /**
   * 添加反思
   * @param {string} reflection - 反思内容
   * @returns {AnalysisTrace}
   */
  reflect(reflection) {
    if (this.entries.length === 0) {
      throw new Error('无法添加反思：轨迹为空');
    }
    const lastEntry = this.entries[this.entries.length - 1];
    lastEntry.reflection = reflection;
    return this;
  }

  /**
   * 记录修正
   * @param {string} correction - 修正内容
   * @param {string} [originalAssumption] - 被推翻的假设
   * @returns {AnalysisTrace}
   */
  correct(correction, originalAssumption = null) {
    if (this.entries.length === 0) {
      throw new Error('无法添加修正：轨迹为空');
    }

    this.revisionCount++;

    // 记录假设被推翻
    if (originalAssumption) {
      this.assumptions = this.assumptions.filter(a => a !== originalAssumption);
    }

    const lastEntry = this.entries[this.entries.length - 1];
    lastEntry.correction = correction;
    lastEntry.isAhaMoment = true;

    return this;
  }

  /**
   * 添加假设（用于AHA检测）
   * @param {string} assumption - 假设内容
   * @returns {AnalysisTrace}
   */
  addAssumption(assumption) {
    this.assumptions.push(assumption);
    return this;
  }

  /**
   * 检测AHA时刻 - 当观察结果与假设矛盾时触发
   * @param {string} observation - 观察结果
   * @returns {AHADetection}
   */
  detectAha(observation) {
    const result = {
      detected: false,
      originalAssumption: null,
      newInsight: null,
      revisionCount: this.revisionCount
    };

    // 检查观察结果是否与任何假设矛盾
    for (const assumption of this.assumptions) {
      if (this._isContradiction(assumption, observation)) {
        result.detected = true;
        result.originalAssumption = assumption;
        result.newInsight = this._generateNewInsight(assumption, observation);
        break;
      }
    }

    return result;
  }

  /**
   * 检查假设与观察是否矛盾
   * @param {string} assumption - 假设
   * @param {string} observation - 观察
   * @returns {boolean}
   * @private
   */
  _isContradiction(assumption, observation) {
    // 简单的矛盾检测：检查关键词的反义
    const contradictionPairs = [
      ['成功', '失败'],
      ['正确', '错误'],
      ['可以', '不行'],
      ['好', '不好'],
      ['存在', '不存在'],
      ['知道', '不知道'],
      ['喜欢', '不喜欢'],
      ['同意', '不同意'],
      ['有', '没有']
    ];

    const assumptionLower = assumption.toLowerCase();
    const observationLower = observation.toLowerCase();

    // 检测否定模式：不太行、不行、不好、没用、不会、不能...
    const negationPatterns = [
      '不行', '不好', '没用', '不会', '不能', '不对', '不是',
      '不太行', '不太好', '不太行', '不太对'
    ];

    for (const pattern of negationPatterns) {
      if (observationLower.includes(pattern)) {
        // 如果假设中包含正面词而观察中包含否定模式，可能存在矛盾
        for (const [positive] of contradictionPairs) {
          if (assumptionLower.includes(positive)) {
            return true;
          }
        }
      }
    }

    for (const [positive, negative] of contradictionPairs) {
      if (assumptionLower.includes(positive) && observationLower.includes(negative)) {
        return true;
      }
      if (assumptionLower.includes(negative) && observationLower.includes(positive)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 生成新洞察
   * @param {string} assumption - 被推翻的假设
   * @param {string} observation - 观察结果
   * @returns {string}
   * @private
   */
  _generateNewInsight(assumption, observation) {
    return `假设"${assumption}"被观察结果"${observation}"推翻，需要重新评估`;
  }

  /**
   * 执行探索阶段
   * @param {string} thought - 探索思考
   * @param {Function} exploreFn - 探索函数
   * @returns {Promise<AnalysisTrace>}
   */
  async explore(thought, exploreFn) {
    this.think(thought);
    const result = await exploreFn();
    this.observe(result.observation || result);
    if (result.reflection) {
      this.reflect(result.reflection);
    }
    return this;
  }

  /**
   * 执行阶段分离：探索 -> 假设 -> 验证
   * @param {Object} params - 参数
   * @param {string} params.exploreThought - 探索阶段思考
   * @param {Function} params.exploreFn - 探索函数
   * @param {string} params.assumption - 形成的假设
   * @param {Function} params.verifyFn - 验证函数
   * @returns {Promise<AnalysisTrace>}
   */
  async exploreWithHypothesis({ exploreThought, exploreFn, assumption, verifyFn }) {
    // 探索阶段
    await this.explore(exploreThought, exploreFn);

    // 记录假设
    this.addAssumption(assumption);

    // 验证阶段
    this.think(`验证假设: ${assumption}`);
    const verifyResult = await verifyFn();
    this.observe(verifyResult.observation || verifyResult);

    // 检测AHA时刻
    const aha = this.detectAha(verifyResult.observation || verifyResult);
    if (aha.detected) {
      this.correct(`AHA! ${aha.newInsight}`, aha.originalAssumption);
    }

    return this;
  }

  /**
   * 获取当前步骤的反思
   * @returns {string|null}
   */
  getCurrentReflection() {
    if (this.entries.length === 0) return null;
    const lastEntry = this.entries[this.entries.length - 1];
    return lastEntry.reflection;
  }

  /**
   * 获取AHA时刻列表
   * @returns {TraceEntry[]}
   */
  getAhaMoments() {
    return this.entries.filter(e => e.isAhaMoment);
  }

  /**
   * 获取修正列表
   * @returns {TraceEntry[]}
   */
  getCorrections() {
    return this.entries.filter(e => e.correction !== null);
  }

  /**
   * 生成人类可读的分析过程
   * @param {Object} [options] - 选项
   * @param {boolean} [options.includeMetadata=false] - 是否包含元数据
   * @param {boolean} [options.includeTimestamps=false] - 是否包含时间戳
   * @returns {string}
   */
  visualize(options = {}) {
    const { includeMetadata = false, includeTimestamps = false } = options;

    if (this.entries.length === 0) {
      return '（空轨迹）';
    }

    const lines = [];
    lines.push('='.repeat(60));
    lines.push(`分析轨迹 #${this.id.slice(0, 8)}`);
    lines.push('='.repeat(60));

    // 添加会话信息和上下文
    if (this.sessionId) {
      lines.push(`会话: ${this.sessionId}`);
    }
    if (Object.keys(this.context).length > 0) {
      lines.push(`上下文: ${JSON.stringify(this.context)}`);
    }
    if (this.assumptions.length > 0) {
      lines.push(`活跃假设: ${this.assumptions.join(', ')}`);
    }

    lines.push('-'.repeat(60));

    // 遍历每个条目
    this.entries.forEach((entry, index) => {
      lines.push(`\n步骤 ${index + 1}. ${entry.id.slice(0, 8)}`);

      if (includeTimestamps) {
        const date = new Date(entry.timestamp);
        lines.push(`  时间: ${date.toLocaleString('zh-CN')}`);
      }

      if (entry.thought) {
        lines.push(`  思考: ${entry.thought}`);
      }

      if (entry.action) {
        lines.push(`  动作: ${entry.action}`);
      }

      if (entry.observation) {
        lines.push(`  观察: ${entry.observation}`);
      }

      if (entry.reflection) {
        lines.push(`  反思: ${entry.reflection}`);
      }

      if (entry.correction) {
        lines.push(`  修正: ${entry.correction}`);
      }

      if (entry.isAhaMoment) {
        lines.push(`  ⭐ AHA时刻!`);
      }

      if (includeMetadata && Object.keys(entry.metadata).length > 0) {
        lines.push(`  元数据: ${JSON.stringify(entry.metadata)}`);
      }
    });

    // 添加统计信息
    lines.push('\n' + '-'.repeat(60));
    lines.push('统计信息:');
    lines.push(`  总步骤: ${this.entries.length}`);
    lines.push(`  AHA时刻: ${this.getAhaMoments().length}`);
    lines.push(`  修正次数: ${this.getCorrections().length}`);
    lines.push(`  活跃假设: ${this.assumptions.length}`);

    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * 生成简化的人类可读摘要
   * @returns {string}
   */
  summarize() {
    if (this.entries.length === 0) {
      return '（空轨迹）';
    }

    const parts = [];
    const ahaMoments = this.getAhaMoments();

    parts.push(`分析轨迹 (${this.entries.length}步)`);

    if (ahaMoments.length > 0) {
      parts.push(`，包含${ahaMoments.length}个关键洞察`);
    }

    if (this.revisionCount > 0) {
      parts.push(`，经历${this.revisionCount}次修正`);
    }

    return parts.join('');
  }

  /**
   * 导出为JSON格式
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      sessionId: this.sessionId,
      context: this.context,
      assumptions: this.assumptions,
      revisionCount: this.revisionCount,
      entries: this.entries.map((entry, index) => ({
        ...entry,
        step: index + 1
      })),
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * 从JSON导入
   * @param {Object} data - JSON数据
   * @returns {AnalysisTrace}
   */
  static fromJSON(data) {
    const trace = new AnalysisTrace(data.id);
    trace.sessionId = data.sessionId;
    trace.context = data.context || {};
    trace.assumptions = data.assumptions || [];
    trace.revisionCount = data.revisionCount || 0;
    trace.entries = data.entries || [];
    trace.currentStep = trace.entries.length;
    return trace;
  }

  /**
   * 获取轨迹统计
   * @returns {TraceStats}
   */
  getStats() {
    const reflections = this.entries.filter(e => e.reflection);
    const avgReflectionLength = reflections.length > 0
      ? reflections.reduce((sum, e) => sum + (e.reflection?.length || 0), 0) / reflections.length
      : 0;

    return {
      totalSteps: this.entries.length,
      ahaMoments: this.getAhaMoments().length,
      corrections: this.getCorrections().length,
      avgReflectionLength: Math.round(avgReflectionLength)
    };
  }

  /**
   * 保存轨迹到文件
   * @param {string} [filename] - 文件名，不提供则使用ID
   * @returns {Promise<string>} - 保存的文件路径
   */
  async save(filename = null) {
    ensureStorageDir();

    const filePath = path.join(
      STORAGE_DIR,
      filename || `trace-${this.id}.json`
    );

    const data = this.toJSON();

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(`${LOGGER_PREFIX} 保存轨迹失败:`, err);
          reject(err);
        } else {
          console.log(`${LOGGER_PREFIX} 轨迹已保存: ${filePath}`);
          resolve(filePath);
        }
      });
    });
  }

  /**
   * 加载轨迹
   * @param {string} traceId - 轨迹ID
   * @returns {Promise<AnalysisTrace>}
   */
  static async load(traceId) {
    const filePath = path.join(STORAGE_DIR, `trace-${traceId}.json`);

    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`${LOGGER_PREFIX} 加载轨迹失败:`, err);
          reject(err);
          return;
        }

        try {
          const jsonData = JSON.parse(data);
          const trace = AnalysisTrace.fromJSON(jsonData);
          resolve(trace);
        } catch (parseErr) {
          console.error(`${LOGGER_PREFIX} 解析轨迹失败:`, parseErr);
          reject(parseErr);
        }
      });
    });
  }

  /**
   * 列出所有保存的轨迹
   * @returns {Promise<Array<{id: string, timestamp: Date, stats: TraceStats}>>}
   */
  static async list() {
    ensureStorageDir();

    return new Promise((resolve, reject) => {
      fs.readdir(STORAGE_DIR, (err, files) => {
        if (err) {
          console.error(`${LOGGER_PREFIX} 列出轨迹失败:`, err);
          reject(err);
          return;
        }

        const traceFiles = files.filter(f => f.startsWith('trace-') && f.endsWith('.json'));

        Promise.all(traceFiles.map(file => {
          const filePath = path.join(STORAGE_DIR, file);
          return new Promise((res) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) {
                res(null);
                return;
              }
              try {
                const json = JSON.parse(data);
                res({
                  id: json.id,
                  timestamp: new Date(json.exportedAt),
                  stats: json.stats
                });
              } catch (e) {
                res(null);
              }
            });
          });
        }))
          .then(results => resolve(results.filter(r => r !== null)))
          .catch(reject);
      });
    });
  }

  /**
   * 设置会话ID
   * @param {string} sessionId - 会话ID
   * @returns {AnalysisTrace}
   */
  setSession(sessionId) {
    this.sessionId = sessionId;
    return this;
  }

  /**
   * 设置上下文
   * @param {Object} context - 上下文对象
   * @returns {AnalysisTrace}
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }

  /**
   * 创建子轨迹（用于复杂分析的分支）
   * @param {string} [label] - 子轨迹标签
   * @returns {AnalysisTrace}
   */
  branch(label = null) {
    const branch = new AnalysisTrace();
    branch.sessionId = this.sessionId;
    branch.context = { ...this.context };
    if (label) {
      branch.context.branch = label;
    }
    return branch;
  }
}

/**
 * 创建新的分析轨迹
 * @param {string} [sessionId] - 会话ID
 * @returns {AnalysisTrace}
 */
function createTrace(sessionId = null) {
  const trace = new AnalysisTrace();
  if (sessionId) {
    trace.setSession(sessionId);
  }
  return trace;
}

/**
 * 辅助函数：创建ReAct风格的分析链
 * @param {Array<{thought: string, action?: string, observation?: string}>} steps - 步骤数组
 * @param {Object} [context] - 初始上下文
 * @returns {AnalysisTrace}
 */
function createReActChain(steps, context = {}) {
  const trace = createTrace();
  trace.setContext(context);

  for (const step of steps) {
    if (step.thought) {
      trace.think(step.thought);
    }
    if (step.action) {
      trace.act(step.thought || '', step.action);
    }
    if (step.observation) {
      trace.observe(step.observation);
    }
  }

  return trace;
}

module.exports = {
  AnalysisTrace,
  createTrace,
  createReActChain,
  createEntry
};
