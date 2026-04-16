/**
 * Seating Event Configuration
 * Manages which event is currently active (stored in Firebase)
 * Used by guest pages to know which seating data to display
 */

const FIREBASE_CONFIG_COLLECTION = "config";
const FIREBASE_CONFIG_DOC = "activeEvent";
const DEFAULT_ACTIVE_EVENT = "trad"; // Default to traditional

/**
 * Get the currently active event from Firebase
 * @returns {Promise<string>} "trad" or "white"
 */
async function getActiveEvent() {
  if (!window.firebaseInitialized) {
    devWarn(
      "Firebase not initialized, using default event: " + DEFAULT_ACTIVE_EVENT,
    );
    return DEFAULT_ACTIVE_EVENT;
  }

  if (!window.firebaseDoc || !window.firebaseDB || !window.firebaseGetDoc) {
    devWarn(
      "Firebase functions not available, using default event: " +
        DEFAULT_ACTIVE_EVENT,
    );
    return DEFAULT_ACTIVE_EVENT;
  }

  try {
    const docRef = window.firebaseDoc(
      window.firebaseDB,
      FIREBASE_CONFIG_COLLECTION,
      FIREBASE_CONFIG_DOC,
    );
    const docSnap = await window.firebaseGetDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const activeEvent = data.activeEvent || DEFAULT_ACTIVE_EVENT;
      devLog(`✓ Active event loaded from Firebase: ${activeEvent}`);
      return activeEvent;
    } else {
      devLog(
        `No config found in Firebase, using default: ${DEFAULT_ACTIVE_EVENT}`,
      );
      return DEFAULT_ACTIVE_EVENT;
    }
  } catch (error) {
    devError("Error loading active event from Firebase:", error);
    return DEFAULT_ACTIVE_EVENT;
  }
}

/**
 * Set the active event in Firebase (admin only)
 * @param {string} eventId - "trad" or "white"
 * @returns {Promise<boolean>} Success status
 */
async function setActiveEvent(eventId) {
  if (!window.firebaseInitialized) {
    devError("Firebase not initialized");
    throw new Error("Firebase not configured");
  }

  if (!window.firebaseDoc || !window.firebaseDB || !window.firebaseSetDoc) {
    devError("Firebase functions not available:", {
      firebaseDoc: !!window.firebaseDoc,
      firebaseDB: !!window.firebaseDB,
      firebaseSetDoc: !!window.firebaseSetDoc,
    });
    throw new Error("Firebase functions not loaded");
  }

  if (!["trad", "white"].includes(eventId)) {
    devError("Invalid event ID:", eventId);
    throw new Error("Invalid event ID");
  }

  try {
    devLog(`Saving active event to Firebase: ${eventId}`);

    const docRef = window.firebaseDoc(
      window.firebaseDB,
      FIREBASE_CONFIG_COLLECTION,
      FIREBASE_CONFIG_DOC,
    );

    await window.firebaseSetDoc(docRef, {
      activeEvent: eventId,
      lastUpdated: new Date().toISOString(),
      updatedBy: "Admin",
    });

    devLog(`✓ Active event set to: ${eventId}`);
    return true;
  } catch (error) {
    devError("Error saving active event:", error);
    throw error;
  }
}

/**
 * Get the event-specific collection name
 * @param {string} eventId - "trad" or "white"
 * @returns {string} Collection name
 */
function getEventCollection(eventId) {
  if (eventId.includes("trad")) {
    return "seating-trad";
  } else if (eventId.includes("white")) {
    return "seating-white";
  }
  return "seating-charts";
}
