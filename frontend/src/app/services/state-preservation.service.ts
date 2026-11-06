
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatePreservationService {

  private readonly storagePrefix = 'email-automation:';

  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  saveState<T>(key: string, state: T): boolean {
    try {
      const serializedState = JSON.stringify(state);

      if (serializedState === undefined) {
        return false;
      }

      sessionStorage.setItem(
        this.getStorageKey(key),
        serializedState
      );

      return true;

    } catch {
      return false;
    }
  }

  getState<T>(key: string): T | null {
    try {
      const storedState = sessionStorage.getItem(
        this.getStorageKey(key)
      );

      if (storedState === null) {
        return null;
      }

      return JSON.parse(storedState) as T;

    } catch {
      return null;
    }
  }

  hasState(key: string): boolean {
    try {
      return sessionStorage.getItem(
        this.getStorageKey(key)
      ) !== null;

    } catch {
      return false;
    }
  }

  clearState(key: string): void {
    try {
      sessionStorage.removeItem(
        this.getStorageKey(key)
      );
    } catch {
      // State preservation is best-effort.
    }
  }
}
