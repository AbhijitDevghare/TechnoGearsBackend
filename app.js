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
app.use(
  cors({
    origin: "https://techno-gears-frontend.vercel.app",
    credentials: true,
  })
);

// ✔ Preflight
app.options(
  "*",
  cors({
    origin: "https://techno-gears-frontend.vercel.app",
    credentials: true,
  })
);

// -------------------------------------------
// OTHER MIDDLEWARE AFTER CORS
// -------------------------------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/Images', express.static(path.join(__dirname, "Images")));

app.use(morgan("dev"));

// DB
connectToDb();

// ROUTES
app.use("/api/v1", routes);

// ERROR HANDLER
app.use(errorMiddleware);

module.exports = app;
