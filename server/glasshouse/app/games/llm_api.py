import requests
import os

BASE_URL = "https://chat.science.ru.nl/api/chat/completions"
MODEL = "gemma4:31b"

def ask_llm(prompt: str):
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
      "stream": False # one answer
    }
    
    response = requests.post(BASE_URL, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        return f"Error {response.status_code}: {response.text}"