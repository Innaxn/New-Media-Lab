import csv 
from pathlib import Path 
from datetime import datetime
from app.games.Structs.question_types import QuestionType
from app.result import Result
from app.random import get_random_sample
from app.games.buildapassword import generate_build_a_password_day, PasswordDay
from app.games.json_writer import write_questions_json
from app.games.write_to_google_drive import upload_to_drive
from app.games.LLM.llm_api import ask_llm
from app.games.MultipleChoiceDay.question_reader import parse_multiple_choice_questions_from_string

PATH: Path = Path(r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\CanBeGenerated.csv")
STORE_FOLDER: str = r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\SevenGames"

def generate_qotd() -> None: 
   t: Result[QuestionType, str] = _get_question_of_the_day_type()
   if not t.is_ok():
      print(f"Failed to generate question due to error: {t.unwrap_err()}")
      return
   t: QuestionType = t.unwrap()
   match t:
     case QuestionType.MultipleChoice:
       prompt = _getPrompt(QuestionType.MultipleChoice)
       response = ask_llm(prompt)
       json = parse_multiple_choice_questions_from_string(response["choices"][0]["message"]["content"])
       write_questions_json(json, f"{STORE_FOLDER}/{datetime.now().date().isoformat()}_{t.value}.json"
            ).and_then(lambda filepath: upload_to_drive(filepath)
         ).tap(lambda res: print(f"Game sucessfully generated: {res}")
         ).tap_err(lambda err: print(f"Error during genration: {err}"))
       return
      
     case QuestionType.BuildAPassword:
         return generate_build_a_password_day().and_then( 
            lambda passwordGame: write_questions_json(
              passwordGame, 
              f"{STORE_FOLDER}/{datetime.now().date().isoformat()}_{t.value}.json"
            )
           .and_then(lambda filepath: upload_to_drive(filepath))
         ).tap(lambda res: print(f"Game sucessfully generated: {res}")
         ).tap_err(lambda err: print(f"Error during genration: {err}"))

def _getPrompt(questionType: QuestionType) -> str: 
    path: str = r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\LLM\prompt.txt"
    with open(path, "r", encoding="utf-8") as f:
      return f.read()

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
