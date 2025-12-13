"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import WeeklyView from "../components/WeeklyView";
import DayView from "../components/DayView";
import MonthView from "../components/MonthlyView";
import BookingFormModal from "../components/BookingFormModal";
import CalendarHeader from "../components/CalendarHeader";
import { subWeeks, addWeeks } from "date-fns";
import { SignOutButton, useUser } from "@clerk/nextjs";

import { useUser, SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";

export default function CalendarPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState("week"); // default view is week

  const { user } = useUser();

  const { user, isSignedIn } = useUser();

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  const handleSlotClick = (date, startIndex = null) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    setSelectedDate(date);
    setSelectedBooking({ startIndex }); // optional prefill for weekly/day click
    setModalOpen(true);
  };


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

  const sanitizedBookings = bookings.map((b) => ({
    ...b,
    customerName: b.customerName ?? "Booked",
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
          onSlotClick={handleSlotClick}
        />
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white/40 border border-(--color-glass-border) shadow-lg backdrop-blur-md p-4 rounded-xl">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-black cursor-pointer hover:text-blue-500 transition">
          Akcela Meeting Booking
        </h1>

      
        <CalendarHeader
          currentDate={today}
          view={view}
          setView={setView}
        />

        {/* Logout */}
        {user && (
          <SignOutButton>
            <Link
              href="/"
              className="bg-(--color-glass-bg) backdrop-blur-md border border-(--color-glass-border) shadow-lg rounded-xl px-6 py-2 text-black font-semibold transition-all duration-500 hover:shadow-2xl hover:bg-blue-500 hover:-translate-y-1"
            >
              Logout
            </Link>
          </SignOutButton>
        )}
      </div>

      {/* FULL-WIDTH VIEW */}
      <div className="w-full">

        {view === "month" && (
          <MonthView
            bookings={sanitizedBookings}
            user={{ id: user?.id }}
          />
        )}

        {view === "week" && (
          <WeeklyView
            weekStart={weekStart}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            bookings={sanitizedBookings}
            onSlotClick={openBookingModal}
          />
        )}

        {view === "day" && (
          <DayView
            date={today}
            bookings={sanitizedBookings}
            onSelectSlot={openBookingModal}
          />
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <BookingFormModal
          booking={selectedBooking}
                date={selectedDate}
           user={user}
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
        <div className="absolute top-4 right-4 p-2 bg-white/80 rounded shadow">Loading…</div>
      )}
    </main>
  );
}
