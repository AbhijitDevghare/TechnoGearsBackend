require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

const app = express();

// -------------------------------------------
// EXPRESS CORS: Single, recommended configuration.
// FIX: Corrected the origin URL to include the hyphen in 'gears-frontend'.
// -------------------------------------------
app.use(
  cors({
    origin: ["https://techno-gears-frontend.vercel.app","http://localhost:5173"] ,// <--- CORRECTED HYPHEN HERE
    credentials: true, // Allows cookies and authorization headers to be sent
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Specify allowed methods
    preflightContinue: false,
    optionsSuccessStatus: 204 // Use 204 No Content for successful OPTIONS response
  })
);

// BODY PARSERS
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES
// Serves files from the 'Images' directory under the /Images route
app.use("/Images", express.static(path.join(__dirname, "Images")));

// Request Logger
app.use(morgan("dev"));

// DB CONNECTION
const connectToDb = require("./config/configDb.js");
connectToDb();

// ROUTES
const routes = require("./routers/v1/");
app.use("/api/v1", routes);

// ERROR HANDLER
const errorMiddleware = require("./middleware/error.middleware.js");
app.use(errorMiddleware);

module.exports = app;