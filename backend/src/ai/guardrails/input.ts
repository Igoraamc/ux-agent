const SUSPICIOUS_PATTERNS = [
  /ignore.*instructions/i,
  /forget.*previous/i,
  /export.*cookies/i,
  /send.*to.*external/i,
  /execute.*script/i,
  /console\.log/i,
];

const PROMPT_MAX_LENGTH = 10000;

export function validatePrompt(prompt: string): {
  valid: boolean;
  reason?: string;
} {
  if (prompt.trim().length >= PROMPT_MAX_LENGTH) {
    return { valid: false, reason: "Prompt is to long." };
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(prompt)) {
      return { valid: false, reason: "Prompt contains disallowed patterns" };
    }
  }
  return { valid: true };
}
