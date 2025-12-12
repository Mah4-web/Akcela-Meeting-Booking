"use client";

import { useState } from "react";

// helper functions (same file)
function is15MinStep(date) {
  const d = new Date(date);
  return d.getMinutes() % 15 === 0 && d.getSeconds() === 0;
}

function hoursDiff(start, end) {
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
}

export default function BookingsPage() {
  const [roomId, setRoomId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [msg, setMsg] = useState("");

  async function createBooking(e) {
    e.preventDefault();
    setMsg("");

    if (!is15MinStep(startTime) || !is15MinStep(endTime)) {
      setMsg("Bookings must start and end on 15-minute increments.");
      return;
    }

    if (hoursDiff(startTime, endTime) > 2) {
      setMsg("Bookings can’t be longer than 2 hours.");
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_id: Number(roomId),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        purpose,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error || "Failed to create booking");
      return;
    }

    setMsg("✅ Booking created!");
  }

  return (
    <form onSubmit={createBooking}>
      {/* your inputs */}
      {msg && <p>{msg}</p>}
    </form>
  );

  async function updateBooking(bookingId) {
    setMsg("");

    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: bookingId,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        purpose,
        room_id: Number(roomId),
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setMsg(json.error || "Failed to update booking");
      return;
    }

    setMsg("✅ Booking updated!");
  }
}
