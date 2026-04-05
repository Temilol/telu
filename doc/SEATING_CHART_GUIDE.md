# Seating Chart Customization Guide

## Overview

The seating chart displays an interactive venue map where tables are positioned spatially to match your actual venue layout.

## How to Customize

### 1. Edit Guest Names and Table Assignments

Open `/js/seating-chart.js` and update the `seatingData` object with your actual guest list.

### 2. Position Tables on the Venue Map

Each table has `x` and `y` coordinates that position it on the venue map:

- **x coordinate**: 0-100 (left to right)
  - 0 = far left
  - 50 = center
  - 100 = far right
- **y coordinate**: 0-100 (top to bottom)
  - 0 = top (near head table)
  - 50 = middle
  - 100 = bottom

### Example Table Configuration:

```javascript
{
  number: 1,        // Table number
  x: 15,           // 15% from left (left side of venue)
  y: 25,           // 25% from top (upper area)
  guests: [
    "Guest Name 1",
    "Guest Name 2",
    // ... more guests
  ]
}
```

### Current Layout Example:

```
               [Head Table / Dance Floor]
                     (top center)

    Table 1         Table 2         Table 3         Table 4
    (15,25)         (40,20)         (65,25)         (85,30)
     Left          Left-Ctr        Right-Ctr        Right




    Table 5         Table 6         Table 7         Table 8
    (15,60)         (40,70)         (65,65)         (85,55)
     Left          Left-Ctr        Right-Ctr        Right
```

### 3. Visual Features

- **Hover** over any table to see the guest list
- **Click** a table to keep the tooltip open
- **Search** for a guest name to highlight their table and auto-scroll to it
- Tables animate when highlighted from search

### 4. Adding/Removing Tables

To add a new table, add a new object to the `tables` array:

```javascript
{
  number: 9,
  x: 50,  // Center
  y: 45,  // Middle
  guests: ["Name 1", "Name 2", ...]
}
```

To remove a table, simply delete its object from the array.

## Tips for Layout

1. Keep head table at the top (already positioned)
2. Distribute tables evenly across x-axis (spread left to right)
3. Use y-axis to create rows (tables at similar y values form visual rows)
4. Leave space between tables for readability (at least 10-15 units apart)
5. Test on mobile - tables scale down automatically

## File Locations

- **Seating page**: `/seating/index.html`
- **JavaScript/Data**: `/js/seating-chart.js`
- **Link from home**: Main `index.html` (Travel Tips section)

## Need Help?

The coordinate system uses percentage positioning, so:

- (0, 0) = top-left corner
- (50, 50) = exact center
- (100, 100) = bottom-right corner

Adjust coordinates incrementally and refresh the page to see changes!
