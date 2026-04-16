// Household management utilities
// Handles grouping guests by household, finding household members, and household-related logic

class HouseholdManager {
  constructor() {
    this.householdMap = new Map(); // Map: householdId -> [guests]
    this.guestToHouseholdMap = new Map(); // Map: guestName -> householdId
  }

  /**
   * Build household map from guest list
   * @param {Array} guests - List of guests with householdId property
   */
  buildHouseholdMap(guests) {
    this.householdMap.clear();
    this.guestToHouseholdMap.clear();

    guests.forEach((guest) => {
      const householdId = guest.householdId;

      // Skip guests without household ID
      if (!householdId || householdId === -1) {
        return;
      }

      // Map guest to household
      const guestKey = guest.name.toLowerCase();
      this.guestToHouseholdMap.set(guestKey, householdId);

      // Add guest to household list
      if (!this.householdMap.has(householdId)) {
        this.householdMap.set(householdId, []);
      }
      this.householdMap.get(householdId).push(guest);
    });

    devLog(`👥 Built household map: ${this.householdMap.size} households`);
  }

  /**
   * Get all household members for a guest
   * @param {string} guestName - Guest name to look up
   * @returns {Array} List of household members (including the guest)
   */
  getHouseholdMembers(guestName) {
    const guestKey = guestName.toLowerCase();
    const householdId = this.guestToHouseholdMap.get(guestKey);

    if (!householdId) {
      return []; // Guest has no household
    }

    return this.householdMap.get(householdId) || [];
  }

  /**
   * Check if a guest is in a household
   * @param {string} guestName - Guest name
   * @returns {boolean}
   */
  isInHousehold(guestName) {
    return this.guestToHouseholdMap.has(guestName.toLowerCase());
  }

  /**
   * Get household members NOT including the specified guest
   * @param {string} guestName - Guest name
   * @returns {Array} Other household members
   */
  getOtherHouseholdMembers(guestName) {
    const allMembers = this.getHouseholdMembers(guestName);
    return allMembers.filter(
      (member) => member.name.toLowerCase() !== guestName.toLowerCase(),
    );
  }

  /**
   * Get household ID for a guest
   * @param {string} guestName - Guest name
   * @returns {number|null} Household ID or null
   */
  getHouseholdId(guestName) {
    return this.guestToHouseholdMap.get(guestName.toLowerCase()) || null;
  }

  /**
   * Format household members for display
   * @param {Array} members - List of guests
   * @returns {string} Formatted string like "Maria Johnson, Carlos Johnson, Sofia Johnson"
   */
  formatHouseholdMembers(members) {
    return members.map((m) => m.name).join(", ");
  }

  /**
   * Get summary of household
   * @param {string} guestName - Guest name
   * @returns {string} Summary like "3 people: Maria Johnson, Carlos Johnson, Sofia Johnson"
   */
  getHouseholdSummary(guestName) {
    const members = this.getHouseholdMembers(guestName);
    if (members.length === 0) {
      return null; // Not in a household
    }
    return `${members.length} ${members.length === 1 ? "person" : "people"}: ${this.formatHouseholdMembers(members)}`;
  }
}

// Create global instance
const householdManager = new HouseholdManager();

/**
 * Format household info for display as a badge
 * @param {string} guestName - Primary guest name
 * @returns {string|null} HTML for household badge or null
 */
function getHouseholdBadgeHTML(guestName) {
  const otherMembers = householdManager.getOtherHouseholdMembers(guestName);

  if (otherMembers.length === 0) {
    return null; // No other household members
  }

  const otherNames = otherMembers.map((m) => m.name).join(", ");
  const totalCount = otherMembers.length + 1;

  return `
    <div class="household-info-badge" style="display: inline-flex; align-items: center; gap: 8px; background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 8px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; margin-top: -5px;">
      <span style="font-size: 14px;"><i class="fa-solid fa-people-group"></i></span>
      <span><strong>Household:</strong> ${otherNames} (${totalCount} total)</span>
    </div>
  `;
}

/**
 * Find which table a guest is currently seated at
 * @param {string} guestName - Guest name
 * @param {Array} tables - Seating tables
 * @returns {number|null} Table number or null if not seated
 */
function findGuestTableForHousehold(guestName, tables) {
  if (!tables) return null;

  for (const table of tables) {
    if (
      table.guests &&
      table.guests.some((g) => g.toLowerCase() === guestName.toLowerCase())
    ) {
      return table.number;
    }
  }
  return null;
}

/**
 * Get household member locations (which tables they're seated at)
 * @param {string} guestName - Guest name
 * @param {Array} tables - Seating tables
 * @returns {Object} { seated: [{ name, table }], unseated: [name] }
 */
function getHouseholdMemberLocations(guestName, tables) {
  const allMembers = householdManager.getHouseholdMembers(guestName);
  const result = { seated: [], unseated: [] };

  allMembers.forEach((member) => {
    const table = findGuestTableForHousehold(member.name, tables);
    if (table) {
      result.seated.push({ name: member.name, table });
    } else {
      result.unseated.push(member.name);
    }
  });

  return result;
}

/**
 * Remove a guest from all tables
 * @param {string} guestName - Guest name to remove
 * @param {Array} tables - Seating tables
 */
function removeGuestFromAllTables(guestName, tables) {
  tables.forEach((table) => {
    if (table.guests) {
      table.guests = table.guests.filter(
        (g) => g.toLowerCase() !== guestName.toLowerCase(),
      );
    }
  });
}

/**
 * Remove entire household from all tables
 * @param {string} guestName - Any guest name in the household
 * @param {Array} tables - Seating tables
 */
function removeHouseholdFromAllTables(guestName, tables) {
  const members = householdManager.getHouseholdMembers(guestName);
  members.forEach((member) => {
    removeGuestFromAllTables(member.name, tables);
  });
}
