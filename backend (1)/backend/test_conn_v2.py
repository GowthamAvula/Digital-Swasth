from supabase import create_client
import os

url = "https://bnpqocjasnkdwixcsfhu.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHFvY2phc25rZHdpeGNzZmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjMyMDAsImV4cCI6MjA4NDgzOTIwMH0.4lTSi-3j-hZkbdCOaIqCnvrpHgwxucu0z0e9afnmjBs"

print(f"Testing connection to {url}...")
try:
    supabase = create_client(url, key)
    # Just check a public table
    response = supabase.table("moods").select("count", count="exact").execute()
    print("Connection SUCCESS!")
    print(f"Data: {response}")
except Exception as e:
    print("Connection FAILED")
    print(e)
