import { SidebarLayout } from "@/components/layouts/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
}