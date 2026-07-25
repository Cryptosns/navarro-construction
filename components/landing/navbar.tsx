"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
            NC
          </div>
          <span className="truncate text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
            NavarroConstruction
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
          <a href="#features" className="transition hover:text-zinc-900">
            Funciones
          </a>
          <a href="#how-it-works" className="transition hover:text-zinc-900">
            Cómo funciona
          </a>
        </nav>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 sm:px-4"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 sm:px-4"
          >
            Iniciar sesión
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 sm:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-1 text-sm text-zinc-600">
            <a
              href="#features"
              className="rounded-lg px-3 py-2.5 transition hover:bg-zinc-50 hover:text-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              Funciones
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-3 py-2.5 transition hover:bg-zinc-50 hover:text-zinc-900"
              onClick={() => setMobileOpen(false)}
            >
              Cómo funciona
            </a>
            <Link
              href="/signup"
              className="mt-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-center font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-200 px-3 py-2.5 text-center font-medium text-zinc-800"
              onClick={() => setMobileOpen(false)}
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
