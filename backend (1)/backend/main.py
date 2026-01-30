from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mistral AI Configuration
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "rj29C7kzXRXOSxOUEjIyb8EnxyIysjG7")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_MODEL = "mistral-small-latest"

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://zcavktvmbhgapyiosafi.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_UtwtEriarz8S_E30pwblMg_KzgZyNc9")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"message": "Swasth AI Student Specialist Activated (Mistral Powered)"}

class ChatHistoryItem(BaseModel):
    role: str # 'user' or 'model'
    parts: List[str]

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatHistoryItem]] = []

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Mistral AI Chat Endpoint"""
    try:
        headers = {
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        
        messages = [
            {"role": "system", "content": "You are 'Swasth', a supportive, empathetic student wellness companion. \nIF the user provides gibberish or invalid input, politely ask them to clarify how they are feeling instead of suggesting exercises. \nIF the user expresses self-harm or suicidal thoughts, IMMEDIATELY provide the following Indian student helplines: T-MANAS: 14416 (24/7), Kiran Helpline: 1800-599-0019. Keep responses brief (1-3 sentences)."}
        ]
        
        if request.history:
            for item in request.history:
                # Mistral uses 'assistant' not 'model'
                role = "assistant" if item.role == "model" else item.role
                messages.append({"role": role, "content": " ".join(item.parts)})
        
        messages.append({"role": "user", "content": request.message})
        
        payload = {
            "model": MISTRAL_MODEL,
            "messages": messages,
            "max_tokens": 200
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(MISTRAL_URL, json=payload, headers=headers, timeout=15.0)
            result = response.json()
            response_text = result['choices'][0]['message']['content']
        
        return {
            "response": response_text,
            "status": "success"
        }
    except Exception as e:
        print(f"Chat Error: {e}")
        return {
            "response": "I'm having a little trouble connecting. How about we focus on your mood journal for a moment?",
            "status": "error"
        }

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    password: Optional[str] = None

@app.post("/profile/update")
async def update_profile(update: ProfileUpdate, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")
    
    # Use the Anon Key (Public) for the API Key header, but the User's Token for Authorization
    # We use the key from the frontend for consistency if available, or just use the one configured here
    # assuming this backend key has appropriate permissions (or we just use the user's token).
    # Use the User's Token for Authorization
    # The ANON_KEY is now pulled from environment variables for consistency
    ANON_KEY = SUPABASE_KEY 
    
    headers = {
        "apikey": ANON_KEY,
        "Authorization": authorization,
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/auth/v1/user"
    
    payload = {"data": {}}
    if update.name:
        payload["data"]["name"] = update.name
    if update.password:
        payload["password"] = update.password

    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        print(f"Proxy Error: {e.response.text}")
        raise HTTPException(status_code=e.response.status_code, detail="Failed to update profile via backend")
    except Exception as e:
        print(f"Proxy Exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class MoodEntry(BaseModel):
    mood: str
    note: str
    timestamp: str
    user_id: str

@app.post("/moods")
async def log_mood(entry: MoodEntry, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")
    
    ANON_KEY = SUPABASE_KEY
    headers = {
        "apikey": ANON_KEY,
        "Authorization": authorization,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/moods"
    data = {
        "mood": entry.mood,
        "note": entry.note,
        "timestamp": entry.timestamp,
        "user_id": entry.user_id
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            return {"message": "Mood logged successfully"}
    except Exception as e:
        print(f"Mood Log Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to log mood")

@app.get("/moods")
async def get_moods(user_id: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Token")
    
    ANON_KEY = SUPABASE_KEY
    headers = {
        "apikey": ANON_KEY,
        "Authorization": authorization
    }
    
    url = f"{SUPABASE_URL}/rest/v1/moods?user_id=eq.{user_id}&select=mood,note,timestamp&order=timestamp.asc"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Mood Get Error: {e}")
        return []

@app.get("/moods/reflections")
async def get_mood_reflections(user_id: str, authorization: str = Header(None)):
    """Provides wellness reflections using Mistral AI."""
    try:
        if not authorization:
             return {"reflection": "Log in to unlock AI insights."}

        ANON_KEY = "sb_publishable_UtwtEriarz8S_E30pwblMg_KzgZyNc9"
        headers_supa = { "apikey": ANON_KEY, "Authorization": authorization }
        url_supa = f"{SUPABASE_URL}/rest/v1/moods?user_id=eq.{user_id}&select=mood,note,timestamp&order=timestamp.desc&limit=5"

        async with httpx.AsyncClient() as client:
            resp_supa = await client.get(url_supa, headers=headers_supa)
            resp_supa.raise_for_status()
            entries = resp_supa.json()
        
        if not entries:
            return {"reflection": "No entries yet. Share your journey to unlock AI-powered insights."}
        
        notes_text = "\n".join([f"Mood {e['mood']}: {e['note']}" for e in entries if e.get('note') and e['note'].strip()])
        if not notes_text:
            return {"reflection": "You've been tracking your mood! Try adding more detailed notes for deeper reflections."}
            
        # Call Mistral AI directly via HTTP
        headers = {
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": MISTRAL_MODEL,
            "messages": [
                {"role": "system", "content": "You are 'Swasth', a supportive, empathetic student wellness coach. Provide a brief 2-sentence 'Mindful Reflection' based on the student's mood entries."},
                {"role": "user", "content": f"Here are my recent journal entries:\n{notes_text}"}
            ],
            "max_tokens": 100
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(MISTRAL_URL, json=payload, headers=headers, timeout=10.0)
            result = response.json()
            reflection = result['choices'][0]['message']['content']
        
        return {"reflection": reflection}
    except Exception as e:
        print(f"Mistral Reflection Error: {e}")
        return {"reflection": "I'm processing your progress... Your resilience is your strength."}

class NoteEntry(BaseModel):
    message: str
    color: str
    rotation: int

@app.post("/encouragement")
def post_encouragement(entry: NoteEntry):
    data = {
        "message": entry.message,
        "color": entry.color,
        "rotation": entry.rotation
    }
    supabase.table("encouragement_notes").insert(data).execute()
    return {"message": "Message posted successfully"}

@app.get("/encouragement")
def get_encouragement():
    response = supabase.table("encouragement_notes") \
                       .select("*") \
                       .order("created_at", desc=True) \
                       .limit(50) \
                       .execute()
    return response.data

@app.get("/progress")
def get_user_progress(user_id: str):
    try:
        moods = supabase.table("moods").select("id").eq("user_id", user_id).execute()
        notes = supabase.table("encouragement_notes").select("id").execute()
        
        mood_xp = len(moods.data) * 20
        comm_xp = len(notes.data) * 10
        total_xp = mood_xp + comm_xp
        level = (total_xp // 100) + 1
        xp_next = 100 - (total_xp % 100)
        
        badges = []
        if len(moods.data) >= 1: badges.append({"id": "pioneer", "name": "First Step", "icon": "🌱"})
        if len(moods.data) >= 5: badges.append({"id": "constant", "name": "Deep Reflector", "icon": "💎"})
        if len(notes.data) >= 3: badges.append({"id": "kind", "name": "Positivity Beacon", "icon": "🌟"})
        if level >= 2: badges.append({"id": "level2", "name": "Rising Star", "icon": "🚀"})
        
        return {
            "xp": total_xp,
            "level": level,
            "xp_next": xp_next,
            "badges": badges
        }
    except Exception as e:
        print(f"Progress Error: {e}")
        return {"xp": 0, "level": 1, "xp_next": 100, "badges": []}
