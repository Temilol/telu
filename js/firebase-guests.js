// Firebase integration for guest management
// Handles loading and syncing guest data from Firestore
// Supports separate guest collections for different events (trad, white)

// Determine which collection to use based on the current event
function getGuestCollectionName() {
  if (typeof window.currentEventId === "undefined") {
    devWarn("⚠️  currentEventId not set, using default collection");
    return "guests";
  }

  if (window.currentEventId.includes("trad")) {
    return "guests_trad";
  } else if (window.currentEventId.includes("white")) {
    return "guests_white";
  }

  return "guests";
}

// Fetch all guests from Firebase for the current event
async function loadGuestsFromFirebase() {
  if (!window.firebaseInitialized) {
    devLog("Firebase not initialized, using fallback guests");
    return getFallbackGuests();
  }

  try {
    const collectionName = getGuestCollectionName();
    devLog(`📍 Loading guests from collection: ${collectionName}`);

    const querySnapshot = await window.firebaseGetDocs(
      window.firebaseCollection(window.firebaseDB, collectionName),
    );

    const guests = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Add guest
      guests.push({
        id: doc.id,
        name: data.name || "",
        title: data.title || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        event: data.event || "",
        ...data,
      });

      // Add additional guests (plus-ones) as separate entries if they exist
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
    devLog(
      `✓ Loaded ${guests.length} guests from Firebase (${collectionName})`,
    );
    return guests;
  } catch (error) {
    devError("Error loading guests from Firebase:", error);
    return getFallbackGuests();
  }
}

// Upload guests to Firebase (one-time migration)
// Supports uploading to event-specific collections
async function uploadGuestsToFirebase(guests, eventName = "trad") {
  if (!window.firebaseInitialized) {
    devError("❌ Firebase not initialized");
    alert("Firebase not initialized");
    return false;
  }

  if (!guests || guests.length === 0) {
    devError("❌ No guests to upload");
    alert("No guests to upload");
    return false;
  }

  const collectionName =
    eventName === "trad"
      ? "guests_trad"
      : eventName === "white"
        ? "guests_white"
        : "guests";

  try {
    devLog(
      `Starting upload of ${guests.length} guests to ${collectionName}...`,
    );

    for (const guest of guests) {
      const guestName = `${guest.firstName} ${guest.lastName}`.trim();
      const docId = guestName.toLowerCase().replace(/\s+/g, "-");

      const docRef = window.firebaseDoc(
        window.firebaseDB,
        collectionName,
        docId,
      );

      await window.firebaseSetDoc(docRef, {
        name: guestName,
        firstName: guest.firstName,
        lastName: guest.lastName,
        title: guest.title || "",
        event: eventName,
        partySize: guest.partySize || 1,
        plusOne: guest.plusOne || false,
        additionalGuests: guest.additionalGuests || [],
      });

      devLog(`✓ Uploaded: ${guestName}`);
    }

    devLog(
      `✅ Successfully uploaded ${guests.length} guests to ${collectionName}`,
    );
    alert(
      `✅ Successfully uploaded ${guests.length} guests to ${collectionName}!`,
    );
    return true;
  } catch (error) {
    devError("❌ Error uploading guests to Firebase:", error);
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
    devLog(`✓ Loaded ${guests.length} guests from RSVP data`);
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
  return allGuests.filter((guest) => !assigned.has(guest.name.toLowerCase()));
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
