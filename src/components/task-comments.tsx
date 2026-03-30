"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { useRealtime } from "@/hooks/use-realtime";
import { useState, useCallback } from "react";

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  userName: string;
}

interface TaskCommentsProps {
  taskId: string;
  userId: string;
  initialComments: CommentData[];
}

export function TaskComments({
  taskId,
  userId,
  initialComments,
}: TaskCommentsProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleInsert = useCallback(() => {
    // Refetch to get user info
    async function refetch() {
      const { data } = await supabase
        .from("comments")
        .select("*, user:users(full_name, email)")
        .eq("task_id", taskId)
        .order("created_at");
      if (data) {
        setComments(
          data.map((c) => ({
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            userName:
              (c.user as Record<string, string> | null)?.full_name ||
              (c.user as Record<string, string> | null)?.email ||
              "Unknown",
          }))
        );
      }
    }
    refetch();
  }, [supabase, taskId]);

  useRealtime({
    table: "comments",
    filter: `task_id=eq.${taskId}`,
    onInsert: handleInsert,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    await supabase.from("comments").insert({
      task_id: taskId,
      user_id: userId,
      content: content.trim(),
    });

    setContent("");
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-active flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-text-secondary">
                  {comment.userName[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {formatDateTime(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-tertiary">No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-border">
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
        </div>
        <Button type="submit" loading={loading} size="sm" className="self-end">
          Send
        </Button>
      </form>
    </div>
  );
}
