"use client";

import { useQuery } from "@tanstack/react-query";
import { Flow } from "@/types/energy";

async function fetchFlows(date: string, hour: number): Promise<Flow[]> {
  const res = await fetch(`/api/flows?date=${date}&hour=${hour}`);
  if (!res.ok) throw new Error("Failed to fetch flows");
  return res.json();
}

export function useFlows(date: string, hour: number) {
  return useQuery({
    queryKey: ["flows", date, hour],
    queryFn: () => fetchFlows(date, hour),
    enabled: !!date,
  });
}
