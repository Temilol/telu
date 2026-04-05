#!/bin/bash
# Quick start script to upload guests to Firebase

cd /Users/temilola/Projects/telu/python

echo "🚀 Uploading guests to Firebase..."
echo "=================================="
echo ""
echo "This will:"
echo "  • Parse traditionalGuests.csv → guests_trad collection"
echo "  • Parse weddingGuests.csv → guests_white collection"
echo ""

python3 upload_guests_to_firebase.py

echo ""
echo "=================================="
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Open Firebase Console to verify collections"
echo "  2. Test seating/trad/index.html"
echo "  3. Test seating/white/index.html"
echo ""
