"use client";

import { useState } from "react";
import { seedDatabase } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setMessage(null);
    const result = await seedDatabase();
    setMessage(result.message);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-medium text-amber-900">
        Connect Supabase database
      </p>
      <p className="mt-1 text-xs text-amber-700">
        Run <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code>{" "}
        in your Supabase SQL Editor, then import demo data.
      </p>
      <Button
        onClick={handleSeed}
        disabled={loading}
        className="mt-3 bg-amber-500 hover:bg-amber-600"
      >
        {loading ? "Importing..." : "Import demo data to Supabase"}
      </Button>
      {message && (
        <p className="mt-2 text-xs text-amber-800">{message}</p>
      )}
    </div>
  );
}
