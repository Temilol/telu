// Admin functions for managing seating chart
// This file handles add, edit, delete table functionality

let allGuests = []; // Cache for guest list

// Initialize admin controls
document.addEventListener("DOMContentLoaded", function () {
  setupAdminControls();
  loadAllGuests();
});

function setupAdminControls() {
  const addTableBtn = document.getElementById("addTableBtn");
  const clearBtn = document.getElementById("clearBtn");
  const modal = document.getElementById("tableModal");
  const cancelBtn = document.getElementById("cancelBtn");
  const tableForm = document.getElementById("tableForm");

  if (!addTableBtn) return; // Not on admin page

  // Add table button
  addTableBtn.addEventListener("click", () => {
    openModal();
  });

  // Clear all tables button
  clearBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to delete ALL tables? This cannot be undone!",
      )
    ) {
      clearAllTables();
    }
  });

  // Cancel button in modal
  cancelBtn.addEventListener("click", () => {
    closeModal();
  });

  // Close table modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Form submission
  tableForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveTable();
  });
}

let currentModalMode = null; // Track if modal is in "add" or "edit" mode
let originalGuests = []; // Track original guests for edit mode

// Open modal for adding/editing table
async function openModal(tableNumber = null) {
  const modal = document.getElementById("tableModal");
  const modalTitle = document.getElementById("modalTitle");
  const tableNumberInput = document.getElementById("tableNumber");
  const guestSearchInput = document.getElementById("guestSearch");
  const suggestionsDiv = document.getElementById("searchSuggestions");
  const tagsContainer = document.getElementById("selectedGuestsTags");

  // Load guests if not already loaded
  if (allGuests.length === 0) {
    await loadAllGuests();
    console.log(`Loaded ${allGuests.length} guests`);
  }

  // Clear previous state
  guestSearchInput.value = "";
  suggestionsDiv.innerHTML = "";
  suggestionsDiv.classList.remove("show");
  tagsContainer.innerHTML = "";
  tagsContainer.classList.add("empty");
  tagsContainer.textContent = "No guests selected";

  // Track selected guests in this modal instance
  const selectedGuestsMap = new Map();

  if (tableNumber) {
    // Edit mode
    currentModalMode = "edit";
    const table = seatingData.tables.find((t) => t.number === tableNumber);
    if (table) {
      modalTitle.textContent = `Edit Table ${tableNumber}`;
      tableNumberInput.value = table.number;
      tableNumberInput.disabled = true;

      // Store original guests for change detection
      originalGuests = [...table.guests];

      // Pre-populate selected guests
      table.guests.forEach((guestName) => {
        selectedGuestsMap.set(guestName.toLowerCase(), guestName);
        addGuestTag(guestName, selectedGuestsMap, tagsContainer);
      });

      // Disable save button initially in edit mode
      disableSaveButton();
    }
  } else {
    // Add mode
    currentModalMode = "add";
    modalTitle.textContent = "Add New Table";
    tableNumberInput.value = getNextTableNumber();
    tableNumberInput.disabled = false;
    originalGuests = [];

    // Add real-time validation for table number
    tableNumberInput.addEventListener("change", function () {
      validateTableNumber(this.value, currentModalMode);
    });
  }

  // Remove old event listeners by cloning
  const newSearchInput = guestSearchInput.cloneNode(true);
  guestSearchInput.parentNode.replaceChild(newSearchInput, guestSearchInput);
  
  const updatedSearchInput = document.getElementById("guestSearch");
  const updatedSuggestionsDiv = document.getElementById("searchSuggestions");

  // Search functionality with fresh listener
  updatedSearchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    console.log(`Search query: "${query}"`);

    if (query.length === 0) {
      updatedSuggestionsDiv.classList.remove("show");
      updatedSuggestionsDiv.innerHTML = "";
      return;
    }

    // Filter guests
    const filtered = allGuests.filter((guest) =>
      guest.name.toLowerCase().includes(query) &&
      !selectedGuestsMap.has(guest.name.toLowerCase())
    );

    console.log(`Found ${filtered.length} matching guests`);

    // Show suggestions
    if (filtered.length > 0) {
      updatedSuggestionsDiv.innerHTML = filtered
        .map((guest) => {
          const assignedTable = findGuestTable(guest.name, seatingData.tables);
          const isDisabled = assignedTable && assignedTable !== tableNumber;

          return `
            <div class="suggestion-item ${isDisabled ? "disabled" : ""}" 
                 data-guest-name="${guest.name}">
              ${guest.name}
              ${isDisabled ? `<span class="suggestion-status">(Seated at Table ${assignedTable})</span>` : ""}
            </div>
          `;
        })
        .join("");

      updatedSuggestionsDiv.classList.add("show");

      // Add click handlers to non-disabled items
      updatedSuggestionsDiv.querySelectorAll(".suggestion-item:not(.disabled)").forEach((item) => {
        item.style.cursor = "pointer";
        item.addEventListener("click", function () {
          const guestName = this.dataset.guestName;
          selectedGuestsMap.set(guestName.toLowerCase(), guestName);
          addGuestTag(guestName, selectedGuestsMap, tagsContainer);
          updatedSearchInput.value = "";
          updatedSuggestionsDiv.innerHTML = "";
          updatedSuggestionsDiv.classList.remove("show");
        });
      });
    } else {
      updatedSuggestionsDiv.innerHTML = '<div class="suggestion-item" style="opacity: 0.6;">No available guests</div>';
      updatedSuggestionsDiv.classList.add("show");
    }
  });

  modal.classList.add("show");
  updatedSearchInput.focus();
}

