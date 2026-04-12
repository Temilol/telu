// Unseated Guests Panel Management
// Handles displaying, filtering, and bulk assigning unseated guests
// With household "Seat Together" support

let unseatedGuestsList = [];
let bulkSelectedGuests = new Set();
let isBulkMode = false;
let panelOpen = false;
let seatedSortBy = "table"; // "table" or "name"

// Wait for all scripts to load
window.addEventListener("load", function () {
  setTimeout(initUnseatedPanel, 500);
});

function initUnseatedPanel() {
  console.log("🔧 Initializing unseated panel...");

  // Get all elements
  const drawer = document.getElementById("unseatedPanelDrawer");
  const openBtn = document.getElementById("openUnseatedPanel");
  const closeBtn = document.getElementById("closeUnseatedPanel");
  const searchInput = document.getElementById("unseatedSearch");
  const bulkToggle = document.getElementById("bulkModeToggle");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const deselectAllBtn = document.getElementById("deselectAllBtn");
  const bulkAssignBtn = document.getElementById("bulkAssignBtn");
  const bulkSection = document.getElementById("bulkControlsSection");

  console.log("  drawer:", drawer ? "✓" : "✗");
  console.log("  openBtn:", openBtn ? "✓" : "✗");
  console.log("  closeBtn:", closeBtn ? "✓" : "✗");

  if (!drawer) {
    console.warn("❌ Unseated panel elements not found");
    return;
  }

  // Panel open/close
  openBtn?.addEventListener("click", openPanel);
  closeBtn?.addEventListener("click", closePanel);

  // Search
  searchInput?.addEventListener("input", function () {
    renderUnseatedList();
  });

  const seatedSearch = document.getElementById("seatedSearch");
  seatedSearch?.addEventListener("input", function () {
    renderSeatedList();
  });

  // Bulk mode
  bulkToggle?.addEventListener("click", toggleBulkMode);

  // Bulk controls
  selectAllBtn?.addEventListener("click", selectAllGuests);
  deselectAllBtn?.addEventListener("click", deselectAllGuests);

  if (bulkAssignBtn) {
    console.log("✅ bulk assign btn found, attaching listener");
    bulkAssignBtn.addEventListener("click", handleBulkAssign);
  } else {
    console.warn("❌ bulk assign btn NOT found");
  }

  // Tab controls
  const unseatedTab = document.getElementById("unseatedTab");
  const seatedTab = document.getElementById("seatedTab");
  const seatedSortToggle = document.getElementById("seatedSortToggle");

  unseatedTab?.addEventListener("click", function () {
    switchTab("unseated");
  });

  seatedTab?.addEventListener("click", function () {
    switchTab("seated");
  });

  seatedSortToggle?.addEventListener("click", function () {
    seatedSortBy = seatedSortBy === "table" ? "name" : "table";
    seatedSortToggle.textContent =
      seatedSortBy === "name" ? "🔀 Sort: Table" : "🔀 Sort: Name";
    renderSeatedList();
  });

  // Initial render
  updateUnseatedPanel();
  console.log("✅ Unseated panel initialized successfully");
}

// Open panel
function openPanel() {
  const drawer = document.getElementById("unseatedPanelDrawer");
  const openBtn = document.getElementById("openUnseatedPanel");
  if (drawer) {
    drawer.style.right = "0";
    openBtn.style.display = "none";
    panelOpen = true;
  }
}

// Close panel
function closePanel() {
  const drawer = document.getElementById("unseatedPanelDrawer");
  const openBtn = document.getElementById("openUnseatedPanel");
  if (drawer) {
    drawer.style.right = "-350px";
    if (unseatedGuestsList.length > 0) {
      openBtn.style.display = "flex";
      openBtn.style.justifyContent = "center";
      openBtn.style.alignItems = "center";
    }
    panelOpen = false;
  }
}

