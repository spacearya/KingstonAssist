"""
KingstonAI Partner Portal API - Dual-database: applications.txt (business) + database.txt (auth).
"""
import hashlib
import json
import shutil
from pathlib import Path

from fastapi import Body, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from router import ask, discover_data_files, load_data, split_food_entries, split_place_entries, parse_food_entry, parse_place_entry, parse_event_entry

app = FastAPI(title="AnangAI Partner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.txt"
APP_PATH = BASE_DIR / "applications.txt"
UPLOADS_DIR = BASE_DIR / "uploads"
PASSWORD_SALT = "anang_ai_partner_2024"

UPLOADS_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}


def hash_password(password: str) -> str:
    return hashlib.sha256((PASSWORD_SALT + (password or "")).encode()).hexdigest()


def verify_password(password: str, stored: str) -> bool:
    if not stored:
        return False
    if len(stored) == 64 and all(c in "0123456789abcdef" for c in stored.lower()):
        return hash_password(password) == stored
    return (password or "") == stored


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


def load_applications():
    if not APP_PATH.exists():
        return {"applications": []}
    with open(APP_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_applications(data):
    with open(APP_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_application_by_email(email: str):
    data = load_applications()
    email_lower = (email or "").strip().lower()
    for a in data.get("applications", []):
        if (a.get("email") or "").strip().lower() == email_lower:
            return a, data
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


@app.post("/api/submit-application")
async def submit_application(
    email: str = Form(...),
    businessName: str = Form(""),
    businessType: str = Form(""),
    businessDescription: str = Form(""),
    contact: str = Form(""),
    license_file: UploadFile = File(None),
):
    """
    Guest submission: business details + optional license file. Saves ONLY to applications.txt.
    No password. Use /api/finalize-account later to create auth account.
    """
    email = (email or "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    apps_data = load_applications()
    for a in apps_data.get("applications", []):
        if a.get("email") == email:
            raise HTTPException(status_code=409, detail="Application already submitted for this email. Create your password on the success page.")
    license_url = ""
    safe_email = email.replace("@", "_").replace(".", "_")
    if license_file and license_file.filename:
        suffix = Path(license_file.filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"License file: allowed types {', '.join(ALLOWED_EXTENSIONS)}")
        dest_name = f"license_{safe_email}{suffix}"
        dest_path = UPLOADS_DIR / dest_name
        try:
            with open(dest_path, "wb") as f:
                shutil.copyfileobj(license_file.file, f)
        except Exception as e:
            raise HTTPException(500, f"Save failed: {e}")
        license_url = dest_name
    apps = apps_data.get("applications", [])
    apps.append({
        "email": email,
        "biz_name": (businessName or "").strip(),
        "biz_cat": (businessType or "").strip(),
        "biz_desc": (businessDescription or "").strip(),
        "contact": (contact or "").strip(),
        "license_url": license_url,
        "status": "pending",
    })
    apps_data["applications"] = apps
    save_applications(apps_data)
    return {"email": email, "message": "Application received. Create your password on the next page to track your roadmap."}


@app.post("/api/finalize-account")
def finalize_account(body: LoginBody):
    """
    Create auth account: email + password. Email must exist in applications.txt.
    Saves to database.txt with hashed_password, role=partner, is_verified=false.
    Email is stored and matched lowercase.
    """
    email = (body.email or "").strip().lower()
    password = body.password or ""
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    app_record, _ = get_application_by_email(email)
    if not app_record:
        raise HTTPException(status_code=400, detail="Please submit your business details first.")
    data = load_db()
    for u in data.get("users", []):
        if (u.get("email") or "").strip().lower() == email:
            raise HTTPException(status_code=409, detail="Account already exists. Please log in.")
    users = data.get("users", [])
    users.append({
        "email": email,
        "hashed_password": hash_password(password),
        "role": "partner",
        "is_verified": False,
        "progress": 1,
        "name": email.split("@")[0],
    })
    data["users"] = users
    save_db(data)
    return {
        "email": email,
        "business_name": app_record.get("biz_name", ""),
        "name": email.split("@")[0],
        "progress": 1,
        "status": "approved",
        "is_verified": False,
    }


@app.get("/api/dashboard-data/{email}")
def dashboard_data(email: str):
    """
    JOIN database.txt (auth) + applications.txt (business). Returns merged object.
    """
    email = email.strip()
    user, _ = get_user_by_email(email)
    app_record, _ = get_application_by_email(email)
    auth = {
        "email": email,
        "progress": 1,
        "is_verified": False,
        "status": "approved",
    }
    if user:
        auth["progress"] = user.get("progress", 1)
        auth["is_verified"] = user.get("is_verified", False)
        auth["status"] = user.get("status") or ("approved" if user.get("is_verified") else "pending_review")
    business = {
        "biz_name": "",
        "biz_cat": "",
        "biz_desc": "",
        "license_url": "",
        "status": "pending",
    }
    if app_record:
        business["biz_name"] = app_record.get("biz_name", "")
        business["biz_cat"] = app_record.get("biz_cat", "")
        business["biz_desc"] = app_record.get("biz_desc", "")
        business["license_url"] = app_record.get("license_url", "")
        business["status"] = app_record.get("status", "pending")
    return {"auth": auth, "business": business}


@app.post("/api/register")
async def register(
    username: str = Form(""),
    email: str = Form(...),
    password: str = Form(""),
    businessName: str = Form(""),
    businessType: str = Form(""),
    businessDescription: str = Form(""),
    contact: str = Form(""),
    drivers_license: UploadFile = File(None),
):
    """
    Legacy: full partner application (kept for backward compat). Prefer submit-application + finalize-account.
    """
    data = load_db()
    email = (email or "").strip()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    for u in data.get("users", []):
        if u.get("email") == email:
            raise HTTPException(status_code=409, detail="Email already registered. Please log in.")
    safe_email = email.replace("@", "_").replace(".", "_")
    if drivers_license and drivers_license.filename:
        suffix = Path(drivers_license.filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(400, f"Driver's license: allowed types {', '.join(ALLOWED_EXTENSIONS)}")
        dest_name = f"drivers_license_{safe_email}{suffix}"
        dest_path = UPLOADS_DIR / dest_name
        try:
            with open(dest_path, "wb") as f:
                shutil.copyfileobj(drivers_license.file, f)
        except Exception as e:
            raise HTTPException(500, f"Save failed: {e}")
    users = data.get("users", [])
    users.append({
        "email": email,
        "password": password or "",
        "name": (username or "").strip() or email.split("@")[0],
        "progress": 1,
        "is_verified": False,
        "business_name": (businessName or "").strip(),
        "business_description": (businessDescription or "").strip(),
        "category": (businessType or "").strip(),
        "address": (contact or "").strip(),
    })
    data["users"] = users
    save_db(data)
    return {"email": email, "message": "Application received. Our team is verifying your local status."}


@app.post("/api/signup")
def signup(body: LoginBody):
    """
    Simple sign up: email + password. Saves to database.txt with hashed_password.
    If email already exists, returns 409. Email is stored lowercase.
    """
    data = load_db()
    email = (body.email or "").strip().lower()
    password = body.password or ""
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    for u in data.get("users", []):
        if (u.get("email") or "").strip().lower() == email:
            raise HTTPException(status_code=409, detail="Email already registered. Please log in.")
    name = email.split("@")[0]
    users = data.get("users", [])
    users.append({
        "email": email,
        "hashed_password": hash_password(password),
        "name": name,
        "progress": 1,
        "is_verified": False,
        "status": "approved",
    })
    data["users"] = users
    save_db(data)
    return {
        "email": email,
        "business_name": "",
        "name": name,
        "progress": 1,
        "status": "approved",
        "is_verified": False,
    }


@app.post("/api/login")
def login(body: LoginBody):
    """
    Authenticate by email and password. Checks hashed_password (new) or password (legacy).
    On success returns user object with business_name from application if available.
    Email comparison is case-insensitive so "User@Mail.com" matches "user@mail.com".
    """
    data = load_db()
    email = (body.email or "").strip()
    email_lower = email.lower()
    password = body.password or ""
    for u in data.get("users", []):
        if (u.get("email") or "").strip().lower() != email_lower:
            continue
        stored = u.get("hashed_password") or u.get("password") or ""
        if not verify_password(password, stored):
            continue
        app_record, _ = get_application_by_email(email)
        biz_name = ((app_record or {}).get("biz_name") or u.get("business_name") or "").strip()
        status = u.get("status") or ("approved" if u.get("is_verified") else "pending_review")
        return {
            "email": u.get("email", ""),
            "business_name": biz_name,
            "name": u.get("name", "") or email.split("@")[0],
            "progress": u.get("progress", 1),
            "status": status,
            "is_verified": u.get("is_verified", False),
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")


def _user_status(u):
    return u.get("status") or ("approved" if u.get("is_verified") else "pending_review")


@app.get("/api/user")
def get_user(email: str = Query(..., description="User email")):
    """Get current user progress and verification status."""
    user, _ = get_user_by_email(email)
    if not user:
        return {"email": email, "progress": 1, "is_verified": False, "status": "pending_review"}
    out = dict(user)
    out["status"] = _user_status(user)
    return out


@app.get("/api/admin/pending")
def admin_pending():
    """Return all users with status == 'pending_review' (admin gate)."""
    data = load_db()
    pending = [
        {**u, "status": u.get("status") or "pending_review"}
        for u in data.get("users", [])
        if (u.get("status") or ("approved" if u.get("is_verified") else "pending_review")) == "pending_review"
    ]
    return {"users": pending}


class AdminActionBody(BaseModel):
    email: str


@app.post("/api/admin/approve")
def admin_approve(body: AdminActionBody):
    """Set user to status=approved and is_verified=true."""
    email = (body.email or "").strip()
    if not email:
        raise HTTPException(400, detail="Email is required")
    user, data = get_user_by_email(email)
    if not user:
        raise HTTPException(404, detail="User not found")
    users = data.get("users", [])
    i = next(idx for idx, u in enumerate(users) if u.get("email") == email)
    users[i]["status"] = "approved"
    users[i]["is_verified"] = True
    data["users"] = users
    save_db(data)
    return {"email": email, "status": "approved", "is_verified": True}


@app.post("/api/admin/reject")
def admin_reject(body: AdminActionBody):
    """Mark user as rejected (kept for audit; optionally filter from login)."""
    email = (body.email or "").strip()
    if not email:
        raise HTTPException(400, detail="Email is required")
    user, data = get_user_by_email(email)
    if not user:
        raise HTTPException(404, detail="User not found")
    users = data.get("users", [])
    i = next(idx for idx, u in enumerate(users) if u.get("email") == email)
    users[i]["status"] = "rejected"
    data["users"] = users
    save_db(data)
    return {"email": email, "status": "rejected"}


class ProgressBody(BaseModel):
    step: int | None = None  # If set, progress = max(current, step). Otherwise increment.


@app.patch("/api/user/progress")
def update_progress(
    email: str = Query(..., description="User email"),
    body: ProgressBody = Body(default=ProgressBody()),
):
    """
    Update user's progress. If body.step is provided: set progress = max(current, step).
    Otherwise increment by 1. Step 7 is completed when license is uploaded.
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
    if body and body.step is not None:
        new_progress = max(current, min(7, body.step))
    else:
        new_progress = current + 1
    users[i]["progress"] = new_progress
    data["users"] = users
    save_db(data)
    return {"email": email, "progress": users[i]["progress"], "is_verified": user.get("is_verified", False)}


@app.get("/api/businesses")
def list_businesses(category: str | None = Query(None, description="Optional category filter")):
    """Return only verified businesses. Joins database (is_verified) + applications (biz_name, etc)."""
    data = load_db()
    verified = []
    for u in data.get("users", []):
        if not u.get("is_verified"):
            continue
        email = u.get("email", "")
        app_record, _ = get_application_by_email(email)
        name = (app_record.get("biz_name") or u.get("business_name") or "Unnamed").strip() or "Unnamed"
        desc = (app_record.get("biz_desc") or u.get("business_description") or "").strip()
        cat = (app_record.get("biz_cat") or u.get("category") or "Other").strip() or "Other"
        verified.append({
            "id": email.replace("@", "_").replace(".", "_"),
            "name": name,
            "description": desc,
            "category": cat,
            "address": u.get("address") or "",
            "sustainability": "",
            "live": False,
        })
    if category:
        verified = [b for b in verified if b["category"].lower() == category.lower()]
    return {"businesses": verified}


@app.post("/api/upload-license")
async def upload_license(
    file: UploadFile = File(...),
    email: str = Form(...),
):
    """
    Upload license document. Saves file; updates applications.txt (license_url) and database.txt (is_verified).
    """
    suffix = Path(file.filename or "file").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")

    email = email.strip()
    safe_email = email.replace("@", "_").replace(".", "_")
    dest_name = f"license_{safe_email}{suffix}"
    dest_path = UPLOADS_DIR / dest_name

    try:
        with open(dest_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(500, f"Save failed: {e}")

    app_record, app_data = get_application_by_email(email)
    if app_record:
        apps = app_data.get("applications", [])
        i = next(idx for idx, a in enumerate(apps) if a.get("email") == email)
        apps[i]["license_url"] = dest_name
        apps[i]["status"] = "approved"
        app_data["applications"] = apps
        save_applications(app_data)

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
