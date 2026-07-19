import os
import sys
from dotenv import load_dotenv

# Load settings from backend/.env
env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)
    print(f"[INFO] Loaded environment variables from {env_path}")
else:
    load_dotenv()
    print("[WARNING] backend/.env file not found. Loading system environment variables.")

# 1. Test Google Gemini API Key
print("\n--- 1. Testing Google Gemini API Key ---")
gemini_key = os.getenv("GOOGLE_API_KEY", "")
if not gemini_key:
    print("[FAIL] GOOGLE_API_KEY is not set in environment.")
else:
    print(f"[INFO] Key detected: {gemini_key[:5]}...{gemini_key[-5:] if len(gemini_key) > 5 else ''}")
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        print("[INFO] Querying Gemini with a simple prompt: 'Say hello'...")
        response = model.generate_content("Say hello")
        print(f"[SUCCESS] Gemini Response: '{response.text.strip()}'")
    except Exception as e:
        print(f"[FAIL] Gemini API call failed: {e}")

# 2. Test Hugging Face Token
print("\n--- 2. Testing Hugging Face Token ---")
hf_token = os.getenv("HUGGINGFACE_TOKEN", "")
if not hf_token:
    print("[WARNING] HUGGINGFACE_TOKEN is not set. GoEmotions will run locally or use keyword fallback.")
else:
    print(f"[INFO] Token detected: {hf_token[:5]}...{hf_token[-5:] if len(hf_token) > 5 else ''}")
    try:
        import httpx
        url = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
        headers = {"Authorization": f"Bearer {hf_token}"}
        print("[INFO] Sending post request to Hugging Face model API...")
        response = httpx.post(url, json={"inputs": "I am feeling wonderful today!"}, headers=headers, timeout=10.0)
        if response.status_code == 200:
            print(f"[SUCCESS] Hugging Face Response: {response.json()}")
        else:
            print(f"[FAIL] Hugging Face request failed with status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[FAIL] Hugging Face API call failed: {e}")

# 3. Test MongoDB Connection
print("\n--- 3. Testing MongoDB Local Connection ---")
mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/mannsetu_ai")
print(f"[INFO] Target URI: {mongo_uri}")
try:
    from pymongo import MongoClient
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
    # Trigger connection check
    client.admin.command('ping')
    print("[SUCCESS] Connected to MongoDB database successfully.")
except Exception as e:
    print(f"[FAIL] Failed to connect to MongoDB: {e}")

print("\n--- Diagnostic Complete ---")
