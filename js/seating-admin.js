// Admin functions for managing seating chart
// This file handles add, edit, delete table functionality

const DEFAULT_MAX_GUESTS = 10; // Default max guests per table
let allGuests = []; // Cache for guest list
let currentTableMaxGuests = DEFAULT_MAX_GUESTS; // Track current table's max

// Household selection state
let pendingHouseholdSelection = null; // { guestName, selectedGuestsMap, tagsContainer, tableNumber, tableMaxGuests }
let householdPromptShown = false;

// Initialize admin controls
document.addEventListener("DOMContentLoaded", async function () {
  setupAdminControls();
  await loadAllGuests();
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
    devLog("📝 Form clicked, calling saveTable()");
    e.preventDefault();
    devLog("📝 Form submitted, calling saveTable()");
    saveTable();
  });
}

let currentModalMode = null; // Track if modal is in "add" or "edit" mode
let originalGuests = []; // Track original guests for edit mode
let originalMaxGuests = DEFAULT_MAX_GUESTS; // Track original maxGuests for edit mode

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
    devLog(`Loaded ${allGuests.length} guests`);
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

      // Set max guests for this table
      const maxGuestsInput = document.getElementById("tableMaxGuests");
      if (maxGuestsInput) {
        maxGuestsInput.value = table.maxGuests || DEFAULT_MAX_GUESTS;
        currentTableMaxGuests = table.maxGuests || DEFAULT_MAX_GUESTS;
      }

      // Store original guests and maxGuests for change detection
      originalGuests = [...table.guests];
      originalMaxGuests = table.maxGuests || DEFAULT_MAX_GUESTS;

      // Pre-populate selected guests
      table.guests.forEach((guestName) => {
        selectedGuestsMap.set(guestName.toLowerCase(), guestName);
        const isHousehold =
          householdManager.getOtherHouseholdMembers(guestName).length > 0;
        addGuestTag(guestName, selectedGuestsMap, tagsContainer, isHousehold);
      });
      updateGuestCountDisplay(selectedGuestsMap);

      // Disable save button initially in edit mode
      disableSaveButton();
    }
  } else {
    // Add mode
    currentModalMode = "add";
    modalTitle.textContent = "Add New Table";
    tableNumberInput.value = getNextTableNumber();
    tableNumberInput.disabled = false;
    currentTableMaxGuests = DEFAULT_MAX_GUESTS;

    // Set default max guests
    const maxGuestsInput = document.getElementById("tableMaxGuests");
    if (maxGuestsInput) {
      maxGuestsInput.value = DEFAULT_MAX_GUESTS;
    }

    // Add real-time validation for table number
    tableNumberInput.addEventListener("change", function () {
      validateTableNumber(this.value, currentModalMode);
    });

    // Check if there are pending guests to prefill
    if (
      window.pendingGuestsForNewTable &&
      window.pendingGuestsForNewTable.length > 0
    ) {
      window.pendingGuestsForNewTable.forEach((guestName) => {
        const guest = allGuests.find(
          (g) => g.name.toLowerCase() === guestName.toLowerCase(),
        );
        if (guest) {
          selectedGuestsMap.set(guest.name.toLowerCase(), guest.name);
          const isHousehold =
            householdManager &&
            householdManager.getOtherHouseholdMembers(guest.name).length > 0;
          addGuestTag(
            guest.name,
            selectedGuestsMap,
            tagsContainer,
            isHousehold,
          );
        }
      });
      // Clear the pending guests after using them
      window.pendingGuestsForNewTable = null;
    }
  }

  // Display guest count
  updateGuestCountDisplay(selectedGuestsMap);

  // Add listener for max guests input to update limit in real-time
  const maxGuestsInput = document.getElementById("tableMaxGuests");
  if (maxGuestsInput) {
    let previousMax = currentTableMaxGuests;

    maxGuestsInput.addEventListener("change", function () {
      const newMax = parseInt(this.value) || DEFAULT_MAX_GUESTS;

      // Check if new max is below current guest count
      if (newMax < selectedGuestsMap.size) {
        alert(
          `You have ${selectedGuestsMap.size} guests selected, but max is now ${newMax}. Please remove ${selectedGuestsMap.size - newMax} guest(s) first.`,
        );
        // Reset input back to previous max
        this.value = previousMax;
        return;
      }

      currentTableMaxGuests = newMax;
      previousMax = newMax;
      updateGuestCountDisplay(selectedGuestsMap);
      // Check if anything changed for edit mode (including maxGuests)
      if (currentModalMode === "edit") {
        checkForChanges(selectedGuestsMap);
      }
    });

    maxGuestsInput.addEventListener("input", function () {
      const newMax = parseInt(this.value) || DEFAULT_MAX_GUESTS;
      if (newMax > 0) {
        // Only update if it won't conflict with current guests
        if (newMax >= selectedGuestsMap.size) {
          currentTableMaxGuests = newMax;
          updateGuestCountDisplay(selectedGuestsMap);
          // Check if anything changed for edit mode (including maxGuests)
          if (currentModalMode === "edit") {
            checkForChanges(selectedGuestsMap);
          }
        }
      }
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
    devLog(`Search query: "${query}"`);

    if (query.length === 0) {
      updatedSuggestionsDiv.classList.remove("show");
      updatedSuggestionsDiv.innerHTML = "";
      return;
    }

    // Filter guests
    const filtered = allGuests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(query) &&
        !selectedGuestsMap.has(guest.name.toLowerCase()),
    );

    devLog(`Found ${filtered.length} matching guests`);

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
      updatedSuggestionsDiv
        .querySelectorAll(".suggestion-item:not(.disabled)")
        .forEach((item) => {
          item.style.cursor = "pointer";
          item.addEventListener("click", function () {
            // Check if at max capacity
            if (selectedGuestsMap.size >= currentTableMaxGuests) {
              alert(
                `Maximum ${currentTableMaxGuests} guests per table reached!`,
              );
              return;
            }

            const guestName = this.dataset.guestName;

            // Check if guest is in a household and show prompt
            const householdMembers =
              householdManager.getOtherHouseholdMembers(guestName);

            if (householdMembers.length > 0) {
              // Show household prompt
              pendingHouseholdSelection = {
                guestName,
                selectedGuestsMap,
                tagsContainer,
                tableNumber:
                  currentModalMode === "edit"
                    ? document.getElementById("tableNumber").value
                    : null,
                tableMaxGuests: currentTableMaxGuests,
              };

              showHouseholdPrompt(guestName, householdMembers);
            } else {
              // No household, just add the guest directly
              selectedGuestsMap.set(guestName.toLowerCase(), guestName);
              addGuestTag(guestName, selectedGuestsMap, tagsContainer);
              updateGuestCountDisplay(selectedGuestsMap);
              updatedSearchInput.value = "";
              updatedSuggestionsDiv.innerHTML = "";
              updatedSuggestionsDiv.classList.remove("show");
            }
          });
        });
    } else {
      updatedSuggestionsDiv.innerHTML =
        '<div class="suggestion-item" style="opacity: 0.6;">No available guests</div>';
      updatedSuggestionsDiv.classList.add("show");
    }
  });

  // Update count display on input changes
  updatedSearchInput.addEventListener("change", () => {
    updateGuestCountDisplay(selectedGuestsMap);
  });

  // Add direct button click logging
  const saveBtn = document.querySelector(".btn-save");
  if (saveBtn) {
    devLog("🔵 Adding click listener to save button");
    devLog("  Button element:", saveBtn);
    devLog("  Button text:", saveBtn.textContent);
    devLog("  Button classList:", saveBtn.className);
    devLog("  Button disabled:", saveBtn.disabled);

    // Remove old listeners by cloning
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    const updatedSaveBtn = document.querySelector(".btn-save");
    devLog("🔵 After cloning, new button:", updatedSaveBtn);

    updatedSaveBtn.addEventListener("click", (e) => {
      devLog("🔴 SAVE BUTTON CLICKED!");
      devLog("  Event:", e);
      e.preventDefault();
      devLog("📝 Form about to submit via button click");
      tableForm.dispatchEvent(new Event("submit", { bubbles: true }));
    });

    // Also test if button is clickable
    updatedSaveBtn.style.cursor = "pointer";
    updatedSaveBtn.style.pointerEvents = "auto";
    devLog("🟢 Save button ready for clicks");
  } else {
    devLog("❌ Save button not found!");
  }

  modal.classList.add("show");
  updatedSearchInput.focus();
}

