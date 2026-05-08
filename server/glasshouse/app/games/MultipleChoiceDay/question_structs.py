from datetime import date
from dataclasses import dataclass
from app.games.difficulty import Difficulty
from app.games.question_types import QuestionType
from typing import List

@dataclass(kw_only=True)
class Question:
    id: int 
    difficulty: Difficulty
    question: str 
    options: List[str]
    correct_index: int 
    hint: str

@dataclass(kw_only=True)
class MultipleChoiceQuestions:
    date: date
    question_type: QuestionType = QuestionType.MultipleChoice
    questions: List[Question]

'''
-------------------- Example JSON -----------------------------
{
  "date": "2025-04-22",
  "question_type": "multiple_choice",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "difficulty": "easy",
      "question": "What does GDPR stand for?",
      "options": [
        "General Data Protection Regulation",
        "Global Digital Privacy Rules",
        "Government Data Processing Rights",
        "General Digital Privacy Regulation"
      ],
      "correct_index": 0,
      "hint": "It's a European Union regulation — think 'regulation', not 'rules'."
    },
    {
      "id": 2,
      "type": "multiple_choice",
      "difficulty": "medium",
      "question": "Under GDPR, within how many hours must a data breach be reported to the supervisory authority?",
      "options": ["24 hours", "48 hours", "72 hours", "7 days"],
      "correct_index": 2,
      "hint": "Article 33 specifies a specific time window from the moment of becoming aware."
    },
    {
      "id": 3,
      "type": "multiple_choice",
      "difficulty": "hard",
      "question": "Which GDPR article states that pre-ticked consent checkboxes do NOT constitute valid consent?",
      "options": ["Article 6", "Article 7", "Recital 32", "Article 17"],
      "correct_index": 2,
      "hint": "Recitals provide interpretive guidance on the articles. This one is about the form consent must take."
    }
  ]
}

'''