// Update panel with latest data
function updateUnseatedPanel() {
  console.log("🔍 updateUnseatedPanel() called");
  console.log("  seatingData:", typeof seatingData !== "undefined" ? "✓" : "✗");
  console.log("  allGuests:", typeof allGuests !== "undefined" ? "✓" : "✗");

  if (typeof seatingData === "undefined" || typeof allGuests === "undefined") {
    console.warn("⏳ Waiting for seatingData/allGuests to load...");
    return;
  }

  // Get unseated guests
  const seatedNames = new Set();
  seatingData.tables?.forEach((table) => {
    table.guests?.forEach((guest) => {
      seatedNames.add(guest.toLowerCase());
    });
  });

  unseatedGuestsList = allGuests.filter(
    (guest) => !seatedNames.has(guest.name.toLowerCase()),
  );

  // Update header count
  const countHeader = document.getElementById("unseatedCountHeader");
  if (countHeader) {
    countHeader.textContent =
      unseatedGuestsList.length === 0
        ? "All seated! ✓"
        : `${unseatedGuestsList.length} guest${unseatedGuestsList.length === 1 ? "" : "s"} remaining`;
  }

  // Show/hide button
  const openBtn = document.getElementById("openUnseatedPanel");
  if (openBtn) {
    console.log(
      `  Unseated guests: ${unseatedGuestsList.length}, Panel open: ${panelOpen}`,
    );
    if (unseatedGuestsList.length === 0) {
      openBtn.style.display = "none";
      console.log("  → Button hidden (no unseated guests)");
      closePanel();
    } else if (!panelOpen) {
      openBtn.style.display = "flex";
      openBtn.style.justifyContent = "center";
      openBtn.style.alignItems = "center";
      console.log("  → Button shown (unseated guests found)");
    }
  } else {
    console.log("  ❌ openBtn not found!");
  }

  renderUnseatedList();
}

// Render unseated guests list
function renderUnseatedList() {
  const list = document.getElementById("unseatedGuestsList");
  const searchTerm =
    document.getElementById("unseatedSearch")?.value.toLowerCase() || "";

  if (!list) return;

  // Filter by search
  let filtered = unseatedGuestsList;
  if (searchTerm) {
    filtered = unseatedGuestsList.filter((guest) =>
      guest.name.toLowerCase().includes(searchTerm),
    );
  }

  if (filtered.length === 0) {
    list.innerHTML =
      '<div style="padding: 20px 15px; text-align: center; color: #999; font-size: 0.9rem;">No unseated guests</div>';
    return;
  }

  list.innerHTML = filtered
    .map((guest) => {
      const isSelected = bulkSelectedGuests.has(guest.name.toLowerCase());

      // Check if guest has household members
      const hasHousehold =
        typeof householdManager !== "undefined" &&
        householdManager.getHouseholdMembers(guest.name).length > 1;
      const householdIcon = hasHousehold ? "👨‍👩‍👧‍👦" : "";

      if (isBulkMode) {
        // Bulk mode: checkbox + guest name
        return `
          <div class="unseated-guest-row" data-name="${guest.name}"
               style="display: flex; align-items: center; padding: 10px; margin-bottom: 6px; background: ${isSelected ? "#e8f5e9" : "white"}; border-radius: 4px; border: 1px solid #E9D6CF; cursor: pointer; transition: background 0.2s; font-size: 13px;">
            <input type="checkbox" class="guest-checkbox" ${isSelected ? "checked" : ""} style="width: 18px; height: 18px; cursor: pointer; margin-right: 10px;">
            <span style="flex: 1; font-weight: ${isSelected ? "600" : "500"}; color: #333;">${guest.name} ${householdIcon}</span>
          </div>
        `;
      } else {
        // Quick-add mode: guest name + action button
        const buttonText = hasHousehold ? "👫 Assign" : "✚ Assign";
        return `
          <div class="unseated-guest-row" data-name="${guest.name}"
               style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 6px; background: white; border-radius: 4px; border: 1px solid #E9D6CF; cursor: pointer; font-size: 13px;">
            <span style="flex: 1; color: #333;"><strong>${guest.name}</strong> ${householdIcon}</span>
            <button style="padding: 4px 10px; font-size: 12px; background: #f0c891; color: #3B2F2F; border: none; border-radius: 3px; cursor: pointer; white-space: nowrap; margin-left: 8px; font-weight: 500;">
              ${buttonText}
            </button>
          </div>
        `;
      }
    })
    .join("");

  // Attach event listeners
  if (isBulkMode) {
    list.querySelectorAll(".unseated-guest-row").forEach((row) => {
      const checkbox = row.querySelector(".guest-checkbox");
      const guestName = row.dataset.name;

      // Checkbox change event
      checkbox?.addEventListener("change", function (e) {
        e.stopPropagation();
        if (this.checked) {
          bulkSelectedGuests.add(guestName.toLowerCase());
        } else {
          bulkSelectedGuests.delete(guestName.toLowerCase());
        }
        updateBulkCount();
        renderUnseatedList();
      });

      // Row click - toggle checkbox
      row.addEventListener("click", function (e) {
        if (e.target !== checkbox) {
          e.stopPropagation();
          checkbox?.click();
        }
      });
    });
  } else {
    // Quick-add mode
    list.querySelectorAll(".unseated-guest-row").forEach((row) => {
      const button = row.querySelector("button");
      const guestName = row.dataset.name;

      // Button click - assign guest
      button?.addEventListener("click", function (e) {
        e.stopPropagation();
        quickAddGuest(guestName);
      });

      // Row click - also triggers assign
      row.addEventListener("click", function (e) {
        if (e.target === button) return; // Don't double-trigger
        quickAddGuest(guestName);
      });
    });
  }
}

