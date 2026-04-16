// Export Menu Initialization
function initExportMenu() {
  const exportMenuBtn = document.getElementById("exportMenuBtn");
  const exportMenu = document.getElementById("exportMenu");

  if (!exportMenuBtn || !exportMenu) return;

  // Toggle export dropdown menu
  exportMenuBtn.addEventListener("click", function () {
    exportMenu.classList.toggle("show");
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    const container = document.querySelector(".export-menu-container");
    if (!container || !container.contains(e.target)) {
      exportMenu.classList.remove("show");
    }
  });

  // Export format handlers
  document.querySelectorAll(".export-option").forEach((btn) => {
    btn.addEventListener("click", function () {
      const format = this.dataset.format;
      exportMenu.classList.remove("show");

      if (format === "png") exportPNG();
      else if (format === "svg") exportSVG();
      else if (format === "pdf") exportPDF();
    });
  });
}

// Export functionality
const timestamp = new Date().toISOString().split("T")[0];

async function exportPNG() {
  const button = document.getElementById("exportMenuBtn");
  const originalText = button.textContent;
  const eventName = window.currentEventId?.split("-").pop() || "seating";

  try {
    button.textContent = "⏳ Exporting...";
    button.disabled = true;

    const venueMap = document.getElementById("venueMap");
    const canvas = await html2canvas(venueMap, {
      backgroundColor: "#FFFFFF",
      scale: 2,
      logging: false,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `seating-chart-${eventName}-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    button.textContent = "✅ PNG Exported!";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    devError("PNG export failed:", error);
    button.textContent = "❌ Export Failed";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}

async function exportSVG() {
  const button = document.getElementById("exportMenuBtn");
  const originalText = button.textContent;
  const eventName = window.currentEventId?.split("-").pop() || "seating";

  try {
    button.textContent = "⏳ Exporting...";
    button.disabled = true;

    const venueMap = document.getElementById("venueMap");
    const canvas = await html2canvas(venueMap, {
      backgroundColor: "#FFFFFF",
      scale: 2,
      logging: false,
    });

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", canvas.width);
    svg.setAttribute("height", canvas.height);
    svg.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);

    const image = document.createElementNS(svgNS, "image");
    image.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      canvas.toDataURL("image/png"),
    );
    image.setAttribute("width", canvas.width);
    image.setAttribute("height", canvas.height);
    svg.appendChild(image);

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seating-chart-${eventName}-${timestamp}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    button.textContent = "✅ SVG Exported!";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    devError("SVG export failed:", error);
    button.textContent = "❌ Export Failed";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}

async function exportPDF() {
  const button = document.getElementById("exportMenuBtn");
  const originalText = button.textContent;
  const eventName = window.currentEventId?.split("-").pop() || "seating";

  try {
    button.textContent = "⏳ Exporting...";
    button.disabled = true;

    const venueMap = document.getElementById("venueMap");
    const canvas = await html2canvas(venueMap, {
      backgroundColor: "#FFFFFF",
      scale: 2,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`seating-chart-${eventName}-${timestamp}.pdf`);

    button.textContent = "✅ PDF Exported!";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  } catch (error) {
    devError("PDF export failed:", error);
    button.textContent = "❌ Export Failed";
    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 2000);
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initExportMenu);
} else {
  initExportMenu();
}
