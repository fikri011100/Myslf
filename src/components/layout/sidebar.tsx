"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  ListChecks,
  Wallet,
  FileText,
  MessagesSquare,
  Download,
  Users,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Navigasi color-coded per modul (PRD §10.2). */
const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
  { href: "/boards", label: "Boards", icon: KanbanSquare, color: "text-brand-indigo", bg: "bg-brand-indigo/10" },
  { href: "/company-tasks", label: "Company Tasks", icon: ListChecks, color: "text-brand-violet", bg: "bg-brand-violet/10" },
  { href: "/finance", label: "Finance", icon: Wallet, color: "text-brand-green", bg: "bg-brand-green/10" },
  { href: "/forms", label: "Forms", icon: FileText, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
  { href: "/chat", label: "Chat & DM", icon: MessagesSquare, color: "text-brand-pink", bg: "bg-brand-pink/10" },
  { href: "/notion-import", label: "Notion Import", icon: Download, color: "text-brand-amber", bg: "bg-brand-amber/10" },
  { href: "/users", label: "Users", icon: Users, color: "text-brand-violet", bg: "bg-brand-violet/10" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-muted-foreground", bg: "bg-muted" },
  { href: "/profile", label: "Profile", icon: User, color: "text-muted-foreground", bg: "bg-muted" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/60 p-4 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white font-display font-bold">
          A
        </span>
        <span className="font-display text-lg font-bold text-gradient-brand">
          AIO-Tracker
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, color, bg }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gradient-brand-soft text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <p className="px-3 pt-4 text-xs text-muted-foreground">AIO-Tracker v1.0</p>
    </aside>
  );
}
