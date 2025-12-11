"use client";

import { useState } from "react";
import CalendarMonth from "../components/CalendarMonth";
import WeeklyView from "../components/WeeklyView";
import { subWeeks, addWeeks } from "date-fns";

export default function CalendarPage() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(today);

  const handlePrevWeek = () => setWeekStart(subWeeks(weekStart, 1));
  const handleNextWeek = () => setWeekStart(addWeeks(weekStart, 1));

  return (
    <div className="flex flex-col md:flex-row p-4 md:p-8 gap-6 bg-(--color-gray-light) min-h-screen">
      
      {/* Mini calendar on top for mobile, left for desktop */}
      <div className="w-full md:w-1/4 mb-6 md:mb-0">
        <h1 className="text-center font-extrabold text-2xl mb-2 text-black">
          Akcela Booking Calendar
        </h1>
        <p className="text-center mb-4 text-(--color-gray-dark)">
          Select a date to book your 2 hour slot
        </p>

        <div className="bg-(--color-glass-bg) border border-(--color-glass-border) rounded-2xl p-2 backdrop-blur-md shadow-xl">
          <CalendarMonth month={today.getMonth() + 1} today={today} />
        </div>
      </div>

      {/* Weekly booking view */}
      <div className="flex-1">
        <WeeklyView
          weekStart={weekStart}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      </div>
    </div>
  );
}
