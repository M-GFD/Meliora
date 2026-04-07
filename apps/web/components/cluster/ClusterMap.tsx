"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

type ClusterMapProps = {
  clusterId: string;
  signature: unknown;
};

/** Visualización mínima D3: posición derivada del hash estable del id (placeholder hasta datos PCA reales). */
export function ClusterMap({ clusterId, signature }: ClusterMapProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const width = 320;
    const height = 200;
    const hash = Array.from(clusterId).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const cx = 80 + (hash % 17) * 8;
    const cy = 60 + ((hash * 3) % 11) * 10;

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
      .text("Firma (JSON) disponible para el motor ML");

    void signature;
  }, [clusterId, signature]);

  return (
    <div className="rounded-lg border border-meliora-ink/10 bg-white p-4">
      <svg ref={ref} className="h-auto w-full max-w-sm" aria-label="Mapa de cluster simplificado" />
      <p className="mt-2 text-xs text-meliora-muted">
        En producción, los puntos reflejarán proyecciones PCA en tiempo real desde el servicio ML.
      </p>
    </div>
  );
}
