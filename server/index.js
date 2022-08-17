if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookie = require("cookie-parser");

const credentials = require("./middleware/credentials");
const { logger } = require("./middleware/logEvents");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");

const app = express();

// log event
app.use(logger);
app.use(credentials);

// server config
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookie());

// routes
app.use("/auth", require("./router/auth"));
// protect routes
app.use(verifyJWT);
app.use("/users", require("./router/user"));

// Error handler
app.use((err, req, res, next) => {
  const stat = err.status || 500;
  const msg = err.message || "Someting went wrong!";
  return res.status(stat).json({
    success: false,
    message: msg,
    stack: err.stack,
  });
});

// Error log
app.use(errorHandler);

// db connection
const PORT = process.env.PORT;
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(PORT, () => console.log("Backend Setup on port ", PORT));
});
