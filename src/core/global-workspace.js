/**
 * GlobalWorkspace — Consciousness Broadcasting Mechanism
 *
 * v1.0.7: Inspired by Baars' Global Workspace Theory (1988, 1997).
 * In GWT, consciousness arises when information is broadcast to all cognitive
 * subsystems through a shared "global workspace" — making it accessible for
 * reasoning, memory, and action selection.
 *
 * Key concepts absorbed from papers in papers.zip:
 *   - Information broadcasting to all modules (Baars GWT)
 *   - Conscious access = global availability of locally processed info
 *   - Attention filters what enters the workspace
 *   - Unconscious processing can become conscious through broadcasting
 *
 * Pure JS, no dependencies.
 */

class GlobalWorkspace {
  constructor() {
    this._workspace = [];       // current broadcast content
    this._history = [];         // past broadcasts
    this._subscribers = new Map(); // module -> callback
    this._attention = null;     // currently attended content
    this._MAX_HISTORY = 50;
    this._MAX_WORKSPACE = 5;    // max items in workspace at once
  }

  /**
   * Subscribe a module to broadcast updates.
   */
  subscribe(moduleName, callback) {
    this._subscribers.set(moduleName, callback);
  }

  /**
   * Unsubscribe a module.
   */
  unsubscribe(moduleName) {
    this._subscribers.delete(moduleName);
  }

  /**
   * Process incoming information — decide if it enters workspace.
   * Returns whether it was broadcast.
   */
  process(content, importance = 0.5, source = 'unknown') {
    // Attention threshold: only significant content gets broadcast
    if (importance < 0.3) return false;

    // Deduplicate
    if (this._workspace.some(w => w.content === content)) return false;

    const entry = {
      content,
      importance,
      source,
      timestamp: Date.now(),
      broadcastCount: 0,
    };

    this._workspace.push(entry);

    // Keep workspace bounded
    if (this._workspace.length > this._MAX_WORKSPACE) {
      this._workspace.shift();
    }

    // Set as attended if high importance
    if (importance > 0.7) {
      this._attention = entry;
    }

    // Broadcast to all subscribers
    this._broadcast(entry);

    // Add to history
    this._history.push(entry);
    if (this._history.length > this._MAX_HISTORY) {
      this._history.shift();
    }

    return true;
  }

  /**
   * Broadcast entry to all subscribed modules.
   */
  _broadcast(entry) {
    entry.broadcastCount++;
    for (const [moduleName, callback] of this._subscribers) {
      try {
        callback(entry, moduleName);
      } catch (_) {
        // Subscriber error — skip
      }
    }
  }

  /**
   * Get current workspace contents.
   */
  getWorkspace() {
    return [...this._workspace];
  }

  /**
   * Get currently attended content.
   */
  getAttention() {
    return this._attention || null;
  }

  /**
   * Set attended content (e.g., from FlowMachine focus).
   */
  attend(content) {
    const found = this._workspace.find(w => w.content === content);
    if (found) {
      this._attention = found;
    }
  }

  /**
   * Get broadcast history.
   */
  getHistory(count = 20) {
    return this._history.slice(-count).reverse();
  }

  /**
   * Clear workspace.
   */
  clear() {
    this._workspace = [];
    this._attention = null;
  }

  /**
   * Get summary stats.
   */
  getStats() {
    return {
      workspaceSize: this._workspace.length,
      historySize: this._history.length,
      subscriberCount: this._subscribers.size,
      hasAttention: this._attention !== null,
      attentionContent: this._attention?.content?.substring(0, 50) || null,
      topImportance: this._workspace.length > 0
        ? Math.max(...this._workspace.map(w => w.importance))
        : 0,
    };
  }
}

module.exports = { GlobalWorkspace };
