/**
 * EmotionBridge v1.0.9 — Emotion-Memory Integration
 *
 * Bridges emotional state with episodic memory:
 *   - Records emotional interactions as memory traces
 *   - Analyzes emotional arcs over time
 *   - Generates response style hints based on emotional trajectory
 *
 * Based on: daima/src/emotion_memory_bridge.py concepts
 * v1.0.9: Initial implementation
 */

const { Attention } = require('./attention.js');

// EmotionalArc types
const EmotionalArcType = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
  STABLE_POSITIVE: 'stable_positive',
  STABLE_NEGATIVE: 'stable_negative',
  FLUCTUATING: 'fluctuating',
  EMOTIONAL_SPIKE: 'spike',
  UNKNOWN: 'unknown',
};

// Positive and negative emotion keywords for arc detection
const POSITIVE_EMOTIONS = new Set(['joy', 'excited', 'happy', 'satisfied', 'grateful', 'optimistic', 'calm', 'confident', 'eager']);
const NEGATIVE_EMOTIONS = new Set(['concerned', 'tired', 'frustrated', 'sad', 'angry', 'anxious', 'worried', 'disappointed', 'confused']);

class EmotionBridge {
  constructor(memory) {
    this.memory = memory;
    this.emotionHistory = []; // { emotion, intensity, timestamp, userInput }
    this._counter = 0;
    this._MAX_HISTORY = 50;
  }

  _nextId() {
    this._counter += 1;
    return `emb_${Date.now()}_${this._counter}`;
  }

  /**
   * Record an emotional interaction as memory.
   */
  recordInteraction(userInput, agentResponse, emotion, intensity, context = {}) {
    const content = `User: ${userInput.substring(0, 60)} | Agent: ${agentResponse.substring(0, 60)}...`;
    const importance = Math.min(1.0, intensity / 5.0 + 0.3);

    // Store in memory if available
    if (this.memory) {
      this.memory.remember(
        `emotion:${this._nextId()}`,
        content,
        'learned'
      );
    }

    // Track emotion history
    this.emotionHistory.push({
      emotion,
      intensity,
      timestamp: Date.now(),
      userInput: userInput.substring(0, 50),
    });

    if (this.emotionHistory.length > this._MAX_HISTORY) {
      this.emotionHistory.shift();
    }

    return { recorded: true, emotion, intensity };
  }

  /**
   * Analyze emotional arc over a window.
   */
  analyzeEmotionalArc(window = 10) {
    if (this.emotionHistory.length < 2) {
      return { arc_type: EmotionalArcType.UNKNOWN, confidence: 0 };
    }

    const recent = this.emotionHistory.slice(-window);
    const emotions = recent.map(e => e.emotion);
    const intensities = recent.map(e => e.intensity);

    // Count emotion changes
    let emotionChanges = 0;
    for (let i = 1; i < emotions.length; i++) {
      if (emotions[i] !== emotions[i - 1]) emotionChanges++;
    }

    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const intensityTrend = intensities[intensities.length - 1] - intensities[0];

    let arc;
    const changeRatio = emotionChanges / emotions.length;

    if (changeRatio >= 0.5) {
      arc = EmotionalArcType.FLUCTUATING;
    } else if (Math.abs(intensityTrend) <= 1 && new Set(emotions).size <= 2) {
      if (POSITIVE_EMOTIONS.has(emotions[0])) {
        arc = EmotionalArcType.STABLE_POSITIVE;
      } else if (NEGATIVE_EMOTIONS.has(emotions[0])) {
        arc = EmotionalArcType.STABLE_NEGATIVE;
      } else {
        arc = EmotionalArcType.FLUCTUATING;
      }
    } else if (intensityTrend > 2) {
      arc = EmotionalArcType.ASCENDING;
    } else if (intensityTrend < -2) {
      arc = EmotionalArcType.DESCENDING;
    } else if (emotions.length >= 2) {
      // Check for spike: sudden large change
      const maxDiff = Math.max(...intensities.map((v, i) => i === 0 ? 0 : Math.abs(v - intensities[i - 1])));
      if (maxDiff >= 3) {
        arc = EmotionalArcType.EMOTIONAL_SPIKE;
      } else {
        arc = EmotionalArcType.STABLE_POSITIVE;
      }
    } else {
      arc = EmotionalArcType.STABLE_POSITIVE;
    }

    // Find dominant emotion
    const emotionCounts = {};
    for (const e of emotions) {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    }
    const dominantEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    return {
      arc_type: arc,
      avg_intensity: Math.round(avgIntensity * 100) / 100,
      intensity_trend: intensityTrend,
      emotion_changes: emotionChanges,
      dominant_emotion: dominantEmotion,
      window_size: recent.length,
      confidence: Math.min(1.0, recent.length / 5.0),
    };
  }

  /**
   * Get response style hint based on emotional arc.
   */
  getResponseStyleHint() {
    const arc = this.analyzeEmotionalArc();

    switch (arc.arc_type) {
      case EmotionalArcType.ASCENDING:
        return {
          style: 'celebrate',
          tone: 'warm',
          suggestion: 'Emotional arc is ascending — maintain positive atmosphere, celebrate progress',
        };
      case EmotionalArcType.DESCENDING:
        return {
          style: 'support',
          tone: 'gentle',
          suggestion: 'Emotional arc is descending — increase emotional validation, offer supportive responses',
        };
      case EmotionalArcType.STABLE_NEGATIVE:
        return {
          style: 'empathetic',
          tone: 'calm',
          suggestion: 'Persistent negative emotions — explore emotional roots deeply, be cautious with advice',
        };
      case EmotionalArcType.FLUCTUATING:
        return {
          style: 'balanced',
          tone: 'neutral',
          suggestion: 'Emotional fluctuation — maintain steady listening, help process emotions',
        };
      case EmotionalArcType.EMOTIONAL_SPIKE:
        return {
          style: 'attentive',
          tone: 'grounded',
          suggestion: 'Sudden emotional spike detected — respond with care, acknowledge the shift',
        };
      default:
        return {
          style: 'neutral',
          tone: 'balanced',
          suggestion: 'Emotional state is stable — maintain normal engagement',
        };
    }
  }

  /**
   * Get recent emotion history.
   */
  getRecentEmotions(limit = 5) {
    return this.emotionHistory.slice(-limit);
  }

  /**
   * Get emotion summary statistics.
   */
  getEmotionSummary() {
    if (this.emotionHistory.length === 0) {
      return { total: 0 };
    }

    const emotionCounts = {};
    for (const e of this.emotionHistory) {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
    }

    return {
      total: this.emotionHistory.length,
      by_emotion: emotionCounts,
      arc_analysis: this.analyzeEmotionalArc(),
    };
  }

  /**
   * Get stats for health check.
   */
  getStats() {
    return {
      emotionHistorySize: this.emotionHistory.length,
      dominantEmotion: this.emotionHistory.length > 0
        ? this.emotionHistory.slice(-10).reduce((acc, e) => {
          acc[e.emotion] = (acc[e.emotion] || 0) + 1;
          return acc;
        }, {})
        : {},
    };
  }
}

module.exports = { EmotionBridge, EmotionalArcType };
