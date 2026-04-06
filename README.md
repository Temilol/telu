# Telu - Wedding Event Management Platform

A comprehensive web platform for managing wedding events, including RSVP collection, interactive seating charts, guest database management, and event scheduling.

## Features

- **RSVP Management** — Collect guest responses and manage invitations
- **Interactive Seating Charts** — Customize table layouts and assign guests to seats
- **Household Seating** — Group related guests (families) and manage household assignments
- **Guest Database** — Firebase-backed guest management with multi-event support
- **Guest Hub** — Personalized guest portal for viewing event details and seating assignments
- **Admin Dashboard** — Secure interface for event organizers to manage all aspects
- **Event Scheduling** — Display event timeline and countdown timers
- **Travel Information** — Share accommodation and transportation details

## Quick Start

### Setup & Deployment

1. **[Build & Authentication Setup](doc/BUILD_AUTH.md)** — Configure environment variables for admin password (3 minutes)
2. **[Firebase Configuration](doc/FIREBASE_SETUP.md)** — Set up Firestore database (5 minutes)
3. **[GitHub Deployment](doc/GITHUB_DEPLOYMENT.md)** — Enable CI/CD with GitHub Actions (10 minutes)
4. **[Google Sheets Integration](doc/GOOGLE_SHEETS_SETUP.md)** — Connect RSVP form backend (5 minutes)

### Guest & Event Management

5. **[Guest Database Setup](doc/GUEST_DATABASE_SETUP.md)** — Upload guests to Firebase (10 minutes)
6. **[Household Seating](doc/HOUSEHOLD_SEATING_IMPLEMENTATION.md)** — Enable family grouping feature (5 minutes)
7. **[Seating Charts](doc/SEATING_CHART_GUIDE.md)** — Customize tables and assign seats (ongoing)

### Additional Resources

- **[Setup Summary](doc/SETUP_SUMMARY.md)** — Complete event configuration overview
- **[Seating Chart Guide](doc/SEATING_CHART_GUIDE.md)** — Detailed seating instructions
- **[Project Index](INDEX.md)** — Complete file and page directory

## Directory Structure

```
├── index.html              # Main landing page
├── js/                     # JavaScript modules
│   ├── firebase-*.js       # Firebase integration
│   ├── seating-*.js        # Seating chart functionality
│   ├── rsvp.js            # RSVP form handling
│   └── ...                # Additional utilities
├── css/                    # Styling
├── seating/               # Seating chart pages
│   ├── index.html         # Admin seating editor
│   ├── view.html          # Guest seating view
│   ├── trad/              # Traditional layout variant
│   └── white/             # White layout variant
├── rsvp_disabled/         # RSVP disabled view
├── faq/                   # FAQ page
├── guide/                 # Event guide
├── schedule/              # Event schedule/timeline
├── travel/                # Travel information
├── python/                # Utility scripts
│   ├── upload_guests_to_firebase.py      # Load guests from CSV
│   ├── add_household_ids.py              # Assign household IDs
│   ├── verify_setup.py                   # Validate configuration
│   └── ...               # Additional utilities
└── doc/                   # Documentation
```

## Key Technologies

- **Frontend** — HTML5, CSS3, JavaScript
- **Backend** — Firebase Firestore
- **Data** — Google Sheets integration
- **Deployment** — GitHub Pages + GitHub Actions
- **Utilities** — Python scripts for data management

## Development

### Prerequisites

- Firefox or Chrome (modern JavaScript support)
- Python 3.x (for utility scripts)
- Firebase project and credentials
- Google Sheets API access (optional, for RSVP integration)

### Local Testing

Open any `.html` file directly in your browser or serve through a local HTTP server:

```bash
python3 -m http.server 8000
```

### Running Utility Scripts

```bash
cd python
source ../.venv/bin/activate  # Activate virtual environment
python3 upload_guests_to_firebase.py
```

## Admin Access

Admin features (seating editor, guest management) are password-protected. See [BUILD_AUTH.md](doc/BUILD_AUTH.md) for setup instructions.

## Support

Refer to the [Documentation](doc/) folder for detailed guides on each feature. Each document covers setup, configuration, and troubleshooting.

## Project Status

This is an active project supporting live wedding events. All features are production-ready.
