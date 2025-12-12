"use client";

import { useState } from "react";
import { useUser, SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import CalendarMonth from "./components/CalendarMonth";
import WeeklyView from "./components/WeeklyView";
import BookingFormModal from "./components/BookingFormModal";
import { subWeeks, addWeeks } from "date-fns";



export default function HomePage({ bookings }) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { user, isSignedIn } = useUser();

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  // const [user, setUser] = useState(null);
  
  // useEffect(() => {
  //     fetch("/api/get-user")
  //       .then(res => res.json())
  //       .then(data => setUser(data));
  // }, []);


  const handleSlotClick = (date, startIndex = null) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    setSelectedDate(date);
    setSelectedBooking({ startIndex }); // optional prefill for weekly/day click
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-8 gap-6 bg-(--color-gray-light) min-h-screen">
      
      {/* Left: Monthly Calendar */}
      <div className="w-full md:w-1/4 mb-6 md:mb-0">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-center font-extrabold text-2xl text-black">
            Akcela Booking
          </h1>
          <SignedIn>
            <SignOutButton>
              <button className="btn-glass">Logout</button>
            </SignOutButton>
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="btn-glass">Sign In</button>
            </SignInButton>
          </SignedOut>
        </div>
        <p className="text-center mb-4 text-(--color-gray-dark)">
          Select a date to book a slot
        </p>
        <div className="bg-(--color-glass-bg) border border-(--color-glass-border) rounded-2xl p-2 backdrop-blur-md shadow-xl">
          <CalendarMonth
            month={today.getMonth() + 1}
            today={today}
            bookings={bookings}
            userId={user?.id}
            onSelectDate={handleSlotClick}
          />
        </div>
      </div>

      {/* Right: Weekly Booking View */}
      <div className="flex-1">
        <WeeklyView
          weekStart={weekStart}
          bookings={bookings}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onSlotClick={handleSlotClick}
        />
      </div>

      {/* Booking Form Modal */}
      {modalOpen && (
        <BookingFormModal
          booking={selectedBooking}
          date={selectedDate}
          user={user}
          bookings={bookings}
          onClose={() => setModalOpen(false)}
          onSave={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
