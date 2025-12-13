// app/api/get-user/route.js
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  return new Response(JSON.stringify({
    userId: user.id,
    username: user.username,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}