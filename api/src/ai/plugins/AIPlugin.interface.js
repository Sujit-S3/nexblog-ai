/**
 * AIPlugin & AIPluginManifest Interface
 * Standardized manifest and lifecycle contract for pluggable domain tools and extensions.
 */

/**
 * @typedef {Object} AIPluginManifest
 * @property {string} id - Unique plugin identifier (e.g., 'plugin-github-sync')
 * @property {string} name - Human-readable name
 * @property {string} version - Semantic version (e.g., '1.0.0')
 * @property {string} author - Author or organization
 * @property {string[]} permissions - Required system permissions (e.g., ['vector:read', 'ai:execute'])
 * @property {string[]} capabilities - Capabilities exposed (e.g., ['export-markdown', 'sync-repo'])
 * @property {string[]} [dependencies] - Required dependencies
 */

export class AIPluginInterface {
  /**
   * @param {AIPluginManifest} manifest
   */
  constructor(manifest) {
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('AIPluginInterface: manifest must specify id, name, and version');
    }
    this.manifest = manifest;
    this.status = 'uninitialized';
  }

  /**
   * Initialize plugin with system context (e.g., providerFactory, queueManager)
   */
  async initialize(context) {
    this.status = 'ready';
  }

  /**
   * Execute plugin capability
   * @param {string} capability - Name of the capability to invoke
   * @param {Object} params
   */
  async execute(capability, params = {}) {
    throw new Error(`Plugin ${this.manifest.id} does not implement execute() for ${capability}`);
  }

  /**
   * Run diagnostic health probe on plugin dependencies
   * @returns {Promise<{ status: 'healthy' | 'degraded' | 'error', details: Object }>}
   */
  async checkHealth() {
    return { status: 'healthy', details: { id: this.manifest.id } };
  }

  /**
   * Graceful cleanup on system shutdown
   */
  async shutdown() {
    this.status = 'terminated';
  }
}

export default AIPluginInterface;
