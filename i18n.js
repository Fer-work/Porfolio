// i18n.js
const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "es", // Fallback to Spanish if language is not detected
    backend: {
      loadPath: "./locales/{{lng}}/translation.json", // Path to your translation files
    },
    detection: {
      order: ["path", "querystring", "cookie", "header"],
      caches: ["cookie"],
    },
    preload: ["es", "en"], // Preload both languages
  });

module.exports = i18next;
