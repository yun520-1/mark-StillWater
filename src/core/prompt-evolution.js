/**
 * 提示词进化引擎 - PromptBreeder & SELF-INSTRUCT 实现
 *
 * 基于论文:
 * - PromptBreeder (DeepMind 2024): 进化算法让LLM自己进化提示词
 * - SELF-INSTRUCT: 用LLM自我生成指令来微调
 *
 * 功能:
 * 1. 提示词基因编码 - 将提示词分解为可突变的"基因"
 * 2. 进化操作 - 突变、交叉、选择
 * 3. 适应度评估 - 基于分析准确率评估提示词效果
 * 4. 提示词池 - 维护多代提示词，记录每代效果
 */

const GENE_TYPES = {
  ROLE: 'role',                    // 角色定义
  TASK: 'task',                    // 任务描述
  CONSTRAINT: 'constraint',        // 约束条件
  OUTPUT_FORMAT: 'output_format',  // 输出格式
  STYLE: 'style',                  // 风格要求
  DOMAIN: 'domain',                // 领域知识
  EXAMPLE: 'example',              // 示例
  REASONING: 'reasoning',          // 推理策略
  META: 'meta'                     // 元提示词
};

/**
 * 单个基因类
 * 代表提示词的一个可突变单元
 */
class PromptGene {
  constructor(type, content, weight = 1.0) {
    this.type = type;              // 基因类型
    this.content = content;        // 基因内容
    this.weight = weight;          // 权重（影响交叉和选择）
    this.mutationRate = 0.1;       // 突变率
    this.history = [{ content, timestamp: Date.now() }]; // 突变历史
  }

  /**
   * 克隆基因
   */
  clone() {
    const gene = new PromptGene(this.type, this.content, this.weight);
    gene.mutationRate = this.mutationRate;
    gene.history = [...this.history];
    return gene;
  }

  /**
   * 记录突变历史
   */
  recordMutation(newContent) {
    this.history.push({ content: newContent, timestamp: Date.now() });
    this.content = newContent;
  }
}

/**
 * 提示词基因组类
 * 代表一个完整的提示词，由多个基因组成
 */
class PromptGenome {
  constructor(genes = []) {
    this.genes = genes;           // 基因数组
    this.fitness = null;          // 适应度分数
    this.generation = 0;          // 所属代数
    this.id = this._generateId(); // 唯一标识
    this.createdAt = Date.now();  // 创建时间
    this.evaluationHistory = [];   // 评估历史
  }

