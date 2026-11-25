import { createContext, useContext } from 'react';
import type { UseFrameletResult } from './useFramelet';

export const FrameletContext = createContext<UseFrameletResult | null>(null);

export function useFrameletContext(): UseFrameletResult {
  const context = useContext(FrameletContext);
  if (!context) {
    throw new Error('Framelet parts must be rendered inside <Framelet.Root>.');
  }
  return context;
}
