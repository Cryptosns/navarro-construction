"use server";

import { createClient } from "@/lib/supabase/server";
import { normalizePhoneNumber } from "@/lib/notifications/phone";
import { sendTestReminder } from "@/lib/notifications/send-reminders";
import { revalidatePath } from "next/cache";

export async function saveNotificationPreferences(input: {
  smsEnabled: boolean;
  phoneNumber: string;
  pushEnabled: boolean;
  reminderMinutes: number;
}): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  let phoneE164: string | null = null;
  if (input.phoneNumber.trim()) {
    phoneE164 = normalizePhoneNumber(input.phoneNumber);
    if (!phoneE164) {
      return {
        ok: false,
        message: "Número inválido. Usa formato +52 81 1234 5678 o 10 dígitos.",
      };
    }
  }

  if (input.smsEnabled && !phoneE164) {
    return { ok: false, message: "Ingresa tu número de teléfono para activar SMS." };
  }

  const { error } = await supabase.from("notification_preferences").upsert(
    {
      user_id: user.id,
      sms_enabled: input.smsEnabled,
      phone_number: phoneE164,
      push_enabled: input.pushEnabled,
      reminder_minutes: input.reminderMinutes,
    },
    { onConflict: "user_id" },
  );

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Preferencias guardadas." };
}

export async function sendTestNotification(): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: "Debes iniciar sesión." };

  return sendTestReminder(user.id);
}
