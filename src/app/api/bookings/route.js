export async function PATCH(req) {
  const { sessionClaims, userId } = auth();
  const { bookingId, startIndex, endIndex, room, customerName } = await req.json();

  if (!bookingId || startIndex == null || endIndex == null || !room || !customerName) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  try {
    const { rows } = await db.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
    const booking = rows[0];
    if (!booking) return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404 });

    // Only admin or creator can edit
    if (sessionClaims?.publicMetadata?.role !== "admin" && booking.created_by !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }

    // Check overlap for the new slot
    const { rows: existing } = await db.query(
      "SELECT start_index, end_index FROM bookings WHERE date = $1 AND room = $2 AND id != $3",
      [booking.date, room, bookingId]
    );

    if (existing.some((b) => rangesOverlap(startIndex, endIndex, b.start_index, b.end_index))) {
      return new Response(JSON.stringify({ error: "Selected slot overlaps" }), { status: 400 });
    }

    const res = await db.query(
      `UPDATE bookings
       SET start_index=$1, end_index=$2, room=$3, customer_name=$4
       WHERE id=$5 RETURNING *`,
      [startIndex, endIndex, room, customerName, bookingId]
    );

    return new Response(JSON.stringify({ booking: res.rows[0] }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to update booking" }), { status: 500 });
  }
}
