import { getCurrentUser } from "@/lib/server/session";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminNav from "@/components/admin/AdminNav";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: { default: "Admin", template: "%s · Shoppee Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return <AdminLogin user={user} />;

  return (
    <div className="min-h-screen">
      <AdminNav user={user} />
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
