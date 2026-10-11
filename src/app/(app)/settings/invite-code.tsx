"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function InviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2 font-mono text-sm font-semibold hover:bg-muted"
    >
      {code}
      {copied ? (
        <Check className="h-4 w-4 text-brand-green" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
