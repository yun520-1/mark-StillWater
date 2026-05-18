/**
 * Planner v1.1.0 — Memory-Based Action Planning
 *
 * Generates action plans from memories and reflections:
 *   - Collect memory entries
 *   - Generate reflections via ReflectionEngine
 *   - Create plan steps from actionable reflections
 *   - Manage plan execution state
 *
 * Based on: daima/src/memory_planner.py (Reflexion paper 2304.03442)
 * v1.1.0: Initial implementation
 */

const MAX_ACTIVE_PLANS = 10;

/**
 * @typedef {Object} PlanStep
 * @property {string} id
 * @property {string} description
 * @property {number} priority - 1-10
 * @property {boolean} completed
 * @property {string} reason
 * @property {number} created_at
 */

class Planner {
  constructor() {
    /** @type {PlanStep[]} */
    this.plans = [];
    this._counter = 0;
  }

  _nextId() {
    this._counter += 1;
    return `plan_${Date.now()}_${this._counter}`;
  }

  /**
   * Generate plan steps from memories and reflection engine.
   * @param {Array<{content: string, emotion?: string, outcome?: string}>} memories
   * @param {ReflectionEngine} reflectionEngine - HeartFlow reflection engine
   * @returns {PlanStep[]}
   */
  generateFromMemories(memories, reflectionEngine) {
    const plans = [];

    // Get actionable insights from reflection engine
    let actionable = [];
    if (reflectionEngine && typeof reflectionEngine.getActionableInsights === 'function') {
      actionable = reflectionEngine.getActionableInsights();
    }

    for (let i = 0; i < Math.min(actionable.length, 5); i++) {
      const insight = actionable[i];
      const priority = 5 - i;

      plans.push({
        id: this._nextId(),
        description: insight.inference,
        priority,
        completed: false,
        reason: `Source: ${insight.type} (confidence: ${insight.confidence?.toFixed(2) || 0.5})`,
        created_at: Date.now(),
      });
    }

    this.plans.push(...plans);
    this._trimPlans();
    return plans;
  }

  /**
   * Generate plan step from a specific goal.
   * @param {string} goal - Goal keyword
   * @param {Array<{content: string}>} memories - Related memories
   * @returns {PlanStep[]}
   */
  generateFromGoal(goal, memories) {
    const goalMemories = memories.filter(m =>
      (m.content || '').toLowerCase().includes(goal.toLowerCase())
    );

    if (goalMemories.length === 0) {
      return [];
    }

    const plan = {
      id: this._nextId(),
      description: `Action plan for goal '${goal}'`,
      priority: 8,
      completed: false,
      reason: `Generated from ${goalMemories.length} related memories`,
      created_at: Date.now(),
    };

    this.plans.push(plan);
    this._trimPlans();
    return [plan];
  }

  /**
   * Get active (incomplete) plans sorted by priority.
   * @returns {PlanStep[]}
   */
  getActivePlans() {
    const active = this.plans.filter(p => !p.completed);
    active.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.created_at - a.created_at;
    });
    return active.slice(0, MAX_ACTIVE_PLANS);
  }

  /**
   * Get completed plans.
   * @param {number} limit - Max results
   * @returns {PlanStep[]}
   */
  getCompletedPlans(limit = 10) {
    const completed = this.plans.filter(p => p.completed);
    completed.sort((a, b) => b.created_at - a.created_at);
    return completed.slice(0, limit);
  }

  /**
   * Mark a plan as completed.
   * @param {string} planId
   * @returns {boolean}
   */
  complete(planId) {
    const plan = this.plans.find(p => p.id === planId);
    if (plan) {
      plan.completed = true;
      return true;
    }
    return false;
  }

  /**
   * Cancel/delete a plan.
   * @param {string} planId
   * @returns {boolean}
   */
  cancel(planId) {
    const idx = this.plans.findIndex(p => p.id === planId);
    if (idx !== -1) {
      this.plans.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Update plan priority.
   * @param {string} planId
   * @param {number} newPriority - 1-10
   * @returns {boolean}
   */
  updatePriority(planId, newPriority) {
    const plan = this.plans.find(p => p.id === planId);
    if (plan) {
      plan.priority = Math.max(1, Math.min(10, newPriority));
      return true;
    }
    return false;
  }

  /**
   * Get plan summary statistics.
   */
  getSummary() {
    const active = this.plans.filter(p => !p.completed);
    const completed = this.plans.filter(p => p.completed);
    const avgPriority = active.length > 0
      ? active.reduce((sum, p) => sum + p.priority, 0) / active.length
      : 0;

    return {
      total: this.plans.length,
      active: active.length,
      completed: completed.length,
      avg_priority: Math.round(avgPriority * 10) / 10,
    };
  }

  /**
   * Get plan by ID.
   * @param {string} planId
   * @returns {PlanStep|null}
   */
  getPlan(planId) {
    return this.plans.find(p => p.id === planId) || null;
  }

  /**
   * Clear all plans.
   */
  clear() {
    this.plans = [];
  }

  /**
   * Trim plans to max active limit.
   * @private
   */
  _trimPlans() {
    const active = this.getActivePlans();
    if (active.length > MAX_ACTIVE_PLANS) {
      const toRemove = active.slice(MAX_ACTIVE_PLANS);
      for (const p of toRemove) {
        const idx = this.plans.findIndex(pl => pl.id === p.id);
        if (idx !== -1) {
          this.plans.splice(idx, 1);
        }
      }
    }
  }

  /**
   * Get stats for health check.
   */
  getStats() {
    return {
      totalPlans: this.plans.length,
      ...this.getSummary(),
    };
  }
}

module.exports = { Planner };
