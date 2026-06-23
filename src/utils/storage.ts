// Safe storage wrappers to avoid crashing in iframe environments where third-party storage is blocked.
const memoryStorage: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      memoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  }
};

const sessionMemoryStorage: Record<string, string> = {};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return sessionMemoryStorage[key] !== undefined ? sessionMemoryStorage[key] : null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      sessionMemoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      delete sessionMemoryStorage[key];
    }
  }
};

export function safeGetLocationPathname(): string {
  try {
    return window.location.pathname || "/";
  } catch (e) {
    return "/";
  }
}

export function safeGetLocationSearch(): string {
  try {
    return window.location.search || "";
  } catch (e) {
    return "";
  }
}

export function safeGetLocationOrigin(): string {
  try {
    return window.location.origin || "";
  } catch (e) {
    return "";
  }
}

export function safeIsInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

