"use client";

import { useEffect } from "react";

/**
 * Security: Silences browser console outputs (logs, warnings, debug, info)
 * Prevents token, socket payloads, and user communication data from leaking into DevTools.
 */
export function ConsoleSilencer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Preserve original console.error only if critical, but silence standard logging
    const noop = () => {};
    window.console.log = noop;
    window.console.info = noop;
    window.console.debug = noop;
    window.console.trace = noop;
    window.console.dir = noop;
    window.console.table = noop;
    window.console.warn = noop;
  }, []);

  return null;
}

export default ConsoleSilencer;
