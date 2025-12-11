
export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col p-8">
      <h1 className="text-3xl font-bold mb-2">Welcome to Akcela Meeting Booking</h1>
      <p className="mb-6">This is the main page of the Akcela Meeting Booking application.</p>

      <div className="flex gap-4">
        <div className="bg-green-500 p-4 text-white rounded-lg hover:bg-green-600 transition">
          <a href="/sign-in">Sign In</a>
        </div>

        <div className="bg-green-500 p-4 text-white rounded-lg hover:bg-green-600 transition">
          <a href="/sign-up">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
