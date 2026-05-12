from dataclasses import dataclass
from datetime import date
from app.games.Structs.question_types import QuestionType


@dataclass(kw_only=True)
class CookieBannerDay:
    date: date 
    type: QuestionType = QuestionType.CookieBanner