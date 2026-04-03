export function assert(
  condition: unknown,
  message?: string,
  debug?: Record<string, unknown>,
): asserts condition {
  if (!condition) {
    const debugInfo = debug ? `\nDebug: ${JSON.stringify(debug, null, 2)}` : "";
    throw new Error(`${message ?? "Assertion failed"} ${debugInfo}`);
  }
}
