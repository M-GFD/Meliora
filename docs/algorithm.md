# Algoritmo y servicio ML

## Flujo

1. Los votos de usuarios sobre posts se agregan en una **matriz usuario × dimensiones** (posts o factores derivados).
2. **PCA** reduce dimensionalidad para visualizar y clusterizar en un espacio estable.
3. **K-Means** (o variantes) asigna **clusters dinámicos** que se actualizan con nuevos votos.
4. **Consenso transversal** — se detecta cuando varios clusters muestran acuerdo significativo sobre el mismo post; eso puede abrir un **espacio de consenso**.

## Implementación en este repositorio

- Código de referencia: `services/ml/app/core/pca.py`, `kmeans.py`, `consensus.py`.
- Endpoints: `POST /cluster/run`, `POST /cluster/consensus-check`, `POST /document/generate`.
- La API Node (`apps/api`) es la única capa que debe llamar al ML desde el producto; el frontend nunca llama al servicio ML directamente.

## Colas asíncronas

Celery + Redis están previstos para jobs pesados de re-clustering; el cableado completo se puede añadir en `services/ml/app/tasks/`.
