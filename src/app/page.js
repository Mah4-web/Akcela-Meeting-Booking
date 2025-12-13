"use client";

import { useState, useEffect } from "react";
import { useUser, SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import CalendarMonth from "./components/CalendarMonth";
import WeeklyView from "./components/WeeklyView";
import BookingFormModal from "./components/BookingFormModal";
import { subWeeks, addWeeks } from "date-fns";



export default function HomePage({ bookings }) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [loadedBookings, setLoadedBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { user, isSignedIn } = useUser();

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  // const [user, setUser] = useState(null);
  
  useEffect(() => {
      fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => setLoadedBookings(data.bookings || []))
      .catch((err) => console.error("Error fetching bookings:", err))
      .finally(() => setBookingsLoading(false));
  }, [bookingsLoading]);


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
          <br></br>
          {bookingsLoading ? <span>(Loading booked meetings...)</span> : <></>}
        </p>
        <div className="bg-(--color-glass-bg) border border-(--color-glass-border) rounded-2xl p-2 backdrop-blur-md shadow-xl">
          {bookingsLoading ?
          <CalendarMonth
            month={today.getMonth() + 1}
            today={today}
            bookings={bookings}
            userId={user?.id}
            onSelectDate={handleSlotClick}
          />
          :
          <CalendarMonth
            month={today.getMonth() + 1}
            today={today}
            bookings={bookings}
            userId={user?.id}
            onSelectDate={handleSlotClick}
          />    
          }
        </div>
      </div>

      {/* Right: Weekly Booking View */}
      <div className="flex-1">
             {bookingsLoading ?
        <WeeklyView
          weekStart={weekStart}
          bookings={bookings}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onSlotClick={handleSlotClick}
        />
        :
        <WeeklyView
          weekStart={weekStart}
          bookings={loadedBookings}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onSlotClick={handleSlotClick}
        />

             }
      </div>

      {/* Booking Form Modal */}
      {modalOpen ? 
       bookingsLoading ? 
        <BookingFormModal
          booking={selectedBooking}
          date={selectedDate}
          user={user}
                 bookings={bookings}
          onClose={() => setModalOpen(false)}
          onSave={() => setModalOpen(false)}
        />
        :
        <BookingFormModal
          booking={selectedBooking}
          date={selectedDate}
          user={user}
          bookings={loadedBookings}
          onClose={() => setModalOpen(false)}
          onSave={() => setModalOpen(false)}
        />
      :
      
      <></>
      }
    </div>
  );
}
