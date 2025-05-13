import { InjectionToken } from '@angular/core';

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage', {
  providedIn: 'root',
  factory: () => {
    if (typeof window !== 'undefined') {
      return window.localStorage;
    }
    return {
      length: 0,
      key: () => null,
      getItem: () => null,
      setItem: () => null,
      removeItem: () => null,
      clear: () => null,
    };
  },
});
