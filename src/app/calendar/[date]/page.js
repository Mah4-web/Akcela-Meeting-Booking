"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

const SLOT_INTERVAL = 15;
const MAX_BOOKING_MINUTES = 120;
const MAX_SLOTS = MAX_BOOKING_MINUTES / SLOT_INTERVAL;
const START_HOUR = 8;
const END_HOUR = 24;

function generateSlots() {
  const slots = [];
  let index = 0;
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL) {
      slots.push({ index, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` });
      index++;
    }
  }
  return slots;
}
const allSlots = generateSlots();

export default function DayBookingPage({ params }) {
  const date = params.date;
  const [bookings, setBookings] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/bookings?date=${date}`);
        const data = await res.json();
        if (res.ok) setBookings(data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [date]);

  const readableDate = useMemo(() => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? date : format(d, "EEEE, dd-MM-yyyy");
  }, [date]);

  // Slot selection logic remains same
  const isSlotBooked = (i) => bookings.some((b) => i >= b.start_index && i <= b.end_index);
  const isSlotSelected = (i) => selectedRange && i >= selectedRange.startIndex && i <= selectedRange.endIndex;
  const isRangeAvailable = (start, end) => !allSlots.slice(start, end + 1).some((_, i) => isSlotBooked(start + i));

  const handleSlotClick = (slotIndex) => {
    if (isSlotBooked(slotIndex)) return;
    if (!selectedRange) setSelectedRange({ startIndex: slotIndex, endIndex: slotIndex });
    else {
      const start = Math.min(selectedRange.startIndex, slotIndex);
      const end = Math.max(selectedRange.endIndex, slotIndex);
      if (end - start + 1 > MAX_SLOTS) return;
      if (!isRangeAvailable(start, end)) return;
      setSelectedRange({ startIndex: start, endIndex: end });
    }
  };

  const handleBook = async () => {
    if (!customerName.trim() || !selectedRange) return;
    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startIndex: selectedRange.startIndex,
          endIndex: selectedRange.endIndex,
          customerName: customerName.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) => [...prev, data.booking]);
        setSelectedRange(null);
        setCustomerName("");
        setMessage({ type: "success", text: "Booking created ✅" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to create booking" });
    } finally {
      setSaving(false);
    }
  };

  const currentDuration = useMemo(() => selectedRange ? (selectedRange.endIndex - selectedRange.startIndex + 1) * SLOT_INTERVAL : 0, [selectedRange]);

  return (
    <main className="calendar-root">
      <h1 className="calendar-title">Bookings for {readableDate}</h1>
      <div>
        <input type="text" placeholder="Your Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <button onClick={handleBook} disabled={saving}>{saving ? "Saving..." : "Book"}</button>
        <div>Selected duration: {currentDuration} mins</div>
      </div>
      <div className="slots-grid">
        {allSlots.map((slot) => (
          <button key={slot.index} className={`slot-cell ${isSlotBooked(slot.index) ? "slot-booked" : isSlotSelected(slot.index) ? "slot-selected" : ""}`} onClick={() => handleSlotClick(slot.index)} disabled={isSlotBooked(slot.index) || loading}>{slot.label}</button>
        ))}
      </div>
      <div>
        {bookings.map((b) => <div key={b.id}>{b.customerName}: {allSlots[b.start_index].label} - {allSlots[b.end_index].label}</div>)}
      </div>
    </main>
  );
}
