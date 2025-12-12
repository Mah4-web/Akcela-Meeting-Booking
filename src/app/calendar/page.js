"use client";

import { useState, useEffect } from "react";
import WeeklyView from "../components/WeeklyView";
import DayView from "../components/DayView";
import BookingFormModal from "../components/BookingFormModal"; // updated modal
import { subWeeks, addWeeks, format } from "date-fns";

export default function CalendarPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  const openBookingModal = (booking = null) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeBookingModal = () => {
    setSelectedBooking(null);
    setModalOpen(false);
  };

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load bookings");
        setBookings(data.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  // Only show booked timeslots to guests, full details to logged-in users handled in modal
  const sanitizedBookings = bookings.map((b) => ({
    ...b,
    customerName: b.customerName ? b.customerName : "Booked",
  }));

  return (
    <main className="flex flex-col md:flex-row p-4 md:p-8 gap-6 bg-(--color-gray-light) min-h-screen">
      {/* Weekly View */}
      <div className="flex-1">
        <WeeklyView
          weekStart={weekStart}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          bookings={sanitizedBookings}
          onSlotClick={openBookingModal}
        />
      </div>

      {/* Day View for selected day */}
      <div className="w-full md:w-1/4 mb-6 md:mb-0">
        <h1 className="text-center font-extrabold text-2xl mb-2 text-black">
          Akcela Booking Calendar
        </h1>
        <DayView
          date={today}
          bookings={sanitizedBookings}
          onSlotClick={openBookingModal}
        />
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <BookingFormModal
          booking={selectedBooking}
          onClose={closeBookingModal}
          onSave={(newBooking) => {
            setBookings((prev) => {
              const filtered = prev.filter((b) => b.id !== newBooking.id);
              return [...filtered, newBooking];
            });
            closeBookingModal();
          }}
          onDelete={(deletedBookingId) => {
            setBookings((prev) =>
              prev.filter((b) => b.id !== deletedBookingId)
            );
            closeBookingModal();
          }}
        />
      )}

      {loading && (
        <div className="absolute top-4 right-4 p-2 bg-white/80 rounded shadow">
          Loading bookings...
        </div>
      )}
    </main>
  );
}
