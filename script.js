/* Summit Digital website interactions and contact form. */
"use strict";

// Paste the deployed Google Apps Script Web App URL here before publishing.
const CONTACT_API_URL = "https://script.google.com/macros/s/AKfycbxwraUmrYNRmvox6RMeQ4fNoz33dqrglP5IkH5D8OxkzI56NzuE9X3-2u--pa4LkBw3/exec";

// Footer year.
const currentYear = document.getElementById("current-year");
if (currentYear) currentYear.textContent = new Date().getFullYear();

// Mobile navigation.
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function closeMenu() {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });
  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

// Scroll reveal and decorative growth chart.
const revealElements = document.querySelectorAll(".reveal");
const growthChart = document.getElementById("growth-chart");
function showGrowthChart() {
  if (!growthChart) return;
  growthChart.querySelectorAll("i[data-height]").forEach((bar) => {
    bar.style.height = `${bar.dataset.height}%`;
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      if (entry.target.classList.contains("growth-panel")) showGrowthChart();
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
  showGrowthChart();
}

// JSONP contact submission. This avoids browser CORS preflight requests.
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalButtonHTML = submitButton ? submitButton.innerHTML : "";
  const fieldRules = {
    name: { message: "Please enter your name.", test: (v) => v.length >= 2 },
    email: { message: "Please enter a valid email address.", test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    message: { message: "Please enter a message.", test: (v) => v.length >= 5 }
  };

  function setStatus(message, isError) {
    formStatus.textContent = message;
    formStatus.hidden = false;
    formStatus.classList.toggle("is-error", Boolean(isError));
    formStatus.classList.toggle("is-success", !isError);
    formStatus.focus();
  }

  function validate() {
    let valid = true;
    Object.entries(fieldRules).forEach(([id, rule]) => {
      const field = document.getElementById(id);
      const error = document.getElementById(`${id}-error`);
      if (!field) return;
      const ok = rule.test(field.value.trim());
      if (error) error.textContent = ok ? "" : rule.message;
      field.setAttribute("aria-invalid", String(!ok));
      if (!ok) valid = false;
    });
    if (!valid) contactForm.querySelector('[aria-invalid="true"]')?.focus();
    return valid;
  }

  Object.keys(fieldRules).forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.addEventListener("input", () => {
      const rule = fieldRules[id];
      const error = document.getElementById(`${id}-error`);
      const ok = rule.test(field.value.trim());
      if (error && ok) error.textContent = "";
      field.setAttribute("aria-invalid", String(!ok));
    });
  });

  function sendJsonp(payload) {
    return new Promise((resolve, reject) => {
      if (!CONTACT_API_URL.startsWith("https://script.google.com/macros/s/")) {
        reject(new Error("Contact form setup is incomplete. The website owner must add the deployed Apps Script URL in script.js."));
        return;
      }

      const callbackName = `summitContactCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const params = new URLSearchParams({ ...payload, callback: callbackName });
      let finished = false;

      const cleanup = () => {
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        window.clearTimeout(timeoutId);
      };
      const finish = (fn, value) => {
        if (finished) return;
        finished = true;
        cleanup();
        fn(value);
      };

      window[callbackName] = (result) => finish(resolve, result);
      script.onerror = () => finish(reject, new Error("Could not reach Google Apps Script. Check its deployment URL and access settings."));
      const timeoutId = window.setTimeout(() => {
        finish(reject, new Error("The request timed out. Please try again."));
      }, 20000);
      script.src = `${CONTACT_API_URL}?${params.toString()}`;
      document.head.appendChild(script);
    });
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.hidden = true;
    if (!validate()) return;

    const data = new FormData(contactForm);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      service: String(data.get("service") || "").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || "").trim()
    };

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending request...";
    }

    try {
      const result = await sendJsonp(payload);
      if (!result || result.ok !== true) throw new Error(result?.message || "The email could not be sent.");
      contactForm.reset();
      Object.keys(fieldRules).forEach((id) => {
        const field = document.getElementById(id);
        const error = document.getElementById(`${id}-error`);
        if (field) field.setAttribute("aria-invalid", "false");
        if (error) error.textContent = "";
      });
      setStatus("Thank you! Your request has been sent successfully. We will contact you soon.", false);
    } catch (error) {
      console.error("Summit Digital form error:", error);
      setStatus(error.message || "We could not send your request. Please email summitdigital.contact@gmail.com.", true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML;
      }
    }
  });
}
