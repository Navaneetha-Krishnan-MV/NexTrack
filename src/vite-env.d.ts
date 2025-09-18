/// <reference types="vite/client" />

// Add type definitions for @ path alias
declare module '@/components/ui/toaster' {
  import { FC } from 'react';
  export const Toaster: FC;
}

declare module '@/components/ui/sonner' {
  import { FC } from 'react';
  export const Toaster: FC;
}

declare module '@/components/ui/tooltip' {
  import { FC, ReactNode } from 'react';
  export const TooltipProvider: FC<{ children: ReactNode }>;
}
