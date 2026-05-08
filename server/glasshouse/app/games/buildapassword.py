
from dataclasses import dataclass
from .difficulty import Difficulty
from typing import List
from enum import Enum
from app.random import get_random_sample
import re

@dataclass 
class PasswordRule:
  regex: str
  description: str
  

@dataclass 
class PasswordQuestion:
    question: str 
    rules: list[PasswordRule] 
    difficulty: Difficulty


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
    )
]

HARD_REGEX_RULES = [
    PasswordRule(
        description="Must be exactly 4 words",
        regex=r"^(?:\S+\s){3}\S+$"
    )
]
  
def test_password_rules(password: str, rules: List[PasswordRule]) -> None:
    print(f"Testing password: '{password}'\n")

    for rule in get_random_sample(rules, 5).unwrap():
        match = re.search(rule.regex, password)
        status = "PASS" if match else "FAIL"
        print(f"[{status}] {rule.description}")