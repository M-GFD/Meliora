import numpy as np
from sklearn.decomposition import PCA


def project_votes(matrix: list[list[float]], n_components: int = 2) -> np.ndarray:
    """Proyección PCA de la matriz de votos (placeholder estable con pocos datos)."""
    if not matrix:
        return np.zeros((0, n_components))
    arr = np.asarray(matrix, dtype=float)
    if arr.ndim != 2:
        raise ValueError("matrix must be 2-dimensional")
    n_samples, n_features = arr.shape
    if n_samples < 2 or n_features < 1:
        return np.zeros((n_samples, n_components))
    k = min(n_components, n_features, n_samples)
    pca = PCA(n_components=k, random_state=42)
    return pca.fit_transform(arr)
