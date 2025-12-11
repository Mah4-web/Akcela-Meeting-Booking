// components/CalendarMonth.jsx
import React from "react";
import DateCell from "./DateCell";
import {
  startOfMonth,
  getDay,
  getDaysInMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import "../../app/weekday_breakpoints.css";

const weekdayLabels = [
  { full: "Monday",    med: "Mon", short: "M" },
  { full: "Tuesday",   med: "Tue", short: "T" },
  { full: "Wednesday", med: "Wed", short: "W" },
  { full: "Thursday",  med: "Thu", short: "T" },
  { full: "Friday",    med: "Fri", short: "F" },
  { full: "Saturday",  med: "Sat", short: "S" },
  { full: "Sunday",    med: "Sun", short: "S" },
];


/**
 * CalendarMonth
 * Props:
 *  - month: number (1-12)
 *  - today: Date | string (optional) — will be normalized
 *
 * Renders a grid with Monday..Sunday headers and the month days,
 * with the correct number of leading empty slots so the 1st of the month
 * lines up under the right weekday (assuming Monday is the first column).
 */
export default function CalendarMonth({ month, today }) {
  // Validate/normalize month (expect 1-12)
  const monthNum = Math.max(1, Math.min(12, Number(month || new Date().getMonth() + 1)));

  // Normalize "today" into a Date object (accepts Date or ISO string)
  let todayDate;
  if (!today) {
    todayDate = new Date();
  } else if (typeof today === "string") {
    // If string, try ISO parse; fallback to Date constructor
    try {
      todayDate = parseISO(today);
      if (Number.isNaN(todayDate.getTime())) throw new Error("invalid");
    } catch {
      todayDate = new Date(today);
    }
  } else {
    todayDate = new Date(today);
  }

  const currentYear = new Date().getFullYear();

  // startOfMonth for the target month/year
  const monthStart = startOfMonth(new Date(currentYear, monthNum - 1, 1));

  // JS/getDay: 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // We want Monday to be column 0. Compute how many leading empty cells:
  // map Sunday(0) -> 6, Monday(1) -> 0, Tuesday(2) -> 1, ...
  const weekdayOfFirst = getDay(monthStart);
  const leadingEmptyCount = (weekdayOfFirst + 6) % 7;

  // number of days in this month
  const daysInMonth = getDaysInMonth(monthStart);

  // render
  return (
    <div className="calendar-container mx-4 grid grid-cols-7 gap-4 [&>*]:text-center [&>*]:shadow-2xl">

      {/* weekday headers */}
      {weekdayLabels.map((w, i) => (
        <div key={i} className="font-bold">
          <span className="weekday-full">{w.full}</span>
          <span className="weekday-med">{w.med}</span>
          <span className="weekday-short">{w.short}</span>
        </div>
      ))}

      {/* leading empty slots */}
      {Array.from({ length: leadingEmptyCount }).map((_, idx) => (
        <div key={`empty-${idx}`} aria-hidden className="h-12" />
      ))}

      {/* day cells */}
      {Array.from({ length: daysInMonth }).map((_, idx) => {
        const day = idx + 1;
        const cellDate = new Date(currentYear, monthNum - 1, day);

        const isToday = isSameDay(cellDate, todayDate);

        return (
          <DateCell
            key={`d-${day}`}
            shortDate={day}
            fullDate={cellDate}
            isToday={isToday}
            // optionally pass a full date if DateCell can use it:
            // dateObj={cellDate}
          />
        );
      })}
    </div>
  );
}
