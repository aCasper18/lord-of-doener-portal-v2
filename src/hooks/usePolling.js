import { useEffect, useRef } from "react";

// Ruft `callback` sofort und danach alle `intervalMs` erneut auf, solange die
// Komponente gemountet ist. Einfache Multi-User-Sync-Strategie fuer ein
// kleines internes Team (siehe Plan: Polling statt WebSockets/SSE).
export function usePolling(callback, intervalMs = 20000) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    savedCallback.current();
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
