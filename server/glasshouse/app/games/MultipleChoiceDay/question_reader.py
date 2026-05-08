
import json 
from app.games.MultipleChoiceDay.question_structs import MultipleChoiceQuestions, Question 
from datetime import date
from app.result import Result

def parse_multiple_choice_questions(data: dict) -> "Result[MultipleChoiceQuestions, str]":
    try:
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

        return Result.Ok( MultipleChoiceQuestions(
            date=survey_date,
            questions=parsed_questions
        ))
    
    except Exception as ex:
        return Result.Err(ex.__str__())


def load_multiple_choice_questions(file_path: str) -> "Result[MultipleChoiceQuestions, str]":
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return parse_multiple_choice_questions(data)

def parse_multiple_choice_questions_from_string(json_str: str) -> "Result[MultipleChoiceQuestions, str]":
    data = json.loads(json_str)
    return parse_multiple_choice_questions(data)