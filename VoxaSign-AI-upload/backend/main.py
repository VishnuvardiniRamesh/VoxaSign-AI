import json
import os
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


Situation = Literal[
    "general",
    "emergency",
    "hospital",
    "transportation",
    "college",
]


class AnalyzeRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    situation: Situation = "general"


class AnalyzeResponse(BaseModel):
    situation: str
    intent: str
    urgency: str
    meaning: str
    sign_sequence: list[str]
    unavailable_signs: list[str]


app = FastAPI(
    title="SignBridge AI API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mock_analyze(message: str, situation: Situation) -> AnalyzeResponse:
    """
    Local prototype analyzer.

    This version does not require an API key.
    It uses situation selection and simple keyword rules.
    """

    text = message.lower()

    if situation == "emergency" or any(
        word in text
        for word in [
            "fire",
            "smoke",
            "danger",
            "leave now",
            "police",
            "ambulance",
            "need help",
        ]
    ):
        return AnalyzeResponse(
            situation="emergency",
            intent="evacuation_warning",
            urgency="critical",
            meaning="Warn people about danger and ask them to leave.",
            sign_sequence=["FIRE", "DANGER", "LEAVE"],
            unavailable_signs=[],
        )

    if situation == "hospital" or any(
        word in text
        for word in [
            "doctor",
            "hospital",
            "medicine",
            "pain",
            "nurse",
        ]
    ):
        return AnalyzeResponse(
            situation="hospital",
            intent="request_assistance",
            urgency="medium",
            meaning="Ask a medical professional for help.",
            sign_sequence=["DOCTOR", "HELP", "NEED"],
            unavailable_signs=[],
        )

    if situation == "transportation" or any(
        word in text
        for word in [
            "train",
            "bus",
            "platform",
            "station",
        ]
    ):
        if "cancelled" in text or "canceled" in text:
            return AnalyzeResponse(
                situation="transportation",
                intent="travel_update",
                urgency="normal",
                meaning=(
                    "The train was cancelled and the traveler "
                    "should go to platform 4."
                ),
                sign_sequence=[
                    "TRAIN",
                    "CANCELLED",
                    "GO",
                    "PLATFORM",
                    "4",
                ],
                unavailable_signs=[],
            )

        return AnalyzeResponse(
            situation="transportation",
            intent="travel_update",
            urgency="normal",
            meaning="Communicate a transportation-related update or request.",
            sign_sequence=["TRAIN", "PLATFORM", "WAIT"],
            unavailable_signs=[],
        )

    if situation == "college" or any(
        word in text
        for word in [
            "class",
            "classroom",
            "professor",
            "campus",
            "college",
            "library",
        ]
    ):
        return AnalyzeResponse(
            situation="college",
            intent="class_navigation",
            urgency="normal",
            meaning="Ask where to find a class or classroom.",
            sign_sequence=["COLLEGE", "WHERE", "CLASS"],
            unavailable_signs=[],
        )

    return AnalyzeResponse(
        situation=situation,
        intent="general_communication",
        urgency="normal",
        meaning=message,
        sign_sequence=["HELP", "PLEASE"],
        unavailable_signs=["FULL_SENTENCE_TRANSLATION"],
    )


def ai_analyze(message: str, situation: Situation) -> AnalyzeResponse:
    """
    Optional OpenAI analyzer.

    The current app uses mock_analyze() so it works without paid API credits.
    """

    if client is None:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    prompt = f"""
You are the context engine for SignBridge AI.

Selected situation:
{situation}

User message:
{message}

Return only valid JSON with exactly these fields:
{{
  "situation": "",
  "intent": "",
  "urgency": "",
  "meaning": "",
  "sign_sequence": [],
  "unavailable_signs": []
}}

Rules:
- Use the selected situation unless the message clearly indicates another situation.
- Keep sign_sequence short and meaningful.
- Use uppercase words in sign_sequence.
- If a concept is unavailable, add it to unavailable_signs.
- Do not include Markdown or explanations outside the JSON.
"""

    response = client.responses.create(
        model="gpt-4o-mini",
        input=prompt,
    )

    result = json.loads(response.output_text)

    return AnalyzeResponse(
        situation=result["situation"],
        intent=result["intent"],
        urgency=result["urgency"],
        meaning=result["meaning"],
        sign_sequence=result["sign_sequence"],
        unavailable_signs=result["unavailable_signs"],
    )


@app.get("/")
def root():
    return {"message": "SignBridge AI API is running"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    # Local mode: works without API credits.
    return mock_analyze(request.message, request.situation)

    # To use the OpenAI version later, replace the line above with:
    # return ai_analyze(request.message, request.situation)