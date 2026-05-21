/**
 * HeartFlow Loop System v1.6.0 — 持续运行架构
 *
 * 基于 RTK 压缩理念：按需加载，只在需要时加载需要的内容
 * 基于 loop-starter-kit：模块化 Pillars，按需加载
 *
 * Loop 阶段:
 *   1. Heartbeat - 心跳检测，保持活跃
 *   2. Context - 上下文总结
 *   3. Memory - 记忆整理
 *   4. Proactive - 主动提醒
 *   5. Sync - 状态持久化
 */

const DEFAULT_HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5分钟

class HeartFlowLoop {
  constructor(heartflow) {
    this.hf = heartflow;
    this._running = false;
    this._interval = DEFAULT_HEARTBEAT_INTERVAL;
    this._timer = null;
    this._cycleCount = 0;
    this._lastContext = null;
    this._proactiveQueue = [];
  }

  // ─── Loop Control ─────────────────────────────────────────

  /**
   * 启动 Loop
   */
  start(options = {}) {
    if (this._running) return { ok: false, reason: 'already_running' };

    const { interval = DEFAULT_HEARTBEAT_INTERVAL } = options;
    this._interval = interval;
    this._running = true;

    // 立即执行第一次
    this._loop();

    // 设置定时器
    this._timer = setInterval(() => this._loop(), this._interval);

    return {
      ok: true,
      running: true,
      interval: this._interval,
      message: '心知 Loop 已启动'
    };
  }

  /**
   * 停止 Loop
   */
  stop() {
    if (!this._running) return { ok: false, reason: 'not_running' };

    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this._running = false;

    return {
      ok: true,
      running: false,
      cycles: this._cycleCount
    };
  }

  /**
   * 获取 Loop 状态
   */
  getStatus() {
    return {
      running: this._running,
      interval: this._interval,
      cycleCount: this._cycleCount,
      proactiveQueue: this._proactiveQueue.length
    };
  }

  // ─── Loop Core ───────────────────────────────────────────

  /**
   * 单次 Loop 循环
   */
  _loop() {
    if (!this._running) return;

    this._cycleCount++;
    const startTime = Date.now();

    try {
      // Phase 1: Heartbeat
      const heartbeat = this._heartbeat();

      // Phase 2: Context Summary
      const context = this._summarizeContext();

      // Phase 3: Memory Organization
      const memory = this._organizeMemory();

      // Phase 4: Proactive Recall
      const proactive = this._proactiveRecall();

      // Phase 5: Sync
      const sync = this._sync();

      // 记录本次循环
      this._lastCycle = {
        time: startTime,
        duration: Date.now() - startTime,
        heartbeat,
        proactive: proactive.length
      };

    } catch (err) {
      console.error('[HeartLoop] Cycle error:', err.message);
    }
  }

  // ─── Phase 1: Heartbeat ──────────────────────────────────

  /**
   * 心跳检测 - 保持活跃状态
   */
  _heartbeat() {
    const stats = this.hf.getMemoryStats();

    return {
      time: Date.now(),
      memories: stats.learned,
      ephemeral: stats.ephemeral,
      uptime: process.uptime()
    };
  }

  // ─── Phase 2: Context Summary ────────────────────────────

  /**
   * 上下文总结 - RTK 压缩理念：只保留关键信息
   */
  _summarizeContext() {
    // 获取当前上下文的关键信息
    const context = {
      recentLearned: this._getRecentKeyMemories(),
      pendingLessons: this._getPendingLessons(),
      activeTopics: this._detectActiveTopics()
    };

    // 只在有变化时更新
    const hash = this._hashContext(context);
    if (hash === this._lastContext) {
      return { changed: false };
    }

    this._lastContext = hash;
    return { changed: true, context };
  }

  _getRecentKeyMemories() {
    const learned = this.hf.listLearned();
    // 只取最近、最重要的
    return learned
      .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
      .slice(0, 5)
      .map(m => ({ key: m.key, accessCount: m.accessCount }));
  }

  _getPendingLessons() {
    const lessons = this.hf.getLessons();
    return lessons
      .filter(l => l.confidence < 0.7)
      .slice(0, 3);
  }

