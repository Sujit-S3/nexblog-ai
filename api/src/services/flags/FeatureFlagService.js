import FeatureFlag from '../../models/featureFlag.model.js';

/**
 * FeatureFlagService
 * Manages feature flags across the AI Knowledge & Content Operating System.
 * Supports environment variables, database overrides, user/workspace targeting, and percentage rollouts.
 */
class FeatureFlagService {
  constructor() {
    this.cache = new Map();
    this.cacheTTLMs = 60 * 1000; // 1 minute in-memory cache

    // Default flag configuration for the platform
    this.defaultFlags = {
      aiWorkspace: true,
      knowledgeBase: true,
      workflowStudio: true,
      plugins: true,
      rag: true,
      experimentalModels: false,
      collaboration: false,
      billing: false,
    };
  }

  /**
   * Check if a feature flag is enabled for a given context.
   * @param {string} flagName - Name of the flag (e.g., 'workflowStudio')
   * @param {Object} context - Optional targeting context { userId, workspaceId }
   * @returns {Promise<boolean>}
   */
  async isEnabled(flagName, context = {}) {
    // 1. Check Environment Variable Override (highest precedence for dev ops & emergencies)
    const envKey = `FEATURE_FLAG_${flagName.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`;
    const shortEnvKey = `FF_${flagName.toUpperCase()}`;
    if (process.env[envKey] !== undefined) {
      return process.env[envKey] === 'true' || process.env[envKey] === '1';
    }
    if (process.env[shortEnvKey] !== undefined) {
      return process.env[shortEnvKey] === 'true' || process.env[shortEnvKey] === '1';
    }

    // 2. Check cached or database flag
    const dbFlag = await this._getFlagFromDB(flagName);
    if (dbFlag !== null) {
      if (!dbFlag.enabled) return false;

      // Check user targeting
      if (dbFlag.targetUsers && dbFlag.targetUsers.length > 0) {
        if (!context.userId || !dbFlag.targetUsers.includes(context.userId)) {
          return false;
        }
      }

      // Check workspace targeting
      if (dbFlag.targetWorkspaces && dbFlag.targetWorkspaces.length > 0) {
        if (!context.workspaceId || !dbFlag.targetWorkspaces.includes(context.workspaceId)) {
          return false;
        }
      }

      // Check percentage rollout (deterministic hash based on userId or random if no userId)
      if (dbFlag.rolloutPercentage !== undefined && dbFlag.rolloutPercentage < 100) {
        const hashTarget = context.userId || context.workspaceId || Math.random().toString();
        const hashNum = this._hashString(hashTarget) % 100;
        return hashNum < dbFlag.rolloutPercentage;
      }

      return true;
    }

    // 3. Fallback to default flags
    if (this.defaultFlags[flagName] !== undefined) {
      return this.defaultFlags[flagName];
    }

    // Unknown flag defaults to false for safety
    return false;
  }

  /**
   * Retrieve all feature flags and their evaluation for a given context.
   * Useful for initializing frontend feature toggles on application startup.
   */
  async getAllFlags(context = {}) {
    const allNames = Object.keys(this.defaultFlags);
    const result = {};

    try {
      const dbFlags = await FeatureFlag.find({}).lean();
      for (const flag of dbFlags) {
        if (!allNames.includes(flag.name)) {
          allNames.push(flag.name);
        }
      }
    } catch (err) {
      // If DB fails (e.g. during early startup or connection error), fall back gracefully
      console.warn('⚠️ FeatureFlagService: Could not fetch flags from DB, using defaults.');
    }

    for (const name of allNames) {
      result[name] = await this.isEnabled(name, context);
    }

    return result;
  }

  /**
   * Create or update a database-backed feature flag.
   */
  async setFlag(name, enabled, options = {}) {
    const flag = await FeatureFlag.findOneAndUpdate(
      { name },
      {
        enabled,
        description: options.description || '',
        targetUsers: options.targetUsers || [],
        targetWorkspaces: options.targetWorkspaces || [],
        rolloutPercentage: options.rolloutPercentage !== undefined ? options.rolloutPercentage : 100,
        updatedBy: options.updatedBy || 'system',
      },
      { upsert: true, new: true }
    );

    // Invalidate local cache
    this.cache.delete(name);
    return flag;
  }

  /**
   * Clear in-memory cache.
   */
  clearCache() {
    this.cache.clear();
  }

  async _getFlagFromDB(flagName) {
    const now = Date.now();
    const cached = this.cache.get(flagName);
    if (cached && now - cached.timestamp < this.cacheTTLMs) {
      return cached.data;
    }

    try {
      const flag = await FeatureFlag.findOne({ name: flagName }).lean();
      this.cache.set(flagName, { data: flag || null, timestamp: now });
      return flag || null;
    } catch (err) {
      return null;
    }
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const featureFlagService = new FeatureFlagService();
export default featureFlagService;
