require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

const app = express();

// -------------------------------------------
// OVERRIDE VERCEL HEADERS (IMPORTANT)
// -------------------------------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://techno-gears-frontend.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// -------------------------------------------
// EXPRESS CORS (SECONDARY)
// -------------------------------------------
app.use(cors({
  origin: "https://techno-gears-frontend.vercel.app",
  credentials: true,
}));

// BODY PARSERS
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
app.use('/Images', express.static(path.join(__dirname, "Images")));

app.use(morgan('dev'));

const connectToDb = require('./config/configDb.js');
connectToDb();

const routes = require("./routers/v1/");
app.use('/api/v1', routes);

const errorMiddleware = require("./middleware/error.middleware.js");
app.use(errorMiddleware);

module.exports = app;
