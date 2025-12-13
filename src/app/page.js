"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import CalendarMonth from "./components/CalendarMonth";
import WeeklyView from "./components/WeeklyView";
import BookingModal from "./components/BookingModal";
import SigningModal from "./components/SigningModal"; // our sign-in/sign-up popup
import { subWeeks, addWeeks } from "date-fns";

export default function HomePage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [signingModalOpen, setSigningModalOpen] = useState(false);

  const { user, isSignedIn } = useUser();

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  const handleSlotClick = (date) => {
    if (!isSignedIn) {
      setSigningModalOpen(true); // show sign-in/sign-up popup
      return;
    }
    setSelectedDate(date);
    setBookingModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-8 gap-6 bg-(--color-gray-light) min-h-screen relative">

    
      <div className="w-full md:w-1/4 mb-6 md:mb-0">

        {/* Title + Logout */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-extrabold text-2xl text-black hover:text-blue-500 cursor-pointer transition-colors">
            Akcela Booking Calendar
          </h1>

          {/* Logout button only shows after signing in */}
          {user && (
            <SignOutButton>
              <button className="btn-glass">Logout</button>
            </SignOutButton>
          )}
        </div>

        <p className="text-center mb-4 text-(--color-gray-dark)">
          Select a date to book your 2-hour slot
        </p>

        <div className="bg-(--color-glass-bg) border border-(--color-glass-border) rounded-2xl p-2 backdrop-blur-md shadow-xl">
          <CalendarMonth
            month={today.getMonth() + 1}
            today={today}
            onSelectDate={handleSlotClick}
          />
        </div>
      </div>

      {/*  Weekly Booking View */}
      <div className="flex-1">
        <WeeklyView
          weekStart={weekStart}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onSlotClick={handleSlotClick}
        />
      </div>

      {/* Booking Modal */}
      {bookingModalOpen && selectedDate && (
        <BookingModal
          date={selectedDate}
          onClose={() => setBookingModalOpen(false)}
          user={user}
        />
      )}

      {/* Sign-In / Sign-Up Modal */}
      {signingModalOpen && (
        <SigningModal onClose={() => setSigningModalOpen(false)} />
      )}

    </div>
  );
}
