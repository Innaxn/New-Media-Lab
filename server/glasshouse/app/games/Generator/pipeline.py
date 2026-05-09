from app.games.Structs.question_types import QuestionType
from app.result import Result
from app.games.json_writer import write_questions_json
from datetime import datetime
from typing import Any, Callable, TypeVar

T = TypeVar("T")
E = TypeVar("E")

STORE_FOLDER: str = r"C:\Users\justi\Documents\NewMediaLab\GlassHouse\New-Media-Lab\server\glasshouse\app\games\Generator\SevenGames"


class Pipeline:
    def __init__(self, uploader: Callable[[T], Result[T, E]], debug: bool = False, store_folder: str = STORE_FOLDER):
        self.uploader = uploader
        self.debug = debug
        self.store_folder = store_folder

    def build_path(self, game_type: QuestionType) -> str:
        return f"{self.store_folder}/{datetime.now().date().isoformat()}_{game_type.value}.json"

    def store(self, game: Any, game_type: QuestionType):
        path = self.build_path(game_type)

        result = write_questions_json(game, path)

        if self.debug:
            return result.tap(lambda p: print(f"[DEBUG] saved at {p}"))

        return result.and_then(self.uploader)