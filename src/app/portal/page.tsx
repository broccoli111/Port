import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { TaskStatus } from "@/types";

export default async function PortalDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const clientId = client?.id;

  const { data: activeTasks } = clientId
    ? await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", clientId)
        .neq("status", "completed")
        .order("updated_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const { data: recentDeliverables } = clientId
    ? await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", clientId)
        .eq("status", "completed")
        .order("updated_at", { ascending: false })
        .limit(5)
    : { data: [] };

  const statusVariant: Record<string, "info" | "warning" | "purple" | "default" | "success" | "error"> = {
    submitted: "info",
    in_progress: "warning",
    internal_review: "purple",
    client_review: "warning",
    completed: "success",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">
          Welcome back. Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Subscription info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-text-secondary mb-1">Current Plan</p>
          <p className="text-2xl font-bold text-text-primary">
            {client?.plan ? `Plan ${client.plan}` : "No plan"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary mb-1">Status</p>
          <p className="text-2xl font-bold text-text-primary capitalize">
            {client?.status || "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary mb-1">Active Tasks</p>
          <p className="text-2xl font-bold text-text-primary">
            {activeTasks?.length || 0}
          </p>
        </Card>
      </div>

      {/* Active Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <Link
            href="/portal/tasks"
            className="text-sm text-accent hover:text-accent-hover"
          >
            View all
          </Link>
        </CardHeader>
        {activeTasks && activeTasks.length > 0 ? (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <Link
                key={task.id}
                href={`/portal/tasks/${task.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {task.title}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatDate(task.updated_at)}
                  </p>
                </div>
                <Badge variant={statusVariant[task.status] || "default"}>
                  {statusLabels[task.status as TaskStatus]}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No active tasks.</p>
        )}
      </Card>

      {/* Recent Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliverables</CardTitle>
          <Link
            href="/portal/deliverables"
            className="text-sm text-accent hover:text-accent-hover"
          >
            View all
          </Link>
        </CardHeader>
        {recentDeliverables && recentDeliverables.length > 0 ? (
          <div className="space-y-3">
            {recentDeliverables.map((task) => (
              <Link
                key={task.id}
                href={`/portal/tasks/${task.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {task.title}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    Completed {formatDate(task.updated_at)}
                  </p>
                </div>
                <Badge variant="success">Completed</Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No completed deliverables yet.
          </p>
        )}
      </Card>
    </div>
  );
}
