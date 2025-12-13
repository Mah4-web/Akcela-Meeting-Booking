import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";


export const runtime = "nodejs";

// Initialize Supabase client (server-side)
function getSupabase(token) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
    return NextResponse.json(
      { error: "Missing room_id/start_time/end_time" },
      { status: 400 }
    );
  }

  console.log('REQUEST BODY', body);
  // console.log("HEADERS", headers().get("cookie"));

  // Get the logged-in user from Clerk session
   const { userId, getToken } = await auth();
  const token = await getToken({ template: "supabase" });


if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

  // Generate Supabase token for row-level security


  // console.log('TOKEN', token);
  // console.log('USER ID', userId);

  const supabase = getSupabase(token);

  // Insert booking with server-detected userId
  const { data, error } = await supabase
    .from("bookings")
    .insert([{
      user_id: userId,
      room_id: room_id,
      start_time: start_time,
      end_time: end_time,
      purpose: purpose,
      booked_by: booked_by
    }])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ booking: data });
}

export async function GET() {
  
  const { getToken } = await auth();

  const token = await getToken({ template: "supabase" });
  const supabase = getSupabase(token);

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("start_time", { ascending: true });
  if (error) {

    return NextResponse.json({ error: error.message }, { status: 400 });

  }

  console.log("FETCHED BOOKINGS:", data);
  return NextResponse.json({ bookings: data });
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

  if (error)
    return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const { getToken } = auth();
  const token = await getToken({ template: "supabase" });
  const supabase = getSupabase(token);

  const body = await req.json();
  const { id, room_id, start_time, end_time, purpose } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Build updates dynamically (only send provided fields)
  const updates = {};
  if (room_id !== undefined) updates.room_id = room_id;
  if (start_time !== undefined) updates.start_time = start_time;
  if (end_time !== undefined) updates.end_time = end_time;
  if (purpose !== undefined) updates.purpose = purpose;

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ booking: data });
}
