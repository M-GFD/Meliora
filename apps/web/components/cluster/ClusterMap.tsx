"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type ClusterMapProps = {
  clusterId: string;
  signature: unknown;
};

function extractPoint(signature: unknown): { x: number; y: number } | null {
  if (!signature || typeof signature !== "object") return null;
  const sig = signature as Record<string, unknown>;

  const fromTuple = (v: unknown) =>
    Array.isArray(v) && v.length >= 2 && typeof v[0] === "number" && typeof v[1] === "number"
      ? { x: v[0], y: v[1] }
      : null;

  // Acepta varios formatos típicos de salida ML.
  if ("pca2d" in sig) return fromTuple(sig.pca2d);
  if ("pca" in sig) return fromTuple(sig.pca);
  if ("coords" in sig) return fromTuple(sig.coords);
  if ("embedding2d" in sig) return fromTuple(sig.embedding2d);

  if ("x" in sig && "y" in sig && typeof sig.x === "number" && typeof sig.y === "number") {
    return { x: sig.x, y: sig.y };
  }
  return null;
}

/** Visualización D3: usa PCA/coords si existe, si no cae a hash estable. */
export function ClusterMap({ clusterId, signature }: ClusterMapProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const width = 320;
    const height = 200;
    const point = extractPoint(signature);
    const fallbackHash = Array.from(clusterId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

    // Si hay coordenadas (p. ej. PCA 2D), las normalizamos a una ventana razonable.
    // Si no, mantenemos el comportamiento “hash” para la demo.
    const cx = point ? 160 + Math.max(-1, Math.min(1, point.x)) * 90 : 80 + (fallbackHash % 17) * 8;
    const cy = point
      ? 100 + Math.max(-1, Math.min(1, point.y)) * 60
      : 60 + ((fallbackHash * 3) % 11) * 10;

    const selection = d3.select(svg);
    selection.selectAll("*").remove();
    selection.attr("viewBox", `0 0 ${width} ${height}`).attr("role", "img");

    selection
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("rx", 12)
      .attr("fill", "#f0ebe3")
      .attr("stroke", "#d6cfc4");

    selection
      .append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 18)
      .attr("fill", "#2d6a4f")
      .attr("opacity", 0.85);

    selection
      .append("text")
      .attr("x", 16)
      .attr("y", 28)
      .attr("fill", "#5c6b73")
      .attr("font-size", 12)
      .text(point ? "Proyección 2D desde firma (ML)" : "Firma (JSON) disponible para el motor ML");
  }, [clusterId, signature]);

  return (
    <div className="rounded-lg border border-meliora-ink/10 bg-white p-4">
      <svg ref={ref} className="h-auto w-full max-w-sm" aria-label="Mapa de cluster simplificado" />
      <p className="mt-2 text-xs text-meliora-muted">
        Si la firma incluye coordenadas (p. ej. `pca2d`), se dibuja su proyección 2D; si no, se usa
        una posición estable de demo.
      </p>
    </div>
  );
}
