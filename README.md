# StreetEye 🛣️

**AI-Powered Road Safety and Contractor Accountability System**

Built for SRCAS Hackathon 3.0

---

## Overview

StreetEye connects citizens, authorities, and contractors in a transparent road accountability chain:

**Report → Verify → Assign → Repair → Verify → Score → Rank**

Citizen complaints directly affect contractor performance scores, which influence future tender rankings — ensuring quality-first road maintenance.

---

## Requirements

- Node.js 18+
- MongoDB (local or Atlas)
- npm

---

## Installation

### 1. Clone / Setup

```bash
cd streeteye
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/streeteye
JWT_SECRET=streeteye_jwt_super_secret_change_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## MongoDB Setup

Make sure MongoDB is running locally:

```bash
# Windows
mongod

# Or use MongoDB Compass / Atlas
```

---

## Seed Demo Data

```bash
cd backend
npm run seed
```

This creates all demo accounts, sample complaints, a project, and a tender.

---

## Running Locally

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Accounts

| Role | Login ID | Password |
|---|---|---|
| Citizen | Phone: `9000000001` | `Citizen@123` |
| Citizen 2 | Phone: `9000000002` | `Citizen@123` |
| Authority | Gov ID: `GOV-2026-001` | `Authority@123` |
| Contractor A (Score: 92) | ID: `CTR-2026-001` | `Contractor@123` |
| Contractor B (Score: 76) | ID: `CTR-2026-002` | `Contractor@123` |
| Contractor C (Score: 41) | ID: `CTR-2026-003` | `Contractor@123` |

---

## Live Demo Flow

1. **Citizen** logs in → Reports pothole on Avinashi Road with image
2. **AI analyzes** the image → Returns: Pothole, 94% confidence, HIGH severity, URGENT
3. **Ticket created** → `ST-2026-XXXX`
4. **Authority** logs in → Sees complaint on dashboard + map
5. **Authority verifies** → Assigns to Contractor A
6. **Contractor A** logs in → Sees assignment → Starts repair → Uploads before/after photos → Submits
7. **Authority** reviews before/after → Approves rectification
8. **Complaint RESOLVED** → Contractor metrics auto-update → Score recalculated
9. **Open Tenders** → See StreetEye ranking: Performance 70% + Price 30%
10. **Contractor C (cheapest) ranks last** — demonstrating quality > lowest price

---

## Key Features

### AI Road Damage Analysis
- Image upload → AI returns issue type, confidence, severity, priority
- Fallback gracefully if AI unavailable

### Contractor Scoring (out of 100)
```
Rectification Rate       30%
On-Time Resolution       25%
Repair Quality           25%
Repeat Issue Score       10%
Budget Compliance        10%
```

### Tender Ranking Formula
```
Price Score = (Lowest Quotation / Contractor Quotation) × 100
Final Score = 70% × Performance + 30% × Price Score
```

### 80/20 Financial Model
```
Project Budget
├── Construction Allocation: 80%
└── Retained Assurance:     20%
```

---

## API Endpoints

### Auth
```
POST /api/auth/citizen/register
POST /api/auth/citizen/login
POST /api/auth/contractor/register
POST /api/auth/contractor/login
POST /api/auth/authority/login
GET  /api/auth/me
```

### Complaints
```
POST   /api/complaints
GET    /api/complaints/my
GET    /api/complaints
GET    /api/complaints/:id
POST   /api/complaints/:id/verify
POST   /api/complaints/:id/reject
POST   /api/complaints/:id/assign
POST   /api/complaints/:id/start-repair
POST   /api/complaints/:id/submit-rectification
POST   /api/complaints/:id/approve-rectification
POST   /api/complaints/:id/reject-rectification
```

### Contractors
```
GET /api/contractors
GET /api/contractors/assignments
GET /api/contractors/:id
GET /api/contractors/:id/score
```

### Projects
```
POST  /api/projects
GET   /api/projects
GET   /api/projects/:id
GET   /api/projects/:id/budget
PATCH /api/projects/:id/budget
```

### Tenders
```
POST /api/tenders
GET  /api/tenders
GET  /api/tenders/:id
POST /api/tenders/:id/bids
GET  /api/tenders/:id/rankings
```

### Dashboard
```
GET /api/dashboard/citizen
GET /api/dashboard/contractor
GET /api/dashboard/authority
```

### AI
```
POST /api/ai/analyze-road
```

---

## Complaint Status Flow

```
NEW → UNDER_REVIEW → VERIFIED → ASSIGNED → IN_PROGRESS
→ RECTIFICATION_SUBMITTED → AUTHORITY_VERIFICATION → RESOLVED

Alternative: NEW → UNDER_REVIEW → REJECTED
```

---

## Production Deployment

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ with nginx or any static host
```

---

## Architecture

```
Frontend (React/Vite :5173)
    ↓ Axios (JWT Bearer)
Backend (Express :5000)
    ↓ Mongoose
MongoDB (streeteye DB)
    uploads/ (Multer local storage)
```

---

## Security

- bcrypt password hashing (salt rounds: 12)
- JWT with 7-day expiry
- Role-based authorization middleware
- Helmet security headers
- CORS configured for frontend origin
- Rate limiting on auth routes (20 req/15min)
- File type + size validation (10MB, images only)
- Ownership validation (citizens/contractors can only access their own data)

---

*Built with ❤️ for SRCAS Hackathon 3.0*
"# StreetEye-app" 
