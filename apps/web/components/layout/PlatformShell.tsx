"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const { data } = useSession();

  return (
    <div className="min-h-screen">
      <header className="border-b border-meliora-ink/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/feed" className="text-sm font-semibold tracking-tight text-meliora-ink no-underline">
            Meliora
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-meliora-muted">
            <Link href="/feed" className="no-underline hover:text-meliora-ink">
              Feed
            </Link>
            <Link href="/notifications" className="no-underline hover:text-meliora-ink">
              Avisos
            </Link>
            {data?.user?.id ? (
              <Link
                href={`/profile/${data.user.id}`}
                className="no-underline hover:text-meliora-ink"
              >
                Perfil
              </Link>
            ) : null}
            {data?.user?.id ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/feed" })}
                className="rounded-md border border-meliora-ink/15 px-2 py-1 text-meliora-ink hover:border-meliora-accent"
              >
                Salir
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md border border-meliora-ink/15 px-2 py-1 text-meliora-ink no-underline hover:border-meliora-accent"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-meliora-ink px-2 py-1 text-meliora-paper no-underline hover:bg-meliora-accent"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8">{children}</div>
    </div>
  );
}
