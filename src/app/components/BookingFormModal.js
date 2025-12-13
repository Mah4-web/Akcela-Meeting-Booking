"use client";

import { useState, useEffect, useMemo } from "react";

// import { requireAuth, getAuth } from "@clerk/clerk-sdk-node";
// import { ClerkExpressWithAuth, getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/backend";


/**
 * BookingFormModal
 *
 * Props:
 *  - booking: existing booking object (edit mode) or null
 *  - bookings: array of existing bookings for that date (used for collision detection)
 *  - date: selected date (string 'YYYY-MM-DD' or Date object)
 *  - onClose(): close modal
 *  - onSave(updatedBooking): callback after successful save (server response)
 *
 * Slot model:
 *  - index 0 corresponds to START_HOUR:00
 *  - each index increments by SLOT_INTERVAL_MINUTES
 */

const SLOT_INTERVAL_MINUTES = 15;
const MAX_BOOKING_MINUTES = 120;
const MAX_SLOTS_PER_BOOKING = MAX_BOOKING_MINUTES / SLOT_INTERVAL_MINUTES;
const START_HOUR = 8;
const END_HOUR = 24;

function generateSlots() {
  const slots = [];
  let index = 0;
  for (let h = START_HOUR; h < END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push({ index, label: `${hh}:${mm}` });
      index++;
    }
  }
  return slots;
}

const allSlots = generateSlots();
const TOTAL_SLOTS = allSlots.length;

// Helpers
function toDateObject(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  // assume 'YYYY-MM-DD' or similar
  const parsed = new Date(dateInput);
  if (!isNaN(parsed)) return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  // fallback: try splitting
  const parts = String(dateInput).split("-");
  if (parts.length >= 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    return new Date(y, m, d);
  }
  return null;
}

