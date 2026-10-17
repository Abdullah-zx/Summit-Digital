/* ==========================================================
   Summit Digital website interactions
   Keep interactive behavior in this file, separate from CSS.
   ========================================================== */

// Add a class immediately so page content remains visible if scripts run.
document.documentElement.classList.remove("no-js");

// 1. Keep the footer year current automatically.
const currentYear = document.getElementById("current-year");
if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// 2. Mobile navigation: open/close the menu and update accessibility state.
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  // Close the mobile menu after a visitor selects a navigation link.
  navLinks.addEventListener("click", (event) => {
    const clickedLink = event.target.closest("a");

    if (clickedLink) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    }
  });

  // Close the menu with Escape for keyboard users.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
    }
  });
}

// 3. Reveal section content as it enters the viewport.
// If IntersectionObserver is unsupported, reveal everything immediately.
const revealElements = document.querySelectorAll(".reveal");
const growthChart = document.getElementById("growth-chart");

function showGrowthChart() {
  if (!growthChart) return;

  growthChart.querySelectorAll("i[data-height]").forEach((bar) => {
    bar.style.height = `${bar.dataset.height}%`;
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        // Animate the decorative bar chart only when its panel is in view.
        if (entry.target.classList.contains("growth-panel")) {
          showGrowthChart();
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
  showGrowthChart();
}

// 4. Contact form validation and email delivery through FormSubmit.
// FormSubmit requires the recipient to confirm/activate the first submission.
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm && formStatus) {
  const recipientEmail = "summitdigital.contact@gmail.com";

  // Return true when the field is valid, otherwise display its error message.
  function validateField(fieldId, errorMessage, validator) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (!field || !errorElement) return true;

    const isValid = validator(field.value.trim());
    errorElement.textContent = isValid ? "" : errorMessage;
    field.setAttribute("aria-invalid", String(!isValid));
    return isValid;
  }

  // Clear field errors as the visitor edits their information.
  ["name", "email", "message"].forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.addEventListener("input", () => {
      const errorElement = document.getElementById(`${fieldId}-error`);
      if (errorElement) errorElement.textContent = "";
      field.setAttribute("aria-invalid", "false");
    });
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.hidden = true;

    const isNameValid = validateField(
      "name", "Please enter your name.", (value) => value.length > 0
    );
    const isEmailValid = validateField(
      "email", "Please enter a valid email address.",
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    );
    const isMessageValid = validateField(
      "message", "Please enter a message.", (value) => value.length > 0
    );

    if (!isNameValid || !isEmailValid || !isMessageValid) {
      contactForm.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.innerHTML;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending request...";
    }

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      const result = await response.json();

      if (!response.ok || result.success !== "true" && result.success !== true) {
        throw new Error(result.message || "The form service could not accept this request.");
      }

      contactForm.reset();
      formStatus.textContent = "Thank you! Your audit request has been submitted. We’ll get back to you soon.";
      formStatus.hidden = false;
      formStatus.focus();
    } catch (error) {
      formStatus.textContent = "We couldn’t submit your request. Please email summitdigital.contact@gmail.com directly or try again.";
      formStatus.hidden = false;
      formStatus.focus();
      console.error("Contact form submission failed:", error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText || 'Request Free Audit <span aria-hidden="true">→</span>';
      }
    }
  });
}
