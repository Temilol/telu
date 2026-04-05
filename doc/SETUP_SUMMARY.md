# 🎉 Event-Specific Guest Database Setup - Summary

## ✅ What Was Done

### 1. **Renamed Event Folders** 
- `seating/event1/` → `seating/trad/`
- `seating/event2/` → `seating/white/`
- Updated all HTML references in seating pages

### 2. **Created Event-Aware Guest Loading System**
Updated `js/firebase-guests.js` to:
- ✅ Detect current event ID from `window.currentEventId`
- ✅ Load from `guests_trad` collection for trad event
- ✅ Load from `guests_white` collection for white event
- ✅ Automatically route each seating page to correct guest list
- ✅ Preserve all attendance status information per event

### 3. **Created Python Upload Script**
`python/upload_guests_to_firebase.py` automates:
- Parsing `traditionalGuests.csv` → uploads to `guests_trad` collection
- Parsing `weddingGuests.csv` → uploads to `guests_white` collection
- Converting CSV columns to Firebase document fields
- Creating proper document IDs based on guest names

## 📋 System Architecture

```
Browser Navigation
       ↓
   ┌──────────────────────────────────┐
   │  seating/trad/index.html         │
   │  (currentEventId = trad)          │◄─── Sets Event ID
   └──────────────────────────────────┘
              ↓
   ┌──────────────────────────────────┐
   │  firebase-guests.js              │
   │  getGuestCollectionName()         │◄─── Detects Event
   └──────────────────────────────────┘
              ↓
   ┌──────────────────────────────────┐
   │  Firebase Firestore              │
   │  guests_trad collection           │◄─── Loads Guests
   └──────────────────────────────────┘

   ┌──────────────────────────────────┐
   │  seating/white/index.html        │
   │  (currentEventId = white)         │◄─── Sets Event ID
   └──────────────────────────────────┘
              ↓
   ┌──────────────────────────────────┐
   │  firebase-guests.js              │
   │  getGuestCollectionName()         │◄─── Detects Event
   └──────────────────────────────────┘
              ↓
   ┌──────────────────────────────────┐
   │  Firebase Firestore              │
   │  guests_white collection          │◄─── Loads Guests
   └──────────────────────────────────┘
```

## 🚀 Next Steps

### Step 1: Run the Upload Script
```bash
cd /Users/temilola/Projects/telu/python
python3 upload_guests_to_firebase.py
```

Or use the shortcut:
```bash
bash upload_and_setup.sh
```

### Step 2: Verify in Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to Firestore Database
3. Verify these collections exist:
   - `guests_trad` (from traditionalGuests.csv)
   - `guests_white` (from weddingGuests.csv)

### Step 3: Test the Seating Charts
- Open `seating/trad/index.html` in browser
  - Should load traditional ceremony guests
  - Console: `✓ Loaded XXX guests from Firebase (guests_trad)`

- Open `seating/white/index.html` in browser
  - Should load white reception guests
  - Console: `✓ Loaded XXX guests from Firebase (guests_white)`

## 📁 File Changes

### Modified Files
| File | Changes |
|------|---------|
| `js/firebase-guests.js` | Added event detection, multi-collection support, preserves attendance fields |
| `seating/*/index.html` | Updated folder references (event1→trad, event2→white) |
| `seating/*/find-seat.html` | Updated folder references and event IDs |

### New Files
| File | Purpose |
|------|---------|
| `python/upload_guests_to_firebase.py` | Automated CSV to Firebase uploader |
| `python/upload_and_setup.sh` | Quick start shell script |
| `GUEST_DATABASE_SETUP.md` | Full setup and troubleshooting guide |
| `SETUP_SUMMARY.md` | This file |

### No Changes Needed
- CSV files (`traditionalGuests.csv`, `weddingGuests.csv`) - used as-is
- Seating assignment logic - works per event automatically
- Firebase configuration - reuses existing setup

## 🔑 Key Features

### ✨ Automatic Event Detection
The system automatically knows which event is active:
```javascript
// In any seating page:
window.currentEventId = "wedding-seating-chart-trad"  // or white
// Automatically loads from correct collection!
```

### 📊 Full Guest Data
Each guest document in Firebase includes:
- Name, title, firstName, lastName
- Event identifier (trad or white)

The CSV files are fully parsed but only name and title fields are stored in Firebase.

### 🔄 Event Isolation
- Trad guests: Only in `guests_trad` collection
- White guests: Only in `guests_white` collection
- Seating arrangements: Separate per event
- No data mixing or conflicts

### 🛡️ Fallback Support
If Firebase is unavailable, system falls back to local guest data gracefully.

## 🐛 Troubleshooting

### Check Event ID
```javascript
// In browser console while on seating page:
console.log(window.currentEventId)
// Should show: "wedding-seating-chart-trad" or "wedding-seating-chart-white"
```

### Check Collection Name
```javascript
// In browser console:
getGuestCollectionName()
// Should show: "guests_trad" or "guests_white"
```

### Verify Guest Count
```javascript
// After loading, check console for:
✓ Loaded 342 guests from Firebase (guests_trad)
or
✓ Loaded 450 guests from Firebase (guests_white)
```

### Re-upload if Needed
The Python script can be run multiple times safely:
- It updates existing documents if they already exist
- No data loss or duplication
```bash
python3 upload_guests_to_firebase.py
```

## 📞 Support

For detailed information, see:
- [GUEST_DATABASE_SETUP.md](GUEST_DATABASE_SETUP.md) - Complete setup guide
- [js/firebase-guests.js](../js/firebase-guests.js) - Implementation details
- [python/upload_guests_to_firebase.py](../python/upload_guests_to_firebase.py) - Upload logic

---

**Status**: ✅ Ready to upload guests to Firebase!
**Last Updated**: April 1, 2026
