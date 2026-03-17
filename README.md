<p align="center">
  <h1 align="center">🚀 SyncSpace</h1>
  <p align="center"><strong>Real-Time Collaborative Work Simulator Platform</strong></p>
  <p align="center">A full-stack platform that simulates real-world team collaboration — built for hackathons, portfolios, and learning modern development workflows.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" />
</p>

---

## 🚀 Project Overview

**SyncSpace** is a real-time collaborative work simulator that replicates the environment of a modern software team. It provides teams with a unified workspace where they can manage projects, assign and track tasks on a Kanban board, communicate through real-time chat, and monitor team performance — all in one platform.

### Why SyncSpace?

In academic settings and early careers, developers rarely get exposure to how real engineering teams operate. Tools are fragmented — chat lives in one app, tasks in another, and project context is scattered across documents. SyncSpace brings everything together into a single, cohesive experience that mirrors the workflows used at companies like GitHub, Atlassian, and Slack.

Whether you're preparing for a hackathon, building your portfolio, or learning full-stack development, SyncSpace gives you a production-grade codebase to study, extend, and showcase.

---

## 🧩 Problem Statement

| Problem | Impact |
|---------|--------|
| Students lack real-world team collaboration experience | Poor preparation for industry workflows |
| Communication, task tracking, and project management live in separate tools | Context switching kills productivity |
| No platform simulates actual company workflows in a learning-friendly way | Teams struggle to coordinate effectively |
| Existing tools like Jira or Slack are complex and not designed for learning | Steep learning curve discourages adoption |

SyncSpace solves this by providing a **single, integrated platform** purpose-built for collaborative work simulation.

---

## 🎯 Objectives

- **Unified Workspace** — Combine project management, task tracking, real-time chat, and analytics into one platform
- **Real-World Simulation** — Mirror the workflows, roles, and processes used by professional engineering teams
- **Team Productivity** — Provide actionable insights through dashboards and activity tracking to help teams improve
- **Developer-Friendly Architecture** — Use a modular, feature-based codebase that supports parallel development by 6–8 developers

---

## 💡 Key Features

### 🔐 Authentication & Authorization
- Secure signup and login with **JWT-based authentication**
- Protected routes and session management
- Role-based access control (Admin, Member)

### 👥 Team & Workspace Management
- Create and join teams with unique invite codes
- View team members, roles, and permissions
- Switch between multiple team workspaces

### 📂 Project Management
- Create projects within a team workspace
- Track project status, deadlines, and assigned members
- Project detail view with linked tasks and activity

### 📋 Task Management with Kanban Board
- Interactive **drag-and-drop Kanban board** (To Do → In Progress → Review → Done)
- Create, edit, assign, and delete tasks
- Priority levels, due dates, and status tracking
- Filter and search across tasks

### 💬 Real-Time Chat (Socket.io)
- Instant messaging within team channels
- Live message updates without page refresh
- Message history and scroll-to-latest functionality

### 📊 Analytics Dashboard
- **Stats cards** showing total projects, tasks, team members, and completion rates
- **Activity graph** visualizing team productivity over time
- **Leaderboard** ranking members by contributions

### 🔔 Notification System
- In-app notifications for task assignments, messages, and updates
- Notification bell with unread count badge
- Notification list with timestamps and read/unread states

### 📈 Activity Tracking
- Automatic logging of all user actions (task created, project updated, etc.)
- Activity feed showing recent team actions
- Historical activity data for analytics

### 🏆 Gamification *(Planned)*
- XP points for completing tasks and contributing to projects
- Achievement badges and team milestones
- Leaderboard integration with gamification scores

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | Server-side rendering, routing, and React framework |
| **Styling** | Tailwind CSS | Utility-first CSS for responsive, modern UI |
| **State Management** | Zustand | Lightweight, scalable client-side state |
| **Backend** | Next.js API Routes | RESTful API endpoints running on Node.js |
| **Database** | MongoDB + Mongoose | NoSQL document database with schema validation |
| **Real-Time** | Socket.io | WebSocket-based bidirectional communication |
| **Authentication** | JWT (jsonwebtoken) | Stateless token-based auth |
| **Language** | JavaScript (ES6+) | Full-stack JavaScript — no TypeScript |

