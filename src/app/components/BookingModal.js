"use client";

import { useState } from "react";

export default function BookingModal({ booking, user, onClose }) {
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.publicMetadata?.role === "admin";
  const isOwner = user?.id === booking.booked_by;

  const handleDelete = async () => {
    if (!isAdmin && !isOwner) return;
    setLoading(true);
    try {
      await fetch("/api/bookings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-(--color-glass-bg) p-6 rounded-2xl shadow-glass backdrop-blur-md min-w-[300px]">
        <h2 className="text-xl font-bold text-black mb-2">Booking Details</h2>
        <p className="mb-1 text-black">Room: {booking.room}</p>
        <p className="mb-1 text-black">
          Date: {new Date(booking.date).toLocaleDateString()}
        </p>
        {(isAdmin || isOwner) ? (
          <>
            <p className="mb-1 text-black">Customer: {booking.customerName}</p>
            <p className="mb-1 text-black">Purpose: {booking.purpose}</p>
          </>
        ) : (
          <p className="mb-1 text-black">This time is booked</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          {(isAdmin || isOwner) && (
            <button
              className="px-4 py-2 rounded bg-red-500 text-white font-semibold"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            className="px-4 py-2 rounded bg-gray-300 text-black font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
