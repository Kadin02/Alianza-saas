import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.modules.auth import models as auth_models  # noqa: F401 — registra User en Base
from app.modules.auth.router import router as auth_router
from app.modules.organizations import models as org_models  # noqa: F401 — registra Organization/Membership
from app.modules.organizations.router import router as organizations_router

logger = logging.getLogger(__name__)

app = FastAPI(title="Alianza SaaS API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Error no manejado en %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"})


api_router_prefix = "/api"
app.include_router(auth_router, prefix=api_router_prefix)
app.include_router(organizations_router, prefix=api_router_prefix)


@app.get("/health")
def health():
    return {"status": "ok"}