// Add a guest tag to the container
function addGuestTag(guestName, selectedGuestsMap, tagsContainer) {
  if (tagsContainer.classList.contains("empty")) {
    tagsContainer.innerHTML = "";
    tagsContainer.classList.remove("empty");
  }

  const tag = document.createElement("div");
  tag.className = "guest-tag";
  tag.innerHTML = `
    ${guestName}
    <span class="guest-tag-remove">✕</span>
  `;

  tag.querySelector(".guest-tag-remove").addEventListener("click", () => {
    selectedGuestsMap.delete(guestName.toLowerCase());
    tag.remove();

    if (selectedGuestsMap.size === 0) {
      tagsContainer.innerHTML = "";
      tagsContainer.classList.add("empty");
      tagsContainer.textContent = "No guests selected";
    }

    // Check if anything changed for edit mode
    if (currentModalMode === "edit") {
      checkForChanges(selectedGuestsMap);
    }
  });

  tagsContainer.appendChild(tag);

  // Check if anything changed for edit mode
  if (currentModalMode === "edit") {
    checkForChanges(selectedGuestsMap);
  }
}

// Expose openModal globally for fullscreen button
window.openModal = openModal;

// Close modal
function closeModal() {
  const modal = document.getElementById("tableModal");
  modal.classList.remove("show");
  document.getElementById("tableForm").reset();
  document.getElementById("tableNumber").disabled = false;
}

// Get next available table number
function getNextTableNumber() {
  if (seatingData.tables.length === 0) return 1;
  const maxNumber = Math.max(...seatingData.tables.map((t) => t.number));
  return maxNumber + 1;
}

// Save table (add or edit)
function saveTable() {
  const tableNumber = parseInt(document.getElementById("tableNumber").value);
  const tagsContainer = document.getElementById("selectedGuestsTags");
  
  // Get selected guests from tags
  const selectedGuests = Array.from(tagsContainer.querySelectorAll(".guest-tag"))
    .map((tag) => tag.textContent.replace("✕", "").trim());

  if (selectedGuests.length === 0) {
    alert("Please select at least one guest.");
    return;
  }

  // Validate table number on ADD mode
  if (currentModalMode === "add") {
    const tableExists = seatingData.tables.some((t) => t.number === tableNumber);
    if (tableExists) {
      return; // Validation already shown inline
    }
  }

  // Check for duplicate guests (except when editing the same table)
  const otherTables = seatingData.tables.filter(
    (t) => t.number !== tableNumber
  );
  const duplicates = selectedGuests.filter((guest) =>
    otherTables.some((table) =>
      table.guests.some((g) => g.toLowerCase() === guest.toLowerCase())
    )
  );

  if (duplicates.length > 0) {
    const tableAssignments = duplicates
      .map((guest) => {
        const table = findGuestTable(guest, seatingData.tables);
        return `${guest} (Table ${table})`;
      })
      .join("\n");
    alert(
      `The following guests are already assigned:\n\n${tableAssignments}\n\nPlease remove them before saving.`
    );
    return;
  }

  // Check if editing existing table
  const existingTableIndex = seatingData.tables.findIndex(
    (t) => t.number === tableNumber,
  );

  if (existingTableIndex >= 0) {
    // Edit existing table
    seatingData.tables[existingTableIndex].guests = selectedGuests;
    updateGuestLookup();
    refreshTable(tableNumber);
    console.log(`Table ${tableNumber} updated`);
  } else {
    // Add new table
    const newTable = {
      number: tableNumber,
      x: 50, // Center of venue
      y: 50,
      guests: selectedGuests,
    };
    seatingData.tables.push(newTable);
    updateGuestLookup();
    addTableToVenue(newTable);
    console.log(`Table ${tableNumber} added`);
  }

  closeModal();
  
  // Auto-save to Firebase
  if (typeof window.autoSaveToFirebase === 'function') {
    window.autoSaveToFirebase();
  }
}

