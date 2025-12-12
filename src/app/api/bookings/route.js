import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  );
}

// Create booking
export async function POST(req) {
  const { getToken } = auth();
  const token = await getToken({ template: "supabase" });
  const supabase = getSupabase(token);

  const body = await req.json();
  const { room_id, start_time, end_time, purpose } = body;

  if (!room_id || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing room_id/start_time/end_time" }, { status: 400 });
  }

  // Let DB defaults + RLS handle user_id/booked_by if you set defaults.
  // If you DIDN'T set defaults, uncomment these two lines:
  // const userId = (await supabase.rpc("get_jwt_sub")).data; // not needed if using defaults
  // ...but easiest is: set column defaults in DB.

  const { data, error } = await supabase
    .from("bookings")
    .insert([{ room_id, start_time, end_time, purpose }])
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ booking: data });
}

// Delete booking (admin-only via RLS policy)
export async function DELETE(req) {
  const { getToken } = auth();
  const token = await getToken({ template: "supabase" });
  const supabase = getSupabase(token);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}