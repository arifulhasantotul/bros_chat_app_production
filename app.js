// external imports
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const path = require("path");
const moment = require("moment");
const http = require("http");
const cookieParser = require("cookie-parser");

// internal imports
const loginRouter = require("./routers/loginRouter");
const usersRouter = require("./routers/usersRouter");
const inboxRouter = require("./routers/inboxRouter");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/common/errorhandler");

// initialization
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// socket server
const io = require("socket.io")(server);
global.io = io; // adding socket io to global var

// set moment as app locals
app.locals.moment = moment;

// database connection
mongoose
  .connect(process.env.MONGOS_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoose connection successful!"))
  .catch((err) => console.log(err));

// request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set view engine
app.set("view engine", "ejs");

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// parse cookies
app.use(cookieParser(process.env.COOKIE_SECRET));

// router setup
app.use("/", loginRouter);
app.use("/users", usersRouter);
app.use("/inbox", inboxRouter);

// notFoundHandler
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

server.listen(port, () => {
  console.log("Chat application server running on", port);
});
