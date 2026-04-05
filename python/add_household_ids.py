#!/usr/bin/env python3
"""
Script to add household IDs to rsvp_guests.csv.

This script reads full_guests.csv to identify households and assign unique IDs,
then adds those IDs to rsvp_guests.csv based on guest matching.
"""

import csv
from collections import defaultdict
from typing import Dict, List, Tuple, Set


def parse_full_guests(filepath: str) -> Tuple[Dict[str, int], Dict[Tuple, int]]:
    """
    Parse full_guests.csv and create household IDs.
    
    Returns:
        - households_by_id: {household_id: count}
        - guest_to_household: {(first_name, last_name): household_id}
    """
    households = []
    guest_to_household = {}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        processed_households = set()
        household_id = 1
        
        for row in reader:
            # Extract primary person
            first_name = row.get('First Name', '').strip()
            last_name = row.get('Last Name', '').strip()
            partner_first = row.get('Partner First Name', '').strip()
            partner_last = row.get('Partner Last Name', '').strip()
            
            # Skip rows without a name
            if not first_name or not last_name:
                continue
            
            # Create household identifier - combination of primary and partner
            household_key = tuple(sorted([
                (first_name, last_name),
                (partner_first, partner_last) if partner_first and partner_last else ()
            ]))
            
            # Skip if we've already processed this household
            if household_key in processed_households:
                continue
            
            processed_households.add(household_key)
            
            # Add primary guest to household
            guest_key = (first_name, last_name)
            guest_to_household[guest_key] = household_id
            
            # Add partner to household if exists
            if partner_first and partner_last:
                partner_key = (partner_first, partner_last)
                guest_to_household[partner_key] = household_id
            
            # Add children to household
            for i in range(1, 6):  # Children 1-5
                child_first = row.get(f'Child {i} First Name', '').strip()
                child_last = row.get(f'Child {i} Last Name', '').strip()
                
                if child_first and child_last:
                    child_key = (child_first, child_last)
                    guest_to_household[child_key] = household_id
            
            households.append({
                'household_id': household_id,
                'primary': (first_name, last_name),
                'partner': (partner_first, partner_last) if partner_first and partner_last else None,
                'count': int(row.get('Total Definitely Invited', 1)) if row.get('Total Definitely Invited') else 1
            })
            
            household_id += 1
    
    return households, guest_to_household


def find_household_id(first_name: str, last_name: str, 
                     guest_to_household: Dict[Tuple, int]) -> int:
    """
    Find the household ID for a guest.
    
    Returns:
        Household ID, or -1 if not found
    """
    guest_key = (first_name.strip(), last_name.strip())
    return guest_to_household.get(guest_key, -1)


def add_household_ids_to_rsvp(
    input_file: str,
    output_file: str,
    guest_to_household: Dict[Tuple, int]
) -> None:
    """
    Add household IDs to rsvp_guests.csv.
    """
    rows = []
    not_found = []
    
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        
        # Add household_id to the beginning
        new_fieldnames = ['Household ID'] + fieldnames
        
        for row in reader:
            first_name = row.get('First Name', '').strip()
            last_name = row.get('Last Name', '').strip()
            
            household_id = find_household_id(first_name, last_name, guest_to_household)
            
            if household_id == -1:
                not_found.append((first_name, last_name))
                print(f"Warning: Guest not found in full_guests.csv: {first_name} {last_name}")
            
            # Create new row with household ID
            new_row = {'Household ID': household_id}
            new_row.update(row)
            rows.append(new_row)
    
    # Write to output file
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=new_fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"\n✓ Successfully created {output_file}")
    print(f"  - Total guests processed: {len(rows)}")
    print(f"  - Guests not found: {len(not_found)}")
    
    if not_found:
        print("\nGuests not found in full_guests.csv:")
        for first_name, last_name in not_found[:10]:  # Show first 10
            print(f"  - {first_name} {last_name}")
        if len(not_found) > 10:
            print(f"  ... and {len(not_found) - 10} more")


def main():
    """Main function."""
    print("Starting household ID assignment...\n")
    
    full_guests_file = 'full_guests.csv'
    rsvp_input_file = 'rsvp_guests.csv'
    rsvp_output_file = 'guests.csv'
    
    # Parse full guests and create households
    print(f"Reading {full_guests_file}...")
    households, guest_to_household = parse_full_guests(full_guests_file)
    print(f"✓ Identified {len(households)} unique households")
    print(f"✓ Mapped {len(guest_to_household)} guests to households\n")
    
    # Add household IDs to RSVP
    print(f"Processing {rsvp_input_file}...")
    add_household_ids_to_rsvp(rsvp_input_file, rsvp_output_file, guest_to_household)
    
    print("\nHousehold ID Summary:")
    print(f"  - Total households: {len(households)}")
    print(f"  - Household IDs range: 1 to {len(households)}")


if __name__ == '__main__':
    main()
