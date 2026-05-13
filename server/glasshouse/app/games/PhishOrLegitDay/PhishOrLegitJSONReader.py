import json
from datetime import date
from app.result import Result

from app.games.PhishOrLegitDay.PhishOrLegitJSON import (
    PhishOrLegitDay,
    PhishQuestion,
    PhishEmail,
    EmailHeader,
    BodyElement,
    Clue,
    FocusArea,
)
from app.games.Structs.question_types import QuestionType
from app.games.Structs.difficulty import Difficulty


def load_phish_or_legit_day(file_path: str) -> "Result[PhishOrLegitDay, str]":
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return parse_phish_or_legit_day(data)

def parse_phish_or_legit_day_from_string(json_str: str) -> "Result[PhishOrLegitDay, str]":
    data = json.loads(json_str)
    return parse_phish_or_legit_day(data)

def parse_phish_or_legit_day(data: dict) -> "Result[PhishOrLegitDay, str]":
    try:
        parsed_questions = [
            _parse_phish_question(q)
            for q in data["questions"]
        ]

        return Result.Ok(
            PhishOrLegitDay(
                date=date.fromisoformat(data["date"]),
                question_type=QuestionType(data["question_type"]),
                questions=parsed_questions,
            )
        )

    except Exception as ex:
        return Result.Err(str(ex))
    
def _parse_phish_question(data: dict) -> PhishQuestion:
    return PhishQuestion(
        id=data["id"],
        difficulty=Difficulty(data["difficulty"]),
        instruction=data["instruction"],
        teaching_point=data["teaching_point"],
        emails=[
            _parse_phish_email(e)
            for e in data["emails"]
        ],
    )

def _parse_phish_email(data: dict) -> PhishEmail:
    return PhishEmail(
        id=data["id"],
        is_phishing=data["is_phishing"],
        focus_area=FocusArea(data["focus_area"]),
        headers=_parse_email_headers(data["headers"]),
        body=_parse_body(data.get("body")),
        clues=[
            Clue(
                label=c["label"],
                explanation=c["explanation"],
            )
            for c in data["clues"]
        ],
        explanation=data["explanation"],
    )

def _parse_email_headers(data: dict) -> EmailHeader:
    return EmailHeader(
        from_name=data["from_name"],
        from_address=data["from_address"],
        to=data["to"],
        date=data["date"],
        subject=data["subject"],
        reply_to=data.get("reply_to"),
    )

def _parse_body(body_data: list | None):
    if body_data is None:
        return None

    return [
        BodyElement(
            question_type=b["type"],
            content=b["content"],
            href=b.get("href"),
            urgent=b.get("urgent"),
        )
        for b in body_data
    ]