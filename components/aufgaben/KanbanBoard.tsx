"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Aufgabe } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  aufgaben: Aufgabe[];
}

const columns = [
  {
    id: "offen",
    label: "Offen",
    color: "border-t-orange-400",
    badgeVariant: "warning" as const,
  },
  {
    id: "in_bearbeitung",
    label: "In Bearbeitung",
    color: "border-t-blue-500",
    badgeVariant: "info" as const,
  },
  {
    id: "erledigt",
    label: "Erledigt",
    color: "border-t-green-500",
    badgeVariant: "success" as const,
  },
];

export function KanbanBoard({ aufgaben }: KanbanBoardProps) {
  const getColumnItems = (status: string) =>
    aufgaben.filter((a) => a.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((col) => {
        const items = getColumnItems(col.id);
        return (
          <div
            key={col.id}
            className={cn(
              "rounded-2xl border-t-4 border border-border bg-muted/30 p-4",
              col.color
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {col.label}
                </h3>
                <Badge variant={col.badgeVariant} className="h-5 px-1.5 text-[11px]">
                  {items.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  Keine Aufgaben
                </div>
              ) : (
                items.map((aufgabe) => (
                  <TaskCard key={aufgabe.id} aufgabe={aufgabe} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
