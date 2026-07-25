import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
            NC
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900">
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
        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
