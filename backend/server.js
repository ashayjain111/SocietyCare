require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Trust proxy (needed on Railway / Render / Vercel)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SocietyCare API Docs',
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/service-requests', require('./routes/serviceRequests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chatbot', require('./routes/chatbot'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
async function start() {
  // Try database connection (non-blocking — server starts regardless)
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');

    // Dev: alter syncs schema changes. Prod: create-if-not-exists only.
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await db.sequelize.sync(syncOptions);
    console.log('Database synced.');
  } catch (error) {
    console.warn('Database connection failed:', error.message);
    console.warn('Server will start without database. API calls requiring DB will fail.');
  }

  // Initialize Firebase (optional)
  try {
    const { initializeFirebase } = require('./config/firebase');
    initializeFirebase();
  } catch (e) {
    console.warn('Firebase init skipped');
  }

  app.listen(PORT, () => {
    console.log(`SocietyCare API running on port ${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api/docs`);
  });
}

start();

module.exports = app;
