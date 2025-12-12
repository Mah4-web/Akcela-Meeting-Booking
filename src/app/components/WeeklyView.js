"use client";

import { addMinutes, addDays, format, startOfWeek, setHours, setMinutes } from "date-fns";
import React from "react";

const SLOT_INTERVAL_MINUTES = 15;
const START_HOUR = 8;
const END_HOUR = 24;

const ROOM_COLORS = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-purple-400",
  "Meeting B": "bg-yellow-400",
};

export default function WeeklyView({
  weekStart,
  bookings = [],
  onPrevWeek,
  onNextWeek,
  onSlotClick,
}) {
  const week = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(week, i));

  // Total number of 15-min slots from 08:00 to 24:00
  const HOURS = Array.from(
    { length: (END_HOUR - START_HOUR) * (60 / SLOT_INTERVAL_MINUTES) },
    (_, i) => i
  );

  // Find booking for a specific date + slot index
  const getBookingAtSlot = (dayIndex, slotIndex) => {
    const dateStr = format(days[dayIndex], "yyyy-MM-dd");

    return bookings.find(
      (b) =>
        b.date === dateStr &&
        slotIndex >= b.startIndex &&
        slotIndex <= b.endIndex
    );
  };

  // Generate the proper HH:mm label for each slot
  const getTimeLabel = (slotIndex) => {
    const minutesFromStart = slotIndex * SLOT_INTERVAL_MINUTES;
    const hour = START_HOUR + Math.floor(minutesFromStart / 60);
    const minute = minutesFromStart % 60;
    const d = new Date();
    return format(setMinutes(setHours(d, hour), minute), "HH:mm");
  };

  return (
    <div className="rounded-xl p-4 bg-(--color-glass-bg) border border-(--color-glass-border) backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevWeek} className="btn-glass">
          ← Prev Week
        </button>
        <h2 className="text-xl font-semibold text-black">
          {format(week, "dd-MM-yyyy")} &ndash;{" "}
          {format(addDays(week, 6), "dd-MM-yyyy")}
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

        {/* Time rows + slot grid */}
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
                      isBooked
                        ? `${ROOM_COLORS[booking.room] || "bg-red-500"} text-white cursor-not-allowed`
                        : "bg-[rgba(255,255,255,0.2)] hover:bg-blue-500 hover:shadow-xl"
                    }`}
                  title={
                    isBooked
                      ? booking.customerName ?? booking.room
                      : "Available"
                  }
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
