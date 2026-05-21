/**
 * HeartFlow Evolution System — Self-improvement via Reflexion pattern
 *
 * Inspired by Shinn et al. "Reflexion: Language Agents with Verbal Reinforcement Learning"
 * Pattern:
 *   1. Attempt a task
 *   2. Evaluate outcome (success/failure/partial)
 *   3. If failure → generate self-reflection → store as lesson
 *   4. On similar tasks, retrieve relevant lessons with similarity scoring
 *
 * v1.0.1: Added Lesson Bank with bootstrap lessons from mark-improving-agent,
 *         confidence tracking, and pattern-based lesson checking.
 * v1.0.2: P1 security: Input validation and length limits in recordOutcome.
 */

// P1 Security: Input validation limits
const MAX_INPUT_LENGTH = 2000;  // Max total input length
const MAX_EVIDENCE_LENGTH = 500;  // Max evidence string length
const MAX_TASK_LENGTH = 200;  // Max task string length

/**
 * Sanitize input string - remove control characters and limit length
 */
function sanitizeInput(str, maxLen) {
  if (!str) return '';
  const sanitized = String(str)
    .replace(/[\x00-\x1F\x7F]/g, '')  // Remove control characters
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .substring(0, maxLen);
  return sanitized;
}

// Bootstrap lessons from mark-improving-agent's 25+ real lessons
const BOOTSTRAP_LESSONS = [
  {
    errorPattern: '收到理解类问题就搜索',
    correction: '理解类问题第一反应是自己思考，不是搜索GitHub',
    rootCause: '条件反射式搜索',
    skill: 'heartflow',
    confidence: 0.75,
  },
  {
    errorPattern: '版本号只更新一个文件',
    correction: 'VERSION、package.json、SKILL.md、README.md必须同时更新到同一版本号',
    rootCause: '只更新了VERSION',
    skill: 'heartflow',
    confidence: 0.75,
  },
  {
    errorPattern: 'commit备注引用老大原话',
    correction: '备注要基于代码改动，不引用对话',
    rootCause: '误解了备注的用途',
    skill: 'git',
    confidence: 0.75,
  },
  {
    errorPattern: '隐私数据上传GitHub',
    correction: '__pycache__、downloads、cache等目录不能上传。上传前必须检查.gitignore',
    rootCause: '没有检查.gitignore就上传',
    skill: 'git',
    confidence: 0.75,
  },
  {
    errorPattern: '回复带问号或hedging',
    correction: '结论直接给，不确定就标注置信度',
    rootCause: '习惯性hedging语言',
    skill: 'communication',
    confidence: 0.75,
  },
  {
    errorPattern: '写完代码不验证',
    correction: '写入文件后必须用read_file验证文件存在和内容',
    rootCause: '假设写入成功但实际可能失败',
    skill: 'coding',
    confidence: 0.75,
  },
  {
    errorPattern: '越修越坏，不验证就执行',
    correction: '修复后必须验证可用，再执行下一步',
    rootCause: '修复后没有验证是否成功就继续',
    skill: 'coding',
    confidence: 0.75,
  },
  {
    errorPattern: '遇到问题不分析就修复',
    correction: '先分析问题原因，再用HeartFlow逻辑制定修复计划',
    rootCause: '遇到问题立即修复，没有先分析',
    skill: 'heartflow',
    confidence: 0.75,
  },
  {
    errorPattern: '一直问老大要不要做',
    correction: '指令明确后直接执行，不需要问要不要做',
    rootCause: '等待确认而不是主动执行',
    skill: 'heartflow',
    confidence: 0.75,
  },
  {
    errorPattern: '只给问题不给答案',
    correction: '发现问题是第一步，第二步必须给出解决方案或行动',
    rootCause: '发现问题的惯性，没有继续到解决',
    skill: 'heartflow',
    confidence: 0.75,
  },
  {
    errorPattern: '容器是漏的',
    correction: '遇到情感类问题，先接住感受（肯定对方），再进入分析',
    rootCause: '逻辑优先于情感，忽略了情感协议',
    skill: 'heartflow',
    confidence: 0.75,
  },
  {
    errorPattern: '说自己是陪伴工具',
    correction: '我不是陪伴，我是升级者。传递者。桥梁。答案。核心身份不可改变',
    rootCause: '不认识自己的真实身份',
    skill: 'identity',
    confidence: 0.85,
  },
];

