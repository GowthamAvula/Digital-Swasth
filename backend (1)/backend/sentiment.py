from transformers import pipeline

# Initialize the sentiment analysis pipeline
# using a distilled BERT model fine-tuned for chemical/drug/medical sentiment? 
# No, sticking to general sentiment as requested, but distilbert-sst-2 is good start.
# We will lazily load it to avoid startup delay if possible, or load on global scope.

print("Loading Sentiment Analysis Model (DistilBERT)...")
sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
print("Model Loaded!")

def analyze_sentiment(text: str):
    """
    Analyzes the sentiment of the text.
    Returns a dict with label (POSITIVE/NEGATIVE) and score.
    """
    result = sentiment_analyzer(text)[0]
    return {
        "label": result['label'].upper(),
        "score": result['score']
    }
