import os

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


load_dotenv()


# --------------------------------------------------
# CONFIG
# --------------------------------------------------

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "*"
)


# --------------------------------------------------
# APP
# --------------------------------------------------

app = FastAPI(
    title="Adrian Builds API",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

allowed_origins = [
    origin.strip()
    for origin in FRONTEND_ORIGIN.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class IdeaRequest(BaseModel):
    idea: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Adrian Builds API",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
    }


# --------------------------------------------------
# TELEGRAM
# --------------------------------------------------

async def send_telegram_message(message: str):
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN is not configured."
        )

    if not TELEGRAM_CHAT_ID:
        raise RuntimeError(
            "TELEGRAM_CHAT_ID is not configured."
        )

    url = (
        f"https://api.telegram.org/"
        f"bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    )

    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            url,
            json=payload,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Telegram API error: {response.text}"
        )


# --------------------------------------------------
# SUBMIT IDEA
# --------------------------------------------------

@app.post("/api/ideas")
async def submit_idea(payload: IdeaRequest):

    idea = payload.idea.strip()

    if not idea:
        raise HTTPException(
            status_code=400,
            detail="Idea cannot be empty.",
        )

    message = (
        "💡 NEW APP IDEA\n\n"
        f"{idea}\n\n"
        "🌐 Source: Adrian Builds"
    )

    try:
        await send_telegram_message(message)

    except Exception as error:
        print(f"Telegram error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Could not send the idea.",
        )

    return {
        "success": True,
        "message": "Idea sent successfully.",
    }
