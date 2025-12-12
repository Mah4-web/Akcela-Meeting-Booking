"use client";

import { useState, useMemo } from "react";

const SLOT_INTERVAL_MINUTES = 15;
const MAX_BOOKING_MINUTES = 120;
const MAX_SLOTS_PER_BOOKING = MAX_BOOKING_MINUTES / SLOT_INTERVAL_MINUTES;
const START_HOUR = 8;
const END_HOUR = 24;

const ROOM_COLORS = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-yellow-400",
  "Meeting B": "bg-pink-400",
};

function generateSlots() {
  const slots = [];
  let index = 0;
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push({ index, label: `${hh}:${mm}` });
      index++;
    }
  }
  return slots;
}

const allSlots = generateSlots();

export default function BookingFormModal({ booking, onClose, onSave, user, bookings, date }) {
  const [selectedRange, setSelectedRange] = useState(
    booking ? { startIndex: booking.startIndex, endIndex: booking.endIndex } : null
  );
  const [customerName, setCustomerName] = useState(booking?.customerName || "");
  const [room, setRoom] = useState(booking?.room || "Conference A");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const isSlotBooked = (index) =>
    bookings.some(
      (b) =>
        index >= b.startIndex &&
        index <= b.endIndex &&
        (!booking || b.id !== booking.id) // ignore current booking
    );

  const isSlotSelected = (index) =>
    selectedRange && index >= selectedRange.startIndex && index <= selectedRange.endIndex;

  const isRangeAvailable = (startIndex, endIndex) => {
    for (let i = startIndex; i <= endIndex; i++) {
      if (isSlotBooked(i)) return false;
    }
    return true;
  };

  const handleSlotClick = (slotIndex) => {
    setMessage(null);

    if (isSlotBooked(slotIndex)) {
      setMessage({ type: "error", text: "That time is already booked." });
      return;
    }

    if (!selectedRange) {
      setSelectedRange({ startIndex: slotIndex, endIndex: slotIndex });
      return;
    }

    const newStart = Math.min(selectedRange.startIndex, slotIndex);
    const newEnd = Math.max(selectedRange.endIndex, slotIndex);
    const slotCount = newEnd - newStart + 1;

    if (slotCount > MAX_SLOTS_PER_BOOKING) {
      setMessage({ type: "error", text: "Maximum booking is 2 hours." });
      return;
    }

    if (!isRangeAvailable(newStart, newEnd)) {
      setMessage({ type: "error", text: "Selection overlaps with existing booking." });
      return;
    }

    setSelectedRange({ startIndex: newStart, endIndex: newEnd });
  };

  const handleSave = async () => {
    setMessage(null);

    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Please enter your name." });
      return;
    }

    if (!selectedRange) {
      setMessage({ type: "error", text: "Please select at least one slot." });
      return;
    }

    const { startIndex, endIndex } = selectedRange;

    if (!isRangeAvailable(startIndex, endIndex)) {
      setMessage({ type: "error", text: "Selection overlaps with existing booking." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date,
        startIndex,
        endIndex,
        customerName: customerName.trim(),
        room,
        bookingId: booking?.id,
      };

      const res = await fetch(booking ? "/api/bookings/edit" : "/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save booking");

      onSave(data.booking);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const currentDurationMinutes = useMemo(() => {
    if (!selectedRange) return 0;
    return (selectedRange.endIndex - selectedRange.startIndex + 1) * SLOT_INTERVAL_MINUTES;
  }, [selectedRange]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-(--color-glass-bg) p-6 rounded-2xl shadow-glass backdrop-blur-md min-w-[350px] max-w-md">
        <h2 className="text-xl font-bold text-black mb-2">
          {booking ? "Edit Booking" : "New Booking"}
        </h2>

        <label className="block mb-2 text-black">
          Name:
          <input
            type="text"
            className="w-full rounded border border-(--color-glass-border) p-1 mt-1"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </label>

        <label className="block mb-2 text-black">
          Room:
          <select
            className="w-full rounded border border-(--color-glass-border) p-1 mt-1"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          >
            {Object.keys(ROOM_COLORS).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <div className="text-sm mb-2 text-black">
          Selected duration: {currentDurationMinutes} minutes
        </div>

        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto mb-4">
          {allSlots.map((slot) => {
            const booked = isSlotBooked(slot.index);
            const selected = isSlotSelected(slot.index);
            return (
              <button
                key={slot.index}
                className={`text-xs p-1 rounded ${booked ? "bg-red-500 cursor-not-allowed" : selected ? "bg-blue-400" : "bg-(--color-glass-bg)"} border border-(--color-glass-border) text-black`}
                disabled={booked}
                onClick={() => handleSlotClick(slot.index)}
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        {message && <div className={`mb-2 text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>{message.text}</div>}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 text-black font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
