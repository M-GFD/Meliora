def transversal_consensus_score(vote_data: dict) -> float:
    """Heurística simple hasta conectar con datos reales por post/cluster."""
    if not vote_data:
        return 0.0
    agree = float(vote_data.get("agree", 0))
    total = float(vote_data.get("total", 0))
    if total <= 0:
        return 0.0
    return max(0.0, min(1.0, agree / total))
