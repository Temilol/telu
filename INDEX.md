# Toluwani & Temilola — Wedding Website Index

A comprehensive guide to the files and structure of this wedding website project.

## 📁 Project Structure

### Root Files
- [**index.html**](index.html) — Main homepage
- [**404.html**](404.html) — 404 error page
- [**CNAME**](CNAME) — Custom domain configuration
- [**seating-data.json**](seating-data.json) — Seating chart data storage

### Documentation Files
- [**FIREBASE_SETUP.md**](FIREBASE_SETUP.md) — Firebase configuration guide
- [**GOOGLE_SHEETS_SETUP.md**](GOOGLE_SHEETS_SETUP.md) — Google Sheets integration setup
- [**SEATING_CHART_GUIDE.md**](SEATING_CHART_GUIDE.md) — Seating chart usage guide
- [**INDEX.md**](INDEX.md) — This file

---

## 📄 Pages

### Main Hub Pages
- **[faq/index.html](faq/index.html)** — Frequently Asked Questions
- **[guide/index.html](guide/index.html)** — Wedding Guide
- **[travel/index.html](travel/index.html)** — Travel Information
- **[schedule/index.html](schedule/index.html)** — Event Schedule

### Seating Management
- **[seating/index.html](seating/index.html)** — Seating Hub / Guest View
- **[seating/login.html](seating/login.html)** — Admin Login Page
- **[seating/trad/editor.html](seating/trad/editor.html)** — Traditional Reception Editor
- **[seating/trad/view.html](seating/trad/view.html)** — Traditional Reception View
- **[seating/trad/find-seat.html](seating/trad/find-seat.html)** — Traditional Reception Guest Finder
- **[seating/white/editor.html](seating/white/editor.html)** — White Reception Editor
- **[seating/white/view.html](seating/white/view.html)** — White Reception View
- **[seating/white/find-seat.html](seating/white/find-seat.html)** — White Reception Guest Finder
- **[seating/event1/index.html](seating/event1/index.html)** — Event 1 Seating
- **[seating/event2/index.html](seating/event2/index.html)** — Event 2 Seating

### Accessibility
- **[rsvp_disabled/index.html](rsvp_disabled/index.html)** — RSVP Disabled Page

---

## 🎨 CSS/Styling

Located in: **css/** directory

- **[css/seating-shared.css](css/seating-shared.css)** — Shared styles for seating charts (export menus, tables, scaling)

---

## 🔧 JavaScript Files

Located in: **js/** directory

### Core Seating Management
- **[js/seating-admin.js](js/seating-admin.js)** — Admin panel functionality (add/edit/delete tables, guest management, per-table limits, household management)
- **[js/seating-chart.js](js/seating-chart.js)** — Seating chart rendering and drag functionality
- **[js/seating-auth.js](js/seating-auth.js)** — Authentication system for admin access

### Export System
- **[js/seating-export.js](js/seating-export.js)** — Export menu for editor pages (PNG, SVG, PDF)
- **[js/seating-view-export.js](js/seating-view-export.js)** — Export system for view pages with custom SVG generation

### Feature Modules
- **[js/firebase-guests.js](js/firebase-guests.js)** — Firebase integration for guest data
- **[js/firebase-seating.js](js/firebase-seating.js)** — Firebase integration for seating data
- **[js/rsvp.js](js/rsvp.js)** — RSVP form functionality
- **[js/music-player.js](js/music-player.js)** — Music player component
- **[js/countdown.js](js/countdown.js)** — Event countdown timer
- **[js/accordion.js](js/accordion.js)** — Accordion UI component
- **[js/tooltip.js](js/tooltip.js)** — Tooltip functionality for tables
- **[js/zoom-controls.js](js/zoom-controls.js)** — Zoom in/out controls for seating chart

---

## 🐍 Python Utilities

Located in: **python/** directory

- **[python/guest_filter.py](python/guest_filter.py)** — Guest data filtering and processing
- **[python/guest.csv](python/guest.csv)** — Guest data (CSV format)
- **[python/weddingGuests.csv](python/weddingGuests.csv)** — Wedding guest list
- **[python/traditionalGuests.csv](python/traditionalGuests.csv)** — Traditional reception guests
- **[python/households.csv](python/households.csv)** — Household groupings
- **[python/filteredGuests.csv](python/filteredGuests.csv)** — Filtered guest data
- **[python/edited_guest.csv](python/edited_guest.csv)** — Edited guest data

---

## 🎯 Key Features

### Seating Chart Management
- **Multi-Event Support**: Traditional & White reception events
- **Admin Editor**: Add/edit/delete tables with drag functionality
- **Guest Management**: Assign guests to tables with per-table capacity limits (1-20 guests)
- **Household Grouping**: Automatically seat household members together
- **Export Options**: PNG, SVG, PDF formats for seating charts
- **Guest Search**: Quick find your seat functionality
- **Real-time Sync**: Firebase integration for cloud sync

### UI Enhancements
- **Zoom Controls**: Zoom in/out for better visualization
- **Table Scaling**: Optimized 55px diameter tables with proportional scaling
- **Drag & Drop**: Move tables around the venue
- **Responsive Design**: Mobile-friendly layout
- **Authentication**: Password-protected admin area

### Data Management
- **Firebase Integration**: Cloud storage for seating and guest data
- **CSV Import/Export**: Guest data in spreadsheet format
- **Household Tracking**: Group family members for better seating decisions

---

## 🔐 Security Files

- **[seating/login.html](seating/login.html)** — Admin authentication page
- **[js/seating-auth.js](js/seating-auth.js)** — Authentication logic

---

## 📊 Data Files

- [seating-data.json](seating-data.json) — Main seating chart data
- [python/guest.csv](python/guest.csv) — Guest database
- [python/households.csv](python/households.csv) — Household relationships
- [python/weddingGuests.csv](python/weddingGuests.csv) — Wedding attendee list

---

## 🚀 Getting Started

1. **Login**: Visit [seating/login.html](seating/login.html) for admin access
2. **Manage Seating**: Edit tables using [seating/trad/editor.html](seating/trad/editor.html) or [seating/white/editor.html](seating/white/editor.html)
3. **Export**: Use export buttons to save seating charts as PNG, SVG, or PDF
4. **Share**: Send guests to [seating/index.html](seating/index.html) to find their seats

---

## 📖 Setup Guides

- [Firebase Setup](FIREBASE_SETUP.md) — Configure Firebase for data sync
- [Google Sheets Setup](GOOGLE_SHEETS_SETUP.md) — Integrate with Google Sheets
- [Seating Chart Guide](SEATING_CHART_GUIDE.md) — Full seating management instructions

---

Last Updated: April 5, 2026
