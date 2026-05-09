from app.games.buildapassword import test_password_rules, generate_build_a_password_day
from app.games.MultipleChoiceDay.question_reader import load_multiple_choice_questions
from app.games.json_writer import write_questions_json, dump
from app.games.MultipleChoiceDay.Tests.test_multiple_choice import test_multiple_choice
from app.games.write_to_google_drive import upload_to_drive
from dotenv import load_dotenv
from app.games.email import send_email
from app.games.LLM.llm_api import ask_llm
from app.games.Generator.generate_day import generate_qotd, generate_qotd_debug
from app.games.Structs.question_types import QuestionType
import json 
from dataclasses import asdict

load_dotenv()

if __name__ == "__main__":

    generate_qotd_debug(QuestionType.BuildAPassword)
    generate_qotd_debug(QuestionType.CookieBanner)
    generate_qotd_debug(QuestionType.MultipleChoice)

    # generate_build_a_password_day().and_then(lambda x: dump(x))

    # print(ask_llm("This is a test prompt please only respond with 'Hello'"))


    # Test Multiple choice    
    # golden_path: str = r"C:\\Users\\justi\\Documents\\NewMediaLab\\GlassHouse\\New-Media-Lab\\server\\glasshouse\\app\\games\\MultipleChoiceDay\\Tests\\multiple_choice_golden.json"
    # test_file_path: str = r"C:\\Users\\justi\\Documents\\NewMediaLab\\GlassHouse\\New-Media-Lab\\server\\glasshouse\\app\\games\\MultipleChoiceDay\\Tests\\multiple_choice_test.json"
    # qotd = load_multiple_choice_questions(golden_path)
    # write_questions_json(qotd, test_file_path)
    # upload_to_drive(test_file_path) 

    # Test the password 
   
    # passwords_to_test = [
    #     "Password123!",
    #     "password",
    #     "1234@5678",
    #     "P@SS WORD",
    #     "Pass!1"
    # ]

    # for pw in passwords_to_test:
    #     test_password_rules(pw, MEDIUM_REGEX_RULES)
    #     print("\n" + "-"*40 + "\n")