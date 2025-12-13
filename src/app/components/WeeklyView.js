"use client";

import { addDays, format, startOfWeek, setHours, setMinutes } from "date-fns";
import React from "react";

const SLOT_INTERVAL_MINUTES = 15;
const START_HOUR = 8;
const END_HOUR = 24;

const ROOM_VALUES = {
  1: "Conference A",
  2: "Conference B",
  3: "Meeting A",
  4: "Meeting B",
}

const ROOM_COLORS = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-purple-400",
  "Meeting B": "bg-yellow-400",
};

export default function WeeklyView({
  weekStart,
  bookings = [],
  isSignedIn,
  onPrevWeek,
  onNextWeek,
  onSlotClick,
}) {
  const week = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(week, i));

  const totalSlots = (END_HOUR - START_HOUR) * (60 / SLOT_INTERVAL_MINUTES);
  const HOURS = Array.from({ length: totalSlots }, (_, i) => i);

  // Convert booking times to slot indices
  const getBookingSlots = (booking) => {
    const startDate = new Date(booking.start_time.replace("+00:00", "Z"));
    const endDate = new Date(booking.end_time.replace("+00:00", "Z"));

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    const startSlot = Math.floor((startMinutes - START_HOUR * 60) / SLOT_INTERVAL_MINUTES);
    const endSlot = Math.ceil((endMinutes - START_HOUR * 60) / SLOT_INTERVAL_MINUTES);

    return { startSlot, endSlot };
  };

  const getTimeLabel = (slotIndex) => {
    const minutesFromStart = slotIndex * SLOT_INTERVAL_MINUTES;
    const hour = START_HOUR + Math.floor(minutesFromStart / 60);
    const minute = minutesFromStart % 60;
    const d = new Date();
    return format(setMinutes(setHours(d, hour), minute), "HH:mm");
  };

  // Check if a slot is booked
const getBookingAtSlot = (dayIndex, slotIndex) => {
  // Guard against invalid indices
  if (!days[dayIndex]) return null;
  if (slotIndex < 0 || slotIndex >= HOURS.length) return null;

  const day = days[dayIndex];

  // Slot start in minutes since midnight (UTC)
  const slotMinutes =
    START_HOUR * 60 + slotIndex * SLOT_INTERVAL_MINUTES;

  // Visible grid bounds in minutes
  const gridStartMinutes = START_HOUR * 60;
  const gridEndMinutes = END_HOUR * 60;

  return bookings.find((b) => {
    if (!b?.start_time || !b?.end_time) return false;

    const startDate = new Date(b.start_time.replace("+00:00", "Z"));
    const endDate = new Date(b.end_time.replace("+00:00", "Z"));

    if (Number.isNaN(startDate) || Number.isNaN(endDate)) return false;

    // Must be same calendar day (UTC)
    if (
      format(startDate, "yyyy-MM-dd") !==
      format(day, "yyyy-MM-dd")
    ) {
      return false;
    }

    // Booking start/end in minutes (UTC)
    let bookingStartMinutes =
      startDate.getUTCHours() * 60 +
      startDate.getUTCMinutes();

    let bookingEndMinutes =
      endDate.getUTCHours() * 60 +
      endDate.getUTCMinutes();

    // Clamp booking to visible grid range
    bookingStartMinutes = Math.max(
      bookingStartMinutes,
      gridStartMinutes
    );
    bookingEndMinutes = Math.min(
      bookingEndMinutes,
      gridEndMinutes
    );

    // If booking does not intersect grid at all
    if (bookingStartMinutes >= bookingEndMinutes) return false;

    // Slot is inside booking range
    return (
      slotMinutes >= bookingStartMinutes &&
      slotMinutes < bookingEndMinutes
    );
  });
};




  return (
    <div className="rounded-xl p-4 bg-(--color-glass-bg) border border-(--color-glass-border) backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevWeek} className="btn-glass">
          ← Prev Week
        </button>
        <h2 className="text-xl font-semibold text-black">
          {format(week, "dd-MM-yyyy")} &ndash; {format(addDays(week, 6), "dd-MM-yyyy")}
        </h2>
        <button onClick={onNextWeek} className="btn-glass">
          Next Week →
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">
        {/* Empty top-left corner */}
        <div></div>

        {/* Day headers */}
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="text-center py-2 font-semibold text-black"
          >
            {format(day, "EEE dd-MM")}
          </div>
        ))}

        {/* Time rows */}
        {HOURS.map((slotIndex) => (
          <React.Fragment key={slotIndex}>
            {/* Time label */}
            <div className="text-xs text-gray-700 p-1 text-center">
              {getTimeLabel(slotIndex)}
            </div>

            {/* Slot columns */}
            {days.map((day, dayIndex) => {
              const booking = getBookingAtSlot(dayIndex, slotIndex);
              const isBooked = Boolean(booking);

              return (
                <button
                  key={`${dayIndex}-${slotIndex}`}
                  disabled={isBooked}
                  onClick={() => onSlotClick(day, slotIndex)}
                  className={`h-10 m-0.5 rounded-md text-xs text-center transition shadow-md shadow-black/20
                    ${
                      isBooked && isSignedIn
                        ? `${ROOM_COLORS[ROOM_VALUES[booking.room_id]] ?? "bg-red-500"} text-white cursor-not-allowed`
                        : isBooked
                        ? "bg-red-500 text-white cursor-not-allowed"
                        : "bg-[rgba(255,255,255,0.2)] hover:bg-blue-500 hover:shadow-xl"
                    }`}
                  title={
                    isBooked && isSignedIn
                      ? booking.booked_by ?? "Booked"
                      : isBooked
                      ? "Booked"
                      : "Available"
                  }
                >
                  <p>
                    {isBooked && isSignedIn
                      ? booking.purpose
                      : isBooked
                      ? "Booked"
                      : "Available"}
                  </p>
                </button>

              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
