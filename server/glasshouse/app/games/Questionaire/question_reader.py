
import json 
from question_struct import MultipleChoiceQuestion, QuestionMetadata

from typing import List

def load_questions_from_json(file_path: str) -> List[MultipleChoiceQuestion]:
    with open(file_path, "r") as f:
        data = json.load(f)

    questions = [
        MultipleChoiceQuestion(
            id=q["id"],
            type=q["type"],
            question=q["question"],
            options=q["options"],
            correct_option=q["correct_option"],
            required=q.get("required", True),
            metadata=QuestionMetadata(**q["metadata"]) if q.get("metadata") else None
        )
        for q in data
    ]

    return questions