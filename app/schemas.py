from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


IdeaStatus = Literal[
    "new",
    "considering",
    "building",
    "built",
    "rejected",
]


class IdeaCreate(BaseModel):
    idea: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )

    # Honeypot field.
    # Real users leave this empty.
    website: str = Field(
        default="",
        max_length=200,
    )


class IdeaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea: str
    status: IdeaStatus
    is_public: bool
    created_at: datetime


class AdminIdeaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea: str
    status: IdeaStatus
    is_public: bool
    created_at: datetime
    updated_at: datetime


class IdeaUpdate(BaseModel):
    status: IdeaStatus | None = None
    is_public: bool | None = None
