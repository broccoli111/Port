import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { statusLabels, formatDate } from "@/lib/utils";
import Link from "next/link";
import type { TaskStatus } from "@/types";

export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: tasks } = client
    ? await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const statusVariant: Record<string, "info" | "warning" | "purple" | "default" | "success"> = {
    submitted: "info",
    in_progress: "warning",
    internal_review: "purple",
    client_review: "warning",
    completed: "success",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and manage your submitted tasks.
          </p>
        </div>
        <Link href="/portal/tasks/new">
          <Button>New Task</Button>
        </Link>
      </div>

      {tasks && tasks.length > 0 ? (
        <Card padding={false}>
          <div className="divide-y divide-border">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/portal/tasks/${task.id}`}
                className="flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Created {formatDate(task.created_at)}
                  </p>
                </div>
                <Badge variant={statusVariant[task.status] || "default"}>
                  {statusLabels[task.status as TaskStatus]}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No tasks yet"
          description="Submit your first task to get started."
          action={
            <Link href="/portal/tasks/new">
              <Button>Create a task</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
