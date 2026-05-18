/**
 * HeartBeat — Health Monitoring + Circuit Breaker
 *
 * v1.0.6: Tracks health metrics and implements circuit breaker pattern.
 * Inspired by mark-improving-agent's heartbeat.ts / RollbackManager circuit breaker.
 *
 * Monitors consecutive failures and opens circuit breaker to prevent
 * cascading failures in self-healing.
 *
 * Pure JS, no dependencies, no file I/O.
 */

const DEFAULT_CONFIG = {
  maxDeclines: 3,       // consecutive failures before opening circuit
  threshold: 5.0,      // score below which circuit opens
  cooldownMs: 60000,    // 1 minute cooldown after circuit opens
};

function createHeartBeat(config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  let metrics = [];           // { type, score, timestamp }
  let consecutiveFailures = 0;
  let cooldownUntil = null;   // timestamp when cooldown ends
  let circuitOpen = false;

  function _now() {
    return Date.now();
  }

  /**
   * Record a health metric (e.g., score from heal attempt).
   * Higher score = healthier. Lower = degraded.
   */
  function recordMetric(type, score) {
    metrics.push({ type, score, timestamp: _now() });
    if (metrics.length > 100) {
      metrics = metrics.slice(-100);
    }

    // Update consecutive failures counter
    if (score < cfg.threshold) {
      consecutiveFailures++;
      if (consecutiveFailures >= cfg.maxDeclines && !circuitOpen) {
        circuitOpen = true;
        cooldownUntil = _now() + cfg.cooldownMs;
      }
    } else {
      consecutiveFailures = 0;
      if (circuitOpen && _now() >= cooldownUntil) {
        circuitOpen = false;
      }
    }
  }

  /**
   * Check if circuit breaker is open.
   */
  function isCircuitOpen() {
    if (!circuitOpen) return false;
    // Check if cooldown has expired → attempt half-open
    if (_now() >= cooldownUntil) {
      circuitOpen = false;
      consecutiveFailures = 0;
      return false;
    }
    return true;
  }

  /**
   * Record a successful operation — resets failure counter.
   */
  function recordSuccess() {
    consecutiveFailures = 0;
    circuitOpen = false;
    cooldownUntil = null;
  }

  /**
   * Check if we should attempt healing (circuit not blocking).
   */
  function canHeal() {
    return !isCircuitOpen();
  }

  /**
   * Get current health stats.
   */
  function getStats() {
    const recentMetrics = metrics.slice(-cfg.maxDeclines);
    const allDecreasing = recentMetrics.length >= cfg.maxDeclines &&
      recentMetrics.every((m, i) => i === 0 || m.score <= recentMetrics[i - 1].score);
    const lastScore = metrics.length > 0 ? metrics[metrics.length - 1].score : null;

    return {
      consecutiveFailures,
      circuitOpen: isCircuitOpen(),
      cooldownRemaining_ms: isCircuitOpen() ? Math.max(0, cooldownUntil - _now()) : 0,
      lastScore,
      recentTrend: allDecreasing ? 'declining' : 'stable',
      totalMetrics: metrics.length,
    };
  }

  /**
   * Reset all state.
   */
  function reset() {
    metrics = [];
    consecutiveFailures = 0;
    circuitOpen = false;
    cooldownUntil = null;
  }

  /**
   * Manual trigger circuit open (e.g., after catastrophic failure).
   */
  function trip(durationMs = cfg.cooldownMs) {
    circuitOpen = true;
    cooldownUntil = _now() + durationMs;
    consecutiveFailures = cfg.maxDeclines;
  }

  return {
    recordMetric,
    recordSuccess,
    canHeal,
    isCircuitOpen,
    trip,
    getStats,
    reset,
  };
}

module.exports = { createHeartBeat };
