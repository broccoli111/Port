import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import {
  DashboardIcon,
  TasksIcon,
  FileIcon,
  CreditCardIcon,
  PlusIcon,
} from "@/components/icons";

const portalNav = [
  { label: "Dashboard", href: "/portal", icon: <DashboardIcon /> },
  { label: "New Task", href: "/portal/tasks/new", icon: <PlusIcon /> },
  { label: "My Tasks", href: "/portal/tasks", icon: <TasksIcon /> },
  { label: "Deliverables", href: "/portal/deliverables", icon: <FileIcon /> },
  { label: "Billing", href: "/portal/billing", icon: <CreditCardIcon /> },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/portal");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (profile.role === "admin") redirect("/admin");
  if (profile.role === "worker") redirect("/worker");

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar items={portalNav} title="Client Portal" />
      <div className="ml-64">
        <Topbar
          user={{
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
          }}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
