import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchFlows as fetchFromEntsoe } from "@/lib/entsoe";
import { FLOW_PAIRS } from "@/lib/countries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const hour = searchParams.get("hour");

  if (!date || !hour) {
    return NextResponse.json(
      { error: "Missing required parameters: date, hour" },
      { status: 400 }
    );
  }

  const hourNum = parseInt(hour);
  const supabase = await createClient();

  const isToday = date === new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("flows")
    .select("*")
    .eq("date", date)
    .eq("hour", hourNum);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refetch if no data, or if today and we have very few flow pairs cached
  const needsRefresh = !data || data.length === 0 || (isToday && data.length < 10);

  if (needsRefresh) {
    try {
      const results = await Promise.allSettled(
        FLOW_PAIRS.map(async ([from, to]) => {
          const flows = await fetchFromEntsoe(from, to, date);
          const hourFlow = flows.find((f) => f.hour === hourNum);
          if (!hourFlow) return null;
          return {
            from_country: from,
            to_country: to,
            date,
            hour: hourNum,
            flow_mw: hourFlow.flow_mw,
          };
        })
      );

      const flowData: {
        from_country: string;
        to_country: string;
        date: string;
        hour: number;
        flow_mw: number;
      }[] = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value != null) {
          flowData.push(r.value);
        }
      }

      if (flowData.length > 0) {
        const rows = flowData.map((f) => ({
          ...f,
          fetched_at: new Date().toISOString(),
        }));
        await supabase.from("flows").upsert(rows, {
          onConflict: "from_country,to_country,date,hour",
          ignoreDuplicates: false,
        });
      }

      return NextResponse.json(flowData.length > 0 ? flowData : data ?? []);
    } catch (e) {
      console.error(`ENTSO-E flows fetch failed for ${date}/${hour}:`, e);
      return NextResponse.json(data ?? []);
    }
  }

  return NextResponse.json(data);
}
