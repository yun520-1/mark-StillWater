/**
 * 心理评估量表模块 — 心镜v1.16.2
 *
 * 基于临床心理学标准量表
 *
 * 功能:
 * - 多维心理健康评估
 * - 社会支持评估
 * - 生活质量评估
 * - 压力量表
 *
 * 专业边界声明:
 * - 本模块提供标准化心理评估的参考分数
 * - 不能替代专业心理健康评估或医学诊断
 * - 评估结果仅供参考，不构成任何治疗建议
 * - 所有量表结果应结合临床专业判断
 * - 严重情况建议转介专业心理咨询师或精神科医生
 */

class PsychologicalScales {
  constructor() {
    // PSS压力量表（Perceived Stress Scale）
    this.pssQuestions = [
      '在过去一个月里，你多久会因为一些出乎意料的事情而感到压力？',
      '在过去一个月里，你多久会觉得无法控制生活中重要的事情？',
      '在过去一个月里，你多久会感到紧张和压力？',
      '在过去一个月里，你多久会觉得自己处理问题的方式很顺手？',
      '在过去一个月里，你多久会觉得自己实际上能够控制生活中可能出现的困难？',
      '在过去一个月里，你多久会发现自己在想着必须完成的事情？',
      '在过去一个月里，你多久会觉得自己的困难能够克服？',
      '在过去一个月里，你多久会觉得事情都按自己的意愿发展？',
      '过去一个月里，你多久会因为一些自己无法控制的事情而感到烦恼？',
      '过去一个月里，你多久会觉得困难堆积如山，自己无法克服？',
    ];
    this.pssOptions = [
      '从不', '几乎从不', '有时', '经常', '非常频繁'
    ];

    // 社会支持评定量表（SSRS）
    this.ssrsDimensions = {
     主观支持: [
        '你有多少关系密切的朋友？',
        '这些朋友与你住得近吗？',
        '当你遇到困难时，你能获得多少情感支持？',
      ],
     客观支持: [
        '过去一个月里你获得过以下哪种支持？（可多选）',
        '你结婚了吗？你与配偶关系好吗？',
        '你和邻居关系好吗？',
      ],
     支持利用度: [
        '当你遇到困难时，你多常向家人倾诉？',
        '当你遇到困难时，你多常向朋友倾诉？',
        '当你遇到困难时，你多常寻求组织帮助？',
      ],
    };

    // WHOQOL生活质量量表维度
    this.whoqolDimensions = [
      '生理健康', '心理状态', '社会关系', '环境健康'
    ];

    // 情绪调节策略
    this.emotionRegulationStrategies = [
      { strategy: '认知重评', description: '用不同角度看待情境，改变其意义', healthy: true },
      { strategy: '表达抑制', description: '抑制情绪表达', healthy: false },
      { strategy: '正念', description: '觉察并接受当下情绪，不评判', healthy: true },
      { strategy: '压抑', description: '主动压抑负面情绪', healthy: false },
      { strategy: '逃避', description: '回避引发情绪的情境', healthy: false },
      { strategy: '沉思', description: '反复思考负面情绪', healthy: false },
      { strategy: '问题聚焦', description: '直接解决问题', healthy: true },
      { strategy: '寻求支持', description: '向他人寻求情感或实际支持', healthy: true },
    ];
  }

  /**
   * 评估情绪调节策略使用情况
   * @param {Array} userResponses - 用户对各策略的使用频率
   * @returns {object} 评估结果
   */
  assessEmotionRegulation(userResponses) {
    if (!Array.isArray(userResponses) || userResponses.length < 4) {
      return {
        valid: false,
        message: '需要至少4个策略的使用频率评分（1-5分）',
      };
    }

    const results = [];
    let healthyTotal = 0;
    let unhealthyTotal = 0;
    let healthyCount = 0;
    let unhealthyCount = 0;

    for (let i = 0; i < Math.min(userResponses.length, this.emotionRegulationStrategies.length); i++) {
      const strategy = this.emotionRegulationStrategies[i];
      const score = Math.max(1, Math.min(5, userResponses[i]));

      results.push({
        strategy: strategy.strategy,
        description: strategy.description,
        score,
        frequency: this._scoreToFrequency(score),
        healthy: strategy.healthy,
      });

      if (strategy.healthy) {
        healthyTotal += score;
        healthyCount++;
      } else {
        unhealthyTotal += score;
        unhealthyCount++;
      }
    }

    const healthyAvg = healthyCount > 0 ? healthyTotal / healthyCount : 0;
    const unhealthyAvg = unhealthyCount > 0 ? unhealthyTotal / unhealthyCount : 0;

    return {
      valid: true,
      strategies: results,
      healthyScore: Math.round(healthyAvg * 10) / 10,
      unhealthyScore: Math.round(unhealthyAvg * 10) / 10,
      ratio: healthyCount > 0 && unhealthyCount > 0
        ? Math.round((healthyAvg / unhealthyAvg) * 100) / 100
        : null,
      assessment: this._assessRegulation(healthyAvg, unhealthyAvg),
      suggestions: this._generateRegulationSuggestions(healthyAvg, unhealthyAvg),
    };
  }

