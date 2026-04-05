"use client";

import { Bid } from "@/types/trading";
import { Input } from "@/components/ui/input";

interface BidTableProps {
  bids: Bid[];
  onChange: (bids: Bid[]) => void;
  disabled?: boolean;
}

export function BidTable({ bids, onChange, disabled }: BidTableProps) {
  const updateBid = (hour: number, field: "price" | "volume", value: string) => {
    const numVal = parseFloat(value) || 0;
    onChange(
      bids.map((b) => (b.hour === hour ? { ...b, [field]: numVal } : b))
    );
  };

  const quickFill = (type: "flat" | "random") => {
    if (type === "flat") {
      onChange(bids.map((b) => ({ ...b, price: 50, volume: 10 })));
    } else {
      onChange(
        bids.map((b) => ({
          ...b,
          price: Math.round((30 + Math.random() * 80) * 10) / 10,
          volume: 10,
        }))
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Your Bids for Tomorrow
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="py-2 px-3 text-left w-16">Hour</th>
              <th className="py-2 px-3 text-right">Price (EUR/MWh)</th>
              <th className="py-2 px-3 text-right">Volume (MWh)</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, i) => (
              <tr
                key={bid.hour}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="py-1.5 px-3 text-gray-500 font-mono text-xs">
                  {bid.hour.toString().padStart(2, "0")}:00
                </td>
                <td className="py-1.5 px-3">
                  <Input
                    type="number"
                    value={bid.price > 0 ? bid.price : ""}
                    placeholder="0"
                    onChange={(e) => updateBid(bid.hour, "price", e.target.value)}
                    disabled={disabled}
                    className="h-8 text-right text-sm w-28 ml-auto"
                    min={0}
                    max={10000}
                    step={0.1}
                  />
                </td>
                <td className="py-1.5 px-3">
                  <Input
                    type="number"
                    value={bid.volume || ""}
                    onChange={(e) =>
                      updateBid(bid.hour, "volume", e.target.value)
                    }
                    disabled={disabled}
                    className="h-8 text-right text-sm w-20 ml-auto"
                    min={0}
                    max={1000}
                    step={1}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => quickFill("flat")}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600"
          >
            Flat 50 EUR
          </button>
          <button
            onClick={() => quickFill("random")}
            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600"
          >
            Random
          </button>
        </div>
      )}
    </div>
  );
}
