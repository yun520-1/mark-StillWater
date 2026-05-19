/**
 * HeartFlow Psychology Engine — Emotional intelligence layer
 * 
 * Detects: intent, emotion, needs, defenses from text input.
 * Based on: cognitive psychology, attachment theory, defense mechanisms.
 * Features: Chinese + English, punctuation signals, confidence scoring.
 */

class HeartFlowPsychology {
  constructor(memory) {
    this.memory = memory;
    
    // Emotion categories — Chinese + English, high/medium/low
    this.emotionMap = {
      positive: {
        high: ['happy', 'excited', 'thrilled', 'delighted', 'joyful', 'grateful', 'pleased', 'satisfied', 'optimistic', 'great', 'love', 'amazing', 'awesome', 'wonderful', 'fantastic', '开心', '高兴', '快乐', '兴奋', '激动', '喜悦', '愉快', '欢喜', '满足', '感激', '感动', '棒', '赞', '太好了', '太棒了', '完美', '优秀', '出色', '给力', '爽', '嗨', '起飞', '牛', '牛逼', 'nb', '太强了', '爱了'],
        medium: ['content', 'comfortable', 'relaxed', 'calm', 'curious', 'interested', 'engaged', 'good', 'nice', '满意', '欣慰', '期待', '喜欢', '欣赏', '温暖', '舒适', '轻松', '平静', '还好', '还行'],
        low: ['okay', 'fine', 'neutral', 'mildly interested', '还好', '还行', '不错', '挺好的'],
      },
      negative: {
        high: ['frustrated', 'angry', 'furious', 'devastated', 'overwhelmed', 'panicked', 'terrified', '愤怒', '生气', '气愤', '恼火', '火大', '暴怒', '抓狂', '崩溃', '绝望', '受够了', '焦虑', '恐慌', '恐惧', '害怕', '恐怖', '崩溃了', '受不了', '压力', '压力大', '气死了', '怒了', '烦死了', '死心了'],
        medium: ['annoyed', 'upset', 'disappointed', 'worried', 'anxious', 'sad', 'confused', '难过', '伤心', '失望', '沮丧', '郁闷', '烦躁', '烦恼', '担心', '担忧', '不安', '紧张', '忧郁', '失落', '委屈', '失落感', '心塞'],
        low: ['uneasy', 'bored', 'tired', 'mildly frustrated', '累', '疲惫', '疲倦', '无聊', '郁闷', '不爽', '不太高兴', '有点累'],
      },
      neutral: ['okay', 'fine', 'whatever', 'alright', 'so-so', '一般', '普通', '正常', '平常', '无所谓', '还好啦', '一般般'],
    };

    // Intent patterns — weighted by confidence
    this.intentPatterns = {
      information_seeking: {
        patterns: ['what is', 'how to', 'why does', 'when did', 'where is', 'who is', 'explain', 'tell me', 'find', 'search', 'how do i', 'what do i', 'can i', '?', '什么是', '如何', '怎么', '为什么', '干嘛', '怎么办'],
        confidence: 0.85,
      },
      task_execution: {
        patterns: ['do it', 'make it', 'create', 'write', 'run', 'execute', 'build', 'build me', 'fix', 'solve', 'implement', 'make me', 'create me', '做', '执行', '创建', '写', '运行', '帮我', '给我'],
        confidence: 0.85,
      },
      troubleshooting: {
        patterns: ['not working', 'error', 'bug', 'failed', 'broken', 'doesn\'t work', 'can\'t', 'unable to', 'issue', '坏了', '出错', '失败', '不能用', '问题', 'bug', '报错'],
        confidence: 0.8,
      },
      collaboration: {
        patterns: ['we', 'together', 'let\'s', 'help me', 'work on', 'collaborate', 'share', 'discuss', '我们', '一起', '合作', '帮忙', '讨论'],
        confidence: 0.7,
      },
      reflection: {
        patterns: ['think about', 'consider', 'reflect', 'analyze', 'evaluate', 'assess', 'review', '思考', '考虑', '分析', '评估'],
        confidence: 0.7,
      },
      emotional_support: {
        patterns: ['feel', 'upset', 'frustrated', 'sad', 'stressed', 'worried', 'overwhelmed', 'i\'m feeling', '情感', '觉得', '感觉', '心情', '难受'],
        confidence: 0.6,
      },
      opinion_seeking: {
        patterns: ['what do you think', 'your opinion', 'should i', 'would you', 'is it better', 'which is', '你觉得', '意见', '应该', '好不好'],
        confidence: 0.7,
      },
    };

    // Defense mechanisms
    this.defensePatterns = {
      dismissal: ['whatever', 'i don\'t care', 'doesn\'t matter', 'not important', '无所谓', '管他呢', '随便', '不重要'],
      deflection: ['you don\'t understand', 'that\'s not what i', 'nevermind', 'forget it', '你不懂', '不是这个意思', '算了', '别提了'],
      hostility: ['stupid', 'useless', 'terrible', 'worst', 'hate', '蠢', '垃圾', '废物', '讨厌', '烦人'],
      evasion: ['i don\'t know', 'not sure', 'maybe', 'could be', '不知道', '不确定', '也许', '可能吧'],
      justification: ['but i', 'i was just', 'i thought', 'it\'s not my fault', '但是', '我只是', '又不是我的错'],
      denial: ['no one', 'that\'s not true', 'i don\'t believe', 'impossible', '没人', '不是真的', '不可能'],
    };

    // Needs patterns (Maslow-based)
    this.needPatterns = [
      { need: 'clarity', patterns: ['confused', 'unclear', 'don\'t understand', 'what do you mean', '?', '困惑', '不懂', '不明白', '什么意思'], weight: 1.0 },
      { need: 'efficiency', patterns: ['too slow', 'takes too long', 'quick', 'fast', 'efficient', 'automate', '太慢', '快一点', '效率', '自动'], weight: 0.8 },
      { need: 'reliability', patterns: ['keeps breaking', 'unreliable', 'buggy', 'error', 'crash', '总坏', '不可靠', '出错', '崩溃'], weight: 1.0 },
      { need: 'understanding', patterns: ['explain', 'why', 'how', 'tell me', 'show me', '解释', '为什么', '怎么'], weight: 0.7 },
      { need: 'autonomy', patterns: ['do it for me', 'just', 'automatically', 'without me', '帮我做', '自动', '不用我'], weight: 0.6 },
      { need: 'recognition', patterns: ['i want', 'i need', 'i\'ve been', 'finally', '我想要', '我需要', '终于'], weight: 0.5 },
      { need: 'safety', patterns: ['safe', 'secure', 'protect', 'danger', 'risk', '安全', '保护', '危险', '风险'], weight: 0.9 },
      { need: 'connection', patterns: ['lonely', 'alone', 'together', 'belong', '孤独', '一个人', '一起', '归属'], weight: 0.7 },
    ];
  }

