from enum import Enum 

class QuestionType(Enum):
    MultipleChoice = "multiple_choice"
    BuildAPassword = "build_a_password"
    CookieBanner   = "cookie_banners"
    PhishOrLegit   = "phish_or_legit"