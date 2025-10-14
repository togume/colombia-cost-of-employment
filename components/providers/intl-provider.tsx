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

const STORAGE_KEY = "cec-locale";

const SUPPORTED_LOCALES = ["en", "es"] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  availableLocales: SupportedLocale[];
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

async function loadMessages(locale: SupportedLocale): Promise<Record<string, unknown>> {
  switch (locale) {
    case "es":
      return (await import("@/messages/es.json")).default;
    case "en":
    default:
      return (await import("@/messages/en.json")).default;
  }
}

function detectInitialLocale(): SupportedLocale {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
  if (stored && SUPPORTED_LOCALES.includes(stored)) {
    return stored;
  }

  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === "es") {
    return "es";
  }

  return "en";
}

interface IntlProviderWrapperProps {
  children: ReactNode;
}

export function IntlProviderWrapper({ children }: IntlProviderWrapperProps) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => detectInitialLocale());
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    loadMessages(locale)
      .then((loaded) => {
        if (!isActive) return;
        setMessages(loaded);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isActive) return;
        setMessages({});
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
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

  if (!messages) {
    return (
      <LocaleContext.Provider value={contextValue}>
        <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
          Loading…
        </div>
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={contextValue}>
      <NextIntlClientProvider locale={locale} messages={messages}>
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
