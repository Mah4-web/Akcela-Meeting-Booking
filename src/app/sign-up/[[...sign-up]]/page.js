import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-(--color-gray-light)">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black">
        Sign up for Akcela Meeting Booking
        </h1>

       
        <SignUp />

    </main>
    );
}
