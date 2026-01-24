// Guest list data
const guestList = [
  {
    id: 0,
    firstName: "Obafemi",
    lastName: "Aderibigbe",
    plusOne: true,
    partySize: 2,
    additionalGuests: ["Feyisola Aderibigbe"],
  },
  {
    id: 1,
    firstName: "Tunde",
    lastName: "Oduwole",
    plusOne: true,
    partySize: 3,
    additionalGuests: ["Tunde Oduwole", "Kikelomo Oduwole", "Ayotunde Oduwole"],
  },
  {
    id: 2,
    firstName: "Festus",
    lastName: "Ajayi",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 3,
    firstName: "Temitayo",
    lastName: "Jaiyesimi",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 4,
    firstName: "Ajoke",
    lastName: "Oguntuga",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 5,
    firstName: "Shamisdeen",
    lastName: "Adenopo",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 6,
    firstName: "Ifedola",
    lastName: "Okupevi",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 7,
    firstName: "Taiwo",
    lastName: "Oduwole",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 8,
    firstName: "Kemi",
    lastName: "Adekunle",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 9,
    firstName: "Yemi",
    lastName: "Sonubi",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 10,
    firstName: "Adesua",
    lastName: "Ohiwere",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 11,
    firstName: "Taiye",
    lastName: "Opabunmi",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 12,
    firstName: "Tumi",
    lastName: "Alli- Adetoba",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 13,
    firstName: "Bunmi",
    lastName: "Adekoya",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 14,
    firstName: "Charles",
    lastName: "Odunlami",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 15,
    firstName: "Lucy",
    lastName: "Olusakin",
    plusOne: true,
    partySize: 2,
    additionalGuests: ["Oluwole Olusakin"],
  },
  {
    id: 16,
    firstName: "Lanre",
    lastName: "Odunuga",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 17,
    firstName: "Yinka",
    lastName: "Ogunbode",
    plusOne: true,
    partySize: 2,
    additionalGuests: [],
  },
  {
    id: 18,
    firstName: "Doja",
    lastName: "Otedola",
    plusOne: true,
    partySize: 2,
    additionalGuests: ["Rachael Dickson"],
  },
  {
    id: 19,
    firstName: "Modupe",
    lastName: "Adewuyi",
    plusOne: true,
    partySize: 1,
    additionalGuests: [],
  },
];

// Google Sheets Configuration
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwYnHZOao8qhIstXLZEXUMNg3ir72IC_lPf5x5Cyj8hoFXqYs--W_BWZjSzpEk6K-ek/exec";

// State management
let selectedGuest = null;
let rsvpData = loadRSVPData();

// Load RSVP data from localStorage
function loadRSVPData() {
  const stored = localStorage.getItem("weddingRSVPs");
  return stored ? JSON.parse(stored) : {};
}

// Save RSVP data to localStorage
function saveRSVPData() {
  localStorage.setItem("weddingRSVPs", JSON.stringify(rsvpData));
}

// Normalize string for searching
function normalizeString(str) {
  return str.toLowerCase().trim();
}

// Search guests
function searchGuests(query) {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = normalizeString(query);

  return guestList.filter((guest) => {
    const firstName = normalizeString(guest.firstName);
    const lastName = normalizeString(guest.lastName);
    const fullName = `${firstName} ${lastName}`;

    // Check primary guest name
    const matchesPrimary =
      firstName.includes(normalizedQuery) ||
      lastName.includes(normalizedQuery) ||
      fullName.includes(normalizedQuery);

    // Check additional guest names
    const matchesAdditional =
      guest.additionalGuests &&
      guest.additionalGuests.some((addGuest) =>
        normalizeString(addGuest).includes(normalizedQuery),
      );

    return matchesPrimary || matchesAdditional;
  });
}

