#!/usr/bin/env python3
"""
Remove placeholder guest rows from CSV files
"""

import csv
from pathlib import Path

def clean_csv_file(csv_file):
    """Remove rows where First Name is 'Guest' or both names are empty"""
    print(f"\n📝 Cleaning {csv_file.name}...")
    
    rows = []
    removed = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            header = reader.fieldnames
            
            for row_num, row in enumerate(reader, start=2):
                first_name = row.get('First Name', '').strip()
                last_name = row.get('Last Name', '').strip()
                
                # Keep only rows with valid names
                if first_name and last_name and first_name.lower() != 'guest':
                    rows.append(row)
                else:
                    removed.append({
                        'row': row_num,
                        'firstName': first_name or '(empty)',
                        'lastName': last_name or '(empty)',
                    })
        
        # Write cleaned file
        with open(csv_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"   ✅ Removed {len(removed)} placeholder rows")
        print(f"   ✅ Kept {len(rows)} valid guest rows")
        
        if removed:
            print(f"\n   Removed rows:")
            for item in removed[:5]:
                print(f"     Row {item['row']:3d}: {item['firstName']:15s} | {item['lastName']:15s}")
            if len(removed) > 5:
                print(f"     ... and {len(removed) - 5} more")
        
        return len(removed) > 0
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

if __name__ == '__main__':
    python_dir = Path(__file__).parent
    
    print("="*60)
    print("🧹 CLEANING PLACEHOLDER GUEST ROWS")
    print("="*60)
    
    # Clean traditional guests
    trad_csv = python_dir / 'traditionalGuests.csv'
    trad_changed = clean_csv_file(trad_csv)
    
    # Clean white reception guests
    white_csv = python_dir / 'weddingGuests.csv'
    white_changed = clean_csv_file(white_csv)
    
    print("\n" + "="*60)
    if trad_changed or white_changed:
        print("✨ CSV files cleaned! You should re-upload to Firebase:")
        print("   python3 upload_guests_to_firebase.py")
    else:
        print("✅ No placeholder rows found")
    print("="*60)
