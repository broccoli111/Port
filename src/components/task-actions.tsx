"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskStatus, UserRole } from "@/types";

interface TaskActionsProps {
  taskId: string;
  userId: string;
  role: UserRole;
  currentStatus?: TaskStatus;
}

export function TaskActions({ taskId, userId, role, currentStatus }: TaskActionsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function changeStatus(newStatus: TaskStatus) {
    setLoading(newStatus);

    const { data: task } = await supabase
      .from("tasks")
      .select("status")
      .eq("id", taskId)
      .single();

    await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    await supabase.from("status_updates").insert({
      task_id: taskId,
      old_status: task?.status || null,
      new_status: newStatus,
      changed_by: userId,
    });

    setLoading(null);
    router.refresh();
  }

  // Client reviewing deliverables
  if (role === "client") {
    return (
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">
          Review this deliverable
        </p>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => changeStatus("completed")}
            loading={loading === "completed"}
          >
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={() => changeStatus("in_progress")}
            loading={loading === "in_progress"}
          >
            Request Revisions
          </Button>
        </div>
      </Card>
    );
  }

  // Admin reviewing internal work
  if (role === "admin" && currentStatus === "internal_review") {
    return (
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">
          Internal review
        </p>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => changeStatus("client_review")}
            loading={loading === "client_review"}
          >
            Approve &amp; Send to Client
          </Button>
          <Button
            variant="outline"
            onClick={() => changeStatus("in_progress")}
            loading={loading === "in_progress"}
          >
            Request Changes
          </Button>
        </div>
      </Card>
    );
  }

  // Worker submitting work
  if (role === "worker" && currentStatus === "in_progress") {
    return (
      <Card>
        <p className="text-sm font-medium text-text-primary mb-3">
          Submit for review
        </p>
        <Button
          variant="primary"
          onClick={() => changeStatus("internal_review")}
          loading={loading === "internal_review"}
        >
          Submit for Internal Review
        </Button>
      </Card>
    );
  }

  return null;
}
