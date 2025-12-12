"use client";
import React from "react";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[rgba(255,255,255,0.2)] backdrop-blur-md rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-black font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
