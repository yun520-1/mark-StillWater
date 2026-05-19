/**
 * HeartFlow Dream System — Memory consolidation during "sleep"
 *
 * Like biological sleep, the dream engine:
 *   1. Consolidates frequently-accessed EPHEMERAL → LEARNED
 *   2. Prunes forgotten or irrelevant memories (7+ days unused)
 *   3. Synthesizes insight from recent experiences
 *   4. Detects cross-domain connections (NEW v1.2.8)
 *   5. Identifies contradictions in stored claims (NEW v1.2.8)
 *
 * Based on: memory consolidation theory, sleep cycle research.
 * Upgraded with: HeartFlow connections/contradictions detection
 */

class HeartFlowDream {
  constructor(memory) {
    this.memory = memory;
    this.lastDream = null;
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
   */
  getDreamStats() {
    if (!this.lastDream) {
      return { status: 'no_dreams_yet' };
    }
    return {
      connectionsFound: this.lastDream.connections?.length || 0,
      contradictionsFound: this.lastDream.contradictions?.length || 0,
      duration_ms: this.lastDream.duration_ms,
      dream_complete: this.lastDream.dream_complete
    };
  }
}

module.exports = { HeartFlowDream };
