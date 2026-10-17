# Summit Digital Website

A responsive single-page website for Summit Digital, aimed at construction businesses looking for SEO, website development, optimization, digital marketing, lead generation, and reporting services.

## Project files

- `index.html`: page content and semantic structure.
- `style.css`: colors, layout, typography, responsive rules, and animations.
- `script.js`: mobile navigation, reveal animations, footer year, and contact form validation.

## Run locally

1. Keep all three files in the same folder.
2. Open `index.html` in a modern browser.
3. For a more convenient development setup, open the folder in Visual Studio Code and use the Live Server extension.

No build tools or JavaScript packages are required.

## Before publishing

- Confirm that `hello@summitdigital.com` is the correct contact email. It appears in both `index.html` and `script.js`.
- Confirm the LinkedIn company URL in `index.html`.
- The contact form currently opens the visitor's default email application using a `mailto:` link. It does not deliver messages through a server or store submissions. Connect a form backend or form service if direct website submissions are required.

## Publish using GitHub Pages

1. Create a repository on GitHub.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository's root folder.
3. Open the repository's **Settings** tab, then **Pages**.
4. Under the build and deployment section, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site, then open the URL shown in the Pages settings.
