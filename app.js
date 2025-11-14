require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path');


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: "https://techno-gears-frontend.vercel.app",
  credentials: true,
}));

// Fix OPTIONS preflight
app.options("*", cors({
  origin: "https://techno-gears-frontend.vercel.app",
  credentials: true,
}));

// Static
app.use('/Images', express.static(path.join(__dirname, "Images")));

// Logger
app.use(morgan('dev'));

// DB
connectToDb();

// Routes
app.use('/api/v1', routes);

// Error Handler
app.use(errorMiddleware);

module.exports = app;
