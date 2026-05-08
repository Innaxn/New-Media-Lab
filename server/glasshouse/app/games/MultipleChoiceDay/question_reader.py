
import json 
from app.games.MultipleChoiceDay.question_structs import MultipleChoiceQuestions, Question 
from datetime import date
from app.games.difficulty import Difficulty

def load_multiple_choice_questions(file_path: str) -> MultipleChoiceQuestions:
    with open(file_path, "r") as f:
        data = json.load(f)

    survey_date = date.fromisoformat(data["date"])

    parsed_questions = []
    for q in data["questions"]:
        question_obj = Question(
            id=q["id"],
            question=q["question"],
            options=q["options"],
            correct_index=q["correct_index"],
            hint=q["hint"]
        )
        parsed_questions.append(question_obj)

    return MultipleChoiceQuestions(
        date=survey_date,
        questions=parsed_questions
    )