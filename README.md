# 🎯 AI Mock Interview

An AI-powered mock interview platform built with React, Vite, Tailwind CSS, Node.js, Express.js, and MongoDB. It helps users practice interviews using voice or text and receive AI-powered feedback.

## ✨ Features
- User Signup and Login with JWT Authentication
- Role-Based MCQ Interviews
- Resume-Based Interview Practice
- AI-Powered Answer Evaluation
- Voice Input and Text-to-Speech
- Interview History and Reports
- Responsive UI with Multiple Themes

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT
- **AI Integration:** Google Gemini API
- **HTTP Client:** Axios
- **Web APIs:** Web Speech API, Web Audio API

## 🔗 API Documentation

**Base URL:** `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Get current user profile |
| POST | `/interview/start` | Start a role-based interview |
| POST | `/interview/start-resume` | Start a resume-based interview |
| GET | `/interview/all` | Get interview history |
| GET | `/interview/:id` | Get interview details |
| POST | `/interview/:id/ask-ai` | Ask AI for a hint |
| POST | `/interview/:id/answer` | Submit an answer and receive evaluation |
| POST | `/interview/:id/finish` | Finish interview and generate report |
| DELETE | `/interview/:id` | Delete interview history |

**Authentication:** Protected endpoints require a JWT token in the `Authorization: Bearer <token>` header.

## ⚙️ Installation and Setup

### 1. Clone the Repository
```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Start the Backend
```bash
cd Backend
npm install
npm run dev
```

### 3. Start the Frontend
Open another terminal:
```bash
cd Frontend
npm install
npm run dev
```

## 🔐 Environment Configuration

Configure environment variables in `Backend/.env` and `Frontend/.env`.

**Backend `.env`:**
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

Never upload API keys, database credentials, or secrets to GitHub.

## 🌐 Application URLs
- **Frontend:** `http://localhost:5173`
- **Backend:** `http://localhost:5000`

## 👨‍💻 Author
**Kishan Kumar**
