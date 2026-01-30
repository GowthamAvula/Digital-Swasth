
from openai import OpenAI

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="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",
)

models = ["meta-llama/llama-3.2-3b-instruct:free", "google/gemini-2.0-flash-exp:free"]

for model in models:
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Hi"}],
            timeout=10
        )
        print(f"SUCCESS_{model}")
    except Exception as e:
        print(f"ERROR_{model}_{str(e)[:100]}")
