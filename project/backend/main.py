from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
import datetime
from contextlib import contextmanager

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
def init_db():
    with sqlite3.connect("chat.db") as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            sender TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

@contextmanager
def get_db():
    conn = sqlite3.connect("chat.db")
    try:
        yield conn
    finally:
        conn.close()

class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    response: str

# Initialize database on startup
init_db()

@app.post("/chat", response_model=MessageResponse)
async def chat(message: MessageRequest):
    # Save user message to database
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (content, sender) VALUES (?, ?)",
            (message.message, "user")
        )
        
        # Simulate agent response
        response = "Obrigado por sua mensagem! Nossa equipe irá analisar e responder em breve."
        
        # Save agent response to database
        cursor.execute(
            "INSERT INTO messages (content, sender) VALUES (?, ?)",
            (response, "agent")
        )
        
        conn.commit()
    
    return MessageResponse(response=response)

@app.get("/messages")
async def get_messages():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50")
        messages = cursor.fetchall()
        
    return {"messages": messages}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)