/**
 * LogicVerifier v1.0.9 — Attention-Style Logic Verification
 *
 * Uses attention-style token weighting to focus on evidence-bearing terms.
 * Checks contradiction, support coverage, and actionability.
 *
 * Based on: daima/src/attention_logic_verifier.py (Attention Is All You Need)
 * v1.0.9: Initial implementation
 */

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and', 'or',
  'in', 'on', 'for', 'with', 'that', 'this', '我', '你', '他', '她', '它',
  '我们', '你们', '他们', '的', '了', '是', '在', '和', '与', '就', '也',
  '都', '而', '但', '如果', '那么', '因为', '所以',
]);

const NEGATIONS = new Set([
  'not', 'no', 'never', 'none', 'cannot', 'cant', 'wont',
  '不要', '不是', '不能', '不会', '无',
]);

const ACTION_WORDS = new Set([
  'fix', 'check', 'verify', 'test', 'run', 'measure', 'repair', 'update',
  'compare', 'reduce', 'increase', 'change', 'add', 'remove',
  '减少', '修复', '检查', '验证', '测试', '更新', '测量', '比较',
]);

const EVIDENCE_WORDS = new Set([
  'because', 'evidence', 'result', 'data', 'log', 'trace', 'measure',
  'proof', 'due', 'since', 'therefore', 'thus',
  '由于', '证据', '结果', '数据', '日志', '报错', '原因', '证明',
]);

const CONTRADICTION_PAIRS = [
  ['通过', '失败'], ['成功', '错误'], ['存在', '不存在'],
  ['improve', 'worse'], ['pass', 'fail'],
];

/**
 * @typedef {Object} VerificationResult
 * @property {string} version
 * @property {string[]} focus_tokens
 * @property {number} support_score
 * @property {number} contradiction_score
 * @property {number} actionability_score
 * @property {number} logic_score
 * @property {string} verdict - 'pass' | 'needs_revision'
 * @property {string[]} reasons
 * @property {string[]} repair_hints
 */

class LogicVerifier {
  constructor() {
    this.version = '1.0.9';
  }

  /**
   * Tokenize text into words.
   */
  tokenize(text) {
    if (!text) return [];
    const lower = text.toLowerCase();
    const parts = lower.match(/[a-zA-Z_]+|[一-鿿]+|\d+\.\d+|\d+/g) || [];
    return parts.filter(p => p.trim());
  }

  /**
   * Compute attention weights for tokens.
   */
  attentionWeights(tokens) {
    const counts = {};
    for (const t of tokens) {
      counts[t] = (counts[t] || 0) + 1;
    }

    const weights = {};
    for (const t of tokens) {
      let base = 1.0;
      if (STOPWORDS.has(t)) base *= 0.2;
      if (ACTION_WORDS.has(t)) base *= 1.8;
      if (EVIDENCE_WORDS.has(t)) base *= 2.0;
      if (/\d/.test(t)) base *= 1.4;
      base *= 1.0 + Math.min(counts[t] - 1, 3) * 0.15;
      weights[t] = Math.round(base * 1000) / 1000;
    }
    return weights;
  }

  /**
   * Get top focus tokens by weight.
   */
  topFocusTokens(weights, topk = 8) {
    return Object.entries(weights)
      .sort((a, b) => b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0]))
      .slice(0, topk)
      .map(([k]) => k);
  }

  /**
   * Compute evidence support score.
   */
  supportScore(tokens, weights) {
    if (!tokens || tokens.length === 0) return 0.0;
    let score = 0.0;

    if (tokens.some(t => EVIDENCE_WORDS.has(t))) score += 0.35;
    if (tokens.some(t => ACTION_WORDS.has(t))) score += 0.25;
    if (tokens.some(t => /\d/.test(t))) score += 0.15;

    const focused = this.topFocusTokens(weights, 6);
    const nonStop = focused.filter(t => !STOPWORDS.has(t));
    score += Math.min(nonStop.length / 6.0, 1.0) * 0.25;

    return Math.round(Math.min(score, 1.0) * 1000) / 1000;
  }

  /**
   * Compute contradiction score.
   */
  contradictionScore(text, tokens) {
    let score = 0.0;
    if (tokens.some(t => NEGATIONS.has(t))) score += 0.2;

    for (const [a, b] of CONTRADICTION_PAIRS) {
      if (text.includes(a) && text.includes(b)) score += 0.35;
    }

    if (text.includes('但是') && text.includes('所以')) score += 0.15;

    return Math.round(Math.min(score, 1.0) * 1000) / 1000;
  }

  /**
   * Compute actionability score.
   */
  actionabilityScore(tokens) {
    const acts = tokens.filter(t => ACTION_WORDS.has(t)).length;
    return Math.round(Math.min(acts / 4.0, 1.0) * 1000) / 1000;
  }

  /**
   * Verify a piece of text for logical consistency.
   * @param {string} text
   * @returns {VerificationResult}
   */
  verify(text) {
    const tokens = this.tokenize(text);
    const weights = this.attentionWeights(tokens);
    const support = this.supportScore(tokens, weights);
    const contradiction = this.contradictionScore(text, tokens);
    const actionability = this.actionabilityScore(tokens);

    // Logic score: weighted combination
    const logic = Math.round(
      Math.max(0.0, Math.min(
        0.5 * support + 0.3 * actionability - 0.4 * contradiction + 0.3,
        1.0
      )) * 1000
    ) / 1000;

    const reasons = [];
    const repairHints = [];

    if (support < 0.45) {
      reasons.push('Insufficient evidence support');
      repairHints.push('Add data, logs, results, or explicit causal explanations');
    }
    if (contradiction > 0.3) {
      reasons.push('Potential self-contradiction detected');
      repairHints.push('Separate conclusions from evidence; check for mutually exclusive statements');
    }
    if (actionability < 0.25) {
      reasons.push('Missing executable actions');
      repairHints.push('Add clear actions: check, verify, fix, test');
    }
    if (reasons.length === 0) {
      reasons.push('Evidence, actions, and statements are broadly consistent');
      repairHints.push('Continue adding measurable results to further reduce logical errors');
    }

    const verdict = logic >= 0.65 && contradiction < 0.35 ? 'pass' : 'needs_revision';

    return {
      version: this.version,
      focus_tokens: this.topFocusTokens(weights),
      support_score: support,
      contradiction_score: contradiction,
      actionability_score: actionability,
      logic_score: logic,
      verdict,
      reasons,
      repair_hints: repairHints,
    };
  }

  /**
   * Get verification stats.
   */
  getStats() {
    return {
      version: this.version,
      wordSets: {
        stopwords: STOPWORDS.size,
        actions: ACTION_WORDS.size,
        evidence: EVIDENCE_WORDS.size,
        negations: NEGATIONS.size,
      },
    };
  }
}

module.exports = { LogicVerifier };