function formatYMD(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function indexToTimeParts(index) {
  const minutesFromStart = index * SLOT_INTERVAL_MINUTES;
  const totalMinutes = START_HOUR * 60 + minutesFromStart;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return { hour, minute };
}

// Build a local ISO timestamp string (no timezone conversion): YYYY-MM-DDTHH:MM:SS
// Handles the case where hour === 24 by rolling to next day 00:00
function buildLocalISO(dateInput, hour, minute) {
  const day0 = toDateObject(dateInput);
  if (!day0) throw new Error("Invalid date provided");

  // If hour === 24, roll to next day 00:00
  if (hour >= 24) {
    const next = new Date(day0);
    next.setDate(next.getDate() + 1);
    const yyyy = formatYMD(next);
    const hh = "00";
    const mm = String(minute).padStart(2, "0");
    return `${yyyy}T${hh}:${mm}:00`;
  }

  const yyyy = formatYMD(day0);
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${yyyy}T${hh}:${mm}:00`;
}


export default function BookingFormModal({
  booking = null,
  bookings = [],
  user, 
  date,
  onClose,
  onSave,
}) {
  
  // initialize selection from booking if editing
  const [selectedRange, setSelectedRange] = useState(
    booking && Number.isFinite(booking.startIndex) && Number.isFinite(booking.endIndex)
      ? { startIndex: booking.startIndex, endIndex: booking.endIndex }
      : null
  );

  const [customerName, setCustomerName] = useState(booking?.customerName || "");
  const [room, setRoom] = useState(booking?.room || 1);
  const [purpose, setPurpose] = useState(booking?.purpose || "");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);


  // collision detection: ignores the booking being edited (if any)
  const isSlotBooked = (index) =>
    bookings?.some((b) => {
      if (booking && b.id === booking.id) return false;
      return index >= b.startIndex && index <= b.endIndex;
    });

  const isSlotSelected = (index) =>
    selectedRange && index >= selectedRange.startIndex && index <= selectedRange.endIndex;

  const isRangeAvailable = (startIndex, endIndex) => {
    if (startIndex < 0 || endIndex >= TOTAL_SLOTS) return false;
    for (let i = startIndex; i <= endIndex; i++) {
      if (isSlotBooked(i)) return false;
    }
    return true;
  };

  // Selection behavior:
  // - First click: set start=end=slot
  // - Click inside current range: reset to that single slot
  // - Click outside: expand range to include clicked slot (continuous)
  const handleSlotClick = (slotIndex) => {
    setMessage(null);

    if (isSlotBooked(slotIndex)) {
      setMessage({ type: "error", text: "This time is already booked." });
      return;
    }

    if (!selectedRange) {
      setSelectedRange({ startIndex: slotIndex, endIndex: slotIndex });
      return;
    }

    const { startIndex, endIndex } = selectedRange;

    // clicked inside: reset to that single slot
    if (slotIndex >= startIndex && slotIndex <= endIndex) {
      setSelectedRange({ startIndex: slotIndex, endIndex: slotIndex });
      return;
    }

    // new range is continuous from min to max between current selection and clicked slot
    const newStart = Math.min(startIndex, slotIndex);
    const newEnd = Math.max(endIndex, slotIndex);
    const slotCount = newEnd - newStart + 1;

    if (slotCount > MAX_SLOTS_PER_BOOKING) {
      setMessage({ type: "error", text: "Maximum booking length is 2 hours." });
      return;
    }

    if (!isRangeAvailable(newStart, newEnd)) {
      setMessage({ type: "error", text: "Selection overlaps with an existing booking." });
      return;
    }

    setSelectedRange({ startIndex: newStart, endIndex: newEnd });
  };

  const clearSelection = () => {
    setSelectedRange(null);
    setMessage(null);
  };

  const currentDurationMinutes = useMemo(() => {
    if (!selectedRange) return 0;
    return (selectedRange.endIndex - selectedRange.startIndex + 1) * SLOT_INTERVAL_MINUTES;
  }, [selectedRange]);

  const selectedTimeSpan = useMemo(() => {
    if (!selectedRange) return "";
    const startParts = indexToTimeParts(selectedRange.startIndex);
    const endParts = indexToTimeParts(selectedRange.endIndex + 1); // end is exclusive
    // Format HH:MM
    const startLabel = `${String(startParts.hour).padStart(2, "0")}:${String(startParts.minute).padStart(2, "0")}`;
    // endParts.hour may be 24 -> will display as "24:00"; acceptable for display
    const endLabel = `${String(endParts.hour).padStart(2, "0")}:${String(endParts.minute).padStart(2, "0")}`;
    return `${startLabel} – ${endLabel}`;
  }, [selectedRange]);

  const friendlyDateLabel = useMemo(() => {
    const d = toDateObject(date);
    if (!d) return String(date ?? "");
    return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  }, [date]);

  // Save handler: builds payload with room_id, start_time, end_time, purpose
  const handleSave = async (req) => {
    setMessage(null);

      // const { userId } = getAuth(req);

  //   if (!userId) {
  //     return res.status(401).json({ error: "Unauthenticated" });
  //   }
  // // Fetch the user object if needed
  //  const user = await clerkClient.users.getUser(userId);

    if (!customerName.trim()) {
      setMessage({ type: "error", text: "Please enter your name." });
      return;
    }

    if (!purpose.trim()) {
      setMessage({ type: "error", text: "Please enter a purpose." });
      return;
    }

    if (!selectedRange) {
      setMessage({ type: "error", text: "Please select at least one time slot." });
      return;
    }

    const { startIndex, endIndex } = selectedRange;

    if (!isRangeAvailable(startIndex, endIndex)) {
      setMessage({ type: "error", text: "Selected slots overlap with another booking." });
      return;
    }

    // Convert indices to local ISO strings
    // start: time at startIndex
    const startParts = indexToTimeParts(startIndex);
    const endParts = indexToTimeParts(endIndex + 1); // exclusive end
    let start_time, end_time;
    try {
      start_time = buildLocalISO(date, startParts.hour, startParts.minute);
      end_time = buildLocalISO(date, endParts.hour, endParts.minute);
    } catch (err) {
      setMessage({ type: "error", text: "Invalid date provided." });
      return;
    }

    // build payload matching your API route
    const payload = {
      room_id: Number(room),
      start_time: start_time + "Z",
      end_time: end_time + "Z",
      purpose: purpose.trim(),
      user_id: user.id,
      booked_by: booking?.booked_by || user.username || "Admin",
    };

    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      let data = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error("Server returned invalid JSON.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to save booking");
      }

      // Call onSave with the server-returned booking (if provided)
      onSave?.(data.booking ?? data);
      onClose?.();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-(--color-glass-bg) p-6 rounded-2xl shadow-glass backdrop-blur-md min-w-[350px] max-w-lg">
        <h2 className="text-xl font-bold text-black mb-1">
          {booking ? "Edit Booking" : "New Booking"}
        </h2>

        <div className="text-sm text-(--color-gray-dark) mb-3">
          Date selected: <span className="font-medium text-black">{friendlyDateLabel}</span><br></br>
          Created by: {user?.username || "Admin"}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-black">
              Name
              <input
                className="w-full p-1 mt-1 border rounded border-(--color-glass-border)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className="block mb-2 text-black">
              Purpose
              <input
                className="w-full p-1 mt-1 border rounded border-(--color-glass-border)"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Meeting purpose"
              />
            </label>

            <label className="block mb-2 text-black">
              Room
              <select
                className="w-full p-1 mt-1 border rounded border-(--color-glass-border)"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              >
                <option value={1}>Conference A</option>
                <option value={2}>Conference B</option>
                <option value={3}>Meeting A</option>
                <option value={4}>Meeting B</option>
              </select>
            </label>
          </div>

          <div>
            {/* <p>Maximum booking time is 2 hours, with up to eight 15 minute slots.</p> */}
            <div className="text-sm text-black mb-2">
              Selected duration: <span className="font-medium">{currentDurationMinutes} minutes</span>
            </div>
            {selectedRange && (
              <div className="text-sm text-black mb-2">
                Selected time: <span className="font-medium">{selectedTimeSpan}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-200 text-black"
                type="button"
                onClick={() => {
                  // quick action: if there is a selection, reset to its start; otherwise clear
                  if (selectedRange) {
                    setSelectedRange({ startIndex: selectedRange.startIndex, endIndex: selectedRange.startIndex });
                    setMessage(null);
                  } else {
                    setMessage(null);
                    clearSelection();
                  }
                }}
              >
                Reset to start
              </button>

              <button
                className="px-3 py-1 rounded bg-gray-200 text-black"
                type="button"
                onClick={clearSelection}
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>

        {/* slots grid */}
        <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto mt-4 mb-4">
          {allSlots.map((slot) => {
            const booked = isSlotBooked(slot.index);
            const selected = isSlotSelected(slot.index);
            return (
              <button
                key={slot.index}
                disabled={booked}
                onClick={() => handleSlotClick(slot.index)}
                className={`text-xs p-1 rounded border border-(--color-glass-border) ${
                  booked ? "bg-red-500 cursor-not-allowed text-white" :
                    selected ? "bg-blue-400 text-white" :
                    "bg-(--color-glass-bg) text-black"
                }`}
                title={slot.label}
                type="button"
              >
                {slot.label}
              </button>
            );
          })}
        </div>

        {message && (
          <div className={`mb-2 text-sm ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-300 text-black font-semibold"
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? "Saving..." : booking ? "Save changes" : "Create booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
