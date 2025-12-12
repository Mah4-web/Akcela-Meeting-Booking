import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export async function DELETE(req) {
  const { sessionClaims } = auth();

  if (sessionClaims?.publicMetadata?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { bookingId } = await req.json();

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    return new Response("Failed to delete booking", { status: 500 });
  }

  return new Response("OK");
}
