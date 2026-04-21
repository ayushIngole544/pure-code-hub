# 🚀 CodeHub Backend - Online Judge System

A **production-level backend system** for a coding platform similar to LeetCode, built with Node.js, Express, Prisma, Docker, and BullMQ.

---

## 📌 Overview

CodeHub Backend is a scalable online judge system where users can:

- Submit coding solutions
- Execute code in a secure sandbox
- Get real-time evaluation results
- Practice problems like competitive programming platforms

---

## 🧱 Architecture


Client → API → Queue → Worker → Docker → Evaluation → Database → Response


---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express, TypeScript  
- **Database:** PostgreSQL + Prisma ORM  
- **Queue System:** BullMQ + Redis  
- **Code Execution:** Docker  
- **Authentication:** JWT  

---

## 🔐 Authentication System

- User Registration & Login  
- JWT-based authentication  
- Role-based access control  

### Roles:
- Student  
- Teacher  
- Professional  

---

## 🧩 Features

### 1. Problem Management
- Create coding problems
- Set difficulty (EASY / MEDIUM / HARD)
- Attach multiple test cases

---

### 2. Test Case System
- Supports:
  - Visible test cases
  - Hidden test cases
- Used for accurate evaluation

---

### 3. Submission System
- Users submit code in multiple languages:
  - Python
  - JavaScript
  - C++
- Stored as `PENDING` initially

---

### 4. Queue-Based Execution (BullMQ)

- Submissions are pushed to a queue
- Worker processes them asynchronously

✅ Prevents server blocking  
✅ Scalable for multiple users  

---

### 5. Worker System

- Picks submission jobs from queue
- Executes code
- Updates result in database

---

### 6. Docker Sandbox Execution

- Code runs inside isolated containers
- Resource restrictions:
  - CPU limit
  - Memory limit
  - No network access

✅ Secure execution environment  

---

### 7. Evaluation Engine

Each submission is evaluated against all test cases:

#### Status Types:
- `ACCEPTED`
- `WRONG_ANSWER`
- `RUNTIME_ERROR`
- `TIME_LIMIT_EXCEEDED`

---

### 8. Time Limit Handling (TLE)

- Detects infinite loops and slow code
- Automatically kills Docker container after 2 seconds

---

## 🔁 Submission Flow

User submits code
API stores submission (PENDING)
Job added to queue
Worker picks job
Code runs inside Docker
Output compared with expected results
Status updated in database
User fetches result

---

## 🌐 API Endpoints

### 🔐 Auth

POST /api/auth/register
POST /api/auth/login


### 🧩 Problems

POST /api/problems
GET /api/problems


### 🧪 Test Cases

POST /api/testcases


### 📤 Submissions

POST /api/submissions
GET /api/submissions/:id


---

## 🧠 Key Concepts Implemented

- Queue-based architecture (BullMQ)
- Worker pattern for background jobs
- Docker-based code execution
- Time limit enforcement (TLE)
- Role-based authentication
- Scalable backend design

---

## 🚀 Getting Started

### 1. Clone Repository

git clone https://github.com/ayushIngole544/CodeHub-new-part.git

cd codehub-backend


---

### 2. Install Dependencies

pnpm install


---

### 3. Setup Environment Variables

Create `.env` file:


PORT=4000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret
REDIS_URL=redis://localhost:6379


---

### 4. Start Services

#### Start Backend

pnpm dev


#### Start Worker

pnpm ts-node src/workers/submission.worker.ts


---

### 5. Run Docker (Required)

Make sure Docker is running:

docker --version


---

## 📊 Project Status


Backend: ✅ Complete
Frontend: 🔄 In Progress


---

## 🔥 Future Enhancements

- Monaco Editor (Frontend)
- Real-time code execution
- Contest system
- Leaderboard
- AI-generated problems

---

## 💡 Inspiration

Inspired by platforms like:

- LeetCode  
- Codeforces  
- HackerRank  

---

## 👨‍💻 Author

**Your Name**

---

## ⭐ If you like this project, give it a star!
