require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const massive = require("massive");

const ctrl = require("./controller");

const app = express();

app.use(express.json());

const { SERVER_PORT, CONNECTION_STRING, SESSION_SECRET } = process.env;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

massive({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
})
  .then((db) => {
    app.set("db", db);
    console.log("Database connection established");
  })
  .catch((err) => console.log(err));

// authentication endpoints
app.post("/auth/signup", ctrl.signup);
app.post("/auth/login", ctrl.login);
app.get("/auth/logout", ctrl.logout);
app.get("/auth/user", ctrl.user);

app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`);
});
