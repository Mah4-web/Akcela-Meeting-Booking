"use client";

import { useState, useMemo } from "react";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";
import BookingModal from "./BookingModal";

const ROOM_COLORS = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-yellow-400",
  "Meeting B": "bg-pink-400",
};

export default function MonthView({ bookings, user }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleOpenModal = (booking) => {
    if (!user) return; // only signed-in users can see details
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const bookingsByDay = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const dateKey = format(new Date(b.date), "dd-MM-yyyy");
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  return (
    <>
      <div className="grid grid-cols-7 gap-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className="font-semibold text-center text-black">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dayKey = format(day, "dd-MM-yyyy");
          const dayBookings = bookingsByDay[dayKey] || [];

          return (
            <div
              key={dayKey}
              className="min-h-80 p-2 rounded-xl border border-(--color-glass-border) bg-(--color-glass-bg) shadow-glass backdrop-blur-md"
            >
              <div className="font-semibold mb-1 text-black">{format(day, "dd-MM-yyyy")}</div>

              {dayBookings.map((b) => {
                const showDetails = user && (user.publicMetadata?.role === "admin" || user.id === b.booked_by);

                return (
                  <div
                    key={b.id}
                    className={`text-xs mb-1 p-1 rounded cursor-pointer text-white ${ROOM_COLORS[b.room] || "bg-gray-400"}`}
                    onClick={() => handleOpenModal(b)}
                    title={showDetails ? `${b.customerName} - ${b.purpose}` : "Booked"}
                  >
                    {b.room}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

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
