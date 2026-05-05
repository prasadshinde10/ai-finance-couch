const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const goalRoutes = require('./routes/goalRoutes');
const scheduleWeeklyReports = require('./jobs/weeklyReport');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/goals', goalRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use(errorHandler);

const { MONGO_URI, PORT = 5000 } = process.env;

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Please add it to your environment.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    scheduleWeeklyReports();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
