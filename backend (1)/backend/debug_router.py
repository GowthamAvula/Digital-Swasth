
from openai import OpenAI
import time

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="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",
)

models = [
    "meta-llama/llama-3.2-3b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "mistralai/mistral-7b-instruct:free",
    "openchat/openchat-7b:free"
]

print("--- DEBUGGING OPENROUTER ---")
for model in models:
    try:
        print(f"Testing model: {model}...")
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Hi"}],
            timeout=10
        )
        print(f"SUCCESS: {completion.choices[0].message.content}")
        break
    except Exception as e:
        print(f"FAILED {model}: {e}")
print("--- DEBUGGING END ---")
