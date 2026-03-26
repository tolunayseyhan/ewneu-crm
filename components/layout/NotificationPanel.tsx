"use client";

import { CheckSquare, Phone, MapPin, FileText, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Notification } from "./Header";

const ICONS = {
  aufgabe: { icon: CheckSquare, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600" },
  anruf: { icon: Phone, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600" },
  besuch: { icon: MapPin, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600" },
  angebot: { icon: FileText, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onDelete: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
}

export function NotificationPanel({ open, onClose, notifications, onDelete, onMarkAllRead, onDeleteAll }: Props) {
  if (!open) return null;

  const ungelesen = notifications.filter((n) => !n.gelesen).length;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-border bg-background shadow-2xl shadow-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-foreground" />
            <span className="text-sm font-semibold">Benachrichtigungen</span>
            {ungelesen > 0 && (
              <Badge className="h-4 px-1.5 text-[10px] bg-[#E3000F] text-white border-0">
                {ungelesen}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Notifications list or empty state */}
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Keine Benachrichtigungen</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const meta = ICONS[notif.typ];
              const Icon = meta.icon;
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "group flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors",
                    !notif.gelesen && "bg-[#E3000F]/3"
                  )}
                >
                  <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5", meta.bg)}>
                    <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs font-semibold", !notif.gelesen ? "text-foreground" : "text-muted-foreground")}>
                        {notif.titel}
                      </p>
                      {!notif.gelesen && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E3000F] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{notif.text}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{notif.zeit}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Löschen"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — only show when there are notifications */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#E3000F] hover:text-[#cc000e] font-medium transition-colors"
            >
              Alle gelesen
            </button>
            <button
              onClick={onDeleteAll}
              className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Alle löschen
            </button>
          </div>
        )}
      </div>
    </>
  );
}
