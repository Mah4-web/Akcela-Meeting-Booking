"use client";

import React from "react";
import DateCell from "./DateCell";
import {
  startOfMonth,
  getDay,
  getDaysInMonth,
  isSameDay,
} from "date-fns";
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

// Room colors
const roomColors = {
  "Conference A": "bg-blue-400",
  "Conference B": "bg-green-400",
  "Meeting A": "bg-purple-400",
  "Meeting B": "bg-yellow-400",
};

export default function CalendarMonth({
  month,
  today,
  bookings = [],
  onSelectDate,
}) {
  const currentYear = new Date().getFullYear();
  const monthStart = startOfMonth(new Date(currentYear, month - 1, 1));

  const weekdayOfFirst = getDay(monthStart);
  const leadingEmptyCount = (weekdayOfFirst + 6) % 7;
  const daysInMonth = getDaysInMonth(monthStart);

  const getBookingsForDay = (date) =>
    bookings.filter((b) => isSameDay(new Date(b.date), date));

  const handleClick = (date) => {
    onSelectDate(date);
  };

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
              onClick={() => handleClick(dateObj)}
            />
            {/* Booking badges */}
            <div className="absolute top-0 left-0 w-full h-full p-1 flex flex-col gap-0.5">
              {dayBookings.map((b, index) => (
                <div
                  key={index}
                  className={`text-xs truncate rounded px-1 ${roomColors[b.room] || "bg-red-500"} text-white`}
                  title={b.userIsOwner ? `${b.room}: ${b.title}` : b.room}
                >
                  {b.userIsOwner ? b.title : b.room}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
