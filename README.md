SUMMIT DIGITAL CONTACT FORM SETUP
=================================

FILES
-----
index.html       Website structure
style.css        Existing website design
script.js        Website interactions and contact form client
Code.gs          Google Apps Script email backend

IMPORTANT
---------
The contact form will NOT send email until you deploy Code.gs and paste the
resulting Web App URL into script.js. This is a required one-time setup.

STEP 1: CREATE THE BACKEND
--------------------------
1. Sign in to the Google account that should send/receive the contact emails.
2. Open https://script.google.com/ and click New project.
3. Delete the starter code and paste the complete contents of Code.gs.
4. Save the project with a name such as Summit Digital Contact Form.
5. In the function selector, choose authorizeMailAccess and click Run.
6. Review the Google permission prompt and allow the requested Mail access.
   This authorizes the script to send contact notifications from your account.

STEP 2: DEPLOY AS A WEB APP
---------------------------
1. Click Deploy, then New deployment.
2. Select the gear icon and choose Web app.
3. Set Execute as: Me.
4. Set Who has access: Anyone.
5. Click Deploy and complete any authorization prompts.
6. Copy the Web app URL. It should end with /exec.
   Do not use the /dev test URL.

STEP 3: CONNECT THE WEBSITE
---------------------------
1. Open script.js.
2. Find this line near the top:
   const CONTACT_API_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
3. Replace the placeholder with your deployed /exec URL, keeping the quotes.
   Example format only:
   const CONTACT_API_URL = "https://script.google.com/macros/s/DEPLOYMENT_ID/exec";
4. Save all files.

STEP 4: PUBLISH TO GITHUB PAGES
-------------------------------
Upload/commit these three website files to the same GitHub Pages folder:
- index.html
- style.css
- script.js
Code.gs and this setup file are backend/setup files, they do not need to be
published in the website's public folder. Keep Code.gs in your Apps Script
project.

STEP 5: TEST
------------
1. Wait for GitHub Pages to deploy.
2. Open the live site and hard refresh with Ctrl + Shift + R.
3. Submit a test request using an email address you can access.
4. Confirm the success message appears and check the recipient Gmail inbox,
   including Spam.

UPDATING THE BACKEND LATER
--------------------------
If you change Code.gs after deployment, open Deploy > Manage deployments,
click Edit (pencil), choose New version, then Deploy. The /exec URL normally
stays the same for an edited deployment.

RELIABILITY NOTES
-----------------
- This implementation does not use FormSubmit and does not make a browser
  fetch() request to a cross-origin JSON API. It uses JSONP with a validated
  callback to avoid CORS preflight requests.
- No third-party web service can be guaranteed 100% uptime. Google Apps Script
  has account quotas and availability limits. Mail delivery also depends on
  Google's sending policies and the recipient mailbox.
- The public endpoint includes basic input validation, a honeypot, and a
  simple global rate limit. For high-volume production use, add stronger
  abuse protection and monitoring.
- Google Apps Script deployment settings must remain Execute as Me and Anyone
  access, otherwise visitors may not be able to submit the form.
