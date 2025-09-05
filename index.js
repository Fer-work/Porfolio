const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const indexRoutes = require("./routes/index"); // Assuming your portfolio routes are in index.js
const i18next = require("./i18n"); // Require your i18n configuration
const i18nextMiddleware = require("i18next-http-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

app.use(i18nextMiddleware.handle(i18next));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "assets")));

// Mount routes
app.use("/", indexRoutes); // Mount your portfolio routes

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}.`);
});

module.exports = app;
