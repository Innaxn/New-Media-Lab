
from dataclasses import asdict 
from typing import List
from question_struct import MultipleChoiceQuestion
import json 

def write_questions_json(questions: List[MultipleChoiceQuestion]) -> None: 
    with open("questions.json", "w") as f:
        json.dump([asdict(q) for q in questions], f, indent=2)