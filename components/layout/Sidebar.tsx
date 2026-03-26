"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Phone,
  MapPin,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Wochenplanung",
    href: "/wochenplanung",
    icon: CalendarDays,
  },
  {
    label: "Kunden",
    href: "/kunden",
    icon: Users,
  },
  {
    label: "Aufgaben",
    href: "/aufgaben",
    icon: CheckSquare,
  },
  {
    label: "Anrufe",
    href: "/anrufe",
    icon: Phone,
  },
  {
    label: "Besuche",
    href: "/besuche",
    icon: MapPin,
  },
  {
    label: "Angebote",
    href: "/angebote",
    icon: FileText,
  },
  {
    label: "Statistiken",
    href: "/statistiken",
    icon: BarChart3,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex flex-col bg-white dark:bg-[#0f1117] border-r border-gray-200 dark:border-[#1e2130] shadow-sm dark:shadow-none">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-[#1e2130]">
        <div className="flex items-center justify-center w-10 h-10 shrink-0">
          <Image
            src="/logo.png"
            alt="E.W. NEU GmbH Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        <div>
          <span className="text-gray-900 dark:text-white font-bold text-base leading-tight tracking-tight">
            E.W. NEU GmbH
          </span>
          <span className="block text-gray-400 dark:text-[#94a3b8] text-[10px] font-medium tracking-widest uppercase">
            CRM System
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 sidebar-scroll">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-[#94a3b8]/60 uppercase">
            Navigation
          </span>
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-[#E3000F]/10 text-[#E3000F] border border-[#E3000F]/20"
                      : "text-gray-600 dark:text-[#94a3b8] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d27]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive
                        ? "text-[#E3000F]"
                        : "text-gray-400 dark:text-[#64748b] group-hover:text-gray-700 dark:group-hover:text-white"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3 h-3 text-[#E3000F]/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 mb-2 px-3">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-[#94a3b8]/60 uppercase">
            Konfiguration
          </span>
        </div>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/einstellungen"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer",
                pathname.startsWith("/einstellungen")
                  ? "bg-[#E3000F]/10 text-[#E3000F] border border-[#E3000F]/20"
                  : "text-gray-600 dark:text-[#94a3b8] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1d27]"
              )}
            >
              <Settings
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  pathname.startsWith("/einstellungen")
                    ? "text-[#E3000F]"
                    : "text-gray-400 dark:text-[#64748b] group-hover:text-gray-700 dark:group-hover:text-white"
                )}
              />
              <span className="flex-1">Einstellungen</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-[#1e2130] px-4 py-4">
        <div className="flex items-center gap-3 group cursor-pointer rounded-xl p-1.5 -mx-1.5 hover:bg-gray-100 dark:hover:bg-[#1a1d27] transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#E3000F]/20 text-[#E3000F] text-xs font-bold">
              TB
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Thomas Berger
            </p>
            <p className="text-xs text-gray-500 dark:text-[#94a3b8] truncate">
              Vertriebsleiter
            </p>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}
