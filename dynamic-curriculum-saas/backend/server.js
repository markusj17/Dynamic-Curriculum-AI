require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const stripeRoutes = require('./routes/stripeRoutes');

const app = express();


const allowedOrigins = [
  'http://localhost:5173',
];


if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log(`[CORS] Allowing origin: ${origin || 'No Origin (Allowed)'}`);
      callback(null, true);
    } else {
      console.error(`[CORS] Blocking origin: ${origin}. Not in allowed list: ${allowedOrigins.join(', ')}`);
      callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    }
  },
  credentials: true, 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use('/api/stripe/webhook', express.raw({type: 'application/json'}));

app.use(express.json()); 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/stripe', stripeRoutes);

// Basic error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err);
    // Check if it's a CORS error from our custom origin function
    if (err.message && err.message.startsWith('CORS policy does not allow access')) {
        return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: 'Something broke', error: err.message });
});

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(async () => { // Made this async
    console.log('Database connection has been established successfully.');

    if (process.env.NODE_ENV === 'development') {

      // await sequelize.sync({ force: true }); drops tables
      await sequelize.sync({ alter: true });
      console.log("All models were synchronized successfully (alter:true).");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database or sync models:', err);
  });