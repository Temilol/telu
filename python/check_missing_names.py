#!/usr/bin/env python3
"""
Check for guests with missing First Name or Last Name
"""

import csv
from pathlib import Path

def check_missing_names(csv_file):
    """Find guests with missing names"""
    missing = []
    total = 0
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row_num, row in enumerate(reader, start=2):  # start at 2 (after header)
                total += 1
                first_name = row.get('First Name', '').strip()
                last_name = row.get('Last Name', '').strip()
                title = row.get('Title', '').strip()
                
                if not first_name or not last_name:
                    missing.append({
                        'row': row_num,
                        'title': title,
                        'firstName': first_name or '(empty)',
                        'lastName': last_name or '(empty)',
                    })
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return
    
    print(f"\n📋 Checking {csv_file}")
    print("=" * 60)
    print(f"Total rows: {total}")
    print(f"Missing names: {len(missing)}")
    print(f"Valid guests: {total - len(missing)}\n")
    
    if missing:
        print("❌ Guests with missing names:\n")
        for item in missing:
            print(f"  Row {item['row']:3d}: {item['title']:5s} | {item['firstName']:15s} | {item['lastName']:15s}")

if __name__ == '__main__':
    python_dir = Path(__file__).parent
    
    # Check traditional guests
    trad_csv = python_dir / 'traditionalGuests.csv'
    check_missing_names(str(trad_csv))
    
    # Check white reception guests
    white_csv = python_dir / 'weddingGuests.csv'
    check_missing_names(str(white_csv))
