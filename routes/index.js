const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { sendContactEmail } = require("../utils/emailService"); // Import our new service

// Home page
router.get("/", (req, res) => {
  res.render("index", {
    title: "Consultor de Operaciones y Comercio Digital",
    currentPath: req.path,
  });
});

// About page
router.get("/about", (req, res) => {
  res.render("about", { title: "Sobre Mí", currentPath: req.path });
});

// Services page
router.get("/servicios", (req, res) => {
  res.render("servicios", { title: "Servicios", currentPath: req.path });
});

// Case Studies page
router.get("/casos-de-exito", (req, res) => {
  res.render("casos-de-exito", {
    title: "Casos de Éxito",
    currentPath: req.path,
  });
});

router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contacto",
    messageSent: null,
    formData: {},
    errors: [], // Initialize errors array
    currentPath: req.path,
  });
});

// --- Contact Form Handling ---

// 1. Rate Limiter: a basic security measure to prevent spam/brute-force attacks
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 form submissions per windowMs
  message:
    "Too many submissions from this IP, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Validation Rules for the contact form
const contactFormValidationRules = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("El nombre debe tener al menos 2 caracteres.")
    .escape(),
  body("email")
    .isEmail()
    .withMessage(
      "Por favor, ingrese una dirección de correo electrónico válida."
    )
    .normalizeEmail(),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("El mensaje debe tener al menos 10 caracteres.")
    .escape(),
];

// 3. The POST route with rate limiting, validation, and the new email service
router.post(
  "/contact",
  contactFormLimiter,
  contactFormValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    const { name, email, message } = req.body;
    const subject = "New Contact Form Submission from Portfolio";

    if (!errors.isEmpty()) {
      return res.render("contact", {
        title: "Contacto",
        messageSent: false,
        messageText:
          res.message || "Por favor, corrija los errores en el formulario.",
        formData: req.body,
        errors: errors.array(), // Pass errors to the template
      });
    }

    try {
      await sendContactEmail({ name, email, subject, message });

      res.render("contact", {
        title: "Contacto",
        messageSent: true,
        messageText:
          "¡Gracias por su mensaje! Me pondré en contacto con usted pronto.",
        formData: {},
        errors: [],
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.render("contact", {
        title: "Contacto",
        messageSent: false,
        messageText:
          "Lo sentimos, hubo un error al enviar su mensaje. Por favor, intente de nuevo más tarde.",
        formData: req.body,
        errors: [],
      });
    }
  }
);

module.exports = router;
