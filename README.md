<div align="center">

<img src="public/ML Code LOGO.png" alt="ML Code Logo" width="80" />

# ML Code

### The LeetCode for Machine Learning Engineers

**Practice real-world ML challenges, compete on the leaderboard, and level up your data science skills.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mlcode.vercel.app-orange?style=for-the-badge&logo=vercel)](https://mlcode.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://mlcode-snkb.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Manvith--kumar16%2FMLCode-181717?style=for-the-badge&logo=github)](https://github.com/Manvith-kumar16/MLCode)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss)

</div>

---

## 🧠 What is ML Code?

**ML Code** is an interactive coding platform specifically designed for **Machine Learning and Data Science** practitioners. Inspired by LeetCode, it offers a curated set of ML problems spanning topics like Classification, Regression, Deep Learning, NLP, Computer Vision, and more — with a built-in Python code editor, real-time code execution, and a competitive leaderboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧩 **ML Problem Set** | Curated problems across 10+ ML topics with difficulty tiers |
| ⚡ **In-Browser Code Editor** | Monaco Editor (VS Code engine) with Python 3 support and light/dark toggle |
| 🚀 **Code Execution** | Run and submit code against hidden test cases in real time |
| 📊 **Dashboard** | Personal stats, activity heatmap, and recent submissions at a glance |
| 🏆 **Leaderboard** | Live global rankings with a visual podium for the top 3 |
| 👤 **Profile Page** | Detailed profile with rank, streak, solved stats, badges, and heatmap |
| 📝 **Submissions Page** | Full history of all submissions with status filtering & code preview |
| 💬 **Discussion** | Per-problem discussion threads (post, view, delete your comments) |
| 💡 **Hints** | Two-level hints per problem, revealed on demand |
| 🔐 **Authentication** | Email/password and **Google OAuth** sign-in |
| 🌙 **Premium Dark UI** | Glassmorphism design, ambient glow backgrounds, smooth animations |
| 📱 **Responsive** | Works across desktop and tablet screens |

---

## 🏗️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations |
| Monaco Editor (`@monaco-editor/react`) | In-browser code editor |
| React Router v6 | Client-side routing |
| TanStack Query | Server state management |
| Lucide React | Icon library |
| Radix UI + shadcn/ui | Headless UI components |
| Sonner | Toast notifications |
| date-fns | Date formatting |
| React Markdown + remark-gfm | Problem description rendering |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| google-auth-library | Google OAuth verification |
| dotenv | Environment config |

---

## 📁 Project Structure

```
MLCode/
├── src/                        # Frontend source
│   ├── pages/
│   │   ├── Index.tsx           # Landing page
│   │   ├── Problems.tsx        # Problem list with filters
│   │   ├── ProblemDetail.tsx   # Code editor + problem view
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── Leaderboard.tsx     # Global rankings
│   │   ├── Profile.tsx         # User profile
│   │   ├── Submissions.tsx     # Submission history
│   │   ├── SignIn.tsx          # Login page
│   │   ├── SignUp.tsx          # Registration page
│   │   └── EditProfile.tsx     # Profile settings
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── AppSidebar.tsx      # Navigation sidebar
│   │   ├── DifficultyBadge.tsx # Easy/Medium/Hard badge
│   │   ├── RecentSubmissions.tsx
│   │   └── SubmissionHeatmap.tsx
│   └── App.tsx                 # Routes configuration
│
├── server/                     # Backend source
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Problem.js          # Problem schema
│   │   ├── Submission.js       # Submission schema
│   │   └── Discussion.js       # Discussion/comment schema
│   ├── routes/
│   │   ├── auth.js             # Auth + user routes
│   │   ├── problems.js         # Problem CRUD routes
│   │   ├── submissions.js      # Submission routes
│   │   ├── discussions.js      # Discussion routes
│   │   ├── execute.js          # Code execution route
│   │   └── verifyToken.js      # JWT middleware
│   ├── services/               # Execution service
│   └── index.js                # Express app entry
│
├── vercel.json                 # Vercel SPA routing config
├── .env                        # Frontend env vars
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A Google Cloud project with OAuth 2.0 credentials

### 1. Clone the repository

```bash
git clone https://github.com/Manvith-kumar16/MLCode.git
cd MLCode
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create `server/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mlcode
GOOGLE_CLIENT_ID=your_google_oauth_client_id
PORT=5001
```

Start the server:
```bash
npm run dev
```

### 3. Set up the Frontend

```bash
# From the project root
npm install
```

Create `.env` in the root:
```env
VITE_API_URL=http://localhost:5001
```

Start the dev server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/signup` | Register with email & password |
| `POST` | `/signin` | Login with email & password |
| `POST` | `/google` | Login / register via Google OAuth |
| `GET` | `/me` | Get current user profile (auth required) |
| `PUT` | `/me` | Update profile (auth required) |
| `GET` | `/leaderboard` | Get top 10 users by points |
| `GET` | `/rank/:userId` | Get a user's global rank |

### Problems Routes — `/api/problems`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all problems |
| `GET` | `/:id` | Get single problem by problemId |

### Submissions Routes — `/api/submissions`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/submit` | Submit solution for judging |
| `GET` | `/user/:userId` | Get all submissions for a user |
| `GET` | `/stats/:userId` | Get heatmap data for a user |
| `GET` | `/problem/:problemId` | Get submissions for a problem |

### Execution Routes — `/api/execute`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/:problemId` | Run code without submitting |

### Discussion Routes — `/api/discussions`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/:problemId` | Get all comments for a problem |
| `POST` | `/` | Post a new comment (auth required) |
| `DELETE` | `/:commentId` | Delete your comment (auth required) |

---

## 🚢 Deployment

### Backend → Render

1. Connect your GitHub repo to [render.com](https://render.com)
2. Set **Root Directory** to `server`
3. Build command: `npm install` | Start command: `npm start`
4. Add environment variables: `MONGO_URI`, `GOOGLE_CLIENT_ID`, `PORT`

### Frontend → Vercel

1. Import repo at [vercel.com](https://vercel.com) → root directory `.`
2. Framework: **Vite** | Build: `npm run build` | Output: `dist`
3. Add env variable: `VITE_API_URL=https://your-render-backend.onrender.com`
4. Add your Vercel domain to **Google Cloud Console → Authorized Origins**

---

## 🔐 Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=https://mlcode-snkb.onrender.com
```

### Backend (`server/.env`)
```env
MONGO_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
PORT=5001
```

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---
