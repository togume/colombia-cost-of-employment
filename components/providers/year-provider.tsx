"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_YEAR,
  getYearlyRates,
  listAvailableYears,
  type AvailableYear,
  type YearlyRates,
} from "@/lib/rates";

const STORAGE_KEY = "cec-year";

type YearChangeCallback = (newYear: AvailableYear, newRates: YearlyRates) => void;

interface YearContextValue {
  year: AvailableYear;
  setYear: (year: AvailableYear) => void;
  availableYears: AvailableYear[];
  rates: YearlyRates;
  subscribeToYearChange: (callback: YearChangeCallback) => () => void;
}

const YearContext = createContext<YearContextValue | null>(null);

function detectInitialYear(): AvailableYear {
  if (typeof window === "undefined") {
    return DEFAULT_YEAR;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as AvailableYear | null;
  const availableYears = listAvailableYears();

  if (stored && availableYears.includes(stored)) {
    return stored;
  }

  return DEFAULT_YEAR;
}

interface YearProviderWrapperProps {
  children: ReactNode;
}

export function YearProviderWrapper({ children }: YearProviderWrapperProps) {
  const initialYear = detectInitialYear();
  const [year, setYearState] = useState<AvailableYear>(initialYear);
  const availableYears = useMemo(() => listAvailableYears(), []);
  const listenersRef = useRef<Set<YearChangeCallback>>(new Set());

  const rates = useMemo(() => getYearlyRates(year), [year]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && typeof event.newValue === "string") {
        const newYear = event.newValue as AvailableYear;
        if (availableYears.includes(newYear)) {
          setYearState(newYear);
          const newRates = getYearlyRates(newYear);
          listenersRef.current.forEach((callback) => callback(newYear, newRates));
        }
      }
    };

    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("storage", handler);
    };
  }, [availableYears]);

  const setYear = useCallback((nextYear: AvailableYear) => {
    setYearState(nextYear);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextYear);
    }
    const newRates = getYearlyRates(nextYear);
    listenersRef.current.forEach((callback) => callback(nextYear, newRates));
  }, []);

  const subscribeToYearChange = useCallback((callback: YearChangeCallback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const contextValue = useMemo<YearContextValue>(
    () => ({
      year,
      setYear,
      availableYears,
      rates,
      subscribeToYearChange,
    }),
    [year, setYear, availableYears, rates, subscribeToYearChange],
  );

  return (
    <YearContext.Provider value={contextValue}>
      {children}
    </YearContext.Provider>
  );
}

export function useYearContext(): YearContextValue {
  const value = useContext(YearContext);
  if (!value) {
    throw new Error("useYearContext must be used within YearProviderWrapper");
  }
  return value;
}
