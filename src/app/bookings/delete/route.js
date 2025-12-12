import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/components/utils/dbConnection";

export async function POST(req) {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { bookingId } = await req.json();

  await db.query(`DELETE FROM bookings WHERE id = $1`, [bookingId]);

  return new Response("OK", { status: 200 });
}