// Display search results
function displaySearchResults(results) {
  const searchResults = document.getElementById("searchResults");
  const searchResultsFooter = document.getElementById("searchResultsFooter");
  const searchInput = document.getElementById("searchInput");
  const searchQuery = searchInput.value.trim();

  if (results.length === 0) {
    // Hide footer
    searchResultsFooter.style.display = "none";

    // Only show error message if there's an actual search query
    if (searchQuery && searchQuery.length >= 2) {
      searchResults.innerHTML = `
        <div class="no-results">
          <em>No guests found. Please check the spelling.</em><br><br>
          Still having trouble? Reach out to the couple and request access to their RSVP page.
        </div>
      `;
    } else {
      searchResults.innerHTML = "";
    }
    return;
  }

  searchResults.innerHTML = `
    <div class="search-results-title">Select your info below to continue or try searching again.</div>
    ${results
      .map((guest) => {
        const additionalGuestsText =
          guest.additionalGuests && guest.additionalGuests.length > 0
            ? guest.additionalGuests
                .map((name) => `<div class="guest-name">${name}</div>`)
                .join("")
            : "";

        return `
        <div class="guest-item" data-guest-id="${guest.id}">
          <div class="guest-info">
            <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
            ${additionalGuestsText}
            <div class="guest-details">
              Party size: ${guest.partySize}
            </div>
          </div>
          <button class="select-button" data-guest-id="${guest.id}">Select</button>
        </div>
      `;
      })
      .join("")}
  `;

  // Show and populate footer
  searchResultsFooter.innerHTML = `
    If none of these are you, please reach out to the couple to see exactly how they entered your details.<br><br>
    Still having trouble? Reach out to the couple and request access to their RSVP page.
  `;
  searchResultsFooter.style.display = "block";

  // Add click handlers for select buttons
  document.querySelectorAll(".select-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const guestId = parseInt(button.dataset.guestId);
      selectGuest(guestId);
    });
  });

  // Scroll to search results title
  setTimeout(() => {
    const titleElement = document.querySelector(".search-results-title");
    if (titleElement) {
      titleElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
}

// Select a guest
async function selectGuest(guestId) {
  selectedGuest = guestList.find((g) => g.id === guestId);

  if (!selectedGuest) return;

  // Hide search section and results
  const searchSection = document.querySelector(".search-section");
  searchSection.style.display = "none";

  // Show RSVP form container immediately with loading state
  const rsvpForm = document.getElementById("rsvpForm");
  const guestNameTitle = document.getElementById("guestNameTitle");
  const messageDiv = document.getElementById("message");

  const partyInfo =
    selectedGuest.partySize > 1 ? ` (Party of ${selectedGuest.partySize})` : "";
  guestNameTitle.textContent = `RSVP for ${selectedGuest.firstName} ${selectedGuest.lastName}${partyInfo}`;

  // Show form with loading message
  rsvpForm.classList.add("show");

  // Show loading message and hide form content
  const formElement = document.getElementById("rsvpFormElement");
  formElement.style.display = "none";

  messageDiv.textContent = "Loading your invitation...";
  messageDiv.className = "message";
  messageDiv.style.display = "block";
  messageDiv.style.background = "#f0f0f0";
  messageDiv.style.color = "#666";
  messageDiv.style.border = "2px solid #ddd";

  // Generate attendee fields
  generateAttendeeFields();

  // Try to load existing RSVP from Google Sheets
  const existingRSVP = await loadExistingRSVP(selectedGuest.id);

  // Hide loading message and show form content
  messageDiv.style.display = "none";
  formElement.style.display = "block";

  if (existingRSVP) {
    // Store in local cache
    rsvpData[selectedGuest.id] = existingRSVP;
    saveRSVPData();

    // Show update message
    showMessage(
      "You've already submitted an RSVP. You can update your response below.",
      "success",
    );

    populateForm(existingRSVP);
  } else {
    // Check localStorage as fallback
    const localRSVP = rsvpData[selectedGuest.id];
    if (localRSVP) {
      populateForm(localRSVP);
    } else {
      clearForm();
    }
  }

  // Scroll to form
  setTimeout(() => {
    rsvpForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

// Generate attendee input fields
function generateAttendeeFields() {
  const attendeeList = document.getElementById("attendeeList");
  attendeeList.innerHTML = "";

  if (!selectedGuest) return;

  for (let i = 0; i < selectedGuest.partySize; i++) {
    const attendeeDiv = document.createElement("div");
    attendeeDiv.className = "attendee-input-group";
    attendeeDiv.id = `attendee-group-${i}`;

    const label =
      i === 0
        ? "Primary Guest"
        : selectedGuest.partySize === 2
          ? "Additional Guest"
          : `Additional Guest ${i}`;

    // Use additional guest name if available, otherwise empty
    const defaultName =
      i === 0
        ? `${selectedGuest.firstName} ${selectedGuest.lastName}`
        : (selectedGuest.additionalGuests &&
            selectedGuest.additionalGuests[i - 1]) ||
          "";

    attendeeDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
        <label for="attendee${i}" style="margin: 0;">${label} Full Name</label>
        ${i === 0 ? '<span class="info-icon-wrapper"><svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg><span class="tooltip">This field cannot be edited. Please contact the couple for any updates to the name.</span></span>' : ""}
      </div>
      <div class="input-with-icon">
        <input 
          type="text" 
          id="attendee${i}" 
          name="attendee${i}" 
          value="${defaultName}"
          placeholder="Please enter the guest's full name"
          ${i === 0 ? "readonly" : ""}
          data-attendee-index="${i}"
        />
        ${i === 0 ? '<span class="lock-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>' : ""}
      </div>
      ${
        i > 0
          ? `
        <div class="attendee-checkbox-wrapper">
          <input 
            type="checkbox" 
            id="notAttending${i}" 
            name="notAttending${i}"
            data-attendee-index="${i}"
          />
          <label for="notAttending${i}">Mark the checkbox if the guest will not be attending</label>
        </div>
      `
          : ""
      }
    `;

    attendeeList.appendChild(attendeeDiv);

    // Add touch/click handler for info icon on mobile
    if (i === 0) {
      setTimeout(() => {
        const infoIcon = attendeeDiv.querySelector(".info-icon-wrapper");
        if (infoIcon) {
          infoIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            const tooltip = infoIcon.querySelector(".tooltip");
            tooltip.classList.toggle("tooltip-visible");
          });
        }
      }, 0);
    }

    // Add event listener for not-attending checkbox if it's not the primary guest
    if (i > 0) {
      setTimeout(() => {
        const checkbox = document.getElementById(`notAttending${i}`);
        const input = document.getElementById(`attendee${i}`);
        const group = document.getElementById(`attendee-group-${i}`);

        if (checkbox && input && group) {
          checkbox.addEventListener("change", (e) => {
            if (e.target.checked) {
              input.value = "";
              input.disabled = true;
              group.classList.add("not-attending");
            } else {
              input.disabled = false;
              group.classList.remove("not-attending");
            }
          });
        }
      }, 0);
    }
  }
}

// Populate form with existing RSVP
function populateForm(rsvp) {
  // Set attendance
  const attendingRadio = document.querySelector(
    `input[name="attendance"][value="${rsvp.attendance}"]`,
  );
  if (attendingRadio) {
    attendingRadio.checked = true;
    toggleEventSelection(rsvp.attendance === "yes");
    toggleAttendeeDetails(rsvp.attendance === "yes");
  }

  // Set events
  if (rsvp.events) {
    rsvp.events.forEach((event) => {
      const checkbox = document.querySelector(
        `input[name="events"][value="${event}"]`,
      );
      if (checkbox) checkbox.checked = true;
    });
  }

  // Populate attendee names
  if (rsvp.attendees && rsvp.attendees.length > 0) {
    rsvp.attendees.forEach((attendee, index) => {
      const input = document.getElementById(`attendee${index}`);
      if (input) {
        input.value = attendee.name;
      }
    });

    // Mark guests as not attending if they weren't in the attendees list
    for (let i = 1; i < selectedGuest.partySize; i++) {
      const wasIncluded = rsvp.attendees.some((a, idx) => idx === i && a.name);
      const checkbox = document.getElementById(`notAttending${i}`);
      const input = document.getElementById(`attendee${i}`);
      const group = document.getElementById(`attendee-group-${i}`);

      if (!wasIncluded && checkbox && input && group) {
        checkbox.checked = true;
        input.disabled = true;
        input.required = false;
        group.classList.add("not-attending");
      }
    }
  }
}

// Clear form
function clearForm() {
  document.getElementById("rsvpFormElement").reset();
  toggleEventSelection(false);
  toggleAttendeeDetails(false);
  generateAttendeeFields(); // Regenerate with default values
}

// Toggle event selection visibility
function toggleEventSelection(show) {
  const eventSelection = document.getElementById("eventSelection");
  eventSelection.style.display = show ? "block" : "none";

  // Clear event checkboxes if hiding
  if (!show) {
    document.querySelectorAll('input[name="events"]').forEach((cb) => {
      cb.checked = false;
    });
  }
}

// Toggle attendee details visibility
function toggleAttendeeDetails(show) {
  const attendeeDetails = document.getElementById("attendeeDetails");
  attendeeDetails.style.display = show ? "block" : "none";
}

// Show message
function showMessage(text, type) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerHTML = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block"; // Override any inline display:none
  messageDiv.style.background = ""; // Clear inline styles
  messageDiv.style.color = "";
  messageDiv.style.border = "";

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Don't auto-hide success messages
  if (type !== "success") {
    setTimeout(() => {
      messageDiv.className = "message";
      messageDiv.style.display = "none";
    }, 5000);
  }
}

// Handle form submission
function handleSubmit(e) {
  e.preventDefault();

  if (!selectedGuest) {
    showMessage("Please select a guest first.", "error");
    return;
  }

  const formData = new FormData(e.target);
  const attendance = formData.get("attendance");

  // Check if attendance is selected
  if (!attendance) {
    showMessage("Please select whether you will be attending or not.", "error");
    return;
  }

  // Validate events if attending
  if (attendance === "yes") {
    const events = formData.getAll("events");
    if (events.length === 0) {
      showMessage("Please select at least one event to attend.", "error");
      return;
    }

    // Collect attendee information
    const attendees = [];

    for (let i = 0; i < selectedGuest.partySize; i++) {
      const notAttendingCheckbox = document.getElementById(`notAttending${i}`);
      const isNotAttending =
        notAttendingCheckbox && notAttendingCheckbox.checked;

      if (!isNotAttending) {
        const attendeeName = formData.get(`attendee${i}`);
        if (attendeeName && attendeeName.trim()) {
          attendees.push({
            name: attendeeName.trim(),
            isPrimary: i === 0,
          });
        } else {
          const guestLabel = i === 0 ? "Primary guest" : "Additional guest";
          showMessage(
            `${guestLabel} name is required. Please fill in the name or mark as not attending.`,
            "error",
          );
          return;
        }
      }
    }

    // Store attendee info in rsvp
    var attendeesData = attendees;
  } else {
    var attendeesData = [];
  }

  // Collect form data
  const rsvp = {
    guestId: selectedGuest.id,
    guestName: `${selectedGuest.firstName} ${selectedGuest.lastName}`,
    partySize: selectedGuest.partySize,
    attendance: attendance,
    events: attendance === "yes" ? formData.getAll("events") : [],
    attendees: attendeesData,
    attendeeCount: attendeesData.length,
    submittedAt: new Date().toISOString(),
  };

  // Save to localStorage as backup
  rsvpData[selectedGuest.id] = rsvp;
  saveRSVPData();

  // Send to Google Sheets
  sendToGoogleSheets(rsvp);

  // Hide search section and RSVP form
  const searchSection = document.querySelector(".search-section");
  const rsvpForm = document.getElementById("rsvpForm");
  searchSection.style.display = "none";
  rsvpForm.style.display = "none";

  // Show confirmation section
  const confirmationSection = document.getElementById("confirmationSection");
  const confirmationTitle = document.getElementById("confirmationTitle");
  const confirmationMessage = document.getElementById("confirmationMessage");

  const attendeeCountMsg = rsvp.attendeeCount > 1 ? ` and your guest(s)` : "";

  if (attendance === "yes") {
    confirmationTitle.textContent = `Thank You, ${selectedGuest.firstName}!`;
    confirmationMessage.innerHTML = `
      We're thrilled you ${attendeeCountMsg} can join us! 🎉<br>
      We've received your RSVP and will send you more details closer to the date.<br>
      Looking forward to celebrating with you!
    `;
  } else {
    confirmationTitle.textContent = `Thank You, ${selectedGuest.firstName}`;
    confirmationMessage.innerHTML = `
      Thank you for letting us know. We hope to celebrate with you another time.
    `;
  }

  confirmationSection.style.display = "block";

  // Scroll to confirmation
  setTimeout(() => {
    confirmationSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 100);
}

// Load existing RSVP from Google Sheets
async function loadExistingRSVP(guestId) {
  // Check if Google Script URL is configured
  if (GOOGLE_SCRIPT_URL === "YOUR_WEB_APP_URL_HERE") {
    return null;
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?guestId=${guestId}`, {
      method: "GET",
    });

    const data = await response.json();

    if (data.status === "success" && data.data) {
      // Parse the data from Google Sheets format
      const rsvpData = data.data;

      // Parse attendee names back into array
      let attendees = [];
      if (rsvpData.attendeeNames && rsvpData.attendeeNames !== "N/A") {
        attendees = rsvpData.attendeeNames.split("; ").map((name, index) => ({
          name: name,
          isPrimary: index === 0,
        }));
      }

      // Parse events back into array
      let events = [];
      if (rsvpData.events && rsvpData.events !== "None") {
        events = rsvpData.events.split("; ");
      }

      return {
        guestId: rsvpData.guestId,
        guestName: rsvpData.guestName,
        partySize: rsvpData.partySize,
        attendance: rsvpData.attendance,
        attendeeCount: rsvpData.attendeeCount,
        attendees: attendees,
        events: events,
        submittedAt: rsvpData.submittedAt,
      };
    }

    return null;
  } catch (error) {
    console.error("Error loading existing RSVP:", error);
    return null;
  }
}

// Send RSVP data to Google Sheets
async function sendToGoogleSheets(rsvp) {
  // Check if Google Script URL is configured
  if (GOOGLE_SCRIPT_URL === "YOUR_WEB_APP_URL_HERE") {
    console.warn(
      "Google Sheets integration not configured. Data saved to localStorage only.",
    );
    return;
  }

  try {
    // Prepare data for Google Sheets
    const sheetData = {
      guestId: rsvp.guestId,
      guestName: rsvp.guestName,
      partySize: rsvp.partySize,
      attendance: rsvp.attendance,
      attendeeCount: rsvp.attendeeCount,
      attendeeNames: rsvp.attendees.map((a) => a.name).join("; ") || "N/A",
      events: rsvp.events.join("; ") || "None",
      submittedAt: new Date(rsvp.submittedAt).toLocaleString(),
    };

    // Send to Google Sheets
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetData),
    });

    console.log("RSVP sent to Google Sheets successfully");
  } catch (error) {
    console.error("Error sending to Google Sheets:", error);
    // Data is still saved in localStorage as backup
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const rsvpFormElement = document.getElementById("rsvpFormElement");

  // Search function
  const performSearch = () => {
    const searchQuery = searchInput.value.trim();

    // Show search section if hidden
    const searchSection = document.querySelector(".search-section");
    searchSection.style.display = "block";

    // Hide RSVP form when searching
    const rsvpForm = document.getElementById("rsvpForm");
    rsvpForm.classList.remove("show");
    selectedGuest = null;

    // Clear results if search is empty
    if (!searchQuery || searchQuery.length < 2) {
      const searchResults = document.getElementById("searchResults");
      searchResults.innerHTML = "";
      return;
    }

    const results = searchGuests(searchQuery);
    displaySearchResults(results);
  };

  // Search button click handler
  searchButton.addEventListener("click", performSearch);

  // Search on Enter key
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Clear results when input changes
  searchInput.addEventListener("input", () => {
    const searchResults = document.getElementById("searchResults");
    const rsvpForm = document.getElementById("rsvpForm");
    const searchSection = document.querySelector(".search-section");

    // Only clear if there are existing results or form is shown
    if (searchResults.innerHTML || rsvpForm.classList.contains("show")) {
      searchResults.innerHTML = "";
      rsvpForm.classList.remove("show");
      searchSection.style.display = "block";
      selectedGuest = null;
    }
  });

  // Attendance radio change handler
  document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const isAttending = e.target.value === "yes";
      toggleEventSelection(isAttending);
      toggleAttendeeDetails(isAttending);
    });
  });

  // Form submission
  rsvpFormElement.addEventListener("submit", handleSubmit);

  // Close tooltip when clicking anywhere else on the page
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".info-icon-wrapper")) {
      document.querySelectorAll(".tooltip").forEach((tooltip) => {
        tooltip.classList.remove("tooltip-visible");
      });
    }
  });
});

// Export functions for potential backend integration
window.RSVPManager = {
  getGuestList: () => guestList,
  getRSVPData: () => rsvpData,
  exportRSVPs: () => {
    // Convert RSVP data to CSV format
    const csvRows = [
      [
        "Guest ID",
        "Guest Name",
        "Party Size",
        "Attendance",
        "Attendee Count",
        "Attendee Names",
        "Events",
        "Submitted At",
      ],
    ];

    Object.values(rsvpData).forEach((rsvp) => {
      const guest = guestList.find((g) => g.id === rsvp.guestId);
      if (guest) {
        const attendeeNames =
          rsvp.attendees && rsvp.attendees.length > 0
            ? rsvp.attendees.map((a) => a.name).join("; ")
            : "N/A";

        csvRows.push([
          guest.id,
          rsvp.guestName,
          guest.partySize,
          rsvp.attendance,
          rsvp.attendeeCount || 0,
          attendeeNames,
          rsvp.events.join("; "),
          new Date(rsvp.submittedAt).toLocaleString(),
        ]);
      }
    });

    return csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  },
};
