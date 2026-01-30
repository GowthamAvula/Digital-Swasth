from sentiment import analyze_sentiment
try:
    print("Testing sentiment...")
    res = analyze_sentiment("I am very happy")
    print(f"Result: {res}")
except Exception as e:
    print(f"Error: {e}")
