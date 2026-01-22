"use client";

import { useYearContext } from "@/components/providers/year-provider";

export function useYear() {
  return useYearContext();
}
