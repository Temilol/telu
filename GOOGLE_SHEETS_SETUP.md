# Google Sheets RSVP Setup Guide

Follow these steps to set up Google Sheets as your RSVP database:

## Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Wedding RSVP Responses"
4. In the first row, add these column headers:
   - A1: Guest ID
   - B1: Guest Name
   - C1: Email
   - D1: Party Size
   - E1: Attendance
   - F1: Attendee Count
   - G1: Attendee Names
   - H1: Events
   - I1: Submitted At

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. Paste this code:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    var data = JSON.parse(e.postData.contents);
    
    // Create a row with the data
    var row = [
      data.guestId,
      data.guestName,
      data.email,
      data.partySize,
      data.attendance,
      data.attendeeCount,
      data.attendeeNames,
      data.events,
      data.submittedAt
    ];
    
    // Check if guest already submitted (update existing row)
    var existingRow = findGuestRow(sheet, data.guestId);
    if (existingRow > 0) {
      // Update existing row
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    } else {
      // Add new row
      sheet.appendRow(row);
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var guestId = e.parameter.guestId;
    
    if (!guestId) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Guest ID required' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Find the guest's RSVP
    var existingRow = findGuestRow(sheet, guestId);
    
    if (existingRow > 0) {
      var rowData = sheet.getRange(existingRow, 1, 1, 9).getValues()[0];
      var rsvp = {
        guestId: rowData[0],
        guestName: rowData[1],
        email: rowData[2],
        partySize: rowData[3],
        attendance: rowData[4],
        attendeeCount: rowData[5],
        attendeeNames: rowData[6],
        events: rowData[7],
        submittedAt: rowData[8]
      };
      
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: rsvp }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'not_found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function findGuestRow(sheet, guestId) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == guestId) {
      return i + 1; // Sheet rows are 1-indexed
    }
  }
  return -1;
}
```

4. Click **Save** (💾 icon) and name the project "RSVP Handler"

## Step 3: Deploy the Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure settings:
   - Description: "RSVP Form Handler"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to [project name] (unsafe)**
9. Click **Allow**
10. **Copy the Web App URL** - it looks like:
    ```
    https://script.google.com/macros/s/ABCD1234.../exec
    ```

## Step 4: Update Your Website

Open `/Users/temilola/Projects/telu/js/rsvp.js` and find this line near the top:

```javascript
const GOOGLE_SCRIPT_URL = "YOUR_WEB_APP_URL_HERE";
```

Replace `YOUR_WEB_APP_URL_HERE` with the URL you copied in Step 3.

## Step 5: Test It

1. Go to your RSVP page
2. Search for a guest and submit an RSVP
3. Check your Google Sheet - the data should appear!
4. Search for the same guest again - their previous response should appear pre-filled
5. Update their response - the Google Sheet should update (not create a duplicate)

## How It Works

**For Guests:**
- When they search for their name, the system checks Google Sheets for previous submissions
- If found, their previous answers are pre-filled
- They can update their response from any device/browser
- A message shows: "You've already submitted an RSVP. You can update your response below."

**For You:**
- All responses stored centrally in Google Sheets
- No duplicate entries - updates replace previous responses
- Real-time access from anywhere
- Easy to export and share

## Troubleshooting

- **Data not appearing?** Check the Apps Script logs: Extensions → Apps Script → Executions
- **CORS errors?** Make sure deployment "Who has access" is set to "Anyone"
- **Previous responses not loading?** Verify the `doGet` function is included in your script
- **Multiple entries?** The script checks for duplicate Guest IDs and updates existing rows

## Viewing Your Data

Your Google Sheet will automatically update in real-time as guests submit RSVPs. You can:
- Sort and filter the data
- Create charts and summaries
- Export to CSV for other tools
- Share with your wedding planner

---

**Important:** Keep your Google Script URL private. Anyone with it can write to your sheet.
