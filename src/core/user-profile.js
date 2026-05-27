/**
 * 用户心理档案模块 — 心镜v1.16.2
 *
 * 基于EmoSApp研究: 长期用户心理建模
 *
 * 功能:
 * - 建立和维护用户心理档案
 * - 跟踪心理状态变化趋势
 * - 识别个人特有的认知模式
 * - 提供个性化心理分析
 *
 * 隐私声明:
 * - 本模块为辅助工具，不能替代专业心理咨询或治疗
 * - 用户档案数据仅存储在本地，不会上传任何服务器
 * - 危机评估仅供参考，不能作为医学诊断依据
 * - 如有心理健康疑虑，请寻求专业帮助
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UserProfile {
  constructor(rootPath = __dirname) {
    this.rootPath = rootPath;
    this.dataDir = path.join(this.rootPath, 'data');
    this.profileFile = path.join(this.dataDir, 'user-profile.json');

    // 同意机制：未经用户明确同意，不创建或加载档案
    this.consentGiven = false;

    this.profile = {
      id: null,
      createdAt: null,
      lastSeen: null,
      sessions: 0,
      consentGiven: false, // 隐私同意标志

      // 心理特征
      psychological: {
        // 主要情绪倾向
        emotionalTendency: [],  // ['焦虑', '追求完美']
        // 常见的认知扭曲
        commonDistortions: {},  // { 'overgeneralization': count }
        // 防御机制使用
        defenseMechanisms: [],   // ['合理化', '转移']
        // 依恋风格（基于Bowen家庭系统理论）
        attachmentStyle: null,   // 'secure' | 'anxious' | 'avoidant' | 'disorganized'
      },

      // 沟通偏好
      communication: {
        preferredTone: null,    // 'direct' | 'gentle' | 'analytical'
        responseLength: null,   // 'short' | 'medium' | 'long'
        emotionalExpression: null, // 'open' | 'reserved' | 'selective'
      },

      // 历史记录
      history: {
        intents: [],      // 意图历史
        emotions: [],     // 情绪历史 {timestamp, emotion, context}
        needs: [],        // 需求历史
        crisisEpisodes: [], // 危机事件
      },

      // 心理状态趋势
      trends: {
        moodScores: [],   // [timestamp, score] 近期情绪评分趋势
        distressScores: [], // [timestamp, score] 困扰程度趋势
        resilienceScores: [], // [timestamp, score] 韧性评分
      },

      // 个性化参数
      personalization: {
        // 此用户特有的隐含意图模式
        implicitIntentPatterns: [],
        // 此用户对某些话题的敏感度
        sensitiveTopics: {},
        // 此用户的支持性回应偏好
        preferredSupport: [],
      },
    };

    this._load();
  }

  /**
   * 加载档案
   */
  _load() {
    try {
      if (fs.existsSync(this.profileFile)) {
        const data = JSON.parse(fs.readFileSync(this.profileFile, 'utf-8'));
        // 合并数据，保留历史但更新当前状态
        this.profile = { ...this.profile, ...data };
        this.profile.lastSeen = Date.now();
        // 检查隐私同意状态
        this.consentGiven = this.profile.consentGiven || false;
      }
    } catch (e) {
      console.warn('[UserProfile] Load failed, starting fresh:', e.message);
    }
  }

  /**
   * 检查是否已获得用户同意
   */
  hasConsent() {
    return this.consentGiven;
  }

  /**
   * 设置用户隐私同意
   * @param {boolean} consent - 用户是否同意
   * @returns {object} 操作结果
   */
  setConsent(consent) {
    if (typeof consent !== 'boolean') {
      return { success: false, message: '同意状态必须是布尔值' };
    }
    this.consentGiven = consent;
    this.profile.consentGiven = consent;
    this._save();
    return {
      success: true,
      consentGiven: consent,
      message: consent
        ? '已获得隐私同意，档案功能已启用'
        : '已撤回同意，档案数据将被保留但不再更新。如需删除数据，请调用deleteAllData()',
    };
  }

  /**
   * 获取隐私声明
   */
  getPrivacyNotice() {
    return {
      notice: '心镜用户档案为辅助工具，不能替代专业心理咨询或治疗',
      dataStorage: '所有数据仅存储在本地设备，不会上传至任何服务器',
      dataControl: '用户可随时通过setConsent(false)撤回同意或调用deleteAllData()删除数据',
      deletion: '调用deleteAllData()可程序化删除所有档案数据',
      professionalDisclaimer: '本档案分析仅供参考，不构成医学或心理健康诊断',
      crisisResource: '如有心理健康疑虑，请拨打心理援助热线或寻求专业帮助',
    };
  }

  /**
   * 删除所有档案数据
   * @param {boolean} requireConsent - 是否要求同意检查（默认true）
   * @returns {object} 删除结果
   */
  deleteAllData(requireConsent = true) {
    // 安全检查：要求同意
    if (requireConsent && !this.consentGiven) {
      return {
        success: false,
        message: '需要用户同意才能删除数据。请先调用 setConsent(true) 获取同意。',
        code: 'CONSENT_REQUIRED',
      };
    }

    try {
      if (fs.existsSync(this.profileFile)) {
        fs.unlinkSync(this.profileFile);
      }
      this.profile = this._createEmptyProfile();
      this.consentGiven = false;
      return {
        success: true,
        message: '所有档案数据已删除',
      };
    } catch (e) {
      return {
        success: false,
        message: `删除失败: ${e.message}`,
      };
    }
  }

  /**
   * 创建空档案结构
   */
  _createEmptyProfile() {
    return {
      id: null,
      createdAt: null,
      lastSeen: null,
      sessions: 0,
      consentGiven: false,
      psychological: {
        emotionalTendency: [],
        commonDistortions: {},
        defenseMechanisms: [],
        attachmentStyle: null,
      },
      communication: {
        preferredTone: null,
        responseLength: null,
        emotionalExpression: null,
      },
      history: {
        intents: [],
        emotions: [],
        needs: [],
        crisisEpisodes: [],
      },
      trends: {
        moodScores: [],
        distressScores: [],
        resilienceScores: [],
      },
      personalization: {
        implicitIntentPatterns: [],
        sensitiveTopics: {},
        preferredSupport: [],
      },
    };
  }

  /**
   * 保存档案
   */
  _save() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.profileFile, JSON.stringify(this.profile, null, 2));
    } catch (e) {
      console.error('[UserProfile] Save failed:', e.message);
    }
  }

  /**
   * 创建或更新档案
   * @param {string} userId - 用户ID
   * @returns {object} 档案或错误信息
   */
  createOrUpdate(userId) {
    // 未经同意不创建档案
    if (!this.consentGiven) {
      return {
        error: '需要用户同意才能创建档案',
        consentRequired: true,
        privacyNotice: this.getPrivacyNotice(),
      };
    }

    if (!this.profile.id) {
      this.profile.id = userId || crypto.randomBytes(8).toString('hex');
      this.profile.createdAt = Date.now();
    }
    this.profile.lastSeen = Date.now();
    this.profile.sessions++;
    this._save();
    return this.profile;
  }

  /**
   * 更新心理分析结果
   */
  updateFromAnalysis(analysis) {
    // 更新意图历史
    if (analysis.intent?.category) {
      this.profile.history.intents.push({
        timestamp: Date.now(),
        intent: analysis.intent.category,
        confidence: analysis.intent.confidence,
      });
      // 只保留最近20条
      if (this.profile.history.intents.length > 20) {
        this.profile.history.intents = this.profile.history.intents.slice(-20);
      }
    }

    // 更新情绪历史
    if (analysis.emotion?.category) {
      this.profile.history.emotions.push({
        timestamp: Date.now(),
        emotion: analysis.emotion.category,
        intensity: analysis.emotion.intensity,
      });

      // 检测情绪趋势
      this._updateMoodTrend(analysis.emotion);

      // 只保留最近50条
      if (this.profile.history.emotions.length > 50) {
        this.profile.history.emotions = this.profile.history.emotions.slice(-50);
      }
    }

    // 更新认知扭曲统计
    if (analysis.distortions?.distortions) {
      for (const d of analysis.distortions.distortions) {
        this.profile.psychological.commonDistortions[d.type] =
          (this.profile.psychological.commonDistortions[d.type] || 0) + 1;
      }
    }

    // 检测危机事件
    if (analysis.crisis?.level === 'high' || analysis.crisis?.score > 7) {
      this.profile.history.crisisEpisodes.push({
        timestamp: Date.now(),
        score: analysis.crisis?.score || 0,
        indicators: analysis.crisis?.warnings || [],
      });
    }

    this._save();
  }

  /**
   * 更新情绪趋势
   */
  _updateMoodTrend(emotion) {
    // 计算情绪分数 (正面=高，负面=低)
    let score = 5; // 中性基准
    if (emotion.category === 'positive') {
      score = emotion.intensity === 'high' ? 8 : emotion.intensity === 'medium' ? 6 : 5;
    } else if (emotion.category === 'negative') {
      score = emotion.intensity === 'high' ? 2 : emotion.intensity === 'medium' ? 3 : 4;
    }

    this.profile.trends.moodScores.push([Date.now(), score]);
    if (this.profile.trends.moodScores.length > 30) {
      this.profile.trends.moodScores = this.profile.trends.moodScores.slice(-30);
    }
  }

  /**
   * 获取心理档案摘要
   */
  getSummary() {
    return {
      id: this.profile.id,
      activeDays: this._calculateActiveDays(),
      sessions: this.profile.sessions,
      emotionalTendency: this._getTopEmotionalTendencies(),
      commonDistortions: this._getTopDistortions(),
      attachmentStyle: this.profile.psychological.attachmentStyle,
      recentMood: this._getRecentMoodTrend(),
      crisisRisk: this._assessCrisisRisk(),
    };
  }

  /**
   * 计算活跃天数
   */
  _calculateActiveDays() {
    if (!this.profile.createdAt) return 0;
    return Math.floor((Date.now() - this.profile.createdAt) / (1000 * 60 * 60 * 24));
  }

  /**
   * 获取主要情绪倾向
   */
  _getTopEmotionalTendencies() {
    const emotionCounts = {};
    for (const e of this.profile.history.emotions) {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    }
    return Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion, count]) => ({ emotion, count }));
  }

  /**
   * 获取主要认知扭曲
   */
  _getTopDistortions() {
    return Object.entries(this.profile.psychological.commonDistortions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * 获取近期情绪趋势
   */
  _getRecentMoodTrend() {
    const recent = this.profile.trends.moodScores.slice(-7);
    if (recent.length < 2) return { trend: 'insufficient_data', direction: null };

    const recentAvg = recent.reduce((sum, [, score]) => sum + score, 0) / recent.length;
    const prevIndex = Math.max(0, recent.length - 4);
    const prevAvg = recent.slice(0, prevIndex).reduce((sum, [, score]) => sum + score, 0) /
      Math.max(1, recent.slice(0, prevIndex).length);

    const direction = recentAvg - prevAvg;
    let trend;
    if (direction > 0.5) trend = 'improving';
    else if (direction < -0.5) trend = 'declining';
    else trend = 'stable';

    return {
      trend,
      direction: direction > 0 ? 'positive' : direction < 0 ? 'negative' : 'neutral',
      recentAvg: Math.round(recentAvg * 10) / 10,
      samplePoints: recent.length,
    };
  }

  /**
   * 评估危机风险
   */
  _assessCrisisRisk() {
    const recentCrises = this.profile.history.crisisEpisodes.filter(
      c => Date.now() - c.timestamp < 7 * 24 * 60 * 60 * 1000 // 最近7天
    );

    const moodTrend = this._getRecentMoodTrend();
    let risk = 'low';

    if (recentCrises.length >= 2 || moodTrend.trend === 'declining') {
      risk = 'high';
    } else if (recentCrises.length >= 1 || moodTrend.trend === 'stable') {
      risk = 'medium';
    }

    return {
      level: risk,
      recentCrises: recentCrises.length,
      moodTrend: moodTrend.trend,
    };
  }

  /**
   * 获取个性化分析参数
   */
  getPersonalization() {
    return {
      commonDistortions: this._getTopDistortions(),
      emotionalTendency: this._getTopEmotionalTendencies(),
      attachmentStyle: this.profile.psychological.attachmentStyle,
      sensitiveTopics: this.profile.personalization.sensitiveTopics,
      recommendedTone: this._inferRecommendedTone(),
    };
  }

  /**
   * 推断推荐的交流语气
   */
  _inferRecommendedTone() {
    const tendencies = this._getTopEmotionalTendencies();
    if (tendencies.some(t => t.emotion === 'negative' && t.count > 5)) {
      return 'gentle'; // 经常负面情绪，用户可能需要温和支持
    }
    if (tendencies.some(t => t.emotion === 'positive' && t.count > 10)) {
      return 'direct'; // 经常正面情绪，可以更直接
    }
    return 'balanced';
  }

  /**
   * 记录用户纠正（用于校准）
   */
  recordCorrection(type, originalAnalysis, userCorrection) {
    this.profile.personalization.implicitIntentPatterns.push({
      timestamp: Date.now(),
      type,
      original: originalAnalysis,
      correction: userCorrection,
    });
    this._save();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalSessions: this.profile.sessions,
      totalAnalyses: this.profile.history.intents.length,
      totalEmotions: this.profile.history.emotions.length,
      crisisEpisodes: this.profile.history.crisisEpisodes.length,
      daysActive: this._calculateActiveDays(),
      profileComplete: this._calculateProfileCompleteness(),
    };
  }

  /**
   * 计算档案完整度
   */
  _calculateProfileCompleteness() {
    let score = 0;
    if (this.profile.psychological.emotionalTendency.length > 0) score += 20;
    if (Object.keys(this.profile.psychological.commonDistortions).length > 0) score += 20;
    if (this.profile.psychological.attachmentStyle) score += 20;
    if (this.profile.trends.moodScores.length > 10) score += 20;
    if (this.profile.history.intents.length > 5) score += 20;
    return score;
  }
}

module.exports = { UserProfile };
