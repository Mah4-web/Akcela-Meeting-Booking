import { currentUser } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const user = await currentUser();

  if (!user || user.publicMetadata?.role !== "admin") {
    return <div className="p-8 text-red-600">Access denied. Admins only.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {user.firstName || user.email}</p>
    </div>
  );
}
