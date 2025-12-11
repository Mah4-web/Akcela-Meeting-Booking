import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-(--color-gray-light)">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-black">
        Sign in to Akcela Meeting Booking
        </h1>

        {/* <div className="w-full [&>*]:mx-auto max-w-md rounded-2xl py-8 bg-(--color-glass-bg) border border-(--color-glass-border) shadow-lg backdrop-blur-md"> */}
        <SignIn />
        {/* </div> */}

    </main>
    );
}
