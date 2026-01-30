import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyABGQdPwo9Y9F-F30GZSePl-QliGd825-M"
genai.configure(api_key=GEMINI_API_KEY)

model_name = 'gemini-2.0-flash-exp'
print(f"Testing {model_name}...")

try:
    model = genai.GenerativeModel(model_name)
    response = model.generate_content("Hello?")
    print("SUCCESS!")
    print(response.text)
except Exception as e:
    print(f"FAILED: {e}")
