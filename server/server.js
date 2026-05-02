const dotenv = require('dotenv');
dotenv.config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');

const connectDB             = require('./db/connect');
const authRoutes            = require('./routes/authRoutes');
const projectRoutes         = require('./routes/projectRoutes');
const taskRoutes            = require('./routes/taskRoutes');
const dashboardRoutes       = require('./routes/dashboardRoutes');
const uploadRoutes          = require('./routes/uploadRoutes');
const notificationRoutes    = require('./routes/notificationRoutes');
const emailRoutes           = require('./routes/emailRoutes');
const { initSocket }        = require('./socket/socketHandler');
const { startOverdueEmailJob } = require('./jobs/overdueEmailJob');

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Make io accessible in controllers
app.set('io', io);

connectDB();
startOverdueEmailJob();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/tasks',         uploadRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email',         emailRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
