/**
 * MOCHA STORY LAB — Download / Subscribe Log
 * ---------------------------------------------------
 * Paste this into: your Google Sheet → Extensions → Apps Script
 * (delete any starter code first, paste this in its place)
 *
 * What it does: every time someone downloads the Legend Playbook or
 * subscribes to the newsletter on the website, the backend (api/subscribe.js)
 * sends their email + phone + source here, and this script appends a row.
 *
 * Columns written: Timestamp | Email | Phone | Source
 * "Source" tells you WHICH form they came from, e.g. "The Legend Playbook",
 * "The Mocha Newsletter", "The Story Lab" — useful for segmenting your
 * newsletter list later.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add header row once, if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Email', 'Phone', 'Source']);
  }

  var email = (e.parameter.email || '').trim();
  var phone = (e.parameter.phone || '').trim();
  var source = (e.parameter.source || 'Unknown').trim();

  if (email) {
    sheet.appendRow([new Date(), email, phone, source]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
