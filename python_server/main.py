from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import concrete, steel, structural

app = FastAPI(
    title="Servidor de Cálculo Estructural",
    version="1.0.0",
    description="API para cálculos de análisis y diseño estructural",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(concrete.router, prefix="/concreto", tags=["Concreto"])
app.include_router(steel.router, prefix="/acero", tags=["Acero"])
app.include_router(structural.router, prefix="/estructural", tags=["Estructural"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
