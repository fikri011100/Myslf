"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Check, Building2 } from "lucide-react";
import { setActiveCompany } from "@/app/actions/auth";
import type { CompanyWithRole } from "@/lib/company";
import { cn } from "@/lib/utils";

export function CompanySwitcher({
  companies,
  active,
}: {
  companies: CompanyWithRole[];
  active: CompanyWithRole;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function select(id: string) {
    setOpen(false);
    if (id === active.id) return;
    startTransition(() => {
      setActiveCompany(id);
    });
  }

  const single = companies.length <= 1;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={single || pending}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors",
          !single && "hover:bg-muted"
        )}
      >
        <Building2 className="h-4 w-4 text-brand-violet" />
        <span className="max-w-[140px] truncate">{active.name}</span>
        {!single && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && !single && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => select(c.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="flex flex-col items-start">
                  <span className="truncate font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.role}</span>
                </span>
                {c.id === active.id && (
                  <Check className="h-4 w-4 text-brand-green" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
