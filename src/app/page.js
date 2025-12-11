import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-(--color-gray-light)">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black text-center">
        Welcome to Akcela Meeting Booking
      </h1>
        <p className="mb-8 text-(--color-gray-dark) text-center max-w-xl">
        Effortlessly schedule, manage, and track all your meetings in one place.
        Join Akcela today to simplify your workflow, collaborate seamlessly, and stay on top of your schedule.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <Link
          href="/sign-in"
          className="bg-(--color-glass-bg) backdrop-blur-md border border-(--color-glass-border) shadow-lg rounded-2xl px-8 py-4 text-black font-semibold text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-black"
        >
          Sign In
        </Link>

        <Link
          href="/sign-up"
          className="bg-(--color-glass-bg) backdrop-blur-md border border-(--color-glass-border) shadow-lg rounded-2xl px-8 py-4 text-black font-semibold text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-black"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