  /**
   * 评估PSS压力量表
   * @param {number[]} responses - 用户对10个问题的评分(0-4)
   * @returns {object} 评估结果
   */
  assessPSS10(responses) {
    if (!Array.isArray(responses) || responses.length !== 10) {
      return {
        valid: false,
        message: '需要10个问题的完整评分',
      };
    }

    // PSS-10计分：问题4、5、7、8为正向计分，其余为反向
    const positiveScoreQuestions = [3, 4, 6, 7]; // 0-4计分
    let totalScore = 0;

    for (let i = 0; i < 10; i++) {
      let score = Math.max(0, Math.min(4, responses[i]));
      if (positiveScoreQuestions.includes(i)) {
        // 正向计分：0=4, 1=3, 2=2, 3=1, 4=0
        score = 4 - score;
      }
      totalScore += score;
    }

    return {
      valid: true,
      totalScore,
      maxScore: 40,
      percentile: Math.round((totalScore / 40) * 100),
      severity: this._getPSSSeverity(totalScore),
      interpretation: this._getPSSInterpretation(totalScore),
    };
  }

  /**
   * 评估社会支持
   * @param {object} ssrsScores - { 主观支持, 客观支持, 支持利用度 }
   * @returns {object} 评估结果
   */
  assessSocialSupport(ssrsScores) {
    const { 主观支持 = 0, 客观支持 = 0, 支持利用度 = 0 } = ssrsScores;

    const total = 主观支持 + 客观支持 + 支持利用度;
    const maxTotal = 40; // 假设满分40

    let level;
    if (total >= 30) level = '高';
    else if (total >= 20) level = '中';
    else level = '低';

    return {
      valid: true,
      scores: {
        主观支持,
        客观支持,
        支持利用度,
      },
      total,
      maxTotal,
      level,
      suggestions: this._getSupportSuggestions(level),
    };
  }

  /**
   * 评估生活质量（简化版WHOQOL）
   * @param {object} domainScores - { 生理健康, 心理状态, 社会关系, 环境健康 } 每项1-5分
   * @returns {object} 评估结果
   */
  assessQualityOfLife(domainScores) {
    const domains = ['生理健康', '心理状态', '社会关系', '环境健康'];
    const scores = [];
    let total = 0;

    for (const domain of domains) {
      const score = Math.max(1, Math.min(5, domainScores[domain] || 3));
      scores.push({ domain, score });
      total += score;
    }

    const avgScore = total / domains.length;
    const transformedScore = ((avgScore - 1) / 4) * 100; // 转换为0-100

    return {
      valid: true,
      domains: scores,
      averageScore: Math.round(avgScore * 10) / 10,
      qualityOfLifePercent: Math.round(transformedScore),
      level: transformedScore >= 70 ? '良好' : transformedScore >= 50 ? '中等' : '需改善',
      suggestions: this._getQualityOfLifeSuggestions(domainScores),
    };
  }

