export default function DateCell({
  shortDate,
  isToday,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-lg shadow-md
        border border-(--color-glass-border)
        backdrop-blur-md
        transition
        duration-200
        text-center
        ${
          isToday
            ? "bg-black text-white"
            : "bg-white/20 hover:bg-white/40"
        }
      `}
    >
      {shortDate}
    </button>
  );
}
