export default function DateCell({
  shortDate,
  isToday,
  bookings = [],
  userId,
  isAdmin,
  ROOM_COLORS,
}) {
  return (
    <div className={`p-2 rounded-lg shadow-md border border-(--color-glass-border) backdrop-blur-md transition`}>
      <div className={`text-center ${isToday ? "bg-black text-white" : "bg-white/20"} rounded`}>
        {shortDate}
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {bookings.map((b, i) => {
          const canSee = isAdmin || b.userId === userId;
          const colorClass = b.room ? ROOM_COLORS[b.room] : "bg-red-500";
          return (
            <div
              key={i}
              className={`${colorClass} text-white text-xs rounded px-1 truncate`}
              title={canSee ? `${b.customerName} (${b.room})` : `Booked (${b.room})`}
            >
              {canSee ? `${b.customerName}` : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
