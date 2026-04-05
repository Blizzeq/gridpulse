"use client";

import { useQuery } from "@tanstack/react-query";
import { EnergyMix } from "@/types/energy";

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
  return useQuery({
    queryKey: ["generation", country, date, hour],
    queryFn: () => fetchGeneration(country, date, hour),
    enabled: !!country && !!date,
  });
}
