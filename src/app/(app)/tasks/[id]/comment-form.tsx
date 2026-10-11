"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addComment } from "@/app/actions/boards";

export function CommentForm({ taskId }: { taskId: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        const body = String(fd.get("body") ?? "");
        if (!body.trim()) return;
        startTransition(() => void addComment(taskId, body));
        if (ref.current) ref.current.value = "";
      }}
      className="flex flex-col gap-2"
    >
      <textarea
        ref={ref}
        name="body"
        rows={2}
        placeholder="Tulis komentar…"
        className="w-full resize-none rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim"}
        </Button>
      </div>
    </form>
  );
}