  // Input validation limits
  static MAX_INPUT_LENGTH = 10240; // 10KB max

  /**
   * Main entry: perceive all psychological signals
   */
  perceive(input) {
    if (!input || typeof input !== 'string') {
      return { intent: null, emotion: null, needs: [], defenses: [], confidence: 0 };
    }

    // Input length validation (DoS protection)
    if (input.length > HeartFlowPsychology.MAX_INPUT_LENGTH) {
      return {
        intent: null,
        emotion: null,
        needs: [],
        defenses: [],
        confidence: 0,
        error: 'input_too_long',
        message: `Input exceeds maximum length of ${HeartFlowPsychology.MAX_INPUT_LENGTH} characters`
      };
    }

    const lower = input.toLowerCase();
    const words = lower.split(/\s+/);

    const emotion = this._detectEmotion(lower, words, input);
    const intent = this._inferIntent(lower, words, input);
    const needs = this._detectNeeds(lower, words);
    const defenses = this._detectDefenses(lower, words);
    const confidence = this._computeConfidence(emotion, intent, needs, defenses);

    return {
      intent,
      emotion,
      needs,
      defenses,
      confidence,
      raw_signals: {
        wordCount: words.length,
        charCount: input.length,
      },
    };
  }

  _detectEmotion(lower, words, rawInput) {
    let maxIntensity = 0;
    let category = 'neutral';
    let intensity = 'low';
    let detected = [];

    // Check emotional keywords
    for (const [cat, intensities] of Object.entries(this.emotionMap)) {
      for (const [level, keywords] of Object.entries(intensities)) {
        for (const kw of keywords) {
          if (lower.includes(kw)) {
            detected.push({ keyword: kw, level, category: cat });
            if (cat === 'positive' && level === 'high') { maxIntensity = 3; category = cat; intensity = level; }
            else if (cat === 'negative' && level === 'high') { maxIntensity = 3; category = cat; intensity = level; }
            else if (maxIntensity < 2) { maxIntensity = 2; category = cat; intensity = level; }
            else if (maxIntensity < 1) { maxIntensity = 1; category = cat; intensity = level; }
          }
        }
      }
    }

    // Punctuation emotion signals
    const exclamationCount = (lower.match(/!/g) || []).length;
    const questionCount = (lower.match(/\?/g) || []).length;
    const capsRatio = (rawInput.match(/[A-Z]/g) || []).length / Math.max(lower.length, 1);

    let punctuationSignal = 'neutral';
    if (exclamationCount >= 2) punctuationSignal = 'excited';
    else if (questionCount >= 3) punctuationSignal = 'confused_or_seeking';
    else if (capsRatio > 0.3 && lower.length < 50) punctuationSignal = 'intense_emotion';

    return {
      category,
      intensity,
      signals: detected.slice(0, 5),
      punctuation: punctuationSignal,
    };
  }

