// Guest list data
// In a production environment, this would be fetched from a backend API
const guestList = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    plusOne: true,
    partySize: 2,
    additionalGuests: ["Jane Smith", "John Smith Jr."], // Optional: add names of additional guests in party
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 3,
    firstName: "Michael",
    lastName: "Williams",
    email: "michael.williams@example.com",
    plusOne: true,
    partySize: 2,
    additionalGuests: ["Lisa Williams"],
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.brown@example.com",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 5,
    firstName: "David",
    lastName: "Jones",
    email: "david.jones@example.com",
    plusOne: true,
    partySize: 5,
    additionalGuests: [
      "Maria Jones",
      "Alex Jones",
      "Sophie Jones",
      "Ryan Jones",
    ],
  },
  {
    id: 6,
    firstName: "Jessica",
    lastName: "Garcia",
    email: "jessica.garcia@example.com",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 7,
    firstName: "James",
    lastName: "Martinez",
    email: "james.martinez@example.com",
    plusOne: true,
    partySize: 2,
    additionalGuests: ["Anna Martinez"],
  },
  {
    id: 8,
    firstName: "Ashley",
    lastName: "Rodriguez",
    email: "ashley.rodriguez@example.com",
    plusOne: false,
    partySize: 1,
    additionalGuests: [],
  },
  {
    id: 9,
    firstName: "Toluwani",
    lastName: "Taiwo",
    email: "toluwani.taiwo@example.com",
    plusOne: true,
    partySize: 5,
    additionalGuests: [
      "Maria Jones",
      "Alex Jones",
      "Sophie Jones",
      "Ryan Jones",
    ],
  },
  {
    id: 10,
    firstName: "Test",
    lastName: "Hazz",
    email: "test.hazz@example.com",
    plusOne: true,
    partySize: 8,
    additionalGuests: [
      "Maria Jones",
      "Alex Jones",
      "Sophie Jones",
      "Ryan Jones",
    ],
  },
  // Add more guests as needed
];

// Google Sheets Configuration
// Replace this URL with your Google Apps Script Web App URL after deployment
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
  const searchInput = document.getElementById("searchInput");
  const searchQuery = searchInput.value.trim();

  if (results.length === 0) {
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

  searchResults.innerHTML = results
    .map((guest) => {
      const additionalGuestsText =
        guest.additionalGuests && guest.additionalGuests.length > 0
          ? `<div style="font-size: 0.85rem; color: #666; margin-top: 3px;">+ ${guest.additionalGuests.join(", ")}</div>`
          : "";

      return `
      <div class="guest-item" data-guest-id="${guest.id}">
        <div class="guest-name">${guest.firstName} ${guest.lastName}</div>
        ${additionalGuestsText}
        <div class="guest-details">
          Party size: ${guest.partySize}
        </div>
      </div>
    `;
    })
    .join("");

  // Add click handlers
  document.querySelectorAll(".guest-item").forEach((item) => {
    item.addEventListener("click", () => {
      const guestId = parseInt(item.dataset.guestId);
      selectGuest(guestId);
    });
  });
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
      <label for="attendee${i}">${label} Full Name</label>
      <input 
        type="text" 
        id="attendee${i}" 
        name="attendee${i}" 
        value="${defaultName}"
        placeholder="Enter full name"
        ${i === 0 ? "required readonly" : "required"}
        data-attendee-index="${i}"
      />
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
          <label for="notAttending${i}">This guest will not be attending</label>
        </div>
      `
          : ""
      }
    `;

    attendeeList.appendChild(attendeeDiv);

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
              input.required = false;
              group.classList.add("not-attending");
            } else {
              input.disabled = false;
              input.required = true;
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

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });

  // Don't auto-hide success messages
  if (type !== "success") {
    setTimeout(() => {
      messageDiv.className = "message";
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
    email: selectedGuest.email,
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
        email: rsvpData.email,
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
      email: rsvp.email,
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
        "Email",
        "Party Size",
        "Attendance",
        "Attendee Count",
        "Attendee Names",
        "Events",
        "Dietary",
        "Notes",
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
          guest.email,
          guest.partySize,
          rsvp.attendance,
          rsvp.attendeeCount || 0,
          attendeeNames,
          rsvp.events.join("; "),
          rsvp.dietary || "None",
          rsvp.notes || "None",
          new Date(rsvp.submittedAt).toLocaleString(),
        ]);
      }
    });

    return csvRows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  },
};
