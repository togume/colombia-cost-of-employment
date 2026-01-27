"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import esMessages from "@/messages/es.json";

const STORAGE_KEY = "cec-locale";
const DEFAULT_TIME_ZONE = "America/Bogota";

const SUPPORTED_LOCALES = ["en", "es"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const MESSAGES: Record<SupportedLocale, Record<string, unknown>> = {
  en: enMessages,
  es: esMessages,
};

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  availableLocales: SupportedLocale[];
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const DEFAULT_LOCALE: SupportedLocale = "en";

function detectClientLocale(): SupportedLocale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }

  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === "es") {
    return "es";
  }

  return DEFAULT_LOCALE;
}

interface IntlProviderWrapperProps {
  children: ReactNode;
}

export function IntlProviderWrapper({ children }: IntlProviderWrapperProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Record<string, unknown>>(MESSAGES[DEFAULT_LOCALE]);
  const [isLoading, setIsLoading] = useState(true);

  // Detect user's preferred locale after hydration (runs once on mount)
  useEffect(() => {
    const detectedLocale = detectClientLocale();
    setLocaleState(detectedLocale);
    setMessages(MESSAGES[detectedLocale]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setMessages(MESSAGES[locale]);
  }, [locale]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && typeof event.newValue === "string") {
        const newLocale = event.newValue as SupportedLocale;
        if (SUPPORTED_LOCALES.includes(newLocale)) {
          setLocaleState(newLocale);
        }
      }
    };

    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    }
  }, []);

  const contextValue = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      availableLocales: [...SUPPORTED_LOCALES],
      isLoading,
    }),
    [locale, setLocale, isLoading],
  );

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={DEFAULT_TIME_ZONE}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleContext(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocaleContext must be used within IntlProviderWrapper");
  }
  return value;
}
