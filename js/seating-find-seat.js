/**
 * Shared search functionality for find-seat pages
 * Usage: Include this script after firebase-seating.js is loaded
 */

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById("guestSearch");
  const searchResult = document.getElementById("searchResult");
  const noResult = document.getElementById("noResult");

  // Real-time search as user types
  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();

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
});

/**
 * Find guest by name (fuzzy matching)
 * Exact match → Partial match → First/last name prefix match
 */
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

/**
 * Display search result with name, table, and tablemates
 */
function displayResult(result) {
  document.getElementById("resultName").textContent = result.name;
  document.getElementById("resultTable").textContent = `Table ${result.tableNumber}`;
  
  const tablematesText = result.tablemates.length > 0
    ? `Seated with: ${result.tablemates.join(", ")}`
    : "";
  const tablematesEl = document.getElementById("resultTablemates");
  tablematesEl.textContent = tablematesText;
  tablematesEl.style.display = tablematesText ? "block" : "none";
}
