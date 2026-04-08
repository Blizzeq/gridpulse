"use client";

import { useQuery } from "@tanstack/react-query";
import { EnergyMix } from "@/types/energy";

const FIVE_MINUTES = 5 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;

function isToday(date: string): boolean {
  return date === new Date().toISOString().split("T")[0];
}

async function fetchGeneration(
  country: string,
  date: string,
  hour: number
): Promise<EnergyMix[]> {
  const res = await fetch(
    `/api/generation?country=${country}&date=${date}&hour=${hour}`
  );
  if (!res.ok) throw new Error("Failed to fetch generation");
  return res.json();
}

export function useGeneration(country: string, date: string, hour: number) {
  const today = isToday(date);
  return useQuery({
    queryKey: ["generation", country, date, hour],
    queryFn: () => fetchGeneration(country, date, hour),
    enabled: !!country && !!date,
    staleTime: today ? TWO_MINUTES : Infinity,
    refetchInterval: today ? FIVE_MINUTES : false,
  });
}
