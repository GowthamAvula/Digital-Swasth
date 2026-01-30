
import google.generativeai as genai
import os

keys = [
    "AIzaSyAS0sPJXXalxiGQe3dVAt8tKBaTUky-4-s",
    "AIzaSyDcIs-shFjkTQfF7DitEgT0Am6skevHo1k"
]

print("Testing direct Google Gemini connection...")

for key in keys:
    print(f"\nTesting key: {key[:10]}...")
    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Ping")
        print(f"SUCCESS with {key[:10]}! Response: {response.text}")
    except Exception as e:
        print(f"FAILED with {key[:10]}: {e}")
