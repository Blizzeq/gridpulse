"use client";

import { useQuery } from "@tanstack/react-query";
import { Price, CountryPrice } from "@/types/energy";

const FIVE_MINUTES = 5 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;

function isToday(date: string): boolean {
  return date === new Date().toISOString().split("T")[0];
}

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
  const today = isToday(date);
  return useQuery({
    queryKey: ["prices", country, date],
    queryFn: () => fetchPrices(country, date),
    enabled: !!country && !!date,
    staleTime: today ? TWO_MINUTES : Infinity,
    refetchInterval: today ? FIVE_MINUTES : false,
  });
}

export function useAllPrices(date: string, hour: number) {
  const today = isToday(date);
  return useQuery({
    queryKey: ["prices-all", date, hour],
    queryFn: () => fetchAllPrices(date, hour),
    enabled: !!date,
    staleTime: today ? TWO_MINUTES : Infinity,
    refetchInterval: today ? FIVE_MINUTES : false,
  });
}
