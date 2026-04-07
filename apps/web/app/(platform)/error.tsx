"use client";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-meliora-ink">Algo salió mal</h1>
      <p className="mt-2 text-sm text-meliora-muted">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-md bg-meliora-ink px-4 py-2 text-sm text-meliora-paper"
      >
        Reintentar
      </button>
    </div>
  );
}