  /**
   * 综合心理健康评估
   * @param {object} assessments - 多个评估结果
   * @returns {object} 综合评估
   */
  comprehensiveAssessment(assessments) {
    const {
      stress,
      emotionRegulation,
      socialSupport,
      qualityOfLife,
    } = assessments;

    const factors = [];

    // 压力
    if (stress?.valid) {
      factors.push({
        factor: '压力水平',
        score: stress.totalScore,
        maxScore: 40,
        level: stress.severity,
        concern: stress.severity === 'high',
      });
    }

    // 情绪调节
    if (emotionRegulation?.valid) {
      const healthyBetter = emotionRegulation.healthyScore >= emotionRegulation.unhealthyScore;
      factors.push({
        factor: '情绪调节',
        healthyScore: emotionRegulation.healthyScore,
        unhealthyScore: emotionRegulation.unhealthyScore,
        level: healthyBetter ? '健康' : '需改善',
        concern: !healthyBetter,
      });
    }

    // 社会支持
    if (socialSupport?.valid) {
      factors.push({
        factor: '社会支持',
        score: socialSupport.total,
        maxScore: socialSupport.maxTotal,
        level: socialSupport.level,
        concern: socialSupport.level === '低',
      });
    }

    // 生活质量
    if (qualityOfLife?.valid) {
      factors.push({
        factor: '生活质量',
        score: qualityOfLife.qualityOfLifePercent,
        maxScore: 100,
        level: qualityOfLife.level,
        concern: qualityOfLife.level === '需改善',
      });
    }

    // 综合判断
    const concerns = factors.filter(f => f.concern).length;
    let overallLevel;
    if (concerns === 0) overallLevel = '心理健康';
    else if (concerns === 1) overallLevel = '轻度困扰';
    else if (concerns === 2) overallLevel = '中度困扰';
    else overallLevel = '需要关注';

    return {
      factors,
      overallLevel,
      concernCount: concerns,
      recommendations: this._getComprehensiveSuggestions(factors),
    };
  }

  // 辅助方法
  _scoreToFrequency(score) {
    const mapping = ['', '从不', '很少', '有时', '经常', '总是'];
    return mapping[Math.max(1, Math.min(5, score))] || '未知';
  }

  _assessRegulation(healthy, unhealthy) {
    if (healthy >= 4 && unhealthy <= 2) {
      return '情绪调节能力良好，使用健康的调节策略较多';
    } else if (healthy >= 3 && unhealthy <= 3) {
      return '情绪调节能力一般，建议增加健康策略使用';
    } else if (healthy < 3 && unhealthy > 3) {
      return '情绪调节存在困难，建议学习更健康的调节方式';
    }
    return '情绪调节需要改善';
  }

  _generateRegulationSuggestions(healthy, unhealthy) {
    const suggestions = [];
    if (unhealthy > healthy) {
      suggestions.push('建议减少使用压抑、逃避等不健康策略');
      suggestions.push('可以尝试认知重评，从不同角度看待问题');
      suggestions.push('正念冥想有助于情绪调节');
    }
    if (healthy < 3) {
      suggestions.push('建议增加寻求支持、问题聚焦等健康策略');
      suggestions.push('与信任的人倾诉是有效的调节方式');
    }
    return suggestions;
  }

  _getPSSSeverity(score) {
    if (score >= 20) return 'high';
    if (score >= 13) return 'medium';
    return 'low';
  }

  _getPSSInterpretation(score) {
    if (score >= 20) {
      return '压力水平较高，建议关注压力管理，必要时寻求专业帮助';
    } else if (score >= 13) {
      return '压力水平中等，适当关注放松和压力缓解';
    }
    return '压力水平正常，保持现有生活方式';
  }

  _getSupportSuggestions(level) {
    if (level === '高') return ['继续维护好社会关系'];
    if (level === '中') return ['建议主动扩大社交圈，增加支持来源'];
    return ['社会支持较弱，建议主动建立联系', '考虑加入社群或兴趣小组'];
  }

  _getQualityOfLifeSuggestions(domainScores) {
    const suggestions = [];
    const lowDomains = Object.entries(domainScores)
      .filter(([, score]) => score < 3)
      .map(([domain]) => domain);

    if (lowDomains.length > 0) {
      suggestions.push(`${lowDomains.join('、')}方面需要改善`);
    }
    if (domainScores.心理状态 < 3) {
      suggestions.push('建议关注心理健康，必要时寻求心理咨询');
    }
    if (domainScores.社会关系 < 3) {
      suggestions.push('加强人际交往，增加社会支持');
    }
    return suggestions;
  }

  _getComprehensiveSuggestions(factors) {
    const suggestions = [];
    for (const factor of factors) {
      if (factor.concern) {
        if (factor.factor === '压力水平') {
          suggestions.push('建议进行压力管理训练');
        } else if (factor.factor === '情绪调节') {
          suggestions.push('建议学习情绪调节技巧');
        } else if (factor.factor === '社会支持') {
          suggestions.push('建议扩展社交支持网络');
        } else if (factor.factor === '生活质量') {
          suggestions.push('建议全面提升生活质量');
        }
      }
    }
    if (suggestions.length === 0) {
      suggestions.push('继续保持现有的生活方式');
    }
    return suggestions;
  }
}

module.exports = { PsychologicalScales };
