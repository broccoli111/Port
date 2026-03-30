import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function DeliverablesPage() {
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

  const { data: completedTasks } = client
    ? await supabase
        .from("tasks")
        .select("*")
        .eq("client_id", client.id)
        .eq("status", "completed")
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Deliverables</h1>
        <p className="text-sm text-text-secondary mt-1">
          All your completed tasks and downloadable assets.
        </p>
      </div>

      {completedTasks && completedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedTasks.map((task) => (
            <Link key={task.id} href={`/portal/tasks/${task.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-primary">
                    {task.title}
                  </h3>
                  <Badge variant="success">Completed</Badge>
                </div>
                <p className="text-xs text-text-tertiary line-clamp-2 mb-3">
                  {task.description}
                </p>
                <p className="text-xs text-text-tertiary">
                  Completed {formatDate(task.updated_at)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No deliverables yet"
          description="Completed tasks will appear here with downloadable assets."
        />
      )}
    </div>
  );
}
