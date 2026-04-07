import numpy as np
from sklearn.cluster import KMeans


def dynamic_kmeans(
    projected: np.ndarray,
    max_clusters: int = 8,
) -> tuple[list[dict], list[dict]]:
    """Agrupa usuarios en el espacio proyectado; número de clusters acotado y heurístico."""
    if projected.size == 0:
        return [], []
    n_samples = projected.shape[0]
    k = max(1, min(max_clusters, n_samples))
    model = KMeans(n_clusters=k, random_state=42, n_init="auto")
    labels = model.fit_predict(projected)
    clusters = [
        {"id": f"c{i}", "centroid": model.cluster_centers_[i].tolist()} for i in range(k)
    ]
    memberships = [
        {"userIndex": int(i), "clusterId": f"c{int(labels[i])}", "weight": 1.0}
        for i in range(n_samples)
    ]
    return clusters, memberships