// Quick-add a guest (with household seat-together option)
function quickAddGuest(guestName) {
  if (
    typeof seatingData === "undefined" ||
    !seatingData.tables ||
    seatingData.tables.length === 0
  ) {
    alert("No tables created yet. Please create a table first.");
    return;
  }

  // Check if already seated
  const currentTable = findGuestTable(guestName, seatingData.tables);
  if (currentTable) {
    alert(`${guestName} is already at Table ${currentTable}`);
    return;
  }

  // Check if guest has household members
  if (typeof householdManager !== "undefined") {
    const householdMembers = householdManager.getHouseholdMembers(guestName);
    if (householdMembers && householdMembers.length > 1) {
      // Has household - show modal to seat together
      quickAddHouseholdToTable(guestName, householdMembers);
      return;
    }
  }

  // No household, just seat the guest
  quickAddSingleGuest(guestName);
}

// Seat just a single guest
function quickAddSingleGuest(guestName) {
  if (typeof seatingData === "undefined" || seatingData.tables.length === 0) {
    return;
  }

  // Show table menu
  createTableMenu(
    (selectedTable) => {
      assignGuestToTable(guestName, selectedTable);
    },
    guestName,
    null,
  );
}

// Assign unseated household to a table (after modal confirmation)
function assignUnseatedHouseholdToTable(
  guestName,
  householdMembers,
  seatTogether,
) {
  const modal = document.getElementById("householdModal");
  if (modal) {
    modal.classList.remove("show");
  }

  if (!seatTogether) {
    quickAddSingleGuest(guestName);
    return;
  }

  const totalCount = householdMembers.length;

  // Check if any household members are already seated
  let alreadySeated = [];
  householdMembers.forEach((member) => {
    const currentTable = findGuestTable(member.name, seatingData.tables);
    if (currentTable) {
      alreadySeated.push({ name: member.name, table: currentTable });
    }
  });

  if (alreadySeated.length > 0) {
    // Remove them from their current tables
    alreadySeated.forEach((member) => {
      if (typeof removeGuestFromAllTables === "function") {
        removeGuestFromAllTables(member.name, seatingData.tables);
      }
    });
  }

  // Show table menu
  createTableMenu(
    (selectedTable) => {
      const table = seatingData.tables.find((t) => t.number === selectedTable);
      if (!table) {
        console.error("❌ Table not found");
        return;
      }

      const guestCount =
        table.guests && Array.isArray(table.guests) ? table.guests.length : 0;
      const maxGuests = Number(table.maxGuests) || 10;
      const availableSpace = maxGuests - guestCount;

      if (availableSpace < totalCount) {
        alert(
          `Not enough space! Need ${totalCount} seats but only ${availableSpace} available at Table ${selectedTable}.`,
        );
        return;
      }

      // Assign all household members to the table
      householdMembers.forEach((member) => {
        assignGuestToTable(member.name, selectedTable);
      });

      console.log(
        `✅ Seated ${totalCount} household members together at Table ${selectedTable}`,
      );
    },
    guestName,
    householdMembers,
  );
}

// Seat entire household together using the modal
function quickAddHouseholdToTable(guestName, householdMembers) {
  if (
    typeof seatingData === "undefined" ||
    !seatingData.tables ||
    seatingData.tables.length === 0
  ) {
    return;
  }

  if (typeof showHouseholdPrompt === "undefined") {
    console.warn(
      "❌ Household modal not available, falling back to single guest seating",
    );
    quickAddSingleGuest(guestName);
    return;
  }

  // Set up the pending household selection context
  window.pendingUnseatedHouseholdSelection = {
    guestName: guestName,
    householdMembers: householdMembers,
  };

  // Get other members (excluding the primary guest)
  const otherMembers = householdMembers.filter((m) => m.name !== guestName);

  // Show the household modal
  showHouseholdPrompt(guestName, otherMembers);

  // Override the modal buttons to handle unseated panel context
  const yesBtn = document.getElementById("householdYesBtn");
  const noBtn = document.getElementById("householdNoBtn");

  if (yesBtn) {
    yesBtn.onclick = () => {
      assignUnseatedHouseholdToTable(guestName, householdMembers, true);
    };
  }

  if (noBtn) {
    noBtn.onclick = () => {
      quickAddSingleGuest(guestName);
      document.getElementById("householdModal").classList.remove("show");
    };
  }
}

