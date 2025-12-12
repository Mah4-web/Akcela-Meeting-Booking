"use client";

import React, { useState } from "react";
import {
  startOfWeek,
  addDays,
  addMinutes,
  startOfDay,
  format
} from "date-fns";
import BookingModal from "./BookingModal";

const ROOM_COLORS = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-yellow-400",
  "Meeting B": "bg-pink-400",
};

export default function WeeklyView({
  weekStart,
  onPrevWeek,
  onNextWeek,
  bookings = [],
  user
}) {

  // --- MODAL STATE (required for opening modal) ---
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // --- REQUIRED CONSTANTS (make sure these exist in your project) ---
  const START_HOUR = 8;
  const END_HOUR = 18;
  const SLOT_INTERVAL_MINUTES = 15;

  const week = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = [...Array(7)].map((_, i) => addDays(week, i));

  const HOURS = Array.from(
    { length: (END_HOUR - START_HOUR) * (60 / SLOT_INTERVAL_MINUTES) },
    (_, i) => i
  );

  const getBookingAtSlot = (dayIndex, slotIndex) => {
    const dateStr = format(days[dayIndex], "yyyy-MM-dd");

    return bookings.find(
      (b) =>
        b.date === dateStr &&
        slotIndex >= b.start_index &&
        slotIndex <= b.end_index
    );
  };

  // --- BOOKED SLOT CLICK ---
  const handleOpenModal = (booking) => {
    console.log("Opening modal for EXISTING booking:", booking);
    setSelectedBooking(booking);
    setModalOpen(true);       // <<<< this opens the modal
  };

  // --- EMPTY SLOT CLICK ---
  const handleSlotClick = (day, slotIndex) => {
    const dayStart = startOfDay(day);
    const minutesFromMidnight =
      START_HOUR * 60 + slotIndex * SLOT_INTERVAL_MINUTES;

    const slotDateTime = addMinutes(dayStart, minutesFromMidnight);

    const newBookingDraft = {
      id: null,
      date: format(day, "yyyy-MM-dd"),
      start_index: slotIndex,
      end_index: slotIndex,
      start_time: slotDateTime,
      room: "",
      purpose: "",
      customerName: "",
    };

    console.log("Opening modal for NEW booking:", newBookingDraft);
    setSelectedBooking(newBookingDraft);
    setModalOpen(true);       // <<<< this opens the modal
  };

  return (
    <>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <button onClick={onPrevWeek}>Prev Week</button>
          <h2>
            {format(week, "dd-MM-yyyy")} – {format(addDays(week, 6), "dd-MM-yyyy")}
          </h2>
          <button onClick={onNextWeek}>Next Week</button>
        </div>

        <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1">

          <div></div>
          {days.map((d) => (
            <div key={d.toISOString()} className="text-center font-bold">
              {format(d, "EEE dd-MM")}
            </div>
          ))}

          {HOURS.map((_, slotIndex) => (
            <React.Fragment key={slotIndex}>
              <div className="text-xs text-gray-500 p-1">
                {format(
                  addMinutes(week, START_HOUR * 60 + slotIndex * SLOT_INTERVAL_MINUTES),
                  "HH:mm"
                )}
              </div>

              {days.map((day, dayIndex) => {
                const booking = getBookingAtSlot(dayIndex, slotIndex);
                const isBooked = Boolean(booking);

                return (
                  <button
                    key={`${dayIndex}-${slotIndex}`}
                    onClick={() =>
                      isBooked
                        ? handleOpenModal(booking)
                        : handleSlotClick(day, slotIndex)
                    }
                    className={`h-12 rounded ${
                      isBooked
                        ? `${ROOM_COLORS[booking.room] || "bg-red-500"} text-white`
                        : "bg-gray-200 hover:bg-blue-300"
                    }`}
                  ></button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* === BOOKING MODAL === */}
      {modalOpen && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          user={user}
          onClose={() => {
            console.log("Closing modal");
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}
