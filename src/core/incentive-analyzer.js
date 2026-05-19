/**
 * IncentiveAnalyzer v1.2.7 — Stakeholder Incentive Analysis
 *
 * Analyzes decisions by understanding stakeholder incentives:
 *   - Identify who benefits from a decision
 *   - Track stated vs actual incentives
 *   - Detect when self-interest drives stated goals
 *   - Weight decisions by incentive alignment
 *
 * Based on: 牛津科普读本(第一辑) - 农业补贴章节
 * Key insight: "政策往往服务于特殊利益而非stated goals"
 *             "自我利益可以推动看似利他的结果" (Gustavus Swift案例)
 *
 * Complements MetaJudgment (L1/L2/L3) with stakeholder analysis.
 * v1.2.7: Initial implementation
 */

/**
 * @typedef {Object} Stakeholder
 * @property {string} id
 * @property {string} name
 * @property {string[]} incentives - What drives this actor
 * @property {string[]} statedGoals - What they claim to want
 * @property {number} power - Influence level 0-1
 * @property {string[]} beneficiaries - Who benefits from their actions
 */

/**
 * @typedef {Object} IncentiveAnalysis
 * @property {string} decision
 * @property {Stakeholder[]} stakeholders
 * @property {string} actualWinner - Who actually benefits most
 * @property {string[]} incentiveMisalignments
 * @property {number} incentiveAlignmentScore - 0-1 how well aligned
 * @property {string[]} warningFlags
 */

class IncentiveAnalyzer {
  constructor() {
    this._stakeholders = new Map();
    this._history = [];
    this._counter = 0;
  }

  /**
   * Add a stakeholder to track.
   * @param {string} name
   * @param {string[]} incentives
   * @param {string[]} statedGoals
   * @param {number} power
   * @returns {string} stakeholder id
   */
  addStakeholder(name, incentives = [], statedGoals = [], power = 0.5) {
    const id = `actor_${Date.now()}_${++this._counter}`;
    this._stakeholders.set(id, {
      id,
      name,
      incentives,
      statedGoals,
      power,
      beneficiaries: [],
      createdAt: Date.now(),
    });
    return id;
  }

  /**
   * Get a stakeholder by id.
   * @param {string} id
   * @returns {Stakeholder|null}
   */
  getStakeholder(id) {
    return this._stakeholders.get(id) || null;
  }

  /**
   * Update stakeholder incentives.
   * @param {string} id
   * @param {Object} updates
   */
  updateStakeholder(id, updates) {
    const actor = this._stakeholders.get(id);
    if (!actor) return null;

    if (updates.incentives) {
      actor.incentives = [...new Set([...actor.incentives, ...updates.incentives])];
    }
    if (updates.statedGoals) {
      actor.statedGoals = [...new Set([...actor.statedGoals, ...updates.statedGoals])];
    }
    if (updates.power !== undefined) {
      actor.power = Math.max(0, Math.min(1, updates.power));
    }
    if (updates.beneficiaries) {
      actor.beneficiaries = updates.beneficiaries;
    }

    return actor;
  }

  /**
   * Analyze a decision for incentive alignment.
   * @param {string} decision
   * @param {string[]} stakeholderIds
   * @returns {IncentiveAnalysis}
   */
  analyze(decision, stakeholderIds = []) {
    const stakeholders = stakeholderIds
      .map(id => this._stakeholders.get(id))
      .filter(Boolean);

    // Find who benefits most (highest power + most aligned incentives)
    let actualWinner = null;
    let maxBenefit = 0;

    for (const actor of stakeholders) {
      const incentiveCount = actor.incentives.length;
      const powerScore = actor.power;
      const benefit = incentiveCount * 0.3 + powerScore * 0.7;

      if (benefit > maxBenefit) {
        maxBenefit = benefit;
        actualWinner = actor.name;
      }
    }

    // Detect misalignments
    const misalignments = [];
    const warnings = [];

    for (const actor of stakeholders) {
      // Check if stated goals differ from incentives
      if (actor.statedGoals.length > 0 && actor.incentives.length > 0) {
        const overlap = actor.statedGoals.filter(g =>
          actor.incentives.some(i => i.toLowerCase().includes(g.toLowerCase()))
        );
        if (overlap.length === 0 && actor.statedGoals.length > 0) {
          misalignments.push(`${actor.name}: stated goals don't match incentives`);
        }
      }

      // High power + self-serving incentives = warning
      if (actor.power > 0.8 && actor.incentives.some(i =>
        ['profit', 'gain', 'benefit', '利益', '好处', '赚钱'].some(k => i.includes(k))
      )) {
        warnings.push(`${actor.name} has high influence and self-serving incentives`);
      }
    }

    // Calculate alignment score
    const alignmentScore = stakeholders.length > 0
      ? 1 - (misalignments.length / (stakeholders.length * 2))
      : 0.5;

    const analysis = {
      decision: decision.substring(0, 100),
      stakeholders: stakeholders.map(s => ({
        name: s.name,
        incentives: s.incentives,
        statedGoals: s.statedGoals,
        power: s.power,
      })),
      actualWinner: actualWinner || 'unknown',
      incentiveMisalignments: misalignments,
      incentiveAlignmentScore: Math.max(0, Math.min(1, Math.round(alignmentScore * 100) / 100)),
      warningFlags: warnings,
      timestamp: Date.now(),
    };

    this._history.push(analysis);
    return analysis;
  }

