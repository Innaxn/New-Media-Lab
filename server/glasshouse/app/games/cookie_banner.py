from dataclasses import dataclass
from datetime import date
from app.games.Structs.question_types import QuestionType


@dataclass(kw_only=True)
class CookieBannerDay:
    date: date 
    question_type: QuestionType = QuestionType.CookieBanner