"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarMonth from "./components/CalendarMonth";

export default function CalendarPage() {
  const router = useRouter();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11

  const handlePrevMonth = () => {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const handleSelectDate = (dateString) => {
    router.push(`/calendar/${dateString}`);
  };

  const monthName = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="calendar-root">
      <div className="calendar-card">
        <header className="calendar-header">
          <div>
            <h1 className="calendar-title">Room Booking Calendar</h1>
            <p className="calendar-subtitle">
              Select a day to book 15-minute time slots (max 2 hours)
            </p>
          </div>

          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="btn-secondary">
              ‹
            </button>
            <span className="calendar-month-label">{monthName}</span>
            <button onClick={handleNextMonth} className="btn-secondary">
              ›
            </button>
          </div>
        </header>

        <CalendarMonth
          year={year}
          month={month}
          onSelectDate={handleSelectDate}
        />
      </div>
    </main>
  );
}
