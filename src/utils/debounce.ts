// 通用防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 请求去重管理器
class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private activeRequests: Map<string, Promise<any>> = new Map();

  static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // 如果已有相同请求在进行中，直接返回该Promise
    if (this.activeRequests.has(key)) {
      console.log(`🔄 Request deduplication: reusing existing request for key: ${key}`);
      return this.activeRequests.get(key);
    }

    // 创建新请求
    const request = requestFn().finally(() => {
      // 请求完成后从缓存中移除
      this.activeRequests.delete(key);
      console.log(`✅ Request completed and removed from cache: ${key}`);
    });

    // 将请求加入缓存
    this.activeRequests.set(key, request);
    console.log(`🚀 New request started with key: ${key}`);

    return request;
  }

  // 手动清理特定请求（可选）
  clearRequest(key: string): void {
    this.activeRequests.delete(key);
  }

  // 获取当前活跃请求数量（调试用）
  getActiveRequestCount(): number {
    return this.activeRequests.size;
  }
}

export const requestDeduplicator = RequestDeduplicator.getInstance();

// 按钮防抖工具函数
export function createButtonDebouncer(delay: number = 3000) {
  let isDebouncing = false;
  let clickCount = 0;

  return {
    isDebouncing: () => isDebouncing,
    getClickCount: () => clickCount,
    resetClickCount: () => { clickCount = 0; },
    executeWithDebounce: async <T>(
      asyncFn: () => Promise<T>,
      onDebounceClick?: (count: number) => void
    ): Promise<T | null> => {
      clickCount++;

      if (isDebouncing) {
        console.log(`⚠️ Button debounce: ignoring click #${clickCount}`);
        onDebounceClick?.(clickCount);
        return null;
      }

      isDebouncing = true;
      console.log(`🚀 Button debounce: executing first click, starting ${delay}ms cooldown`);

      try {
        const result = await asyncFn();
        return result;
      } finally {
        setTimeout(() => {
          isDebouncing = false;
          clickCount = 0;
          console.log(`✅ Button debounce: cooldown finished, ready for next click`);
        }, delay);
      }
    }
  };
}