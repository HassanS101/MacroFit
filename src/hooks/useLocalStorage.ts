import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [key, value]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) =>
      setValue((prev) => (typeof next === "function" ? (next as (p: T) => T)(prev) : next)),
    [],
  );

  return [value, update] as const;
}
