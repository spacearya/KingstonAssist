"""
KingstonAI Partner Portal API - Progress tracking and license upload.
"""
import json
import os
import shutil
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from router import ask, discover_data_files, load_data, split_food_entries, split_place_entries, parse_food_entry, parse_place_entry, parse_event_entry

app = FastAPI(title="KingstonAI Partner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.txt"
UPLOADS_DIR = BASE_DIR / "uploads"

UPLOADS_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


class LoginBody(BaseModel):
    email: str
    password: str


class RegisterBody(BaseModel):
    username: str = ""
    email: str
    password: str
    businessName: str = ""
    businessType: str = ""
    businessDescription: str = ""
    contact: str = ""


class ChatRequest(BaseModel):
    question: str


def load_db():
    if not DB_PATH.exists():
        return {"users": []}
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_db(data):
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_user_by_email(email: str):
    data = load_db()
    for u in data.get("users", []):
        if u.get("email") == email:
            return u, data
    return None, data


def ensure_user(email: str, data: dict):
    users = data.get("users", [])
    for i, u in enumerate(users):
        if u.get("email") == email:
            return i, users
    users.append({
        "email": email,
        "password": "",
        "name": "",
        "progress": 1,
        "is_verified": False,
        "business_name": "",
        "business_description": "",
        "category": "",
        "address": "",
    })
    return len(users) - 1, users


@app.post("/api/register")
def register(body: RegisterBody):
    """
    Save a new partner application to database.txt.
    If email already exists, returns 409 Conflict. Otherwise creates user and returns 201.
    """
    data = load_db()
    email = (body.email or "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    for u in data.get("users", []):
        if u.get("email") == email:
            raise HTTPException(status_code=409, detail="Email already registered. Please log in.")
    users = data.get("users", [])
    users.append({
        "email": email,
        "password": body.password or "",
        "name": (body.username or "").strip() or email.split("@")[0],
        "progress": 1,
        "is_verified": False,
        "business_name": (body.businessName or "").strip(),
        "business_description": (body.businessDescription or "").strip(),
        "category": (body.businessType or "").strip(),
        "address": (body.contact or "").strip(),
    })
    data["users"] = users
    save_db(data)
    return {"email": email, "message": "Application saved. Please log in to track your status."}


@app.post("/api/login")
def login(body: LoginBody):
    """
    Authenticate by email and password. Returns 401 if credentials are invalid.
    On success returns user object: { email, business_name, name, progress }.
    """
    data = load_db()
    email = (body.email or "").strip()
    password = body.password or ""
    for u in data.get("users", []):
        if u.get("email") == email and u.get("password") == password:
            return {
                "email": u.get("email", ""),
                "business_name": u.get("business_name", ""),
                "name": u.get("name", "") or email.split("@")[0],
                "progress": u.get("progress", 1),
            }
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/api/user")
def get_user(email: str = Query(..., description="User email")):
    """Get current user progress and verification status."""
    user, _ = get_user_by_email(email)
    if not user:
        return {"email": email, "progress": 1, "is_verified": False}
    return user


@app.patch("/api/user/progress")
def update_progress(email: str = Query(..., description="User email")):
    """
    Increment the user's progress step (1-7). Step 7 is completed when license is uploaded.
    """
    user, data = get_user_by_email(email)
    if not user:
        i, users = ensure_user(email, data)
        user = users[i]
    else:
        users = data.get("users", [])
        i = next(idx for idx, u in enumerate(users) if u.get("email") == email)

    current = user.get("progress", 1)
    if current >= 7:
        return {"email": email, "progress": 7, "is_verified": user.get("is_verified", False)}
    users[i]["progress"] = current + 1
    data["users"] = users
    save_db(data)
    return {"email": email, "progress": users[i]["progress"], "is_verified": user.get("is_verified", False)}


@app.get("/api/businesses")
def list_businesses(category: str | None = Query(None, description="Optional category filter")):
    """Return only verified businesses for public Explore page."""
    data = load_db()
    verified = [
        {
            "id": u.get("email", "").replace("@", "_").replace(".", "_"),
            "name": u.get("business_name") or "Unnamed",
            "description": u.get("business_description") or "",
            "category": u.get("category") or "Other",
            "address": u.get("address") or "",
            "sustainability": "",
            "live": False,
        }
        for u in data.get("users", [])
        if u.get("is_verified") is True
    ]
    if category:
        verified = [b for b in verified if b["category"].lower() == category.lower()]
    return {"businesses": verified}


@app.post("/api/upload-license")
async def upload_license(
    file: UploadFile = File(...),
    email: str = Form(...),
):
    """
    Upload license document (PDF or image). Saves as uploads/license_{email_safe}.{ext}
    and sets is_verified=True for that user.
    """
    suffix = Path(file.filename or "file").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

    safe_email = email.strip().replace("@", "_").replace(".", "_")
    dest_name = f"license_{safe_email}{suffix}"
    dest_path = UPLOADS_DIR / dest_name

    try:
        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(500, f"Save failed: {e}")

    user, data = get_user_by_email(email)
    if not user:
        i, users = ensure_user(email, data)
        user = users[i]
    else:
        users = data.get("users", [])
        i = next(idx for idx, u in enumerate(users) if u.get("email") == email)

    users[i]["is_verified"] = True
    users[i]["progress"] = 7
    data["users"] = users
    save_db(data)

    return {
        "email": email,
        "progress": 7,
        "is_verified": True,
        "filename": dest_name,
    }


@app.post("/api/chat")
def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint that uses RAG to answer questions about Kingston.
    Uses the ask() function from router.py to generate responses.
    """
    try:
        question = request.question.strip()
        if not question:
            raise HTTPException(status_code=400, detail="Question cannot be empty")
        
        answer = ask(question)
        
        if answer is None:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate response. Please check backend logs."
            )
        
        return {"answer": answer, "question": question}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/discovery/categories")
def get_discovery_categories():
    """
    Get all available data file categories for the discovery page.
    Returns a list of categories with their file names and display names.
    """
    try:
        data_files = discover_data_files()
        categories = []
        
        # Food categories
        for file_path in data_files["food"]:
            file_name = file_path.stem
            display_name = file_name.replace("_", " ").title()
            categories.append({
                "id": file_name,
                "label": display_name,
                "type": "food",
                "file": file_path.name
            })
        
        # Places categories
        for file_path in data_files["places"]:
            file_name = file_path.stem
            display_name = file_name.replace("_", " ").title()
            categories.append({
                "id": file_name,
                "label": display_name,
                "type": "places",
                "file": file_path.name
            })
        
        # Events categories
        for file_path in data_files["events"]:
            file_name = file_path.stem
            display_name = file_name.replace("_", " ").title()
            categories.append({
                "id": file_name,
                "label": display_name,
                "type": "events",
                "file": file_path.name
            })
        
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load categories: {str(e)}")


@app.get("/api/discovery/data")
def get_discovery_data(category_id: str = Query(..., description="Category ID (file name without extension)")):
    """
    Get all entries from a specific data file.
    Returns parsed entries ready for display.
    """
    try:
        data_files = discover_data_files()
        BASE_DIR = Path(__file__).resolve().parent
        
        # Find the file
        found_file = None
        file_type = None
        
        for file_path in data_files["food"]:
            if file_path.stem == category_id:
                found_file = file_path
                file_type = "food"
                break
        
        if not found_file:
            for file_path in data_files["places"]:
                if file_path.stem == category_id:
                    found_file = file_path
                    file_type = "places"
                    break
        
        if not found_file:
            for file_path in data_files["events"]:
                if file_path.stem == category_id:
                    found_file = file_path
                    file_type = "events"
                    break
        
        if not found_file:
            raise HTTPException(status_code=404, detail=f"Category '{category_id}' not found")
        
        # Load and parse the file
        content = load_data(found_file)
        if not content:
            return {"entries": []}
        
        entries = []
        
        if file_type == "food":
            entry_texts = split_food_entries(content)
            for entry_text in entry_texts:
                entry = parse_food_entry(entry_text)
                if entry.get("name"):
                    entries.append(entry)
        elif file_type == "places":
            entry_texts = split_place_entries(content)
            for entry_text in entry_texts:
                entry = parse_place_entry(entry_text)
                if entry.get("name"):
                    entries.append(entry)
        elif file_type == "events":
            lines = content.strip().split('\n')
            for line in lines:
                if line.strip() and '|' in line:
                    entry = parse_event_entry(line)
                    if entry and entry.get("name"):
                        entries.append(entry)
        
        return {"entries": entries, "category": category_id, "type": file_type}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load data: {str(e)}")


@app.get("/health")
def health():
    return {"status": "ok"}
