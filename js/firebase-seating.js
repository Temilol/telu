// Firebase integration for seating chart
// Handles cloud storage and real-time sync

// Track if save is in progress or pending
let isSavingToFirebase = false;
let hasPendingSave = false;

// Create and manage spinner for saves in progress
function initSaveSpinner() {
  // Check if spinner already exists
  if (document.getElementById("save-spinner")) {
    return;
  }

  const spinner = document.createElement("div");
  spinner.id = "save-spinner";
  spinner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 24px;
    height: 24px;
    border: 3px solid #e0e0e0;
    border-top: 3px solid #1976d2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 10000;
    display: none;
  `;
  document.body.appendChild(spinner);

  // Add CSS animation if not already present
  if (!document.getElementById("save-spinner-style")) {
    const style = document.createElement("style");
    style.id = "save-spinner-style";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Show or hide the save spinner
function updateSaveSpinner() {
  const spinner = document.getElementById("save-spinner");
  if (!spinner) return;

  if (isSavingToFirebase || hasPendingSave) {
    spinner.style.display = "block";
  } else {
    spinner.style.display = "none";
  }
}

// Get event-specific collection name based on currentEventId
function getSeatingCollectionName() {
  if (typeof window.currentEventId === "undefined") {
    devWarn("⚠️  currentEventId not set, using default collection");
    return "seating-charts";
  }

  if (window.currentEventId.includes("trad")) {
    return "seating-trad";
  } else if (window.currentEventId.includes("white")) {
    return "seating-white";
  }

  return "seating-charts";
}

// Use a consistent document ID across all seating collections
const FIREBASE_DOCUMENT_ID = "wedding-seating-chart";

// Load seating data from Firebase
async function loadFromFirebase() {
  if (!window.firebaseInitialized) {
    devLog("Firebase not initialized, loading from local file");
    return false;
  }

  try {
    const collectionName = getSeatingCollectionName();
    devLog(`📍 Loading seating from collection: ${collectionName}`);

    const docRef = window.firebaseDoc(
      window.firebaseDB,
      collectionName,
      FIREBASE_DOCUMENT_ID,
    );
    const docSnap = await window.firebaseGetDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      seatingData.tables = data.tables || [];
      seatingData.headTable = data.headTable || { x: 50, y: 8 };
      seatingData.danceFloor = data.danceFloor || { x: 50, y: 92 };
      devLog(`✓ Loaded seating data from Firebase (${collectionName})`);

      // Update guest statistics if function exists
      if (typeof updateGuestStats === "function") {
        updateGuestStats();
      }

      // Refresh unseated panel now that seating data is loaded
      if (typeof updateUnseatedPanel === "function") {
        updateUnseatedPanel();
      }

      return true;
    } else {
      devLog("No Firebase data found, using default");
      return false;
    }
  } catch (error) {
    devError("Error loading from Firebase:", error);
    return false;
  }
}

// Save seating data to Firebase
async function saveToFirebase() {
  if (!window.firebaseInitialized) {
    alert("❌ Firebase not configured. Please check your Firebase settings.");
    return false;
  }

  try {
    isSavingToFirebase = true;
    updateSaveSpinner();
    const collectionName = getSeatingCollectionName();

    const exportData = {
      tables: seatingData.tables.map((table) => ({
        number: table.number,
        x: typeof table.x === "number" ? table.x : 50,
        y: typeof table.y === "number" ? table.y : 50,
        guests: Array.isArray(table.guests) ? table.guests : [],
        maxGuests: Number(table.maxGuests) || 10,
      })),
      headTable: seatingData.headTable || { x: 50, y: 8 },
      danceFloor: seatingData.danceFloor || { x: 50, y: 92 },
      lastUpdated: new Date().toISOString(),
      updatedBy: "Admin",
    };

    // Log the data being sent to Firebase for debugging
    devLog("Sending to Firebase:", JSON.stringify(exportData, null, 2));

    // Check for any undefined values before sending
    const hasUndefined = (obj, path = "") => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        if (obj[key] === undefined) {
          devError(`Found undefined at: ${currentPath}`);
          return true;
        }
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (hasUndefined(obj[key], currentPath)) {
            return true;
          }
        }
      }
      return false;
    };

    if (hasUndefined(exportData)) {
      devError("Data contains undefined values! Fix before send.");
      alert(
        "❌ Data validation failed: undefined values detected. Check console.",
      );
      isSavingToFirebase = false;
      updateSaveSpinner();
      return false;
    }

    const docRef = window.firebaseDoc(
      window.firebaseDB,
      collectionName,
      FIREBASE_DOCUMENT_ID,
    );
    await window.firebaseSetDoc(docRef, exportData);

    devLog(`✓ Saved to Firebase (${collectionName})`);
    isSavingToFirebase = false;
    updateSaveSpinner();
    return true;
  } catch (error) {
    devError("Error saving to Firebase:", error);
    alert(`❌ Failed to save to Firebase: ${error.message}`);
    isSavingToFirebase = false;
    updateSaveSpinner();
    return false;
  }
}

// Auto-save when changes are made
function enableAutoSave() {
  let saveTimeout;

  window.autoSaveToFirebase = function () {
    clearTimeout(saveTimeout);
    hasPendingSave = true;
    updateSaveSpinner();
    saveTimeout = setTimeout(async () => {
      hasPendingSave = false;
      updateSaveSpinner();
      const saved = await saveToFirebase();
      if (saved) {
        showSaveNotification();
      }
    }, 2000); // Save 2 seconds after last change
  };
}

// Show save notification
function showSaveNotification() {
  const notification = document.createElement("div");

  // Get the potentially fullscreen element
  const fullscreenEl = document.fullscreenElement;
  const isFullscreen = fullscreenEl !== null;

  if (isFullscreen) {
    // In fullscreen - use absolute positioning inside the fullscreen element
    notification.style.cssText = `
      position: absolute;
      bottom: 120px;
      left: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2147483647;
      animation: slideIn 0.3s ease-out;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid rgba(255,255,255,0.3);
    `;
    fullscreenEl.appendChild(notification);
  } else {
    // Normal mode - use fixed positioning in body
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 2147483647;
      animation: slideIn 0.3s ease-out;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid rgba(255,255,255,0.3);
    `;
    document.body.appendChild(notification);
  }

  notification.textContent = "✓ Changes saved";

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 2000);
}

// Warn user if they try to leave while saving is in progress
window.addEventListener("beforeunload", (event) => {
  if (isSavingToFirebase || hasPendingSave) {
    // Modern browsers show their own message, but we set returnValue to trigger the warning
    event.returnValue = "";
    return "";
  }
});

// Initialize the save spinner when page loads
document.addEventListener("DOMContentLoaded", () => {
  initSaveSpinner();
});

// Initialize Firebase integration
document.addEventListener("DOMContentLoaded", function () {
  enableAutoSave();
});
