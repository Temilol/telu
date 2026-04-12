// Seating Chart Data
// Data is loaded from Firebase
let seatingData = {
  tables: [],
  headTable: { x: 50, y: 8 },
  danceFloor: { x: 50, y: 92 },
};

// Create a flattened guest lookup for easy searching
const guestLookup = {};
window.guestLookup = guestLookup; // Expose globally for admin functions

// Function to update guest lookup (exposed globally for admin functions)
function updateGuestLookup() {
  // Clear existing lookup
  for (const key in guestLookup) {
    delete guestLookup[key];
  }

  // Rebuild lookup
  seatingData.tables.forEach((table) => {
    table.guests.forEach((guest) => {
      guestLookup[guest.toLowerCase()] = {
        name: guest,
        tableNumber: table.number,
        tablemates: table.guests.filter((g) => g !== guest),
      };
    });
  });
}

// Expose updateGuestLookup globally
window.updateGuestLookup = updateGuestLookup;

// Initialize the page
document.addEventListener("DOMContentLoaded", async function () {
  // Skip auto-load if we're on a guest-facing page (find-seat)
  if (window.skipAutoLoadSeating) {
    console.log("⏭️  Skipping auto-load seating (guest page will handle it)");
    return;
  }

  // Load seating data from Firebase
  if (window.firebaseInitialized && typeof loadFromFirebase === "function") {
    await loadFromFirebase();
  }

  // Update guest lookup after data is loaded
  updateGuestLookup();

  // Apply head table and dance floor positions if they exist
  applyFixedElementPositions();

  renderTables();

  // Only setup search if search elements exist
  if (document.getElementById("guestSearch")) {
    setupSearch();
  }

  // Make head table and dance floor draggable
  makeHeadTableDraggable();
  makeDanceFloorDraggable();
});

// Render all tables in the seating chart with spatial positioning
function renderTables() {
  const container = document.getElementById("venueMap");

  seatingData.tables.forEach((table) => {
    const tableElement = createTableElement(table);
    container.appendChild(tableElement);
  });
}

// Create a table element positioned on the venue map
function createTableElement(table) {
  const tableDiv = document.createElement("div");
  tableDiv.className = "venue-table";
  tableDiv.id = `table-${table.number}`;
  tableDiv.style.left = `${table.x}%`;
  tableDiv.style.top = `${table.y}%`;
  tableDiv.dataset.tableNumber = table.number;
  tableDiv.draggable = false; // We'll use mouse events for smoother dragging

  // Edit button
  const editBtn = document.createElement("div");
  editBtn.className = "edit-table-btn";
  editBtn.innerHTML =
    '<i class="fa-solid fa-pen-to-square" style="color: black;"></i>';
  editBtn.title = "Edit table";
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.editTable) {
      window.editTable(table.number);
    }
  });

  // Delete button
  const deleteBtn = document.createElement("div");
  deleteBtn.className = "delete-table-btn";
  deleteBtn.innerHTML = "×";
  deleteBtn.title = "Delete table";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (window.deleteTable) {
      window.deleteTable(table.number);
    }
  });

  // Table circle/icon
  const tableIcon = document.createElement("div");
  tableIcon.className = "table-circle";
  tableIcon.innerHTML = `
    <div class="table-number-badge">Table ${table.number}</div>
  `;

  // Tooltip with guest list (hidden by default, shown on View Guests click)
  const tooltip = document.createElement("div");
  tooltip.className = "table-tooltip";

  const tooltipHeader = document.createElement("div");
  tooltipHeader.className = "tooltip-header";
  tooltipHeader.textContent = `Table ${table.number}`;

  // Close button for tooltip
  const closeBtn = document.createElement("button");
  closeBtn.className = "tooltip-close-btn";
  closeBtn.innerHTML = "×";
  closeBtn.title = "Close";
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    tableDiv.classList.remove("active");
  });

  tooltipHeader.appendChild(closeBtn);

  const guestList = document.createElement("ul");
  guestList.className = "tooltip-guest-list";

  table.guests.forEach((guest) => {
    const guestItem = document.createElement("li");
    guestItem.textContent = guest;
    guestItem.dataset.guestName = guest.toLowerCase();
    guestList.appendChild(guestItem);
  });

  tooltip.appendChild(tooltipHeader);
  tooltip.appendChild(guestList);

  // View Guests button
  const viewGuestsBtn = document.createElement("button");
  viewGuestsBtn.className = "view-guests-btn";
  viewGuestsBtn.style.color = "black";
  viewGuestsBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  viewGuestsBtn.title = "View guests at this table";
  viewGuestsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Check if already showing - if so, hide it; otherwise show it
    const isCurrentlyActive = tableDiv.classList.contains("active");
    // Close other tooltips
    document.querySelectorAll(".venue-table.active").forEach((t) => {
      if (t !== tableDiv) t.classList.remove("active");
    });
    // Toggle current tooltip
    if (isCurrentlyActive) {
      tableDiv.classList.remove("active");
    } else {
      tableDiv.classList.add("active");
    }
  });

  tableDiv.appendChild(editBtn);
  tableDiv.appendChild(deleteBtn);
  tableDiv.appendChild(viewGuestsBtn);
  tableDiv.appendChild(tableIcon);
  tableDiv.appendChild(tooltip);

  // Click to select table - doesn't show tooltip
  tableDiv.addEventListener("click", (e) => {
    if (tableDiv.classList.contains("dragging")) {
      return; // Don't toggle if we're dragging
    }
    e.stopPropagation();
    // Close tooltips but don't show them
    document.querySelectorAll(".venue-table.active").forEach((t) => {
      if (t !== tableDiv) t.classList.remove("active");
    });
  });

  // Make table draggable
  makeDraggable(tableDiv, table);

  return tableDiv;
}

