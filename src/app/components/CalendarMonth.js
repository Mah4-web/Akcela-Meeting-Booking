"use client";

import React from "react";
import DateCell from "./DateCell";
import { startOfMonth, getDay, getDaysInMonth, isSameDay } from "date-fns";
import "../../app/weekday_breakpoints.css";

const weekdayLabels = [
  { full: "Monday", med: "Mon", short: "M" },
  { full: "Tuesday", med: "Tue", short: "T" },
  { full: "Wednesday", med: "Wed", short: "W" },
  { full: "Thursday", med: "Thu", short: "T" },
  { full: "Friday", med: "Fri", short: "F" },
  { full: "Saturday", med: "Sat", short: "S" },
  { full: "Sunday", med: "Sun", short: "S" },
];

export default function CalendarMonth({ month, today, bookings = [], userId, onSelectDate }) {
  const currentYear = new Date().getFullYear();
  const monthStart = startOfMonth(new Date(currentYear, month - 1, 1));

  const weekdayOfFirst = getDay(monthStart);
  const leadingEmptyCount = (weekdayOfFirst + 6) % 7;
  const daysInMonth = getDaysInMonth(monthStart);

  const getBookingsForDay = (date) =>
    bookings.filter((b) => isSameDay(new Date(b.date), date));

  const handleClick = (date) => onSelectDate(date);

  return (
    <div className="calendar-container grid grid-cols-7 gap-2">
      {/* Weekday headers */}
      {weekdayLabels.map((w) => (
        <div key={w.full} className="text-center font-semibold text-black">
          <span className="weekday-full">{w.full}</span>
          <span className="weekday-med">{w.med}</span>
          <span className="weekday-short">{w.short}</span>
        </div>
      ))}

      {/* Leading empty cells */}
      {Array.from({ length: leadingEmptyCount }).map((_, i) => (
        <div key={i}></div>
      ))}

      {/* Days */}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const dayNum = i + 1;
        const dateObj = new Date(currentYear, month - 1, dayNum);
        const dayBookings = getBookingsForDay(dateObj);

        return (
          <div key={i} className="relative">
            <DateCell
              fullDate={dateObj}
              shortDate={dayNum}
              isToday={isSameDay(dateObj, today)}
              bookings={dayBookings}
              userId={userId}
              onClick={() => handleClick(dateObj)}
            />
          </div>
        );
      })}
    </div>
  );
}
