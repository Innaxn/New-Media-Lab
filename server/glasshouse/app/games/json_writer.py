import json
from dataclasses import asdict, is_dataclass    
from datetime import date
from typing import Any
from enum import Enum
from app.result import Result

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, Enum):
            return obj.value
        if is_dataclass(obj):
            return asdict(obj)
        return super().default(obj)
    
def obj_to_json(obj: Any) -> str:
    return json.dumps(
        asdict(obj),
        indent=2,
        cls=EnhancedJSONEncoder
    )

def write_questions_json(questions: Any, file_path: str = " ") -> Result[str, str]:
    try:
        with open(file_path, "w") as f:
            json.dump(asdict(questions), f, indent=2, cls=EnhancedJSONEncoder)
        return Result.Ok(file_path)
    except Exception as ex:
        return Result.Err(ex.__str__())

def dump(questions: Any, file_path: str = " ") -> None:
    print(obj_to_json(questions))