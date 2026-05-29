#!/usr/bin/env python3
"""
Script to prompt Google Gemini API using GMINI_API_KEY from environment
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def main():
    # Get API key from environment
    api_key = os.getenv('GMINI_API_KEY')
    
    if not api_key:
        print("Error: GMINI_API_KEY not found in environment variables")
        print("Please set GMINI_API_KEY in your .env file or environment")
        sys.exit(1)
    
    try:
        import google.generativeai as genai
    except ImportError:
        print("Error: google-generativeai package not installed")
        print("Please install it with: pip install google-generativeai")
        sys.exit(1)
    
    # Configure the API
    genai.configure(api_key=api_key)
    
    # Create model instance
    model = genai.GenerativeModel('gemini-pro')
    
    print("Gemini API initialized successfully!")
    print("\nEnter your prompt (type 'exit' to quit):\n")
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if user_input.lower() == 'exit':
                print("Goodbye!")
                break
            
            if not user_input:
                continue
            
            # Send prompt to Gemini
            response = model.generate_content(user_input)
            print(f"\nGemini: {response.text}\n")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
