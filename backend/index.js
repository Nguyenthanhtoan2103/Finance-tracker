const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { swaggerUi, specs } = require("./swagger");
const rateLimit = require('express-rate-limit');
const http = require('http');         // <-- thêm
const { Server } = require('socket.io'); // <-- thêm

dotenv.config({ path: __dirname + '/.env' });

const app = express();
const server = http.createServer(app); // <-- dùng http server thay cho app.listen

// connect DB
connectDB();

// middleware
app.use(express.json());

// Rate Limiter: giới hạn 60 request / 1 phút / IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 60,
  message: { status: 429, message: "Too many requests, please try again later." },
});
app.use(limiter);

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
app.use('/api/budgets', require('./routes/budget'));

// --- Socket.IO setup ---
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://www.ftracker.site/"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("⚡ A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);
  });
});

// --- Gắn io vào app để controller có thể emit ---
app.set("io", io);

const PORT = process.env.PORT || 80;
server.listen(PORT, '0.0.0.0', () =>
 console.log(`🚀 Server running at http://0.0.0.0:${PORT}`)

);
