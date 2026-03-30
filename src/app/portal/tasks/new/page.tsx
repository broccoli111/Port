"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!client) throw new Error("Client record not found");

      // Create task
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          client_id: client.id,
          title,
          description,
          status: "submitted",
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Upload files
      for (const file of files) {
        const path = `${client.id}/${task.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("briefs")
          .upload(path, file);

        if (uploadError) {
          console.error("File upload error:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("briefs").getPublicUrl(path);

        await supabase.from("task_files").insert({
          task_id: task.id,
          file_url: publicUrl,
          file_name: file.name,
          uploaded_by: user.id,
          file_type: "brief",
        });
      }

      // Create initial status update
      await supabase.from("status_updates").insert({
        task_id: task.id,
        new_status: "submitted",
        changed_by: user.id,
      });

      router.push(`/portal/tasks/${task.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Submit a Task</h1>
        <p className="text-sm text-text-secondary mt-1">
          Describe what you need and attach any reference files.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="title"
            label="Title"
            placeholder="e.g. Landing page redesign"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            id="description"
            label="Description"
            placeholder="Describe the task in detail. Include any specs, links, or references..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">
              Attachments
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-border-hover transition-colors">
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setFiles(Array.from(e.target.files || []))
                }
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-text-secondary"
              >
                <span className="text-accent font-medium">Click to upload</span>{" "}
                or drag and drop
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-1">
                  {files.map((f, i) => (
                    <p key={i} className="text-xs text-text-tertiary">
                      {f.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-error bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Submit Task
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
