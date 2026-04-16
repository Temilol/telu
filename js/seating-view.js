/**
 * Shared seating view logic for displaying read-only seating charts
 * Requires: window.currentEventId to be set before loading this script
 * Requires: Firebase initialization (window.firebaseInitialized, window.firebaseDB, etc.)
 */

let seatingData = {
  tables: [],
  headTable: { x: 50, y: 8 },
  danceFloor: { x: 50, y: 92 },
};

// Load seating data from Firebase
async function loadSeatingChart() {
  try {
    if (!window.firebaseInitialized) {
      document.getElementById("content").innerHTML =
        '<p style="color: red;">❌ Firebase not initialized</p>';
      return;
    }

    const collectionName = window.currentEventId.includes("trad")
      ? "seating-trad"
      : "seating-white";
    const docId = "wedding-seating-chart";
    devLog(`Loading from collection: ${collectionName}, doc: ${docId}`);

    const docRef = window.firebaseDoc(window.firebaseDB, collectionName, docId);
    const docSnap = await window.firebaseGetDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      devLog("Document data:", data);
      seatingData.tables = data.tables || [];
      displaySeatingChart();
    } else {
      devLog(`Document not found. Tried: ${collectionName}/${docId}`);
      document.getElementById("content").innerHTML =
        '<p style="text-align: center; padding: 40px;">No seating chart data found. Please create tables in the editor first.</p>';
    }
  } catch (error) {
    devError("Error loading seating chart:", error);
    document.getElementById("content").innerHTML =
      '<p style="color: red;">❌ Error loading seating chart: ' +
      error.message +
      "</p>";
  }
}

// Display seating chart as grid
function displaySeatingChart() {
  const content = document.getElementById("content");

  if (seatingData.tables.length === 0) {
    content.innerHTML =
      '<p style="text-align: center; padding: 40px;">No tables configured yet.</p>';
    return;
  }

  // Sort tables by number
  const sortedTables = [...seatingData.tables].sort(
    (a, b) => a.number - b.number,
  );

  let html = '<div class="seating-grid">';

  sortedTables.forEach((table) => {
    html += `
      <div class="table-card">
        <div class="table-number">Table ${table.number}</div>
        <ul class="guests-list">
    `;

    if (table.guests && table.guests.length > 0) {
      table.guests.forEach((guest) => {
        html += `<li class="guest-item">${guest}</li>`;
      });
    } else {
      html +=
        '<li class="guest-item" style="color: #bbb; font-style: italic;">No guests assigned</li>';
    }

    html += `
        </ul>
      </div>
    `;
  });

  html += "</div>";

  content.innerHTML = html;
}

// Initialize on page load with retry for Firebase initialization
document.addEventListener("DOMContentLoaded", function () {
  // Retry logic to wait for Firebase to be initialized
  let retries = 0;
  const maxRetries = 50; // 5 seconds max (50 * 100ms)

  const retryLoad = () => {
    if (window.firebaseInitialized) {
      loadSeatingChart();
    } else if (retries < maxRetries) {
      retries++;
      setTimeout(retryLoad, 100);
    } else {
      document.getElementById("content").innerHTML =
        '<p style="color: red;">❌ Failed to initialize Firebase. Please refresh the page.</p>';
    }
  };

  retryLoad();
});
