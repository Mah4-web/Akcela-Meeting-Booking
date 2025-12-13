"use client";

import Link from "next/link";

export default function SigningModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/45 border border-white/30 backdrop-blur-lg shadow-2xl rounded-3xl p-8 max-w-md w-[90%] relative animate-fadeIn">

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-black font-bold text-xl hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Welcome Text */}
        <h2 className="text-2xl font-extrabold text-black text-center mb-2">
          Welcome to Akcela Meeting Booking
        </h2>

        <p className="text-center text-sm font-bold text-gray-950 mb-6 leading-relaxed">
          Effortlessly schedule, manage, and track all your meetings in one place.
          Join Akcela today to simplify your workflow, collaborate seamlessly, 
          and stay on top of your schedule.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-4">

          {/* Sign In */}
          <Link
            href="/sign-in"
            className="bg-white/20 backdrop-blur-md border border-white/30 
                       shadow-lg rounded-2xl px-8 py-3 text-black font-semibold text-center 
                       transition-all duration-300 hover:bg-blue-500 hover:text-white 
                       hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Sign In
          </Link>

          {/* Sign Up */}
          <Link
            href="/sign-up"
            className="bg-white/20 backdrop-blur-md border border-white/30 
                       shadow-lg rounded-2xl px-8 py-3 text-black font-semibold text-center 
                       transition-all duration-300 hover:bg-blue-500 hover:text-white 
                       hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
