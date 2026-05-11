import csv 
from pathlib import Path 
from typing import Any, Callable
from datetime import datetime
from app.games.Generator.pipeline import Pipeline
from app.games.Structs.question_types import QuestionType
from app.result import Result
from app.random import get_random_sample
from app.games.buildapassword import generate_build_a_password_day
from app.games.BuildAPassphrase import build_a_passhprase
from app.games.json_writer import write_questions_json
from app.games.write_to_google_drive import upload_to_drive
from app.games.LLM.llm_api import ask_llm, extract_response
from app.games.MultipleChoiceDay.question_reader import parse_multiple_choice_questions_from_string
from app.games.PhishOrLegitDay.PhishOrLegitJSONReader import parse_phish_or_legit_day_from_string
from app.games.SpotTheWeakestDay.SpotTheWeakestPasswordJSONReader import parse_weakest_password_from_string
from app.games.cookie_banner import CookieBannerDay

PATH: Path = Path(r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\CanBeGenerated.csv")

def generate_qotd() -> None: 
   pipeline = Pipeline(upload_to_drive, debug=False)
   _get_question_of_the_day_type().and_then(
      lambda t: handle_type(t, pipeline)
   )

def generate_qotd_debug(t) -> None:
    pipeline = Pipeline(upload_to_drive, debug=True)
    handle_type(t, pipeline)

def handle_type(t: QuestionType, pipeline: Pipeline) -> None:
        match t:
            case QuestionType.MultipleChoice:
                return _generate_multiple_choice(pipeline)
            case QuestionType.BuildAPassword:
                return _generate_build_a_password(pipeline)
            case QuestionType.CookieBanner:
                return _generate_cookie_banner(pipeline)
            case QuestionType.PhishOrLegit:
                return _generate_phish_or_legit(pipeline)
            case QuestionType.SpotTheWeakestPassword:
                return _generate_spot_the_weakest_password(pipeline)
            case QuestionType.BuildAPassphrase:
                return _generate_build_a_passphrase(pipeline)
            
           
def _generate_cookie_banner(pipeline: Pipeline) -> None:
    result: Result[str, str] = pipeline.store(
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

def _generate_build_a_passphrase(pipeline: Pipeline) -> None:
    result: Result[str, str] = (
        build_a_passhprase()
        .and_then(lambda game:
            pipeline.store(game, QuestionType.BuildAPassphrase)
        )
    )

    return report_generation(
        result,
        game_type=QuestionType.BuildAPassphrase,
        error_msg="Failed to generate build a password question"
    )
      
def _generate_build_a_password(pipeline: Pipeline) -> None:
    result: Result[str, str] = (
        generate_build_a_password_day()
        .and_then(lambda game:
            pipeline.store(game, QuestionType.BuildAPassword)
        )
    )

    return report_generation(
        result,
        game_type=QuestionType.BuildAPassword,
        error_msg="Failed to generate build a password question"
    )

def _generate_llm_question(pipeline: Pipeline, questionType: QuestionType, parse: Callable[[str], Any]) -> None:
   result: Result[str, str] = (
       _getPrompt(questionType)
       .and_then(ask_llm)
       .and_then(lambda response: parse(extract_response(response)))
       .and_then(lambda game: pipeline.store(game, questionType))
   )

   return report_generation(
       result,
       questionType,
       error_msg=f"Failed to generate {questionType.value} day"
   )


def _generate_spot_the_weakest_password(pipeline) -> None:
    return _generate_llm_question(pipeline, QuestionType.SpotTheWeakestPassword, parse_weakest_password_from_string)


def _generate_phish_or_legit(pipeline: Pipeline) -> None: 
    return _generate_llm_question(pipeline, QuestionType.PhishOrLegit, parse_phish_or_legit_day_from_string)

def _generate_multiple_choice(pipeline: Pipeline) -> None:
    return _generate_llm_question(pipeline, QuestionType.MultipleChoice, parse_multiple_choice_questions_from_string)

def report_generation(
    result: Result[Any, str],
    game_type: QuestionType,
    error_msg: str
) -> None: 
    return (
        result
        .tap(lambda res: print(f"Successfully generated {game_type}: {res}"))
        .tap_err(lambda err: print(f"Error during generation: {err}"))
        .expect(error_msg)
    )

def _getPrompt(questionType: QuestionType) -> Result[str, str]: 
    try:
        with open(_build_prompt_path(questionType), "r", encoding="utf-8") as f:
            return Result.Ok(f.read())
    except Exception as ex: 
       return Result.Err(ex.__str__())

def _build_prompt_path(questionType: QuestionType) -> str:
    return rf"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\LLM\{questionType.value}_prompt.txt"

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
