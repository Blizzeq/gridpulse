import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flows")
    .select("*")
    .eq("date", date)
    .eq("hour", parseInt(hour));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
