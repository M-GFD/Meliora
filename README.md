# Meliora

Plataforma de deliberación cívica e infraestructura de inteligencia colectiva.  
*Meliora* — «cosas cada vez mejores». Concepto y diseño: Mateo G. Fontana Dalmasso · [M-GFD](https://github.com/M-GFD) · [mgfd.com.ar](https://mgfd.com.ar)

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io) 9+
- Python 3.11+ (servicio ML)
- Docker y Docker Compose (PostgreSQL y Redis en local)

## Instalación

```bash
pnpm install
```

## Variables de entorno

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp services/ml/.env.example services/ml/.env
```

Ajusta secretos (`JWT_SECRET`, `NEXTAUTH_SECRET`) antes de desplegar.

## Base de datos e infraestructura

```bash
docker compose up -d
cd apps/api && pnpm exec prisma migrate dev
```

(Desde la raíz también puedes usar `pnpm db:migrate` tras configurar `apps/api/.env`.)

## Desarrollo

Terminal 1 — frontend y API Node:

```bash
pnpm dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000](http://localhost:4000)

Terminal 2 — servicio ML (FastAPI):

```bash
cd services/ml
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Estructura

| Ruta | Descripción |
|------|-------------|
| `apps/web` | Next.js (App Router), UI pública |
| `apps/api` | Express + Socket.io + Prisma |
| `services/ml` | FastAPI, PCA / clustering |
| `packages/shared-types` | Tipos compartidos (incl. eventos Socket) |
| `docs/` | Documentación de concepto, API y algoritmo |

## Subir a GitHub

Cuando exista el repositorio vacío `M-GFD/meliora`:

```bash
git remote add meliora https://github.com/M-GFD/meliora.git
# o: git remote set-url origin https://github.com/M-GFD/meliora.git
git push -u meliora main
```

## Licencia

Privado / por definir según el titular del repositorio.
