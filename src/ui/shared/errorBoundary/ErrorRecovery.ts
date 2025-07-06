/**
 * Error Recovery Strategies
 * Recovery strategies for handling different types of errors
 */

// Dynamic import to avoid immediate store initialization

export class ErrorRecovery {
  private static strategies = new Map<string, () => Promise<void>>();

  static {
    // Register default recovery strategies
    this.registerStrategy('reset-component', async () => {
      // Component will reset itself
    });

    this.registerStrategy('reset-stores', async () => {
      const { resetAllStores } = await import('../../../services/state/storeManager');
      resetAllStores();
    });

    this.registerStrategy('reload-page', async () => {
      window.location.reload();
    });

    this.registerStrategy('clear-cache', async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      localStorage.clear();
      sessionStorage.clear();
    });

    this.registerStrategy('navigate-home', async () => {
      window.location.href = '/';
    });
  }

  static registerStrategy(name: string, handler: () => Promise<void>): void {
    this.strategies.set(name, handler);
  }

  static async executeStrategy(name: string): Promise<void> {
    const strategy = this.strategies.get(name);
    if (strategy) {
      await strategy();
    } else {
      console.warn(`Unknown recovery strategy: ${name}`);
    }
  }

  static getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