  /**
   * 生成唯一ID
   */
  _generateId() {
    return `genome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 将基因组合成完整提示词
   */
  toPrompt() {
    const sections = {};

    // 按类型组织基因
    for (const gene of this.genes) {
      if (!sections[gene.type]) {
        sections[gene.type] = [];
      }
      sections[gene.type].push(gene.content);
    }

    // 构建提示词结构
    let prompt = '';

    // 角色定义
    if (sections[GENE_TYPES.ROLE]) {
      prompt += `【角色定义】\n${sections[GENE_TYPES.ROLE].join('\n')}\n\n`;
    }

    // 领域知识
    if (sections[GENE_TYPES.DOMAIN]) {
      prompt += `【领域知识】\n${sections[GENE_TYPES.DOMAIN].join('\n')}\n\n`;
    }

    // 任务描述
    if (sections[GENE_TYPES.TASK]) {
      prompt += `【任务描述】\n${sections[GENE_TYPES.TASK].join('\n')}\n\n`;
    }

    // 约束条件
    if (sections[GENE_TYPES.CONSTRAINT]) {
      prompt += `【约束条件】\n${sections[GENE_TYPES.CONSTRAINT].join('\n')}\n\n`;
    }

    // 推理策略
    if (sections[GENE_TYPES.REASONING]) {
      prompt += `【推理策略】\n${sections[GENE_TYPES.REASONING].join('\n')}\n\n`;
    }

    // 输出格式
    if (sections[GENE_TYPES.OUTPUT_FORMAT]) {
      prompt += `【输出格式】\n${sections[GENE_TYPES.OUTPUT_FORMAT].join('\n')}\n\n`;
    }

    // 风格要求
    if (sections[GENE_TYPES.STYLE]) {
      prompt += `【风格要求】\n${sections[GENE_TYPES.STYLE].join('\n')}\n\n`;
    }

    // 示例
    if (sections[GENE_TYPES.EXAMPLE]) {
      prompt += `【示例】\n${sections[GENE_TYPES.EXAMPLE].join('\n')}\n\n`;
    }

    // 元提示词
    if (sections[GENE_TYPES.META]) {
      prompt += `【元提示词】\n${sections[GENE_TYPES.META].join('\n')}\n`;
    }

    return prompt.trim();
  }

  /**
   * 从提示词解析出基因
   * 使用结构化标记解析
   */
  static fromPrompt(prompt, options = {}) {
    const genes = [];
    const { preserveSections = true } = options;

    // 定义各类型基因的标记模式
    const sectionPatterns = {
      [GENE_TYPES.ROLE]: /【角色定义】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.DOMAIN]: /【领域知识】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.TASK]: /【任务描述】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.CONSTRAINT]: /【约束条件】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.REASONING]: /【推理策略】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.OUTPUT_FORMAT]: /【输出格式】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.STYLE]: /【风格要求】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.EXAMPLE]: /【示例】\s*\n([\s\S]*?)(?=\n\n【|$)/,
      [GENE_TYPES.META]: /【元提示词】\s*\n([\s\S]*?)$/
    };

    // 解析各类型基因
    for (const [type, pattern] of Object.entries(sectionPatterns)) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        const content = match[1].trim();
        // 如果保留分段，按换行分割
        const items = preserveSections
          ? content.split('\n').filter(s => s.trim())
          : [content];

        for (const item of items) {
          genes.push(new PromptGene(type, item.trim()));
        }
      }
    }

    // 如果没有找到任何结构化标记，尝试智能解析
    if (genes.length === 0) {
      return PromptGenome._smartParse(prompt);
    }

    return genes;
  }

  /**
   * 智能解析非结构化提示词
   */
  static _smartParse(prompt) {
    const genes = [];
    const lines = prompt.split('\n').filter(l => l.trim());

    // 简单的启发式解析
    let currentType = GENE_TYPES.TASK;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // 检测常见模式
      if (/^你是|^角色|^身份/.test(trimmed)) {
        if (currentContent.length > 0) {
          genes.push(new PromptGene(currentType, currentContent.join('\n')));
        }
        currentType = GENE_TYPES.ROLE;
        currentContent = [trimmed];
      } else if (/^请|^需要|^必须|^应该/.test(trimmed)) {
        if (currentContent.length > 0) {
          genes.push(new PromptGene(currentType, currentContent.join('\n')));
        }
        currentType = GENE_TYPES.TASK;
        currentContent = [trimmed];
      } else if (/^##|^输出|^格式/.test(trimmed)) {
        if (currentContent.length > 0) {
          genes.push(new PromptGene(currentType, currentContent.join('\n')));
        }
        currentType = GENE_TYPES.OUTPUT_FORMAT;
        currentContent = [trimmed];
      } else if (/^示例|^比如|^例如/.test(trimmed)) {
        if (currentContent.length > 0) {
          genes.push(new PromptGene(currentType, currentContent.join('\n')));
        }
        currentType = GENE_TYPES.EXAMPLE;
        currentContent = [trimmed];
      } else {
        currentContent.push(trimmed);
      }
    }

    // 添加最后一个基因
    if (currentContent.length > 0) {
      genes.push(new PromptGene(currentType, currentContent.join('\n')));
    }

    return genes;
  }

  /**
   * 获取指定类型的基因
   */
  getGenesByType(type) {
    return this.genes.filter(g => g.type === type);
  }

  /**
   * 添加基因
   */
  addGene(type, content, weight = 1.0) {
    this.genes.push(new PromptGene(type, content, weight));
  }

  /**
   * 移除基因
   */
  removeGene(index) {
    if (index >= 0 && index < this.genes.length) {
      this.genes.splice(index, 1);
    }
  }

  /**
   * 克隆基因组
   */
  clone() {
    const newGenome = new PromptGenome([]);
    newGenome.genes = this.genes.map(g => g.clone());
    newGenome.generation = this.generation;
    return newGenome;
  }

  /**
   * 更新适应度
   */
  updateFitness(fitness, metadata = {}) {
    this.fitness = fitness;
    this.evaluationHistory.push({
      fitness,
      metadata,
      timestamp: Date.now()
    });
  }

  /**
   * 获取基因数量统计
   */
  getGeneStats() {
    const stats = {};
    for (const gene of this.genes) {
      stats[gene.type] = (stats[gene.type] || 0) + 1;
    }
    return stats;
  }
}

/**
 * 提示词进化引擎
 * 实现PromptBreeder算法的核心逻辑
 */
class PromptEvolutionEngine {
  constructor(options = {}) {
    // 配置参数
    this.populationSize = options.populationSize || 20;      // 种群大小
    this.mutationRate = options.mutationRate || 0.15;         // 突变率
    this.crossoverRate = options.crossoverRate || 0.7;      // 交叉率
    this.eliteRatio = options.eliteRatio || 0.1;            // 精英比例
    this.geneMutationRate = options.geneMutationRate || 0.2; // 基因级突变率

    // 状态
    this.population = [];              // 当前种群
    this.generation = 0;              // 当前代数
    this.history = [];                // 进化历史
    this.bestGenome = null;           // 历史最佳个体
    this.bestFitness = -Infinity;    // 历史最佳适应度

    // 外部依赖（用于适应度评估）
    this.evaluationCallback = options.evaluationCallback || null;

    // 变异操作库
    this.mutationOperators = [
      'randomReplacement',    // 随机替换
      'geneAmplification',     // 基因放大
      'geneAttenuation',       // 基因衰减
      'geneInsertion',         // 基因插入
      'geneDeletion',          // 基因删除
      'subtreeMutation',      // 子树突变
      'crossover'             // 交叉（特殊）
    ];

    // 初始种群（如果提供）
    if (options.initialPrompts) {
      for (const prompt of options.initialPrompts) {
        const genome = new PromptGenome();
        genome.genes = PromptGenome.fromPrompt(prompt);
        genome.generation = 0;
        this.population.push(genome);
      }
    }
  }

  /**
   * 设置适应度评估回调
   */
  setEvaluationCallback(callback) {
    this.evaluationCallback = callback;
  }

  /**
   * 执行一代进化
   */
  async evolve() {
    this.generation++;

    // 1. 评估当前种群中所有个体的适应度
    await this._evaluatePopulation();

    // 2. 记录历史
    this._recordHistory();

    // 3. 选择精英个体直接保留
    const elites = this._selectElites();

    // 4. 创建新一代种群
    const newPopulation = [...elites];

    while (newPopulation.length < this.populationSize) {
      // 选择父本
      const parent1 = this._tournamentSelect();
      const parent2 = this._tournamentSelect();

      let offspring;

      // 交叉或复制
      if (Math.random() < this.crossoverRate) {
        offspring = this._crossover(parent1, parent2);
      } else {
        offspring = parent1.clone();
      }

      // 突变
      if (Math.random() < this.mutationRate) {
        this._mutate(offspring);
      }

      offspring.generation = this.generation;
      newPopulation.push(offspring);
    }

    // 5. 替换旧种群
    this.population = newPopulation;

    // 6. 更新最佳个体
    this._updateBest();

    return {
      generation: this.generation,
      bestFitness: this.bestFitness,
      avgFitness: this._calculateAvgFitness(),
      populationSize: this.population.length
    };
  }

  /**
   * 评估种群中所有个体的适应度
   */
  async _evaluatePopulation() {
    for (const genome of this.population) {
      if (genome.fitness === null) {
        genome.fitness = await this._evaluateGenome(genome);
      }
    }
  }

  /**
   * 评估单个基因组的适应度
   */
  async _evaluateGenome(genome) {
    if (this.evaluationCallback) {
      return await this.evaluationCallback(genome);
    }
    // 默认评估：基于基因多样性和结构完整性
    return this._defaultFitness(genome);
  }

  /**
   * 默认适应度函数
   */
  _defaultFitness(genome) {
    // 鼓励基因多样性
    const geneDiversity = Object.keys(genome.getGeneStats()).length;
    // 鼓励适当的基因数量
    const geneCount = genome.genes.length;
    // 适度评分
    const structureScore = (geneDiversity * 2) + Math.min(geneCount, 10);
    return structureScore;
  }

  /**
   * 记录进化历史
   */
  _recordHistory() {
    const stats = this._calculatePopulationStats();
    this.history.push({
      generation: this.generation,
      bestFitness: stats.bestFitness,
      avgFitness: stats.avgFitness,
      worstFitness: stats.worstFitness,
      bestGenome: this.bestGenome ? this.bestGenome.id : null,
      timestamp: Date.now()
    });
  }

  /**
   * 计算种群统计
   */
  _calculatePopulationStats() {
    const fitnesses = this.population
      .map(g => g.fitness)
      .filter(f => f !== null);

    return {
      bestFitness: Math.max(...fitnesses),
      avgFitness: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
      worstFitness: Math.min(...fitnesses)
    };
  }

  /**
   * 计算平均适应度
   */
  _calculateAvgFitness() {
    const fitnesses = this.population
      .map(g => g.fitness)
      .filter(f => f !== null);
    return fitnesses.length > 0
      ? fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length
      : 0;
  }

  /**
   * 选择精英个体
   */
  _selectElites() {
    const eliteCount = Math.max(1, Math.floor(this.populationSize * this.eliteRatio));

    // 按适应度排序
    const sorted = [...this.population]
      .filter(g => g.fitness !== null)
      .sort((a, b) => b.fitness - a.fitness);

    return sorted.slice(0, eliteCount).map(g => g.clone());
  }

  /**
   * 锦标赛选择
   */
  _tournamentSelect(tournamentSize = 3) {
    const candidates = [];
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      candidates.push(this.population[randomIndex]);
    }

    // 返回适应度最高的
    return candidates.reduce((best, current) => {
      if (current.fitness > best.fitness) return current;
      return best;
    });
  }

  /**
   * 交叉操作 - 组合两个父本的基因
   */
  _crossover(parent1, parent2) {
    const offspring = new PromptGenome([]);

    // 获取所有基因类型
    const allTypes = Object.values(GENE_TYPES);

    // 为每个类型选择基因来源
    for (const type of allTypes) {
      const genes1 = parent1.getGenesByType(type);
      const genes2 = parent2.getGenesByType(type);

      if (Math.random() < 0.5 && genes1.length > 0) {
        // 从父本1继承
        const selectedGene = genes1[Math.floor(Math.random() * genes1.length)];
        offspring.genes.push(selectedGene.clone());
      } else if (genes2.length > 0) {
        // 从父本2继承
        const selectedGene = genes2[Math.floor(Math.random() * genes2.length)];
        offspring.genes.push(selectedGene.clone());
      }
    }

    // 如果 offspring 为空，复制父本1
    if (offspring.genes.length === 0) {
      return parent1.clone();
    }

    return offspring;
  }

  /**
   * 突变操作
   */
  _mutate(genome) {
    // 选择突变操作符
    const operator = this.mutationOperators[
      Math.floor(Math.random() * this.mutationOperators.length)
    ];

    switch (operator) {
      case 'randomReplacement':
        this._randomReplacement(genome);
        break;
      case 'geneAmplification':
        this._geneAmplification(genome);
        break;
      case 'geneAttenuation':
        this._geneAttenuation(genome);
        break;
      case 'geneInsertion':
        this._geneInsertion(genome);
        break;
      case 'geneDeletion':
        this._geneDeletion(genome);
        break;
      case 'subtreeMutation':
        this._subtreeMutation(genome);
        break;
      default:
        this._randomReplacement(genome);
    }
  }

  /**
   * 随机替换某个基因的内容
   */
  _randomReplacement(genome) {
    if (genome.genes.length === 0) return;

    const index = Math.floor(Math.random() * genome.genes.length);
    const gene = genome.genes[index];

    // 生成新的基因内容
    const newContent = this._generateGeneContent(gene.type);
    gene.recordMutation(newContent);
  }

  /**
   * 基因放大 - 复制某个基因
   */
  _geneAmplification(genome) {
    if (genome.genes.length === 0) return;

    const index = Math.floor(Math.random() * genome.genes.length);
    const gene = genome.genes[index];
    const newGene = gene.clone();

    // 在原基因后插入
    genome.genes.splice(index + 1, 0, newGene);
  }

  /**
   * 基因衰减 - 降低某个基因的权重
   */
  _geneAttenuation(genome) {
    if (genome.genes.length === 0) return;

    const index = Math.floor(Math.random() * genome.genes.length);
    const gene = genome.genes[index];
    gene.weight = Math.max(0.1, gene.weight * 0.8);
  }

  /**
   * 基因插入 - 添加新基因
   */
  _geneInsertion(genome) {
    // 随机选择一个基因类型
    const types = Object.values(GENE_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];

    const newGene = new PromptGene(type, this._generateGeneContent(type));
    genome.genes.push(newGene);
  }

  /**
   * 基因删除 - 移除某个基因
   */
  _geneDeletion(genome) {
    if (genome.genes.length <= 1) return;

    const index = Math.floor(Math.random() * genome.genes.length);
    genome.removeGene(index);
  }

  /**
   * 子树突变 - 替换整个基因子集
   */
  _subtreeMutation(genome) {
    // 找到某个类型的基因
    const types = Object.values(GENE_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const genesOfType = genome.getGenesByType(type);

    // 生成新的子树
    const newContent = this._generateGeneContent(type);

    if (genesOfType.length > 0) {
      // 替换现有基因
      const index = genome.genes.indexOf(genesOfType[0]);
      genome.genes[index].recordMutation(newContent);
    } else {
      // 添加新基因
      genome.addGene(type, newContent);
    }
  }

  /**
   * 生成基因内容（用于突变）
   */
  _generateGeneContent(type) {
    const templates = {
      [GENE_TYPES.ROLE]: [
        '你是一个经验丰富的心理分析师',
        '你是一位专业的心理健康顾问',
        '你是一个善于倾听的朋友',
        '你是一个中立的情感观察者'
      ],
      [GENE_TYPES.TASK]: [
        '分析用户输入中的情感状态',
        '识别潜在的认知扭曲模式',
        '评估用户的心理需求',
        '检测危机风险信号'
      ],
      [GENE_TYPES.CONSTRAINT]: [
        '只提供分析，不提供诊断',
        '保持中立和非评判态度',
        '优先关注用户安全',
        '尊重用户隐私'
      ],
      [GENE_TYPES.OUTPUT_FORMAT]: [
        '以JSON格式返回分析结果',
        '使用结构化的问题列表',
        '采用分级评估报告格式',
        '输出简洁明了的结论'
      ],
      [GENE_TYPES.STYLE]: [
        '使用温和、支持性的语言',
        '保持专业但友好的语气',
        '语气平和、理解性强',
        '表达清晰、直接'
      ],
      [GENE_TYPES.DOMAIN]: [
        '心理学基础知识',
        '认知行为疗法原理',
        '情绪调节理论',
        '危机干预方法'
      ],
      [GENE_TYPES.EXAMPLE]: [
        '输入: "我总是失败" → 输出: 检测到过度概括',
        '示例: 识别"全或无"思维模式',
        '案例: 从用户描述中提取关键情绪'
      ],
      [GENE_TYPES.REASONING]: [
        '先识别情绪，再分析认知',
        '从表层到深层逐步分析',
        '综合多维度信息',
        '聚焦核心问题'
      ],
      [GENE_TYPES.META]: [
        '考虑用户可能的防御心理',
        '注意文化差异的影响',
        '平衡共情与分析深度'
      ]
    };

    const options = templates[type] || ['新的基因内容'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 更新历史最佳个体
   */
  _updateBest() {
    const currentBest = this.population.reduce((best, current) => {
      if (current.fitness > (best?.fitness || -Infinity)) {
        return current;
      }
      return best;
    }, null);

    if (currentBest && currentBest.fitness > this.bestFitness) {
      this.bestFitness = currentBest.fitness;
      this.bestGenome = currentBest.clone();
    }
  }

  /**
   * 添加初始提示词到种群
   */
  addPrompt(prompt) {
    const genome = new PromptGenome();
    genome.genes = PromptGenome.fromPrompt(prompt);
    genome.generation = this.generation;
    this.population.push(genome);
  }

  /**
   * 使用外部反馈更新适应度
   * @param {string} genomeId - 基因组ID
   * @param {number} fitness - 新的适应度值
   * @param {object} metadata - 额外元数据（如准确率等）
   */
  updateGenomeFitness(genomeId, fitness, metadata = {}) {
    const genome = this.population.find(g => g.id === genomeId);
    if (genome) {
      genome.updateFitness(fitness, metadata);
      this._updateBest();
    }
  }

  /**
   * 获取当前最佳提示词
   */
  getBestPrompt() {
    return this.bestGenome ? this.bestGenome.toPrompt() : null;
  }

  /**
   * 获取当前种群中所有提示词
   */
  getAllPrompts() {
    return this.population.map(g => ({
      id: g.id,
      prompt: g.toPrompt(),
      fitness: g.fitness,
      generation: g.generation
    }));
  }

  /**
   * 获取进化历史
   */
  getEvolutionHistory() {
    return this.history;
  }

  /**
   * 获取种群统计
   */
  getStats() {
    return {
      generation: this.generation,
      populationSize: this.population.length,
      bestFitness: this.bestFitness,
      avgFitness: this._calculateAvgFitness(),
      totalEvaluations: this.population.reduce(
        (sum, g) => sum + g.evaluationHistory.length,
        0
      ),
      historyLength: this.history.length
    };
  }

  /**
   * 生成进化报告
   */
  generateReport() {
    const stats = this.getStats();
    const recentHistory = this.history.slice(-10);

    return {
      summary: {
        currentGeneration: stats.generation,
        bestFitnessEver: this.bestFitness,
        currentBestFitness: stats.bestFitness,
        improvement: this.history.length > 1
          ? stats.bestFitness - (this.history[0]?.bestFitness || 0)
          : 0
      },
      recentProgress: recentHistory.map(h => ({
        generation: h.generation,
        bestFitness: h.bestFitness,
        avgFitness: h.avgFitness
      })),
      bestPrompt: this.bestGenome ? {
        genes: this.bestGenome.genes.map(g => ({
          type: g.type,
          content: g.content
        })),
        fitness: this.bestGenome.fitness
      } : null
    };
  }

  /**
   * 重置进化引擎
   */
  reset() {
    this.population = [];
    this.generation = 0;
    this.history = [];
    this.bestGenome = null;
    this.bestFitness = -Infinity;
  }

  /**
   * 导出种群数据
   */
  exportPopulation() {
    return {
      generation: this.generation,
      population: this.population.map(g => ({
        id: g.id,
        genes: g.genes.map(gene => ({
          type: gene.type,
          content: gene.content,
          weight: gene.weight
        })),
        fitness: g.fitness,
        generation: g.generation
      })),
      history: this.history
    };
  }

  /**
   * 导入种群数据
   */
  importPopulation(data) {
    this.generation = data.generation;
    this.history = data.history || [];

    this.population = data.population.map(gData => {
      const genome = new PromptGenome([]);
      genome.id = gData.id;
      genome.fitness = gData.fitness;
      genome.generation = gData.generation;
      genome.genes = gData.genes.map(geneData => {
        const gene = new PromptGene(geneData.type, geneData.content, geneData.weight);
        return gene;
      });
      return genome;
    });

    // 更新最佳个体
    this._updateBest();
  }
}

/**
 * 提示词池管理器
 * 维护多代提示词，记录每代效果
 */
class PromptPool {
  constructor(options = {}) {
    this.maxGenerations = options.maxGenerations || 10;  // 保留的代数
    this.maxPerGeneration = options.maxPerGeneration || 50; // 每代最大数量
    this.pools = new Map();  // Map<generation, PromptGenome[]>
    this.metadata = {
      createdAt: Date.now(),
      totalPrompts: 0,
      bestPerGeneration: new Map()
    };
  }

  /**
   * 添加提示词到指定代数
   */
  add(genome, generation) {
    if (!this.pools.has(generation)) {
      this.pools.set(generation, []);
    }

    const pool = this.pools.get(generation);
    if (pool.length < this.maxPerGeneration) {
      pool.push(genome);
      this.metadata.totalPrompts++;
    }

    // 更新每代最佳
    const currentBest = this.metadata.bestPerGeneration.get(generation);
    if (!currentBest || genome.fitness > currentBest.fitness) {
      this.metadata.bestPerGeneration.set(generation, genome);
    }

    // 清理旧代数
    this._cleanup();
  }

  /**
   * 获取指定代数的提示词
   */
  getByGeneration(generation) {
    return this.pools.get(generation) || [];
  }

  /**
   * 获取所有代数
   */
  getAllGenerations() {
    return Array.from(this.pools.keys()).sort((a, b) => a - b);
  }

  /**
   * 获取历史最佳提示词
   */
  getHistoricalBest() {
    let best = null;
    for (const genome of this.metadata.bestPerGeneration.values()) {
      if (!best || genome.fitness > best.fitness) {
        best = genome;
      }
    }
    return best;
  }

  /**
   * 获取指定代数的最佳提示词
   */
  getBestOfGeneration(generation) {
    return this.metadata.bestPerGeneration.get(generation) || null;
  }

  /**
   * 清理旧代数
   */
  _cleanup() {
    const generations = this.getAllGenerations();
    const toRemove = generations.slice(0, generations.length - this.maxGenerations);

    for (const gen of toRemove) {
      this.pools.delete(gen);
      this.metadata.bestPerGeneration.delete(gen);
    }
  }

  /**
   * 获取统计数据
   */
  getStats() {
    return {
      totalPrompts: this.metadata.totalPrompts,
      generationCount: this.pools.size,
      generations: this.getAllGenerations(),
      bestPerGeneration: Array.from(this.metadata.bestPerGeneration.entries()).map(
        ([gen, genome]) => ({
          generation: gen,
          fitness: genome.fitness,
          geneCount: genome.genes.length
        })
      ),
      overallBest: this.getHistoricalBest() ? {
        fitness: this.getHistoricalBest().fitness,
        generation: this.getHistoricalBest().generation
      } : null
    };
  }

  /**
   * 导出池数据
   */
  export() {
    const exportData = {
      metadata: this.metadata,
      pools: {}
    };

    for (const [gen, pool] of this.pools.entries()) {
      exportData.pools[gen] = pool.map(g => ({
        id: g.id,
        genes: g.genes.map(gene => ({
          type: gene.type,
          content: gene.content,
          weight: gene.weight
        })),
        fitness: g.fitness,
        generation: g.generation
      }));
    }

    return exportData;
  }

  /**
   * 获取适合继续进化的提示词（多样性采样）
   */
  sampleForEvolution(count = 5) {
    const samples = [];
    const generations = this.getAllGenerations();

    // 从最近的代数中采样
    const recentGens = generations.slice(-3);

    for (const gen of recentGens) {
      const pool = this.getByGeneration(gen);
      for (const genome of pool) {
        samples.push(genome);
      }
    }

    // 打乱并取前 count 个
    return samples
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }
}

// 导出模块
module.exports = {
  GENE_TYPES,
  PromptGene,
  PromptGenome,
  PromptEvolutionEngine,
  PromptPool
};
