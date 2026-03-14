# Forms setup: Google Apps Script + Google Sheets

This guide explains how form submissions from your DivineWay site (e.g. on GitHub Pages) are handled **without Formspree or a paid backend**: they are sent to a **Google Apps Script** Web App, which writes data to **Google Sheets** and sends an email to the admin for each submission.

---

## Forms on this site (all use the same GAS Web App URL)

| Form | Where it lives | Where to set `GAS_WEB_APP_URL` |
|------|----------------|--------------------------------|
| **Contact** | `contact.html` (contact form) | `contact.js` |
| **Book a reading** | `index.html` (booking modal) | `script.js` |
| **Crystal “I’m interested”** | `index.html` (crystal modal) | `script.js` |

You set the **same** Web app URL in both `script.js` and `contact.js` (see Step 4).

---

## How it works (overview)

1. **User** fills a form on the site (Contact, Book a reading, Crystal interest) and clicks Send/Submit.
2. **Site (JavaScript)** sends the form data as a **JSON POST** request to your **Google Apps Script Web App URL**.
3. **Google Apps Script** receives the request, reads `formType` and fields, then:
   - Appends one row to the correct **sheet** in your Google Spreadsheet (Contact, BookReading, or CrystalInterest).
   - Sends an **email** to your admin address with the same data (using `MailApp.sendEmail`).
4. **You** see new rows in the spreadsheet and get an email for each submission.

No server of your own is needed; everything runs on Google’s infrastructure and works with static hosting like GitHub Pages.

---

## Step 1: Create the Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new spreadsheet**.
2. Name it (e.g. “DivineWay form submissions”).
3. You will use **one spreadsheet** with **three sheets (tabs)**. Create/rename them as follows.

### Sheet 1: **Contact**

- **Name the tab:** `Contact`
- **Row 1 (headers):**  
  `Timestamp` | `Name` | `Email` | `Message`

### Sheet 2: **BookReading**

- **Name the tab:** `BookReading`
- **Row 1 (headers):**  
  `Timestamp` | `Name` | `Email` | `Phone` | `Preferred Date` | `Preferred Time` | `City` | `State` | `Age` | `Reading Type`

### Sheet 3: **CrystalInterest**

- **Name the tab:** `CrystalInterest`
- **Row 1 (headers):**  
  `Timestamp` | `Email` | `Product ID` | `Product Name` | `Price`

Leave row 2 and below empty; the script will **append** new rows below the header.

---

## Step 2: Add the Google Apps Script

1. In the same spreadsheet: **Extensions → Apps Script**.
2. Delete any default code in the editor.
3. Open the file **`google-apps-script/Code.gs`** from this project and **copy all its contents** into the Apps Script editor.
4. **Set your admin email:** at the top of the script, replace  
   `YOUR_ADMIN_EMAIL@example.com`  
   with the Gmail address that should receive form notifications (e.g. `you@gmail.com`).
5. **Save** the project (Ctrl/Cmd + S). You can name the project (e.g. “DivineWay Forms”).

---

## Step 3: Deploy as Web App (get the URL)

1. In the Apps Script editor: **Deploy → New deployment**.
2. Click the **gear icon** next to “Select type” and choose **Web app**.
3. Set:
   - **Description:** e.g. “DivineWay forms”
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone** (so your GitHub Pages site can POST from the browser)
4. Click **Deploy**.
5. **Authorize** when asked: choose your Google account and allow the script to:
   - “View and manage your spreadsheets”
   - “Send email on your behalf”
6. After authorization, the deployment will show a **Web app URL** like:  
   `https://script.google.com/macros/s/AKfycbx.../exec`  
   **Copy this URL** — you will use it in the website.

---

## Step 4: Put the URL in your website

You must set this URL in **two places** (same value in both):

1. **`script.js`** (for index page: crystal modal, booking modal)  
   - Find:  
     `var GAS_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';`  
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` with your full Web app URL (in quotes).

2. **`contact.js`** (for contact page form)  
   - Find:  
     `var GAS_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';`  
   - Replace with the **same** Web app URL.

Example:

```js
var GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

After that, deploy your site (e.g. push to GitHub and use GitHub Pages). Forms will POST to this URL.

---

## What each form sends

| Form            | `formType` | Data sent |
|----------------|------------|-----------|
| Contact        | `contact`  | name, email, message |
| Book a reading | `booking`  | name, email, phone, preferredDate, preferredTime, city, state, age, readingType |
| Crystal “I’m interested” | `crystal` | email, productId, productName, price |

The script appends one row to the matching sheet and sends one email to `ADMIN_EMAIL` with the same information.

---

## Email to admin

- For **every form submission**, the script (1) appends a row to the correct sheet and (2) **immediately** sends one email to `ADMIN_EMAIL` with the same data. There is **no separate Google Sheet trigger** — the email is sent in the same run as the row append.
- Email is sent **from the script** using **Gmail (MailApp)** under the same Google account that owns the script.
- **Subject** and **body** are set in `Code.gs` for each `formType` (e.g. “DivineWay — New contact form message”, “DivineWay — New reading booking request”, “DivineWay — Crystal interest: …”).
- If you leave `ADMIN_EMAIL` as `YOUR_ADMIN_EMAIL@example.com`, the script will **not** send email (to avoid errors) but will still write to the sheet.

---

## Updating the script later

If you change `Code.gs` (e.g. add fields or change email text):

1. Edit the script in **Extensions → Apps Script** and save.
2. **Deploy → Manage deployments**.
3. Open the **pencil (edit)** on the existing deployment and choose **Version → New version**, then **Deploy**.
4. The **Web app URL stays the same**; you do **not** need to change anything in `script.js` or `contact.js`.

---

## Troubleshooting

- **“Please set your Google Apps Script Web App URL”**  
  You haven’t replaced `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` in `script.js` and/or `contact.js` with your real URL.

- **No rows in the sheet**  
  - Check that sheet names are **exactly** `Contact`, `BookReading`, and `CrystalInterest` (case-sensitive).
  - In Apps Script, check **Executions** (left sidebar) for errors.

- **No email**  
  - Set `ADMIN_EMAIL` in `Code.gs` to a valid Gmail address.
  - Check Gmail spam.
  - First run may require extra authorization for “Send email on your behalf”.

- **CORS / “Something went wrong”**  
  The site uses `mode: 'no-cors'` when sending to the script, so the browser cannot read the response. As long as the script runs without error, the row is written and the email is sent. If you see a generic “Something went wrong”, check Apps Script **Executions** for the real error.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Create one Google Sheet with three tabs: **Contact**, **BookReading**, **CrystalInterest**, each with the header row as above. |
| 2 | **Extensions → Apps Script**, paste `google-apps-script/Code.gs`, set `ADMIN_EMAIL`, save. |
| 3 | **Deploy → New deployment → Web app**, Execute as **Me**, Who has access **Anyone**, deploy and authorize. Copy the **Web app URL**. |
| 4 | In **script.js** and **contact.js**, set `GAS_WEB_APP_URL` to that URL. |
| 5 | Deploy your site (e.g. GitHub Pages). Forms will submit to the script; data goes to the sheets and to your admin email. |
