
from dataclasses import dataclass
from .Structs.difficulty import Difficulty
from typing import List
from datetime import datetime, date 
from app.random import get_random_sample
from app.result import Result
from app.games.Structs.question_types import QuestionType
import re

@dataclass(kw_only=True)
class PasswordRule:
  regex: str
  description: str

@dataclass(kw_only=True)
class PasswordQuestion:
    question: str 
    rules: list[PasswordRule] 
    difficulty: Difficulty

@dataclass(kw_only=True)
class PasswordDay: 
    date: date 
    question_type: QuestionType = QuestionType.MultipleChoice
    questions: list[PasswordQuestion]


def construct_regex_easy_password_rule(description: str, regex: str) -> PasswordRule:
    return PasswordRule(
        regex=regex,
        description=description
    )

EASY_REGEX_RULES = [
    construct_regex_easy_password_rule(
        description="At least 8 characters",
        regex=r".{8,}"
    ),
    construct_regex_easy_password_rule(
        description="At least one uppercase letter",
        regex=r"[A-Z]"
    ),
    construct_regex_easy_password_rule(
        description="At least one lowercase letter",
        regex=r"[a-z]"
    ),
    construct_regex_easy_password_rule(
        description="At least one number",
        regex=r"\d"
    ),
    construct_regex_easy_password_rule(
        description="At least one special character",
        regex=r"[!@#$%^&*(),.?\":{}|<>]"
    ),
    construct_regex_easy_password_rule(
        description="Must not contain sequential numbers (like 1234)",
        regex=r"^(?!.*0123)(?!.*1234)(?!.*2345)(?!.*3456)(?!.*4567)(?!.*5678)(?!.*6789).*$"
    ),
    construct_regex_easy_password_rule(
        description="Must not have a character repeated 3+ times",
        regex=r"^(?!.*(.)\1\1).*$"
    ),
    construct_regex_easy_password_rule(
        description="No special characters at start or end",
        regex=r"^[A-Za-z0-9].*[A-Za-z0-9]$"
    )
]

MEDIUM_REGEX_RULES = [
    PasswordRule(
        description="Must be exactly 2 words",
        regex=r"^[^\s]+ [^\s]+$"
    ),
    PasswordRule(
        description="Must contain a special character not at the start or end",
        regex=r"^[A-Za-z0-9].*[!@#$%^&*(),.?\":{}|<>].*[A-Za-z0-9]$"
    ),
    PasswordRule(
        description="Special character must be surrounded by letters",
        regex=r".*[A-Za-z][!@#$%^&*(),.?\":{}|<>][A-Za-z].*"
    ),
    PasswordRule(
        description="Must contain both uppercase and lowercase letters",
        regex=r"^(?=.*[a-z])(?=.*[A-Z]).+$"
    ),
    PasswordRule(
        description="Must not contain the same character twice in a row",
        regex=r"^(?!.*(.)\1).+$"
    ),
    PasswordRule(
        description="Total length must be at least 10 characters",
        regex=r"^.{10,}$"
    ),
]

HARD_REGEX_RULES = [
    PasswordRule(
        description="Must be exactly 4 words",
        regex=r"^(?:\S+\s){3}\S+$"
    ),
     PasswordRule(
        description="Must contain at least one special character in the middle (not first or last word)",
        regex=r"^[^\s]+ [^\s]*[!@#$%^&*(),.?\":{}|<>][^\s]* [^\s]+ [^\s]+$"
    ),
    PasswordRule(
        description="No word may start with a digit",
        regex=r"^(?!\d)(?:\S+ )(?!\d)(?:\S+ )(?!\d)(?:\S+ )(?!\d)\S+$"
    ),
    PasswordRule(
        description="Total length must be at least 15 characters",
        regex=r"^.{15,}$"
    ),
    PasswordRule(
        description="Must contain at least one special character and one digit",
        regex=r"^(?=.*[!@#$%^&*(),.?\":{}|<>])(?=.*\d).+$"
    ),
]

def generate_build_a_password_day() -> Result [PasswordDay, str]:
    return _generate_question_set(Difficulty.EASY).map(
        lambda easy: _generate_question_set(Difficulty.MEDIUM).and_then(
            lambda medium: _generate_question_set(Difficulty.HARD).and_then(
                lambda hard: PasswordDay(
                    date=datetime.now().isoformat(),
                    questions=[easy, medium, hard]
                )
            )
        ) 
    )

def _generate_question_set(difficulty: Difficulty) -> Result[PasswordQuestion, str]:
    N_QUESTIONS = 5

    match difficulty:
        case Difficulty.EASY:
            return get_random_sample(EASY_REGEX_RULES, N_QUESTIONS).map(
                lambda easy: PasswordQuestion(
                    question="Build the password adhering to the rules (easy)",
                    rules=easy,
                    difficulty=Difficulty.EASY
                )
            )

        case Difficulty.MEDIUM:
            return get_random_sample(MEDIUM_REGEX_RULES, N_QUESTIONS).map(
                lambda medium: PasswordQuestion(
                    question="Build the password adhering to the rules (medium)",
                    rules=medium,
                    difficulty=Difficulty.MEDIUM
                )
            )

        case Difficulty.HARD:
            return get_random_sample(HARD_REGEX_RULES, N_QUESTIONS).map(
                lambda hard: PasswordQuestion(
                    question="Build the password adhering to the rules (hard)",
                    rules=hard,
                    difficulty=Difficulty.HARD
                )
            )
          
        
  
def test_password_rules(password: str, rules: List[PasswordRule]) -> None:
    print(f"Testing password: '{password}'\n")

    for rule in get_random_sample(rules, 3).unwrap():
        match = re.search(rule.regex, password)
        status = "PASS" if match else "FAIL"
        print(f"[{status}] {rule.description}")