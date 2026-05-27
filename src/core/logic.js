/**
 * HeartFlow Logic Engine — Reasoning layer
 * 
 * Provides: problem analysis, option evaluation, logical chains, synthesis.
 * Based on: deduction, induction, abduction, causal reasoning.
 */

class HeartFlowLogic {
  static MAX_INPUT_LENGTH = 10240; // 10KB max

  constructor(memory) {
    this.memory = memory;
  }

  /**
   * Reason through a problem with optional options
   */
  reason(problem, options = null) {
    // Input length validation (DoS protection)
    if (!problem || typeof problem !== 'string' || problem.length > HeartFlowLogic.MAX_INPUT_LENGTH) {
      return {
        chain: [],
        conclusion: 'error',
        confidence: 0,
        error: 'input_too_long',
        message: problem && problem.length > HeartFlowLogic.MAX_INPUT_LENGTH
          ? `Input exceeds maximum length of ${HeartFlowLogic.MAX_INPUT_LENGTH} characters`
          : 'Invalid problem input'
      };
    }

    if (options && options.length > 100) {
      options = options.slice(0, 100); // Limit options array
    }

    const chain = [];
    
    // Step 1: Parse problem
    chain.push({ step: 'problem_parsing', content: this._parseProblem(problem) });
    
    // Step 2: Identify constraints
    chain.push({ step: 'constraint_identification', content: this._identifyConstraints(problem) });
    
    // Step 3: Analyze causal factors
    chain.push({ step: 'causal_analysis', content: this._analyzeCausality(problem) });
    
    // Step 4: Generate or evaluate options
    let synthesis;
    if (options && options.length > 0) {
      chain.push({ step: 'option_evaluation', content: this._evaluateOptions(options, problem) });
      synthesis = this._synthesize(options, problem);
    } else {
      chain.push({ step: 'hypothesis_generation', content: this._generateHypotheses(problem) });
      synthesis = this._synthesize(null, problem);
    }
    
    chain.push({ step: 'synthesis', content: synthesis });

    return {
      chain,
      conclusion: synthesis.conclusion,
      confidence: synthesis.confidence,
      analysis: {
        problem_type: this._classifyProblem(problem),
        reasoning_type: options ? 'evaluative' : 'generative',
      }
    };
  }

  _parseProblem(problem) {
    const lower = problem.toLowerCase();
    
    // Detect problem type
    let type = 'unknown';
    if (lower.includes('why') || lower.includes('cause')) type = 'causal';
    else if (lower.includes('how') || lower.includes('solve')) type = 'procedural';
    else if (lower.includes('what if') || lower.includes('would')) type = 'hypothetical';
    else if (lower.includes('compare') || lower.includes('difference')) type = 'comparative';
    else if (lower.includes('predict') || lower.includes('will')) type = 'predictive';
    
    return {
      raw: problem,
      type,
      key_elements: this._extractKeyElements(problem),
      constraints: this._extractConstraints(problem),
    };
  }

  _extractKeyElements(problem) {
    // Simple extraction: nouns and verb phrases
    const words = problem.split(/\s+/);
    const elements = words.filter(w => w.length > 3).slice(0, 10);
    return elements;
  }

  _extractConstraints(problem) {
    const constraints = [];
    const lower = problem.toLowerCase();
    
    const constraintPatterns = [
      { pattern: 'must', type: 'requirement' },
      { pattern: 'cannot', type: 'prohibition' },
      { pattern: 'only', type: 'limitation' },
      { pattern: 'should', type: 'preference' },
      { pattern: 'without', type: 'absence' },
      { pattern: 'despite', type: 'obstacle' },
    ];

    for (const { pattern, type } of constraintPatterns) {
      if (lower.includes(pattern)) {
        constraints.push({ text: pattern, type });
      }
    }
    return constraints;
  }

  _identifyConstraints(problem) {
    return {
      explicit: this._extractConstraints(problem),
      implicit: this._inferImplicitConstraints(problem),
      total: this._extractConstraints(problem).length + 2, // rough estimate
    };
  }

  _inferImplicitConstraints(problem) {
    // Infer common implicit constraints
    const implicit = [];
    const lower = problem.toLowerCase();
    
    if (lower.includes('cost') || lower.includes('cheap') || lower.includes('budget')) {
      implicit.push({ type: 'cost', description: 'Cost-effectiveness likely required' });
    }
    if (lower.includes('fast') || lower.includes('quick') || lower.includes('speed')) {
      implicit.push({ type: 'time', description: 'Time efficiency likely important' });
    }
    if (lower.includes('safe') || lower.includes('risk')) {
      implicit.push({ type: 'safety', description: 'Risk mitigation likely required' });
    }
    
    return implicit;
  }

