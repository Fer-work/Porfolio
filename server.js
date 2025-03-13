const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const indexRoutes = require("./routes/index"); // Assuming your portfolio routes are in index.js
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/", indexRoutes); // Mount your portfolio routes

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}.`);
});

module.exports = app;
