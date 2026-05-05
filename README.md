# Bolt ⚡ — Project Management App

A full-stack project management application with role-based access control (Admin/Member). Create projects, assign tasks, and track progress with a beautiful dark-theme Kanban board.

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

## 🌐 Live Demo

**[https://your-app.up.railway.app](https://your-app.up.railway.app)** *(update after deployment)*

## 🚀 Features

- **Authentication** — Signup/Login with JWT tokens
- **Projects** — Create, update, delete projects with color coding
- **Team Management** — Add/remove members with Admin or Member roles
- **Kanban Board** — Visual task board with To Do / In Progress / Done columns
- **Task Management** — Create, assign, set priority & due dates
- **Role-Based Access** — Admins manage everything; Members can update task status
- **Dashboard** — Overview with task counts, overdue alerts, and personal task list
- **Responsive** — Works on desktop and mobile

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcrypt |
| Frontend | React 18, Vite, Redux Toolkit (RTK Query) |
| Icons | Lucide React |
| Deployment | Railway |

## 📁 Project Structure

```
Bolt/
├── server/           # Express API
│   ├── config/       # DB connection
│   ├── controllers/  # Route handlers
│   ├── middleware/    # Auth, RBAC, errors
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   └── server.js     # Entry point
├── client/           # React SPA
│   └── src/
│       ├── api/      # RTK Query
│       ├── features/ # Redux slices
│       ├── layouts/  # App shell
│       └── pages/    # Route pages
├── railway.json      # Railway config
└── package.json      # Root scripts
```

## 🏃 Local Development

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/bolt.git
cd bolt

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 4. Run (both server + client)
npm run dev
```

Server: `http://localhost:5000` | Client: `http://localhost:5173`

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |

## 📡 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get profile |

### Projects
| Method | Route | Access |
|--------|-------|--------|
| GET/POST | `/api/projects` | Auth |
| GET/PUT/DELETE | `/api/projects/:id` | Member/Admin |
| POST | `/api/projects/:id/members` | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Admin |

### Tasks
| Method | Route | Access |
|--------|-------|--------|
| GET/POST | `/api/projects/:id/tasks` | Member/Admin |
| PUT/DELETE | `/api/tasks/:taskId` | Admin (Member: status only) |
| GET | `/api/tasks/dashboard` | Auth |

## 🚢 Deployment (Railway)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables in Railway dashboard
4. Railway auto-detects `railway.json` and deploys

## 👥 Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

## 📄 License

MIT
