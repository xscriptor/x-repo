'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
