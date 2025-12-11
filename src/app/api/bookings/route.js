import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // server key ONLY
const supabase = createClient(supabaseUrl, supabaseKey);

const SLOT_INTERVAL_MINUTES = 15;
const MAX_BOOKING_MINUTES = 120;
const MAX_SLOTS_PER_BOOKING = MAX_BOOKING_MINUTES / SLOT_INTERVAL_MINUTES;

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Missing date query parameter" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .select("id, date, start_index, end_index, customer_name")
    .eq("date", date)
    .order("start_index", { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 }
    );
  }

  const bookings = data.map((row) => ({
    id: row.id,
    date: row.date,
    startIndex: row.start_index,
    endIndex: row.end_index,
    customerName: row.customer_name,
  }));

  return NextResponse.json({ bookings });
}

export async function POST(req) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { date, startIndex, endIndex, customerName } = body;

  if (
    !date ||
    startIndex == null ||
    endIndex == null ||
    !customerName?.trim()
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const count = endIndex - startIndex + 1;
  if (count <= 0 || count > MAX_SLOTS_PER_BOOKING) {
    return NextResponse.json(
      { error: "Maximum booking is 2 hours (8 x 15-minute slots)" },
      { status: 400 }
    );
  }

  // server-side overlap protection
  const { data: existing, error: loadError } = await supabase
    .from("bookings")
    .select("start_index, end_index")
    .eq("date", date);

  if (loadError) {
    console.error(loadError);
    return NextResponse.json(
      { error: "Failed to check existing bookings" },
      { status: 500 }
    );
  }

  const overlaps = existing.some((b) =>
    rangesOverlap(startIndex, endIndex, b.start_index, b.end_index)
  );

  if (overlaps) {
    return NextResponse.json(
      { error: "Selection overlaps with an existing booking" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      date,
      start_index: startIndex,
      end_index: endIndex,
      customer_name: customerName.trim(),
    })
    .select("id, date, start_index, end_index, customer_name")
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }

  const booking = {
    id: data.id,
    date: data.date,
    startIndex: data.start_index,
    endIndex: data.end_index,
    customerName: data.customer_name,
  };

  return NextResponse.json({ booking }, { status: 201 });
}
