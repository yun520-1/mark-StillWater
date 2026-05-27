/**
 * 东方心理学模块 — 心镜文化整合
 *
 * 整合东方哲学（儒家、道家、阳明心学）的心理分析框架
 *
 * 包含：
 * - 王阳明"知行合一"评估
 * - 心学"心即理"检测
 * - "境界"层次模型
 * - 中国家庭关系模式
 * - 集体主义vs个人主义框架
 */

class EasternPsychology {
  constructor(memory = null) {
    this.memory = memory;

    // 境界层次模型
    this.jingjieLevels = [
      { level: 1, name: '功利境界', description: '做事为求利己，只顾眼前得失', score: 0.2 },
      { level: 2, name: '道德境界', description: '行事遵循道德规范，注重名声', score: 0.4 },
      { level: 3, name: '天地境界', description: '与道合一，超脱自我，服务苍生', score: 0.8 },
    ];

    // 家庭关系模式关键词
    this.familyPatterns = {
      '孝道': ['孝顺', '孝敬', '父母', '长辈', '传统'],
      '期待': ['应该', '必须', '要求', '期望', '指望'],
      '愧疚': ['对不起', '愧疚', '不安', '自责', '对不起'],
      '牺牲': ['为了', '牺牲', '放弃', '委屈', '成全'],
      '控制': ['管', '听话', '不许', '不要', '应该要'],
    };

    // 集体主义vs个人主义信号
    this.collectivismSignals = ['我们', '大家', '集体', '家庭', '家族', '传统', '应该', '礼'];
    this.individualismSignals = ['我', '我的', '想要', '我觉得', '个人', '自由', '选择'];

    // 阳明心学关键词
    this.yangmingSignals = {
      '致良知': ['良知', '善', '天理', '本性', '良心'],
      '知行合一': ['知行', '行动', '实践', '做', '行'],
      '心外无事': ['心', '意念', '想', '念头', '心态'],
    };
  }

  /**
   * 评估"知行合一"程度
   * @param {string} text - 用户输入
   * @returns {Object} 知行合一评估结果
   */
  assessZhiXingHeYi(text) {
    const lower = text.toLowerCase();

    // 检测"知"的信号（认知、知道、理解）
    const zhiSignals = ['知道', '理解', '明白', '懂', '了解', '认为', '理解到'];
    const zhiCount = zhiSignals.filter(s => lower.includes(s)).length;

    // 检测"行"的信号（行动、实践、执行）
    const xingSignals = ['做', '行动', '实践', '执行', '去', '开始', '已经', '完成'];
    const xingCount = xingSignals.filter(s => lower.includes(s)).length;

    // 检测知行脱节的信号
    const gapSignals = ['但是', '却', '还是', '一直没', '想但不', '知道但'];
    const hasGap = gapSignals.some(s => lower.includes(s));

    // 计算知行分数
    let zhiScore = Math.min(zhiCount / 3, 1) * 50;
    let xingScore = Math.min(xingCount / 3, 1) * 50;
    let gapPenalty = hasGap ? -20 : 0;

    let totalScore = Math.max(0, Math.min(100, zhiScore + xingScore + gapPenalty));

    let assessment;
    if (totalScore >= 80) {
      assessment = '知行高度合一';
    } else if (totalScore >= 60) {
      assessment = '知行基本合一';
    } else if (totalScore >= 40) {
      assessment = '知行有差距';
    } else {
      assessment = '知行严重脱节';
    }

    return {
      score: Math.round(totalScore),
      zhiScore: Math.round(zhiScore),
      xingScore: Math.round(xingScore),
      hasGap,
      assessment,
      advice: hasGap
        ? '阳明先生说"知是行的开始，行是知的完成"，知而不行只是未知'
        : '继续保持知行合一的实践',
    };
  }

  /**
   * 检测"心即理"状态
   * 评估内心是否被私欲遮蔽，还是能依循天理
   */
  detectXinJiLi(text) {
    const lower = text.toLowerCase();

    // 检测"心"相关的表达
    const xinSignals = ['心', '心里', '内心', '心意', '心态', '心情'];
    const xinCount = xinSignals.filter(s => lower.includes(s)).length;

    // 检测私欲遮蔽的信号
    const siyuSignals = ['想要', '贪', '欲望', '私心', '名利', '计较', '放不下'];
    const siyuCount = siyuSignals.filter(s => lower.includes(s)).length;

    // 检测天理/良知的信号
    const tianliSignals = ['善', '对', '应该', '正道', '良心', '良知', '天理'];
    const tianliCount = tianliSignals.filter(s => lower.includes(s)).length;

    // 计算状态
    let state;
    if (siyuCount > tianliCount && siyuCount > xinCount) {
      state = '私欲遮蔽';
    } else if (tianliCount > 0) {
      state = '天理显现';
    } else {
      state = '心有波澜';
    }

    return {
      state,
      xinCount,
      siyuCount,
      tianliCount,
      interpretation: this._interpretXinJiLi(state, xinCount, siyuCount, tianliCount),
    };
  }

