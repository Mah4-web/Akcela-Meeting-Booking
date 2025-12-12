import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/components/utils/dbConnection";

export async function POST() {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

 
  await db.query(
    `INSERT INTO user_roles (user_id, role)
     VALUES ($1, 'booker')
     ON CONFLICT (user_id) DO NOTHING`,
    [user.id]
  );

  return new Response("OK", { status: 200 });
}
