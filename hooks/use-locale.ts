"use client";

import { useCallback } from "react";
import {
  useLocaleContext,
  type SupportedLocale,
} from "@/components/providers/intl-provider";

interface UseLocaleResult {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  availableLocales: SupportedLocale[];
  isLoading: boolean;
  toggleLocale: () => void;
}

export function useLocale(): UseLocaleResult {
  const { locale, setLocale, availableLocales, isLoading } = useLocaleContext();

  const toggleLocale = useCallback(() => {
    const nextLocale = availableLocales.find((candidate) => candidate !== locale) ?? locale;
    setLocale(nextLocale);
  }, [availableLocales, locale, setLocale]);

  return {
    locale,
    setLocale,
    availableLocales,
    isLoading,
    toggleLocale,
  };
}

export type { SupportedLocale } from "@/components/providers/intl-provider";
