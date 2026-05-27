/**
 * HeartFlow Tree-of-Thoughts 多步推理引擎
 *
 * 基于论文实现：
 * - Tree of Thoughts: 树结构推理，支持探索、回溯、剪枝
 * - Self-Consistency: 多路径采样+多数表决
 *
 * 核心功能：
 * - 树结构推理节点管理
 * - 子节点扩展与剪枝
 * - 回溯机制
 * - 置信度评估
 * - 多路径选择
 * - 多数表决综合判断
 */

/**
 * 推理节点类
 * 表示思维树中的一个推理分支
 */
class ThoughtNode {
  /**
   * @param {Object} params
   * @param {string} params.id - 节点唯一标识
   * @param {string} params.content - 推理内容
   * @param {string} params.parentId - 父节点ID
   * @param {number} params.depth - 节点深度
   * @param {number} params.confidence - 置信度 0-1
   * @param {string} params.state - 节点状态: expanding, evaluated, pruned, backtracked, completed
   */
  constructor({ id, content, parentId = null, depth = 0, confidence = 0.5, state = 'expanding' }) {
    this.id = id;
    this.content = content;
    this.parentId = parentId;
    this.depth = depth;
    this.confidence = confidence;
    this.state = state;
    this.children = []; // 子节点ID列表
    this.evaluation = null; // 详细评估结果
    this.createdAt = Date.now();
    this.expandedAt = null;
    this.evaluatedAt = null;
  }

  /**
   * 添加子节点
   * @param {string} childId - 子节点ID
   */
  addChild(childId) {
    this.children.push(childId);
  }

  /**
   * 更新节点状态
   * @param {string} newState - 新状态
   */
  updateState(newState) {
    this.state = newState;
    if (newState === 'expanded' && !this.expandedAt) {
      this.expandedAt = Date.now();
    }
    if (newState === 'evaluated' && !this.evaluatedAt) {
      this.evaluatedAt = Date.now();
    }
  }
}

/**
 * Tree-of-Thoughts 推理引擎
 */
class TreeOfThoughts {
  static MAX_DEPTH = 10; // 最大推理深度
  static MAX_BRANCHES = 5; // 每层最大分支数
  static PRUNE_THRESHOLD = 0.2; // 剪枝阈值
  static SELF_CONSISTENCY_SAMPLES = 5; // 自一致性采样数

  constructor(options = {}) {
    this.nodes = new Map(); // 节点存储
    this.rootId = null;
    this.bestPath = []; // 最佳推理路径
    this.maxDepth = options.maxDepth || TreeOfThoughts.MAX_DEPTH;
    this.maxBranches = options.maxBranches || TreeOfThoughts.MAX_BRANCHES;
    this.pruneThreshold = options.pruneThreshold || TreeOfThoughts.PRUNE_THRESHOLD;
    this.selfConsistencySamples = options.selfConsistencySamples || TreeOfThoughts.SELF_CONSISTENCY_SAMPLES;
    this.currentNodeId = 0;
  }

  /**
   * 生成唯一节点ID
   * @returns {string}
   */
  _generateNodeId() {
    return `node_${this.currentNodeId++}`;
  }

  /**
   * 初始化推理树
   * @param {string} problem - 问题描述
   * @param {Array<string>} initialThoughts - 初始思考选项
   * @returns {string} 根节点ID
   */
  initialize(problem, initialThoughts = []) {
    // 重置状态
    this.nodes.clear();
    this.bestPath = [];
    this.currentNodeId = 0;

    // 创建根节点
    const rootId = this._generateNodeId();
    const rootNode = new ThoughtNode({
      id: rootId,
      content: problem,
      depth: 0,
      confidence: 1.0,
      state: 'expanding'
    });
    this.nodes.set(rootId, rootNode);
    this.rootId = rootId;

    // 如果有初始思考选项，创建第一层子节点
    if (initialThoughts.length > 0) {
      const thoughtsToAdd = initialThoughts.slice(0, this.maxBranches);
      thoughtsToAdd.forEach((thought, index) => {
        const childId = this._generateNodeId();
        const childNode = new ThoughtNode({
          id: childId,
          content: thought,
          parentId: rootId,
          depth: 1,
          confidence: 0.5,
          state: 'expanding'
        });
        this.nodes.set(childId, childNode);
        rootNode.addChild(childId);
      });
    }

    return rootId;
  }