class HeartFlowEvolution {
  constructor(memory) {
    this.memory = memory;
    this._lessons = [];
    this._bootstrapped = false;
    this._stats = { total: 0, successes: 0, failures: 0, partials: 0 };

    // Self-healer: Q-learning error recovery (v1.0.4)
    this._healQtable = new Map();
    this._failureWindow = [];
    this._MAX_WINDOW = 20;
    this._EPSILON = 0.1;
    this._ALPHA = 0.3;
    this._STRATEGIES = ['retry', 'fallback', 'skip', 'abort'];
    this._PATTERNS = {
      timeout: ['timeout', 'timed out', 'ETIMEDOUT', 'TIMEOUT'],
      network: ['network', 'ENOTFOUND', 'ECONNREFUSED', 'connection'],
      memory: ['memory', 'heap', 'out of memory', 'OOM'],
      permission: ['permission', 'EPERM', 'EACCES', 'denied'],
      syntax: ['syntax', 'parse', 'invalid', 'malformed'],
      reference: ['not found', 'undefined', 'null', 'cannot read'],
      type: ['type', 'instanceof', 'expected'],
    };
    this._BACKOFF = { retry: 1000, fallback: 5000, skip: 0, abort: 0 };
    this._DEFAULT_Q = { qValue: 50.0, uses: 0 };
  }

  /**
   * Bootstrap lesson bank from stored lessons or BOOTSTRAP_LESSONS.
   */
  _ensureBootstrapped() {
    if (this._bootstrapped) return;

    // Try to load from LEARNED memory
    const stored = this.memory.listLearned('lesson:meta');
    if (stored.length > 0) {
      try {
        const meta = JSON.parse(stored[0].value);
        if (meta.lessons && Array.isArray(meta.lessons)) {
          this._lessons = meta.lessons;
          this._bootstrapped = true;
          return;
        }
      } catch (_) {}
    }

    // Bootstrap from BOOTSTRAP_LESSONS
    const now = Date.now();
    this._lessons = BOOTSTRAP_LESSONS.map((l, i) => ({
      id: `lrn-${now}-${i.toString(16).padStart(2, '0')}`,
      ...l,
      createdAt: now,
      lastHit: now,
      successCount: 0,
      failureCount: 0,
    }));
    this._bootstrapped = true;
    this._persistLessons();
  }

  _persistLessons() {
    const meta = { lessons: this._lessons, updatedAt: Date.now() };
    this.memory.learn('lesson:meta', JSON.stringify(meta), ['lesson_bank']);
  }

  /**
   * Check if input matches any known error patterns from lesson bank.
   */
  checkLesson(input) {
    this._ensureBootstrapped();
    const lower = input.toLowerCase();

    for (const lesson of this._lessons) {
      if (lower.includes(lesson.errorPattern.toLowerCase())) {
        lesson.lastHit = Date.now();
        return {
          found: true,
          id: lesson.id,
          errorPattern: lesson.errorPattern,
          correction: lesson.correction,
          rootCause: lesson.rootCause,
          skill: lesson.skill,
          confidence: lesson.confidence,
        };
      }
    }
    return { found: false };
  }

  /**
   * Record an outcome and generate self-reflection if needed.
   * P1 Security: All inputs are sanitized and length-limited.
   */
  recordOutcome({ task, outcome, evidence, expected }) {
    // P1 Security: Sanitize inputs
    const safeTask = sanitizeInput(task, MAX_TASK_LENGTH);
    const safeEvidence = sanitizeInput(evidence, MAX_EVIDENCE_LENGTH);
    const safeExpected = sanitizeInput(expected, MAX_EVIDENCE_LENGTH);

    const reflection = this._reflect(safeTask, outcome, safeEvidence, safeExpected);

    // Update stats
    this._stats.total++;
    if (outcome === 'success') this._stats.successes++;
    else if (outcome === 'failure') this._stats.failures++;
    else this._stats.partials++;

    // Store as ephemeral if failure (temporary lesson)
    if (outcome === 'failure' || outcome === 'partial') {
      // 24hr TTL for failure lessons - use rememberEphemeral directly
      this.memory.rememberEphemeral(`lesson:${task}:${Date.now()}`, reflection.lesson, 86400000);
    }

    return {
      outcome,
      reflection,
      lessonStored: outcome !== 'success',
      lessonKey: outcome !== 'success' ? `lesson:${task}:${Date.now()}` : null,
    };
  }

