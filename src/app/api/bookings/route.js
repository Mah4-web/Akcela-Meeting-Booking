import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (server-side)
function getSupabase(token) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  );
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid or missing JSON body." }, { status: 400 });
  }

  const { room_id, start_time, end_time, purpose, booked_by } = body || {};

  if (!room_id || !start_time || !end_time) {
    return NextResponse.json({ error: "Missing room_id/start_time/end_time" }, { status: 400 });
  }

  // Get the logged-in user from Clerk session
  const { userId, getToken } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Generate Supabase token for row-level security
  const token = await getToken({ template: "supabase" });
  const supabase = getSupabase(token);

  // Insert booking with server-detected userId
  const { data, error } = await supabase
    .from("bookings")
    .insert([{
      user_id: userId,
      room_id,
      start_time,
      end_time,
      purpose,
      booked_by
    }])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

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
