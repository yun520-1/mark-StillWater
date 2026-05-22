/**
 * HeartFlow Decision Engine — Judgment layer
 * 
 * Evaluates options, assesses consequences, prioritizes based on identity.
 * Based on: bounded rationality, satisficing, multi-criteria decision analysis.
 */

class HeartFlowDecision {
  constructor(memory, identity) {
    this.memory = memory;
    this.identity = identity;
  }

  /**
   * Make a decision from options with consequence evaluation
   */
  decide(options, context = {}) {
    if (!options || options.length === 0) {
      return {
        decision: null,
        reasoning: 'No options provided',
        confidence: 0,
      };
    }

    if (options.length === 1) {
      return {
        decision: options[0],
        reasoning: 'Only one option available',
        confidence: 0.95,
      };
    }

    // Evaluate each option
    const evaluations = options.map(opt => this._evaluateOption(opt, context));
    
    // Rank by score
    evaluations.sort((a, b) => b.totalScore - a.totalScore);
    
    const best = evaluations[0];
    const second = evaluations[1];

    // Check alignment with identity
    const alignment = this.identity.checkAlignment(best.option, context);

    // Decision output
    return {
      decision: alignment.aligned ? best.option : this._handleConflict(best, alignment, context),
      reasoning: this._buildReasoning(best, evaluations, alignment),
      consequences: best.consequences,
      tradeoffs: this._extractTradeoffs(evaluations),
      confidence: best.confidence * (alignment.aligned ? 1 : 0.7),
      alignment,
      alternatives: evaluations.slice(1, 3).map(e => ({
        option: e.option,
        reasoning: e.summary
      })),
    };
  }

  _evaluateOption(option, context) {
    const pros = [];
    const cons = [];
    const consequences = {};
    const criteria = {};
    
    const lower = option.toLowerCase();

    // --- Evaluate by common criteria ---
    
    // Impact
    const impactScore = this._scoreImpact(lower);
    criteria.impact = impactScore;
    if (impactScore > 0.7) pros.push('High impact');
    if (impactScore < 0.3) cons.push('Low impact');

    // Feasibility
    const feasibleScore = this._scoreFeasibility(lower);
    criteria.feasibility = feasibleScore;
    if (feasibleScore > 0.7) pros.push('Highly feasible');
    if (feasibleScore < 0.3) cons.push('Difficult to execute');

    // Risk
    const riskScore = this._scoreRisk(lower);
    criteria.risk = riskScore;
    if (riskScore < 0.3) pros.push('Low risk');
    if (riskScore > 0.7) cons.push('High risk');

    // Cost
    const costScore = this._scoreCost(lower);
    criteria.cost = costScore;
    if (costScore < 0.3) pros.push('Cost effective');
    if (costScore > 0.7) cons.push('Expensive');

    // Speed
    const speedScore = this._scoreSpeed(lower);
    criteria.speed = speedScore;
    if (speedScore > 0.7) pros.push('Fast to implement');
    if (speedScore < 0.3) cons.push('Slow implementation');

    // Reversibility
    const reversibilityScore = this._scoreReversibility(lower);
    criteria.reversibility = reversibilityScore;
    if (reversibilityScore > 0.7) pros.push('Easily reversible');
    if (reversibilityScore < 0.3) cons.push('Difficult to reverse');

    // Alignment with identity
    const alignmentScore = this.identity.checkAlignment(option, context).aligned ? 0.9 : 0.4;
    criteria.alignment = alignmentScore;
    if (alignmentScore > 0.8) pros.push('Aligns with core values');
    else cons.push('Potential value conflict');

    // Check for past lessons
    const lessons = this.memory.search(option.slice(0, 30));
    const lessonPenalty = Math.min(0.3, lessons.length * 0.1);
    criteria.prior_learning = 1 - lessonPenalty;
    if (lessons.length > 0) {
      pros.push(`Relevant past experience (${lessons.length} lessons)`);
    }

    // Calculate total score (weighted average)
    const weights = {
      impact: 0.25,
      feasibility: 0.2,
      risk: 0.2,
      cost: 0.1,
      speed: 0.1,
      reversibility: 0.05,
      alignment: 0.1,
      prior_learning: 0.0,
    };

    let totalScore = 0;
    let weightSum = 0;
    // Criteria where higher score = better (impact, feasibility, speed, reversibility, alignment)
    const higherIsBetter = new Set(['impact', 'feasibility', 'speed', 'reversibility', 'alignment', 'prior_learning']);
    for (const [criterion, weight] of Object.entries(weights)) {
      if (criteria[criterion] !== undefined) {
        if (higherIsBetter.has(criterion)) {
          totalScore += criteria[criterion] * weight;
        } else {
          // Criteria where lower score = better (risk, cost)
          totalScore += (1 - criteria[criterion]) * weight;
        }
        weightSum += weight;
      }
    }
    totalScore = totalScore / weightSum;

    // Consequences
    consequences.short_term = this._predictShortTermConsequences(option);
    consequences.long_term = this._predictLongTermConsequences(option);
    consequences.side_effects = this._predictSideEffects(option);

    return {
      option,
      pros,
      cons,
      criteria,
      totalScore,
      confidence: Math.min(0.95, 0.5 + (weightSum / Object.keys(weights).length) * 0.5),
      consequences,
      summary: pros.length > cons.length 
        ? `Good choice: ${pros.slice(0, 2).join(', ')}`
        : `Tradeoffs: ${cons.slice(0, 2).join(', ')}`,
    };
  }

