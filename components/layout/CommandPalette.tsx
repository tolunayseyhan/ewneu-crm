"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Phone,
  MapPin,
  FileText,
  BarChart3,
  Settings,
  Search,
  X,
} from "lucide-react";
import { mockKunden } from "@/lib/mock-data";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const quickLinks = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Kunden", href: "/kunden", icon: Users },
  { label: "Aufgaben", href: "/aufgaben", icon: CheckSquare },
  { label: "Anrufe", href: "/anrufe", icon: Phone },
  { label: "Besuche", href: "/besuche", icon: MapPin },
  { label: "Angebote", href: "/angebote", icon: FileText },
  { label: "Statistiken", href: "/statistiken", icon: BarChart3 },
  { label: "Einstellungen", href: "/einstellungen", icon: Settings },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredLinks = quickLinks.filter((l) =>
    l.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredKunden = mockKunden
    .filter(
      (k) =>
        k.name1.toLowerCase().includes(query.toLowerCase()) ||
        k.nummer.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);

  const navigate = (href: string) => {
    router.push(href);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div className="relative mx-auto mt-24 max-w-xl w-full px-4">
        <div className="rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Suchen oder navigieren..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {filteredKunden.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Kunden
                </div>
                {filteredKunden.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => navigate(`/kunden/${k.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E3000F]/10 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-[#E3000F]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{k.name1}</p>
                      <p className="text-xs text-muted-foreground">
                        {k.nummer} · {k.ort}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div>
              <div className="px-4 py-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                Seiten
              </div>
              {filteredLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted text-left transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <link.icon className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border text-[10px] text-muted-foreground">
            <span>
              <kbd className="px-1 py-0.5 rounded border border-border font-mono">
                ↵
              </kbd>{" "}
              Öffnen
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-border font-mono">
                ↑↓
              </kbd>{" "}
              Navigieren
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-border font-mono">
                Esc
              </kbd>{" "}
              Schließen
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
