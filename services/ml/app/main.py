from fastapi import FastAPI

from app.routers import clustering

app = FastAPI(title="Meliora ML", version="0.1.0")

app.include_router(clustering.router, prefix="/cluster", tags=["cluster"])
app.include_router(clustering.document_router, prefix="/document", tags=["document"])


@app.get("/health")
def health():
    return {"ok": True, "service": "meliora-ml"}
