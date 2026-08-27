// Shared error utilities between server functions and client UI.
// AppError carries a stable error code so the client can map a thrown
// error to a user-facing message without leaking server details.

export const ERROR_CODE = {
  RATE_LIMIT: "RATE_LIMIT",
  INVALID_INPUT: "INVALID_INPUT",
  AI_CONFIG: "AI_CONFIG",
  AI_RESPONSE: "AI_RESPONSE",
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

// Human-readable messages. The rate-limit message is the user-facing copy
// for the "Usage limit reached" alert. Other codes fall back to a generic
// message on the client.
export const ERROR_MESSAGE: Record<ErrorCode, string> = {
  RATE_LIMIT: "You've reached the usage limit for this tool. Please try again later",
  INVALID_INPUT: "Please try again.",
  AI_CONFIG: "Please try again.",
  AI_RESPONSE: "Please try again.",
};

export class AppError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message?: string) {
    super(message ?? ERROR_MESSAGE[code]);
    this.name = "AppError";
    this.code = code;
  }
}

// Messages thrown by the server are formatted as "[CODE] human copy" so the
// client can identify the error category without trusting the raw text.
// isErrorCode detects the prefix, stripErrorCode removes it.
export function isErrorCode(message: string | undefined | null, code: ErrorCode): boolean {
  if (!message) return false;
  return message.startsWith(`[${code}]`);
}

export function stripErrorCode(message: string): string {
  // Strip the leading "[CODE] " prefix if present.
  const m = message.match(/^\[[A-Z_]+\]\s*(.*)$/);
  return m ? m[1] : message;
}