// Create table menu for selection
function createTableMenu(callback, guestName = null, householdMembers = null) {
  if (typeof seatingData === "undefined" || seatingData.tables.length === 0) {
    alert("No tables created yet. Please create a table first.");
    return;
  }

  const menu = document.createElement("div");
  menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #C68A65;
    border-radius: 8px;
    padding: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    min-width: 280px;
  `;

  const title = document.createElement("h3");
  let titleText = "Select a Table";
  if (guestName) {
    if (householdMembers && householdMembers.length > 1) {
      titleText = `Select a Table for ${guestName} and household`;
    } else {
      titleText = `Select a Table for ${guestName}`;
    }
  }
  title.textContent = titleText;
  title.style.cssText =
    "margin: 0 0 15px 0; color: #3B2F2F; text-align: center; font-family: 'Playfair Display', serif; flex-shrink: 0;";
  menu.appendChild(title);

  // Create a scrollable container for tables
  const tablesContainer = document.createElement("div");
  tablesContainer.style.cssText = `
    max-height: 50vh;
    overflow-y: auto;
    margin-bottom: 10px;
    flex: 1;
    flex-shrink: 1;
  `;
  menu.appendChild(tablesContainer);

  seatingData.tables.forEach((table) => {
    const tableNum = table.number || "?";
    const guestCount =
      table.guests && Array.isArray(table.guests) ? table.guests.length : 0;
    const maxGuests = Number(table.maxGuests) || 10;
    const btn = document.createElement("button");
    btn.innerHTML = `Table ${tableNum} (${guestCount}/${maxGuests})`;
    btn.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      background: #f0c891;
      color: #3B2F2F;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s;
      display: block;
    `;
    btn.onmouseover = () => (btn.style.background = "#e6bb6f");
    btn.onmouseout = () => (btn.style.background = "#f0c891");
    btn.onclick = () => {
      document.body.removeChild(menu);
      callback(tableNum);
    };
    tablesContainer.appendChild(btn);
  });

  // Cancel button - fixed outside scrollable area
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText = `
    width: 100%;
    padding: 10px;
    background: #E9D6CF;
    color: #3B2F2F;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-top: auto;
  `;
  cancelBtn.onmouseover = () => (cancelBtn.style.background = "#dfc4b8");
  cancelBtn.onmouseout = () => (cancelBtn.style.background = "#E9D6CF");
  cancelBtn.onclick = () => document.body.removeChild(menu);
  menu.appendChild(cancelBtn);

  // Create new table link
  const createTableLink = document.createElement("div");
  createTableLink.style.cssText = `
    text-align: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    flex-shrink: 0;
  `;
  const createLink = document.createElement("a");
  createLink.textContent = "+ Create new table";
  createLink.style.cssText = `
    color: #C68A65;
    text-decoration: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: color 0.2s;
  `;
  createLink.onmouseover = () => (createLink.style.color = "#b57753");
  createLink.onmouseout = () => (createLink.style.color = "#C68A65");
  createLink.onclick = (e) => {
    e.stopPropagation();
    document.body.removeChild(menu);
    // Store pending guest(s) for the new table
    if (householdMembers && householdMembers.length > 0) {
      window.pendingGuestsForNewTable = householdMembers.map((m) => m.name);
    } else if (guestName) {
      window.pendingGuestsForNewTable = [guestName];
    }
    if (typeof openModal === "function") {
      openModal(null);
    }
  };
  createTableLink.appendChild(createLink);
  menu.appendChild(createTableLink);

  document.body.appendChild(menu);

  // Add click-outside handler
  setTimeout(() => {
    document.addEventListener("click", function closeOnOutside(e) {
      if (!menu.contains(e.target) && menu.parentNode) {
        document.body.removeChild(menu);
        document.removeEventListener("click", closeOnOutside);
      }
    });
  }, 50);
}

