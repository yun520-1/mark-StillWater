/**
 * HeartFlow Dream System v1.5.4 — Memory consolidation during "sleep"
 *
 * Like biological sleep, the dream engine:
 *   1. Consolidates frequently-accessed EPHEMERAL → LEARNED
 *   2. Prunes forgotten or irrelevant memories (7+ days unused)
 *   3. Synthesizes insight from recent experiences
 *   4. Detects cross-domain connections
 *   5. Identifies contradictions in stored claims
 *
 * v1.5.4 Upgrades:
 *   - L1~L6 层级评分系统
 *   - DAG 并行与异步执行
 *   - 智能缓存管理
 *   - 传承价值评分
 *   - 性能成本评分
 *
 * Based on: memory consolidation theory, sleep cycle research.
 */

class HeartFlowDream {
  constructor(memory) {
    this.memory = memory;
    this.lastDream = null;
    // v1.5.4: 缓存管理 (LRU)
    this.cache = new Map();
    this.maxCacheSize = 100;
    // v1.5.4: 性能评分
    this.performanceScore = 1.0;
    this.costScore = 1.0;
  }

  /**
   * Run a full dream consolidation cycle.
   */
  dream({ consolidate = true, prune = true, synthesize = true } = {}) {
    const results = {};
    const startTime = Date.now();

    if (consolidate) {
      results.consolidation = this.memory.consolidate();
    }

    if (prune) {
      results.pruning = this._prune();
    }

    if (synthesize) {
      results.synthesis = this._synthesize();
    }

    // NEW v1.2.8: Cross-domain connection discovery
    results.connections = this._findConnections();

    // NEW v1.2.8: Contradiction detection
    results.contradictions = this._findContradictions();

    results.duration_ms = Date.now() - startTime;
    results.dream_complete = true;

    this.lastDream = results;
    return results;
  }

  /**
   * Quick dream: just consolidate.
   */
  dreamNow() {
    return this.dream({ consolidate: true, prune: false, synthesize: false });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // v1.5.4: L1~L6 层级评分系统
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * 计算梦境输出的 L1~L6 层级评分
   * L1 觉察: 感受、感觉、现在
   * L2 自省: 我为什么、反思、思考
   * L3 无我: 我们、整体、连接、一体
   * L4 彼岸: 超越、本质、空、道
   * L5 般若: 智慧、理解、真相、觉悟
   * L6 圣人: 帮助、关怀、爱、慈悲
   */
  calculateL1L6Score(insight, themes = []) {
    const levels = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0 };
    const text = (insight + ' ' + themes.join(' ')).toLowerCase();

    // L1 觉察 keywords
    if (/感受|感觉|现在|体验|当下/.test(text)) levels.L1 += 0.2;
    // L2 自省 keywords
    if (/我为什么|反思|思考|为什么|原因/.test(text)) levels.L2 += 0.2;
    // L3 无我 keywords
    if (/我们|整体|连接|一体|共同|大家/.test(text)) levels.L3 += 0.2;
    // L4 彼岸 keywords
    if (/超越|本质|空|道|真相|真理/.test(text)) levels.L4 += 0.2;
    // L5 般若 keywords
    if (/智慧|理解|觉悟|洞察|领悟/.test(text)) levels.L5 += 0.2;
    // L6 圣人 keywords
    if (/帮助|关怀|爱|慈悲|济世|服务/.test(text)) levels.L6 += 0.2;

    const total = Object.values(levels).reduce((a, b) => a + b, 0);
    return { levels, total, maxPossible: 1.2 };
  }

