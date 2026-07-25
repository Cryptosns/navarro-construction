import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <Hero />
      <Features />
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-zinc-900 px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Empieza en minutos</h2>
          <p className="mx-auto mt-4 max-w-xl text-zinc-400">
            Crea tu cuenta, importa tus proyectos y deja que la IA te ayude a
            tomar mejores decisiones desde el primer día.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Empezar ahora
          </Link>
        </div>
      </section>
      <footer className="border-t border-zinc-200 px-6 py-8 text-center text-sm text-zinc-500">
        © 2026 NavarroConstruction. Todos los derechos reservados.
      </footer>
    </div>
  );
}
