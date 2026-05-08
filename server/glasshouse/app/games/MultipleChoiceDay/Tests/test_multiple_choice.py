
from app.games.MultipleChoiceDay.question_reader import load_multiple_choice_questions
from app.games.MultipleChoiceDay.question_writer import write_questions_json


def test_multiple_choice() -> str:
  golden_path: str = r"C:\\Users\\justi\\Documents\\NewMediaLab\\GlassHouse\\New-Media-Lab\\server\\glasshouse\\app\\games\\MultipleChoiceDay\\Tests\\multiple_choice_golden.json"
  test_file_path: str = r"C:\\Users\\justi\\Documents\\NewMediaLab\\GlassHouse\\New-Media-Lab\\server\\glasshouse\\app\\games\\MultipleChoiceDay\\Tests\\multiple_choice_test.json"

  expected = load_multiple_choice_questions(golden_path)
  write_questions_json(expected, test_file_path)

  with open(golden_path, 'r') as f:
        golden_text = f.read().strip().replace(" ", "")
    
  with open(test_file_path, 'r') as f:
        test_text = f.read().strip().replace(" ", "")

  if golden_text == test_text:
        result = "✅ SUCCESS: Files are identical."
  else:
        result = "❌ FAILURE: Files differ."

  print(result)
  return result

   
