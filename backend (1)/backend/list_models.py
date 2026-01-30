import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyABGQdPwo9Y9F-F30GZSePl-QliGd825-M"
genai.configure(api_key=GEMINI_API_KEY)

print("--- START MODEL LIST ---")
try:
    count = 0
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"MODEL: {m.name}")
            count += 1
            if count >= 30: break
except Exception as e:
    print(f"ERROR: {e}")
print("--- END MODEL LIST ---")
