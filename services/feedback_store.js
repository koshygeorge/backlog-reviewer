// Human-in-the-loop (RLHF) Recommendation Feedback Store
// Saves PO acceptances and rejections in local sandbox storage to adapt future prompt context.

const FEEDBACK_KEY = 'agile_portal_recommendation_feedback';

export async function saveFeedback(storyId, recText, status) { // status = 'accepted' | 'dismissed'
  const current = await getFeedbackHistory();
  const entry = {
    storyId,
    recText,
    status,
    timestamp: new Date().toISOString()
  };
  
  current.push(entry);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ [FEEDBACK_KEY]: current });
  } else {
    try {
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(current));
    } catch (e) {}
  }
  return current;
}

export async function getFeedbackHistory() {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get([FEEDBACK_KEY], (res) => {
        resolve(res[FEEDBACK_KEY] || []);
      });
    } else {
      try {
        const stored = localStorage.getItem(FEEDBACK_KEY);
        resolve(stored ? JSON.parse(stored) : []);
      } catch (e) {
        resolve([]);
      }
    }
  });
}
