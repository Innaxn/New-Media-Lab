import requests
import os
from app.result import Result
from typing import Any

BASE_URL = "https://chat.science.ru.nl/api/chat/completions"
MODEL = "gemma4:31b"

def ask_llm(prompt: str) -> Result[Any, str]:
    try: 
      CHAT_API_KEY = os.getenv("CHAT_API_KEY")
      headers = {
          'Authorization': f'Bearer {CHAT_API_KEY}',
          'Content-Type': 'application/json'
      }
      
      data = {
        "model": MODEL,
        "messages": [
          {
            "role": "user",
            "content": prompt
          }
        ],
        "stream": False
      }
      
      response = requests.post(BASE_URL, headers=headers, json=data)
      
      if response.status_code == 200:
          return Result.Ok(response.json())
      else:
          return Result.Err(f"The LMM responded with the following error {response.status_code}: {response.text}")
    except Exception as ex: 
      return Result.Err(ex.__str__())