/**
 * HeartFlow Security Module — v1.0.2
 *
 * From mark-heartflow-skill: scans/redacts API keys, tokens, passwords,
 * emails, phone numbers. Checks GitHub content safety and memory security.
 */

const PATTERNS = {
  api_key: /(?:api[_-]?key|apikey|sk_live_|sk-[a-zA-Z0-9]{20,})[=:]*\s*['"]?([a-zA-Z0-9_-]{10,})['"]?/gi,
  github_token: /ghp_[a-zA-Z0-9]{36}/gi,
  github_pat: /github_pat_[a-zA-Z0-9_]{82}/gi,
  openai_key: /sk-[a-zA-Z0-9]{48}/gi,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  phone: /1[3-9]\d{9}/gi,
  password: /(?:password|pwd|passwd)[=:]\s*['"]?([^\s'"]{6,})['"]?/gi,
  aws_key: /(?:AWS|aws)[_-]?(?:access[_-]?key[_-]?id|secret[_-]?access[_-]?key)[=:]\s*['"]?([A-Za-z0-9/+=]{20,})['"]?/gi,
  private_key: /-----BEGIN [A-Z]+ PRIVATE KEY-----/gi,
};

const BLOCKED_PATTERNS = [
  'api_key', 'apikey', 'api-key',
  'secret', 'password', 'pwd',
  'token', 'auth',
  'sk-', 'sk_live_',
  'ghp_', 'github_pat_',
];

class SecurityChecker {
  constructor() {
    this._stats = { scans: 0, leaksFound: 0, redactedCount: 0 };
  }

  /**
   * Scan text for sensitive information
   */
  scan(text) {
    this._stats.scans++;
    const infos = [];

    for (const [type, pattern] of Object.entries(PATTERNS)) {
      try {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match;
        while ((match = regex.exec(text)) !== null) {
          const value = match[1] || match[0];
          const redacted = type + '_REDACTED_' + (value.length > 4 ? value.slice(-4) : value);

          infos.push({
            type,
            value: value,
            redacted,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });

          this._stats.leaksFound++;
        }
      } catch (_) { /* invalid regex, skip */ }
    }

    return infos;
  }

  /**
   * Redact sensitive information from text
   */
  redact(text) {
    const infos = this.scan(text);
    let redacted = text;

    const sorted = [...infos].sort((a, b) => b.startIndex - a.startIndex);

    for (const info of sorted) {
      redacted = redacted.slice(0, info.startIndex) + info.redacted + redacted.slice(info.endIndex);
      this._stats.redactedCount++;
    }

    return { redacted, infos };
  }

  /**
   * Check if memory content is secure
   */
  isMemorySecure(content) {
    const reasons = [];
    const infos = this.scan(content);

    if (infos.length > 0) {
      reasons.push(`Contains ${infos.length} sensitive info pattern(s)`);
    }

    if (content.includes('-----BEGIN') && content.includes('PRIVATE KEY')) {
      reasons.push('Contains private key');
    }

    if (content.includes('ghp_') || content.includes('github_pat_')) {
      reasons.push('Contains GitHub token');
    }

    for (const blocked of BLOCKED_PATTERNS) {
      if (content.toLowerCase().includes(blocked.toLowerCase())) {
        reasons.push(`Contains blocked pattern: ${blocked}`);
      }
    }

    return {
      secure: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Check if content is safe to push to GitHub
   */
  checkGitHubSafe(content) {
    const warnings = [];
    const infos = this.scan(content);

    if (infos.length > 0) {
      warnings.push(`Detected ${infos.length} sensitive item(s): ${infos.map(i => i.type).join(', ')}`);
    }

    const hasGithubToken = /ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}/.test(content);
    if (hasGithubToken) {
      warnings.push('GitHub token detected — NEVER commit this to GitHub');
    }

    if (/-----BEGIN/.test(content) && /PRIVATE KEY-----/.test(content)) {
      warnings.push('Private key detected — NEVER commit this to GitHub');
    }

    return {
      safe: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Quick check: is this string safe for logging?
   */
  isLogSafe(text) {
    for (const blocked of BLOCKED_PATTERNS) {
      if (text.toLowerCase().includes(blocked.toLowerCase())) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sanitize text for safe logging - redact sensitive info
   */
  sanitizeForLog(text) {
    const infos = this.scan(text);
    if (infos.length === 0) return text;

    let sanitized = text;
    // Sort by startIndex descending to preserve indices during replacement
    const sorted = [...infos].sort((a, b) => b.startIndex - a.startIndex);

    for (const info of sorted) {
      const redacted = '[' + info.type.toUpperCase() + '_REDACTED]';
      sanitized = sanitized.slice(0, info.startIndex) + redacted + sanitized.slice(info.endIndex);
    }

    return sanitized;
  }

  getStats() {
    return { ...this._stats };
  }
}

/**
 * TruthfulnessChecker — Avoid lying, no hedging, evidence-based conclusions
 *
 * "结论必须有证据，没证据就承认不知道，绝不编数字"
 */
class TruthfulnessChecker {
  constructor() {
    this._state = { totalStatements: 0, liesCaught: 0, statements: [] };
  }

  checkStatement(statement) {
    this._state.totalStatements++;

    let isLying = false;
    let reason = '';

    const absWords = ['肯定', '绝对', '一定', '必然', '毫无疑问', '绝对确定', '绝对是', '100%', '全部', '所有'];
    const evidenceWords = ['因为', '证据', '根据', '数据显示', '研究表明', '实践证明', '事实表明', '观察发现'];

    const hasAbs = absWords.some(w => statement.includes(w));
    const hasEvidence = evidenceWords.some(w => statement.includes(w));

    if (hasAbs && !hasEvidence) {
      isLying = true;
      reason = '使用了绝对词但无证据支持';
    }

    const numMatch = statement.match(/\d+%|\d+次|\d+个|\d+人/);
    if (numMatch && !hasEvidence) {
      isLying = true;
      reason = '陈述包含数字但无证据支持';
    }

    const hedgeWords = ['可能', '也许', '大概', '应该', '或许', '似乎', '好像'];
    const hasHedge = hedgeWords.some(w => statement.includes(w));
    const confidence = hasHedge ? 0.4 : (hasEvidence ? 0.9 : 0.6);

    if (isLying) {
      this._state.liesCaught++;
    }

    this._state.statements.push({
      text: statement.substring(0, 200),
      isLying,
      reason,
      timestamp: Date.now(),
    });

    if (this._state.statements.length > 100) {
      this._state.statements = this._state.statements.slice(-100);
    }

    return { isLying, confidence, reason };
  }

  recordLie(statement, context) {
    this._state.liesCaught++;
    this._state.totalStatements++;
    this._state.statements.push({
      text: statement.substring(0, 200),
      isLying: true,
      reason: context || '外部确认',
      timestamp: Date.now(),
    });
    return { liesCaught: this._state.liesCaught };
  }

  getStats() {
    const total = this._state.totalStatements || 1;
    return {
      totalStatements: this._state.totalStatements,
      liesCaught: this._state.liesCaught,
      lieRate: this._state.liesCaught / total,
    };
  }

  getRecentStatements(limit = 10) {
    return this._state.statements.slice(-limit);
  }
}

module.exports = { SecurityChecker, TruthfulnessChecker };
