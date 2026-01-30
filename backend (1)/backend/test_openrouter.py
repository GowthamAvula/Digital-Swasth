
from openai import OpenAI
import os

OPENROUTER_API_KEY = "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"
client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=OPENROUTER_API_KEY,
)
MODEL_NAME = "meta-llama/llama-3.2-3b-instruct:free"

print(f"Testing OpenRouter connectivity to model: {MODEL_NAME}...")

try:
    completion = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "user", "content": "Hello! Reply with 'Connection Successful' if you can hear me."}
        ]
    )
    print("Success!")
    print(f"Response: {completion.choices[0].message.content}")
except Exception as e:
    print(f"FAILED: {e}")
