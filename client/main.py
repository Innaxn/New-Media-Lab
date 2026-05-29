#!/usr/bin/env python3
"""
Script to prompt Google Gemini API using GMINI_API_KEY from environment
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def main(prompt = "what's your name?"):
    # Get API key from environment
    api_key = os.getenv('GMINI_API_KEY')
    
    if not api_key:
        print("Error: GMINI_API_KEY not found in environment variables")
        print("Please set GMINI_API_KEY in your .env file or environment")
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