// Make a table draggable
function makeDraggable(element, tableData) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  const venueMap = document.getElementById("venueMap");

  element.addEventListener("mousedown", dragStart);
  element.addEventListener("touchstart", dragStart);

  function dragStart(e) {
    // Only start drag on the table circle, not the tooltip
    if (e.target.closest(".table-tooltip")) {
      return;
    }

    const touch = e.type === "touchstart" ? e.touches[0] : e;
    initialX = touch.clientX - xOffset;
    initialY = touch.clientY - yOffset;

    if (e.target === element || e.target.closest(".table-circle")) {
      isDragging = true;
      element.classList.add("dragging");
      element.classList.remove("active"); // Close tooltip while dragging

      document.addEventListener("mousemove", drag);
      document.addEventListener("mouseup", dragEnd);
      document.addEventListener("touchmove", drag);
      document.addEventListener("touchend", dragEnd);
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      const touch = e.type === "touchmove" ? e.touches[0] : e;
      currentX = touch.clientX - initialX;
      currentY = touch.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      // Update position in real-time
      const venueMapRect = venueMap.getBoundingClientRect();
      const percentX =
        ((touch.clientX - venueMapRect.left) / venueMapRect.width) * 100;
      const percentY =
        ((touch.clientY - venueMapRect.top) / venueMapRect.height) * 100;

      // Clamp to bounds (minimal padding)
      const clampedX = Math.max(0, Math.min(100, percentX));
      const clampedY = Math.max(0, Math.min(100, percentY));

      element.style.left = `${clampedX}%`;
      element.style.top = `${clampedY}%`;
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      isDragging = false;
      element.classList.remove("dragging");

      // Calculate final position as percentage
      const venueMapRect = venueMap.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const centerX = elementRect.left + elementRect.width / 2;
      const centerY = elementRect.top + elementRect.height / 2;

      const finalX = ((centerX - venueMapRect.left) / venueMapRect.width) * 100;
      const finalY = ((centerY - venueMapRect.top) / venueMapRect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, Math.round(finalX)));
      const clampedY = Math.max(0, Math.min(100, Math.round(finalY)));

      // Update the table data
      tableData.x = clampedX;
      tableData.y = clampedY;

      // Set final position
      element.style.left = `${clampedX}%`;
      element.style.top = `${clampedY}%`;

      // Auto-save to Firebase
      if (typeof window.autoSaveToFirebase === "function") {
        window.autoSaveToFirebase();
      }

      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", dragEnd);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("touchend", dragEnd);

      xOffset = 0;
      yOffset = 0;
    }
  }
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById("guestSearch");
  const searchResult = document.getElementById("searchResult");
  const noResult = document.getElementById("noResult");

  // Only setup if these elements exist (we're on find-seat page, not admin)
  if (!searchInput || !searchResult || !noResult) {
    return;
  }

  // Real-time search as user types
  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

    // Clear previous highlights
    clearHighlights();

    // Hide results if query is empty
    if (query === "") {
      searchResult.classList.remove("show");
      noResult.classList.remove("show");
      return;
    }

    // Search for guest
    const result = findGuest(query);

    if (result) {
      displayResult(result);
      highlightGuest(result);
      searchResult.classList.add("show");
      noResult.classList.remove("show");
    } else {
      searchResult.classList.remove("show");
      noResult.classList.add("show");
    }
  });

  // Also trigger search on Enter key
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      this.blur(); // Remove focus to show result more clearly
    }
  });
}

// Find guest by name (fuzzy matching)
function findGuest(query) {
  // Exact match first
  if (guestLookup[query]) {
    return guestLookup[query];
  }

  // Partial match - find guest whose name includes the query
  for (const [key, value] of Object.entries(guestLookup)) {
    if (key.includes(query)) {
      return value;
    }
  }

  // Try matching by first name or last name
  for (const [key, value] of Object.entries(guestLookup)) {
    const nameParts = key.split(" ");
    if (nameParts.some((part) => part.startsWith(query))) {
      return value;
    }
  }

  return null;
}

// Display search result
function displayResult(result) {
  document.getElementById("resultName").textContent = result.name;
  document.getElementById("resultTable").textContent =
    `Table ${result.tableNumber}`;

  const tablematesText =
    result.tablemates.length > 0
      ? `Seated with: ${result.tablemates.join(", ")}`
      : "Single table";
  document.getElementById("resultTablemates").textContent = tablematesText;
}

