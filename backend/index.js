// const dotenv = require('dotenv');
// dotenv.config({ path: __dirname + '/.env' }); // load biến môi trường trước passport

// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const connectDB = require('./config/db');
// const { swaggerUi, specs } = require("./swagger");
// const rateLimit = require('express-rate-limit');
// const http = require('http');
// const { Server } = require('socket.io');
// const session = require("express-session");
// const passport = require("passport");

// // Debug env
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

// // Passport config
// require("./config/passport");

// const app = express();
// const server = http.createServer(app);

// // Connect DB
// connectDB();

// // --- Middleware ---
// app.use(cors({
//   origin: "http://www.ftracker.site", // frontend origin
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true
// }));
// app.use(express.json());
// app.use(morgan('dev'));

// // Session (cho Passport OAuth2)
// app.use(session({
//   secret: process.env.SESSION_SECRET || "mysecret",
//   resave: false,
//   saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// // Rate limiter
// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 60,
//   message: { status: 429, message: "Too many requests, please try again later." },
// });
// app.use(limiter);
// // --- io ---
// app.use((req, res, next) => {
//   req.io = io;
//   next();
// });
// // --- Swagger Docs ---
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
// app.get("/api-docs.json", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   res.send(specs);
// });

// // --- Routes ---
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/user'));
// app.use('/api/transactions', require('./routes/transaction'));
// app.use('/api/reports', require('./routes/report'));
// app.use('/api/budgets', require('./routes/budget'));

// // --- Socket.IO setup ---
// const io = new Server(server, {
//   cors: {
//     origin: "http://www.ftracker.site", // chỉ cho frontend domain
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   }
// });

// io.on("connection", (socket) => {
//   console.log("⚡ A user connected:", socket.id);

//   // lấy userId từ query string
//   const { userId } = socket.handshake.query;
//   if (userId) {
//     socket.join(userId);
//     console.log(`📌 User ${userId} joined room`);
//   }

//   socket.on("disconnect", () => {
//     console.log("❌ A user disconnected:", socket.id);
//   });
// });


// // --- Start server ---
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, '0.0.0.0', () =>
//   console.log(`🚀 Server running at http://www.ftracker.site:${PORT}`)
// );
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { swaggerUi, specs } = require("./swagger");
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const session = require("express-session");
const passport = require("passport");

// Debug env
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

// Passport config
require("./config/passport");

const app = express();
const server = http.createServer(app);

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: "http://www.ftracker.site", // frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
});

// Gắn io vào req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  // lấy userId từ query string
  const { userId } = socket.handshake.query;
  if (userId) {
    socket.join(userId);
    console.log(`📌 User ${userId} joined room`);
  }

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// --- Connect DB ---
connectDB();

// --- Middleware ---
app.use(cors({
  origin: "http://www.ftracker.site",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Session (cho Passport OAuth2)
app.use(session({
  secret: process.env.SESSION_SECRET || "mysecret",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { status: 429, message: "Too many requests, please try again later." },
});
app.use(limiter);

// --- Swagger Docs ---
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/transactions', require('./routes/transaction'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/budgets', require('./routes/budget'));

// --- Start server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Server running at http://www.ftracker.site:${PORT}`)
);
