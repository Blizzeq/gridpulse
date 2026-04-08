"use client";

import { useQuery } from "@tanstack/react-query";
import { Flow } from "@/types/energy";

const FIVE_MINUTES = 5 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;

function isToday(date: string): boolean {
  return date === new Date().toISOString().split("T")[0];
}

async function fetchFlows(date: string, hour: number): Promise<Flow[]> {
  const res = await fetch(`/api/flows?date=${date}&hour=${hour}`);
  if (!res.ok) throw new Error("Failed to fetch flows");
  return res.json();
}

export function useFlows(date: string, hour: number) {
  const today = isToday(date);
  return useQuery({
    queryKey: ["flows", date, hour],
    queryFn: () => fetchFlows(date, hour),
    enabled: !!date,
    staleTime: today ? TWO_MINUTES : Infinity,
    refetchInterval: today ? FIVE_MINUTES : false,
  });
}