  _interpretXinJiLi(state, xin, siyu, tianli) {
    if (state === '私欲遮蔽') {
      return '心被私欲遮蔽，需要"格物致知"来清除遮蔽，恢复良知本体';
    } else if (state === '天理显现') {
      return '心与天理合一，良知为主宰，当下的选择符合天道';
    } else {
      return '心有所动，需要静心体察，问问自己的良知';
    }
  }

  /**
   * 评估境界层次
   * 基于冯友兰的境界说
   */
  assessJingjie(text) {
    const lower = text.toLowerCase();

    // 功利境界信号
    const gongliSignals = ['得到', '获得', '好处', '利益', '成功', '赢', '好处'];
    const gongliCount = gongliSignals.filter(s => lower.includes(s)).length;

    // 道德境界信号
    const daodeSignals = ['应该', '道德', '责任', '义务', '帮人', '善', '义'];
    const daodeCount = daodeSignals.filter(s => lower.includes(s)).length;

    // 天地境界信号
    const tiandiSignals = ['自然', '道', '天下', '苍生', '万物', '宇宙', '天道'];
    const tiandiCount = tiandiSignals.filter(s => lower.includes(s)).length;

    let currentLevel;
    if (tiandiCount > 0) {
      currentLevel = this.jingjieLevels[2];
    } else if (daodeCount > 0) {
      currentLevel = this.jingjieLevels[1];
    } else if (gongliCount > 0) {
      currentLevel = this.jingjieLevels[0];
    } else {
      // 默认根据文本长度和表达复杂度推断
      currentLevel = this.jingjieLevels[0];
    }

    return {
      level: currentLevel.level,
      name: currentLevel.name,
      description: currentLevel.description,
      confidence: this._calculateJingjieConfidence(gongliCount, daodeCount, tiandiCount),
    };
  }

  _calculateJingjieConfidence(g, d, t) {
    const max = Math.max(g, d, t);
    if (max === 0) return 0.3;
    if (max >= 3) return 0.9;
    if (max >= 2) return 0.7;
    return 0.5;
  }

  /**
   * 分析中国家庭关系模式
   */
  analyzeFamilyPattern(text) {
    const lower = text.toLowerCase();
    const detected = [];

    for (const [pattern, keywords] of Object.entries(this.familyPatterns)) {
      const count = keywords.filter(k => lower.includes(k)).length;
      if (count > 0) {
        detected.push({
          pattern,
          count,
          confidence: Math.min(count / 2, 1),
        });
      }
    }

    // 排序并返回最可能的模式
    detected.sort((a, b) => b.confidence - a.confidence);

    return {
      primaryPattern: detected[0]?.pattern || '未检测到特定模式',
      patterns: detected.slice(0, 3),
      interpretation: this._interpretFamilyPatterns(detected),
    };
  }

  _interpretFamilyPatterns(patterns) {
    if (patterns.length === 0) {
      return '未检测到明显的家庭关系模式影响';
    }

    const names = patterns.map(p => p.pattern).join('、');
    const advice = {
      '孝道': '传统孝道文化影响下，可能存在对长辈期待的顺从',
      '期待': '检测到对他人或自己的高期待，可能带来压力',
      '愧疚': '可能存在愧疚感，这常是家庭关系中的情感负担',
      '牺牲': '可能存在过度牺牲的模式，需要注意自我关怀',
      '控制': '可能处于被控制或想要控制的动态中',
    };

    const patternAdvice = patterns.map(p => advice[p.pattern] || '').filter(Boolean);
    return patternAdvice.join('；') || '家庭关系模式复杂，需具体分析';
  }

  /**
   * 评估集体主义vs个人主义倾向
   */
  assessCulturalOrientation(text) {
    const lower = text.toLowerCase();

    const collectCount = this.collectivismSignals.filter(s => lower.includes(s)).length;
    const individCount = this.individualismSignals.filter(s => lower.includes(s)).length;

    let orientation;
    let score;

    if (collectCount > individCount * 1.5) {
      orientation = '集体主义';
      score = Math.min(collectCount / 5, 1) * 100;
    } else if (individCount > collectCount * 1.5) {
      orientation = '个人主义';
      score = Math.min(individCount / 5, 1) * 100;
    } else {
      orientation = '混合倾向';
      score = 50;
    }

    return {
      orientation,
      score: Math.round(score),
      collectivismSignals: collectCount,
      individualismSignals: individCount,
      interpretation: this._interpretCulturalOrientation(orientation, score),
    };
  }

  _interpretCulturalOrientation(orientation, score) {
    if (orientation === '集体主义') {
      return `集体主义倾向较强(${score}分)，重视家庭、群体和谐，可能压抑个人需求`;
    } else if (orientation === '个人主义') {
      return `个人主义倾向较强(${score}分)，重视自我实现、个人选择，可能忽视群体关系`;
    } else {
      return '文化取向平衡，能在个人需求和群体关系中找到灵活位置';
    }
  }

  /**
   * 综合东方心理学分析
   */
  analyzeEastern(text) {
    return {
      zhiXingHeYi: this.assessZhiXingHeYi(text),
      xinJiLi: this.detectXinJiLi(text),
      jingjie: this.assessJingjie(text),
      familyPattern: this.analyzeFamilyPattern(text),
      culturalOrientation: this.assessCulturalOrientation(text),
    };
  }
}

module.exports = { EasternPsychology };
