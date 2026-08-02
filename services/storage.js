// Local Sandbox Storage Manager (chrome.storage.local & localStorage fallback)
// Guarantees zero external server storage of user keys, PATs, or backlog data.

export const STORAGE_KEYS = {
  SETTINGS: 'agile_portal_settings',
  BACKLOG_CACHE: 'agile_portal_backlog_cache'
};

const DEFAULT_SETTINGS = {
  // LLM Configuration (BYOK - Bring Your Own Key)
  llmProvider: 'gemini', // 'gemini' | 'openai' | 'claude'
  llmModel: 'gemini-1.5-flash',
  llmApiKey: '',

  // Backlog Provider Configuration (PAT Based)
  backlogProvider: 'csv', // 'azure_devops' | 'jira' | 'csv'
  adoOrgUrl: '', // e.g. https://dev.azure.com/myorg
  adoProject: '', // e.g. MyProject
  adoPat: '',

  jiraDomain: '', // e.g. mycompany.atlassian.net
  jiraUserEmail: '',
  jiraPat: '' // API Token / PAT
};

/**
 * Load settings from browser local sandbox storage
 */
export async function getSettings() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
        const stored = result[STORAGE_KEYS.SETTINGS] || {};
        resolve({ ...DEFAULT_SETTINGS, ...stored });
      });
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        resolve(stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS });
      } catch (e) {
        resolve({ ...DEFAULT_SETTINGS });
      }
    }
  });
}

/**
 * Save settings to browser local sandbox storage
 */
export async function saveSettings(settings) {
  return new Promise((resolve, reject) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    } else {
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        resolve(true);
      } catch (e) {
        reject(e);
      }
    }
  });
}
