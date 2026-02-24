# MLCode 

**Master Machine Learning Through Practice.**

MLCode is a specialized platform designed for practitioners to sharpen their machine learning skills by solving real-world challenges. From basic regression to advanced deep learning, MLCode provides a structured environment for hands-on learning, instant evaluation, and community-driven progress.

---

## 🚀 Key Features

- **ML Problem Sets**: 150+ curated challenges across Classification, Regression, NLP, and Computer Vision.
- **Instant Evaluation**: Automated scoring against hidden test datasets using industry-standard metrics (Accuracy, F1, RMSE).
- **Global Leaderboard**: Compete with practitioners worldwide and track your standing.
- **Detailed Analytics**: Visualize your growth with submission heatmaps and skill-specific progress tracking.
- **Rich Code Editor**: Integrated Monaco editor with syntax highlighting for Python/ML scripts.
- **Modern Dashboard**: High-performance analytics dashboard for monitoring your learning journey.

## 🛠️ Tech Stack

### Frontend:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Vanilla CSS
- **UI Components**: shadcn/ui & Radix UI
- **State Management**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT & Google OAuth 2.0
- **Validation**: Zod & Express-validator

---

## 📂 Project Structure

```text
├── server/             # Express.js backend API
│   ├── models/         # MongoDB schemas (User, Submission, Problem)
│   ├── routes/         # API endpoints (Auth, Submissions)
│   └── index.js        # Server entry point
├── src/                # React frontend source
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application views (Index, Dashboard, Problems)
│   ├── lib/            # Utility functions and configurations
│   └── App.tsx         # Frontend routing logic
└── package.json        # Project metadata and dependencies
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ML_Code
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Environment Setup

Create a `.env` file in the `server` directory and add the following:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

### Running the Application

1. **Start the Backend**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## 🧪 Testing

Run frontend unit tests using Vitest:
```bash
npm run test
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
