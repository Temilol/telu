#!/usr/bin/env python3
"""
Compare CSV file with Firebase to find missing or duplicate guests
"""

import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

def load_csv_guests(csv_file):
    """Load guests from CSV file"""
    guests = {}
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row_num, row in enumerate(reader, start=2):
                first_name = row.get('First Name', '').strip()
                last_name = row.get('Last Name', '').strip()
                
                # Skip empty names
                if not first_name or not last_name:
                    continue
                
                full_name = f"{first_name} {last_name}".strip()
                doc_id = full_name.lower().replace(' ', '-').replace('.', '')
                
                guests[doc_id] = {
                    'row': row_num,
                    'name': full_name,
                    'firstName': first_name,
                    'lastName': last_name,
                }
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return {}
    
    return guests

def load_firebase_guests(collection_name):
    """Load guests from Firebase collection"""
    try:
        app = firebase_admin.get_app()
    except ValueError:
        cred_path = Path(__file__).parent.parent / 'serviceAccountKey.json'
        if not cred_path.exists():
            print(f"❌ Firebase credentials not found at {cred_path}")
            return {}
        
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    guests = {}
    
    try:
        docs = db.collection(collection_name).stream()
        for doc in docs:
            # Check if document exists and has data
            if doc.exists:
                data = doc.to_dict()
                guests[doc.id] = {
                    'name': data.get('name', ''),
                    'firstName': data.get('firstName', ''),
                    'lastName': data.get('lastName', ''),
                    'title': data.get('title', ''),
                    'event': data.get('event', ''),
                }
    except Exception as e:
        print(f"❌ Error reading from Firebase: {str(e)}")
        return {}
    
    return guests

def compare_guests(csv_file, collection_name, event_name):
    """Compare CSV guests with Firebase guests"""
    print(f"\n{'='*60}")
    print(f"📊 Comparing {event_name} Guests")
    print(f"{'='*60}")
    
    csv_guests = load_csv_guests(csv_file)
    firebase_guests = load_firebase_guests(collection_name)
    
    print(f"\n📝 CSV File: {csv_file}")
    print(f"   Total rows processed: {len(csv_guests)}")
    
    print(f"\n☁️  Firebase Collection: {collection_name}")
    print(f"   Total documents: {len(firebase_guests)}")
    
    # Find missing guests (in CSV but not in Firebase)
    missing_in_firebase = []
    for doc_id, guest in csv_guests.items():
        if doc_id not in firebase_guests:
            missing_in_firebase.append((doc_id, guest))
    
    # Find extra guests (in Firebase but not in CSV)
    extra_in_firebase = []
    for doc_id, guest in firebase_guests.items():
        if doc_id not in csv_guests:
            extra_in_firebase.append((doc_id, guest))
    
    # Print results
    if not missing_in_firebase and not extra_in_firebase:
        print(f"\n✅ Perfect match! All {len(csv_guests)} guests match Firebase.")
        return
    
    if missing_in_firebase:
        print(f"\n❌ {len(missing_in_firebase)} guests in CSV but NOT in Firebase:")
        for doc_id, guest in missing_in_firebase[:5]:  # Show first 5
            print(f"   Row {guest['row']:3d}: {guest['name']}")
            print(f"      ID would be: {doc_id}")
    
    if extra_in_firebase:
        print(f"\n⚠️  {len(extra_in_firebase)} guests in Firebase but NOT in CSV:")
        print(f"   (This might be from previous uploads)")
        for doc_id, guest in extra_in_firebase[:5]:  # Show first 5
            print(f"   {guest['name']} (ID: {doc_id})")
    
    print(f"\n📈 Summary:")
    print(f"   CSV guests:       {len(csv_guests)}")
    print(f"   Firebase guests:  {len(firebase_guests)}")
    print(f"   Difference:       {len(firebase_guests) - len(csv_guests)}")

if __name__ == '__main__':
    python_dir = Path(__file__).parent
    
    # Compare traditional guests
    trad_csv = python_dir / 'traditionalGuests.csv'
    compare_guests(str(trad_csv), 'guests_trad', 'Traditional Ceremony')
    
    # Compare white reception guests
    white_csv = python_dir / 'weddingGuests.csv'
    compare_guests(str(white_csv), 'guests_white', 'White Reception')
