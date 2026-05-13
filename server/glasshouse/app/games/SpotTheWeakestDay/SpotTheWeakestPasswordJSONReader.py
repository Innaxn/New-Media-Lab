import json
from datetime import date
from typing import Any

from app.result import Result
from app.games.SpotTheWeakestDay.SpotTheWeakestPasswordJSON import (
    WeakestPasswordDay,
    WeakestPasswordQuestion,
    PasswordCandidate
)
from app.games.Structs.difficulty import Difficulty
from app.games.Structs.question_types import QuestionType

def parse_weakest_password_from_string(json_str: str) -> Result[WeakestPasswordDay, str]:
    try:
        data = json.loads(json_str)
        return parse_weakest_password(data)

    except Exception as ex:
        return Result.Err(str(ex))

def load_weakest_password(file_path: str) -> Result[WeakestPasswordDay, str]:
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return parse_weakest_password(data)

    except Exception as ex:
        return Result.Err(str(ex))

def parse_weakest_password(data: dict) -> Result[WeakestPasswordDay, str]:
    try:
        questions = [
            WeakestPasswordQuestion(
                id=q["id"],
                difficulty=Difficulty(q["difficulty"]),
                scenario=q["scenario"],
                hint=q["hint"],
                candidates=[
                    PasswordCandidate(
                        id=c["id"],
                        value=c["value"],
                        is_weakest=c["is_weakest"],
                        explanation=c["explanation"],
                        entropy_label=c["entropy_label"]
                    )
                    for c in q["candidates"]
                ]
            )
            for q in data["questions"]
        ]

        return Result.Ok(
            WeakestPasswordDay(
                date=date.fromisoformat(data["date"]),
                question_type=QuestionType(data["question_type"]),
                questions=questions
            )
        )

    except Exception as ex:
        return Result.Err(str(ex))