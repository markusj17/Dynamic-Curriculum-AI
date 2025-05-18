require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const stripeController = require('./controllers/stripeController');
const otherStripeRoutes = require('./routes/stripeRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5174',
  'https://teal-faloodeh-121965.netlify.app/',
];
let clientUrlFromEnv = process.env.CLIENT_URL;
if (clientUrlFromEnv) {
    clientUrlFromEnv = clientUrlFromEnv.replace(/\/$/, "");
    if (!allowedOrigins.includes(clientUrlFromEnv)) {
        allowedOrigins.push(clientUrlFromEnv);
    }
}
console.log("[CORS] Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), stripeController.stripeWebhook);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/stripe', otherStripeRoutes);

app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err.message, err.originalErrorName ? `(Original: ${err.originalErrorName} - ${err.originalErrorMessage})` : '', err.stack ? `\nStack (short): ${err.stack.substring(0,500)}` : '');
    if (res.headersSent) {
      return next(err); // Delegate to default Express error handler if headers already sent
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ 
        message: message,
        // Optionally include error type or details in dev mode
        ...(process.env.NODE_ENV === 'development' && { errorType: err.name, originalError: err.originalErrorName })
    });
});

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(async () => {
    console.log('Database connection has been established successfully.');
    if (process.env.NODE_ENV === 'development') {
      try {
        // CAUTION: { force: true } will drop all tables. Use { alter: true } or migrations in prod/later dev.
        await sequelize.sync({ alter: true }); 
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