// Assign guest to table
function assignGuestToTable(guestName, tableNumber) {
  if (typeof seatingData === "undefined") return;

  const table = seatingData.tables.find((t) => t.number === tableNumber);
  if (!table) {
    console.error("❌ Table not found");
    return;
  }

  // Initialize guests array if needed
  if (!table.guests) {
    table.guests = [];
  }

  // Add guest if not already there
  if (!table.guests.includes(guestName)) {
    table.guests.push(guestName);
  }

  // Update lookup
  if (typeof updateGuestLookup === "function") {
    updateGuestLookup();
  }

  // Update stats
  if (typeof updateGuestStats === "function") {
    updateGuestStats();
  }

  // Refresh table display
  if (typeof refreshTable === "function") {
    refreshTable(tableNumber);
  }

  // Auto-save to Firebase
  if (typeof autoSaveToFirebase === "function") {
    autoSaveToFirebase();
  }

  // Refresh unseated panel
  updateUnseatedPanel();

  console.log(`✅ ${guestName} added to Table ${tableNumber}`);
}

// Toggle bulk mode
function toggleBulkMode() {
  isBulkMode = !isBulkMode;
  bulkSelectedGuests.clear();

  const bulkToggle = document.getElementById("bulkModeToggle");
  const bulkSection = document.getElementById("bulkControlsSection");

  if (isBulkMode) {
    bulkToggle.textContent = "✕ Cancel";
    bulkToggle.style.background = "#E9D6CF";
    bulkToggle.style.color = "#C68A65";
    bulkSection.style.display = "flex";
    bulkSection.style.flexDirection = "column";
  } else {
    bulkToggle.textContent = "📋 Bulk";
    bulkToggle.style.background = "#C68A65";
    bulkToggle.style.color = "white";
    bulkSection.style.display = "none";
  }

  renderUnseatedList();
  updateBulkCount();
}

// Update bulk selection count
function updateBulkCount() {
  const countDiv = document.getElementById("bulkCount");
  if (countDiv) {
    countDiv.textContent = `${bulkSelectedGuests.size} selected`;
  }
}

// Select all guests
function selectAllGuests() {
  const searchTerm =
    document.getElementById("unseatedSearch")?.value.toLowerCase() || "";
  let filtered = unseatedGuestsList;

  if (searchTerm) {
    filtered = unseatedGuestsList.filter((guest) =>
      guest.name.toLowerCase().includes(searchTerm),
    );
  }

  filtered.forEach((guest) => {
    bulkSelectedGuests.add(guest.name.toLowerCase());
  });

  updateBulkCount();
  renderUnseatedList();
}

// Deselect all guests
function deselectAllGuests() {
  bulkSelectedGuests.clear();
  updateBulkCount();
  renderUnseatedList();
}

// Handle bulk assign
function handleBulkAssign() {
  if (bulkSelectedGuests.size === 0) {
    alert("Please select at least one guest.");
    return;
  }

  createBulkTableMenu((selectedTable) => {
    assignBulkGuestsToTable(selectedTable);
  }, bulkSelectedGuests.size);
}

