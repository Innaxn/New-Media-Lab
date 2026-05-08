
import json 
from app.games.MultipleChoiceDay.question_structs import MultipleChoiceQuestions, Question 
from datetime import date

def parse_multiple_choice_questions(data: dict) -> "MultipleChoiceQuestions":
    survey_date = date.fromisoformat(data["date"])

    parsed_questions = [
        Question(
            id=q["id"],
            difficulty=q["difficulty"], 
            question=q["question"],
            options=q["options"],
            correct_index=q["correct_index"],
            hint=q["hint"]
        )
        for q in data["questions"]
    ]

    return MultipleChoiceQuestions(
        date=survey_date,
        questions=parsed_questions
    )

def load_multiple_choice_questions(file_path: str) -> "MultipleChoiceQuestions":
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return parse_multiple_choice_questions(data)

def parse_multiple_choice_questions_from_string(json_str: str) -> "MultipleChoiceQuestions":
    data = json.loads(json_str)
    return parse_multiple_choice_questions(data)