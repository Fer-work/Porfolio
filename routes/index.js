const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer"); // If you are using email.

// Home page
router.get("/", (req, res) => {
  res.render("index", { pageTitle: "Home Page" });
});

// About page
router.get("/about", (req, res) => {
  res.render("about", { pageTitle: "About Me" });
});

// Contact page
router.get("/contact", (req, res) => {
  res.render("contact", { pageTitle: "Contact Me" });
});

// Projects page (example without database)
router.get("/projects", (req, res) => {
  const projects = [
    {
      title: "Project 1",
      description: "This is project 1.",
      image: "/images/project1.png",
    },
    {
      title: "Project 2",
      description: "This is project 2.",
      image: "/images/project2.png",
    },
  ];
  res.render("projects", { pageTitle: "My Projects", projects: projects });
});

// Example route for handling contact form submissions (using nodemailer)
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Configure nodemailer
    let transporter = nodemailer.createTransport({
      service: "Gmail", // e.g., 'Gmail'
      auth: {
        user: "fer.work117@gmail.com",
        pass: "your-email-password",
      },
    });

    // Send the email
    await transporter.sendMail({
      from: email,
      to: "your-email@example.com",
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.send("Thank you for your message!"); // or redirect to a success page
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("An error occurred while sending your message.");
  }
});

module.exports = router;
