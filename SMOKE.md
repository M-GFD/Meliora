## Smoke checklist (Meliora)

### Servicios
- **DB**: PostgreSQL accesible por `DATABASE_URL`
- **ML**: `ML_SERVICE_URL=http://localhost:8000`
- **API**: `apps/api` en `http://localhost:4000`
- **Web**: `apps/web` en `http://localhost:3000`

### Flujo A (demo)
- Crear cuenta, iniciar sesión.
- Ir a `/feed`, crear un post.
- Votar un post con un usuario distinto.
- Ver que el voto responde 200 y que el feed se refresca.
- Si ML devuelve `openSpace`, verificar que aparece “Entrar al espacio” en el post.
- Entrar a `/consensus/[id]`.
- Crear un enunciado (statement).
- Votar un enunciado con otro usuario.
- Ver que llega realtime `space:statement_voted` (la UI se refresca sin reload manual).
- Ir a `/notifications` y ver notificaciones; marcar como leído.

### Flujo C (clusters)
- Llamar `POST /api/clusters/run` (autenticado) con la API arriba.
- Ver que se persisten clusters/memberships y que el servidor emite `cluster:updated`.

