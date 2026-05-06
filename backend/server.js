const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const dotenv     = require('dotenv');
const cors       = require('cors');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { generalLimiter, authLimiter } = require('./middleware/rateLimitMiddleware');

const authRoutes     = require('./Routes/authRoutes');
const faqRoutes      = require('./Routes/faqRoutes');
const chatRoutes     = require('./Routes/chatRoutes');
const scraperRoutes  = require('./Routes/scraperRoutes');
const passwordRoutes = require('./Routes/passwordRoutes');
const agentRoutes    = require('./Routes/agentRoutes');
const adminRoutes    = require('./Routes/adminRoutes');
const { initSocket } = require('./socket/chatSocket');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Local frontend URL now, live frontend URL later
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

initSocket(io);

// Middleware
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());
app.use(generalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Chat API is running...');
});

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});