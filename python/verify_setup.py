#!/usr/bin/env python3
"""
Quick verification script for Guest Database Setup
Run this to verify everything is configured correctly
"""

import os
import json
from pathlib import Path

def check_files_exist():
    """Check if all required files exist"""
    print("\n📁 Checking Files...")
    print("-" * 50)
    
    files_to_check = [
        ('CSV Files', [
            'python/traditionalGuests.csv',
            'python/weddingGuests.csv',
        ]),
        ('Upload Script', [
            'python/upload_guests_to_firebase.py',
            'python/upload_and_setup.sh',
        ]),
        ('Documentation', [
            'GUEST_DATABASE_SETUP.md',
            'SETUP_SUMMARY.md',
        ]),
        ('JavaScript', [
            'js/firebase-guests.js',
        ]),
        ('Seating Pages', [
            'seating/trad/index.html',
            'seating/trad/find-seat.html',
            'seating/white/index.html',
            'seating/white/find-seat.html',
        ]),
    ]
    
    base_path = Path('/Users/temilola/Projects/telu')
    all_exist = True
    
    for category, files in files_to_check:
        print(f"\n{category}:")
        for file in files:
            full_path = base_path / file
            exists = full_path.exists()
            status = "✓" if exists else "✗"
            print(f"  {status} {file}")
            if not exists:
                all_exist = False
    
    return all_exist

def check_csv_structure():
    """Check if CSV files have expected columns"""
    print("\n\n📊 Checking CSV Structure...")
    print("-" * 50)
    
    import csv
    
    csv_files = [
        ('traditionalGuests.csv', 'Traditional Ceremony'),
        ('weddingGuests.csv', 'Wedding Reception'),
    ]
    
    expected_columns = [
        'Title', 'First Name', 'Last Name', 'Suffix',
        'Traditional Ceremony', 'Wedding Ceremony', 'Wedding Reception'
    ]
    
    base_path = Path('/Users/temilola/Projects/telu/python')
    
    for csv_file, event_name in csv_files:
        print(f"\n{event_name} ({csv_file}):")
        csv_path = base_path / csv_file
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                headers = reader.fieldnames or []
                
                # Check columns
                for col in expected_columns:
                    exists = col in headers
                    status = "✓" if exists else "✗"
                    print(f"  {status} {col}")
                
                # Count guests
                row_count = sum(1 for _ in reader)
                print(f"  📈 Total guests: {row_count}")
                
        except FileNotFoundError:
            print(f"  ✗ File not found!")

def check_javascript():
    """Check if firebase-guests.js has new functions"""
    print("\n\n🔧 Checking JavaScript Updates...")
    print("-" * 50)
    
    js_path = Path('/Users/temilola/Projects/telu/js/firebase-guests.js')
    
    try:
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        functions_to_check = [
            ('getGuestCollectionName', 'Event detection function'),
            ('guests_trad', 'Trad collection reference'),
            ('guests_white', 'White collection reference'),
            ('eventName === "trad"', 'Event routing logic'),
        ]
        
        print(f"\n{js_path.name}:")
        for func, description in functions_to_check:
            exists = func in content
            status = "✓" if exists else "✗"
            print(f"  {status} {description}")
            
    except FileNotFoundError:
        print(f"  ✗ File not found!")

def check_html_event_ids():
    """Check if HTML files have correct event IDs"""
    print("\n\n🌐 Checking HTML Event IDs...")
    print("-" * 50)
    
    html_checks = [
        ('seating/trad/index.html', 'wedding-seating-chart-trad'),
        ('seating/trad/find-seat.html', 'wedding-seating-chart-trad'),
        ('seating/white/index.html', 'wedding-seating-chart-white'),
        ('seating/white/find-seat.html', 'wedding-seating-chart-white'),
    ]
    
    base_path = Path('/Users/temilola/Projects/telu')
    
    for html_file, expected_event_id in html_checks:
        html_path = base_path / html_file
        
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            exists = expected_event_id in content
            status = "✓" if exists else "✗"
            print(f"  {status} {html_file}")
            print(f"      → Event ID: {expected_event_id}")
            
        except FileNotFoundError:
            print(f"  ✗ {html_file} - File not found!")

def print_summary():
    """Print setup summary"""
    print("\n\n" + "=" * 50)
    print("✅ SETUP VERIFICATION COMPLETE")
    print("=" * 50)
    
    print("\n📋 Next Steps:")
    print("""
1. Upload guests to Firebase:
   cd /Users/temilola/Projects/telu/python
   python3 upload_guests_to_firebase.py

2. Verify in Firebase Console:
   - Check Firestore Database
   - Confirm guests_trad collection
   - Confirm guests_white collection

3. Test seating pages:
   - Open seating/trad/index.html
   - Open seating/white/index.html
   - Check browser console for guest loading messages

4. Start assigning guests to tables!
    """)

if __name__ == '__main__':
    print("\n🔍 GUEST DATABASE SETUP VERIFICATION")
    print("=" * 50)
    
    try:
        all_files_exist = check_files_exist()
        check_csv_structure()
        check_javascript()
        check_html_event_ids()
        print_summary()
        
        if all_files_exist:
            print("\n✨ All files are in place! Ready to upload guests.")
        else:
            print("\n⚠️  Some files are missing. Check above for details.")
            
    except Exception as e:
        print(f"\n❌ Error during verification: {str(e)}")
