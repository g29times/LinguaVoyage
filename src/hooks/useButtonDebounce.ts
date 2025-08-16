import { useState, useCallback } from 'react';
import { createButtonDebouncer } from '@/utils/debounce';

export function useButtonDebounce(delay: number = 3000) {
  const [debouncer] = useState(() => createButtonDebouncer(delay));
  const [isLoading, setIsLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const executeWithDebounce = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    const result = await debouncer.executeWithDebounce(
      async () => {
        setIsLoading(true);
        try {
          const res = await asyncFn();
          return res;
        } finally {
          setIsLoading(false);
        }
      },
      (count) => {
        setClickCount(count);
      }
    );

    // 如果执行成功，重置点击计数
    if (result !== null) {
      setClickCount(0);
    }

    return result;
  }, [debouncer]);

  const resetState = useCallback(() => {
    debouncer.resetClickCount();
    setClickCount(0);
    setIsLoading(false);
  }, [debouncer]);

  return {
    isLoading,
    clickCount,
    executeWithDebounce,
    resetState,
    isDebouncing: debouncer.isDebouncing()
  };
}