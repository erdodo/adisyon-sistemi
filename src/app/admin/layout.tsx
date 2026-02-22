import { getAuthUser } from "@/lib/auth";
import AdminSidebar from "./_components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row">
      <AdminSidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 flex flex-col w-full">
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
