"use client";

export default function DateCell({ dayNumber, isToday, onClick }) {
  return (
    <button
      className={`date-cell ${isToday ? "date-cell-today" : ""}`}
      onClick={onClick}
    >
      <span>{dayNumber}</span>
    </button>
  );
}
