from dataclasses import dataclass
from typing import List
from datetime import date
from app.random import get_random_sample
from random import shuffle
from english_words import get_english_words_set
from app.result import Result

from app.games.Structs.difficulty import Difficulty
from app.games.Structs.question_types import QuestionType


@dataclass(kw_only=True)
class PassphraseQuestion:
    id: int
    difficulty: Difficulty
    word_bank: List[str]
    min_words: int
    separator: str
    success_message: str


@dataclass(kw_only=True)
class BuildPassphraseDay:
    date: date
    question_type: QuestionType
    questions: List[PassphraseQuestion]

WORD_POOL = None 

def get_word_pool() -> list[str]:
    global WORD_POOL
    if WORD_POOL is None:
        words = [
            w for w in get_english_words_set(["web2"], lower=True)
            if 4 <= len(w) <= 8 and w.isalpha()
        ]
        shuffle(words)
        WORD_POOL = words[:5000]
    return WORD_POOL

questions = [
        PassphraseQuestion(
            id=1,
            difficulty=Difficulty.EASY,
            word_bank=get_random_sample(get_word_pool(), 6).unwrap() + ["3", "!"],
            min_words=3,
            separator="-",
            success_message="A 3-word passphrase already beats most passwords. Length is everything."
        ),
        PassphraseQuestion(
            id=2,
            difficulty=Difficulty.MEDIUM,
            word_bank=get_random_sample(get_word_pool(), 10).unwrap() + ["3", "7", "!"],
            min_words=4,
            separator="-",
            success_message="A 4-word passphrase has ~52 bits of entropy. Centuries to crack."
        ),
        PassphraseQuestion(
            id=3,
            difficulty=Difficulty.HARD,
            word_bank=get_random_sample(get_word_pool(), 14).unwrap() + ["3", "7", "!", "#"],
            min_words=5,
            separator="-",
            success_message="A 5-word passphrase has billions of combinations. Use a password manager with this as the master key."
        ),
    ]

def build_a_passhprase() -> Result[str, BuildPassphraseDay]:
    return Result.Ok(BuildPassphraseDay(
        date=date.today(),
        question_type=QuestionType.BuildAPassphrase,
        questions=questions
    ))