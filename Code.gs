/**
 * Summit Digital contact form backend.
 * Deploy this file as a Google Apps Script Web App.
 * The website calls doGet() using JSONP, so browser CORS preflight is avoided.
 */
const RECIPIENT_EMAIL = "summitdigital.contact@gmail.com";
const AGENCY_NAME = "Summit Digital";

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const callback = String(params.callback || "");

  // Only allow a simple JavaScript callback identifier, never arbitrary code.
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService.createTextOutput("Invalid callback")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  let result;
  try {
    result = processContactRequest_(params);
  } catch (error) {
    console.error(error);
    result = { ok: false, message: "The server could not process your request. Please try again later." };
  }

  const output = `${callback}(${JSON.stringify(result)});`;
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function processContactRequest_(p) {
  // Honeypot field. Real visitors should leave this blank.
  if (String(p.website || "").trim() !== "") {
    return { ok: true, message: "Request received." };
  }

  const name = clean_(p.name, 100);
  const email = clean_(p.email, 160);
  const company = clean_(p.company, 160);
  const service = clean_(p.service, 120);
  const message = clean_(p.message, 3000);

  if (name.length < 2) return { ok: false, message: "Please enter a valid name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (message.length < 5) return { ok: false, message: "Please enter a longer message." };

  // Simple global throttle to reduce automated abuse of the public endpoint.
  enforceRateLimit_();

  const subject = `New website enquiry from ${name}`;
  const body = [
    `New contact request from the ${AGENCY_NAME} website`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company || "Not provided"}`,
    `Interested in: ${service || "Not specified"}`,
    "",
    "Message:",
    message,
    "",
    "Sent through the Summit Digital website contact form."
  ].join("\n");

  MailApp.sendEmail({
    to: RECIPIENT_EMAIL,
    subject: subject,
    body: body,
    replyTo: email,
    name: AGENCY_NAME
  });

  return { ok: true, message: "Email sent successfully." };
}

function clean_(value, maxLength) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function enforceRateLimit_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const cache = CacheService.getScriptCache();
    const minuteKey = `contact_count_${Math.floor(Date.now() / 60000)}`;
    const current = Number(cache.get(minuteKey) || 0);
    if (current >= 8) {
      throw new Error("Too many requests. Please try again in a minute.");
    }
    cache.put(minuteKey, String(current + 1), 90);
  } finally {
    lock.releaseLock();
  }
}

// Run this function once manually in the Apps Script editor to authorize Gmail.
function authorizeMailAccess() {
  MailApp.getRemainingDailyQuota();
}
