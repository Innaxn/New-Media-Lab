
from dataclasses import dataclass
from typing import List

@dataclass
class QuestionMetadata:
    difficulty: str 
    hint: str

@dataclass
class MultipleChoiceQuestion:
    type: str 
    question: str
    options: List[str]
    correct_option: int
    metadata: QuestionMetadata