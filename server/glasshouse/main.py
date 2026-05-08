from app.games.buildapassword import test_password_rules, EASY_REGEX_RULES, MEDIUM_REGEX_RULES, HARD_REGEX_RULES
from app.games.MultipleChoiceDay.question_reader import load_multiple_choice_questions
from app.games.MultipleChoiceDay.question_writer import write_questions_json
from app.games.MultipleChoiceDay.Tests.test_multiple_choice import test_multiple_choice
from app.games.write_to_google_drive import upload_to_drive
from dotenv import load_dotenv
from app.games.email import send_email
from app.llm_api import ask_llm

load_dotenv()

if __name__ == "__main__":

    # print(ask_llm("This is a test prompt please only respond with 'Hello'"))


    # Test Multiple choice    
    # golden_path: str = r"C:\\Users\\justi\\Documents\\NewMediaLab\\GlassHouse\\New-Media-Lab\\server\\glasshouse\\app\\games\\MultipleChoiceDay\\Tests\\multiple_choice_golden.json"
    # test_file_path: str = r"C:\\Users\\justi\\Documents\\NewMediaLab\\GlassHouse\\New-Media-Lab\\server\\glasshouse\\app\\games\\MultipleChoiceDay\\Tests\\multiple_choice_test.json"
    # qotd = load_multiple_choice_questions(golden_path)
    # write_questions_json(qotd, test_file_path)
    # upload_to_drive(test_file_path) 

    # Test the password 
   
    passwords_to_test = [
        "Password123!",
        "password",
        "12345678",
        "PASSWORD!",
        "Pass!1"
    ]

    for pw in passwords_to_test:
        test_password_rules(pw, (EASY_REGEX_RULES + MEDIUM_REGEX_RULES + HARD_REGEX_RULES))
        print("\n" + "-"*40 + "\n")