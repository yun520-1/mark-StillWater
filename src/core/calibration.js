/**
 * Calibration v1.2.5 — Confidence Calibration Tracker
 *
 * Based on: 牛津科普读本(第一辑) - 农药论争
 * Key insight: "绝对确定性是不可能的，我们用概率来工作"
 *
 * Tracks AI confidence calibration:
 *   - Record predictions with confidence
 *   - Track actual outcomes
 *   - Compute calibration score (predicted vs actual)
 *   - Detect over/under-confidence patterns
 *
 * v1.2.5: Initial implementation
 */

const CALIBRATION_BINS = 10; // 0-0.1, 0.1-0.2, ..., 0.9-1.0

/**
 * @typedef {Object} Prediction
 * @property {string} id
 * @property {number} timestamp
 * @property {string} statement - What was predicted
 * @property {number} confidence - 0-1
 * @property {string} outcome - 'true' | 'false' | 'unknown'
 * @property {boolean|null} correct - outcome === expected
 * @property {string} domain - e.g. 'fact', 'prediction', 'judgment'
 */

/**
 * @typedef {Object} CalibrationStats
 * @property {number} totalPredictions
 * @property {number} correctPredictions
 * @property {number} calibrationScore - 0-1 (1 = perfectly calibrated)
 * @property {Object} binStats - confidence bin breakdown
 * @property {string} biasType - 'overconfident' | 'underconfident' | 'well_calibrated'
 */

class Calibration {
  constructor() {
    this._predictions = [];
    this._counter = 0;
  }

  /**
   * Record a prediction with confidence.
   * @param {string} statement - What was predicted
   * @param {number} confidence - 0-1
   * @param {string} domain - category
   * @returns {Prediction}
   */
  predict(statement, confidence, domain = 'judgment') {
    const prediction = {
      id: `pred_${Date.now()}_${++this._counter}`,
      timestamp: Date.now(),
      statement: statement.substring(0, 200),
      confidence: Math.max(0, Math.min(1, confidence)),
      domain,
      outcome: 'pending',
      correct: null,
      expected: null,
    };
    this._predictions.push(prediction);
    return prediction;
  }

  /**
   * Record the outcome of a prediction.
   * @param {string} id - prediction id
   * @param {boolean} correct - was the prediction correct?
   */
  resolve(id, correct) {
    const pred = this._predictions.find(p => p.id === id);
    if (!pred) return null;

    pred.outcome = correct ? 'true' : 'false';
    pred.correct = correct;
    pred.resolvedAt = Date.now();
    return pred;
  }

  /**
   * Resolve the most recent pending prediction.
   * @param {boolean} correct
   */
  resolveLast(correct) {
    const pending = this._predictions.filter(p => p.outcome === 'pending');
    if (pending.length === 0) return null;
    const last = pending[pending.length - 1];
    return this.resolve(last.id, correct);
  }

  /**
   * Compute calibration score using Brier score approach.
   * Calibration = how well confidence matched outcomes.
   * @returns {CalibrationStats}
   */
  getStats() {
    const resolved = this._predictions.filter(p => p.outcome !== 'pending');
    const total = resolved.length;

    if (total === 0) {
      return {
        totalPredictions: 0,
        correctPredictions: 0,
        calibrationScore: null,
        biasType: 'no_data',
        binStats: {},
      };
    }

    const correct = resolved.filter(p => p.correct).length;

    // Brier score: mean of (confidence - outcome)^2
    // Lower is better, 0 = perfect
    let brierSum = 0;
    for (const p of resolved) {
      const outcome = p.correct ? 1 : 0;
      brierSum += Math.pow(p.confidence - outcome, 2);
    }
    const brierScore = brierSum / total;

    // Calibration score: 1 - brierScore (higher is better)
    const calibrationScore = Math.max(0, 1 - brierScore * 2); // scaled to 0-1

    // Per-bin analysis for bias detection
    const binStats = this._computeBinStats(resolved);

    // Determine bias type
    const avgConfidence = resolved.reduce((sum, p) => sum + p.confidence, 0) / total;
    const actualAccuracy = correct / total;
    const bias = avgConfidence - actualAccuracy;

    let biasType = 'well_calibrated';
    if (bias > 0.1) biasType = 'overconfident';
    else if (bias < -0.1) biasType = 'underconfident';

    return {
      totalPredictions: total,
      correctPredictions: correct,
      accuracy: Math.round((correct / total) * 100) / 100,
      calibrationScore: Math.round(calibrationScore * 100) / 100,
      brierScore: Math.round(brierScore * 1000) / 1000,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      actualAccuracy,
      bias: Math.round(bias * 100) / 100,
      biasType,
      binStats,
    };
  }

  /**
   * Compute per-bin statistics.
   * @param {Prediction[]} predictions
   * @returns {Object}
   */
  _computeBinStats(predictions) {
    const bins = {};
    for (let i = 0; i < CALIBRATION_BINS; i++) {
      bins[i] = { count: 0, correct: 0, avgConfidence: 0 };
    }

    for (const p of predictions) {
      const binIdx = Math.min(CALIBRATION_BINS - 1, Math.floor(p.confidence * CALIBRATION_BINS));
      bins[binIdx].count++;
      if (p.correct) bins[binIdx].correct++;
      bins[binIdx].avgConfidence += p.confidence;
    }

    const result = {};
    for (let i = 0; i < CALIBRATION_BINS; i++) {
      const bin = bins[i];
      const rangeStart = i / CALIBRATION_BINS;
      const rangeEnd = (i + 1) / CALIBRATION_BINS;
      const accuracy = bin.count > 0 ? bin.correct / bin.count : null;

      result[`${Math.round(rangeStart * 100)}-${Math.round(rangeEnd * 100)}`] = {
        count: bin.count,
        accuracy,
        expectedAccuracy: Math.round(((rangeStart + rangeEnd) / 2) * 100) / 100,
        calibrationError: accuracy !== null ? Math.abs(accuracy - (rangeStart + rangeEnd) / 2) : null,
      };
    }
    return result;
  }

  /**
   * Get predictions by domain.
   * @param {string} domain
   * @returns {Prediction[]}
   */
  getByDomain(domain) {
    return this._predictions.filter(p => p.domain === domain);
  }

  /**
   * Get recent predictions.
   * @param {number} count
   * @returns {Prediction[]}
   */
  getRecent(count = 20) {
    return this._predictions.slice(-count);
  }

  /**
   * Get pending predictions.
   * @returns {Prediction[]}
   */
  getPending() {
    return this._predictions.filter(p => p.outcome === 'pending');
  }

  /**
   * Compute calibration for a specific domain.
   * @param {string} domain
   * @returns {Object}
   */
  getDomainStats(domain) {
    const domainPreds = this._predictions.filter(p => p.domain === domain && p.outcome !== 'pending');
    if (domainPreds.length === 0) return { domain, predictions: 0 };

    const correct = domainPreds.filter(p => p.correct).length;
    const avgConfidence = domainPreds.reduce((sum, p) => sum + p.confidence, 0) / domainPreds.length;

    return {
      domain,
      predictions: domainPreds.length,
      correct,
      accuracy: Math.round((correct / domainPreds.length) * 100) / 100,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      bias: Math.round((avgConfidence - correct / domainPreds.length) * 100) / 100,
    };
  }

  /**
   * Reset predictions (keep resolved stats).
   */
  reset() {
    const resolved = this._predictions.filter(p => p.outcome !== 'pending');
    this._predictions = resolved;
  }

  /**
   * Clear all predictions.
   */
  clear() {
    this._predictions = [];
    this._counter = 0;
  }
}

module.exports = { Calibration };
