const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { swaggerUi, specs } = require("./swagger");


dotenv.config({ path: __dirname + '/.env' });

const app = express();

// connect DB
connectDB();

// middleware
app.use(express.json());
// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs); 
});

app.use(cors());
app.use(morgan('dev'));

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/reports', require('./routes/report'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀Server running at http://localhost:${PORT}`));
