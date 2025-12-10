export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Akcela Meeting Booking</h1>
      <p>This is the main page of the Akcela Meeting Booking application.</p>

      <div className="flex">
        <div>
          <a href="/sign-in">Sign In</a>
        </div>
        <div>
          <a href="/sign-up">Sign Up</a>
        </div>
      </div>
    </div>
  );
}
