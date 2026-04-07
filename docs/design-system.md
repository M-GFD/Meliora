# Sistema de diseño (UI)

## Tono

Sobrio, cívico, legible. Prioridad a **claridad** y **accesibilidad** frente a estímulos de engagement.

## Colores (Tailwind)

- **Ink** (`meliora-ink`) — texto principal.
- **Paper** (`meliora-paper`) — fondo.
- **Accent** (`meliora-accent`) — acciones y enlaces.
- **Muted** (`meliora-muted`) — texto secundario.

## Reglas de producto en UI

- **No mostrar totales de votos ni “likes” antes de que el usuario vote** — implementar a nivel de componente (ver `VotePanel`).
- Iconos interactivos deben tener **etiquetas ARIA** cuando solo son iconos.
- Navegación por **teclado** en controles interactivos.

## Componentes

- Base: `apps/web/components/ui/` (ampliar con librería interna según evolución).
- Dominio: `post/`, `cluster/`, `consensus/`, `notifications/`, `layout/`.
