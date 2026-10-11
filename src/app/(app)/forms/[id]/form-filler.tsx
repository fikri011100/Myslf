"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitForm, type FormField } from "@/app/actions/forms";

export function FormFiller({
  formId,
  fields,
}: {
  formId: string;
  fields: FormField[];
}) {
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Form ini belum memiliki field.
      </p>
    );
  }

  return (
    <form
      action={(fd) => {
        const data: Record<string, unknown> = {};
        fields.forEach((f) => {
          data[f.label] = fd.get(f.label);
        });
        startTransition(async () => {
          await submitForm(formId, data);
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        });
      }}
      className="flex flex-col gap-4"
    >
      {fields.map((f, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            {f.label}
            {f.required && <span className="text-destructive"> *</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              name={f.label}
              required={f.required}
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <Input name={f.label} type={f.type} required={f.required} />
          )}
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Mengirim…" : "Kirim"}
        </Button>
        {done && <span className="text-sm text-brand-green">Terkirim ✓</span>}
      </div>
    </form>
  );
}
