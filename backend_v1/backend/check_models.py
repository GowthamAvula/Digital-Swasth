
import google.generativeai as genai
import time

GEMINI_API_KEY = "AIzaSyAS0sPJXXalxiGQe3dVAt8tKBaTUky-4-s"
genai.configure(api_key=GEMINI_API_KEY)

try:
    print("MODELS_START")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
    print("MODELS_END")
except Exception as e:
    print(f"ERROR: {e}")
