// Firebase integration for seating chart
// Handles cloud storage and real-time sync

const FIREBASE_DOCUMENT_ID = "wedding-seating-chart";

// Load seating data from Firebase
async function loadFromFirebase() {
  if (!window.firebaseInitialized) {
    console.log("Firebase not initialized, loading from local file");
    return false;
  }

  try {
    const docRef = window.firebaseDoc(
      window.firebaseDB,
      "seating-charts",
      FIREBASE_DOCUMENT_ID,
    );
    const docSnap = await window.firebaseGetDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      seatingData.tables = data.tables || [];
      seatingData.headTable = data.headTable || { x: 50, y: 8 };
      seatingData.danceFloor = data.danceFloor || { x: 50, y: 92 };
      console.log("✓ Loaded seating data from Firebase");
      return true;
    } else {
      console.log("No Firebase data found, using default");
      return false;
    }
  } catch (error) {
    console.error("Error loading from Firebase:", error);
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
    const exportData = {
      tables: seatingData.tables.map((table) => ({
        number: table.number,
        x: table.x,
        y: table.y,
        guests: table.guests,
      })),
      headTable: seatingData.headTable || { x: 50, y: 8 },
      danceFloor: seatingData.danceFloor || { x: 50, y: 92 },
      lastUpdated: new Date().toISOString(),
      updatedBy: "Admin",
    };

    const docRef = window.firebaseDoc(
      window.firebaseDB,
      "seating-charts",
      FIREBASE_DOCUMENT_ID,
    );
    await window.firebaseSetDoc(docRef, exportData);

    console.log("✓ Saved to Firebase");
    return true;
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    alert(`❌ Failed to save to Firebase: ${error.message}`);
    return false;
  }
}

// Auto-save when changes are made
function enableAutoSave() {
  let saveTimeout;

  window.autoSaveToFirebase = function () {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
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
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = "✓ Saved to cloud";
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Initialize Firebase integration
document.addEventListener("DOMContentLoaded", function () {
  enableAutoSave();
});
