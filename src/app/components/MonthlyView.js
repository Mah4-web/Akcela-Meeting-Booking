"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import BookingModal from "./BookingModal";

const ROOM_COLORS = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-yellow-400",
  "Meeting B": "bg-pink-400",
};

export default function MonthView({ bookings = [], user }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ⭐ The active month state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goPrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handleOpenModal = (booking) => {
    if (!user) return;
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const bookingsByDay = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const dateKey = format(new Date(b.date), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-6 mb-2">

          {/* Previous Month */}
          <button
            onClick={goPrevMonth}
            className="px-4 py-2 bg-(--color-glass-bg) border border-(--color-glass-border)
            rounded-xl backdrop-blur-md shadow-glass hover:-translate-y-1 hover:shadow-xl 
            transition font-semibold"
          >
            ← Prev
          </button>

          {/* Month Title */}
          <h2 className="text-2xl font-bold text-black">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          {/* Next Month */}
          <button
            onClick={goNextMonth}
            className="px-4 py-2 bg-(--color-glass-bg) border border-(--color-glass-border)
            rounded-xl backdrop-blur-md shadow-glass hover:-translate-y-1 hover:shadow-xl 
            transition font-semibold"
          >
            Next →
          </button>

        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-7 gap-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center font-semibold text-black">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayBookings = bookingsByDay[dayKey] || [];

          return (
            <div
              key={dayKey}
              className="min-h-[120px] p-3 rounded-2xl border border-(--color-glass-border)
              bg-(--color-glass-bg) shadow-glass backdrop-blur-md flex flex-col hover:shadow-xl
              hover:-translate-y-1 transition"
            >
              <div className="font-semibold mb-2 text-black text-center">
                {format(day, "d")}
              </div>

              <div className="flex flex-col gap-1 flex-1">
                {dayBookings.map((b) => {
                  const showDetails =
                    user &&
                    (user.publicMetadata?.role === "admin" ||
                      user.id === b.booked_by);

                  return (
                    <div
                      key={b.id}
                      className={`text-xs p-1 rounded cursor-pointer text-white 
                      ${ROOM_COLORS[b.room] || "bg-gray-400"} 
                      hover:opacity-90 transition`}
                      onClick={() => handleOpenModal(b)}
                      title={showDetails ? `${b.customerName} - ${b.purpose}` : "Booked"}
                    >
                      {b.room}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {modalOpen && selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          user={user}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
