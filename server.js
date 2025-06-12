const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();

// Port that the webserver listens to
const port = process.env.PORT || 5000;

const server = app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);

// Socket.io setup
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Client's origin
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log('Socket auth - Received token:', token);
  
  if (!token) {
    console.log('Socket auth - No token provided');
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, require("./config/keys").secretOrKey);
    console.log('Socket auth - Token verified, user ID:', decoded.id);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Socket auth - Token verification failed:', err);
    return next(new Error("Authentication error"));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.receiverId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client', 'build')));

// Database configuration
const db = require("./config/keys").mongoURI;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Successfully Connected"))
  .catch((err) => console.log(err));

// Passport middleware
app.use(passport.initialize());
require("./config/passport")(passport);

// Assign socket object to every request
app.use(function (req, res, next) {
  req.io = io;
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/messages", require("./routes/api/messages"));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
}); 