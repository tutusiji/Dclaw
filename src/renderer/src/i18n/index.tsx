import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import enUS from './en-US.json';
import zhCN from './zh-CN.json';

export type Locale = 'zh-CN' | 'en-US';
export type TranslationValues = Record<string, string | number | boolean | null | undefined>;
export type TranslateFn = (key: string, values?: TranslationValues, fallback?: string) => string;

const STORAGE_KEY = 'dclaw.locale';

const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS
};

function formatMessage(template: string, values?: TranslationValues): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

export function readStoredLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'zh-CN';
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'en-US' ? 'en-US' : 'zh-CN';
  } catch {
    return 'zh-CN';
  }
}

export function translate(locale: Locale, key: string, values?: TranslationValues, fallback?: string): string {
  const template = messages[locale][key] ?? messages['zh-CN'][key] ?? messages['en-US'][key] ?? fallback ?? key;
  return formatMessage(template, values);
}

export function getMessage(locale: Locale, key: string, values?: TranslationValues, fallback?: string): string {
  return translate(locale, key, values, fallback);
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslateFn;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    document.documentElement.lang = locale === 'zh-CN' ? 'zh-CN' : 'en';

    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore local storage failures in desktop shell contexts.
    }
  }, [locale]);

  const t: TranslateFn = (key, values, fallback) => translate(locale, key, values, fallback);

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale: () => setLocale((current) => (current === 'zh-CN' ? 'en-US' : 'zh-CN')),
        t
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider.');
  }
  return context;
}
