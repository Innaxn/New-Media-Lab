import os
import sys
from dotenv import load_dotenv

load_dotenv()

def main(prompt = "what's your name?"):
    api_key = os.getenv('GEMINI_CHAT_API_KEY') # ADD TO ENV
    
    if not api_key:
        print("Error: not found in environment variables")
        print("Please set GEMINI_CHAT_API_KEY in your .env file or environment")
        sys.exit(1)
    
    try:
        from google.genai import Client
    except ImportError:
        print("Error: google-genai package not installed")
        print("Please install it with: pip install google-genai")
        sys.exit(1)
    
    # Create client with API key
    client = Client(api_key=api_key)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
