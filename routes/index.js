const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
// dotenv should be required in your main app index.js, so it's available here via process.env

// Home page - REMEMBER to change pageTitle to title
router.get("/", (req, res) => {
  res.render("index", { title: "Home Page" }); // Changed to title
});

// About page - REMEMBER to change pageTitle to title
router.get("/about", (req, res) => {
  res.render("about", { title: "About Me" }); // Changed to title
});

// Contact page - REMEMBER to change pageTitle to title
router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Me", // Use 'title'
    messageSent: null, // To initialize for the EJS template
    formData: {}, // Initialize formData as an empty object
  });
});

// Projects page - Disabled for now for lack of projects, will improve as projects are added.
// router.get("/projects", (req, res) => {
//   const projects = [
//     {
//       title: "Dragon Focus",
//       description:
//         "A productivity app based on the pomodoro technique + gamified features",
//       image: "/Quetzal.png",
//     },
//     {
//       title: "Project 2",
//       description: "This is project 2.",
//       image: "/images/project2.png",
//     },
//   ];
//   res.render("projects", { title: "My Projects", projects: projects }); // Changed to title
// });

// Handle contact form submission
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body; // 'subject' is no longer destructured here
  const subject = req.body.subject || "New Contact Form Submission"; // Use subject if provided, or a default

  // Basic validation
  if (!name || !email || !message) {
    return res.render("contact", {
      title: "Contact Me",
      messageSent: false,
      messageText: "Please fill in all required fields (Name, Email, Message).",
      formData: req.body,
    });
  }

  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: process.env.MY_EMAIL,
      subject: subject, // Using the 'subject' variable (either from form or default)
      text: `You have a new message from:\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.render("contact", {
      title: "Contact Me",
      messageSent: true,
      messageText: "Thank you for your message! I'll get back to you soon.",
      formData: {}, // Clear form data on success
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.render("contact", {
      title: "Contact Me",
      messageSent: false,
      messageText:
        "Sorry, there was an error sending your message. Please try again later.",
      formData: req.body, // Send back form data on error
    });
  }
});

module.exports = router;
