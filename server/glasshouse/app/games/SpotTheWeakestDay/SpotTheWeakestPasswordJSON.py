from dataclasses import dataclass
from typing import List
from datetime import date

from app.games.Structs.difficulty import Difficulty
from app.games.Structs.question_types import QuestionType


@dataclass(kw_only=True)
class PasswordCandidate:
    id: str
    value: str
    is_weakest: bool
    explanation: str
    entropy_label: str

@dataclass(kw_only=True)
class WeakestPasswordQuestion:
    id: int
    difficulty: Difficulty
    scenario: str
    hint: str
    candidates: List[PasswordCandidate]


@dataclass(kw_only=True)
class WeakestPasswordDay:
    date: date
    question_type: QuestionType
    questions: List[WeakestPasswordQuestion]