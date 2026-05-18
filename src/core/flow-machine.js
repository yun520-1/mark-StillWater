/**
 * FlowMachine — Focus State Tracker
 *
 * v1.0.6: Finite State Machine for tracking focus/flow states.
 * Inspired by mark-improving-agent's FlowMachine.
 *
 * States: idle → initiating → in_flow → distracted | completed | resting
 *
 * Pure JS, no dependencies.
 */

const INITIATING_DURATION_MS = 3000;
const TIMEOUT_MS = 30000;

const STATES = {
  IDLE: 'idle',
  INITIATING: 'initiating',
  IN_FLOW: 'in_flow',
  DISTRACTED: 'distracted',
  COMPLETED: 'completed',
  RESTING: 'resting',
};

const FOCUS_SCORES = {
  [STATES.IDLE]: 0,
  [STATES.INITIATING]: 0.3,
  [STATES.IN_FLOW]: 1.0,
  [STATES.DISTRACTED]: 0.1,
  [STATES.COMPLETED]: 0.5,
  [STATES.RESTING]: 0.2,
};

/**
 * @param {object} config - Optional { initiatingMs, timeoutMs }
 */
function createFlowMachine(config = {}) {
  const initiatingMs = config.initiatingMs || INITIATING_DURATION_MS;
  const timeoutMs = config.timeoutMs || TIMEOUT_MS;

  let state = STATES.IDLE;
  let flowStartTime = null;
  let lastActivityTime = Date.now();
  let initiatingStartTime = null;

  function _checkTimeout() {
    if (state === STATES.IN_FLOW && Date.now() - lastActivityTime > timeoutMs) {
      state = STATES.IDLE;
      flowStartTime = null;
    }
  }

  return {
    /**
     * Get current state (auto-checks timeout).
     */
    getState() {
      _checkTimeout();
      return state;
    },

    /**
     * Transition on event.
     * Events: user_input | distraction | completion | timeout | break
     */
    transition(event) {
      lastActivityTime = Date.now();
      _checkTimeout();

      switch (state) {
        case STATES.IDLE:
          if (event === 'user_input') {
            state = STATES.INITIATING;
            initiatingStartTime = Date.now();
          } else if (event === 'break') {
            state = STATES.RESTING;
          }
          break;

        case STATES.INITIATING:
          if (event === 'distraction' || event === 'timeout') {
            state = STATES.IDLE;
            initiatingStartTime = null;
          } else if (event === 'completion') {
            state = STATES.COMPLETED;
            initiatingStartTime = null;
          } else if (event === 'user_input') {
            if (initiatingStartTime && Date.now() - initiatingStartTime >= initiatingMs) {
              state = STATES.IN_FLOW;
              flowStartTime = Date.now();
              initiatingStartTime = null;
            }
          }
          break;

        case STATES.IN_FLOW:
          if (event === 'distraction') {
            state = STATES.DISTRACTED;
          } else if (event === 'completion') {
            state = STATES.COMPLETED;
          } else if (event === 'break') {
            state = STATES.RESTING;
          }
          flowStartTime = (event !== 'timeout') ? flowStartTime : null;
          if (event === 'timeout') {
            state = STATES.IDLE;
          }
          break;

        case STATES.COMPLETED:
          if (event === 'user_input' || event === 'break') {
            state = STATES.IDLE;
          }
          break;

        case STATES.DISTRACTED:
          if (event === 'user_input') {
            state = STATES.INITIATING;
            initiatingStartTime = Date.now();
          } else if (event === 'break') {
            state = STATES.RESTING;
          }
          break;

        case STATES.RESTING:
          if (event === 'user_input') {
            state = STATES.IDLE;
          }
          break;
      }

      return state;
    },

    /**
     * Get focus score 0-1.
     */
    getFocusScore() {
      _checkTimeout();
      return FOCUS_SCORES[state] ?? 0;
    },

    /**
     * Get ms spent in flow state.
     */
    getFlowDuration() {
      if (state === STATES.IN_FLOW && flowStartTime !== null) {
        return Date.now() - flowStartTime;
      }
      return 0;
    },

    /**
     * Reset to idle.
     */
    reset() {
      state = STATES.IDLE;
      flowStartTime = null;
      lastActivityTime = Date.now();
      initiatingStartTime = null;
    },

    /**
     * Record user input activity.
     */
    recordActivity() {
      lastActivityTime = Date.now();
    },

    /**
     * Get summary stats.
     */
    getStats() {
      _checkTimeout();
      return {
        state,
        focusScore: FOCUS_SCORES[state] ?? 0,
        inFlow: state === STATES.IN_FLOW,
        flowDuration_ms: state === STATES.IN_FLOW && flowStartTime !== null ? Date.now() - flowStartTime : 0,
        idle: state === STATES.IDLE,
      };
    },
  };
}

module.exports = { createFlowMachine, STATES };