// Validate table number in real-time
function validateTableNumber(tableNumber, mode) {
  const errorDiv = document.getElementById("tableNumberError");
  const saveBtn = document.querySelector(".btn-save");
  
  if (!tableNumber || mode !== "add") {
    errorDiv.style.display = "none";
    if (saveBtn) saveBtn.disabled = false;
    return;
  }

  const tableExists = seatingData.tables.some((t) => t.number === parseInt(tableNumber));

  if (tableExists) {
    errorDiv.style.display = "block";
    if (saveBtn) saveBtn.disabled = true;
  } else {
    errorDiv.style.display = "none";
    if (saveBtn) saveBtn.disabled = false;
  }
}

// Disable save button
function disableSaveButton() {
  const saveBtn = document.querySelector(".btn-save");
  if (saveBtn) saveBtn.disabled = true;
}

// Check if guests have changed in edit mode
function checkForChanges(selectedGuestsMap) {
  const saveBtn = document.querySelector(".btn-save");
  if (!saveBtn || currentModalMode !== "edit") return;

  const currentGuests = Array.from(selectedGuestsMap.values()).sort();
  const originalSorted = [...originalGuests].sort();

  // Compare sorted arrays
  const hasChanged = 
    currentGuests.length !== originalSorted.length ||
    !currentGuests.every((guest, i) => guest.toLowerCase() === originalSorted[i].toLowerCase());

  saveBtn.disabled = !hasChanged;
}

// Add table to venue map
function addTableToVenue(table) {
  const container = document.getElementById("venueMap");
  const tableElement = createTableElement(table);
  container.appendChild(tableElement);
}

// Refresh a specific table element
function refreshTable(tableNumber) {
  const tableElement = document.getElementById(`table-${tableNumber}`);
  if (tableElement) {
    const table = seatingData.tables.find((t) => t.number === tableNumber);
    if (table) {
      // Store position
      const x = table.x;
      const y = table.y;

      // Remove old element
      tableElement.remove();

      // Add new element
      addTableToVenue(table);
    }
  }
}

// Delete table (exposed to window for button clicks)
window.deleteTable = function (tableNumber) {
  if (confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
    // Remove from data
    const index = seatingData.tables.findIndex((t) => t.number === tableNumber);
    if (index >= 0) {
      seatingData.tables.splice(index, 1);
      updateGuestLookup();

      // Remove from DOM
      const tableElement = document.getElementById(`table-${tableNumber}`);
      if (tableElement) {
        tableElement.remove();
      }

      console.log(`Table ${tableNumber} deleted`);
      
      // Auto-save to Firebase
      if (typeof window.autoSaveToFirebase === 'function') {
        window.autoSaveToFirebase();
      }
    }
  }
};

// Edit table (exposed to window for button clicks)
window.editTable = function (tableNumber) {
  openModal(tableNumber);
};

// Clear all tables
function clearAllTables() {
  // Remove all tables from data
  seatingData.tables = [];
  updateGuestLookup();

  // Remove all table elements from DOM
  const venueMap = document.getElementById("venueMap");
  const tables = venueMap.querySelectorAll(".venue-table");
  tables.forEach((table) => table.remove());

  console.log("All tables cleared");
  
  // Auto-save to Firebase
  if (typeof window.autoSaveToFirebase === 'function') {
    window.autoSaveToFirebase();
  }
}
// Load guests from Firebase or fallback to RSVP data
async function loadAllGuests() {
  try {
    if (typeof loadGuestsFromFirebase === 'function') {
      allGuests = await loadGuestsFromFirebase();
    } else {
      console.log("firebase-guests.js not loaded, using empty guest list");
      allGuests = [];
    }
  } catch (error) {
    console.error("Error loading guests:", error);
    allGuests = [];
  }
}