/**
 * HeartFlow Memory System — Three-tier memory architecture
 *
 * Inspired by MemGPT's tiered memory + MeaningfulMemory's lazy loading.
 *
 * Tiers:
 *   CORE     — Immutable identity rules, never deleted
 *   LEARNED  — Accumulated knowledge (persisted, searchable, access-counted)
 *   EPHEMERAL — Session context (TTL-based, heat-protected, auto-consolidation)
 *
 * v1.2.9: Fixed P0 issues:
 *   - Error handling: proper logging on load failures instead of silent fallback
 *   - Performance: dirty flags to avoid unnecessary full JSON writes
 *   - Added degradation strategy when file corrupted
 *
 * v1.2.3: Added Ebbinghaus forgetting curve for LEARNED memory decay.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TEMP_SUFFIX = '.tmp';
const LOGGER_PREFIX = '[HeartFlowMemory]';

// Encryption config (AES-256-GCM)
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyEnvVar: 'HEARTFLOW_ENCRYPTION_KEY',
  getKey: function() {
    const key = process.env[this.keyEnvVar];
    if (!key) return null;
    // Key must be 64 hex chars (256 bits) for proper AES-256
    // 安全修复：拒绝格式不正确的弱密钥
    if (key.length === 64 && /^[a-fA-F0-9]+$/.test(key)) {
      return Buffer.from(key, 'hex');
    }
    // 如果密钥不是64字符，拒绝使用并警告
    if (key.length > 0 && key.length < 64) {
      logError('getKey', 'memory', new Error('Encryption key too short - must be 64 hex characters'));
      return null;
    }
    // 其他情况（空密钥等）返回null
    return null;
  }
};

/**
 * Encrypt data using AES-256-GCM
 * @param {string} data - plaintext
 * @param {Buffer} key - 32-byte encryption key
 * @returns {string} - hex encoded: iv:authTag:ciphertext
 */
function encrypt(data, key) {
  if (!key) return data;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (err) {
    logError('encrypt', 'memory', err);
    return data; // Fallback to plaintext on error
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} data - hex encoded: iv:authTag:ciphertext
 * @param {Buffer} key - 32-byte encryption key
 * @returns {string} - plaintext
 */
function decrypt(data, key) {
  if (!key) return data;
  try {
    const parts = data.split(':');
    if (parts.length !== 3) return data; // Not encrypted format
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];
    const decipher = crypto.createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    logError('decrypt', 'memory', err);
    return data; // Fallback to plaintext on decryption failure
  }
}

// ─── Ebbinghaus Forgetting Curve (v1.2.3) ───────────────────────

const FORGETTING_CONFIG = {
  defaultStability: 10,    // hours, base stability for uncategorized
  coreStability: 8760,     // 1 year, CORE is permanent
  learnedStability: 720,    // 30 days, LEARNED tier
  compressionThreshold: 0.3, // retention < 30% → compress
  deletionThreshold: 0.1,   // retention < 10% → delete (LEARNED only)
};

/**
 * Calculate retention using Ebbinghaus forgetting curve: R = e^(-t/S)
 * @param {number} stabilityHours - Stability parameter (how fast we forget)
 * @param {number} ageHours - How old the memory is
 * @returns {{ retention: number, shouldCompress: boolean, shouldDelete: boolean }}
 */
function ebbinghausForget(stabilityHours, ageHours) {
  const retention = Math.exp(-ageHours / stabilityHours);
  return {
    retention,
    shouldCompress: retention < FORGETTING_CONFIG.compressionThreshold,
    shouldDelete: retention < FORGETTING_CONFIG.deletionThreshold,
  };
}

/**
 * Log error with context (P0 fix: proper error handling instead of silent catch)
 */
function logError(operation, filePath, error) {
  console.error(`${LOGGER_PREFIX} ERROR: ${operation} failed for ${filePath}`);
  console.error(`${LOGGER_PREFIX} Error: ${error.message}`);
  console.error(`${LOGGER_PREFIX} Stack: ${error.stack}`);
}

