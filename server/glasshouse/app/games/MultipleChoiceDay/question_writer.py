import json
from dataclasses import asdict, is_dataclass    
from datetime import date
from enum import Enum
from app.games.MultipleChoiceDay.question_structs import MultipleChoiceQuestions

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, Enum):
            return obj.value
        if is_dataclass(obj):
            return asdict(obj)
        return super().default(obj)

def write_questions_json(questions: MultipleChoiceQuestions, file_path: str = " ") -> None:
    with open(file_path, "w") as f:
        json.dump(asdict(questions), f, indent=2, cls=EnhancedJSONEncoder)