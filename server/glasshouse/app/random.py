import random
from typing import List, Any, Tuple
from enum import Enum
from result import Result

class RandomError(Enum):
   INPUT_GT_LENGTH_OF_LIST = "Given input is larger than the list"

def get_random_sample(xs: List[Any], n: int) -> Result[RandomError, List[Any]]:
    if n > len(xs): 
      return Result.Err(RandomError.INPUT_GT_LENGTH_OF_LIST)
    return Result.Ok(random.sample(xs, n))