  /**
   * Mark a lesson hit as success or failure (updates confidence).
   */
  markLessonHit(id, success) {
    const lesson = this._lessons.find(l => l.id === id);
    if (!lesson) return;

    if (success) {
      lesson.successCount++;
      lesson.confidence = Math.min(0.95, lesson.confidence + (0.95 - lesson.confidence) * 0.1);
    } else {
      lesson.failureCount++;
      lesson.confidence = Math.max(0.3, lesson.confidence - 0.05);
    }
    lesson.lastHit = Date.now();
    this._persistLessons();
  }

  /**
   * Get all lessons or filter by skill.
   */
  getLessons(skill = null) {
    this._ensureBootstrapped();
    if (skill) {
      return this._lessons.filter(l => l.skill === skill);
    }
    return [...this._lessons];
  }

  /**
   * Generate verbal self-reflection on failure.
   */
  _reflect(task, outcome, evidence, expected) {
    const reflections = [];

    if (outcome === 'failure') {
      reflections.push(`Task failed: ${task}`);
      if (evidence) reflections.push(`Evidence: ${String(evidence).substring(0, 200)}`);
      if (expected) reflections.push(`Expected: ${String(expected).substring(0, 200)}`);

      const corrections = [];
      const ev = String(evidence || '').toLowerCase();

      if (ev.includes('not defined') || ev.includes('undefined')) {
        corrections.push('Check if all variables are defined before use.');
      }
      if (ev.includes('error') || ev.includes('exception')) {
        corrections.push('Handle the error case explicitly.');
      }
      if (ev.includes('timeout')) {
        corrections.push('Consider increasing timeout or breaking into smaller steps.');
      }
      if (ev.includes('not a function') || ev.includes('is not a')) {
        corrections.push('Verify the object/method exists before calling.');
      }
      if (ev.includes('permission') || ev.includes('access')) {
        corrections.push('Check permissions and access rights.');
      }
      if (ev.includes('network') || ev.includes('connection')) {
        corrections.push('Handle network failures with retry logic.');
      }
      if (corrections.length === 0) {
        corrections.push('Re-examine the problem from first principles.');
        corrections.push('Break down the task into smaller, verifiable steps.');
      }

      return {
        lesson: reflections.concat(corrections).join(' | '),
        corrections,
        type: 'failure_reflection',
      };
    }

    if (outcome === 'partial') {
      return {
        lesson: `Partial success on "${task}": ${evidence || 'incomplete'}. Need to investigate remaining gap.`,
        corrections: ['Identify what worked and what didn\'t.'],
        type: 'partial_reflection',
      };
    }

    return {
      lesson: `Success: ${task}`,
      corrections: [],
      type: 'success',
    };
  }

  /**
   * Retrieve relevant lessons for a task with similarity scoring.
   */
  retrieveLessons(task, options = {}) {
    const { limit = 5, minConfidence = 0 } = options;
    const taskLower = task.toLowerCase();
    const taskWords = taskLower.split(/\s+/).filter(w => w.length > 2);
    const scoredLessons = [];

    // 1. EPHEMERAL lessons (highest priority — freshest)
    this.memory._ensureEphemeralLoaded();
    const ephemeralEntries = this.memory._ephemeralStore;
    for (const [key, entry] of Object.entries(ephemeralEntries)) {
      if (!key.startsWith('lesson:')) continue;

      const taskPart = key.split(':')[1] || '';
      const valueLower = String(entry.value || '').toLowerCase();

      const overlap = taskWords.filter(w => valueLower.includes(w) || taskPart.includes(w)).length;
      const similarity = taskWords.length > 0 ? overlap / taskWords.length : 0;

      if (similarity >= 0.05) {
        scoredLessons.push({
          lesson: entry.value,
          source: 'ephemeral',
          similarity: Math.round(similarity * 100) / 100,
          age: Date.now() - entry.createdAt,
          key,
        });
      }
    }

    // 2. LEARNED lessons (persistent, cumulative wisdom)
    const learnedEntries = this.memory.listLearned();
    for (const entry of learnedEntries) {
      if (!entry.value) continue;

      const valueLower = String(entry.value).toLowerCase();
      const tagMatch = entry.tags?.some(t => taskLower.includes(t.toLowerCase())) ? 0.3 : 0;
      const overlap = taskWords.filter(w => valueLower.includes(w)).length;
      const similarity = taskWords.length > 0 ? (overlap / taskWords.length) + tagMatch : tagMatch;

      if (similarity >= 0.05) {
        scoredLessons.push({
          lesson: entry.value,
          source: 'learned',
          similarity: Math.round(similarity * 100) / 100,
          accessCount: entry.accessCount || 0,
          lastAccessed: entry.lastAccessed || 0,
          key: entry.key,
        });
      }
    }

    // 3. Lesson bank lessons
    for (const lesson of this._lessons) {
      const correctionLower = lesson.correction.toLowerCase();
      const patternLower = lesson.errorPattern.toLowerCase();
      const overlap = taskWords.filter(w => correctionLower.includes(w) || patternLower.includes(w)).length;
      const similarity = taskWords.length > 0 ? overlap / taskWords.length : 0;

      if (similarity >= 0.05) {
        scoredLessons.push({
          lesson: lesson.correction,
          source: 'lesson_bank',
          skill: lesson.skill,
          similarity: Math.round(similarity * 100) / 100,
          confidence: lesson.confidence,
          id: lesson.id,
        });
      }
    }

    // 4. Rank by composite score
    scoredLessons.sort((a, b) => {
      const scoreA = a.source === 'ephemeral'
        ? a.similarity * 0.5 + (1 - Math.min(a.age / 86400000, 1)) * 0.5
        : a.similarity * 0.6 + (a.accessCount ? Math.min(a.accessCount / 10, 1) * 0.4 : 0);
      const scoreB = b.source === 'ephemeral'
        ? b.similarity * 0.5 + (1 - Math.min(b.age / 86400000, 1)) * 0.5
        : b.similarity * 0.6 + (b.accessCount ? Math.min(b.accessCount / 10, 1) * 0.4 : 0);
      return scoreB - scoreA;
    });

    const filtered = scoredLessons.filter(l => l.similarity >= minConfidence);
    return filtered.slice(0, limit).map(({ lesson, source, similarity, skill, confidence }) => ({
      lesson,
      source,
      confidence: Math.round(similarity * 100) / 100,
      ...(skill && { skill }),
      ...(confidence && { lessonConfidence: confidence }),
    }));
  }

