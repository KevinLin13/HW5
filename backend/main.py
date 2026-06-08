import json
import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from ai_engine import ask_ai
from quiz_data import QUIZ_QUESTIONS

app = FastAPI(
    title="Machine Learning Algorithms Learning Platform API",
    description="Backend service serving course material and AI Q&A capabilities."
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Next.js frontend is on port 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = r"d:\AI人工智慧\HW5\extracted_data.json"

def get_extracted_data():
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=500, detail="Data file not found on server.")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Request/Response Models
class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: Optional[List[ChatMessage]] = None
    message: Optional[str] = None
    apiKey: Optional[str] = None
    apiType: str = "gemini" # gemini, openai, or anthropic
    model: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class QuizAnswer(BaseModel):
    questionId: str
    selectedOption: str

class QuizSubmitRequest(BaseModel):
    answers: List[QuizAnswer]

class QuizGradingResult(BaseModel):
    questionId: str
    selectedOption: str
    correctOption: str
    isCorrect: bool
    explanation: str

class QuizGradingResponse(BaseModel):
    score: int
    totalQuestions: int
    percentage: float
    results: List[QuizGradingResult]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ML Algorithms API is running!"}

@app.get("/api/overview")
def get_overview():
    data = get_extracted_data()
    return {
        "title": data.get("title", ""),
        "subtitle": data.get("subtitle", ""),
        "introduction": data.get("introduction", ""),
        "framework": data.get("framework", ""),
        "comparison": data.get("comparison", ""),
        "cases": data.get("cases", ""),
        "learning_path": data.get("learning_path", ""),
        "conclusion": data.get("conclusion", ""),
        "glossary": data.get("glossary", ""),
        "checklist": data.get("checklist", "")
    }

@app.get("/api/algorithms")
def get_algorithms():
    data = get_extracted_data()
    # Return minimal list information
    algos = []
    for a in data.get("algorithms", []):
        algos.append({
            "id": a["id"],
            "name": a["name"],
            "englishName": a["englishName"],
            "image": a["image"],
            "table": a["table"]
        })
    return algos

@app.get("/api/algorithms/{algo_id}")
def get_algorithm(algo_id: str):
    data = get_extracted_data()
    for a in data.get("algorithms", []):
        if a["id"] == algo_id:
            return a
    raise HTTPException(status_code=404, detail=f"Algorithm with ID {algo_id} not found.")

@app.get("/api/quiz")
def get_quiz(algo_id: Optional[str] = None):
    # If algo_id is specified, return questions for that algorithm (or 'general')
    if algo_id:
        filtered = [q for q in QUIZ_QUESTIONS if q["algorithmId"] == algo_id]
        return filtered
    return QUIZ_QUESTIONS

@app.post("/api/quiz/submit", response_model=QuizGradingResponse)
def submit_quiz(submission: QuizSubmitRequest):
    results = []
    correct_count = 0
    
    # Create quick mapping of questions
    questions_map = {q["id"]: q for q in QUIZ_QUESTIONS}
    
    for ans in submission.answers:
        q_id = ans.questionId
        selected = ans.selectedOption
        
        if q_id not in questions_map:
            raise HTTPException(status_code=400, detail=f"Invalid question ID {q_id}")
            
        q = questions_map[q_id]
        correct = q["answer"]
        is_correct = (selected == correct)
        
        if is_correct:
            correct_count += 1
            
        results.append(QuizGradingResult(
            questionId=q_id,
            selectedOption=selected,
            correctOption=correct,
            isCorrect=is_correct,
            explanation=q["explanation"]
        ))
        
    total = len(QUIZ_QUESTIONS)
    percentage = round((correct_count / total) * 100, 1) if total > 0 else 0.0
    
    return QuizGradingResponse(
        score=correct_count,
        totalQuestions=total,
        percentage=percentage,
        results=results
    )

@app.post("/api/chat", response_model=ChatResponse)
def chat_assistant(request: ChatRequest):
    chat_messages = []
    if request.messages:
        chat_messages = [m.dict() for m in request.messages]
    elif request.message:
        chat_messages = [{"role": "user", "content": request.message}]
        
    if not chat_messages:
        raise HTTPException(status_code=400, detail="Either 'message' or 'messages' must be provided.")
        
    reply = ask_ai(
        messages=chat_messages,
        api_key=request.apiKey,
        api_type=request.apiType,
        model=request.model
    )
    return ChatResponse(reply=reply)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
