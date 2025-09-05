const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const { sendContactEmail } = require("../utils/emailService");

// --- Redirección de Idioma ---
router.get("/", (req, res) => {
  res.redirect("/es");
});

// --- Rutas de Página con Prefijo de Idioma ---

// Página de Inicio
router.get("/:lng(es|en)", (req, res) => {
  res.render("index", {
    title: req.t("nav.home"),
    currentPath: req.path,
    originalUrl: req.originalUrl,
  });
});

// Página Sobre Mí
router.get("/:lng(es|en)/about", (req, res) => {
  res.render("about", {
    title: req.t("nav.about"),
    currentPath: req.path,
    originalUrl: req.originalUrl,
  });
});

// Página de Servicios
router.get("/:lng(es|en)/servicios", (req, res) => {
  res.render("servicios", {
    title: req.t("nav.services"),
    currentPath: req.path,
    originalUrl: req.originalUrl,
  });
});

// Página de Casos de Éxito
router.get("/:lng(es|en)/casos-de-exito", (req, res) => {
  res.render("casos-de-exito", {
    title: req.t("nav.caseStudies"),
    currentPath: req.path,
    originalUrl: req.originalUrl,
  });
});

// Página de Contacto (GET)
router.get("/:lng(es|en)/contact", (req, res) => {
  const status = req.query.status;
  let messageSent = null;
  let messageText = "";

  if (status === "success") {
    messageSent = true;
    messageText = req.t("contactPage.messages.success");
  } else if (status === "error") {
    messageSent = false;
    messageText = req.t("contactPage.messages.error");
  } else if (status === "validation_error") {
    messageSent = false;
    messageText = req.t("validation.generalError");
  }

  res.render("contact", {
    title: req.t("nav.contact"),
    currentPath: req.path,
    originalUrl: req.originalUrl,
    messageSent: messageSent,
    messageText: messageText,
    formData: {}, // Siempre vaciamos el formulario al cargar
    errors: [],
  });
});

// --- Manejo del Formulario de Contacto ---
const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message:
    "Demasiados envíos desde esta IP, por favor intente de nuevo en 15 minutos.",
  standardHeaders: true,
  legacyHeaders: false,
});

const contactFormValidationRules = (t) => [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage(t("validation.nameRequired"))
    .escape(),
  body("email")
    .isEmail()
    .withMessage(t("validation.emailInvalid"))
    .normalizeEmail(),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage(t("validation.messageRequired"))
    .escape(),
];

router.post(
  "/contact",
  contactFormLimiter,
  (req, res, next) => {
    const rules = contactFormValidationRules(req.t);
    Promise.all(rules.map((validation) => validation.run(req))).then(() =>
      next()
    );
  },
  async (req, res) => {
    const errors = validationResult(req);
    const { name, email, message } = req.body;
    const subject = "Nuevo Envío de Formulario desde el Portafolio";
    const currentLang = req.body.lang || "es";
    const contactUrl = `/${currentLang}/contact`;

    if (!errors.isEmpty()) {
      return res.render("contact", {
        title: req.t("nav.contact"),
        currentPath: contactUrl,
        originalUrl: contactUrl,
        messageSent: false,
        messageText: null,
        formData: req.body,
        errors: errors.array(),
      });
    }

    try {
      await sendContactEmail({ name, email, subject, message });
      // CORRECCIÓN: Usar directamente contactUrl
      res.redirect(`${contactUrl}?status=success`);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      // CORRECCIÓN: Usar directamente contactUrl
      res.redirect(`${contactUrl}?status=error`);
    }
  }
);

module.exports = router;
