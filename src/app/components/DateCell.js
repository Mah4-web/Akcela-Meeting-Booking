"use client";

export default function DateCell({ shortDate, isToday, isSignedIn, bookings = [], userId, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-lg shadow-md border border-(--color-glass-border) backdrop-blur-md transition-colors cursor-pointer
        hover:bg-blue-200
      `}
    >
      <div
        className={`text-center rounded transition-colors ${
          isToday
            ? "bg-black text-white hover:bg-blue-500"
            : "bg-white/20 hover:bg-blue-500"
        }`}
      >
        {shortDate}
      </div>

      <div className="mt-1 flex flex-col gap-1">
        {bookings.map((b, i) => {
          const canSee = b.userId === userId;
          return (
            <div
              key={i}
              className={`text-xs truncate rounded px-1 text-white ${b.roomColor || "bg-red-500"}`}
              title={canSee && isSignedIn ? `${b.customerName} (${b.room})` : `Booked (${b.room})`}
            >
              {canSee && isSignedIn ? `${b.customerName}` : b.room}
            </div>
          );
        })}
      </div>
    </div>
  );
}