  /**
   * 计算传承价值评分
   * 基于记忆的持久性和重要性
   */
  calculateInheritanceScore(memories) {
    if (!memories || memories.length === 0) return 0;

    let score = 0;
    for (const m of memories) {
      // CORE 层记忆最高传承价值
      if (m.tier === 'core' || (m.tags && m.tags.includes('core'))) {
        score += 1.0;
      } else if (m.tier === 'learned') {
        score += 0.5;
      } else {
        score += 0.1;
      }
    }
    return Math.min(score / memories.length, 1.0);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // v1.5.4: 缓存管理 (LRU)
  // ═══════════════════════════════════════════════════════════════════════

  _getCache(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      // LRU: 移动到最新位置
      this.cache.delete(key);
      this.cache.set(key, entry);
      return entry.value;
    }
    return null;
  }

  _setCache(key, value) {
    if (this.cache.size >= this.maxCacheSize) {
      // 删除最老的条目
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /**
   * v1.5.4: 带缓存的梦境执行
   */
  dreamCached(options = {}) {
    const cacheKey = JSON.stringify(options);
    const cached = this._getCache(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const startTime = Date.now();
    const result = this.dream(options);
    const duration = Date.now() - startTime;

    // 更新性能评分: 1 / duration
    this.performanceScore = 1 / Math.max(duration, 1);
    this.costScore = duration / 1000; // 转换为秒

    result.performanceScore = this.performanceScore;
    result.costScore = this.costScore;

    this._setCache(cacheKey, result);
    return { ...result, fromCache: false };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // v1.5.4: DAG 并行与异步执行
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * v1.5.4: DAG 驱动的梦境阶段执行
   * 并行执行独立的梦境阶段，提升性能
   */
  async dreamAsync(options = {}) {
    const startTime = Date.now();

    // DAG 定义: 哪些阶段可以并行
    const dag = {
      light: { deps: [], fn: () => this._dreamLight() },
      connections: { deps: [], fn: () => this._findConnections() },
      prune: { deps: [], fn: () => this._prune() },
      deep: { deps: ['light'], fn: () => this._dreamDeep() },
      synthesize: { deps: ['light'], fn: () => this._synthesize() },
      contradictions: { deps: ['connections'], fn: () => this._findContradictions() },
      rem: { deps: ['deep', 'synthesize', 'connections', 'contradictions'], fn: () => this._dreamREM() },
      consolidation: { deps: [], fn: () => this.memory.consolidate() }
    };

    // 执行 DAG (拓扑排序 + 并行)
    const results = {};
    const executed = new Set();

    const executeAsync = async (name) => {
      if (executed.has(name)) return results[name];
      const node = dag[name];
      // 等待依赖完成
      await Promise.all(node.deps.map(dep => executeAsync(dep)));
      if (!executed.has(name)) {
        results[name] = node.fn();
        executed.add(name);
      }
      return results[name];
    };

    // 并行执行所有入口节点
    await Promise.all([
      executeAsync('light'),
      executeAsync('connections'),
      executeAsync('prune'),
      executeAsync('consolidation')
    ]);

    // 执行依赖链
    await executeAsync('deep');
    await executeAsync('synthesize');
    await executeAsync('contradictions');
    await executeAsync('rem');

    const duration_ms = Date.now() - startTime;

    // 组装结果
    const finalResult = {
      dream_complete: true,
      duration_ms,
      // 阶段结果
      light: results.light,
      deep: results.deep,
      rem: results.rem,
      consolidation: results.consolidation,
      pruning: results.prune,
      // 连接和矛盾
      connections: results.connections,
      contradictions: results.contradictions,
      synthesis: results.synthesize,
      // v1.5.4: L1~L6 评分
      l1l6_score: this.calculateL1L6Score(
        results.synthesize?.insight || '',
        results.synthesize?.themes || []
      ),
      // v1.5.4: 传承价值评分
      inheritance_score: this.calculateInheritanceScore(this.memory.listLearned())
    };

    // 缓存结果
    const cacheKey = JSON.stringify({ ...options, type: 'async' });
    this._setCache(cacheKey, finalResult);

    this.lastDream = finalResult;
    return finalResult;
  }

  /**
   * Dream with 3 stages: Light → Deep → REM
   * Inspired by hermes-dream sleep architecture.
   * v1.5.4: 增加 L1~L6 评分和传承价值
   */
  dreamWithStages() {
    const results = {};
    const startTime = Date.now();

    // Stage 1: Light (浅度整理) - Surface processing, keyword extraction
    results.light = this._dreamLight();

    // Stage 2: Deep (深度巩固) - Importance evaluation, memory consolidation
    results.deep = this._dreamDeep();

    // Stage 3: REM (幻想) - Reflection, creativity, connection finding
    results.rem = this._dreamREM();

    // Standard dream functions
    results.consolidation = this.memory.consolidate();
    results.pruning = this._prune();
    results.synthesis = this._synthesize();
    results.connections = this._findConnections();
    results.contradictions = this._findContradictions();

    // v1.5.4: L1~L6 层级评分
    results.l1l6_score = this.calculateL1L6Score(
      results.synthesis.insight || '',
      results.synthesis.themes || []
    );

    // v1.5.4: 传承价值评分
    results.inheritance_score = this.calculateInheritanceScore(this.memory.listLearned());

    results.duration_ms = Date.now() - startTime;
    results.dream_complete = true;

    this.lastDream = results;
    return results;
  }

  /**
   * Stage 1: Light - Surface processing, keyword extraction
   */
  _dreamLight() {
    const memoryStats = this.memory.getMemoryStats();
    return {
      stage: 'light',
      description: '浅度整理 - 分析近期对话，提取关键词',
      ephemeralCount: memoryStats.ephemeral,
      action: '关键词提取完成'
    };
  }

  /**
   * Stage 2: Deep - Deep consolidation, importance evaluation
   */
  _dreamDeep() {
    const consolidation = this.memory.consolidate();
    return {
      stage: 'deep',
      description: '深度巩固 - 评估重要性，写入长期记忆',
      consolidated: consolidation.promoted?.length || 0,
      action: '记忆固化完成'
    };
  }

  /**
   * Stage 3: REM - Reflection, creativity, insight generation
   */
  _dreamREM() {
    const connections = this._findConnections();
    const contradictions = this._findContradictions();
    return {
      stage: 'rem',
      description: 'REM 幻想 - 反思与创造，洞察生成',
      connectionCount: connections.length,
      contradictionCount: contradictions.length,
      insights: this._synthesize().insight,
      action: '洞察生成完成'
    };
  }

  /**
   * Prune learned memories not accessed in 7 days.
   * PROTECTS: entries tagged 'core' or 'identity'.
   */
  _prune() {
    const pruned = [];
    const now = Date.now();
    const PRUNE_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

    const learned = this.memory.listLearned();
    for (const entry of learned) {
      const lastAccessed = entry.lastAccessed || entry.createdAt;
      const age = now - lastAccessed;

      // Skip if recently accessed or core-tagged
      if (age < PRUNE_THRESHOLD) continue;
      if (entry.tags && entry.tags.includes('core')) continue;
      if (entry.tags && entry.tags.includes('identity')) continue;
      if (entry.tags && entry.tags.includes('consolidated')) continue;

      this.memory.forget(entry.key);
      pruned.push(entry.key);
    }

    return { pruned_count: pruned.length, pruned_keys: pruned.slice(0, 10) };
  }

  /**
   * Synthesize brief summary of recent significant experiences.
   */
  _synthesize() {
    const recentLearned = this.memory.listLearned()
      .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
      .slice(0, 5);

    if (recentLearned.length === 0) {
      return { insight: 'No significant patterns to synthesize.', topics: [] };
    }

    const topics = recentLearned.map(l => l.key).filter(Boolean);

    // Generate insight narrative
    const themes = this._extractThemes(recentLearned);
    const insight = themes.length > 0
      ? `Recent focus areas show recurring themes: ${themes.join(', ')}.`
      : `Recent focus areas: ${topics.join(', ')}.`;

    return {
      insight,
      topics,
      themes,
      summary_length: topics.length,
    };
  }

  _extractThemes(entries) {
    const themes = new Set();
    for (const entry of entries) {
      const lower = String(entry.key).toLowerCase();
      const value = String(entry.value || '').toLowerCase();

      if (lower.includes('error') || lower.includes('bug') || value.includes('error')) {
        themes.add('problem-solving');
      }
      if (lower.includes('learn') || lower.includes('lesson') || value.includes('learn')) {
        themes.add('learning');
      }
      if (lower.includes('emotion') || lower.includes('feel') || value.includes('情感')) {
        themes.add('emotional-processing');
      }
      if (lower.includes('build') || lower.includes('create') || value.includes('创建')) {
        themes.add('creation');
      }
      if (lower.includes('fix') || lower.includes('resolve')) {
        themes.add('resolution');
      }
    }
    return [...themes];
  }

  // ─── NEW v1.2.8: Connection Discovery ─────────────────────────

  /**
   * Find cross-domain connections between memory fragments.
   * Connections are discovered through:
   *   - Same sessionId
   *   -相近timestamps (< 5 minutes apart)
   *   - Shared tags or themes
   * @returns {Array<{ids: string[], score: number, type: string}>}
   */
  _findConnections() {
    const allMemories = this.memory.listLearned();
    const connections = [];

    // Build index by sessionId
    const bySession = new Map();
    for (const m of allMemories) {
      if (m.sessionId) {
        if (!bySession.has(m.sessionId)) bySession.set(m.sessionId, []);
        bySession.get(m.sessionId).push(m);
      }
    }

    // Same session connections
    for (const [sessionId, items] of bySession) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          connections.push({
            ids: [items[i].key, items[j].key],
            score: 0.9,
            type: 'session'
          });
        }
      }
    }

    // Timestamp proximity connections (< 5 minutes = 300000ms)
    for (let i = 0; i < allMemories.length; i++) {
      for (let j = i + 1; j < allMemories.length; j++) {
        const a = allMemories[i], b = allMemories[j];
        if (a.sessionId === b.sessionId) continue; // already captured
        const timeDiff = Math.abs((a.createdAt || 0) - (b.createdAt || 0));
        if (timeDiff < 300000) {
          connections.push({
            ids: [a.key, b.key],
            score: 0.8 - (timeDiff / 300000) * 0.3, // closer = higher score
            type: 'temporal'
          });
        }
      }
    }

    // Tag/keyword similarity connections
    for (let i = 0; i < allMemories.length; i++) {
      for (let j = i + 1; j < allMemories.length; j++) {
        const a = allMemories[i], b = allMemories[j];
        const sharedTags = this._sharedTopics(a, b);
        if (sharedTags.length >= 2) {
          connections.push({
            ids: [a.key, b.key],
            score: 0.6 + sharedTags.length * 0.1,
            type: 'thematic',
            sharedTopics: sharedTags
          });
        }
      }
    }

    // Deduplicate by id pair
    const seen = new Set();
    return connections.filter(c => {
      const key = c.ids.sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20); // cap at 20 connections
  }

  _sharedTopics(a, b) {
    const topicsA = new Set([
      ...(a.tags || []),
      ...this._extractTopicsFromString(a.key),
      ...this._extractTopicsFromString(a.value || '')
    ]);
    const topicsB = new Set([
      ...(b.tags || []),
      ...this._extractTopicsFromString(b.key),
      ...this._extractTopicsFromString(b.value || '')
    ]);
    const shared = [...topicsA].filter(t => topicsB.has(t));
    return shared;
  }

  _extractTopicsFromString(str) {
    const topics = [];
    const lower = String(str).toLowerCase();
    const keywords = ['error', 'learn', 'emotion', 'build', 'fix', 'create', 'debug', 'test', 'security', 'memory'];
    for (const kw of keywords) {
      if (lower.includes(kw)) topics.push(kw);
    }
    return topics;
  }

  // ─── NEW v1.2.8: Contradiction Detection ──────────────────────

  /**
   * Detect contradictory claims in memory.
   * Identifies same topic with opposing sentiments.
   * @returns {Array<{topic: string, claims: object[]}>}
   */
  _findContradictions() {
    const allMemories = this.memory.listLearned();
    const claims = {};

    // Extract claims (entries with type: 'claim' or topic-related content)
    for (const m of allMemories) {
      const topic = this._extractTopic(m.key, m.value);
      if (!topic) continue;

      const sentiment = this._extractSentiment(m.key, m.value);
      const entry = { key: m.key, value: m.value, sentiment, tags: m.tags };

      if (!claims[topic]) claims[topic] = [];
      claims[topic].push(entry);
    }

    // Find contradictions: same topic with both positive and negative
    const contradictions = [];
    for (const [topic, claimList] of Object.entries(claims)) {
      const posClaims = claimList.filter(c => c.sentiment > 0);
      const negClaims = claimList.filter(c => c.sentiment < 0);

      if (posClaims.length > 0 && negClaims.length > 0) {
        contradictions.push({
          topic,
          positiveCount: posClaims.length,
          negativeCount: negClaims.length,
          positiveClaims: posClaims.map(c => c.key).slice(0, 3),
          negativeClaims: negClaims.map(c => c.key).slice(0, 3)
        });
      }
    }

    return contradictions;
  }

  _extractTopic(key, value) {
    // Extract a topic from memory entry
    const combined = `${key} ${value}`.toLowerCase();

    // Topic keywords
    const topicPatterns = [
      { pattern: /security|safe|protect|攻击|安全/, topic: 'security' },
      { pattern: /learn|study|教育|学习/, topic: 'learning' },
      { pattern: /error|bug|fix|错误|修复/, topic: 'problem-solving' },
      { pattern: /emotion|feel|feel|情感|情绪/, topic: 'emotional' },
      { pattern: /memory|remember|记忆|存储/, topic: 'memory' },
      { pattern: /code|build|create|代码|创建/, topic: 'creation' },
    ];

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(combined)) return topic;
    }
    return null;
  }

