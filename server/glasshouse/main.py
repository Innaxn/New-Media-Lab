from app.games.buildapassword import test_password_rules, EASY_REGEX_RULES

if __name__ == "__main__":
    passwords_to_test = [
        "Password123!",
        "password",
        "12345678",
        "PASSWORD!",
        "Pass!1"
    ]

    for pw in passwords_to_test:
        test_password_rules(pw, EASY_REGEX_RULES)
        print("\n" + "-"*40 + "\n")