  /**
   * Quick check if a statement shows incentive alignment.
   * @param {string} statement
   * @returns {{hasIncentiveSignal: boolean, type: string}}
   */
  detectIncentiveSignal(statement) {
    const signals = {
      'subsidy': ['补贴', 'subvention', 'grant'],
      'profit': ['利润', 'profit', '利益', '赚钱', 'gain'],
      'political': ['选举', '投票', '政治', 'political', 'campaign'],
      'lobby': ['游说', 'lobby', 'influence'],
      'selfInterest': ['自己人', '自己利益', 'self-interest', '私利'],
    };

    const lower = statement.toLowerCase();

    for (const [type, keywords] of Object.entries(signals)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return { hasIncentiveSignal: true, type };
      }
    }

    return { hasIncentiveSignal: false, type: 'none' };
  }

  /**
   * Apply Gustavus Swift principle:
   * "Self-interest can drive seemingly altruistic outcomes"
   * @param {string} action
   * @param {string} claimedPurpose
   * @returns {{aligned: boolean, reasoning: string}}
   */
  checkGustavusSwiftPrinciple(action, claimedPurpose) {
    // If someone profits from an action, their stated "good" purpose may mask self-interest
    const actor = [...this._stakeholders.values()].find(a =>
      action.toLowerCase().includes(a.name.toLowerCase())
    );

    if (!actor) {
      return { aligned: true, reasoning: 'No tracked stakeholder found' };
    }

    const profitsFromAction = actor.incentives.some(i =>
      ['profit', 'gain', '利益', '赚钱', 'benefit', '好处'].some(k => i.includes(k))
    );

    const claimsAltruism = claimedPurpose &&
      (claimedPurpose.includes('环境') || claimedPurpose.includes('health') ||
       claimedPurpose.includes('安全') || claimedPurpose.includes('safe'));

    if (profitsFromAction && claimsAltruism) {
      return {
        aligned: false,
        reasoning: `${actor.name} profits from "${action}" while claiming: "${claimedPurpose}"`,
      };
    }

    return { aligned: true, reasoning: 'Incentives aligned with stated purpose' };
  }

  /**
   * Get analysis history.
   * @param {number} count
   * @returns {IncentiveAnalysis[]}
   */
  getHistory(count = 10) {
    return this._history.slice(-count);
  }

  /**
   * Get stakeholder summary.
   * @returns {Object}
   */
  getStats() {
    const stakeholders = [...this._stakeholders.values()];
    return {
      totalStakeholders: stakeholders.length,
      highPowerCount: stakeholders.filter(s => s.power > 0.7).length,
      misalignedCount: stakeholders.filter(s =>
        s.statedGoals.length > 0 &&
        s.incentives.length > 0 &&
        !s.statedGoals.some(g => s.incentives.some(i => i.toLowerCase().includes(g.toLowerCase())))
      ).length,
      analysesCount: this._history.length,
    };
  }

  /**
   * Clear all data.
   */
  clear() {
    this._stakeholders.clear();
    this._history = [];
  }
}

/**
 * Quick incentive check for a statement.
 * @param {string} statement
 * @returns {string}
 */
function detectHiddenIncentive(statement) {
  const signals = [
    { pattern: /补贴|补贴金|subvention|grant/, type: 'subsidy-driven' },
    { pattern: /利润|赚钱|profit|gain|利益/, type: 'profit-motivated' },
    { pattern: /选举|投票|political|campaign/, type: 'political动机' },
    { pattern: /游说|lobby|influence/, type: 'lobbying-driven' },
    { pattern: /大型企业|跨国公司|corporate|monopoly/, type: 'corporate-interest' },
  ];

  for (const { pattern, type } of signals) {
    if (pattern.test(statement)) {
      return `检测到${type}信号: 可能有隐藏动机`;
    }
  }

  return null;
}

module.exports = { IncentiveAnalyzer, detectHiddenIncentive };