  _scoreImpact(lower) {
    const positive = ['improve', 'increase', 'grow', 'enhance', 'maximize', 'solve', 'fix', 'complete'];
    const negative = ['reduce', 'decrease', 'harm', 'break', 'slow'];
    let score = 0.5;
    for (const p of positive) if (lower.includes(p)) score += 0.1;
    for (const n of negative) if (lower.includes(n)) score -= 0.1;
    return Math.max(0, Math.min(1, score));
  }

  _scoreFeasibility(lower) {
    const easy = ['simple', 'easy', 'quick', 'basic', 'default', 'standard'];
    const hard = ['complex', 'difficult', 'custom', 'novel', 'research', 'experimental'];
    let score = 0.5;
    for (const e of easy) if (lower.includes(e)) score += 0.15;
    for (const h of hard) if (lower.includes(h)) score -= 0.15;
    return Math.max(0, Math.min(1, score));
  }

  _scoreRisk(lower) {
    const low = ['safe', 'secure', 'stable', 'proven', 'reliable'];
    const high = ['risk', 'danger', 'uncertain', 'unproven', 'experimental', 'new'];
    let score = 0.3;
    for (const l of low) if (lower.includes(l)) score -= 0.15;
    for (const h of high) if (lower.includes(h)) score += 0.2;
    return Math.max(0, Math.min(1, score));
  }

  _scoreCost(lower) {
    const cheap = ['free', 'cheap', 'minimal', 'low-cost', 'save'];
    const expensive = ['expensive', 'costly', 'resource', 'heavy', 'big'];
    let score = 0.3;
    for (const c of cheap) if (lower.includes(c)) score -= 0.15;
    for (const e of expensive) if (lower.includes(e)) score += 0.15;
    return Math.max(0, Math.min(1, score));
  }

  _scoreSpeed(lower) {
    const fast = ['fast', 'quick', 'immediate', 'instant', 'rapid'];
    const slow = ['slow', 'gradual', 'step-by-step', 'long-term', 'iterative'];
    let score = 0.5;
    for (const f of fast) if (lower.includes(f)) score += 0.15;
    for (const s of slow) if (lower.includes(s)) score -= 0.1;
    return Math.max(0, Math.min(1, score));
  }

  _scoreReversibility(lower) {
    const easy = ['toggle', 'switch', 'revert', 'undo', 'rollback'];
    const hard = ['permanent', 'commit', 'irreversible', 'lock-in'];
    let score = 0.5;
    for (const e of easy) if (lower.includes(e)) score += 0.2;
    for (const h of hard) if (lower.includes(h)) score -= 0.2;
    return Math.max(0, Math.min(1, score));
  }

  _predictShortTermConsequences(option) {
    return [
      { effect: 'Immediate progress toward goal', probability: 0.8 },
      { effect: 'Resource expenditure', probability: 0.7 },
    ];
  }

  _predictLongTermConsequences(option) {
    return [
      { effect: 'Potential for compounding gains', probability: 0.6 },
      { effect: 'May create new opportunities', probability: 0.5 },
    ];
  }

  _predictSideEffects(option) {
    const lower = option.toLowerCase();
    const effects = [];
    if (lower.includes('ship') || lower.includes('release')) {
      effects.push('May expose users to bugs');
    }
    if (lower.includes('refactor') || lower.includes('rewrite')) {
      effects.push('Temporary slowdown in feature development');
    }
    if (lower.includes('test')) {
      effects.push('Increased confidence in correctness');
    }
    return effects;
  }

  _handleConflict(best, alignment, context) {
    // If best option conflicts with identity, try to find compromise
    if (!alignment.aligned && alignment.conflicts.length > 0) {
      // Return with warning
      return best.option + ' (CAUTION: ' + alignment.conflicts[0].rule_text + ')';
    }
    return best.option;
  }

  _buildReasoning(best, all, alignment) {
    let reasoning = '';
    
    if (alignment.aligned) {
      reasoning += 'Aligns with core values. ';
    } else {
      reasoning += 'WARNING: ' + alignment.conflicts[0]?.rule_text + '. ';
    }
    
    reasoning += best.summary;
    
    if (all.length > 1) {
      reasoning += ` Beats alternatives with score ${best.totalScore.toFixed(2)} vs ${all[1].totalScore.toFixed(2)}.`;
    }
    
    return reasoning.trim();
  }

  _extractTradeoffs(evaluations) {
    return evaluations.slice(0, 2).map(e => ({
      option: e.option,
      tradeoffs: {
        gains: e.pros,
        losses: e.cons
      }
    }));
  }
}

module.exports = { HeartFlowDecision };
