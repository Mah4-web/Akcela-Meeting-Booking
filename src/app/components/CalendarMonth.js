"use client";

import DateCell from "./DateCell";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarMonth({ year, month, onSelectDate }) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  const today = new Date();
  const isToday = (date) =>
    date &&
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const toDateString = (date) => date.toISOString().slice(0, 10); // YYYY-MM-DD

  return (
    <div className="month-wrapper">
      <div className="weekday-row">
        {WEEKDAYS.map((d) => (
          <div key={d} className="weekday-cell">
            {d}
          </div>
        ))}
      </div>

      <div className="month-grid">
        {cells.map((date, i) =>
          date ? (
            <DateCell
              key={i}
              dayNumber={date.getDate()}
              isToday={isToday(date)}
              onClick={() => onSelectDate(toDateString(date))}
            />
          ) : (
            <div key={i} className="empty-cell" />
          )
        )}
      </div>
    </div>
  );
}