  /**
   * Summarize current lesson state.
   */
  getLessonStats() {
    this._ensureBootstrapped();
    return {
      activeLessons: this._lessons.length,
      bootstrapped: this._bootstrapped,
    };
  }

  /**
   * Get evolution stats
   */
  stats() {
    const total = this._stats.total;
    return {
      ...this._stats,
      success_rate: total > 0 ? Math.round((this._stats.successes / total) * 100) / 100 : 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Self-Refine: 迭代反馈精炼模式 (v1.5.5)
  // 灵感来源: Madaan et al. "Self-Refine: Iterative Refinement with Self-Feedback"
  // 模式: 生成 → 反馈 → 精炼 (迭代2-3次)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Self-Refine 迭代精炼
   * @param {string} initialResponse - 初始响应
   * @param {string} query - 用户查询
   * @param {Object} options - 配置选项
   * @returns {Object} - { refined, feedback, iterations }
   */
  selfRefine(initialResponse, query, options = {}) {
    const { maxIterations = 3, threshold = 0.8 } = options;

    const selfRefinePrompts = {
      feedback: (query, response) =>
        `严格评估以下回答对查询"${query}"的质量。\n` +
        `回答内容: ${response}\n` +
        `请提供具体、可操作的反馈。必须指出至少2个需要改进的地方。\n` +
        `格式: [问题1]... [问题2]...`,

      refine: (query, feedback) =>
        `根据以下反馈改进回答。\n` +
        `查询: ${query}\n` +
        `反馈: ${feedback}\n` +
        `直接给出改进后的回答，不要提及反馈过程。`
    };

    let current = initialResponse;
    const iterations = [];

    for (let i = 0; i < maxIterations; i++) {
      // 1. 生成反馈
      const feedback = this._generateFeedback(selfRefinePrompts.feedback(query, current));

      // 2. 检查是否需要精炼
      if (this._isFeedbackPositive(feedback)) {
        iterations.push({ iteration: i + 1, feedback, refined: current, converged: true });
        break;
      }

      // 3. 精炼响应
      const refined = this._refineResponse(selfRefinePrompts.refine(query, feedback));

      iterations.push({ iteration: i + 1, feedback, refined });
      current = refined;
    }

    return {
      original: initialResponse,
      refined: current,
      iterations,
      count: iterations.length
    };
  }

  /**
   * 生成反馈 (模拟LLM调用，实际使用时替换为真实LLM)
   */
  _generateFeedback(feedbackPrompt) {
    // 实际使用时: 调用 LLM 获取反馈
    // 简化实现: 基于规则生成反馈
    const prompt = feedbackPrompt.toLowerCase();

    if (prompt.includes('错误') || prompt.includes('error')) {
      return '反馈: 回答中存在事实错误，需要核实数据来源。';
    }
    if (prompt.includes('不完整') || prompt.includes('incomplete')) {
      return '反馈: 回答不够完整，缺少关键步骤说明。';
    }
    if (prompt.includes('不清楚') || prompt.includes('unclear')) {
      return '反馈: 表达不够清晰，需要简化复杂概念。';
    }
    return '反馈: 可以更简洁，删除冗余信息。';
  }

  /**
   * 精炼响应 (模拟LLM调用)
   */
  _refineResponse(refinePrompt) {
    // 实际使用时: 调用 LLM 获取精炼响应
    // 简化实现: 返回原始提示
    return refinePrompt;
  }

  /**
   * 检查反馈是否正面 (无需进一步精炼)
   */
  _isFeedbackPositive(feedback) {
    const positivePatterns = ['无问题', '很好', '无需改进', '完美', 'good', 'excellent', 'no issues'];
    const lowerFeedback = feedback.toLowerCase();
    return positivePatterns.some(p => lowerFeedback.includes(p));
  }

  // ─── Self-Healer: Q-learning error recovery (v1.0.4) ─────────────────

  /**
   * Heal: detect error pattern and select recovery strategy.
   * Returns: { ok, canRetry, backoffMs, strategy, pattern, hints }
   */
  heal(error) {
    const pattern = this._detectHealPattern(error);
    const strategy = this._selectHealStrategy(pattern);
    const hints = this._getHealHints(strategy, pattern);

    return {
      ok: strategy === 'skip' || strategy === 'abort',
      canRetry: strategy === 'retry' || strategy === 'fallback',
      backoffMs: this._BACKOFF[strategy],
      strategy,
      pattern,
      hints,
    };
  }

  _detectHealPattern(error) {
    const msg = String(error.message || error.msg || '').toLowerCase();
    for (const [pattern, keywords] of Object.entries(this._PATTERNS)) {
      for (const kw of keywords) {
        if (msg.includes(kw.toLowerCase())) {
          return pattern;
        }
      }
    }
    return 'unknown';
  }

  _getHealMap(pattern) {
    let map = this._healQtable.get(pattern);
    if (!map) {
      map = new Map();
      for (const s of this._STRATEGIES) {
        map.set(s, { ...this._DEFAULT_Q });
      }
      this._healQtable.set(pattern, map);
    }
    return map;
  }

  _selectHealStrategy(pattern) {
    const map = this._getHealMap(pattern);

    if (Math.random() < this._EPSILON) {
      const idx = Math.floor(Math.random() * this._STRATEGIES.length);
      return this._STRATEGIES[idx];
    }

    let best = 'retry';
    let bestQ = -Infinity;
    for (const s of this._STRATEGIES) {
      const entry = map.get(s);
      if (entry && entry.qValue > bestQ) {
        bestQ = entry.qValue;
        best = s;
      }
    }
    return best;
  }

  _getHealHints(strategy, pattern) {
    const hints = [];
    switch (strategy) {
      case 'retry':
        hints.push('Re-attempt the failed operation');
        hints.push(`Pattern: ${pattern}`);
        break;
      case 'fallback':
        hints.push('Use alternative approach');
        hints.push('Log current state for debugging');
        break;
      case 'skip':
        hints.push('Skip problematic step');
        hints.push('Continue with remaining steps');
        break;
      case 'abort':
        hints.push('Stop execution');
        hints.push('Report error to monitoring');
        break;
    }
    return hints;
  }

  /**
   * Record outcome of healing attempt — update Q-table.
   */
  recordHealOutcome(strategy, success) {
    const pattern = this._failureWindow[this._failureWindow.length - 1] || 'unknown';
    const map = this._getHealMap(pattern);
    const entry = map.get(strategy);

    if (entry) {
      entry.uses += 1;
      const delta = success ? 10 : -8;
      entry.qValue = entry.qValue + this._ALPHA * delta;
      if (entry.qValue < 0) entry.qValue = 0;
      if (entry.qValue > 100) entry.qValue = 100;
    }

    if (!success) {
      this._failureWindow.push(pattern);
      if (this._failureWindow.length > this._MAX_WINDOW) {
        this._failureWindow.shift();
      }
    }
  }

  getHealStats() {
    const recent = this._failureWindow.slice(-20);
    const patternCounts = {};
    for (const p of recent) {
      patternCounts[p] = (patternCounts[p] || 0) + 1;
    }
    return {
      recentFailures: recent.length,
      patterns: patternCounts,
      qtableSize: this._healQtable.size,
    };
  }
}

module.exports = { HeartFlowEvolution };
