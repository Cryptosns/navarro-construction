import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-sm font-bold text-white">
            NC
          </div>
          <span className="text-lg font-semibold">NavarroConstruction</span>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Accede a tu panel de control de obras.
        </p>
        <div className="mt-6">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
