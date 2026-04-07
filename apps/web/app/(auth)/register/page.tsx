"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Cuenta creada pero no se pudo iniciar sesión automáticamente.");
        return;
      }
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold text-meliora-ink">Crear cuenta</h1>
      <p className="mt-2 text-sm text-meliora-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-meliora-accent">
          Entrar
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-meliora-muted">Usuario</span>
          <input
            required
            minLength={2}
            maxLength={32}
            autoComplete="username"
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            className="rounded-md border border-meliora-ink/15 bg-white px-3 py-2 text-meliora-ink outline-none ring-meliora-accent focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-meliora-muted">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="rounded-md border border-meliora-ink/15 bg-white px-3 py-2 text-meliora-ink outline-none ring-meliora-accent focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-meliora-muted">Contraseña (mín. 8)</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="rounded-md border border-meliora-ink/15 bg-white px-3 py-2 text-meliora-ink outline-none ring-meliora-accent focus:ring-2"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-meliora-ink px-4 py-2 text-sm font-medium text-meliora-paper disabled:opacity-60"
        >
          {loading ? "Creando…" : "Registrarse"}
        </button>
      </form>
    </main>
  );
}
