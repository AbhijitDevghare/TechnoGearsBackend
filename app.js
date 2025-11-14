require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// -------------------------------------------
// ✔ CORS MUST BE FIRST
// -------------------------------------------
const corsOptions = {
  origin: "https://techno-gears-frontend.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// -------------------------------------------
// OTHER MIDDLEWARE
// -------------------------------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/Images", express.static(path.join(__dirname, "Images")));
app.use(morgan("dev"));

connectToDb();

// ROUTES
app.use("/api/v1", routes);

// ERROR HANDLER
app.use(errorMiddleware);

module.exports = app;
