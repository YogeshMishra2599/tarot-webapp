/**
 * DivineWay Tarot — Google Apps Script Web App
 * Receives form submissions from the static site (GitHub Pages) and:
 * 1. Appends each submission to the correct sheet in the linked spreadsheet
 * 2. Sends an email notification to the admin
 *
 * SETUP:
 * 1. Create a new Google Sheet: https://sheets.google.com
 * 2. Create three sheets (tabs) with these exact names:
 *    - Contact
 *    - BookReading
 *    - CrystalInterest
 * 3. Add header rows (see FORMS_SETUP.md for column names)
 * 4. In the sheet: Extensions → Apps Script, paste this code, set ADMIN_EMAIL, deploy as Web App
 */

var ADMIN_EMAIL = 'YOUR_ADMIN_EMAIL@example.com'; // ← Replace with your email

function doPost(e) {
  try {
    var data = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : (e.parameter || {});
    var formType = data.formType || '';

    if (!formType) {
      return createJsonOutput({ success: false, error: 'Missing formType' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = null;
    var row = [];
    var subject = '';
    var body = '';

    switch (formType) {
      case 'contact':
        sheet = ss.getSheetByName('Contact');
        if (!sheet) return createJsonOutput({ error: 'Sheet "Contact" not found' });
        row = [
          new Date(),
          data.name || '',
          data.email || '',
          data.message || ''
        ];
        subject = 'DivineWay — New contact form message';
        body = 'Name: ' + (data.name || '') + '\nEmail: ' + (data.email || '') + '\n\nMessage:\n' + (data.message || '');
        break;

      case 'booking':
        sheet = ss.getSheetByName('BookReading');
        if (!sheet) return createJsonOutput({ error: 'Sheet "BookReading" not found' });
        row = [
          new Date(),
          data.name || '',
          data.email || '',
          data.phone || '',
          data.preferredDate || '',
          data.preferredTime || '',
          data.city || '',
          data.state || '',
          data.age || '',
          data.readingType || ''
        ];
        subject = 'DivineWay — New reading booking request';
        body = 'Name: ' + (data.name || '') + '\nEmail: ' + (data.email || '') + '\nPhone: ' + (data.phone || '') +
          '\nPreferred date: ' + (data.preferredDate || '') + '\nPreferred time: ' + (data.preferredTime || '') + '\nCity: ' + (data.city || '') +
          '\nState: ' + (data.state || '') + '\nAge: ' + (data.age || '') +
          '\nReading type: ' + (data.readingType || '');
        break;

      case 'crystal':
        sheet = ss.getSheetByName('CrystalInterest');
        if (!sheet) return createJsonOutput({ error: 'Sheet "CrystalInterest" not found' });
        row = [
          new Date(),
          data.email || '',
          data.productId || '',
          data.productName || '',
          data.price || ''
        ];
        subject = 'DivineWay — Crystal interest: ' + (data.productName || '');
        body = 'Email: ' + (data.email || '') + '\nProduct: ' + (data.productName || '') +
          '\nProduct ID: ' + (data.productId || '') + '\nPrice: ' + (data.price || '');
        break;

      default:
        return createJsonOutput({ error: 'Unknown formType: ' + formType });
    }

    sheet.appendRow(row);

    if (ADMIN_EMAIL && ADMIN_EMAIL.indexOf('YOUR_') !== 0) {
      MailApp.sendEmail(ADMIN_EMAIL, subject, body);
    }

    return createJsonOutput({ success: true });
  } catch (err) {
    return createJsonOutput({ success: false, error: err.toString() });
  }
}

function createJsonOutput(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
