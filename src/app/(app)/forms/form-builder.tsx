"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createForm, type FormField } from "@/app/actions/forms";

const TYPES: FormField["type"][] = ["text", "number", "email", "textarea", "date"];

export function FormBuilder() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [fields, setFields] = useState<FormField[]>([
    { label: "Nama", type: "text", required: true },
  ]);
  const [pending, startTransition] = useTransition();

  function addField() {
    setFields((f) => [...f, { label: "", type: "text", required: false }]);
  }
  function update(i: number, patch: Partial<FormField>) {
    setFields((f) => f.map((fl, idx) => (idx === i ? { ...fl, ...patch } : fl)));
  }
  function remove(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i));
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="self-start">
        <Plus className="h-4 w-4" /> Form Baru
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Builder</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          placeholder="Judul form"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Label field"
                value={f.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="flex-1"
              />
              <select
                value={f.type}
                onChange={(e) => update(i, { type: e.target.value as FormField["type"] })}
                className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={(e) => update(i, { required: e.target.checked })}
                />
                wajib
              </label>
              <button
                onClick={() => remove(i)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addField} className="self-start">
          <Plus className="h-4 w-4" /> Tambah field
        </Button>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={pending || !title.trim()}
            onClick={() =>
              startTransition(() =>
                void createForm(title, fields.filter((f) => f.label.trim()))
              )
            }
          >
            {pending ? "Membuat…" : "Buat Form"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