  _analyzeCausality(problem) {
    const lower = problem.toLowerCase();
    const causes = [];
    const effects = [];

    // Simple causal pattern matching
    const becausePatterns = lower.split(' because ');
    if (becausePatterns.length > 1) {
      causes.push(becausePatterns[1].trim());
    }

    const thereforePatterns = lower.split(' therefore ');
    if (thereforePatterns.length > 1) {
      effects.push(thereforePatterns[1].trim());
    }

    const causeWords = ['cause', 'leads to', 'results in', 'makes', 'creates'];
    for (const cw of causeWords) {
      if (lower.includes(cw)) {
        const idx = lower.indexOf(cw);
        const slice = problem.slice(Math.max(0, idx - 30), idx + cw.length + 30);
        causes.push(slice.trim());
      }
    }

    return {
      identified_causes: causes.slice(0, 3),
      identified_effects: effects.slice(0, 3),
      causal_chain: causes.length > 0 ? 'partial' : 'unknown',
    };
  }

  _evaluateOptions(options, problem) {
    return options.map((opt, i) => {
      const lower = opt.toLowerCase();
      const pros = [];
      const cons = [];

      // Heuristic evaluation based on content analysis
      if (lower.includes('fast') || lower.includes('quick') || lower.includes('speed')) {
        pros.push('Time efficiency');
      }
      if (lower.includes('cheap') || lower.includes('cost') || lower.includes('save')) {
        pros.push('Cost effective');
      }
      if (lower.includes('safe') || lower.includes('protect') || lower.includes('prevent')) {
        pros.push('Risk mitigation');
      }
      if (lower.includes('simple') || lower.includes('easy')) {
        pros.push('Low complexity');
      }
      if (lower.includes('complex') || lower.includes('difficult')) {
        cons.push('High complexity');
      }
      if (lower.includes('risk') || lower.includes('danger')) {
        cons.push('Potential risks');
      }

      // Calculate confidence based on evaluation completeness
      // More pros/cons identified = higher confidence in the evaluation
      const totalSignals = pros.length + cons.length;
      const baseConfidence = 0.6;
      const signalBonus = Math.min(totalSignals * 0.05, 0.25); // Max 0.25 bonus
      const confidence = Math.min(baseConfidence + signalBonus, 0.95);

      return {
        option: opt,
        index: i,
        pros,
        cons,
        score: pros.length - cons.length,
        confidence,
      };
    });
  }

  _generateHypotheses(problem) {
    // Generate possible explanations/solutions
    const lower = problem.toLowerCase();
    const hypotheses = [];

    if (lower.includes('why')) {
      hypotheses.push({
        type: 'causal_explanation',
        text: 'This might be due to a combination of factors',
        confidence: 0.6
      });
    }

    if (lower.includes('how')) {
      hypotheses.push({
        type: 'procedural',
        text: 'One possible approach involves stepwise implementation',
        confidence: 0.7
      });
    }

    // Check memory for relevant past lessons
    const lessons = this.memory.search(problem.slice(0, 50));
    for (const lesson of lessons.slice(0, 2)) {
      hypotheses.push({
        type: 'learned',
        text: 'Past experience suggests: ' + String(lesson.value).slice(0, 100),
        confidence: 0.75
      });
    }

    return hypotheses;
  }

  _synthesize(options, problem) {
    if (options && options.length > 0) {
      // Find best option
      const evaluated = this._evaluateOptions(options, problem);
      const best = evaluated.reduce((a, b) => a.score > b.score ? a : b);
      
      return {
        conclusion: best.option,
        confidence: best.confidence,
        reasoning: `Option "${best.option}" scores highest (${best.score}) with pros: ${best.pros.join(', ')}`,
        alternatives: evaluated.filter(o => o !== best).map(o => o.option),
      };
    } else {
      // Generate conclusion from hypotheses
      return {
        conclusion: 'Further analysis needed, but the most likely path involves addressing root causes first',
        confidence: 0.55,
        reasoning: 'Based on available evidence and causal patterns',
      };
    }
  }

  _classifyProblem(problem) {
    const lower = problem.toLowerCase();

    // 英文问题类型检测
    if (lower.includes('why')) return 'diagnostic';
    if (lower.includes('how to') || lower.includes('solve')) return 'procedural';
    if (lower.includes('what if') || lower.includes('would')) return 'hypothetical';
    if (lower.includes('which') || lower.includes('best')) return 'evaluative';

    // 中文问题类型检测
    if (lower.includes('为什么') || lower.includes('为何') || lower.includes('原因')) return 'diagnostic';
    if (lower.includes('如何') || lower.includes('怎么办') || lower.includes('怎么') && !lower.includes('怎么样') || lower.includes('解决方法') || lower.includes('解决')) return 'procedural';
    if (lower.includes('如果') || lower.includes('假如') || lower.includes('要是') || lower.includes('会不会') || lower.includes('会怎样')) return 'hypothetical';
    if (lower.includes('哪个') || lower.includes('哪个好') || lower.includes('最好') || lower.includes('选择') || lower.includes('应该')) return 'evaluative';

    return 'general';
  }
}

module.exports = { HeartFlowLogic };
