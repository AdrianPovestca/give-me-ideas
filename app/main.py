import os
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import require_admin
from .database import Base, engine, get_db
from .models import Idea
from .schemas import (
    AdminIdeaResponse,
    IdeaCreate,
    IdeaResponse,
    IdeaStatus,
    IdeaUpdate,
)


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# APP
# --------------------------------------------------

app = FastAPI(
    title="Adrian Builds API",
    description="Backend API for Adrian Builds idea submissions.",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

frontend_origin = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5500",
)

allowed_origins = [
    origin.strip()
    for origin in frontend_origin.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "Adrian Builds API",
        "status": "online",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# --------------------------------------------------
# PUBLIC: SUBMIT IDEA
# --------------------------------------------------

@app.post(
    "/api/ideas",
    response_model=IdeaResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_idea(
    payload: IdeaCreate,
    db: Session = Depends(get_db),
):
    idea_text = payload.idea.strip()

    if not idea_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Idea cannot be empty.",
        )

    # Honeypot protection.
    # If a bot filled this hidden field,
    # silently reject the submission.
    if payload.website.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid submission.",
        )

    new_idea = Idea(
        idea=idea_text,
        status="new",
        is_public=False,
    )

    db.add(new_idea)
    db.commit()
    db.refresh(new_idea)

    return new_idea


# --------------------------------------------------
# PUBLIC: IDEA WALL
# --------------------------------------------------

@app.get(
    "/api/ideas",
    response_model=list[IdeaResponse],
)
def get_public_ideas(
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
    ),
    db: Session = Depends(get_db),
):
    statement = (
        select(Idea)
        .where(Idea.is_public.is_(True))
        .where(Idea.status != "rejected")
        .order_by(Idea.created_at.desc())
        .limit(limit)
    )

    ideas = db.scalars(statement).all()

    return ideas


# --------------------------------------------------
# ADMIN: GET ALL IDEAS
# --------------------------------------------------

@app.get(
    "/api/admin/ideas",
    response_model=list[AdminIdeaResponse],
    dependencies=[Depends(require_admin)],
)
def get_admin_ideas(
    status_filter: IdeaStatus | None = Query(
        default=None,
        alias="status",
    ),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    db: Session = Depends(get_db),
):
    statement = select(Idea)

    if status_filter:
        statement = statement.where(
            Idea.status == status_filter
        )

    statement = (
        statement
        .order_by(Idea.created_at.desc())
        .limit(limit)
    )

    ideas = db.scalars(statement).all()

    return ideas


# --------------------------------------------------
# ADMIN: UPDATE IDEA
# --------------------------------------------------

@app.patch(
    "/api/admin/ideas/{idea_id}",
    response_model=AdminIdeaResponse,
    dependencies=[Depends(require_admin)],
)
def update_idea(
    idea_id: int,
    payload: IdeaUpdate,
    db: Session = Depends(get_db),
):
    idea = db.get(Idea, idea_id)

    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found.",
        )

    if payload.status is not None:
        idea.status = payload.status

    if payload.is_public is not None:
        idea.is_public = payload.is_public

    idea.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(idea)

    return idea


# --------------------------------------------------
# ADMIN: DELETE IDEA
# --------------------------------------------------

@app.delete(
    "/api/admin/ideas/{idea_id}",
    dependencies=[Depends(require_admin)],
)
def delete_idea(
    idea_id: int,
    db: Session = Depends(get_db),
):
    idea = db.get(Idea, idea_id)

    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Idea not found.",
        )

    db.delete(idea)
    db.commit()

    return {
        "success": True,
        "message": "Idea deleted.",
        "id": idea_id,
    }
