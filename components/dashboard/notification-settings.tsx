"use client";

import { useState } from "react";
import {
  saveNotificationPreferences,
  sendTestNotification,
} from "@/app/dashboard/settings/notification-actions";

const reminderOptions = [
  { value: 15, label: "15 minutos antes" },
  { value: 30, label: "30 minutos antes" },
  { value: 60, label: "1 hora antes" },
  { value: 120, label: "2 horas antes" },
  { value: 1440, label: "1 día antes" },
];

type NotificationSettingsProps = {
  initialSmsEnabled: boolean;
  initialPhoneNumber: string;
  initialPushEnabled: boolean;
  initialReminderMinutes: number;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationSettings({
  initialSmsEnabled,
  initialPhoneNumber,
  initialPushEnabled,
  initialReminderMinutes,
}: NotificationSettingsProps) {
  const [smsEnabled, setSmsEnabled] = useState(initialSmsEnabled);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [pushEnabled, setPushEnabled] = useState(initialPushEnabled);
  const [reminderMinutes, setReminderMinutes] = useState(initialReminderMinutes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function subscribeToPush() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error("Push no configurado en el servidor.");
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const res = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "No se pudo activar push.");
    }
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);

    try {
      let nextPushEnabled = pushEnabled;

      if (pushEnabled) {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
          throw new Error("Tu navegador no soporta notificaciones push.");
        }
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          nextPushEnabled = false;
        } else {
          await subscribeToPush();
        }
      } else {
        await fetch("/api/notifications/subscribe", { method: "DELETE" });
      }

      const result = await saveNotificationPreferences({
        smsEnabled,
        phoneNumber,
        pushEnabled: nextPushEnabled,
        reminderMinutes,
      });

      setPushEnabled(nextPushEnabled);
      setMessage(result.message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTest() {
    setLoading(true);
    setMessage(null);

    const result = await sendTestNotification();
    setMessage(result.message);
    setLoading(false);
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-zinc-900">Recordatorios del calendario</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Recibe un SMS en tu teléfono antes de cada evento con título, hora, proyecto y tipo.
      </p>

      <div className="mt-4 space-y-4">
        <label className="block text-sm text-zinc-700">
          <span className="mb-1 block font-medium">Número de teléfono</span>
          <input
            type="tel"
            value={phoneNumber}
            disabled={loading}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+52 81 1234 5678"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
          <span className="mt-1 block text-xs text-zinc-500">
            Incluye código de país. México: +52 y 10 dígitos.
          </span>
        </label>

        <label className="flex items-center justify-between gap-4 text-sm text-zinc-700">
          <span>Recordatorios por SMS</span>
          <input
            type="checkbox"
            checked={smsEnabled}
            disabled={loading}
            onChange={(e) => setSmsEnabled(e.target.checked)}
            className="size-4 rounded"
          />
        </label>

        <label className="block text-sm text-zinc-700">
          <span className="mb-1 block font-medium">Recordar antes del evento</span>
          <select
            value={reminderMinutes}
            disabled={loading}
            onChange={(e) => setReminderMinutes(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          >
            {reminderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <details className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium text-zinc-700">
            Notificaciones push (opcional)
          </summary>
          <label className="mt-3 flex items-center justify-between gap-4 text-zinc-700">
            <span>Activar push en el navegador</span>
            <input
              type="checkbox"
              checked={pushEnabled}
              disabled={loading}
              onChange={(e) => setPushEnabled(e.target.checked)}
              className="size-4 rounded"
            />
          </label>
        </details>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={loading || (!smsEnabled && !pushEnabled)}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Enviar prueba
          </button>
        </div>

        {message && (
          <p className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700">{message}</p>
        )}
      </div>
    </section>
  );
}
