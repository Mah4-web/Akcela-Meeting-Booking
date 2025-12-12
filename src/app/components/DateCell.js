"use client";

export default function DateCell({ shortDate, isToday, bookings = [], userId, onClick }) {
  return (
    <div
      className={`p-2 rounded-lg shadow-md border border-(--color-glass-border) backdrop-blur-md transition cursor-pointer`}
      onClick={onClick}
    >
      <div className={`text-center ${isToday ? "bg-black text-white" : "bg-white/20"} rounded`}>
        {shortDate}
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {bookings.map((b, i) => {
          const canSee = b.userId === userId;
          return (
            <div
              key={i}
              className={`text-xs truncate rounded px-1 text-white ${b.roomColor || "bg-red-500"}`}
              title={canSee ? `${b.customerName} (${b.room})` : `Booked (${b.room})`}
            >
              {canSee ? `${b.customerName}` : b.room}
            </div>
          );
        })}
      </div>
    </div>
  );
}
