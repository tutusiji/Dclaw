import type { DclawApi } from '@shared/types';

declare global {
  interface Window {
    dclaw: DclawApi;
  }
}

export {};