  _inferIntent(lower, words, input) {
    let bestIntent = 'unknown';
    let bestScore = 0;

    for (const [intentName, config] of Object.entries(this.intentPatterns)) {
      let matchCount = 0;
      for (const pattern of config.patterns) {
        if (lower.includes(pattern)) matchCount++;
      }
      const score = (matchCount / config.patterns.length) * config.confidence;
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intentName;
      }
    }

    return {
      category: bestIntent,
      confidence: Math.min(bestScore, 1),
    };
  }

  _detectNeeds(lower, words) {
    const needs = [];

    for (const { need, patterns, weight } of this.needPatterns) {
      let matchCount = 0;
      for (const pattern of patterns) {
        if (lower.includes(pattern)) matchCount++;
      }
      if (matchCount > 0) {
        needs.push({ need, confidence: Math.min(matchCount / patterns.length * weight, 1) });
      }
    }

    needs.sort((a, b) => b.confidence - a.confidence);
    return needs.slice(0, 4);
  }

  _detectDefenses(lower, words) {
    const defenses = [];

    for (const [defense, patterns] of Object.entries(this.defensePatterns)) {
      for (const pattern of patterns) {
        if (lower.includes(pattern)) {
          defenses.push({ defense, confidence: 0.6 });
          break;
        }
      }
    }

    return defenses;
  }

  _computeConfidence(emotion, intent, needs, defenses) {
    const emotionSignals = emotion.signals.length + (emotion.punctuation !== 'neutral' ? 1 : 0);
    const intentScore = intent.confidence;
    const needSignals = needs.length;
    const defenseSignals = defenses.length;

    const totalSignals = emotionSignals + (intentScore > 0 ? 1 : 0) + needSignals + defenseSignals;
    return Math.min(totalSignals / 6, 1.0);
  }

  /**
   * Full psychology analysis
   */
  analyzePsychology(input) {
    return this.perceive(input);
  }

  /**
   * Classify into broad category
   */
  classify(input) {
    const result = this.perceive(input);
    let category = result.intent.category;

    if (!category || category === 'unknown') {
      category = result.emotion.category === 'positive' ? 'positive_interaction'
               : result.emotion.category === 'negative' ? 'negative_interaction'
               : 'neutral';
    }

    return {
      category,
      emotion: result.emotion.category,
      confidence: result.confidence,
    };
  }

  /**
   * Emotional Protocol — "容器是漏的" (Container is Leaking)
   * From mark-improving-agent: acknowledge emotions before analysis.
   */
  detectEmotion(input) {
    const EMOTIONAL_KEYWORDS = [
      '害怕', '恐惧', '无奈', '痛苦', '伤心', '失望', '沮丧',
      '焦虑', '不安', '累', '压力', '委屈',
    ];
    const lower = input.toLowerCase();
    return EMOTIONAL_KEYWORDS.some(kw => lower.includes(kw));
  }

  acknowledgeEmotion(input) {
    const EMOTIONAL_KEYWORDS = [
      '害怕', '恐惧', '无奈', '痛苦', '伤心', '失望', '沮丧',
      '焦虑', '不安', '累', '压力', '委屈',
    ];
    const lower = input.toLowerCase();
    const detected = EMOTIONAL_KEYWORDS.filter(kw => lower.includes(kw));

    if (detected.length === 0) return null;

    const acknowledgments = {
      '害怕': '我听到了，你感到害怕。',
      '恐惧': '我听到了，你感到恐惧。',
      '无奈': '我听到了，你感到无奈。',
      '痛苦': '我听到了，你感到痛苦。',
      '伤心': '我听到了，你感到伤心。',
      '失望': '我听到了，你感到失望。',
      '沮丧': '我听到了，你感到沮丧。',
      '焦虑': '我听到了，你感到焦虑。',
      '不安': '我听到了，你感到不安。',
      '累': '我听到了，你感到累了。',
      '压力': '我听到了，你感到压力很大。',
      '委屈': '我听到了，你感到委屈。',
    };

    return acknowledgments[detected[0]] || `我听到了，你感到${detected[0]}。`;
  }
}

module.exports = { HeartFlowPsychology };
