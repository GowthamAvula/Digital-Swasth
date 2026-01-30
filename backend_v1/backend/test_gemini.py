
import google.generativeai as genai
import os

GEMINI_API_KEY = "AIzaSyABGQdPwo9Y9F-F30GZSePl-QliGd825-M"
genai.configure(api_key=GEMINI_API_KEY)

print(f"Testing Gemini connectivity with key: {GEMINI_API_KEY[:10]}...")

try:
    print("Trying gemini-2.0-flash...")
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hello?")
    print("Success with gemini-2.0-flash!")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-2.0-flash: {e}")
