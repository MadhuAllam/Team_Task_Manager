# Team Task Manager

A full-stack MERN application for managing projects, tasks, and teams with role-based access control.

## 🔗 Live Demo
- **App**: https://team-task-manager.vercel.app
- **API**: https://your-railway-url.railway.app

## ✨ Features
- JWT Authentication (Signup/Login)
- Role-Based Access Control (Admin/Member)
- Project & Team Management
- Task Creation, Assignment & Status Tracking
- Real-time Notifications (Socket.io)
- File Uploads (Cloudinary)
- Automated Overdue Email Alerts (Nodemailer)
- Live Dashboard with Stats

## 🛠️ Tech Stack
| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React.js, Vite, Plain CSS     |
| Backend    | Node.js, Express.js           |
| Database   | MongoDB Atlas, Mongoose       |
| Auth       | JWT, bcrypt                   |
| Realtime   | Socket.io                     |
| Files      | Multer, Cloudinary            |
| Email      | Nodemailer, node-cron         |
| Deploy     | Railway (BE), Vercel (FE)     |

## 🚀 Run Locally

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Git

### Backend
```bash
cd server
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 🔐 Environment Variables

### server/.env
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
EMAIL_USER=xxx@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

## 👤 Test Accounts (Demo)
- **Admin**: admin@demo.com / password123
- **Member**: member@demo.com / password123

## 📁 Project Structure
```
team-task-manager/
├── client/          ← React Frontend
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
└── server/          ← Express Backend
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── jobs/
    └── socket/
```

## 🐛 Known Bugs Fixed
| Bug | Fix |
|-----|-----|
| MongoDB ECONNREFUSED ::1 | Changed to 127.0.0.1 |
| Vite plugin incompatible | Upgraded to plugin-react@latest |
| CORS blocked port 5174 | Dynamic port whitelist |
| dotenv v17 caching | Downgraded to dotenv@16 |
