// Zoom and Pan functionality for venue map

let currentZoom = 1;
let minZoom = 0.6;
let maxZoom = 1.2;
let zoomStep = 0.1;

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

document.addEventListener("DOMContentLoaded", function () {
  setupZoomControls();
});

function setupZoomControls() {
  const venueMap = document.getElementById("venueMap");
  const venueContainer = document.getElementById("venueContainer");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");

  if (!venueMap || !zoomInBtn) return; // Not on the seating chart page

  // Zoom in button
  zoomInBtn.addEventListener("click", () => {
    zoomIn();
  });

  // Zoom out button
  zoomOutBtn.addEventListener("click", () => {
    zoomOut();
  });

  // Reset zoom button
  zoomResetBtn.addEventListener("click", () => {
    resetZoom();
  });

  // Fullscreen button
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
      toggleFullscreen();
    });
  }

  // Floating add button (for fullscreen mode)
  const floatingAddBtn = document.getElementById("floatingAddBtn");
  if (floatingAddBtn) {
    floatingAddBtn.addEventListener("click", () => {
      // Trigger the same function as the regular Add Table button
      if (typeof window.openModal === "function") {
        window.openModal();
      }
    });
  }

  // Pan functionality when zoomed
  venueContainer.addEventListener("mousedown", (e) => {
    // Only pan if clicking on the container itself (not on tables)
    if (e.target === venueContainer || e.target === venueMap) {
      isPanning = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      venueContainer.style.cursor = "grabbing";
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!isPanning) return;

    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    updateTransform();
  });

  document.addEventListener("mouseup", () => {
    if (isPanning) {
      isPanning = false;
      venueContainer.style.cursor = "grab";
    }
  });

  // Touch support for mobile
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchDistance = 0;

  venueContainer.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      // Single touch - pan
      if (e.target === venueContainer || e.target === venueMap) {
        isPanning = true;
        touchStartX = e.touches[0].clientX - translateX;
        touchStartY = e.touches[0].clientY - translateY;
      }
    } else if (e.touches.length === 2) {
      // Two touches - pinch zoom
      isPanning = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
    }
  });

  venueContainer.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        translateX = e.touches[0].clientX - touchStartX;
        translateY = e.touches[0].clientY - touchStartY;
        updateTransform();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );

        if (lastTouchDistance > 0) {
          const delta = currentDistance - lastTouchDistance;
          if (delta > 5) {
            zoomIn();
          } else if (delta < -5) {
            zoomOut();
          }
        }

        lastTouchDistance = currentDistance;
      }
    },
    { passive: false },
  );

  venueContainer.addEventListener("touchend", () => {
    isPanning = false;
    lastTouchDistance = 0;
  });
}

function zoomIn() {
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    currentZoom = Math.min(currentZoom, maxZoom);
    updateTransform();
  }
}

function zoomOut() {
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    currentZoom = Math.max(currentZoom, minZoom);
    updateTransform();
  }
}

function resetZoom() {
  currentZoom = 1;
  translateX = 0;
  translateY = 0;
  updateTransform();
}

function updateTransform() {
  const venueMap = document.getElementById("venueMap");
  const zoomLevel = document.getElementById("zoomLevel");

  if (venueMap) {
    venueMap.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
  }

  if (zoomLevel) {
    zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

function toggleFullscreen() {
  const venueContainer = document.getElementById("venueContainer");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  if (!document.fullscreenElement) {
    venueContainer
      .requestFullscreen()
      .then(() => {
        fullscreenBtn.textContent = "⊗";
        fullscreenBtn.title = "Exit Fullscreen";
      })
      .catch((err) => {
        devError(`Error attempting to enable fullscreen: ${err.message}`);
      });
  } else {
    document.exitFullscreen().then(() => {
      fullscreenBtn.textContent = "⛶";
      fullscreenBtn.title = "Fullscreen";
    });
  }
}