// Add a guest tag to the container
function addGuestTag(
  guestName,
  selectedGuestsMap,
  tagsContainer,
  isPartOfHousehold = false,
) {
  if (tagsContainer.classList.contains("empty")) {
    tagsContainer.innerHTML = "";
    tagsContainer.classList.remove("empty");
  }

  const tag = document.createElement("div");
  tag.className = "guest-tag";

  // Add household indicator if part of household
  const householdIndicator = isPartOfHousehold
    ? '<i class="fa-solid fa-people-group"></i> '
    : "";

  tag.innerHTML = `
    ${householdIndicator}${guestName}
    <span class="guest-tag-remove">✕</span>
  `;
  tag.setAttribute("data-guest-name", guestName);
  if (isPartOfHousehold) tag.setAttribute("data-household", "true");

  tag.querySelector(".guest-tag-remove").addEventListener("click", () => {
    selectedGuestsMap.delete(guestName.toLowerCase());
    tag.remove();

    if (selectedGuestsMap.size === 0) {
      tagsContainer.innerHTML = "";
      tagsContainer.classList.add("empty");
      tagsContainer.textContent = "No guests selected";
    }

    updateGuestCountDisplay(selectedGuestsMap);

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

// Update guest count display
function updateGuestCountDisplay(selectedGuestsMap) {
  const countDisplay = document.getElementById("guestCountDisplay");
  const footnote = document.getElementById("guestFootnote");
  const searchInput = document.getElementById("guestSearch");
  const currentCount = selectedGuestsMap.size;
  const isAtLimit = currentCount >= currentTableMaxGuests;

  if (countDisplay) {
    countDisplay.textContent = `${currentCount}/${currentTableMaxGuests} guests`;
    if (isAtLimit) {
      countDisplay.style.color = "#d32f2f";
      countDisplay.style.fontWeight = "bold";
    } else {
      countDisplay.style.color = "#888";
      countDisplay.style.fontWeight = "normal";
    }
  }

  if (footnote) {
    footnote.textContent = `Click an 'X' to remove a guest • Max ${currentTableMaxGuests} per table`;
  }

  if (searchInput) {
    if (isAtLimit) {
      searchInput.disabled = true;
      searchInput.placeholder = `Maximum ${currentTableMaxGuests} guests reached`;
      searchInput.style.opacity = "0.5";
    } else {
      searchInput.disabled = false;
      searchInput.placeholder = "Type guest name to search...";
      searchInput.style.opacity = "1";
    }
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

// Calculate starting position for new table to avoid stacking
function calculateNewTablePosition(tableIndex) {
  // Spread tables in a grid pattern across the venue
  // Start at center, then offset in a spiral/grid pattern
  const baseX = 50;
  const baseY = 50;
  const offsetAmount = 15; // Percentage offset for each table

  // Create a grid position based on table index
  const column = tableIndex % 3; // 3 columns
  const row = Math.floor(tableIndex / 3); // Multiple rows

  // Calculate x and y with constraints to keep in venue bounds (10-90%)
  let x = baseX + (column - 1) * offsetAmount;
  let y = baseY + row * offsetAmount;

  // Keep positions within bounds
  x = Math.max(15, Math.min(85, x));
  y = Math.max(15, Math.min(85, y));

  return { x, y };
}

// Save table (add or edit)
async function saveTable() {
  devLog("🔵 saveTable() called");
  devLog("═══ DIALOG STATE AT SAVE ═══");

  // Log form element
  const tableForm = document.getElementById("tableForm");
  devLog("  Form element:", tableForm ? "FOUND" : "NOT FOUND");

  // Log all input fields in the form
  const tableNumberInput = document.getElementById("tableNumber");
  const maxGuestsInput = document.getElementById("tableMaxGuests");
  const guestSearchInput = document.getElementById("guestSearch");
  const tagsContainer = document.getElementById("selectedGuestsTags");

  devLog("  INPUT FIELDS:");
  devLog(`    tableNumber input value: "${tableNumberInput?.value}"`);
  devLog(`    tableNumber disabled: ${tableNumberInput?.disabled}`);
  devLog(`    maxGuests input value: "${maxGuestsInput?.value}"`);
  devLog(`    guestSearch input value: "${guestSearchInput?.value}"`);

  // Log selected guests tags
  devLog("  SELECTED GUESTS TAGS:");
  const guestTags = tagsContainer?.querySelectorAll(".guest-tag") || [];
  devLog(`    Total tags found: ${guestTags.length}`);
  guestTags.forEach((tag, idx) => {
    const guestName = tag.getAttribute("data-guest-name");
    const isHousehold = tag.getAttribute("data-household");
    devLog(`      [${idx}] ${guestName} ${isHousehold ? "(household)" : ""}`);
  });

  // Log modal visibility
  const modal = document.getElementById("tableModal");
  devLog("  MODAL STATE:");
  devLog(`    Modal exists: ${modal ? "YES" : "NO"}`);
  devLog(
    `    Modal visible (show class): ${modal?.classList.contains("show") ? "YES" : "NO"}`,
  );
  devLog(`    Modal display style: ${modal?.style.display}`);

  const tableNumber = parseInt(document.getElementById("tableNumber").value);
  const maxGuests = maxGuestsInput
    ? parseInt(maxGuestsInput.value)
    : DEFAULT_MAX_GUESTS;

  devLog(`  tableNumber: ${tableNumber}`);
  devLog(`  maxGuests: ${maxGuests}`);
  devLog(`  mode: ${currentModalMode}`);

  // Validate max guests
  if (!maxGuests || maxGuests < 1) {
    devLog("❌ Max guests validation failed");
    alert("Max guests must be at least 1");
    return;
  }

  // Get selected guests from tags using data attribute (not textContent which includes emoji)
  const selectedGuests = Array.from(
    tagsContainer.querySelectorAll(".guest-tag"),
  )
    .map((tag) => tag.getAttribute("data-guest-name"))
    .filter((name) => name); // Filter out any null values

  devLog(`  selectedGuests found: ${selectedGuests.length}`);
  if (selectedGuests.length > 0) {
    devLog(`    guests: ${selectedGuests.join(", ")}`);
  }

  if (selectedGuests.length === 0) {
    devLog("❌ No guests selected - returning early");
    alert("Please select at least one guest.");
    return;
  }

  if (selectedGuests.length > maxGuests) {
    devLog(`❌ Too many guests (${selectedGuests.length} > ${maxGuests})`);
    alert(
      `Cannot exceed ${maxGuests} guests per table. Please remove ${selectedGuests.length - maxGuests} guest(s).`,
    );
    return;
  }

  // Validate table number on ADD mode
  if (currentModalMode === "add") {
    const tableExists = seatingData.tables.some(
      (t) => t.number === tableNumber,
    );
    if (tableExists) {
      devLog("❌ Table already exists");
      return; // Validation already shown inline
    }
  }

  // Check for duplicate guests (except when editing the same table)
  const otherTables = seatingData.tables.filter(
    (t) => t.number !== tableNumber,
  );
  const duplicates = selectedGuests.filter((guest) =>
    otherTables.some((table) =>
      table.guests.some((g) => g.toLowerCase() === guest.toLowerCase()),
    ),
  );

  if (duplicates.length > 0) {
    const tableAssignments = duplicates
      .map((guest) => {
        const table = findGuestTable(guest, seatingData.tables);
        return `${guest} (Table ${table})`;
      })
      .join("\n");
    devLog(`❌ Duplicate guests found: ${duplicates.join(", ")}`);
    alert(
      `The following guests are already assigned:\n\n${tableAssignments}\n\nPlease remove them before saving.`,
    );
    return;
  }

  // Check if editing existing table
  const existingTableIndex = seatingData.tables.findIndex(
    (t) => t.number === tableNumber,
  );

  if (existingTableIndex >= 0) {
    // Edit existing table
    devLog(`✏️ Editing existing table ${tableNumber}`);
    seatingData.tables[existingTableIndex].guests = selectedGuests;
    seatingData.tables[existingTableIndex].maxGuests = maxGuests;
    updateGuestLookup();
    refreshTable(tableNumber);
    devLog(`✅ Table ${tableNumber} updated with max ${maxGuests} guests`);
  } else {
    // Add new table with offset position to avoid stacking
    const { x, y } = calculateNewTablePosition(seatingData.tables.length);
    const newTable = {
      number: tableNumber,
      x: x,
      y: y,
      guests: selectedGuests,
      maxGuests: maxGuests,
    };
    seatingData.tables.push(newTable);
    updateGuestLookup();
    addTableToVenue(newTable);
    devLog(
      `✅ Table ${tableNumber} added at (${x}%, ${y}%) with max ${maxGuests} guests`,
    );
  }

  // Update guest statistics
  updateGuestStats();

  // Save to Firebase before closing modal (so we can catch errors)
  try {
    devLog("🔵 Calling saveToFirebase()...");
    const saveSuccess = await saveToFirebase();
    if (!saveSuccess) {
      devLog("❌ Firebase save failed - modal remains open for retry");
      return; // Keep modal open if save fails
    }
    // Only close modal after successful Firebase save
    devLog("🟢 Firebase save successful, closing modal");
    closeModal();
  } catch (error) {
    devLog("❌ Error during Firebase save:", error);
    // Modal remains open so user can retry
    return;
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

  const tableExists = seatingData.tables.some(
    (t) => t.number === parseInt(tableNumber),
  );

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

// Check if guests or maxGuests have changed in edit mode
function checkForChanges(selectedGuestsMap) {
  const saveBtn = document.querySelector(".btn-save");
  if (!saveBtn || currentModalMode !== "edit") return;

  const currentGuests = Array.from(selectedGuestsMap.values()).sort();
  const originalSorted = [...originalGuests].sort();

  // Check if guests changed
  const guestsChanged =
    currentGuests.length !== originalSorted.length ||
    !currentGuests.every(
      (guest, i) => guest.toLowerCase() === originalSorted[i].toLowerCase(),
    );

  // Check if maxGuests changed
  const maxGuestsChanged = currentTableMaxGuests !== originalMaxGuests;

  // Enable save button if either guests or maxGuests changed
  const hasChanged = guestsChanged || maxGuestsChanged;
  saveBtn.disabled = !hasChanged;

  devLog(
    `✏️ Edit mode change detection: guests=${guestsChanged}, maxGuests=${maxGuestsChanged} (${originalMaxGuests} → ${currentTableMaxGuests}), save button=${!saveBtn.disabled}`,
  );
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

      devLog(`Table ${tableNumber} deleted`);

      // Update guest statistics
      updateGuestStats();

      // Auto-save to Firebase
      if (typeof window.autoSaveToFirebase === "function") {
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

  devLog("All tables cleared");

  // Update guest statistics
  updateGuestStats();

  // Auto-save to Firebase
  if (typeof window.autoSaveToFirebase === "function") {
    window.autoSaveToFirebase();
  }
}
// Load guests from Firebase or fallback to RSVP data
async function loadAllGuests() {
  try {
    if (typeof loadGuestsFromFirebase === "function") {
      allGuests = await loadGuestsFromFirebase();

      // Initialize household manager with loaded guests
      if (typeof householdManager !== "undefined") {
        householdManager.buildHouseholdMap(allGuests);
        devLog("✓ Household manager initialized");
      }
    } else {
      devLog("firebase-guests.js not loaded, using empty guest list");
      allGuests = [];
    }
  } catch (error) {
    devLog("Error loading guests:", error);
    allGuests = [];
  }

  // Update guest statistics
  updateGuestStats();
}

// ========== GUEST STATISTICS ==========

/**
 * Update guest statistics display
 */
function updateGuestStats() {
  const totalGuestsEl = document.getElementById("totalGuestsCount");
  const unseatedGuestsEl = document.getElementById("unseatedGuestsCount");
  const seatedPercentageEl = document.getElementById("seatedPercentage");

  if (!totalGuestsEl || !unseatedGuestsEl || !seatedPercentageEl) {
    return; // Not on admin page
  }

  // Total guests (from all guests list)
  const totalGuests = allGuests.length;

  // Seated guests (from seatingData)
  const seatedGuests = seatingData.tables.reduce((sum, table) => {
    return sum + (table.guests ? table.guests.length : 0);
  }, 0);

  // Unseated guests
  const unseatedGuests = totalGuests - seatedGuests;

  // Calculate percentage
  const percentage =
    totalGuests > 0 ? Math.round((seatedGuests / totalGuests) * 100) : 0;

  // Update display
  totalGuestsEl.textContent = totalGuests;
  unseatedGuestsEl.textContent = unseatedGuests;
  seatedPercentageEl.textContent = percentage + "%";

  devLog(
    `📊 Stats: ${seatedGuests}/${totalGuests} guests seated (${percentage}%)`,
  );
}
// ========== HOUSEHOLD MANAGEMENT FUNCTIONS ==========

/**
 * Show household seating prompt modal
 * @param {string} primaryGuestName - The guest that was selected
 * @param {Array} otherMembers - Other household members
 */
function showHouseholdPrompt(primaryGuestName, otherMembers) {
  const modal = document.getElementById("householdModal");
  const title = document.getElementById("householdModalTitle");
  const description = document.getElementById("householdModalDescription");
  const membersList = document.getElementById("householdMembersList");
  const yesBtn = document.getElementById("householdYesBtn");
  const noBtn = document.getElementById("householdNoBtn");

  if (!modal) return;

  // Update title and description
  title.innerHTML =
    '<i class="fa-solid fa-people-group"></i> Seat Household Together?';
  const totalCount = otherMembers.length + 1;
  description.innerHTML = `
    <strong>${primaryGuestName}</strong> is part of a household with <strong>${otherMembers.length}</strong> other guest${otherMembers.length === 1 ? "" : "s"}.
    <br><br>
    Would you like to seat <strong>all ${totalCount} people together</strong> at this table?
  `;

  // Build members list
  const allMembers = [
    { name: primaryGuestName, isPrimary: true },
    ...otherMembers,
  ];
  membersList.innerHTML = allMembers
    .map(
      (member, idx) => `
        <div style="padding: 12px 15px; border-bottom: ${idx < allMembers.length - 1 ? "1px solid #f0f0f0" : "none"}; display: flex; align-items: center; gap: 10px; font-size: 13px;">
          <span style="font-size: 14px;">${member.isPrimary ? "✓" : '<i class="fa-solid fa-people-group"></i>'}</span>
          <span style="flex: 1; font-weight: ${member.isPrimary ? "600" : "400"}; color: #333;">${member.name}</span>
          <span style="font-size: 11px; background: ${member.isPrimary ? "#d4edda" : "#fff3cd"}; color: ${member.isPrimary ? "#155724" : "#856404"}; padding: 3px 8px; border-radius: 3px;">
            ${member.isPrimary ? "(Selected)" : "(Household)"}
          </span>
        </div>
      `,
    )
    .join("");

  // Update button text
  yesBtn.innerHTML = `<i class="fa-solid fa-people-group"></i> Seat Together (${totalCount} guests)`;
  yesBtn.onclick = () => addHouseholdToTable(true);
  noBtn.onclick = () => addHouseholdToTable(false);

  // Show modal
  modal.classList.add("show");
}

/**
 * Handle household seating decision
 * @param {boolean} seatTogether - Whether to seat household together
 */
function addHouseholdToTable(seatTogether) {
  if (!pendingHouseholdSelection) return;

  const {
    guestName,
    selectedGuestsMap,
    tagsContainer,
    tableNumber,
    tableMaxGuests,
  } = pendingHouseholdSelection;
  const modal = document.getElementById("householdModal");
  const searchInput = document.getElementById("guestSearch");
  const suggestionsDiv = document.getElementById("searchSuggestions");

  if (seatTogether) {
    // Seat entire household together
    const householdMembers = householdManager.getHouseholdMembers(guestName);
    let membersToAdd = [...householdMembers];
    const tablesAffected = new Set(); // Track which tables had members removed

    // Check if any household members are already seated elsewhere
    membersToAdd.forEach((member) => {
      const currentTable = findGuestTableForHousehold(
        member.name,
        seatingData.tables,
      );
      if (currentTable && currentTable !== tableNumber) {
        devLog(
          `🔄 Removing ${member.name} from Table ${currentTable} to seat with household`,
        );
        tablesAffected.add(currentTable); // Track this table
        removeGuestFromAllTables(member.name, seatingData.tables);
      }
    });

    // Check space for all household members
    const spaceNeeded = membersToAdd.filter(
      (m) => !selectedGuestsMap.has(m.name.toLowerCase()),
    ).length;
    const availableSpace = tableMaxGuests - selectedGuestsMap.size;

    if (spaceNeeded > availableSpace) {
      alert(
        `Not enough space! Need ${spaceNeeded} seats but only ${availableSpace} available.`,
      );
      modal.classList.remove("show");
      pendingHouseholdSelection = null;
      return;
    }

    // Refresh affected tables to show updated guest lists
    tablesAffected.forEach((tableNum) => {
      refreshTable(tableNum);
    });

    // Add all household members
    membersToAdd.forEach((member) => {
      if (!selectedGuestsMap.has(member.name.toLowerCase())) {
        selectedGuestsMap.set(member.name.toLowerCase(), member.name);
        addGuestTag(member.name, selectedGuestsMap, tagsContainer, true); // Mark as household
      }
    });
  } else {
    // Just seat the selected guest
    selectedGuestsMap.set(guestName.toLowerCase(), guestName);
    addGuestTag(guestName, selectedGuestsMap, tagsContainer, false);
  }

  updateGuestCountDisplay(selectedGuestsMap);
  modal.classList.remove("show");
  searchInput.value = "";
  suggestionsDiv.innerHTML = "";
  suggestionsDiv.classList.remove("show");
  pendingHouseholdSelection = null;

  // Update guest statistics
  updateGuestStats();
}

// Close household modal when clicking outside
document.addEventListener("DOMContentLoaded", function () {
  const householdModal = document.getElementById("householdModal");
  if (householdModal) {
    householdModal.addEventListener("click", function (e) {
      if (e.target === householdModal) {
        householdModal.classList.remove("show");
        pendingHouseholdSelection = null;
      }
    });
  }
});
