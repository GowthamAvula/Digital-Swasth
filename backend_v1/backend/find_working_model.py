import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyABGQdPwo9Y9F-F30GZSePl-QliGd825-M"
genai.configure(api_key=GEMINI_API_KEY)

models_to_try = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro-latest'
]

for m_name in models_to_try:
    print(f"Testing {m_name}...")
    try:
        model = genai.GenerativeModel(m_name)
        response = model.generate_content("Hi")
        print(f"SUCCESS with {m_name}: {response.text}")
        break
    except Exception as e:
        print(f"FAILED {m_name}: {e}")
