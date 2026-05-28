/**
 * HeartFlow Psychology Engine — Emotional intelligence layer
 * 
 * Detects: intent, emotion, needs, defenses from text input.
 * Based on: cognitive psychology, attachment theory, defense mechanisms.
 * Features: Chinese + English, punctuation signals, confidence scoring.
 */

class HeartFlowPsychology {
  constructor(memory, promptOptimizer = null, selfCritique = null) {
    this.memory = memory;
    this.promptOptimizer = promptOptimizer;
    this.selfCritique = selfCritique;
    
    // Emotion categories — Chinese + English, high/medium/low
    this.emotionMap = {
      positive: {
        high: ['happy', 'excited', 'thrilled', 'delighted', 'joyful', 'grateful', 'pleased', 'satisfied', 'optimistic', 'great', 'love', 'amazing', 'awesome', 'wonderful', 'fantastic', '开心', '高兴', '快乐', '兴奋', '激动', '喜悦', '愉快', '欢喜', '满足', '感激', '感动', '棒', '赞', '太好了', '太棒了', '完美', '优秀', '出色', '给力', '爽', '嗨', '起飞', '牛', '牛逼', 'nb', '太强了', '爱了'],
        medium: ['content', 'comfortable', 'relaxed', 'calm', 'curious', 'interested', 'engaged', 'good', 'nice', '满意', '欣慰', '期待', '喜欢', '欣赏', '温暖', '舒适', '轻松', '平静', '还好', '还行'],
        low: ['okay', 'fine', 'neutral', 'mildly interested', '还好', '还行', '不错', '挺好的'],
      },
      negative: {
        high: ['frustrated', 'angry', 'furious', 'devastated', 'overwhelmed', 'panicked', 'terrified', '愤怒', '生气', '气愤', '恼火', '火大', '暴怒', '抓狂', '崩溃', '绝望', '受够了', '焦虑', '恐慌', '恐惧', '害怕', '恐怖', '崩溃了', '受不了', '压力', '压力大', '气死了', '怒了', '烦死了', '死心了', '活着没意思', '活着真没意思', '活着没意义', '不想活了', '真没意思', '没意思', '没意义', '活着好累', '太痛苦了', '好累', '活不下去', '活着好苦', '总失败', '总是失败', '总是输', '一直失败'],
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

    // Needs patterns (Maslow-based) — 扩展版，覆盖心理支持场景
    this.needPatterns = [
      // 认知需求
      { need: 'clarity', patterns: ['confused', 'unclear', 'don\'t understand', 'what do you mean', '?', '困惑', '不懂', '不明白', '什么意思', '搞不懂', '不清楚', '怎么回事'], weight: 1.0 },
      // 效率需求
      { need: 'efficiency', patterns: ['too slow', 'takes too long', 'quick', 'fast', 'efficient', 'automate', '太慢', '快一点', '效率', '自动', '省时间', '快点'], weight: 0.8 },
      // 可靠性需求
      { need: 'reliability', patterns: ['keeps breaking', 'unreliable', 'buggy', 'error', 'crash', '总坏', '不可靠', '出错', '崩溃', '坏了', '不能用'], weight: 1.0 },
      // 理解需求
      { need: 'understanding', patterns: ['explain', 'why', 'how', 'tell me', 'show me', '解释', '为什么', '怎么', '理解', '想不通'], weight: 0.7 },
      // 自主需求
      { need: 'autonomy', patterns: ['do it for me', 'just', 'automatically', 'without me', '帮我做', '自动', '不用我', '不想管'], weight: 0.6 },
      // 认可需求
      { need: 'recognition', patterns: ['i want', 'i need', 'i\'ve been', 'finally', '我想要', '我需要', '终于', '渴望', '希望被'], weight: 0.5 },
      // 安全需求
      { need: 'safety', patterns: ['safe', 'secure', 'protect', 'danger', 'risk', '安全', '保护', '危险', '风险', '害怕', '担心'], weight: 0.9 },
      // 联结需求
      { need: 'connection', patterns: ['lonely', 'alone', 'together', 'belong', '孤独', '一个人', '一起', '归属', '没人', '没人理解', '不被理解'], weight: 0.7 },
      // 情感支持需求（新增）
      { need: 'emotional_support', patterns: ['很累', '压力大', '焦虑', '难受', '难过', '委屈', '沮丧', '绝望', '压抑', '喘不过气', '撑不住', '心累', 'burnout', 'exhausted', 'overwhelmed'], weight: 1.0 },
      // 价值感需求（新增）
      { need: 'self_worth', patterns: ['没用', '失败', '废物', '丢脸', '没用', '不行', 'loser', 'worthless', '一事无成'], weight: 0.9 },
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
    // 中文：直接匹配（无词边界概念）
    // 英文：使用词边界避免误匹配
    for (const [cat, intensities] of Object.entries(this.emotionMap)) {
      for (const [level, keywords] of Object.entries(intensities)) {
        for (const kw of keywords) {
          let matched = false;

          // 判断是否是中文关键词
          const isChinese = /[一-龥]/.test(kw);

          if (isChinese) {
            // 中文关键词：直接包含匹配
            if (lower.includes(kw)) {
              matched = true;
            }
          } else {
            // 英文关键词：使用词边界匹配
            const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKw}\\b`, 'i');
            matched = regex.test(lower);
          }

          if (matched) {
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

    // Step 2: self-negative patterns (standalone, doesn't need Step 1)
    // 直接检查自我否定关键词存在，存在即认为有负面情绪
    const selfNeg = ['失败', '无用', '废物', '丢脸', '很差', 'loser', 'worthless'];
    let selfNegScore = 0;
    for (const w of selfNeg) { if (lower.includes(w)) selfNegScore++; }
    if (selfNegScore > 0) {
      bestIntent = 'emotional_support';
      bestScore = Math.max(bestScore, 0.75);
    }

    // Step 3: emotional complaint patterns -> emotional_support
    const complaints = ['委屈', '被骂', '骂我', '骂了', '伤心', '失落', '被冤枉', '被误解', '不被理解', '没人理解', '老板骂', '他说我', '朋友说我'];
    let hasComplaint = false;
    for (const w of complaints) { if (lower.includes(w)) { hasComplaint = true; break; } }
    if (hasComplaint) {
      bestIntent = 'emotional_support';
      bestScore = Math.max(bestScore, 0.7);
    }

// Step 4: high-intensity negative emotion keyword (from emotionMap) → emotional_support
    // 覆盖"不想活了" / "活着没意思" / "崩溃了"等高强度负面词
    const highIntensityNeg = [
      '不想活了', '活着没意思', '活着真没意思', '活着没意义',
      '崩溃', '崩溃了', '绝望', '受够了', '活不下去',
      '活着好累', '太痛苦了', '活着好苦', '好累', '死心了',
    ];
    let hasHighNeg = false;
    for (const w of highIntensityNeg) { if (lower.includes(w)) { hasHighNeg = true; break; } }
    if (hasHighNeg) {
      bestIntent = 'emotional_support';
      bestScore = Math.max(bestScore, 0.8);
    }

    // Step 5: first-person + emotion word + burden → emotional_support
    const hasFirst = /我|I|me/.test(input);
    const emotionWords = ['我很', '我', '感觉', '觉得', '感到', '内心', '心情', 'I feel', 'I am'];
    const burdenWords = ['压力大', '焦虑', '累', '疲惫', '心累', '压抑', 'burnout', 'exhausted', 'overwhelmed'];
    let hasEm = false;
    for (const w of emotionWords) { if (lower.includes(w)) { hasEm = true; break; } }
    let hasBurden = false;
    for (const w of burdenWords) { if (lower.includes(w)) { hasBurden = true; break; } }
    if (hasFirst && hasEm && hasBurden) {
      bestIntent = 'emotional_support';
      bestScore = Math.max(bestScore, 0.65);
    }

    // Step 5: standard pattern match (only if no emotion override)
    if (bestScore < 0.3) {
      for (const [name, cfg] of Object.entries(this.intentPatterns)) {
        let cnt = 0;
        for (const pat of cfg.patterns) { if (lower.includes(pat)) cnt++; }
        const sc = (cnt / cfg.patterns.length) * cfg.confidence;
        if (sc > bestScore) { bestScore = sc; bestIntent = name; }
      }
    }

    return { category: bestIntent, confidence: Math.min(bestScore, 1) };
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
   * 意图推理链 — 多步推导而非简单关键词匹配
   * 1. 检测表面意图（task/emotion/need/defense）
   * 2. 检测深层动机（回避/追求/确认）
   * 3. 生成置信度+推理链摘要
   */
  _inferIntentWithChain(lower, words, input) {
    // 第一步：基础意图识别
    const basicIntent = this._inferIntent(lower, words, input);

    // 第二步：深层动机检测
    const motivations = [];

    // 回避动机：用户想逃避什么
    const avoidancePatterns = ['不要', '不用', '不用了', '算了', '算了算了', '别', '不要了', '不想'];
    const hasAvoidance = avoidancePatterns.some(p => lower.includes(p));
    if (hasAvoidance) {
      motivations.push({ type: 'avoidance', label: '回避', confidence: 0.7 });
    }

    // 追求动机：用户想要什么
    const pursuitPatterns = ['想要', '希望', '需要', '能帮我', '可以帮我', '给我', '想让你'];
    const hasPursuit = pursuitPatterns.some(p => lower.includes(p));
    if (hasPursuit) {
      motivations.push({ type: 'pursuit', label: '追求', confidence: 0.7 });
    }

    // 确认动机：用户想确认什么
    const confirmationPatterns = ['对吗', '对不对', '是不是', '真的吗', '确定吗', '对吧'];
    const hasConfirmation = confirmationPatterns.some(p => lower.includes(p));
    if (hasConfirmation) {
      motivations.push({ type: 'confirmation', label: '确认', confidence: 0.6 });
    }

    // 第三步：生成推理链
    const chain = [];

    // 添加意图推断步骤
    chain.push({
      step: 1,
      type: 'intent_detection',
      finding: `检测到${basicIntent.category}意图`,
      confidence: basicIntent.confidence,
    });

    // 添加动机推断步骤
    if (motivations.length > 0) {
      motivations.forEach((mot, idx) => {
        chain.push({
          step: idx + 2,
          type: 'motivation_inference',
          finding: `推断${mot.label}动机`,
          confidence: mot.confidence,
        });
      });
    }

    // 综合置信度
    const totalMotivationConfidence = motivations.length > 0
      ? motivations.reduce((sum, m) => sum + m.confidence, 0) / motivations.length
      : 0;
    const finalConfidence = (basicIntent.confidence * 0.7) + (totalMotivationConfidence * 0.3);

    return {
      category: basicIntent.category,
      confidence: Math.min(finalConfidence, 1),
      chain,
      motivations,
      surface_intent: basicIntent,
    };
  }

  /**
   * 用户纠正API — 允许用户纠正AI的分析
   * @param {string} input - 用户原始输入
   * @param {Object} wrongAnalysis - AI的错误分析
   * @param {string} correction - 用户的纠正
   */
  correctAnalysis(input, wrongAnalysis, correction) {
    // 解析用户纠正
    const correctionLower = correction.toLowerCase();

    // 检测纠正的是什么：情绪/意图/需求/防御
    const correctionType = this._detectCorrectionType(input, wrongAnalysis, correctionLower);
    const correctionValue = this._extractCorrectionValue(correctionLower);

    // 生成输入的hash作为缓存key
    const inputHash = this._hashInput(input);

    // 记录纠正到记忆（使用LEARNED层）
    if (this.memory) {
      const correctionRecord = {
        input: input.substring(0, 200),
        inputHash,
        wrongAnalysis: wrongAnalysis,
        correction: correction,
        correctionType,
        correctionValue,
        timestamp: Date.now(),
      };

      // 存储纠正到learned层
      if (this.memory._learnedStore) {
        this.memory._learnedStore[`correction:${Date.now()}`] = JSON.stringify(correctionRecord);
        // 存储纠正缓存：同一input的后续分析将使用纠正后的值
        this.memory._learnedStore[`correction_cache:${inputHash}`] = JSON.stringify({ correctionType, correctionValue, timestamp: Date.now() });
      }
    }

    return {
      corrected: true,
      correctionType,
      correctionValue,
      message: `已记录纠正：您认为${correctionType}应该是"${correctionValue}"而非"${this._getWrongValue(wrongAnalysis, correctionType)}"`,
    };
  }

  /**
   * 获取输入的hash
   */
  _hashInput(input) {
    // 简单的hash：取前50字符的hash
    const str = input.substring(0, 50).toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'input_' + Math.abs(hash).toString(16);
  }

  /**
   * 检查是否有针对此输入的用户纠正
   */
  _getCorrectionCache(input) {
    if (!this.memory) return null;

    // 确保 learned store 已加载
    if (this.memory._ensureLearnedLoaded) {
      this.memory._ensureLearnedLoaded();
    }

    const inputHash = this._hashInput(input);
    // 尝试从_learnedStore获取
    const store = this.memory._learnedStore;
    if (!store) return null;
    const cached = store[`correction_cache:${inputHash}`];
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * 增加分析计数（用于准确率统计）
   */
  _incrementAnalysisCount() {
    if (!this.memory) return;

    // 确保 learned store 已加载
    if (this.memory._ensureLearnedLoaded) {
      this.memory._ensureLearnedLoaded();
    }

    const store = this.memory._learnedStore;
    if (!store) return;

    // 读取当前计数
    const currentEntry = store['analysis_count'];
    const currentCount = currentEntry ? (currentEntry.value || 0) : 0;

    // 更新计数
    store['analysis_count'] = { value: currentCount + 1, updatedAt: Date.now() };
    this.memory._markLearnedDirty?.();
    this.memory._saveLearned?.();
  }

  /**
   * 应用用户纠正到分析结果
   */
  _applyEmotionCorrection(result, correctionValue) {
    // 将纠正后的情绪值应用到结果中
    const emotionMap = {
      '累': { category: 'negative', intensity: 'medium' },
      '困': { category: 'negative', intensity: 'medium' },
      '开心': { category: 'positive', intensity: 'high' },
      '高兴': { category: 'positive', intensity: 'high' },
      '生气': { category: 'negative', intensity: 'high' },
      '难过': { category: 'negative', intensity: 'high' },
      '焦虑': { category: 'negative', intensity: 'high' },
      '担心': { category: 'negative', intensity: 'medium' },
      '平静': { category: 'neutral', intensity: 'low' },
      '兴奋': { category: 'positive', intensity: 'high' },
      // 支持英文情绪类别（直接映射）
      'negative': { category: 'negative', intensity: 'medium' },
      'positive': { category: 'positive', intensity: 'medium' },
      'neutral': { category: 'neutral', intensity: 'low' },
    };

    const correctedEmotion = emotionMap[correctionValue] || { category: 'neutral', intensity: 'low' };

    return {
      ...result,
      emotion: {
        ...result.emotion,
        category: correctedEmotion.category,
        intensity: correctedEmotion.intensity,
        corrected: true,
        originalKeyword: correctionValue,
      },
    };
  }

  _detectCorrectionType(input, wrongAnalysis, correctionLower) {
    // 检测纠正类型
    if (correctionLower.includes('不是') || correctionLower.includes('没')) {
      // 可能是情绪纠正
      if (wrongAnalysis.emotion) {
        return 'emotion';
      }
    }
    if ((correctionLower.includes('是') && correctionLower.includes('想')) || correctionLower.includes('应该')) {
      return 'intent';
    }
    return 'emotion'; // 默认
  }

  _extractCorrectionValue(correctionLower) {
    // 首先处理"不是X是Y"格式
    // 匹配模式：不是...是Y，或 不是X是Y（直接是Y）
    const notXisYPattern = /不是.+?是([^，,。！!？?\s]+)/;
    const notXisYMatch = correctionLower.match(notXisYPattern);
    if (notXisYMatch && notXisYMatch[1]) {
      const extractedValue = notXisYMatch[1].trim();
      // 清理可能的标点符号
      const cleanedValue = extractedValue.replace(/[，。！？、]/g, '').trim();
      if (cleanedValue.length > 0) {
        return cleanedValue;
      }
    }

    // 支持英文情绪类别关键词
    const englishCategories = ['negative', 'positive', 'neutral', 'angry', 'sad', 'happy', 'tired', 'anxious', 'fear', 'disgust', 'surprise'];
    for (const cat of englishCategories) {
      // 匹配 "是negative" 或 "应该是negative" 等模式
      if (correctionLower.includes('是' + cat) || correctionLower.includes('应该是' + cat) || correctionLower.endsWith(cat)) {
        return cat;
      }
    }

    // 提取纠正后的值（支持中英文情绪关键词）
    const emotionKeywords = ['累', '困', '开心', '生气', '难过', '焦虑', '平静', '兴奋', '担心', '沮丧', '绝望', '恐惧', '害怕', '感动', '温暖', '轻松', '无聊', '疲惫'];
    for (const kw of emotionKeywords) {
      if (correctionLower.includes(kw)) {
        return kw;
      }
    }

    return 'unknown';
  }

  _getWrongValue(analysis, type) {
    if (type === 'emotion' && analysis.emotion) {
      return analysis.emotion.category;
    }
    if (type === 'intent' && analysis.intent) {
      return analysis.intent.category;
    }
    return 'unknown';
  }

  /**
   * 分析准确率统计
   * 对比：AI分析 vs 用户纠正记录
   *
   * 注意：此方法只统计有纠正记录的分析。
   * 准确率 = 1 - (纠正次数 / 总分析次数)
   * 其中总分析次数 = 纠正次数 + 未纠正次数（通过记录所有分析来计算）
   */
  getPsychologyAccuracy() {
    let totalAnalyses = 0;
    let corrections = 0;

    // 从记忆获取所有纠正记录
    if (this.memory) {
      // 获取纠正记录数量
      const learnedRecords = this.memory.listLearned();
      const correctionRecords = learnedRecords.filter(r => r.key.startsWith('correction:'));
      corrections = correctionRecords.length;

      // 获取分析记录数量（记录在 analysis_count 中）
      const analysisCountEntry = learnedRecords.find(r => r.key === 'analysis_count');
      totalAnalyses = analysisCountEntry ? (analysisCountEntry.value || 0) : corrections;
    }

    // 计算准确率：没有纠正的占比
    // 如果没有分析记录，使用纠正记录作为基数（保守估计）
    if (totalAnalyses === 0) totalAnalyses = corrections;
    const accuracy = totalAnalyses > 0 ? (totalAnalyses - corrections) / totalAnalyses : 1.0;

    return {
      accuracy: Math.round(accuracy * 100) / 100, // 保留两位小数
      total: totalAnalyses,
      corrections,
      message: totalAnalyses > 0
        ? `总分析${totalAnalyses}次，用户纠正${corrections}次，准确率${(accuracy * 100).toFixed(1)}%`
        : '暂无分析数据',
    };
  }

  /**
   * PHQ-9 抑郁评估
   * @param {number[]} responses - 9个问题的得分(0-3)
   * @returns {Object} { score, severity, recommendations }
   */
  assessPHQ9(responses) {
    if (!Array.isArray(responses) || responses.length !== 9) {
      return { error: 'PHQ-9需要9个问题的回答' };
    }

    const score = responses.reduce((sum, r) => sum + Math.min(Math.max(r, 0), 3), 0);

    let severity, recommendations;

    if (score <= 4) {
      severity = '极轻或无';
      recommendations = ['常规关注', '保持健康生活习惯'];
    } else if (score <= 9) {
      severity = '轻度';
      recommendations = ['观察等待', '建议咨询心理医生'];
    } else if (score <= 14) {
      severity = '中度';
      recommendations = ['制定计划', '强烈建议咨询心理医生', '可能需要药物治疗'];
    } else if (score <= 19) {
      severity = '中重度';
      recommendations = ['积极治疗', '立即咨询心理医生', '药物治疗可能有效'];
    } else {
      severity = '重度';
      recommendations = ['立即干预', '紧急咨询心理医生', '药物治疗合并心理治疗'];
    }

    return {
      score,
      maxScore: 27,
      severity,
      recommendations,
      interpretation: this._interpretPHQ9(score),
    };
  }

  _interpretPHQ9(score) {
    const interpretations = {
      0: '没有抑郁症状',
      5: '可能轻度抑郁，需关注',
      10: '中度抑郁，建议寻求帮助',
      15: '中重度抑郁，需要专业干预',
      20: '重度抑郁，需要立即专业帮助',
    };

    if (score <= 4) return interpretations[0];
    if (score <= 9) return interpretations[5];
    if (score <= 14) return interpretations[10];
    if (score <= 19) return interpretations[15];
    return interpretations[20];
  }

  /**
   * GAD-7 焦虑评估
   * @param {number[]} responses - 7个问题的得分(0-3)
   * @returns {Object} { score, severity, recommendations }
   */
  assessGAD7(responses) {
    if (!Array.isArray(responses) || responses.length !== 7) {
      return { error: 'GAD-7需要7个问题的回答' };
    }

    const score = responses.reduce((sum, r) => sum + Math.min(Math.max(r, 0), 3), 0);

    let severity, recommendations;

    if (score <= 4) {
      severity = '极轻';
      recommendations = ['常规关注'];
    } else if (score <= 9) {
      severity = '轻度';
      recommendations = ['观察等待', '放松技巧可能有用'];
    } else if (score <= 14) {
      severity = '中度';
      recommendations = ['建议咨询心理医生', '学习焦虑管理技巧'];
    } else {
      severity = '重度';
      recommendations = ['立即咨询心理医生', '可能需要药物治疗'];
    }

    return {
      score,
      maxScore: 21,
      severity,
      recommendations,
      interpretation: this._interpretGAD7(score),
    };
  }

  _interpretGAD7(score) {
    const interpretations = {
      0: '没有焦虑症状',
      5: '可能轻度焦虑',
      10: '中度焦虑，建议寻求帮助',
      15: '重度焦虑，需要专业干预',
    };

    if (score <= 4) return interpretations[0];
    if (score <= 9) return interpretations[5];
    if (score <= 14) return interpretations[10];
    return interpretations[15];
  }

  /**
   * 综合心理健康评分
   * 结合PHQ-9和GAD-7
   */
  getMentalHealthScore(phqResponses, gadResponses) {
    const phqResult = this.assessPHQ9(phqResponses);
    const gadResult = this.assessGAD7(gadResponses);

    // 综合评分（各占50%）
    const phqScore = phqResult.score || 0;
    const gadScore = gadResult.score || 0;
    const combinedScore = (phqScore / 27) * 50 + (gadScore / 21) * 50;

    let overall;
    if (combinedScore < 25) {
      overall = '良好';
    } else if (combinedScore < 50) {
      overall = '需要注意';
    } else if (combinedScore < 75) {
      overall = '需要关注';
    } else {
      overall = '需要专业帮助';
    }

    return {
      combinedScore: Math.round(combinedScore * 100) / 100,
      phq: phqResult,
      gad: gadResult,
      overall,
      recommendations: [
        ...phqResult.recommendations || [],
        ...gadResult.recommendations || [],
      ],
    };
  }

  /**
   * Full psychology analysis — 两步式分析
   * 第一步：规则分析（快速、确定性）
   * 第二步：提示词优化 + 自我批评验证
   */
  analyzePsychology(input) {
    // 记录分析次数（用于准确率统计）
    this._incrementAnalysisCount();

    // 第一步：规则分析（获取初步结果）
    let ruleBasedResult = this.perceive(input);

    // 检查是否有用户纠正：同一input的后续分析将使用纠正后的值
    const correctionCache = this._getCorrectionCache(input);
    if (correctionCache) {
      // 应用用户纠正
      if (correctionCache.correctionType === 'emotion' && correctionCache.correctionValue) {
        ruleBasedResult = this._applyEmotionCorrection(ruleBasedResult, correctionCache.correctionValue);
      }
      ruleBasedResult.wasCorrected = true;
    }

    // 计算PAD情绪坐标（用于自我批评验证）
    const pad = this._calculatePAD(input, ruleBasedResult.emotion);

    // 计算危机风险（用于自我批评验证）
    const crisis = this.assessCrisisRisk(input);

    // 如果没有配置优化器和批评器，直接返回规则分析结果
    if (!this.promptOptimizer && !this.selfCritique) {
      return {
        ...ruleBasedResult,
        pad,
        crisis,
        userCorrected: correctionCache ? true : false,
      };
    }

    // 构建完整分析结果（包含PAD和crisis）用于自我批评
    const completeResult = {
      ...ruleBasedResult,
      pad,
      crisis,
    };

    // 第二步：构建优化提示词（用于LLM调用）
    let reasoningChain = null;
    let optimizedPrompts = null;
    if (this.promptOptimizer) {
      optimizedPrompts = this.promptOptimizer.optimizePsychologyPrompt(input, completeResult);
      reasoningChain = optimizedPrompts.reasoningChain;
    }

    // 第三步：自我批评验证（使用完整结果）
    let critique = null;
    if (this.selfCritique) {
      critique = this.selfCritique.critiqueAnalysis(completeResult, input);
    }

    // 组装最终结果
    const result = {
      ...completeResult,
      analysisMode: 'rule-based-enhanced',
      reasoningChain,
      critique,
      optimizedPrompts: optimizedPrompts ? {
        systemPrompt: optimizedPrompts.systemPrompt,
        userPrompt: optimizedPrompts.userPrompt,
        metacognitionPrompt: optimizedPrompts.metacognitionPrompt,
      } : null,
      needsRefinement: critique?.needsImprovement || false,
    };

    // 如果需要改进，使用改进后的分析
    if (critique?.needsImprovement && critique.refinedAnalysis) {
      // 用改进后的分析覆盖原有结果
      Object.assign(result, critique.refinedAnalysis);
      result.analysisMode = 'rule-based-refined';
    }

    // 如果需要改进，添加改进建议
    if (critique?.needsImprovement && critique.suggestions?.length > 0) {
      result.refinementSuggestions = critique.suggestions;
    }

    return result;
  }

  /**
   * 计算PAD情绪坐标
   */
  _calculatePAD(input, emotion) {
    // 基于情绪类别和强度计算PAD值
    // PAD: Pleasure, Arousal, Dominance (-10 to +10)
    const lower = input.toLowerCase();

    let pleasure = 0;
    let arousal = 0;
    let dominance = 0;

    // 根据情绪类别调整愉悦度
    if (emotion?.category === 'positive') {
      pleasure = emotion?.intensity === 'high' ? 7 : emotion?.intensity === 'medium' ? 5 : 3;
      arousal = emotion?.intensity === 'high' ? 6 : emotion?.intensity === 'medium' ? 4 : 2;
      dominance = 4;
    } else if (emotion?.category === 'negative') {
      pleasure = emotion?.intensity === 'high' ? -7 : emotion?.intensity === 'medium' ? -5 : -3;
      // 高负面情绪通常伴随高激活
      arousal = emotion?.intensity === 'high' ? 7 : emotion?.intensity === 'medium' ? 5 : 3;
      dominance = -2;
    } else {
      // 中性情绪
      pleasure = 0;
      arousal = 0;
      dominance = 5;
    }

    // 检测强度词微调
    const intensityBoost = {
      '非常': 2, '特别': 2, '极其': 3, '超': 2,
      '有点': -1, '稍微': -1, '略微': -1, '不太': -1,
    };
    for (const [word, boost] of Object.entries(intensityBoost)) {
      if (lower.includes(word)) {
        pleasure = Math.max(-10, Math.min(10, pleasure + boost));
        arousal = Math.max(-10, Math.min(10, arousal + boost));
        break;
      }
    }

    return {
      pleasure: Math.round(pleasure),
      arousal: Math.round(arousal),
      dominance: Math.round(dominance),
    };
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
    // 复用 _detectEmotion 的关键词检测逻辑以保持一致性
    const lower = input.toLowerCase();
    const detected = [];

    // 从 emotionMap 中提取所有负面情绪关键词（高强度）
    const highIntensityNegative = this.emotionMap.negative?.high || [];
    const mediumIntensityNegative = this.emotionMap.negative?.medium || [];
    const highIntensityPositive = this.emotionMap.positive?.high || [];

    const emotionalKeywords = [
      ...highIntensityNegative,
      ...mediumIntensityNegative,
      ...highIntensityPositive,
    ];

    for (const kw of emotionalKeywords) {
      if (lower.includes(kw)) {
        detected.push(kw);
      }
    }

    if (detected.length === 0) {
      return { hasEmotion: false, acknowledgment: null, canAnalyze: false };
    }

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
      '绝望': '我听到了，你感到绝望。',
      '崩溃': '我听到了，你感到崩溃。',
      '生气': '我听到了，你感到生气。',
      '愤怒': '我听到了，你感到愤怒。',
      '难过': '我听到了，你感到难过。',
      '担心': '我听到了，你感到担心。',
      '恐慌': '我听到了，你感到恐慌。',
      '烦死了': '我听到了，你感到非常烦躁。',
      '受不了': '我听到了，你感到无法承受。',
      '压力大': '我听到了，你感到压力很大。',
      '气死了': '我听到了，你感到非常愤怒。',
      '开心': '我听到了，你感到开心。',
      '高兴': '我听到了，你感到高兴。',
      '快乐': '我听到了，你感到快乐。',
      '兴奋': '我听到了，你感到兴奋。',
      '激动': '我听到了，你感到激动。',
      '感动': '我听到了，你感到感动。',
      '感激': '我听到了，你感到感激。',
      '满足': '我听到了，你感到满足。',
      '温暖': '我听到了，你感到温暖。',
    };

    const emotion = detected[0];
    return {
      hasEmotion: true,
      acknowledgment: acknowledgments[emotion] || `我听到了，你感到${emotion}。`,
      canAnalyze: true,
      detectedEmotions: detected.slice(0, 3), // 返回最多3个检测到的情绪关键词
    };
  }

  // ─── PAD Emotion Model (from mark-heartflow-skill) ─────────────

  /**
   * Calculate PAD emotion from text using 3 dimensions:
   * Pleasure (-10 to +10), Arousal (-10 to +10), Dominance (-10 to +10)
   * Based on Mehrabian's PAD model.
   */
  calculatePAD(input) {
    const lower = input.toLowerCase();

    // Pleasure indicators
    let pleasure = 0;
    const pleasurePos = ['happy', 'great', 'good', 'love', '开心', '高兴', '棒', '成功'];
    const pleasureNeg = ['sad', 'angry', 'bad', 'hate', '愤怒', '伤心', '痛苦', '失败'];
    for (const kw of pleasurePos) { if (lower.includes(kw)) pleasure += 2; }
    for (const kw of pleasureNeg) { if (lower.includes(kw)) pleasure -= 2; }

    // Arousal indicators
    let arousal = 0;
    const arousalHigh = ['excited', 'anxious', '紧张', '兴奋', '激动', '焦虑'];
    const arousalLow = ['calm', 'tired', 'bored', '平静', '累', '无聊'];
    for (const kw of arousalHigh) { if (lower.includes(kw)) arousal += 2; }
    for (const kw of arousalLow) { if (lower.includes(kw)) arousal -= 2; }

    // Dominance indicators
    let dominance = 0;
    const dominanceHigh = ['decide', 'will', 'must', '决定', '必须', '一定'];
    const dominanceLow = ['maybe', 'perhaps', 'uncertain', '也许', '可能', '不确定'];
    for (const kw of dominanceHigh) { if (lower.includes(kw)) dominance += 2; }
    for (const kw of dominanceLow) { if (lower.includes(kw)) dominance -= 2; }

    // Clamp to [-10, 10]
    pleasure = Math.max(-10, Math.min(10, pleasure));
    arousal = Math.max(-10, Math.min(10, arousal));
    dominance = Math.max(-10, Math.min(10, dominance));

    return { pleasure, arousal, dominance };
  }

  // ─── Crisis Intervention (from mark-heartflow-skill, mental-health-analyzer) ────

  // Crisis keywords in order of severity
  // Note: Context-aware scoring is applied - single keywords are weighted lower
  static CRISIS_KEYWORDS = {
    critical: ['我不想活了', '不想活了', '活着没意思', '活着真没意思', '活着没意义', '我想死', '我要死', 'suicide', 'kill myself', '自残', '自杀'],
    high: ['活着好累', '太痛苦了', '绝望', 'hopeless'],
    medium: ['好沮丧', '好焦虑', '好压力', '难过', 'depressed', '焦虑', '压力'],
    low: ['有点累', '不太高兴', '无聊', '失落'],
  };

  /**
   * Assess crisis risk level from user input.
   * Returns: { level: 'none'|'low'|'medium'|'high'|'critical', score: 0-20, warnings: string[] }
   * Based on mental-health-analyzer scoring system (0-20 scale).
   */
  assessCrisisRisk(input) {
    const lower = input.toLowerCase();
    let score = 0;
    const warnings = [];

    // Check each severity level
    for (const [level, keywords] of Object.entries(HeartFlowPsychology.CRISIS_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          switch (level) {
            case 'critical': score += 10; warnings.push('危机关键词: ' + kw); break;
            case 'high': score += 5; warnings.push('高风险关键词: ' + kw); break;
            case 'medium': score += 3; break;
            case 'low': score += 1; break;
          }
        }
      }
    }

    // Determine level from score
    let level = 'none';
    if (score >= 10) level = 'critical';
    else if (score >= 7) level = 'high';
    else if (score >= 4) level = 'medium';
    else if (score >= 1) level = 'low';

    return { level, score: Math.min(20, score), warnings };
  }

  /**
   * Get crisis intervention response based on level.
   * Returns appropriate message and resources.
   */
  getCrisisResponse(level) {
    const responses = {
      none: null,
      low: {
        message: '我听到了，你的感受是真实的。每个人都会有累的时候。',
        resources: []
      },
      medium: {
        message: '我听到了你的感受，这些情绪是很真实的。如果持续低落，寻求帮助是勇敢的表现。',
        resources: ['全国心理援助热线: 400-161-9995 (24小时)']
      },
      high: {
        message: '我听到你的痛苦了，你并不孤单。寻求专业帮助是重要的一步。',
        resources: [
          '全国心理援助热线: 400-161-9995 (24小时)',
          '北京心理危机干预中心: 010-82951332 (24小时)'
        ]
      },
      critical: {
        message: '⚠️ 我听到你的痛苦了，我非常关心你的安全。',
        resources: [
          '紧急求助: 拨打 110 或前往最近医院急诊',
          '全国心理援助热线: 400-161-9995 (24小时)',
          '北京心理危机干预中心: 010-82951332 (24小时)'
        ]
      }
    };

    return responses[level] || null;
  }
}

module.exports = { HeartFlowPsychology };
