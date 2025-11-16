const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Porta padrão do Vite
  'https://workout.maragojipe.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/strava', require('./routes/strava'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cycling Workout API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;