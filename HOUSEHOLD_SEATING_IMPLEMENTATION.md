% Household Seating Feature - Implementation Summary

## What Was Implemented

### 1. **Household Manager Utility** (`js/household-manager.js`)
- New utility class that manages household grouping and lookups
- Builds a map of households from Firebase guest data (using `householdId`)
- Provides functions to:
  - Get all household members for a guest
  - Get other household members (excluding the selected guest)
  - Get household ID for tracking
  - Format household information for display

### 2. **Enhanced Seating Admin** (`js/seating-admin.js`)

#### Changes Made:
- **Guest Loading**: Household manager is initialized when guests are loaded from Firebase
- **Guest Selection Flow**:
  - When a guest is clicked from search results, the system checks if they have household members
  - If household members exist → Shows "Seat Household Together?" modal
  - If no household members → Directly adds guest to table
  
- **Household Prompt Modal**:
  - Shows all household members with visual indicators
  - Displays primary guest (✓) and other members (👥)
  - Two action buttons:
    - "👥 Seat Together" - Adds entire household
    - "Just This Guest" - Adds only selected guest
    
- **Household Reassignment Logic**:
  - If household members are already seated at different tables
  - Moving household removes them from old tables
  - Adds entire household to new table
  - Space validation ensures table capacity isn't exceeded

- **Visual Indicators**:
  - Guest tags show 🏠 icon when part of household group
  - Household members highlighted in modal
  - Status shows "(Selected)" for primary guest, "(Household)" for others

### 3. **UI Updates**

#### Traditional Reception (`seating/trad/editor.html`)
- Added household seating modal HTML
- Added `household-manager.js` script reference

#### White Reception (`seating/white/editor.html`)
- Added household seating modal HTML  
- Added `household-manager.js` script reference

### 4. **Feature Behavior**

#### Scenario 1: Guest with Household Members
1. User selects "Chibuike Abana" from search
2. System detects he has 1 household member: "Mmachi Abana"
3. Modal appears asking "Seat Household Together?"
4. **If Yes**: Both Chibuike and Mmachi added to table
5. **If No**: Only Chibuike added to table

#### Scenario 2: Household Already Partially Seated
1. Mmachi is already seated at Table 2
2. User tries to seat Chibuike with household at Table 5
3. System removes Mmachi from Table 2
4. Both are added to Table 5 (keeps household together)

#### Scenario 3: Individual Guest (No Household)
1. User selects guest with no household ID
2. Guest directly added to table (no modal appears)

## Data Flow

```
Guest Selection
    ↓
[Check if householdId exists]
    ↓
    ├─→ Has Household Members → Show Modal
    │       ↓
    │   [User chooses Yes/No]
    │       ├─→ Yes: Add all household members + remove from other tables
    │       └─→ No: Add only selected guest
    │
    └─→ No Household → Add directly to table
```

## Firebase Integration

- Uses existing `householdId` field from Firebase guests
- Household Manager built on load from `loadGuestsFromFirebase()`
- No Firebase modifications needed - uses existing data

## Testing Recommendations

1. **Test with household guests**
   - Select a guest with household members
   - Verify modal appears with correct members
   - Test "Seat Together" adding all members
   - Test "Just This Guest" adding only one

2. **Test household reassignment**
   - Seat one household member at Table A
   - Seat their household together at Table B
   - Verify they're removed from Table A

3. **Test space constraints**
   - Try to seat 5-person household in table with max 3 seats available
   - Should show error and not add

4. **Test edit mode**
   - Edit existing table with household members
   - Verify household indicators (🏠) show on guest tags
   - Test adding/removing household members

## Files Modified

1. ✅ Created: `/js/household-manager.js` - Household utility class
2. ✅ Updated: `/js/seating-admin.js` - Household selection logic
3. ✅ Updated: `/seating/trad/editor.html` - Modal + script ref
4. ✅ Updated: `/seating/white/editor.html` - Modal + script ref

## Ready for Use

The feature is fully integrated and ready to use. Once guests are uploaded to Firebase with `householdId` field (which was already done via `upload_guests_to_firebase.py`), the seating editor will automatically:
- Detect household relationships
- Show prompts when selecting household members
- Handle household reassignment automatically
