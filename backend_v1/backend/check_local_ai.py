
try:
    import torch
    from transformers import pipeline
    print("Imports successful")
    print(f"Torch version: {torch.__version__}")
except ImportError as e:
    print(f"Import failed: {e}")