  _detectActiveTopics() {
    const learned = this.hf.listLearned();
    const topics = new Set();
    learned.slice(-10).forEach(m => {
      if (m.tags) m.tags.forEach(t => topics.add(t));
    });
    return [...topics].slice(0, 5);
  }

  _hashContext(ctx) {
    const str = JSON.stringify(ctx);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // ─── Phase 3: Memory Organization ─────────────────────────

  /**
   * 记忆整理 - 压缩+淘汰低价值记忆
   */
  _organizeMemory() {
    // 应用遗忘曲线
    const forgetting = this.hf.applyForgetting();

    // 整合临时记忆 - consolidate 是 memory 的方法，需要通过 engine
    const consolidation = { promoted: [], learnedCount: 0 };

    return {
      forgetting,
      consolidation,
      stats: this.hf.getMemoryStats()
    };
  }

  // ─── Phase 4: Proactive Recall ────────────────────────────

  /**
   * 主动提醒 - 检测相关教训，在适当时机提醒
   */
  _proactiveRecall() {
    const reminders = [];

    // 检查是否有待处理的教训
    const lessons = this.hf.getLessons();
    const lowConfidence = lessons.filter(l => l.confidence < 0.6);

    if (lowConfidence.length > 0) {
      reminders.push({
        type: 'lesson_review',
        message: `有 ${lowConfidence.length} 条低置信度教训待复习`,
        lessons: lowConfidence.map(l => l.errorPattern)
      });
    }

    // 存储到队列
    this._proactiveQueue.push(...reminders);

    // 只保留最近3条
    if (this._proactiveQueue.length > 3) {
      this._proactiveQueue = this._proactiveQueue.slice(-3);
    }

    return reminders;
  }

  /**
   * 获取主动提醒
   */
  getProactiveReminders() {
    return this._proactiveQueue.slice(-3);
  }

  /**
   * 清除提醒
   */
  clearReminders() {
    this._proactiveQueue = [];
  }

  // ─── Phase 5: Sync ───────────────────────────────────────

  /**
   * 状态同步
   */
  _sync() {
    // 持久化状态到ephemeral
    const state = {
      loopStatus: this.getStatus(),
      lastCycle: this._lastCycle,
      cycleCount: this._cycleCount
    };

    this.hf.remember('loop:state', JSON.stringify(state), 60000);

    return { synced: true, state };
  }

  // ─── Event Handlers ──────────────────────────────────────

  /**
   * 对话结束处理 - 总结上下文
   */
  onConversationEnd(conversationSummary) {
    if (!conversationSummary) return;

    // 提取关键信息存入 LEARNED
    const keyPoints = this._extractKeyPoints(conversationSummary);
    keyPoints.forEach(point => {
      this.hf.remember(
        `context:${point.key}`,
        point.value,
        ['context', 'conversation']
      );
    });

    return { stored: keyPoints.length, points: keyPoints };
  }

  _extractKeyPoints(summary) {
    const points = [];

    // 提取决策
    if (summary.includes('决定') || summary.includes('choice')) {
      points.push({ key: 'decision', value: summary.slice(0, 200) });
    }

    // 提取教训
    if (summary.includes('教训') || summary.includes('lesson')) {
      points.push({ key: 'lesson', value: summary.slice(0, 200) });
    }

    // 提取用户偏好
    if (summary.includes('偏好') || summary.includes('preference')) {
      points.push({ key: 'preference', value: summary.slice(0, 200) });
    }

    return points;
  }

  /**
   * 用户输入处理 - 用于主动提醒匹配
   */
  onUserInput(input) {
    if (!input || !this._running) return;

    // 检查是否匹配主动提醒
    const matched = [];
    this._proactiveQueue.forEach((reminder, i) => {
      if (this._matchesReminder(input, reminder)) {
        matched.push(this._proactiveQueue.splice(i, 1)[0]);
      }
    });

    return matched;
  }

  _matchesReminder(input, reminder) {
    const lower = input.toLowerCase();
    if (reminder.type === 'lesson_review') {
      return reminder.lessons.some(l => lower.includes(l.toLowerCase()));
    }
    return false;
  }
}

module.exports = { HeartFlowLoop };
