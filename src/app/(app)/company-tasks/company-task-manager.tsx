"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { createCompanyTask } from "@/app/actions/company-tasks";

export function CompanyTaskManager({
  members,
}: {
  members: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="p-4">
        <form
          action={(fd) => startTransition(() => void createCompanyTask(fd))}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input name="title" placeholder="Judul tugas…" required className="flex-1" />
          <select
            name="assignee_id"
            className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
            defaultValue=""
          >
            <option value="">Tanpa assignee</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={pending}>
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
