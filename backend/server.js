const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/ask-pawly', require('./routes/askPawlyRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/feedbacks', require('./routes/feedbackRoutes'));
app.use('/api/pets/:petId/health', require('./routes/healthRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.send('Pet Management API is running...');
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
