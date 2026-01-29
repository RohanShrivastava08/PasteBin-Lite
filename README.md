# Pastebin Lite

A backend-focused Pastebin-like web application that allows users to create and share text pastes via unique URLs, with optional expiry based on time or number of views.  
Designed for correctness, persistence, and automated testability.

---

## ✨ Features

- Create a text paste with optional constraints:
  - Time-based expiry (TTL)
  - View-count limit
- Generate a unique, shareable URL for each paste
- View paste content via browser or API
- Pastes become unavailable once any constraint is triggered
- Deterministic expiry support for automated testing
- Persistent storage (serverless-safe)

---

## 🧠 Design Goals

- Correctness over UI complexity
- Persistence across serverless requests
- Clean REST API design
- Deterministic behavior for automated tests
- Consistent error handling

---

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React
- **Backend:** Node.js, REST APIs
- **Persistence:** Redis (Vercel Redis integration)
- **Deployment:** Vercel

---

## 📁 Project Structure

src/
├── app/
│ ├── api/
│ │ ├── healthz/route.ts # Health check endpoint
│ │ ├── pastes/route.ts # Create paste (POST)
│ │ └── pastes/[id]/route.ts # Fetch paste (GET, counts views)
│ ├── p/[id]/page.tsx # Minimal paste view (HTML)
│ ├── layout.tsx # Conditional global layout
│ └── page.tsx # Home page (create paste UI)
│
├── lib/
│ ├── redis.ts # Persistence layer
│ ├── time.ts # Time abstraction (deterministic testing)
│ └── id.ts # Unique ID generator

---

## 🔌 API Endpoints

### Health Check

GET /api/healthz


Response:
```json
{ "ok": true }
Create a Paste
POST /api/pastes
Request body:

{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
Rules:

content is required and must be a non-empty string

ttl_seconds and max_views are optional but must be integers ≥ 1

Response:

{
  "id": "string",
  "url": "https://your-app.vercel.app/p/<id>"
}
Fetch a Paste (API)
GET /api/pastes/:id
Response:

{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
Notes:

Each successful API fetch counts as a view

Returns 404 if the paste is missing, expired, or view limit exceeded

View a Paste (HTML)
GET /p/:id
Displays paste content in a minimal, read-only view

Does not increment view count

Returns 404 if unavailable

⏱ Deterministic Time Support
To support automated testing, the application allows deterministic expiry checks.

If the environment variable is set:

TEST_MODE=1
Then the request header:

x-test-now-ms: <milliseconds since epoch>
is treated as the current time for expiry logic only.

If the header is absent, real system time is used.

💾 Persistence Layer
Uses Redis for persistent storage

Avoids in-memory state to ensure correctness on serverless platforms

Atomic operations are used for view counting to prevent race conditions

🚀 Running Locally
Clone the repository:

git clone <repo-url>
cd pastebin-lite
Install dependencies:

npm install
Create a .env.local file:

NEXT_PUBLIC_BASE_URL=http://localhost:3000
REDIS_URL=<your-redis-url>
Start the development server:

npm run dev
Open:

http://localhost:3000
🧪 Testing Example (curl)
curl -X POST https://your-app.vercel.app/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello world","max_views":2}'
📌 Notes
All API responses return JSON

Unavailable pastes consistently return HTTP 404

No secrets or credentials are committed

Designed to pass automated grading systems

📄 License
This project was created for evaluation purposes as part of a take-home exercise.

Note:
This project intentionally prioritizes backend correctness, persistence, and testability over UI design, aligning with real-world production and automated evaluation requirements.