// Highlight the guest's table and name in the visual chart
function highlightGuest(result) {
  // Highlight table
  const tableElement = document.getElementById(`table-${result.tableNumber}`);
  if (tableElement) {
    tableElement.classList.add("highlighted");

    // Show the tooltip
    tableElement.classList.add("active");

    // Scroll to table
    setTimeout(() => {
      tableElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    // Highlight guest name in the tooltip
    const guestItems = tableElement.querySelectorAll(".tooltip-guest-list li");
    guestItems.forEach((item) => {
      if (item.dataset.guestName === result.name.toLowerCase()) {
        item.classList.add("highlighted-guest");
      }
    });
  }
}

// Clear all highlights
function clearHighlights() {
  // Remove table highlights
  document.querySelectorAll(".venue-table.highlighted").forEach((table) => {
    table.classList.remove("highlighted");
    table.classList.remove("active");
  });

  // Remove guest name highlights
  document
    .querySelectorAll(".tooltip-guest-list li.highlighted-guest")
    .forEach((item) => {
      item.classList.remove("highlighted-guest");
    });
}

// Close tooltips when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".venue-table")) {
    document.querySelectorAll(".venue-table.active").forEach((table) => {
      table.classList.remove("active");
    });
  }
});

// Apply saved positions to head table and dance floor
function applyFixedElementPositions() {
  const headTable = document.getElementById("headTable");
  const danceFloor = document.getElementById("danceFloor");

  if (headTable && seatingData.headTable) {
    headTable.style.left = `${seatingData.headTable.x}%`;
    headTable.style.top = `${seatingData.headTable.y}%`;
  }

  if (danceFloor && seatingData.danceFloor) {
    danceFloor.style.left = `${seatingData.danceFloor.x}%`;
    danceFloor.style.top = `${seatingData.danceFloor.y}%`;
  }
}

// Make head table draggable
function makeHeadTableDraggable() {
  const headTable = document.getElementById("headTable");
  if (!headTable) return;

  makeDraggableElement(headTable, "Head Table", ".head-table");
}

// Make dance floor draggable
function makeDanceFloorDraggable() {
  const danceFloor = document.getElementById("danceFloor");
  if (!danceFloor) return;

  makeDraggableElement(danceFloor, "Dance Floor", ".dance-floor");
}

// Generic function to make an element draggable
function makeDraggableElement(element, name, cssSelector) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  const venueMap = document.getElementById("venueMap");

  element.addEventListener("mousedown", dragStart);
  element.addEventListener("touchstart", dragStart);

  function dragStart(e) {
    const touch = e.type === "touchstart" ? e.touches[0] : e;
    initialX = touch.clientX - xOffset;
    initialY = touch.clientY - yOffset;

    isDragging = true;
    element.classList.add("dragging");

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
    document.addEventListener("touchmove", drag);
    document.addEventListener("touchend", dragEnd);
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      const touch = e.type === "touchmove" ? e.touches[0] : e;
      currentX = touch.clientX - initialX;
      currentY = touch.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      // Update position in real-time
      const venueMapRect = venueMap.getBoundingClientRect();
      const percentX =
        ((touch.clientX - venueMapRect.left) / venueMapRect.width) * 100;
      const percentY =
        ((touch.clientY - venueMapRect.top) / venueMapRect.height) * 100;

      // Clamp to bounds
      const clampedX = Math.max(0, Math.min(100, percentX));
      const clampedY = Math.max(0, Math.min(100, percentY));

      element.style.left = `${clampedX}%`;
      element.style.top = `${clampedY}%`;
    }
  }

  function dragEnd(e) {
    if (isDragging) {
      isDragging = false;
      element.classList.remove("dragging");

      // Calculate final position as percentage
      const venueMapRect = venueMap.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const centerX = elementRect.left + elementRect.width / 2;
      const centerY = elementRect.top + elementRect.height / 2;

      const finalX = ((centerX - venueMapRect.left) / venueMapRect.width) * 100;
      const finalY = ((centerY - venueMapRect.top) / venueMapRect.height) * 100;

      const clampedX = Math.max(0, Math.min(100, Math.round(finalX)));
      const clampedY = Math.max(0, Math.min(100, Math.round(finalY)));

      // Set final position
      element.style.left = `${clampedX}%`;
      element.style.top = `${clampedY}%`;

      // Save position to seatingData
      if (name === "Head Table") {
        seatingData.headTable = { x: clampedX, y: clampedY };
      } else if (name === "Dance Floor") {
        seatingData.danceFloor = { x: clampedX, y: clampedY };
      }

      // Auto-save to Firebase
      if (typeof window.autoSaveToFirebase === "function") {
        window.autoSaveToFirebase();
      }

      document.removeEventListener("mousemove", drag);
      document.removeEventListener("mouseup", dragEnd);
      document.removeEventListener("touchmove", drag);
      document.removeEventListener("touchend", dragEnd);

      xOffset = 0;
      yOffset = 0;
    }
  }
}

// Export functions for potential external use
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    seatingData,
    findGuest,
    guestLookup,
  };
}
