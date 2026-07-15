import developmentProfile from './development.profile.js';
import testingProfile from './testing.profile.js';
import stagingProfile from './staging.profile.js';
import productionProfile from './production.profile.js';

const profiles = {
  development: developmentProfile,
  testing: testingProfile,
  staging: stagingProfile,
  production: productionProfile,
};

/**
 * ProfileManager
 * Manages deployment profiles (development, testing, staging, production)
 * and exposes unified configuration access across the operating system.
 */
class ProfileManager {
  constructor() {
    this.profiles = profiles;
    this.activeProfileName = this._determineProfileName();
  }

  _determineProfileName() {
    const explicit = process.env.DEPLOYMENT_PROFILE;
    if (explicit && profiles[explicit.toLowerCase()]) {
      return explicit.toLowerCase();
    }

    const env = process.env.NODE_ENV || 'development';
    if (env === 'test') return 'testing';
    if (profiles[env.toLowerCase()]) {
      return env.toLowerCase();
    }

    return 'development';
  }

  /**
   * Get the active deployment profile configuration object.
   */
  getActiveProfile() {
    return this.profiles[this.activeProfileName] || this.profiles.development;
  }

  /**
   * Get the name of the currently active profile.
   */
  getProfileName() {
    return this.activeProfileName;
  }

  /**
   * Retrieve a specific configuration setting by key path (e.g., 'cache.ttlSeconds')
   */
  getConfig(keyPath, defaultValue = undefined) {
    const profile = this.getActiveProfile();
    const parts = keyPath.split('.');
    let current = profile;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  }
}

export const profileManager = new ProfileManager();
export default profileManager;
