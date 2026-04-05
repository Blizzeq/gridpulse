"use client";

import { useQuery } from "@tanstack/react-query";
import { Price, CountryPrice } from "@/types/energy";

async function fetchPrices(country: string, date: string): Promise<Price[]> {
  const res = await fetch(`/api/prices?country=${country}&date=${date}`);
  if (!res.ok) throw new Error("Failed to fetch prices");
  return res.json();
}

async function fetchAllPrices(date: string, hour: number): Promise<CountryPrice[]> {
  const res = await fetch(`/api/prices?date=${date}&hour=${hour}`);
  if (!res.ok) throw new Error("Failed to fetch prices");
  return res.json();
}

export function usePrices(country: string, date: string) {
  return useQuery({
    queryKey: ["prices", country, date],
    queryFn: () => fetchPrices(country, date),
    enabled: !!country && !!date,
  });
}

export function useAllPrices(date: string, hour: number) {
  return useQuery({
    queryKey: ["prices-all", date, hour],
    queryFn: () => fetchAllPrices(date, hour),
    enabled: !!date,
  });
}
