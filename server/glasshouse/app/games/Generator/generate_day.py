import csv 
from pathlib import Path 
from datetime import datetime
from app.games.question_types import QuestionType
from app.result import Result
from app.random import get_random_sample
from app.games.buildapassword import generate_build_a_password_day, PasswordDay
from app.games.MultipleChoiceDay.question_writer import write_questions_json
from app.games.write_to_google_drive import upload_to_drive

PATH: Path = Path(r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\CanBeGenerated.csv")
STORE_FOLDER: str = r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\SevenGames"

def generate_qotd() -> None: 
   t: Result[QuestionType, str] = get_question_of_the_day_type()
   if not t.is_ok():
      print(f"Failed to generate question due to error: {t.unwrap_err()}")
      return
   t: QuestionType = t.unwrap()
   match t:
     case QuestionType.MultipleChoice:
       print("Multiple choice questions are not yet supported")
       return
     case QuestionType.BuildAPassword:
         res: Result[PasswordDay, str] = generate_build_a_password_day()
         if not res.is_ok():
            print(f"Failed to generate Build a Password due to error: {res.unwrap_err()}")
            return
         passwordGame: PasswordDay = res.unwrap()
         full_path: str = f"{STORE_FOLDER}/{datetime.now().date().isoformat()}_{t.value}.json"
         write_questions_json(passwordGame, full_path)
         upload_to_drive(full_path)         

def get_question_of_the_day_type() -> Result[QuestionType, str]:
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
