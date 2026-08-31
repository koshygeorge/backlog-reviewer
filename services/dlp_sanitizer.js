// Client-Side Data Leakage Prevention (DLP) & PII/IP Redaction Engine
// Sanitizes sensitive enterprise strings before LLM payloads leave the browser sandbox.

export function sanitizeTextForLLM(text) {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;

  // 1. Redact Email addresses
  sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');

  // 2. Redact IPv4 addresses
  sanitized = sanitized.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[REDACTED_IP]');

  // 3. Redact Secret API keys / Tokens (Bearer, sk-, ghp_, AIzaSy, etc.)
  sanitized = sanitized.replace(/(?:sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36}|AIzaSy[a-zA-Z0-9_-]{33}|Bearer\s+[a-zA-Z0-9._-]{20,})/gi, '[REDACTED_SECRET_TOKEN]');

  // 4. Redact Internal Domain Hostnames (.internal, .local, .corp, .lan)
  sanitized = sanitized.replace(/\b[a-zA-Z0-9_-]+\.(?:internal|local|corp|lan|private)\b/gi, '[REDACTED_INTERNAL_HOST]');

  // 5. Redact Credit Card / SSN patterns
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');
  sanitized = sanitized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CARD_NUM]');

  return sanitized;
}

/**
 * Deeply sanitize story object before LLM processing
 */
export function sanitizeStoryObject(story) {
  if (!story) return story;

  return {
    ...story,
    title: sanitizeTextForLLM(story.title),
    asA: sanitizeTextForLLM(story.asA),
    iWantTo: sanitizeTextForLLM(story.iWantTo),
    soThat: sanitizeTextForLLM(story.soThat),
    acceptanceCriteria: sanitizeTextForLLM(story.acceptanceCriteria)
  };
}
