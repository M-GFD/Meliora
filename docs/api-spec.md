# Especificación de API (REST)

Base URL (desarrollo): `http://localhost:4000`

## Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login (JWT) |
| GET | `/api/auth/me` | Usuario actual (`Authorization: Bearer`) |

## Posts y votos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/posts/feed` | Feed |
| POST | `/api/posts` | Crear post (auth) |
| GET | `/api/posts/:id` | Detalle |
| POST | `/api/posts/:id/vote` | Votar (auth, no autor) |

## Clusters

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clusters/me` | Membresías del usuario (auth) |
| GET | `/api/clusters/:id` | Detalle |
| GET | `/api/clusters/:id/posts` | Posts asociados (placeholder) |

## Consenso

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/consensus` | Espacios activos |
| GET | `/api/consensus/:id` | Detalle con enunciados y documento |
| POST | `/api/consensus/:id/statement` | Nuevo enunciado votable (auth) |
| POST | `/api/consensus/:id/statement/:statementId/vote` | Voto sobre enunciado (auth) |
| GET | `/api/consensus/:id/document` | Documento si existe |

## Notificaciones y usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/notifications` | Lista (auth) |
| PATCH | `/api/notifications/:id/read` | Marcar leída (auth) |
| GET | `/api/users/:userId` | Perfil público mínimo |

## WebSocket (Socket.io)

Eventos definidos en `packages/shared-types` (`ServerToClientEvents`, `ClientToServerEvents`).
