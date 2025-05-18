require('dotenv').config(); // For local development, loads .env from backend/
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); // Or from './config/db'

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const stripeController = require('./controllers/stripeController');
const otherStripeRoutes = require('./routes/stripeRoutes');

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5174',
  'https://teal-faloodeh-121965.netlify.app/',

];
let clientUrlFromEnv = process.env.CLIENT_URL;
if (clientUrlFromEnv) {
    clientUrlFromEnv = clientUrlFromEnv.replace(/\/$/, ""); // Normalize
    if (!allowedOrigins.includes(clientUrlFromEnv)) {
        allowedOrigins.push(clientUrlFromEnv);
    }
}
console.log("[CORS] Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      console.log(`[CORS] Allowing origin: ${origin || 'No Origin (Allowed)'}`);
      callback(null, true);
    } else {
      console.error(`[CORS] Blocking origin: ${origin}. Not in allowed list.`);
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// --- Stripe Webhook Route (MUST BE BEFORE express.json() for raw body) ---
// This specific route needs the raw body for signature verification.
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), stripeController.stripeWebhook);

// --- General Middleware ---
// General JSON parser for all other routes
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/learning-paths', learningPathRoutes);
// Use otherStripeRoutes for all /api/stripe routes *except* the webhook
app.use('/api/stripe', otherStripeRoutes);

// --- Error Handler ---
app.use((err, req, res, next) => {
    console.error("Unhandled error in Express:", err.message, err.stack ? `\nStack: ${err.stack}` : '');
    if (err.message && err.message.startsWith('CORS policy does not allow access')) {
        return res.status(403).json({ message: err.message });
    }
    // If error has a status code (like from Stripe SDK errors), use it
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ message: err.message || 'Internal Server Error', error: err.name || 'Error' });
});


// --- Server Start & DB Sync ---
const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(async () => {
    console.log('Database connection has been established successfully.');
    if (process.env.NODE_ENV === 'development') {
      try {
        await sequelize.sync({ alter: true }); // Use with caution, check previous discussions
        console.log("All models were synchronized successfully (alter:true).");
      } catch (syncError) {
        console.error("Error during model synchronization:", syncError);
      }
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database or initial sync failed:', err);
  });