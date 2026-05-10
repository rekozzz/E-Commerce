import { useEffect, useState } from 'react';

/**
 * Delays updating the returned value until `delay` ms have elapsed
 * since the last change. Use to avoid firing API calls on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