---

## 📁 Project Structure

SyncSpace uses a **feature-based modular architecture** designed for parallel development. Each module is self-contained with its own components, API handlers, services, and types.

```
SyncSpace/
├── app/                          # Next.js App Router (pages + API routes)
│   ├── page.jsx                  # Landing page
│   ├── layout.jsx                # Root layout
│   ├── login/page.jsx            # Login page
│   ├── signup/page.jsx           # Signup page
│   ├── dashboard/page.jsx        # Dashboard page
│   ├── team/                     # Team pages
│   ├── project/                  # Project pages
│   ├── task/                     # Task pages (Kanban view)
│   └── api/                      # API route handlers
│       ├── auth/                 # /api/auth/login, /api/auth/register
│       ├── team/                 # /api/team
│       ├── project/              # /api/project
│       ├── task/                 # /api/task
│       ├── chat/                 # /api/chat
│       ├── activity/             # /api/activity
│       └── notification/         # /api/notification
│
├── modules/                      # Feature-based modules
│   ├── auth/                     # Authentication module
│   ├── team/                     # Team management module
│   ├── project/                  # Project management module
│   ├── task/                     # Task & Kanban module
│   ├── chat/                     # Real-time chat module
│   ├── dashboard/                # Analytics dashboard module
│   ├── activity/                 # Activity tracking module
│   └── notification/             # Notification module
│
├── components/                   # Shared/global UI components
├── lib/                          # Utilities (db.js, auth.js, socket.js)
├── hooks/                        # Shared React hooks
├── store/                        # Zustand stores (authStore, taskStore, teamStore)
├── types/                        # Shared data schemas (user, team, project, task)
├── styles/                       # Global stylesheets
└── public/                       # Static assets
```

> **Why this structure?** Each module in `modules/` is independent — a developer working on `chat/` never needs to touch `task/`. This enables 6–8 developers to work in parallel without merge conflicts.

---

## 🧠 System Design Overview

```
┌──────────────┐     HTTP/WS      ┌──────────────────┐     Mongoose     ┌──────────┐
│              │ ───────────────▶  │                  │ ──────────────▶  │          │
│   Client     │                  │  Next.js API      │                  │ MongoDB  │
│  (Next.js)   │ ◀───────────────  │  Routes + Socket  │ ◀──────────────  │          │
│              │     JSON/WS      │                  │     Documents    │          │
└──────────────┘                  └──────────────────┘                  └──────────┘
       │                                   │
       │  Zustand Store                    │  Socket.io
       │  (Client State)                   │  (Real-Time Events)
       ▼                                   ▼
┌──────────────┐                  ┌──────────────────┐
│  UI Components│                  │  Connected Clients│
│  (React/JSX) │                  │  (Live Updates)   │
└──────────────┘                  └──────────────────┘
```

**Key flows:**
1. **User Action** → React Component → Zustand Store → API Route → MongoDB → Response → UI Update
2. **Real-Time** → Socket.io Client emits event → Socket.io Server broadcasts → All connected clients update
3. **Auth** → Login request → JWT issued → Token stored client-side → Sent with every API request

---

## 🗄️ Database Schema (Overview)

| Collection | Key Fields | Purpose |
|-----------|------------|---------|
| **User** | name, email, password (hashed), avatar, role | Stores user accounts and credentials |
| **Team** | name, description, members[], admin, inviteCode | Represents a team workspace |
| **Project** | title, description, teamId, status, deadline, members[] | Projects within a team |
| **Task** | title, description, projectId, assignee, status, priority, dueDate | Individual tasks on the Kanban board |
| **Message** | content, senderId, teamId, timestamp | Chat messages within a team |
| **Activity** | userId, action, targetType, targetId, timestamp | Logs of all user actions |

All collections use Mongoose schemas with proper validation, indexes, and references between documents.

---

## 🔐 Authentication Flow

