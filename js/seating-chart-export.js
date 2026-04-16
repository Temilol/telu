// SVG Export Function for Seating Chart View Pages
function exportSeatingChartAsSVG() {
  const CARDS_PER_ROW = 4;
  const CARD_MARGIN = 50;
  const CARD_HEIGHT = 400;
  const CONTENT_AREA_X = CARD_MARGIN;
  const CONTENT_AREA_Y = 250;
  const TITLE_HEIGHT = 180;

  // Extract table data from page first
  const tableCards = document.querySelectorAll(".table-card");
  const tables = [];

  tableCards.forEach((card) => {
    const numberEl = card.querySelector(".table-number");
    const guestsList = card.querySelector(".guests-list");

    if (numberEl && guestsList) {
      const tableNum = numberEl.textContent.trim();
      const guests = [];
      card.querySelectorAll(".guest-item").forEach((item) => {
        guests.push(item.textContent.trim());
      });

      tables.push({ number: tableNum, guests: guests });
    }
  });

  // Calculate dynamic dimensions
  const numRows = Math.ceil(tables.length / CARDS_PER_ROW);
  const SVG_WIDTH = 1800;
  const SVG_HEIGHT =
    TITLE_HEIGHT +
    CONTENT_AREA_Y +
    numRows * (CARD_HEIGHT + CARD_MARGIN) +
    CARD_MARGIN;

  // Determine event type from title
  const eventType =
    document.querySelector("header p")?.textContent || "Seating Chart";

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
  <defs>
    <style>
      .title { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 600; text-anchor: middle; fill: #C68A65; }
      .subtitle { font-family: Arial, sans-serif; font-size: 28px; text-anchor: middle; fill: #3B2F2F; }
      .table-card { fill: white; stroke: #C68A65; stroke-width: 2; }
      .table-number { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 600; text-anchor: middle; fill: #C68A65; }
      .guest-name { font-family: Arial, sans-serif; font-size: 16px; text-anchor: middle; fill: #3B2F2F; }
      .floral { opacity: 0.3; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="white"/>
  
  <!-- Corner Florals with Petals and Leaves -->
  <!-- Top Left Floral -->
  <g class="floral" transform="translate(50, 35)">
    <!-- Petals -->
    <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#C68A65" transform="rotate(0)"/>
    <ellipse cx="8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(72)"/>
    <ellipse cx="7" cy="10" rx="6" ry="10" fill="#C68A65" transform="rotate(144)"/>
    <ellipse cx="-8" cy="8" rx="6" ry="10" fill="#C68A65" transform="rotate(216)"/>
    <ellipse cx="-8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(288)"/>
    <!-- Center -->
    <circle cx="0" cy="0" r="5" fill="#E9D6CF"/>
    <!-- Stem -->
    <line x1="0" y1="5" x2="0" y2="25" stroke="#9CAB6B" stroke-width="2"/>
    <!-- Leaves -->
    <ellipse cx="-6" cy="15" rx="3" ry="6" fill="#9CAB6B" transform="rotate(-30 -6 15)"/>
    <ellipse cx="6" cy="18" rx="3" ry="6" fill="#9CAB6B" transform="rotate(30 6 18)"/>
  </g>
  
  <!-- Top Right Floral -->
  <g class="floral" transform="translate(${SVG_WIDTH - 50}, 35)">
    <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#C68A65" transform="rotate(0)"/>
    <ellipse cx="8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(72)"/>
    <ellipse cx="7" cy="10" rx="6" ry="10" fill="#C68A65" transform="rotate(144)"/>
    <ellipse cx="-8" cy="8" rx="6" ry="10" fill="#C68A65" transform="rotate(216)"/>
    <ellipse cx="-8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="5" fill="#E9D6CF"/>
    <line x1="0" y1="5" x2="0" y2="25" stroke="#9CAB6B" stroke-width="2"/>
    <ellipse cx="-6" cy="15" rx="3" ry="6" fill="#9CAB6B" transform="rotate(-30 -6 15)"/>
    <ellipse cx="6" cy="18" rx="3" ry="6" fill="#9CAB6B" transform="rotate(30 6 18)"/>
  </g>
  
  <!-- Bottom Left Floral -->
  <g class="floral" transform="translate(50, ${SVG_HEIGHT - 35})">
    <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#C68A65" transform="rotate(0)"/>
    <ellipse cx="8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(72)"/>
    <ellipse cx="7" cy="10" rx="6" ry="10" fill="#C68A65" transform="rotate(144)"/>
    <ellipse cx="-8" cy="8" rx="6" ry="10" fill="#C68A65" transform="rotate(216)"/>
    <ellipse cx="-8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="5" fill="#E9D6CF"/>
    <line x1="0" y1="5" x2="0" y2="25" stroke="#9CAB6B" stroke-width="2"/>
    <ellipse cx="-6" cy="15" rx="3" ry="6" fill="#9CAB6B" transform="rotate(-30 -6 15)"/>
    <ellipse cx="6" cy="18" rx="3" ry="6" fill="#9CAB6B" transform="rotate(30 6 18)"/>
  </g>
  
  <!-- Bottom Right Floral -->
  <g class="floral" transform="translate(${SVG_WIDTH - 50}, ${SVG_HEIGHT - 35})">
    <ellipse cx="0" cy="-12" rx="6" ry="10" fill="#C68A65" transform="rotate(0)"/>
    <ellipse cx="8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(72)"/>
    <ellipse cx="7" cy="10" rx="6" ry="10" fill="#C68A65" transform="rotate(144)"/>
    <ellipse cx="-8" cy="8" rx="6" ry="10" fill="#C68A65" transform="rotate(216)"/>
    <ellipse cx="-8" cy="-8" rx="6" ry="10" fill="#C68A65" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="5" fill="#E9D6CF"/>
    <line x1="0" y1="5" x2="0" y2="25" stroke="#9CAB6B" stroke-width="2"/>
    <ellipse cx="-6" cy="15" rx="3" ry="6" fill="#9CAB6B" transform="rotate(-30 -6 15)"/>
    <ellipse cx="6" cy="18" rx="3" ry="6" fill="#9CAB6B" transform="rotate(30 6 18)"/>
  </g>
  
  <!-- Title -->
  <text x="${SVG_WIDTH / 2}" y="80" class="title">Seating Chart</text>
  <text x="${SVG_WIDTH / 2}" y="130" class="subtitle">${eventType}</text>
`;

  // Generate card layout
  const cardWidth =
    (SVG_WIDTH - (CARDS_PER_ROW + 1) * CARD_MARGIN) / CARDS_PER_ROW;

  tables.forEach((table, index) => {
    const row = Math.floor(index / CARDS_PER_ROW);
    const col = index % CARDS_PER_ROW;

    const x = CONTENT_AREA_X + col * (cardWidth + CARD_MARGIN);
    const y = CONTENT_AREA_Y + row * (CARD_HEIGHT + CARD_MARGIN);

    // Card background
    svgContent += `  <rect x="${x}" y="${y}" width="${cardWidth}" height="${CARD_HEIGHT}" class="table-card" rx="10"/>
`;

    // Table number
    svgContent += `  <text x="${x + cardWidth / 2}" y="${y + 50}" class="table-number">${table.number}</text>
`;

    // Guest names
    let guestY = y + 100;
    table.guests.forEach((guest, gIndex) => {
      if (gIndex < 8) {
        // Limit to 8 guests per card on SVG
        svgContent += `  <text x="${x + cardWidth / 2}" y="${guestY}" class="guest-name">${guest}</text>
`;
        guestY += 35;
      }
    });

    if (table.guests.length > 8) {
      svgContent += `  <text x="${x + cardWidth / 2}" y="${guestY}" class="guest-name">+${table.guests.length - 8} more</text>
`;
    }
  });

  svgContent += `</svg>`;

  // Download SVG
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "seating-chart.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  devLog("✓ Seating chart exported as SVG");
}

// Expose globally
window.exportSeatingChartAsSVG = exportSeatingChartAsSVG;
