import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main content — extra bottom padding on mobile for the tab bar */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom tab bar — mobile only */}
      <AdminMobileNav />
    </div>
  );
}
