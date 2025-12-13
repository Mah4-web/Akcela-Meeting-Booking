"use client";

import { useState, useEffect } from "react";
import { useUser, SignedIn, SignedOut, SignInButton, SignOutButton } from "@clerk/nextjs";
import CalendarMonth from "./components/CalendarMonth";
import WeeklyView from "./components/WeeklyView";
import BookingModal from "./components/BookingModal";
import SigningModal from "./components/SigningModal"; // our sign-in/sign-up popup
import { subWeeks, addWeeks } from "date-fns";
import CalendarHeader from "./components/CalendarHeader";



export default function HomePage({ bookings }) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);
  const [loadedBookings, setLoadedBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [view, setView] = useState("week"); // default view is week

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

            {/* <CalendarHeader
                    currentDate={today}
                    view={view}
                    setView={setView}
                  /> */}

          {/* Logout button only shows after signing in */}
          {isSignedIn ? 
            <SignOutButton>
              <button className="btn-glass">Logout</button>
            </SignOutButton>
            :
             
              <SignInButton />
          
          }
        </div>

        <p className="text-center mb-4 text-(--color-gray-dark)">
          Select a date to book your 2 hour slot 
          <br></br>
          {bookingsLoading ? <span>(Loading booked meetings...)</span> : <></>}
        </p>

        <div className="bg-(--color-glass-bg) border border-(--color-glass-border) rounded-2xl p-2 backdrop-blur-md shadow-xl">
          {bookingsLoading ?
          <CalendarMonth
            month={today.getMonth() + 1}
            today={today}
            onSelectDate={handleSlotClick}
          />
          :
          <CalendarMonth
            month={today.getMonth() + 1}
            today={today}
            isSignedIn={isSignedIn}
            bookings={bookings}
            userId={user?.id}
            onSelectDate={handleSlotClick}
          />    
          }
        </div>
      </div>

      {/*  Weekly Booking View */}
      <div className="flex-1">
             {bookingsLoading ?
        <WeeklyView
          weekStart={weekStart}
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

       {/* Sign-In / Sign-Up Modal */}
      {signingModalOpen && (
        <SigningModal onClose={() => setSigningModalOpen(false)} />
      )}

      {/* Booking Form Modal */}
      {bookingModalOpen ? 
       bookingsLoading ? 
        <BookingFormModal
          booking={selectedBooking}
          date={selectedDate}
          onClose={() => setBookingModalOpen(false)}
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
