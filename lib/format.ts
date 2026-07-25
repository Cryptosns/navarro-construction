import type { ProjectStatus } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTime(time?: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planificación",
  in_progress: "En progreso",
  on_hold: "En pausa",
  completed: "Completado",
};

export const statusColors: Record<ProjectStatus, string> = {
  planning: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  on_hold: "bg-zinc-100 text-zinc-700",
  completed: "bg-emerald-100 text-emerald-800",
};

export const priorityColors = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-amber-500 bg-amber-50",
  low: "border-l-blue-500 bg-blue-50",
} as const;
