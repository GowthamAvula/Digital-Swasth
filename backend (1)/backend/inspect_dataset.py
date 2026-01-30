import kagglehub
import pandas as pd
import os

# Download the latest version
path = kagglehub.dataset_download("abhi8923shriv/sentiment-analysis-dataset")

print("Dataset downloaded to:", path)

# List files in the path
files = os.listdir(path)
print("Files in dataset:", files)

# Try to load one of the CSV files
csv_files = [f for f in files if f.endswith('.csv')]
if csv_files:
    # Use the first CSV file for inspection
    file_path = os.path.join(path, csv_files[0])
    df = pd.read_csv(file_path, encoding='latin-1')
    print("Columns:", df.columns.tolist())
    print("First 5 records:")
    print(df.head())
else:
    print("No CSV files found in the dataset.")
