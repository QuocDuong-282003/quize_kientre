const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const quizRoutes = require('./routers/quizRoutes');
const authRoutes = require('./routers/authRoutes');
const adminRoutes = require('./routers/adminRoutes');

dotenv.config();

const app = express();
connectDB();

// Auto-seed on startup
const seedData = async () => {
  try {
    const Question = require('./models/Question');
    const Exam = require('./models/Exam');
    const count = await Question.countDocuments();
    if (count === 0) {
      console.log('Seeding database...');
      require('./seed');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

setTimeout(seedData, 2000);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Allow Vercel preview/custom domains by suffix match
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow non-browser requests
  if (allowedOrigins.includes(origin)) return true;
  // Accept any *.vercel.app domain
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server on port ${PORT}`));