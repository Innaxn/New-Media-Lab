import random
from typing import List, Any
from .result import Result


def get_random_sample(xs: List[Any], n: int) -> Result[str, List[Any]]:
    if n > len(xs): 
      return Result.Err(f"Requested amount {n} is greater the length of the list {len(xs)}")
    return Result.Ok(random.sample(xs, n))