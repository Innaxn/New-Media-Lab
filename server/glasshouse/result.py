
from typing import Generic, TypeVar, Union 

T = TypeVar("T")
E = TypeVar("E")

class Result(Generic[T, E]):
    def __init__(self, value: Union[T, None] = None, error: Union[E, None] = None):
        self._value = value
        self._error = error

    @classmethod
    def Ok(cls, value: T) -> "Result[T, E]":
        return cls(value=value)

    @classmethod
    def Err(cls, error: E) -> "Result[T, E]":
        return cls(error=error)

    def is_ok(self) -> bool:
        return self._error is None

    def is_err(self) -> bool:
        return self._error is not None

    def unwrap(self) -> T:
        if self.is_ok():
            return self._value
        raise Exception(f"Called unwrap on Err: {self._error}")

    def unwrap_err(self) -> E:
        if self.is_err():
            return self._error
        raise Exception(f"Called unwrap_err on Ok: {self._value}")

    def __repr__(self):
        if self.is_ok():
            return f"Ok({self._value})"
        else:
            return f"Err({self._error})"