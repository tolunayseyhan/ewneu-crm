"use client";

import { useState } from "react";
import { Bell, Search, Sun, Moon, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommandPalette } from "./CommandPalette";
import { NotificationPanel } from "./NotificationPanel";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [showCommand, setShowCommand] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

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
              <Badge
                variant="default"
                className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[9px] flex items-center justify-center rounded-full bg-[#E3000F] text-white border-0 pointer-events-none"
              >
                3
              </Badge>
            </Button>

            <NotificationPanel
              open={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        </div>
      </header>

      <CommandPalette open={showCommand} onOpenChange={setShowCommand} />
    </>
  );
}