```
┌─────────┐    POST /api/auth/register    ┌──────────┐    Save user     ┌──────────┐
│  Client  │ ──────────────────────────▶   │  Server  │ ──────────────▶  │ MongoDB  │
└─────────┘                               └──────────┘                  └──────────┘
     │                                          │
     │         POST /api/auth/login             │
     │ ──────────────────────────────────────▶   │
     │                                          │
     │         ◀── JWT Token ──────────────────  │
     │                                          │
     │   Store token (cookie/localStorage)      │
     │                                          │
     │   GET /api/protected (Authorization:     │
     │       Bearer <token>) ────────────────▶  │
     │                                          │
     │         ◀── Protected data ─────────────  │
```

1. **Signup** → User submits credentials → Password hashed with bcrypt → User saved to MongoDB
2. **Login** → Credentials verified → JWT token generated and returned
3. **Protected Routes** → Token sent in `Authorization` header → Server verifies with `jsonwebtoken` → Access granted

---

## ⚡ Real-Time Features

### Chat System
- Built on **Socket.io** for bidirectional WebSocket communication
- Users join room channels based on their team ID
- Messages are broadcast to all connected team members instantly
- Message history is persisted in MongoDB and loaded on connect

### Live Updates
- **Task status changes** broadcast to all team members viewing the Kanban board
- **Activity events** pushed in real-time to the dashboard
- **Notifications** delivered instantly when a user is assigned a task or mentioned

### Socket Architecture
```
socketClient.js  →  Connects from browser, emits events (sendMessage, taskUpdate)
socketServer.js  →  Listens on server, broadcasts to rooms, persists data
```

---

## 🖥️ Installation & Setup

### Prerequisites
- **Node.js** v18+ and npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Git**

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/syncspace.git
cd syncspace

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/syncspace
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

```bash
# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📌 Usage

### User Flow

1. **Create an Account** → Sign up with name, email, and password
2. **Join or Create a Team** → Use an invite code or start a new team
3. **Create a Project** → Set up a project within your team workspace
4. **Manage Tasks** → Add tasks to the Kanban board, assign to members, set priorities
5. **Communicate** → Use real-time chat to discuss work with your team
6. **Track Progress** → View the analytics dashboard for stats, activity graphs, and leaderboard

---

## 👥 Team Collaboration (Hackathon Focus)

SyncSpace's modular architecture is designed for **parallel development by 6–8 developers** with minimal merge conflicts.

### How It Works

Each feature is isolated in its own module under `modules/`. A developer owns their module end-to-end:

| Developer | Module | Scope |
|-----------|--------|-------|
| Dev 1 | `modules/auth/` | Login, signup, JWT, auth hooks |
| Dev 2 | `modules/team/` | Team creation, joining, member management |
| Dev 3 | `modules/project/` | Project CRUD, project detail views |
| Dev 4 | `modules/task/` | Kanban board, task CRUD, drag-and-drop |
| Dev 5 | `modules/chat/` | Chat UI, Socket.io client/server |
| Dev 6 | `modules/dashboard/` | Stats, graphs, leaderboard |
| Dev 7 | `modules/activity/` + `modules/notification/` | Activity logger, notification UI |
| Dev 8 | `lib/` + `store/` + `types/` | Database setup, Zustand stores, shared types |

### Ground Rules for Teams
- Each developer works **only inside their assigned module**
- Shared utilities go in `lib/`, `store/`, or `types/` (coordinated by Dev 8)
- API routes in `app/api/` mirror the module they belong to
- Use **feature branches** and **pull requests** for all changes

---

## 🚀 Future Enhancements

| Feature | Description |
|---------|-------------|
| 🤖 **AI Insights** | Smart task suggestions, workload balancing, and productivity tips powered by AI |
| 🔗 **GitHub Integration** | Link commits and PRs directly to tasks, auto-update task status on merge |
| 📹 **Video Calling** | In-app video meetings for team standups and pair programming |
| 📊 **Advanced Analytics** | Sprint velocity charts, burndown graphs, and team health metrics |
| 🏆 **Gamification** | XP system, achievement badges, and milestone rewards for task completion |
| 📱 **Mobile App** | React Native companion app for on-the-go task management |
| 🔄 **CI/CD Integration** | Deployment pipeline status visible in the project dashboard |

---

## 📸 Screenshots

> 📌 *Add screenshots of the application here after building the UI.*

```
[ Landing Page ]  [ Dashboard ]  [ Kanban Board ]  [ Chat Window ]  [ Team View ]
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for hackathons and learning
</p>
