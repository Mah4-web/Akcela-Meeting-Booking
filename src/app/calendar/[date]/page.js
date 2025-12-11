"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const SLOT_INTERVAL_MINUTES = 15;
const MAX_BOOKING_MINUTES = 120;
const MAX_SLOTS_PER_BOOKING = MAX_BOOKING_MINUTES / SLOT_INTERVAL_MINUTES;
const START_HOUR = 9;
const END_HOUR = 17;

function generateSlots() {
  const slots = [];
  let index = 0;
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MINUTES) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push({
        index,
        label: `${hh}:${mm}`,
      });
      index++;
    }
  }
  return slots;
}

const allSlots = generateSlots();

export default function DayBookingPage({ params }) {
  const date = params.date; // "YYYY-MM-DD"

  const [bookings, setBookings] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch(`/api/bookings?date=${date}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load bookings");
        }
        setBookings(data.bookings || []);
      } catch (err) {
        console.error(err);
        setMessage({
          type: "error",
          text: err.message || "Failed to load bookings.",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [date]);

  const isSlotBooked = (index) =>
    bookings.some((b) => index >= b.startIndex && index <= b.endIndex);

  const isSlotSelected = (index) =>
    selectedRange &&
    index >= selectedRange.startIndex &&
    index <= selectedRange.endIndex;

  const isRangeAvailable = (startIndex, endIndex) => {
    for (let i = startIndex; i <= endIndex; i++) {
      if (isSlotBooked(i)) return false;
    }
    return true;
  };

  const handleSlotClick = (slotIndex) => {
    setMessage(null);

    if (isSlotBooked(slotIndex)) {
      setMessage({
        type: "error",
        text: "That time is already booked.",
      });
      return;
    }

    if (
      selectedRange &&
      slotIndex >= selectedRange.startIndex &&
      slotIndex <= selectedRange.endIndex
    ) {
      setSelectedRange(null);
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
      setMessage({
        type: "error",
        text: "Maximum booking is 2 hours (8 x 15-minute slots).",
      });
      return;
    }

    if (!isRangeAvailable(newStart, newEnd)) {
      setMessage({
        type: "error",
        text: "Selection overlaps with an existing booking.",
      });
      return;
    }

    setSelectedRange({ startIndex: newStart, endIndex: newEnd });
  };

  const handleBook = async () => {
    setMessage(null);

    if (!customerName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter the customer's name.",
      });
      return;
    }

    if (!selectedRange) {
      setMessage({
        type: "error",
        text: "Please select at least one 15-minute slot.",
      });
      return;
    }

    const { startIndex, endIndex } = selectedRange;
    const count = endIndex - startIndex + 1;

    if (count > MAX_SLOTS_PER_BOOKING) {
      setMessage({
        type: "error",
        text: "Maximum booking is 2 hours (8 x 15-minute slots).",
      });
      return;
    }

    if (!isRangeAvailable(startIndex, endIndex)) {
      setMessage({
        type: "error",
        text: "Selection overlaps with an existing booking.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startIndex,
          endIndex,
          customerName: customerName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // append newly created booking
      setBookings((prev) => [...prev, data.booking]);
      setSelectedRange(null);
      setCustomerName("");
      setMessage({
        type: "success",
        text: "Booking created ✅",
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to create booking.",
      });
    } finally {
      setSaving(false);
    }
  };

  const currentDurationMinutes = useMemo(() => {
    if (!selectedRange) return 0;
    const count = selectedRange.endIndex - selectedRange.startIndex + 1;
    return count * SLOT_INTERVAL_MINUTES;
  }, [selectedRange]);

  const readableDate = useMemo(() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [date]);

  return (
    <main className="calendar-root">
      <div className="calendar-card">
        <header className="calendar-header">
          <div>
            <h1 className="calendar-title">Bookings for {readableDate}</h1>
            <p className="calendar-subtitle">
              15-minute slots · Max 2 hours per customer
            </p>
          </div>
          <Link href="/calendar" className="btn-secondary">
            ← Back to month
          </Link>
        </header>

        <section className="booking-top">
          <div className="booking-inputs">
            <label className="field-label">
              Customer name
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Alex Smith"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </label>

            <div className="duration-badge">
              Selected duration:{" "}
              {currentDurationMinutes > 0
                ? `${currentDurationMinutes} minutes`
                : "none"}
            </div>
          </div>

          <button
            onClick={handleBook}
            className="btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Book selected time"}
          </button>
        </section>

        {loading && (
          <div className="alert alert-success">Loading bookings…</div>
        )}

        {message && (
          <div
            className={
              message.type === "error"
                ? "alert alert-error"
                : "alert alert-success"
            }
          >
            {message.text}
          </div>
        )}

        <section className="slots-grid">
          {allSlots.map((slot) => {
            const booked = isSlotBooked(slot.index);
            const selected = isSlotSelected(slot.index);

            let extraClass = "";
            if (booked) extraClass = "slot-booked";
            else if (selected) extraClass = "slot-selected";

            return (
              <button
                key={slot.index}
                className={`slot-cell ${extraClass}`}
                onClick={() => handleSlotClick(slot.index)}
                disabled={booked || loading}
              >
                {slot.label}
              </button>
            );
          })}
        </section>

        {bookings.length > 0 && (
          <section className="booking-list">
            <h2 className="booking-list-title">Existing bookings</h2>
            <ul>
              {bookings
                .slice()
                .sort((a, b) => a.startIndex - b.startIndex)
                .map((b) => {
                  const start = allSlots[b.startIndex]?.label || "";
                  const endSlot = allSlots[b.endIndex + 1];
                  const end = endSlot ? endSlot.label : "end";
                  return (
                    <li key={b.id} className="booking-item">
                      <span className="booking-time">
                        {start} – {end}
                      </span>
                      <span className="booking-name">{b.customerName}</span>
                    </li>
                  );
                })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
