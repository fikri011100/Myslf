"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { moveTask, createTask, createColumn } from "@/app/actions/boards";

type Col = { id: string; name: string; position: number };
type Task = {
  id: string;
  column_id: string | null;
  number: number | null;
  title: string;
  customer: string | null;
  priority: "low" | "medium" | "high" | null;
  difficulty: "low" | "medium" | "high" | null;
  due_date: string | null;
  position: number;
};

const PRIORITY: Record<string, "green" | "amber" | "red"> = {
  low: "green",
  medium: "amber",
  high: "red",
};
const PRIORITY_STRIP: Record<string, string> = {
  low: "border-l-brand-green",
  medium: "border-l-brand-amber",
  high: "border-l-brand-red",
};
const COLUMN_ACCENT = [
  "border-t-brand-amber",
  "border-t-brand-indigo",
  "border-t-brand-green",
  "border-t-brand-pink",
  "border-t-brand-cyan",
];

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab touch-none rounded-xl border border-l-4 border-border bg-card p-3 shadow-card",
        PRIORITY_STRIP[task.priority ?? "medium"],
        isDragging && "opacity-40"
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {task.number ? `#${task.number}` : ""}
        </span>
        {task.priority && (
          <Badge variant={PRIORITY[task.priority]}>{task.priority}</Badge>
        )}
      </div>
      <Link
        href={`/tasks/${task.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-sm font-medium hover:underline"
      >
        {task.title}
      </Link>
      {task.customer && (
        <div className="mt-2">
          <Badge variant="cyan">{task.customer}</Badge>
        </div>
      )}
    </div>
  );
}

function Column({
  col,
  tasks,
  accent,
  boardId,
}: {
  col: Col;
  tasks: Task[];
  accent: string;
  boardId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [, startTransition] = useTransition();

  function submit() {
    const t = title.trim();
    if (!t) return setAdding(false);
    startTransition(() => void createTask(boardId, col.id, t));
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-80 shrink-0 flex-col gap-3 rounded-2xl border border-t-4 border-border bg-muted/40 p-3",
        accent,
        isOver && "ring-2 ring-primary/40"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <span className="font-display text-sm font-semibold">{col.name}</span>
        <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}

      {adding ? (
        <textarea
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Judul task…"
          className="w-full resize-none rounded-xl border border-border bg-card p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-card"
        >
          <Plus className="h-4 w-4" /> Tambah task
        </button>
      )}
    </div>
  );
}

export function KanbanBoard({
  boardId,
  columns,
  tasks: initialTasks,
}: {
  boardId: string;
  columns: Col[];
  tasks: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const taskId = String(active.id);
    const targetCol = String(over.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.column_id === targetCol) return;

    const newPos = tasks.filter((t) => t.column_id === targetCol).length;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, column_id: targetCol, position: newPos } : t
      )
    );
    startTransition(() => void moveTask(taskId, targetCol, newPos, boardId));
  }

  const [addingCol, setAddingCol] = useState(false);
  const [colName, setColName] = useState("");

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
        {columns.map((col, i) => (
          <Column
            key={col.id}
            col={col}
            accent={COLUMN_ACCENT[i % COLUMN_ACCENT.length]}
            tasks={tasks
              .filter((t) => t.column_id === col.id)
              .sort((a, b) => a.position - b.position)}
            boardId={boardId}
          />
        ))}

        <div className="w-72 shrink-0">
          {addingCol ? (
            <input
              autoFocus
              value={colName}
              onChange={(e) => setColName(e.target.value)}
              onBlur={() => {
                const n = colName.trim();
                if (n) startTransition(() => void createColumn(boardId, n));
                setColName("");
                setAddingCol(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              }}
              placeholder="Nama kolom…"
              className="w-full rounded-xl border border-border bg-card p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ) : (
            <button
              onClick={() => setAddingCol(true)}
              className="flex w-full items-center gap-1 rounded-2xl border border-dashed border-border p-3 text-sm text-muted-foreground hover:bg-muted/40"
            >
              <Plus className="h-4 w-4" /> Tambah kolom
            </button>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
