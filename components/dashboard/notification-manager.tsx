"use client";

import { useEffect } from "react";

export function NotificationManager() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignore registration errors in unsupported browsers */
    });
  }, []);

  return null;
}
