
import google.generativeai as genai

keys = [
    "AIzaSyAS0sPJXXalxiGQe3dVAt8tKBaTUky-4-s",
    "AIzaSyDcIs-shFjkTQfF7DitEgT0Am6skevHo1k"
]

for key in keys:
    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        res = model.generate_content("Hi")
        print(f"KEY_WORKS_{key[:10]}_{res.text[:20]}")
    except Exception as e:
        print(f"KEY_FAIL_{key[:10]}_{str(e)[:50]}")
