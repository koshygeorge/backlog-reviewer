// Admin Passcode Authentication & Session Manager
// Locks sensitive VC commercialization metrics behind admin verification.

const DEFAULT_ADMIN_PASSCODE = 'admin123';
const SESSION_KEY = 'agile_portal_admin_session';

export function checkAdminSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

export function verifyAdminPasscode(inputPasscode) {
  if (!inputPasscode) return false;
  
  // Clean whitespace
  const cleanInput = inputPasscode.trim();
  
  if (cleanInput === DEFAULT_ADMIN_PASSCODE) {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (e) {}
    return true;
  }
  
  return false;
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}