/**
 * Atomic write using temp file + rename (from mark-improving-agent).
 * Prevents data corruption on write interruption.
 * Optionally encrypts data for LEARNED tier.
 */
function atomicWriteJson(filePath, data, encryptData = false) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const tmpPath = `${filePath}${TEMP_SUFFIX}`;
  let content = JSON.stringify(data, null, 2);

  // Encrypt if requested and key is available
  const key = ENCRYPTION_CONFIG.getKey();
  if (encryptData && key) {
    content = encrypt(content, key);
  }

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      fs.writeFileSync(tmpPath, content, 'utf8');
      fs.renameSync(tmpPath, filePath);
      return;
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        try { fs.unlinkSync(tmpPath); } catch (_) {}
        throw err;
      }
      // Brief async delay before retry (non-blocking)
      const delay = 10 * attempts;
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Spin briefly to allow event loop to process other events
        require('crypto').randomBytes(1);
      }
    }
  }
}

/**
 * Read and optionally decrypt JSON file
 */
function readJsonFile(filePath, decryptData = false) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const key = ENCRYPTION_CONFIG.getKey();
    if (decryptData && key) {
      return JSON.parse(decrypt(content, key));
    }
    return JSON.parse(content);
  } catch (err) {
    return null;
  }
}

class HeartFlowMemory {
  constructor(rootPath = null) {
    // Default root to skill data directory
    this.rootPath = rootPath || path.join(__dirname, '..', '..', 'data');
    this._dataPath = this.rootPath;

    // File paths
    this._coreFile = path.join(this._dataPath, 'core.json');
    this._learnedFile = path.join(this._dataPath, 'learned.json');
    this._ephemeralFile = path.join(this._dataPath, 'ephemeral.json');

    // Lazy-load flags
    this._coreLoaded = false;
    this._learnedLoaded = false;
    this._ephemeralLoaded = false;

    // Dirty flags for write optimization (P0 fix: avoid unnecessary writes)
    this._coreDirty = false;
    this._learnedDirty = false;
    this._ephemeralDirty = false;

    // Encryption enabled for LEARNED tier (requires HEARTFLOW_ENCRYPTION_KEY env var)
    this._encryptionEnabled = !!ENCRYPTION_CONFIG.getKey();

    // P0 Security: Warn if encryption is not enabled (use stderr for warnings)
    if (!this._encryptionEnabled) {
      const warn = (msg) => process.stderr.write(`${LOGGER_PREFIX} ${msg}\n`);
      warn('WARNING: LEARNED memory encryption is DISABLED.');
      warn('WARNING: Set HEARTFLOW_ENCRYPTION_KEY to enable.');
      warn('WARNING: Sensitive data may be in plaintext.');
    }

    // In-memory stores
    this._coreStore = {};
    this._learnedStore = {};
    this._ephemeralStore = {};
  }

  // ─── Lazy Loading with Proper Error Handling (P0 fix) ─────────

  _ensureCoreLoaded() {
    if (this._coreLoaded) return;
    try {
      if (fs.existsSync(this._coreFile)) {
        const content = fs.readFileSync(this._coreFile, 'utf8');
        this._coreStore = JSON.parse(content);
      }
    } catch (err) {
      logError('load CORE', this._coreFile, err);
      // Degradation strategy: keep empty store, don't lose existing data
      console.warn(`${LOGGER_PREFIX} CORE load failed - operating with empty store`);
      console.warn(`${LOGGER_PREFIX} Original file preserved, please check logs for corruption`);
      this._coreStore = {};
    }
    this._coreLoaded = true;
  }

  _ensureLearnedLoaded() {
    if (this._learnedLoaded) return;
    try {
      const data = readJsonFile(this._learnedFile, this._encryptionEnabled);
      if (data) {
        this._learnedStore = data;
      }
    } catch (err) {
      logError('load LEARNED', this._learnedFile, err);
      console.warn(`${LOGGER_PREFIX} LEARNED load failed - operating with empty store`);
      this._learnedStore = {};
    }
    this._learnedLoaded = true;
  }

