export function DocumentViewer({
  document,
}: {
  document: { id: string; content: unknown; createdAt: string };
}) {
  return (
    <section className="rounded-lg border border-meliora-ink/10 bg-white p-4">
      <h2 className="text-sm font-semibold text-meliora-ink">Documento de consenso</h2>
      <p className="mt-1 text-xs text-meliora-muted">
        Generado el {new Date(document.createdAt).toLocaleString()}
      </p>
      <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-meliora-paper p-3 text-xs text-meliora-ink">
        {JSON.stringify(document.content, null, 2)}
      </pre>
    </section>
  );
}