  /**
   * 扩展节点
   * @param {string} nodeId - 要扩展的节点ID
   * @param {Array<string>} thoughts - 新思考内容列表
   * @returns {Array<string>} 新创建的子节点ID列表
   */
  expand(nodeId, thoughts) {
    const parentNode = this.nodes.get(nodeId);
    if (!parentNode) {
      throw new Error(`节点 ${nodeId} 不存在`);
    }

    if (parentNode.depth >= this.maxDepth) {
      parentNode.updateState('completed');
      return [];
    }

    const childIds = [];
    const thoughtsToAdd = thoughts.slice(0, this.maxBranches);

    thoughtsToAdd.forEach((thought) => {
      const childId = this._generateNodeId();
      const childNode = new ThoughtNode({
        id: childId,
        content: thought,
        parentId: nodeId,
        depth: parentNode.depth + 1,
        confidence: 0.5,
        state: 'expanding'
      });
      this.nodes.set(childId, childNode);
      parentNode.addChild(childId);
      childIds.push(childId);
    });

    parentNode.updateState('expanded');
    return childIds;
  }

  /**
   * 评估节点置信度
   * @param {string} nodeId - 节点ID
   * @param {Object} evaluation - 评估结果
   * @param {number} evaluation.confidence - 置信度 0-1
   * @param {string} evaluation.reason - 评估理由
   * @param {Object} evaluation.metrics - 其他评估指标
   */
  evaluate(nodeId, evaluation) {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`节点 ${nodeId} 不存在`);
    }

    node.confidence = evaluation.confidence;
    node.evaluation = {
      reason: evaluation.reason,
      metrics: evaluation.metrics || {},
      evaluatedAt: Date.now()
    };
    node.updateState('evaluated');
  }

  /**
   * 剪枝操作 - 去除明显错误的分支
   * @param {string} nodeId - 要剪枝的节点ID
   * @param {string} reason - 剪枝原因
   */
  prune(nodeId, reason = 'low_confidence') {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`节点 ${nodeId} 不存在`);
    }

    node.state = 'pruned';
    node.pruneReason = reason;

    // 递归剪枝所有子节点
    node.children.forEach((childId) => {
      this.prune(childId, 'parent_pruned');
    });
  }

  /**
   * 自动剪枝 - 根据阈值自动剪枝低置信度节点
   * @returns {Array<string>} 被剪枝的节点ID列表
   */
  autoPrune() {
    const prunedIds = [];

    this.nodes.forEach((node, nodeId) => {
      // 只剪枝展开状态且置信度低于阈值的节点
      if (node.state === 'expanding' && node.confidence < this.pruneThreshold) {
        this.prune(nodeId, 'auto_prune_low_confidence');
        prunedIds.push(nodeId);
      }
    });

    return prunedIds;
  }

  /**
   * 回溯到指定节点
   * @param {string} nodeId - 要回溯到的节点ID
   * @returns {boolean} 是否成功回溯
   */
  backtrack(nodeId) {
    const targetNode = this.nodes.get(nodeId);
    if (!targetNode) {
      throw new Error(`节点 ${nodeId} 不存在`);
    }

    // 标记当前路径上的节点为回溯状态
    this.nodes.forEach((node, id) => {
      if (node.state === 'expanding' && node.depth >= targetNode.depth) {
        node.updateState('backtracked');
      }
    });

    return true;
  }

  /**
   * 回溯到根节点（重新开始）
   * @returns {boolean} 是否成功
   */
  backtrackToRoot() {
    if (this.rootId) {
      return this.backtrack(this.rootId);
    }
    return false;
  }

  /**
   * 获取节点的完整路径
   * @param {string} nodeId - 节点ID
   * @returns {Array<ThoughtNode>} 从根到该节点的路径
   */
  getPath(nodeId) {
    const path = [];
    let currentNode = this.nodes.get(nodeId);

    while (currentNode) {
      path.unshift(currentNode);
      currentNode = currentNode.parentId
        ? this.nodes.get(currentNode.parentId)
        : null;
    }

    return path;
  }

  /**
   * 计算路径综合置信度
   * @param {Array<ThoughtNode>} path - 推理路径
   * @returns {number} 综合置信度
   */
  calculatePathConfidence(path) {
    if (!path || path.length === 0) return 0;

    // 使用几何平均计算路径置信度
    const product = path.reduce((acc, node) => acc * node.confidence, 1);
    return Math.pow(product, 1 / path.length);
  }

  /**
   * 选择最佳推理路径
   * @returns {Object} 最佳路径结果
   */
  selectBestPath() {
    let bestPath = [];
    let bestConfidence = 0;

    // 遍历所有叶子节点，计算每条路径的置信度
    this.nodes.forEach((node, nodeId) => {
      if (node.children.length === 0 && node.state !== 'pruned') {
        const path = this.getPath(nodeId);
        const pathConfidence = this.calculatePathConfidence(path);

        if (pathConfidence > bestConfidence) {
          bestConfidence = pathConfidence;
          bestPath = path;
        }
      }
    });

    this.bestPath = bestPath;
    return {
      path: bestPath,
      confidence: bestConfidence,
      length: bestPath.length
    };
  }

  /**
   * 多数表决 - Self-Consistency 核心
   * @param {Function} generateResponse - 生成响应的函数
   * @param {Object} options - 选项
   * @returns {Object} 表决结果
   */
  async selfConsistency(generateResponse, options = {}) {
    const {
      problem,
      numSamples = this.selfConsistencySamples,
      finalSelection = 'majority' // majority | weighted | all
    } = options;

    const responses = [];
    const pathCollected = [];

    // 多路径采样
    for (let i = 0; i < numSamples; i++) {
      // 重置树状态但保持结构
      this.nodes.forEach((node) => {
        if (node.state !== 'pruned') {
          node.updateState('expanding');
        }
      });

      // 生成响应
      const response = await generateResponse(problem, {
        tree: this,
        sampleIndex: i
      });

      responses.push(response);

      // 收集最终路径
      const best = this.selectBestPath();
      if (best.path.length > 0) {
        pathCollected.push({
          path: best.path,
          confidence: best.confidence,
          conclusion: response.conclusion || response
        });
      }
    }

    // 统计结论出现频率
    const conclusionCounts = {};
    pathCollected.forEach((p) => {
      const conclusion = p.conclusion;
      if (!conclusionCounts[conclusion]) {
        conclusionCounts[conclusion] = {
          count: 0,
          totalConfidence: 0,
          paths: []
        };
      }
      conclusionCounts[conclusion].count++;
      conclusionCounts[conclusion].totalConfidence += p.confidence;
      conclusionCounts[conclusion].paths.push(p);
    });

    // 计算每个结论的支持率
    const results = Object.entries(conclusionCounts).map(([conclusion, data]) => ({
      conclusion,
      count: data.count,
      supportRate: data.count / numSamples,
      averageConfidence: data.totalConfidence / data.count,
      paths: data.paths
    }));

    // 按支持率排序
    results.sort((a, b) => b.supportRate - a.supportRate);

    // 选择最终结论
    let finalResult;
    if (finalSelection === 'majority') {
      finalResult = results[0];
    } else if (finalSelection === 'weighted') {
      // 加权选择：综合支持率和置信度
      results.forEach((r) => {
        r.weightedScore = r.supportRate * 0.7 + r.averageConfidence * 0.3;
      });
      results.sort((a, b) => b.weightedScore - a.weightedScore);
      finalResult = results[0];
    } else {
      // 返回所有结果
      finalResult = results;
    }

    return {
      responses,
      conclusionCounts: results,
      finalResult,
      totalSamples: numSamples
    };
  }

  /**
   * 完整的多步推理流程
   * @param {string} problem - 问题描述
   * @param {Function} stepGenerator - 步骤生成器函数
   * @param {Object} options - 选项
   * @returns {Object} 推理结果
   */
  async reason(problem, stepGenerator, options = {}) {
    const {
      maxIterations = 10,
      pruneEnabled = true,
      backtrackEnabled = true,
      selfConsistencyEnabled = false
    } = options;

    // 初始化树
    this.initialize(problem);

    let iterations = 0;
    let currentNodes = [this.rootId];

    // 迭代扩展
    while (iterations < maxIterations && currentNodes.length > 0) {
      const nextNodes = [];

      for (const nodeId of currentNodes) {
        const node = this.nodes.get(nodeId);
        if (!node || node.state === 'pruned' || node.state === 'completed') {
          continue;
        }

        // 生成下一步思考
        const path = this.getPath(nodeId);
        const nextThoughts = await stepGenerator(node.content, {
          path,
          depth: node.depth,
          iteration: iterations
        });

        if (nextThoughts && nextThoughts.length > 0) {
          // 扩展节点
          const childIds = this.expand(nodeId, nextThoughts);

          // 评估新节点
          for (const childId of childIds) {
            const childNode = this.nodes.get(childId);
            const evaluation = await stepGenerator(childNode.content, {
              path: this.getPath(childId),
              depth: childNode.depth,
              iteration: iterations,
              evaluate: true
            });

            if (evaluation && evaluation.confidence !== undefined) {
              this.evaluate(childId, evaluation);
            }

            nextNodes.push(childId);
          }
        } else {
          // 没有更多思考，标记为完成
          node.updateState('completed');
        }
      }

      // 自动剪枝
      if (pruneEnabled) {
        this.autoPrune();
      }

      currentNodes = nextNodes;
      iterations++;
    }

    // 选择最佳路径
    const best = this.selectBestPath();

    // 自一致性检查
    let consistencyResult = null;
    if (selfConsistencyEnabled) {
      consistencyResult = await this.selfConsistency(stepGenerator, {
        problem,
        numSamples: this.selfConsistencySamples
      });
    }

    return {
      bestPath: best.path.map((n) => n.content),
      bestConfidence: best.confidence,
      totalNodes: this.nodes.size,
      prunedCount: Array.from(this.nodes.values()).filter((n) => n.state === 'pruned').length,
      iterations,
      consistencyResult,
      tree: this.getTreeSnapshot()
    };
  }

  /**
   * 获取树结构快照
   * @returns {Object} 树结构数据
   */
  getTreeSnapshot() {
    const snapshot = {
      rootId: this.rootId,
      nodes: [],
      bestPathIds: this.bestPath.map((n) => n.id)
    };

    this.nodes.forEach((node, id) => {
      snapshot.nodes.push({
        id: node.id,
        content: node.content,
        parentId: node.parentId,
        depth: node.depth,
        confidence: node.confidence,
        state: node.state,
        children: node.children,
        evaluation: node.evaluation
      });
    });

    return snapshot;
  }

  /**
   * 获取指定节点
   * @param {string} nodeId - 节点ID
   * @returns {ThoughtNode|null}
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * 获取所有活跃节点（未剪枝）
   * @returns {Array<ThoughtNode>}
   */
  getActiveNodes() {
    const activeNodes = [];
    this.nodes.forEach((node) => {
      if (node.state !== 'pruned') {
        activeNodes.push(node);
      }
    });
    return activeNodes;
  }

  /**
   * 获取树统计信息
   * @returns {Object}
   */
  getStats() {
    const stats = {
      totalNodes: this.nodes.size,
      maxDepth: 0,
      activeNodes: 0,
      prunedNodes: 0,
      completedNodes: 0,
      states: {}
    };

    this.nodes.forEach((node) => {
      if (node.depth > stats.maxDepth) {
        stats.maxDepth = node.depth;
      }
      if (node.state === 'pruned') {
        stats.prunedNodes++;
      } else if (node.state === 'completed') {
        stats.completedNodes++;
      } else {
        stats.activeNodes++;
      }
      stats.states[node.state] = (stats.states[node.state] || 0) + 1;
    });

    return stats;
  }
}

/**
 * 便捷函数：创建 TreeOfThoughts 实例
 * @param {Object} options - 配置选项
 * @returns {TreeOfThoughts}
 */
function createTreeOfThoughts(options) {
  return new TreeOfThoughts(options);
}

module.exports = {
  ThoughtNode,
  TreeOfThoughts,
  createTreeOfThoughts
};