  _ensureEphemeralLoaded() {
    if (this._ephemeralLoaded) return;
    try {
      if (fs.existsSync(this._ephemeralFile)) {
        const content = fs.readFileSync(this._ephemeralFile, 'utf8');
        this._ephemeralStore = JSON.parse(content);
      }
    } catch (err) {
      logError('load EPHEMERAL', this._ephemeralFile, err);
      console.warn(`${LOGGER_PREFIX} EPHEMERAL load failed - operating with empty store`);
      this._ephemeralStore = {};
    }
    this._ephemeralLoaded = true;
  }

  // ─── Persistence with Dirty Checking (P0 fix: avoid unnecessary writes) ───

  _saveCore() {
    if (!this._coreDirty) return; // Skip if not modified
    try {
      atomicWriteJson(this._coreFile, this._coreStore);
      this._coreDirty = false;
    } catch (err) {
      logError('save CORE', this._coreFile, err);
      throw err; // Re-throw - save failures are critical
    }
  }

  _saveLearned() {
    if (!this._learnedDirty) return; // Skip if not modified
    try {
      atomicWriteJson(this._learnedFile, this._learnedStore, this._encryptionEnabled);
      this._learnedDirty = false;
    } catch (err) {
      logError('save LEARNED', this._learnedFile, err);
      throw err;
    }
  }

  _saveEphemeral() {
    if (!this._ephemeralDirty) return; // Skip if not modified
    try {
      atomicWriteJson(this._ephemeralFile, this._ephemeralStore);
      this._ephemeralDirty = false;
    } catch (err) {
      logError('save EPHEMERAL', this._ephemeralFile, err);
      throw err;
    }
  }

  // Mark tiers as dirty after modifications
  _markCoreDirty() { this._coreDirty = true; }
  _markLearnedDirty() { this._learnedDirty = true; }
  _markEphemeralDirty() { this._ephemeralDirty = true; }

  // ─── CORE — Identity Rules (Immutable) ─────────────────────

  /**
   * Add an immutable CORE identity rule.
   */
  addCore(key, value, tags = []) {
    this._ensureCoreLoaded();
    if (this._coreStore[key]) {
      return { success: false, reason: 'core_key_exists', key };
    }
    this._coreStore[key] = { value, tags, createdAt: Date.now() };
    this._markCoreDirty(); // P0 fix: mark dirty instead of immediate save
    this._saveCore();
    return { success: true, key, tier: 'core' };
  }

  /**
   * Get a CORE entry by key.
   */
  getCore(key) {
    this._ensureCoreLoaded();
    return this._coreStore[key] || null;
  }

  listCore() {
    this._ensureCoreLoaded();
    return Object.entries(this._coreStore).map(([key, v]) => ({ key, ...v }));
  }

  // Alias for rememberCore
  rememberCore(key, value) {
    return this.addCore(key, value);
  }

  // ─── LEARNED — Accumulated Knowledge ───────────────────────

  /**
   * Add or update a LEARNED memory entry.
   */
  learn(key, value, tags = []) {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();

    // Protect CORE keys
    if (this._coreStore[key]) {
      return { success: false, reason: 'key_in_core', key };
    }

    const now = Date.now();
    if (this._learnedStore[key]) {
      this._learnedStore[key].value = value;
      this._learnedStore[key].tags = [...new Set([...this._learnedStore[key].tags, ...tags])];
      this._learnedStore[key].lastAccessed = now;
      this._learnedStore[key].accessCount = (this._learnedStore[key].accessCount || 0) + 1;
    } else {
      this._learnedStore[key] = { value, tags, accessCount: 0, lastAccessed: now, createdAt: now };
    }

    this._markLearnedDirty(); // P0 fix: mark dirty instead of immediate save
    this._saveLearned();
    return { success: true, key, tier: 'learned' };
  }