// Create table menu for bulk assignment
function createBulkTableMenu(callback, selectedCount = null) {
  if (typeof seatingData === "undefined" || seatingData.tables.length === 0) {
    alert("No tables created yet.");
    return;
  }

  const menu = document.createElement("div");
  menu.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border: 2px solid #C68A65;
    border-radius: 8px;
    padding: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    max-height: 80vh;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    min-width: 280px;
  `;

  const title = document.createElement("h3");
  let titleText = `Assign guests to table`;
  if (selectedCount) {
    titleText = `Assign ${selectedCount} guests to table`;
  }
  title.textContent = titleText;
  title.style.cssText =
    "margin: 0 0 15px 0; color: #3B2F2F; text-align: center; font-family: 'Playfair Display', serif; flex-shrink: 0;";
  menu.appendChild(title);

  // Create a scrollable container for tables
  const tablesContainer = document.createElement("div");
  tablesContainer.style.cssText = `
    max-height: 50vh;
    overflow-y: auto;
    margin-bottom: 10px;
    flex: 1;
    flex-shrink: 1;
  `;
  menu.appendChild(tablesContainer);

  seatingData.tables.forEach((table) => {
    const tableNum = table.number || "?";
    const guestCount =
      table.guests && Array.isArray(table.guests) ? table.guests.length : 0;
    const maxGuests = Number(table.maxGuests) || 10;
    const btn = document.createElement("button");
    btn.innerHTML = `Table ${tableNum} (${guestCount}/${maxGuests})`;
    btn.style.cssText = `
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      background: #f0c891;
      color: #3B2F2F;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s;
      display: block;
    `;
    btn.onmouseover = () => (btn.style.background = "#e6bb6f");
    btn.onmouseout = () => (btn.style.background = "#f0c891");
    btn.onclick = () => {
      document.body.removeChild(menu);
      callback(tableNum);
    };
    tablesContainer.appendChild(btn);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText = `
    width: 100%;
    padding: 10px;
    background: #E9D6CF;
    color: #3B2F2F;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-top: auto;
  `;
  cancelBtn.onmouseover = () => (cancelBtn.style.background = "#dfc4b8");
  cancelBtn.onmouseout = () => (cancelBtn.style.background = "#E9D6CF");
  cancelBtn.onclick = () => document.body.removeChild(menu);
  menu.appendChild(cancelBtn);

  // Create new table link
  const createTableLink = document.createElement("div");
  createTableLink.style.cssText = `
    text-align: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    flex-shrink: 0;
  `;
  const createLink = document.createElement("a");
  createLink.textContent = "+ Create new table";
  createLink.style.cssText = `
    color: #C68A65;
    text-decoration: none;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: color 0.2s;
  `;
  createLink.onmouseover = () => (createLink.style.color = "#b57753");
  createLink.onmouseout = () => (createLink.style.color = "#C68A65");
  createLink.onclick = (e) => {
    e.stopPropagation();
    document.body.removeChild(menu);
    // Store pending guests for the new table (bulk mode)
    window.pendingGuestsForNewTable = Array.from(bulkSelectedGuests).map(
      (guestName) =>
        unseatedGuestsList.find((g) => g.name.toLowerCase() === guestName)
          ?.name || guestName,
    );
    if (typeof openModal === "function") {
      openModal(null);
    }
  };
  createTableLink.appendChild(createLink);
  menu.appendChild(createTableLink);

  document.body.appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", function closeOnOutside(e) {
      if (!menu.contains(e.target) && menu.parentNode) {
        document.body.removeChild(menu);
        document.removeEventListener("click", closeOnOutside);
      }
    });
  }, 50);
}

// Assign multiple guests to table
function assignBulkGuestsToTable(tableNumber) {
  const selectedGuests = Array.from(bulkSelectedGuests);

  selectedGuests.forEach((guestName) => {
    const guest = unseatedGuestsList.find(
      (g) => g.name.toLowerCase() === guestName,
    );
    if (guest) {
      assignGuestToTable(guest.name, tableNumber);
    }
  });

  bulkSelectedGuests.clear();
  isBulkMode = false;
  document.getElementById("bulkControlsSection").style.display = "none";
  document.getElementById("bulkModeToggle").textContent = "📋 Bulk";
  document.getElementById("bulkModeToggle").style.background = "#C68A65";
  document.getElementById("bulkModeToggle").style.color = "white";

  updateUnseatedPanel();
  console.log(
    `✅ ${selectedGuests.length} guests assigned to Table ${tableNumber}`,
  );
}

// Tab switching functionality
function switchTab(tab) {
  const unseatedTab = document.getElementById("unseatedTab");
  const seatedTab = document.getElementById("seatedTab");
  const unseatedControls = document.getElementById("unseatedControls");
  const seatedControls = document.getElementById("seatedControls");
  const unseatedGuestsList = document.getElementById("unseatedGuestsList");
  const seatedGuestsList = document.getElementById("seatedGuestsList");
  const panelTitle = document.getElementById("panelTitle");

  if (tab === "unseated") {
    // Show unseated tab
    unseatedTab.style.borderBottom = "3px solid #C68A65";
    unseatedTab.style.backgroundColor = "white";
    unseatedTab.style.color = "#3B2F2F";

    seatedTab.style.borderBottom = "none";
    seatedTab.style.backgroundColor = "#E0E0E0";
    seatedTab.style.color = "#666";

    unseatedControls.style.display = "flex";
    seatedControls.style.display = "none";
    unseatedGuestsList.style.display = "block";
    seatedGuestsList.style.display = "none";

    panelTitle.textContent = "Unseated Guests";

    // Update and render unseated list when switching to this tab
    updateUnseatedPanel();
    renderUnseatedList();
  } else if (tab === "seated") {
    // Show seated tab
    seatedTab.style.borderBottom = "3px solid #C68A65";
    seatedTab.style.backgroundColor = "white";
    seatedTab.style.color = "#3B2F2F";

    unseatedTab.style.borderBottom = "none";
    unseatedTab.style.backgroundColor = "#E0E0E0";
    unseatedTab.style.color = "#666";

    unseatedControls.style.display = "none";
    seatedControls.style.display = "flex";
    unseatedGuestsList.style.display = "none";
    seatedGuestsList.style.display = "block";

    panelTitle.textContent = "Seated Guests";

    // Calculate and display seated count
    if (typeof seatingData !== "undefined" && seatingData.tables) {
      const seatedCount = seatingData.tables.reduce((sum, table) => {
        return sum + (table.guests ? table.guests.length : 0);
      }, 0);

      const countHeader = document.getElementById("unseatedCountHeader");
      if (countHeader) {
        countHeader.textContent = `${seatedCount} guest${seatedCount === 1 ? "" : "s"} seated`;
      }
    }

    // Render seated list when switching to this tab
    renderSeatedList();
  }
}

// Render seated guests list
function renderSeatedList() {
  const seatedGuestsList = document.getElementById("seatedGuestsList");
  const searchTerm =
    document.getElementById("seatedSearch")?.value.toLowerCase() || "";

  if (!seatedGuestsList) return;
  seatedGuestsList.innerHTML = "";

  if (typeof seatingData === "undefined" || !seatingData.tables) {
    seatedGuestsList.innerHTML =
      '<div class="no-guests">No tables created yet</div>';
    return;
  }

  // Get all seated guests grouped by table
  let allTables = seatingData.tables.filter(
    (table) => table.guests && table.guests.length > 0,
  );

  if (allTables.length === 0) {
    seatedGuestsList.innerHTML =
      '<div class="no-guests">No guests seated yet</div>';
    return;
  }

  if (seatedSortBy === "name") {
    // Sort alphabetically by guest name
    const allSeatedGuests = [];
    allTables.forEach((table) => {
      table.guests.forEach((guestName) => {
        allSeatedGuests.push({
          name: guestName,
          tableNumber: table.number,
          maxGuests: table.maxGuests,
        });
      });
    });
    allSeatedGuests.sort((a, b) => a.name.localeCompare(b.name));

    // Filter and render
    const filteredGuests = allSeatedGuests.filter((g) =>
      g.name.toLowerCase().includes(searchTerm),
    );

    if (filteredGuests.length === 0) {
      seatedGuestsList.innerHTML = '<div class="no-guests">No matches</div>';
      return;
    }

    filteredGuests.forEach((guest) => {
      const guestRow = document.createElement("div");
      guestRow.style.display = "flex";
      guestRow.style.justifyContent = "space-between";
      guestRow.style.alignItems = "center";
      guestRow.style.padding = "10px";
      guestRow.style.marginBottom = "6px";
      guestRow.style.backgroundColor = "white";
      guestRow.style.borderRadius = "4px";
      guestRow.style.border = "1px solid #E9D6CF";
      guestRow.style.fontSize = "13px";

      // Guest name and table
      const nameSpan = document.createElement("span");
      nameSpan.innerHTML = `<strong>${guest.name}</strong> <span style="color: #999; font-size: 12px;">• Table ${guest.tableNumber}</span>`;
      nameSpan.style.flex = "1";
      guestRow.appendChild(nameSpan);

      // Action buttons
      const actionsDiv = document.createElement("div");
      actionsDiv.style.display = "flex";
      actionsDiv.style.gap = "6px";

      // Move button
      const moveBtn = document.createElement("button");
      moveBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
      moveBtn.style.padding = "4px 8px";
      moveBtn.style.fontSize = "12px";
      moveBtn.style.border = "none";
      moveBtn.style.backgroundColor = "#f0c891";
      moveBtn.style.color = "#3B2F2F";
      moveBtn.style.borderRadius = "3px";
      moveBtn.style.cursor = "pointer";
      moveBtn.title = "Move to another table";
      moveBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        moveSeatedGuest(guest.name, guest.tableNumber);
      });
      actionsDiv.appendChild(moveBtn);

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.style.padding = "4px 8px";
      removeBtn.style.fontSize = "12px";
      removeBtn.style.border = "none";
      removeBtn.style.backgroundColor = "#E9D6CF";
      removeBtn.style.color = "#C68A65";
      removeBtn.style.borderRadius = "3px";
      removeBtn.style.cursor = "pointer";
      removeBtn.title = "Remove from seating";
      removeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        removeSeatedGuest(guest.name, guest.tableNumber);
      });
      actionsDiv.appendChild(removeBtn);

      guestRow.appendChild(actionsDiv);
      seatedGuestsList.appendChild(guestRow);
    });
  } else {
    // Sort by table number (default)
    allTables.sort((a, b) => a.number - b.number);

    allTables.forEach((table) => {
      const tableSection = document.createElement("div");
      tableSection.className = "table-section";
      tableSection.style.marginBottom = "15px";
      tableSection.style.padding = "12px";
      tableSection.style.backgroundColor = "#F8F4F1";
      tableSection.style.borderRadius = "6px";
      tableSection.style.border = "1px solid #E9D6CF";

      // Table header
      const tableHeader = document.createElement("div");
      tableHeader.style.fontWeight = "bold";
      tableHeader.style.color = "#C68A65";
      tableHeader.style.marginBottom = "8px";
      tableHeader.style.fontSize = "14px";
      const maxGuests = Number(table.maxGuests) || 10;
      tableHeader.textContent = `Table ${table.number} (${table.guests.length}/${maxGuests})`;
      tableSection.appendChild(tableHeader);

      // Filter guests by search term
      const filteredGuests = table.guests.filter((name) =>
        name.toLowerCase().includes(searchTerm),
      );

      if (filteredGuests.length === 0 && searchTerm) {
        const noMatch = document.createElement("div");
        noMatch.style.fontSize = "12px";
        noMatch.style.color = "#999";
        noMatch.style.padding = "8px";
        noMatch.textContent = "No matches";
        tableSection.appendChild(noMatch);
      } else {
        // Guest rows
        filteredGuests.forEach((guestName) => {
          const guestRow = document.createElement("div");
          guestRow.style.display = "flex";
          guestRow.style.justifyContent = "space-between";
          guestRow.style.alignItems = "center";
          guestRow.style.padding = "8px";
          guestRow.style.marginBottom = "6px";
          guestRow.style.backgroundColor = "white";
          guestRow.style.borderRadius = "4px";
          guestRow.style.fontSize = "13px";

          // Guest name
          const nameSpan = document.createElement("span");
          nameSpan.textContent = guestName;
          nameSpan.style.flex = "1";
          guestRow.appendChild(nameSpan);

          // Action buttons
          const actionsDiv = document.createElement("div");
          actionsDiv.style.display = "flex";
          actionsDiv.style.gap = "6px";

          // Move button
          const moveBtn = document.createElement("button");
          moveBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
          moveBtn.style.padding = "4px 8px";
          moveBtn.style.fontSize = "12px";
          moveBtn.style.border = "none";
          moveBtn.style.backgroundColor = "#f0c891";
          moveBtn.style.color = "#3B2F2F";
          moveBtn.style.borderRadius = "3px";
          moveBtn.style.cursor = "pointer";
          moveBtn.title = "Move to another table";
          moveBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            moveSeatedGuest(guestName, table.number);
          });
          actionsDiv.appendChild(moveBtn);

          // Remove button
          const removeBtn = document.createElement("button");
          removeBtn.textContent = "✕";
          removeBtn.style.padding = "4px 8px";
          removeBtn.style.fontSize = "12px";
          removeBtn.style.border = "none";
          removeBtn.style.backgroundColor = "#E9D6CF";
          removeBtn.style.color = "#C68A65";
          removeBtn.style.borderRadius = "3px";
          removeBtn.style.cursor = "pointer";
          removeBtn.title = "Remove from seating";
          removeBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            removeSeatedGuest(guestName, table.number);
          });
          actionsDiv.appendChild(removeBtn);

          guestRow.appendChild(actionsDiv);
          tableSection.appendChild(guestRow);
        });
      }

      seatedGuestsList.appendChild(tableSection);
    });
  }
}

// Move a seated guest to a different table
function moveSeatedGuest(guestName, currentTableNumber) {
  createTableMenu((tableNumber) => {
    // Remove from current table
    const currentTable = seatingData.tables.find(
      (t) => t.number === currentTableNumber,
    );
    if (currentTable) {
      currentTable.guests = currentTable.guests.filter((g) => g !== guestName);
      if (typeof refreshTable === "function") {
        refreshTable(currentTableNumber);
      }
    }

    // Add to new table
    assignGuestToTable(guestName, tableNumber);

    // Update seated list
    renderSeatedList();
  }, guestName);
}

// Remove a seated guest from seating
function removeSeatedGuest(guestName, tableNumber) {
  if (confirm(`Remove ${guestName} from Table ${tableNumber}?`)) {
    const table = seatingData.tables.find((t) => t.number === tableNumber);
    if (table) {
      table.guests = table.guests.filter((g) => g !== guestName);

      // Update related systems
      if (typeof updateGuestLookup === "function") {
        updateGuestLookup();
      }
      if (typeof updateGuestStats === "function") {
        updateGuestStats();
      }
      if (typeof refreshTable === "function") {
        refreshTable(tableNumber);
      }
      if (typeof autoSaveToFirebase === "function") {
        autoSaveToFirebase();
      }
    }

    // Update both panels
    updateUnseatedPanel();
    renderSeatedList();

    console.log(`✅ ${guestName} removed from Table ${tableNumber}`);
  }
}
