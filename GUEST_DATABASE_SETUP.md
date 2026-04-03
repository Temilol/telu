# Event-Specific Guest Database Setup

## Overview
Your seating chart now uses separate guest databases for each event:
- **Trad Reception** (`seating/trad/`) - Uses `guests_trad` collection (from `traditionalGuests.csv`)
- **White Reception** (`seating/white/`) - Uses `guests_white` collection (from `weddingGuests.csv`)

Each event automatically loads its own guest list based on the `currentEventId` set in the HTML files.

## Setup Instructions

### 1. Ensure Firebase Credentials
Make sure your `serviceAccountKey.json` is in the project root:
```
/Users/temilola/Projects/telu/serviceAccountKey.json
```

### 2. Upload Guests to Firebase

From the `python/` directory, run:

```bash
cd /Users/temilola/Projects/telu/python
python3 upload_guests_to_firebase.py
```

This script will:
- ✓ Parse `traditionalGuests.csv` and upload to `guests_trad` collection
- ✓ Parse `weddingGuests.csv` and upload to `guests_white` collection
- ✓ Include all guest fields (name, attendance status, etc.)

### 3. Verify Upload

After running the script, check Firebase Console:
1. Go to Firestore Database
2. Verify these collections exist with guest documents:
   - `guests_trad` - Contains traditional ceremony guests
   - `guests_white` - Contains white reception guests

## How It Works

### JavaScript Flow

1. **Event Detection** (`firebase-guests.js`):
   - Each seating page has `window.currentEventId` set:
     - `trad/` pages → `"wedding-seating-chart-trad"`
     - `white/` pages → `"wedding-seating-chart-white"`

2. **Guest Loading** (`getGuestCollectionName()`):
   - Automatically selects the correct collection based on event ID
   - `"wedding-seating-chart-trad"` → loads from `guests_trad`
   - `"wedding-seating-chart-white"` → loads from `guests_white`

3. **Seating Admin** (`seating-admin.js`):
   - Calls `loadGuestsFromFirebase()`
   - Gets the appropriate guest list for the current event
   - Displays guests in the admin interface

### CSV Structure

Both CSV files are parsed for:
- `Title` - Mr., Mrs., Dr., Ms., etc.
- `First Name` - Guest's first name
- `Last Name` - Guest's last name

*Note: Additional CSV columns (Suffix, ceremony attendance) are read but not stored in Firebase*

## Guest Assignment

Guests are assigned to tables per event:
- Each seating page (`trad/index.html` and `white/index.html`) maintains its own table/seating arrangement
- Guest assignments are stored separately per event in Firebase
- When guests are assigned to a table, it only affects that specific event's seating chart

## Testing

To test the setup:

1. **Trad Seating**: Open `seating/trad/index.html`
   - Should load guests from `guests_trad` collection
   - Console will show: "📍 Loading guests from collection: guests_trad"

2. **White Seating**: Open `seating/white/index.html`
   - Should load guests from `guests_white` collection
   - Console will show: "📍 Loading guests from collection: guests_white"

3. **Check Browser Console**:
   - Press F12 to open Developer Tools
   - Go to Console tab
   - You should see:
     ```
     ✓ Loaded XXX guests from Firebase (guests_trad)
     ✓ Loaded XXX guests from Firebase (guests_white)
     ```

## Troubleshooting

### Issue: "Firebase not initialized"
- Ensure `serviceAccountKey.json` is properly placed
- Check that all Firebase configuration is correct in the seating pages

### Issue: Guests not loading
- Verify script ran successfully with no errors
- Check Firebase Console that documents exist in the collections
- Check browser console for specific error messages
- Ensure `window.firebaseInitialized` is `true`

### Issue: Wrong guests appearing
- Verify `currentEventId` is correctly set in the HTML
- Check that the correct collection is being queried
- Ensure both CSV files were uploaded correctly

## File Locations

| File | Purpose |
|------|---------|
| `python/upload_guests_to_firebase.py` | Upload script for guests |
| `python/traditionalGuests.csv` | Traditional ceremony guest list |
| `python/weddingGuests.csv` | White reception guest list |
| `js/firebase-guests.js` | Guest loading logic (event-aware) |
| `seating/trad/index.html` | Trad event seating chart (sets event ID) |
| `seating/white/index.html` | White event seating chart (sets event ID) |

## Notes

- Guest data is loaded fresh from Firebase each time a seating page is opened
- Fallback to local data works if Firebase is unavailable
- You can edit CSV files and re-run the upload script anytime
- The system prevents duplicate guest entries per event
