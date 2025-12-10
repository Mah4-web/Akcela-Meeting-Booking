"use client";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
    const { user } = useUser();

    return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Meeting Room Booking</h1>
        <nav className="flex gap-4 items-center">
        {user ? (
            <>
            <span>{user.firstName}</span>
            <Link href="/dashboard" className="text-blue-600">Dashboard</Link>
            {user.publicMetadata?.role === "admin" && (
                <Link href="/admin" className="text-red-600">Admin</Link>
            )}
            <SignOutButton />
            </>
        ) : (
            <Link href="/sign-in" className="text-blue-600">Sign In</Link>
        )}
        </nav>
    </header>
    );
}
