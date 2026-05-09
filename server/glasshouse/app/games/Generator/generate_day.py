import csv 
from pathlib import Path 
from typing import Any
from datetime import datetime
from app.games.Structs.question_types import QuestionType
from app.result import Result
from app.random import get_random_sample
from app.games.buildapassword import generate_build_a_password_day, PasswordDay
from app.games.json_writer import write_questions_json
from app.games.write_to_google_drive import upload_to_drive
from app.games.LLM.llm_api import ask_llm
from app.games.MultipleChoiceDay.question_reader import parse_multiple_choice_questions_from_string
from app.games.cookie_banner import CookieBannerDay

PATH: Path = Path(r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\CanBeGenerated.csv")
STORE_FOLDER: str = r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\SevenGames"

def generate_qotd() -> None: 
   _get_question_of_the_day_type().and_then(
      lambda t: handle_type(t)
   )

def handle_type(t: QuestionType) -> Result[str, str]:
        match t:
            case QuestionType.MultipleChoice:
                return _generate_multiple_choice()
            case QuestionType.BuildAPassword:
                return _generate_build_a_password()
            case QuestionType.CookieBanner:
                return _generate_cookie_banner()
           
def _generate_cookie_banner() -> None:
    result: Result[str, str] = store_and_upload(
        CookieBannerDay(
            date=datetime.now().date().isoformat(),
        ),
        QuestionType.CookieBanner
    )
    return report_generation(
        result,
        game_type=QuestionType.CookieBanner,
        error_msg="Failed to generate cookie banner game"
    )
      
def _generate_build_a_password() -> None:
    result: Result[str, str] = (
        generate_build_a_password_day()
        .and_then(lambda game:
            store_and_upload(game, QuestionType.BuildAPassword)
        )
    )

    return report_generation(
        result,
        game_type=QuestionType.BuildAPassword,
        error_msg="Failed to generate build a password question"
    )
   

def _generate_multiple_choice() -> None:
    result: Result[str, str] = (
        _getPrompt(QuestionType.MultipleChoice)
        .and_then(ask_llm)
        .and_then(lambda response:
            parse_multiple_choice_questions_from_string(
                response["choices"][0]["message"]["content"]
            )
        )
        .and_then(lambda game:
            store_and_upload(game, QuestionType.MultipleChoice)
        )
    )

    return report_generation(
        result,
        game_type=QuestionType.MultipleChoice,
        error_msg="Failed to generate multiple choice question"
    )

def report_generation(
    result: Result[Any, str],
    *,
    game_type: QuestionType,
    error_msg: str
) -> None: 
    return (
        result
        .tap(lambda res: print(f"Successfully generated {game_type}: {res}"))
        .tap_err(lambda err: print(f"Error during generation: {err}"))
        .expect(error_msg)
    )


def store_and_upload(game: Result[Any, Any], game_type: QuestionType):
    return write_questions_json(
        game, 
        f"{STORE_FOLDER}/{datetime.now().date().isoformat()}_{QuestionType.MultipleChoice.value}.json"
    ).and_then(upload_to_drive)

def _getPrompt(questionType: QuestionType) -> Result[str, str]: 
    try:
        path: str = r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\LLM\prompt.txt"
        with open(path, "r", encoding="utf-8") as f:
            return Result.Ok(f.read())
    except Exception as ex: 
       return Result.Err(ex.__str__())

def _get_question_of_the_day_type() -> Result[QuestionType, str]:
    options_result = _get_options()
    if not options_result.is_ok():
        return options_result
    xs = options_result.unwrap()
    if not xs:
        _reset()
        xs = _get_options().unwrap()
    
    sample_result = get_random_sample(xs, 1)
    if not sample_result.is_ok():
       return sample_result
    sample = sample_result.unwrap()[0]
    _write_generatable([x for x in xs if x != sample])

    return Result.Ok(QuestionType(sample))

def _get_options() -> Result[str, list[QuestionType]]:
   try: 
    with PATH.open("r", encoding="utf-8") as f:
        reader = csv.reader(f)
        return Result.Ok([
            QuestionType(row[0])
            for row in reader
            if row
        ])
   except Exception as ex:
      return Result.Err(ex.__str__())

def _write_generatable(data: list[QuestionType]) -> None:
   with PATH.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    for item in data:
        writer.writerow([item.value])

def _reset() -> None:
   with PATH.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    for item in QuestionType:
        writer.writerow([item.value])
