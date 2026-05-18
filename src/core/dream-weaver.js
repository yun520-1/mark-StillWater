/**
 * DreamWeaver v1.1.0 — Dream Content Generator
 *
 * Generates dream content during REM sleep from memory recombination:
 *   - Random hippocampal signals drive emotional/procedural memory integration
 *   - Dreams = recent experiences + old knowledge creative recombination
 *   - NREM: factual/episodic memory transfer from hippocampus to cortex
 *   - Sleep cycle ~90 min, NREM/REM alternating
 *
 * Based on: daima/templates/dream/dream_generator.py
 * v1.1.0: Initial implementation
 */

const DreamPhase = {
  NREM: 'nrem',
  REM: 'rem',
  AWAKE: 'awake',
  TRANSITION: 'transition',
};

const CYCLE_MIN = 90;
const REM_RATIO = 0.25;
const NREM_RATIO = 0.70;

/**
 * @typedef {Object} DreamFragment
 * @property {string} id
 * @property {number} timestamp
 * @property {string} content
 * @property {string[]} emotions
 * @property {string} recombination_type
 * @property {number} vividness
 */

/**
 * @typedef {Object} SleepCycle
 * @property {string} phase
 * @property {number} duration_minutes
 * @property {number} start_time
 * @property {string[]} memories_processed
 */

const DREAM_TEMPLATES = [
  '{A}的场景过渡到{B}，{C}的碎片闪过...',
  '{A}与{B}混合在一起，{C}的影子逐渐浮现...',
  '{A}中浮现{B}，{C}的轮廓变得清晰...',
  '{B}的片段与{A}交织，{C}在远处闪烁...',
  '{A}与{C}的声音在黑暗中回响，{B}逐渐远去...',
  '{B}的空间里出现了{A}的痕迹，{C}若隐若现...',
];

const EMOTION_MAP = {
  joy: ['joy', 'surprise'],
  excited: ['joy', 'anticipation'],
  concerned: ['fear', 'sadness'],
  tired: ['sadness', 'fatigue'],
  angry: ['anger', 'disgust'],
  neutral: ['neutral', 'confusion'],
  frustrated: ['fear', 'sadness'],
  satisfied: ['joy', 'contentment'],
};

const ALL_EMOTIONS = ['joy', 'fear', 'surprise', 'sadness', 'anger', 'disgust', 'anticipation', 'neutral'];

class DreamWeaver {
  constructor(memory = null) {
    this.memory = memory;
    this.sleepCycles = [];
    this.dreams = [];
    this._counter = 0;
  }

  _nextId() {
    this._counter += 1;
    return `dream_${Date.now()}_${this._counter}`;
  }

  /**
   * Enter sleep mode and generate NREM/REM alternating cycles.
   * @param {string} uid - User/agent ID
   * @param {Array<{id?, content: string}>} priors - Prior memories
   * @param {string} emotion - Emotional context
   * @returns {SleepCycle[]}
   */
  enterSleep(uid, priors = [], emotion = 'neutral') {
    const cycles = [];
    const numCycles = 4 + Math.floor(Math.random() * 3); // 4-6 cycles

    for (let i = 0; i < numCycles; i++) {
      const nremMemories = priors.slice(0, 5).map((m, j) => m.id || `mem_${j}`);
      const remMemories = priors.slice(0, 3).map((m, j) => m.id || `mem_${j}`);

      cycles.push({
        phase: DreamPhase.NREM,
        duration_minutes: NREM_RATIO * CYCLE_MIN,
        start_time: Date.now(),
        memories_processed: nremMemories,
      });

      cycles.push({
        phase: DreamPhase.REM,
        duration_minutes: REM_RATIO * CYCLE_MIN,
        start_time: Date.now(),
        memories_processed: remMemories,
      });
    }

    this.sleepCycles = cycles;
    return cycles;
  }

  /**
   * Generate dream content during REM phase.
   * @param {SleepCycle} cycle - Sleep cycle object
   * @param {Array<{content: string}>} recent - Recent memories
   * @param {string} emotionCtx - Emotional context
   * @returns {DreamFragment|null}
   */
  generateDream(cycle, recent = [], emotionCtx = 'neutral') {
    if (cycle.phase !== DreamPhase.REM) {
      return null;
    }

    // Extract memory elements
    const elements = recent
      .slice(0, 6)
      .map(m => (m.content || String(m)).substring(0, 40));

    // Fill template slots
    const A = elements[0] || '模糊影像';
    const B = elements[1] || '未知空间';
    const C = elements[2] || '梦境';

    // Random template selection
    const template = DREAM_TEMPLATES[Math.floor(Math.random() * DREAM_TEMPLATES.length)];
    const text = template.replace('{A}', A).replace('{B}', B).replace('{C}', C);

    // Emotion mapping
    const mappedEmotions = EMOTION_MAP[emotionCtx] || ['neutral', 'confusion'];

    const fragment = {
      id: this._nextId(),
      timestamp: Date.now(),
      content: text,
      emotions: mappedEmotions,
      recombination_type: 'hippocampal_random',
      vividness: 0.4 + Math.random() * 0.5, // 0.4-0.9
    };

    this.dreams.push(fragment);
    return fragment;
  }

  /**
   * Get the latest dream.
   */
  getLatestDream() {
    return this.dreams[this.dreams.length - 1] || null;
  }

  /**
   * Get all dreams.
   */
  getAllDreams() {
    return [...this.dreams];
  }

  /**
   * Get dream report/statistics.
   */
  getReport() {
    if (this.dreams.length === 0) {
      return { total_dreams: 0 };
    }

    const emotionCounts = {};
    for (const e of ALL_EMOTIONS) {
      emotionCounts[e] = 0;
    }
    for (const d of this.dreams) {
      for (const e of d.emotions) {
        emotionCounts[e] = (emotionCounts[e] || 0) + 1;
      }
    }

    const avgVividness = this.dreams.reduce((sum, d) => sum + d.vividness, 0) / this.dreams.length;
    const latest = this.getLatestDream();

    return {
      total_dreams: this.dreams.length,
      avg_vividness: Math.round(avgVividness * 100) / 100,
      latest: latest ? latest.content.substring(0, 100) : null,
      emotions: emotionCounts,
    };
  }

  /**
   * Get sleep cycles.
   */
  getCycles() {
    return [...this.sleepCycles];
  }

  /**
   * Get REM cycles only.
   */
  getRemCycles() {
    return this.sleepCycles.filter(c => c.phase === DreamPhase.REM);
  }

  /**
   * Get stats.
   */
  getStats() {
    return {
      totalDreams: this.dreams.length,
      totalCycles: this.sleepCycles.length,
      remCycles: this.getRemCycles().length,
      latestDream: this.getLatestDream()?.id || null,
      ...this.getReport(),
    };
  }
}

module.exports = { DreamWeaver, DreamPhase };
