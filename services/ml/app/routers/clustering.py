from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.consensus import transversal_consensus_score
from app.core.kmeans import dynamic_kmeans
from app.core.pca import project_votes

router = APIRouter()
document_router = APIRouter()


class ClusterRunBody(BaseModel):
    """Cuerpo alineado con la API Node: `{ votes: matriz }`."""

    votes: list[list[float]] = Field(default_factory=list)


class ClusterRunResponse(BaseModel):
    clusters: list[dict]
    memberships: list[dict]


@router.post("/run", response_model=ClusterRunResponse)
def run_clustering(body: ClusterRunBody):
    projected = project_votes(body.votes)
    clusters, memberships = dynamic_kmeans(projected)
    return ClusterRunResponse(clusters=clusters, memberships=memberships)


class ConsensusCheckIn(BaseModel):
    post_id: str
    cluster_ids: list[str] = Field(default_factory=list)
    vote_data: dict = Field(default_factory=dict)


class ConsensusCheckOut(BaseModel):
    has_transversal_consensus: bool
    agreement_score: float


@router.post("/consensus-check", response_model=ConsensusCheckOut)
def consensus_check(body: ConsensusCheckIn):
    score = transversal_consensus_score(body.vote_data)
    return ConsensusCheckOut(
        has_transversal_consensus=score >= 0.65,
        agreement_score=score,
    )


class DocumentGenerateIn(BaseModel):
    space_id: str
    statements: list[dict] = Field(default_factory=list)
    votes: list[dict] = Field(default_factory=list)


class DocumentGenerateOut(BaseModel):
    document: dict


@document_router.post("/generate", response_model=DocumentGenerateOut)
def generate_document(body: DocumentGenerateIn):
    summary = {
        "spaceId": body.space_id,
        "statementCount": len(body.statements),
        "voteCount": len(body.votes),
        "summary": "Borrador automático: conectar con modelo o reglas cuando el espacio alcance madurez.",
    }
    return DocumentGenerateOut(document=summary)
