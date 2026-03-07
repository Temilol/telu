// Firebase integration for guest management
// Handles loading and syncing guest data from Firestore

const FIREBASE_GUESTS_COLLECTION = "guests";

// Fetch all guests from Firebase
async function loadGuestsFromFirebase() {
  if (!window.firebaseInitialized) {
    console.log("Firebase not initialized, using fallback guests");
    return getFallbackGuests();
  }

  try {
    const querySnapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, FIREBASE_GUESTS_COLLECTION)
    );

    const guests = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Add primary guest
      guests.push({
        id: doc.id,
        name: data.name || "",
        ...data,
      });

      // Add additional guests (plus-ones) as separate entries
      if (data.additionalGuests && Array.isArray(data.additionalGuests)) {
        data.additionalGuests.forEach((additionalName) => {
          guests.push({
            id: `${doc.id}-${additionalName.toLowerCase().replace(/\s+/g, "-")}`,
            name: additionalName,
            partySize: 1,
            isPrimary: false,
          });
        });
      }
    });

    // Sort by name
    guests.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`✓ Loaded ${guests.length} guests from Firebase`);
    return guests;
  } catch (error) {
    console.error("Error loading guests from Firebase:", error);
    return getFallbackGuests();
  }
}

// Upload guests to Firebase (one-time migration)
async function uploadGuestsToFirebase(guests) {
  if (!window.firebaseInitialized) {
    console.error("❌ Firebase not initialized");
    alert("Firebase not initialized");
    return false;
  }

  if (!guests || guests.length === 0) {
    console.error("❌ No guests to upload");
    alert("No guests to upload");
    return false;
  }

  try {
    console.log(`Starting upload of ${guests.length} guests...`);
    
    for (const guest of guests) {
      const guestName = `${guest.firstName} ${guest.lastName}`.trim();
      const docId = guestName.toLowerCase().replace(/\s+/g, "-");
      
      const docRef = window.firebaseDoc(
        window.firebaseDB,
        FIREBASE_GUESTS_COLLECTION,
        docId
      );

      await window.firebaseSetDoc(docRef, {
        name: guestName,
        firstName: guest.firstName,
        lastName: guest.lastName,
        partySize: guest.partySize || 1,
        plusOne: guest.plusOne || false,
        additionalGuests: guest.additionalGuests || [],
      });
      
      console.log(`✓ Uploaded: ${guestName}`);
    }

    console.log(`✅ Successfully uploaded ${guests.length} guests to Firebase`);
    alert(`✅ Successfully uploaded ${guests.length} guests to Firebase!`);
    return true;
  } catch (error) {
    console.error("❌ Error uploading guests to Firebase:", error);
    alert(`❌ Error uploading guests: ${error.message}`);
    return false;
  }
}

// Get fallback guests from RSVP data (if Firebase unavailable)
function getFallbackGuests() {
  if (typeof guestList !== "undefined") {
    const guests = [];

    // Add primary guests
    guestList.forEach((guest) => {
      const fullName = `${guest.firstName} ${guest.lastName}`.trim();
      guests.push({
        id: `primary-${guest.id}`,
        name: fullName,
        firstName: guest.firstName,
        lastName: guest.lastName,
        partySize: guest.partySize,
        isPrimary: true,
      });

      // Add additional guests (plus ones)
      if (guest.additionalGuests && guest.additionalGuests.length > 0) {
        guest.additionalGuests.forEach((additionalName) => {
          guests.push({
            id: `additional-${guest.id}-${additionalName}`,
            name: additionalName,
            partySize: 1,
            isPrimary: false,
          });
        });
      }
    });

    guests.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`✓ Loaded ${guests.length} guests from RSVP data`);
    return guests;
  }

  return [];
}

// Get list of guests already assigned to tables
function getAssignedGuests(tables) {
  const assigned = new Set();
  tables.forEach((table) => {
    if (table.guests && Array.isArray(table.guests)) {
      table.guests.forEach((guest) => {
        assigned.add(guest.toLowerCase());
      });
    }
  });
  return assigned;
}

// Get available guests (not yet assigned)
function getAvailableGuests(allGuests, tables) {
  const assigned = getAssignedGuests(tables);
  return allGuests.filter(
    (guest) => !assigned.has(guest.name.toLowerCase())
  );
}

// Check if guest is already assigned
function isGuestAssigned(guestName, tables) {
  const assigned = getAssignedGuests(tables);
  return assigned.has(guestName.toLowerCase());
}

// Get which table a guest is assigned to
function findGuestTable(guestName, tables) {
  for (const table of tables) {
    if (
      table.guests &&
      table.guests.some((g) => g.toLowerCase() === guestName.toLowerCase())
    ) {
      return table.number;
    }
  }
  return null;
}
