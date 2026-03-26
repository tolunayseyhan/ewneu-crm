"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "./CommandPalette";
import { NotificationPanel } from "./NotificationPanel";

export interface Notification {
  id: string;
  typ: "aufgabe" | "anruf" | "besuch" | "angebot";
  titel: string;
  text: string;
  zeit: string;
  gelesen: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    typ: "aufgabe",
    titel: "Aufgabe fällig",
    text: "Angebot nachfassen – Müller & Söhne GmbH",
    zeit: "vor 10 Min.",
    gelesen: false,
  },
  {
    id: "2",
    typ: "anruf",
    titel: "Anruf überfällig",
    text: "Fischer Elektronik KG – seit 2 Tagen offen",
    zeit: "vor 2 Std.",
    gelesen: false,
  },
  {
    id: "3",
    typ: "angebot",
    titel: "Neues Angebot",
    text: "Schneider Logistik AG – ANG-2026-0042",
    zeit: "gestern",
    gelesen: false,
  },
  {
    id: "4",
    typ: "besuch",
    titel: "Besuch morgen",
    text: "Weber Bau GmbH – 10:00 Uhr geplant",
    zeit: "gestern",
    gelesen: true,
  },
  {
    id: "5",
    typ: "aufgabe",
    titel: "Aufgabe erledigt",
    text: "Preisliste aktualisieren – Sandra Koch",
    zeit: "vor 2 Tagen",
    gelesen: true,
  },
];

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [showCommand, setShowCommand] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, gelesen: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.gelesen).length;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur border-b border-border">
        <div>
          <h1 className="text-lg font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search trigger */}
          <button
            onClick={() => setShowCommand(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-muted/50 text-muted-foreground text-sm hover:bg-muted transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Suchen...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-background border border-border">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDark}
            className="hover:bg-muted transition-colors"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted transition-colors"
              onClick={() => setShowNotifications((v) => !v)}
              title="Benachrichtigungen"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center rounded-full bg-[#E3000F] text-white border-0 pointer-events-none"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <NotificationPanel
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onDelete={handleDeleteNotification}
              onMarkAllRead={handleMarkAllRead}
              onDeleteAll={handleDeleteAll}
            />
          </div>
        </div>
      </header>

      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />
    </>
  );
}
