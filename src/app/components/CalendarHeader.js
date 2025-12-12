"use client";

import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";

export default function CalendarHeader({ view, setView, currentDate }) {
  // fallback to today if currentDate is invalid
  const date = currentDate instanceof Date ? currentDate : new Date();

  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold">
        {view === "week"
          ? `${format(weekStart, "d MMM")} – ${format(weekEnd, "d MMM")}`
          : format(date, "MMMM yyyy")}
      </h1>

      <select
        value={view}
        onChange={(e) => setView(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>
    </div>
  );
}
