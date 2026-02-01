/**
 * Logger utility
 *
 * In production: debug/log are no-op; warn/error still output so server logs
 * retain important failures. In development: all levels output to console.
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  debug: (...args: unknown[]) => isDev && console.debug(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
};
