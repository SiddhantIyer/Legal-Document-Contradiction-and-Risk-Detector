# AI Paralegal - Setup & Changelog

## 🚀 Setup & Run Instructions

To run the full stack locally, you need to start three separate services. Ensure you have Node.js and Python 3 installed.

### 1. Python Extraction Service (FastAPI)
Handles PDF/DOCX parsing and AI analysis using Groq.
```bash
cd python_service
pip install -r requirements.txt

# Ensure you have a .env file with:
# GROQ_API_KEY=your_key
# GROQ_MODEL=llama-3.3-70b-versatile
# PYTHON_SERVICE_PORT=8000

python -m uvicorn main:app --reload --port 8000
```
*Runs on http://localhost:8000*

### 2. Node.js Backend Server (Express)
Handles authentication, database operations, and proxying requests.
```bash
cd server
npm install

# Ensure you have a .env file with:
# PORT=5000
# CLIENT_URL=http://localhost:5173
# MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.../ai_paralegal?appName=Cluster0
# JWT_SECRET=your_secret
# EXTRACTION_SERVICE_URL=http://localhost:8000

npm run dev
```
*Runs on http://localhost:5000*

### 3. React Frontend (Vite)
The user interface.
```bash
cd client
npm install
npm run dev
```
*Runs on http://localhost:5173*

---

## 📝 Recent Changes & Implementations

### 1. Database Connectivity & Configuration
- Created and injected secure `.env` files for both the Node backend and Python service.
- Discovered and fixed a critical DNS resolution issue where the local router was blocking MongoDB Atlas SRV records by forcing Node.js to use Google's Public DNS (`8.8.8.8`).
- Updated the connection string to target a specific `ai_paralegal` database inside the shared Atlas cluster.

### 2. Database Schema Optimization
- Modified `server/models/Contract.js` to add proper database indexing (`index: true`) to the `status` and `uploadDate` fields to improve query performance.

### 3. Semantic Extractor Enhancements (Python)
- Completely refactored the core extraction logic in `semantic_extractor.py` by adding modular helper functions:
  - `_build_contract_context()`
  - `_consolidate_findings()`
  - `_deduplicate_findings()`
  - `_validate_findings()`
- Added `finding_group` schema definitions.
- Set up test coverage using `pytest` and created a test suite in `tests/test_semantic_extractor.py`.

### 4. Real AI Chat Integration
- **Python Service**: Created a new `POST /chat` endpoint in `main.py` that utilizes Groq to provide highly contextual answers based on the specific contract's extracted clauses, risks, and contradictions.
- **Node Backend**: Created a new proxy route (`POST /api/contracts/:id/chat`) and controller function (`chatWithContract`) to securely forward chat requests from the frontend to the Python AI service.
- **React Frontend**: Ripped out the hardcoded mock chat responses in `ContractWorkspacePage.jsx`. Wired up `api.js` to send real user queries to the backend and display live AI responses with dynamic typing states.


### 5. Documentation
- Created a comprehensive `PRODUCT_STRATEGY.md` detailing the 7 core business pillars for the application's roadmap.
