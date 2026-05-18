/**
 * SleepStages v1.1.0 — Sleep Cycle Simulator
 *
 * Simulates human sleep NREM/REM cycle structure (~90 min/cycle):
 *   NREM1(5%) -> NREM2(45%) -> NREM3(25%) -> NREM2(15%) -> REM(10%)
 *
 * Night progression:
 *   - Deep sleep (NREM3) ratio decreases
 *   - REM ratio increases
 *
 * Based on: daima/templates/dream/sleep_cycle_simulator.py
 * v1.1.0: Initial implementation
 */

const SleepStage = {
  WAKE: 'wake',
  NREM1: 'nrem1',   // Light sleep - memory filtering
  NREM2: 'nrem2',   // Moderate - spindle consolidation
  NREM3: 'nrem3',   // Deep slow-wave - hippocampal->cortical transfer
  REM: 'rem',       // Dreaming - emotional/procedural integration
};

const CYCLE_MIN = 90;

const STAGE_DURATIONS = {
  [SleepStage.NREM1]: 0.05,
  [SleepStage.NREM2]: 0.45,
  [SleepStage.NREM3]: 0.25,
  [SleepStage.REM]: 0.10,
};

const MEMORY_ACTIVITY = {
  [SleepStage.NREM1]: 'memory_filtering',
  [SleepStage.NREM2]: 'spindle_consolidation',
  [SleepStage.NREM3]: 'slow_wave_transfer',
  [SleepStage.REM]: 'emotional_integration',
};

const BRAIN_REGION = {
  [SleepStage.NREM1]: 'thalamus',
  [SleepStage.NREM2]: 'thalamus_cortex',
  [SleepStage.NREM3]: 'hippocampus_cortex',
  [SleepStage.REM]: 'limbic_cortex',
};

/**
 * @typedef {Object} SleepEpoch
 * @property {string} stage
 * @property {number} duration_sec
 * @property {number} start_time
 * @property {string} memory_activity
 * @property {string} brain_region
 */

class SleepStages {
  constructor() {
    this.epochs = [];
    this._callbacks = {};
    for (const stage of Object.values(SleepStage)) {
      this._callbacks[stage] = [];
    }
  }

  /**
   * Register callback for stage transitions.
   */
  on(stage, callback) {
    if (this._callbacks[stage]) {
      this._callbacks[stage].push(callback);
    }
  }

  /**
   * Simulate sleep cycles.
   * @param {number} numCycles - Number of 90-min cycles to simulate
   * @returns {SleepEpoch[]}
   */
  simulate(numCycles = 5) {
    this.epochs = [];
    let t = Date.now();

    for (let cycleN = 0; cycleN < numCycles; cycleN++) {
      // Night regulation: less deep sleep, more REM as night progresses
      const depthRatio = Math.max(0.3, 1.0 - cycleN * 0.12);
      const remRatio = Math.min(0.28, 0.10 + cycleN * 0.04);

      const stageDurations = [
        [SleepStage.NREM1, 0.05],
        [SleepStage.NREM2, 0.45],
        [SleepStage.NREM3, 0.25 * depthRatio],
        [SleepStage.NREM2, 0.15],
        [SleepStage.REM, remRatio],
      ];

      for (const [stage, ratio] of stageDurations) {
        const durMs = ratio * CYCLE_MIN * 60 * 1000;
        const epoch = {
          stage,
          duration_sec: ratio * CYCLE_MIN * 60,
          start_time: t,
          memory_activity: MEMORY_ACTIVITY[stage] || 'none',
          brain_region: BRAIN_REGION[stage] || 'global',
        };
        this.epochs.push(epoch);

        // Fire callbacks
        for (const cb of this._callbacks[stage] || []) {
          cb(epoch);
        }

        t += durMs;
      }
    }

    return this.epochs;
  }

  /**
   * Get current stage for a given time offset.
   */
  getStageAt(offsetMs) {
    let accumulated = 0;
    for (const epoch of this.epochs) {
      accumulated += epoch.duration_sec * 1000;
      if (offsetMs <= accumulated) {
        return epoch;
      }
    }
    return this.epochs[this.epochs.length - 1] || null;
  }

  /**
   * Get summary statistics.
   */
  getSummary() {
    const byStage = {};
    for (const s of Object.values(SleepStage)) {
      byStage[s] = 0;
    }

    for (const e of this.epochs) {
      byStage[e.stage] = (byStage[e.stage] || 0) + e.duration_sec / 60;
    }

    const totalCycles = Math.floor(this.epochs.length / 5);
    const totalSleepMin = Object.values(byStage)
      .filter((_, k) => k !== SleepStage.WAKE)
      .reduce((a, b) => a + b, 0);

    return {
      total_cycles: totalCycles,
      stage_minutes: Object.fromEntries(
        Object.entries(byStage).map(([k, v]) => [k, Math.round(v * 10) / 10])
      ),
      total_sleep_min: Math.round(totalSleepMin * 10) / 10,
    };
  }

  /**
   * Get all epochs.
   */
  getEpochs() {
    return [...this.epochs];
  }

  /**
   * Get epochs by stage.
   */
  getEpochsByStage(stage) {
    return this.epochs.filter(e => e.stage === stage);
  }

  /**
   * Get stats.
   */
  getStats() {
    return {
      totalEpochs: this.epochs.length,
      totalCycles: Math.floor(this.epochs.length / 5),
      callbackCounts: Object.fromEntries(
        Object.entries(this._callbacks).map(([k, v]) => [k, v.length])
      ),
    };
  }
}

module.exports = { SleepStages, SleepStage };
