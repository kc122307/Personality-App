require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const app = express();

// ✅ Middleware for JSON & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ✅ Debugging Middleware (Logs Incoming Requests)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// ✅ Connect to MongoDB with Error Handling
connectDB()
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => {
    console.error('🔥 MongoDB Connection Error:', err.message);
    process.exit(1); // Stop server if DB connection fails
  });

// ✅ Import Routes
app.use('/api/auth', require('./routes/auth.js')); // Authentication routes
app.use('/api/results', require('./routes/results.js')); // Test results routes

// ✅ Default Route
app.get('/', (req, res) => {
  res.send('🚀 API is running...');
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Server error' });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