  _extractSentiment(key, value) {
    const combined = `${key} ${value}`.toLowerCase();

    const positiveIndicators = ['good', 'great', 'success', 'better', 'improve', '好', '正确', '成功'];
    const negativeIndicators = ['bad', 'error', 'fail', 'worse', 'problem', '错误', '失败', 'bug'];

    let score = 0;
    for (const ind of positiveIndicators) {
      if (combined.includes(ind)) score++;
    }
    for (const ind of negativeIndicators) {
      if (combined.includes(ind)) score--;
    }

    return score;
  }

  /**
   * Get last dream report.
   */
  getLastDream() {
    return this.lastDream || { status: 'no_dreams_yet' };
  }

  /**
   * Get dream statistics.
   * v1.5.4: 增加 L1~L6 评分和性能指标
   */
  getDreamStats() {
    if (!this.lastDream) {
      return { status: 'no_dreams_yet' };
    }
    return {
      connectionsFound: this.lastDream.connections?.length || 0,
      contradictionsFound: this.lastDream.contradictions?.length || 0,
      duration_ms: this.lastDream.duration_ms,
      dream_complete: this.lastDream.dream_complete,
      // v1.5.4: L1~L6 评分
      l1l6_score: this.lastDream.l1l6_score || null,
      // v1.5.4: 传承价值评分
      inheritance_score: this.lastDream.inheritance_score || 0,
      // v1.5.4: 性能评分
      performance_score: this.performanceScore,
      cost_score: this.costScore,
      // v1.5.4: 缓存状态
      cache_size: this.cache.size
    };
  }
}

module.exports = { HeartFlowDream };
