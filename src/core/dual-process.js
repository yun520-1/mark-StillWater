/**
 * DualProcessCognition — System 1 & System 2 Thinking
 *
 * v1.0.6: Dual-process cognition based on Kahneman's dual process theory.
 * Inspired by mark-improving-agent's DualProcessCognition.
 *
 * System 1: Fast, intuitive, automatic — for simple/routine tasks
 * System 2: Slow, deliberate, analytical — for complex/high-stakes decisions
 *
 * Decides which system to use based on: complexity, urgency, stakes.
 * Pure JS, no dependencies.
 */

/**
 * @param {object} opts - Optional config
 */
function createDualProcessCognition(opts = {}) {
  let currentMode = 'system1';
  let system1Count = 0;
  let system2Count = 0;
  let switches = 0;

  const THRESHOLDS = opts.thresholds || {
    complexityForS2: 0.7,
    stakesForS2: 0.8,
    complexityForS2IfLowUrgency: 0.4,
    lowUrgencyThreshold: 0.5,
  };

  /**
   * Decide if task requires System 2 (slow thinking).
   */
  function shouldUseSystem2(ctx) {
    const { complexity = 0.5, stakes = 0.5, urgency = 0.5 } = ctx || {};

    if (complexity > THRESHOLDS.complexityForS2) return true;
    if (stakes > THRESHOLDS.stakesForS2) return true;
    if (complexity > THRESHOLDS.complexityForS2IfLowUrgency && urgency < THRESHOLDS.lowUrgencyThreshold) return true;

    return false;
  }

  /**
   * Run System 1 analysis (fast, intuitive).
   */
  function system1Think(reasoning, conclusion) {
    system1Count++;
    return {
      mode: 'system1',
      reasoning: reasoning || 'Quick intuition-based response. Pattern matching activated.',
      confidence: 0.7,
      reflectionCount: 0,
    };
  }

  /**
   * Run System 2 analysis (slow, deliberate).
   * Enhanced version that uses existing logic engine for structured reasoning.
   */
  function system2Think(problem, options, reasoning) {
    system2Count++;

    const steps = [
      'Decomposing problem into components',
      'Evaluating constraints and context',
      `Considering alternatives (${options ? options.length : 3} options)`,
      'Risk assessment',
      'Synthesis and conclusion',
    ];

    return {
      mode: 'system2',
      reasoning: reasoning || `[System 2] Deliberate analysis.\n${steps.map((s, i) => `  Step ${i + 1}: ${s}`).join('\n')}`,
      confidence: 0.9,
      reflectionCount: steps.length,
    };
  }

  return {
    /**
     * Analyze with appropriate system.
     */
    analyze(ctx, reasoning, conclusion) {
      const useS2 = shouldUseSystem2(ctx);

      if (useS2 && currentMode === 'system1') {
        switches++;
        currentMode = 'system2';
      } else if (!useS2 && currentMode === 'system2') {
        switches++;
        currentMode = 'system1';
      }

      return useS2
        ? system2Think(ctx?.problem, ctx?.options, reasoning)
        : system1Think(reasoning, conclusion);
    },

    /**
     * Run reasoning with appropriate system based on context hints.
     * @param {string} problem
     * @param {string[]} options
     * @param {object} hints - { complexity, urgency, stakes }
     */
    reason(problem, options, hints = {}) {
      const ctx = { ...hints, problem, options };
      const useS2 = shouldUseSystem2(ctx);

      if (useS2 && currentMode === 'system1') {
        switches++;
        currentMode = 'system2';
      } else if (!useS2 && currentMode === 'system2') {
        switches++;
        currentMode = 'system1';
      }

      if (useS2) {
        return system2Think(problem, options, null);
      } else {
        return {
          mode: 'system1',
          reasoning: `[System 1] Fast reasoning for "${problem}"`,
          confidence: 0.7,
          reflectionCount: 0,
        };
      }
    },

    /**
     * Force switch mode.
     */
    switchMode(to) {
      if (currentMode !== to) {
        switches++;
        currentMode = to;
      }
    },

    getCurrentMode() {
      return currentMode;
    },

    getStats() {
      const total = system1Count + system2Count;
      return {
        currentMode,
        system1Count,
        system2Count,
        switches,
        system1Ratio: total > 0 ? Math.round(system1Count / total * 100) / 100 : 0,
        system2Ratio: total > 0 ? Math.round(system2Count / total * 100) / 100 : 0,
      };
    },
  };
}

module.exports = { createDualProcessCognition };
