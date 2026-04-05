
from dataclasses import dataclass
from .difficulty import Difficulty
from typing import List
from enum import Enum
from app.random import get_random_sample
import re

class RuleType(Enum):
    REGEX = "regex"

@dataclass 
class PasswordRule:
    name: str 
    description: str 
    pattern: str 
    type: RuleType
    difficulty: Difficulty


def construct_regex_easy_password_rule(name: str, description: str, pattern: str) -> PasswordRule:
    return PasswordRule(
        name,
        description,
        pattern,
        type= RuleType.REGEX,
        difficulty= Difficulty.EASY
    ) 

EASY_REGEX_RULES = [
    construct_regex_easy_password_rule(
        name="min_length",
        description="At least 8 characters",
        pattern=r".{8,}"
    ),
    construct_regex_easy_password_rule(
        name="uppercase",
        description="At least one uppercase letter",
        pattern=r"[A-Z]"
    ),
    construct_regex_easy_password_rule(
        name="lowercase",
        description="At least one lowercase letter",
        pattern=r"[a-z]"
    ),
    construct_regex_easy_password_rule(
        name="digit",
        description="At least one number",
        pattern=r"\d"
    ),
    construct_regex_easy_password_rule(
        name="special_char",
        description="At least one special character",
        pattern=r"[!@#$%^&*(),.?\":{}|<>]"
    ),
    construct_regex_easy_password_rule(
        name="no__4_sequential_numbers",
        description="Must not contain sequential numbers (like 1234 or 5678)",
        pattern=r"^(?!.*0123)(?!.*1234)(?!.*2345)(?!.*3456)(?!.*4567)(?!.*5678)(?!.*6789).*$"
    ),
    construct_regex_easy_password_rule(
        name="no_repeated_chars",
        description="Must not have a character repeated 3 or more times in a row",
        pattern=r"^(?!.*(.)\1\1).*$"
    ),
    construct_regex_easy_password_rule(
        name="no_special_start_end",
        description="Do not put special characters at the beginning or end",
        pattern=r"^[A-Za-z0-9].*[A-Za-z0-9]$"
    )
]
  

def test_password_rules(password: str, rules: List[PasswordRule]) -> None:
    print(f"Testing password: '{password}'\n")
    for rule in (get_random_sample(rules, 3).unwrap()):
        if rule.type == RuleType.REGEX:
            match = re.search(rule.pattern, password)
            status = "PASS" if match else "FAIL"
            print(f"[{status}] {rule.name}: {rule.description}")
        else:
            print(f"[SKIP] {rule.name}: Unsupported rule type")