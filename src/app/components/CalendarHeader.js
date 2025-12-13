"use client";

export default function CalendarHeader({ currentDate, view, setView }) {
  return (
    <div className="flex flex-col items-center mb-6">
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-2 hover:text-blue-500 cursor-pointer transition-colors duration-300">
        {currentDate.toDateString()}
      </h2>

      <select
        value={view}
        onChange={(e) => setView(e.target.value)}
        className="btn-glass px-4 py-2 rounded-xl text-black font-semibold transition-all duration-300 hover:shadow-xl"
      >
        <option value="day">Day View</option>
        <option value="week">Week View</option>
        <option value="month">Month View</option>
      </select>
    </div>
  );
}