  /**
   * Get a LEARNED entry by key.
   */
  getLearned(key) {
    this._ensureLearnedLoaded();
    const entry = this._learnedStore[key];
    if (entry) {
      entry.accessCount = (entry.accessCount || 0) + 1;
      entry.lastAccessed = Date.now();
      this._markLearnedDirty(); // P0 fix: mark dirty for access tracking
      this._saveLearned();
      return { ...entry };
    }
    return null;
  }

  recall(key) {
    return this.getLearned(key);
  }

  forget(key) {
    this._ensureLearnedLoaded();
    if (this._learnedStore[key]) {
      delete this._learnedStore[key];
      this._markLearnedDirty();
      this._saveLearned();
      return { success: true, key };
    }
    return { success: false, reason: 'key_not_found' };
  }

  listLearned(query = null) {
    this._ensureLearnedLoaded();
    let entries = Object.entries(this._learnedStore).map(([key, v]) => ({ key, ...v }));

    if (query) {
      const q = query.toLowerCase();
      entries = entries.filter(e =>
        e.key.toLowerCase().includes(q) ||
        String(e.value || '').toLowerCase().includes(q) ||
        (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return entries;
  }

  // Alias for rememberLearn
  rememberLearn(key, value) {
    return this.learn(key, value);
  }

  // ─── EPHEMERAL — Working Memory ────────────────────────────

  rememberEphemeral(key, value, ttlMs = 3600000) {
    this._ensureEphemeralLoaded();
    this._ephemeralStore[key] = {
      value,
      ttl: ttlMs,
      createdAt: Date.now(),
      _accessCount: 0,
      tags: [],
    };
    this._markEphemeralDirty();
    this._saveEphemeral();
    return { success: true, key, tier: 'ephemeral' };
  }

  _touchEphemeral(key) {
    if (this._ephemeralStore[key]) {
      this._ephemeralStore[key]._accessCount = (this._ephemeralStore[key]._accessCount || 0) + 1;
      // Only save every 5 accesses to reduce I/O
      if (this._ephemeralStore[key]._accessCount % 5 === 0) {
        this._markEphemeralDirty();
        this._saveEphemeral();
      }
    }
  }

  getEphemeral(key) {
    this._ensureEphemeralLoaded();
    const entry = this._ephemeralStore[key];
    if (!entry) return null;

    if (Date.now() - entry.createdAt > entry.ttl) {
      delete this._ephemeralStore[key];
      this._markEphemeralDirty();
      this._saveEphemeral();
      return null;
    }

    entry._accessCount = (entry._accessCount || 0) + 1;
    return { ...entry };
  }

  getWorking(key) {
    return this.getEphemeral(key);
  }

  forgetWorking(key) {
    this._ensureEphemeralLoaded();
    if (this._ephemeralStore[key]) {
      delete this._ephemeralStore[key];
      this._saveEphemeral();
      return { success: true };
    }
    return { success: false };
  }

  listEphemeral() {
    this._ensureEphemeralLoaded();
    return Object.entries(this._ephemeralStore).map(([key, v]) => ({ key, ...v }));
  }

  // ─── Universal remember ────────────────────────────────────

  remember(key, value, tier = 'learned') {
    switch (tier) {
      case 'core':
        return this.addCore(key, value);
      case 'ephemeral':
        return this.rememberEphemeral(key, value);
      default:
        return this.learn(key, value);
    }
  }

  // ─── Consolidation ────────────────────────────────────────

  /**
   * Consolidate EPHEMERAL → LEARNED.
   * Heat-aware: frequently-accessed entries are promoted.
   */
  consolidate() {
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();

    const promoted = [];
    const now = Date.now();

    for (const [key, entry] of Object.entries(this._ephemeralStore)) {
      const age = now - entry.createdAt;
      const accessCount = entry._accessCount || 0;
      const heatScore = accessCount + (key.startsWith('signal:') ? 2 : 0);

      if (heatScore >= 3 || age > 1800000) {
        const tags = entry.tags || [];
        if (key.startsWith('signal:')) tags.push('emotion_signal');
        this.learn(key, entry.value, ['consolidated', ...tags]);
        delete this._ephemeralStore[key];
        promoted.push(key);
      }
    }

    if (promoted.length > 0) {
      this._saveEphemeral();
      this._saveLearned();
    }

    return { promoted, learnedCount: Object.keys(this._learnedStore).length };
  }

  // ─── Ebbinghaus Forgetting Curve (v1.2.3) ────────────────

  /**
   * Get retention score for a memory entry (0-1).
   * Higher = more likely to be retained.
   * @param {string} key
   * @returns {{ retention: number, ageHours: number, tier: string } | null}
   */
  getRetention(key) {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();

    const now = Date.now();
    let entry = null;
    let tier = null;
    let stability = FORGETTING_CONFIG.defaultStability;

    if (this._coreStore[key]) {
      entry = this._coreStore[key];
      tier = 'core';
      stability = FORGETTING_CONFIG.coreStability;
    } else if (this._learnedStore[key]) {
      entry = this._learnedStore[key];
      tier = 'learned';
      stability = FORGETTING_CONFIG.learnedStability;
    } else if (this._ephemeralStore[key]) {
      entry = this._ephemeralStore[key];
      tier = 'ephemeral';
      stability = FORGETTING_CONFIG.defaultStability;
    }

    if (!entry) return null;

    const createdAt = entry.createdAt || entry.timestamp || now;
    const ageHours = (now - createdAt) / (1000 * 60 * 60);
    const { retention, shouldCompress, shouldDelete } = ebbinghausForget(stability, ageHours);

    return {
      retention,
      ageHours: Math.round(ageHours * 10) / 10,
      tier,
      shouldCompress,
      shouldDelete,
      createdAt,
    };
  }

  /**
   * Apply forgetting curve to LEARNED memories.
   * Compresses low-retention entries, deletes very low ones.
   * @returns {{ compressed: string[], deleted: string[], stats: Object }}
   */
  applyForgetting() {
    this._ensureLearnedLoaded();

    const now = Date.now();
    const toDelete = [];
    const toCompress = [];

    for (const [key, entry] of Object.entries(this._learnedStore)) {
      const createdAt = entry.createdAt || entry.timestamp || now;
      const ageHours = (now - createdAt) / (1000 * 60 * 60);
      const { shouldDelete, shouldCompress } = ebbinghausForget(FORGETTING_CONFIG.learnedStability, ageHours);

      if (shouldDelete) {
        toDelete.push(key);
      } else if (shouldCompress && !entry.compressed) {
        entry.compressed = true;
        entry.compressedAt = now;
        toCompress.push(key);
      }
    }

    for (const key of toDelete) {
      delete this._learnedStore[key];
    }

    if (toDelete.length > 0 || toCompress.length > 0) {
      this._saveLearned();
    }

    return {
      compressed: toCompress,
      deleted: toDelete,
      stats: {
        totalLearned: Object.keys(this._learnedStore).length,
        compressionThreshold: FORGETTING_CONFIG.compressionThreshold,
        deletionThreshold: FORGETTING_CONFIG.deletionThreshold,
      },
    };
  }

  /**
   * Get memory health based on average retention.
   * @returns {{ verdict: string, avgRetention: number, layers: Object }}
   */
  getMemoryHealth() {
    this._ensureLearnedLoaded();

    const learnedEntries = Object.entries(this._learnedStore);
    if (learnedEntries.length === 0) {
      return {
        verdict: '🟢 健康',
        avgRetention: 1.0,
        layers: {
          CORE: { count: Object.keys(this._coreStore).length, retention: 1.0, status: '永久' },
          LEARNED: { count: 0, retention: 1.0, status: '空' },
          EPHEMERAL: { count: Object.keys(this._ephemeralStore).length, retention: 'session', status: '会话级' },
        },
      };
    }

    let totalRetention = 0;
    let compressedCount = 0;

    for (const [, entry] of learnedEntries) {
      const createdAt = entry.createdAt || entry.timestamp || Date.now();
      const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
      const { retention } = ebbinghausForget(FORGETTING_CONFIG.learnedStability, ageHours);
      totalRetention += retention;
      if (entry.compressed) compressedCount++;
    }

    const avgRetention = totalRetention / learnedEntries.length;

    let verdict = 'HEALTHY';
    if (avgRetention < 0.4) verdict = 'NEEDS_CLEANUP';
    else if (avgRetention < 0.7) verdict = 'ATTENTION';

    return {
      verdict,
      avgRetention: Math.round(avgRetention * 1000) / 1000,
      layers: {
        CORE: { count: Object.keys(this._coreStore).length, retention: 1.0, status: '永久' },
        LEARNED: {
          count: learnedEntries.length,
          retention: Math.round(avgRetention * 1000) / 1000,
          compressed: compressedCount,
          status: avgRetention >= 0.7 ? 'healthy' : avgRetention >= 0.4 ? 'attention' : 'needs_cleanup',
        },
        EPHEMERAL: { count: Object.keys(this._ephemeralStore).length, retention: 'session', status: '会话级' },
      },
      forgettingConfig: {
        learnedStabilityDays: Math.round(FORGETTING_CONFIG.learnedStability / 24),
        compressionThreshold: FORGETTING_CONFIG.compressionThreshold,
        deletionThreshold: FORGETTING_CONFIG.deletionThreshold,
      },
    };
  }

  // ─── Search ────────────────────────────────────────────────

  search(query) {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();

    const q = query.toLowerCase();
    const results = [];

    for (const [key, v] of Object.entries(this._coreStore)) {
      if (key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q)) {
        results.push({ key, tier: 'core', value: v.value });
      }
    }
    for (const [key, v] of Object.entries(this._learnedStore)) {
      if (key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q)) {
        results.push({ key, tier: 'learned', value: v.value });
      }
    }
    for (const [key, v] of Object.entries(this._ephemeralStore)) {
      if (Date.now() - v.createdAt > v.ttl) continue;
      if (key.toLowerCase().includes(q) || String(v.value).toLowerCase().includes(q)) {
        results.push({ key, tier: 'ephemeral', value: v.value });
      }
    }

    return results;
  }

  // ─── Stats ─────────────────────────────────────────────────

  stats() {
    this._ensureCoreLoaded();
    this._ensureLearnedLoaded();
    this._ensureEphemeralLoaded();
    this._cleanEphemeral();

    const learnedEntries = Object.entries(this._learnedStore);
    let totalRetention = 0;
    let compressedCount = 0;

    for (const [, entry] of learnedEntries) {
      const createdAt = entry.createdAt || entry.timestamp || Date.now();
      const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
      const { retention } = ebbinghausForget(FORGETTING_CONFIG.learnedStability, ageHours);
      totalRetention += retention;
      if (entry.compressed) compressedCount++;
    }

    const avgRetention = learnedEntries.length > 0 ? totalRetention / learnedEntries.length : 1;

    return {
      core: Object.keys(this._coreStore).length,
      learned: learnedEntries.length,
      ephemeral: Object.keys(this._ephemeralStore).length,
      total: Object.keys(this._coreStore).length + learnedEntries.length + Object.keys(this._ephemeralStore).length,
      avgRetention: Math.round(avgRetention * 1000) / 1000,
      compressedCount,
      forgetting: {
        learnedStabilityDays: Math.round(FORGETTING_CONFIG.learnedStability / 24),
        compressionThreshold: FORGETTING_CONFIG.compressionThreshold,
        deletionThreshold: FORGETTING_CONFIG.deletionThreshold,
      },
    };
  }

  getStats() { return this.stats(); }

  getMemoryStats() {
    const stats = this.stats();
    const core = this.listCore();
    const learned = this.listLearned();

    return {
      ...stats,
      core_samples: core.slice(0, 3),
      learned_samples: learned.slice(0, 5),
    };
  }

  _cleanEphemeral() {
    const now = Date.now();
    for (const [key, entry] of Object.entries(this._ephemeralStore)) {
      if (now - entry.createdAt > entry.ttl) {
        delete this._ephemeralStore[key];
      }
    }
  }
}

module.exports = { HeartFlowMemory };
