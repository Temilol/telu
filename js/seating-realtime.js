// Real-time sync for seating chart editor
// Shows a notification banner when another editor makes changes
// Warns before overwriting remote changes on save

(function () {
  "use strict";

  // Track whether a remote update arrived that we haven't reloaded yet
  let remoteUpdatePending = false;

  // The lastUpdated timestamp from our most recent load or save
  let lastKnownTimestamp = null;

  // Firestore unsubscribe function
  let unsubscribe = null;

  // Ignore the very first snapshot (it's our own initial load)
  let firstSnapshot = true;

  // Flag to skip the next snapshot after our own save
  let skipNextSnapshot = false;

  /**
   * Start listening for remote changes to the seating document.
   * Called once from DOMContentLoaded after Firebase is ready.
   */
  function startRealtimeListener() {
    if (!window.firebaseInitialized || !window.firebaseOnSnapshot) {
      devLog("⏳ Realtime sync: Firebase not ready, skipping listener");
      return;
    }

    const collectionName = getSeatingCollectionName();
    const docRef = window.firebaseDoc(
      window.firebaseDB,
      collectionName,
      "wedding-seating-chart",
    );

    devLog(
      `🔴 Realtime sync: Listening on ${collectionName}/wedding-seating-chart`,
    );

    unsubscribe = window.firebaseOnSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) return;

        const data = docSnap.data();
        const remoteTimestamp = data.lastUpdated || null;

        // First snapshot is our own initial load — just record the timestamp
        if (firstSnapshot) {
          firstSnapshot = false;
          lastKnownTimestamp = remoteTimestamp;
          devLog(`🔴 Realtime sync: Initial timestamp: ${remoteTimestamp}`);
          return;
        }

        // If we just saved, the snapshot is our own write echoing back
        if (skipNextSnapshot) {
          skipNextSnapshot = false;
          lastKnownTimestamp = remoteTimestamp;
          devLog("🔴 Realtime sync: Skipping own save echo");
          return;
        }

        // If the remote timestamp is the same as what we know, nothing changed
        if (remoteTimestamp === lastKnownTimestamp) {
          return;
        }

        // Remote change detected
        devLog(
          `🔴 Realtime sync: Remote change detected (${lastKnownTimestamp} → ${remoteTimestamp})`,
        );
        remoteUpdatePending = true;
        showRemoteChangeBanner();
      },
      (error) => {
        devError("🔴 Realtime sync: Listener error:", error);
      },
    );
  }

  /**
   * Show the notification banner for remote changes.
   */
  function showRemoteChangeBanner() {
    // Don't duplicate the banner
    if (document.getElementById("remote-change-banner")) return;

    const banner = document.createElement("div");
    banner.id = "remote-change-banner";

    const textSpan = document.createElement("span");
    textSpan.className = "remote-change-text";
    const syncIcon = document.createElement("i");
    syncIcon.className = "fas fa-sync-alt";
    textSpan.appendChild(syncIcon);
    textSpan.appendChild(
      document.createTextNode(" Seating chart updated by another editor"),
    );

    const reloadBtn = document.createElement("button");
    reloadBtn.className = "remote-change-btn";
    reloadBtn.textContent = "Reload";
    reloadBtn.addEventListener("click", () => location.reload());

    const dismissBtn = document.createElement("button");
    dismissBtn.className = "remote-change-dismiss";
    const dismissIcon = document.createElement("i");
    dismissIcon.className = "fas fa-times";
    dismissBtn.appendChild(dismissIcon);
    dismissBtn.addEventListener("click", () => dismissRemoteChangeBanner());

    banner.appendChild(textSpan);
    banner.appendChild(reloadBtn);
    banner.appendChild(dismissBtn);
    document.body.appendChild(banner);
  }

  /**
   * Dismiss the banner without reloading.
   */
  function dismissRemoteChangeBanner() {
    const banner = document.getElementById("remote-change-banner");
    if (banner) {
      banner.classList.add("remote-change-banner-exit");
      setTimeout(() => banner.remove(), 300);
    }
  }

  /**
   * Called before saving. Returns true if save should proceed,
   * false if user chose to cancel/reload instead.
   */
  function checkBeforeSave() {
    if (!remoteUpdatePending) return true;

    const choice = confirm(
      "Another editor made changes you haven't loaded.\n\n" +
        "OK = Save anyway (overwrites their changes)\n" +
        "Cancel = Reload to see their changes first",
    );

    if (choice) {
      // User chose to overwrite
      remoteUpdatePending = false;
      dismissRemoteChangeBanner();
      return true;
    } else {
      // User chose to reload
      location.reload();
      return false;
    }
  }

  /**
   * Mark that we just saved, so the next incoming snapshot
   * (our own echo) should be ignored.
   */
  function markOwnSave(timestamp) {
    skipNextSnapshot = true;
    lastKnownTimestamp = timestamp;
    remoteUpdatePending = false;
    dismissRemoteChangeBanner();
  }

  /**
   * Clean up the listener (e.g., on page unload).
   */
  function stopRealtimeListener() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
      devLog("🔴 Realtime sync: Listener stopped");
    }
  }

  // Expose API globally
  window.realtimeSync = {
    start: startRealtimeListener,
    stop: stopRealtimeListener,
    checkBeforeSave: checkBeforeSave,
    markOwnSave: markOwnSave,
  };

  // Start listening once DOM is ready and Firebase is available
  document.addEventListener("DOMContentLoaded", () => {
    // Firebase module loads async — poll until ready
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.firebaseInitialized && window.firebaseOnSnapshot) {
        clearInterval(interval);
        startRealtimeListener();
      } else if (attempts > 50) {
        clearInterval(interval);
        devWarn("🔴 Realtime sync: Timed out waiting for Firebase");
      }
    }, 200);
  });
})();
