import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function calculateHealthScore(lastVisitDate: string | null | undefined): {
  score: number;
  label: string;
  color: "green" | "yellow" | "red";
} {
  if (!lastVisitDate) {
    return { score: 0, label: "Kein Besuch", color: "red" };
  }
  const daysSinceVisit = Math.floor(
    (Date.now() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceVisit <= 30) {
    return { score: 90, label: "Sehr gut", color: "green" };
  } else if (daysSinceVisit <= 60) {
    return { score: 65, label: "Gut", color: "green" };
  } else if (daysSinceVisit <= 90) {
    return { score: 40, label: "Mäßig", color: "yellow" };
  } else {
    return { score: 15, label: "Kritisch", color: "red" };
  }
}
