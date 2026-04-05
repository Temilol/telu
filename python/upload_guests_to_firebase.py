#!/usr/bin/env python3
"""
Upload guests from CSV files to Firebase Firestore.
Uses separate collections for trad and white events.
"""

import csv
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

def load_guest_csv(csv_file):
    """Load guests from CSV file"""
    guests = []
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Skip empty rows
                if not row.get('First Name') or not row.get('Last Name'):
                    continue
                
                guest = {
                    'title': row.get('Title', '').strip(),
                    'firstName': row.get('First Name', '').strip(),
                    'lastName': row.get('Last Name', '').strip(),
                }
                
                # Add Household ID if it exists in the CSV
                household_id = row.get('Household ID', '').strip()
                if household_id:
                    try:
                        guest['householdId'] = int(household_id)
                    except ValueError:
                        # Skip invalid household IDs
                        pass
                
                guests.append(guest)
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return []
    
    return guests

def upload_guests_to_firebase(csv_file, event_name, collection_name):
    """Upload guests from CSV to Firebase collection"""
    
    # Initialize Firebase (assumes credentials file exists)
    try:
        # Try to get existing app
        app = firebase_admin.get_app()
    except ValueError:
        # Initialize if not already done
        cred_path = Path(__file__).parent.parent / 'serviceAccountKey.json'
        if not cred_path.exists():
            print(f"❌ Firebase credentials not found at {cred_path}")
            print("Please place your serviceAccountKey.json in the project root")
            return False
        
        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    # Load guests from CSV
    guests = load_guest_csv(csv_file)
    if not guests:
        print(f"❌ No guests loaded from {csv_file}")
        return False
    
    print(f"\n📥 Uploading {len(guests)} {event_name} guests to Firebase...")
    print(f"📍 Collection: {collection_name}\n")
    
    success_count = 0
    error_count = 0
    
    try:
        # Delete existing collection first (optional - comment out to keep existing data)
        # print(f"🗑️  Clearing existing collection {collection_name}...")
        # docs = db.collection(collection_name).stream()
        # for doc in docs:
        #     doc.reference.delete()
        
        for i, guest in enumerate(guests, 1):
            try:
                full_name = f"{guest['firstName']} {guest['lastName']}".strip()
                doc_id = full_name.lower().replace(' ', '-').replace('.', '')
                
                # Create document with household ID if available
                doc_data = {
                    'name': full_name,
                    'firstName': guest['firstName'],
                    'lastName': guest['lastName'],
                    'title': guest['title'],
                    'event': event_name,
                }
                
                # Add household ID if it exists
                if 'householdId' in guest:
                    doc_data['householdId'] = guest['householdId']
                
                db.collection(collection_name).document(doc_id).set(doc_data)
                
                print(f"  ✓ [{i:3d}] {full_name}")
                success_count += 1
            except Exception as e:
                print(f"  ✗ [{i:3d}] Error uploading guest: {str(e)}")
                error_count += 1
    
    except Exception as e:
        print(f"❌ Error accessing Firebase: {str(e)}")
        return False
    
    print(f"\n✅ Upload complete!")
    print(f"   📊 Success: {success_count}")
    print(f"   📊 Errors: {error_count}")
    
    return error_count == 0

def main():
    """Main function"""
    python_dir = Path(__file__).parent
    
    # Upload traditional guests
    trad_csv = python_dir / 'traditionalGuests.csv'
    upload_guests_to_firebase(str(trad_csv), 'trad', 'guests_trad')
    
    # Upload white reception guests
    white_csv = python_dir / 'weddingGuests.csv'
    upload_guests_to_firebase(str(white_csv), 'white', 'guests_white')
    
    print("\n" + "="*60)
    print("✨ All guests uploaded to Firebase!")
    print("="*60)

if __name__ == '__main__':
    main()
