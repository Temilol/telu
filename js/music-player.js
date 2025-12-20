// Music Player with localStorage persistence
const music = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("musicToggle");
let isPlaying = false;

function fadeToVolume(target, duration = 2000) {
  const start = music.volume;
  const step = (target - start) / (duration / 50);

  const fade = setInterval(() => {
    let v = music.volume + step;
    if ((step > 0 && v >= target) || (step < 0 && v <= target)) {
      music.volume = target;
      clearInterval(fade);
    } else {
      music.volume = v;
    }
  }, 50);
}

// Save music state before leaving page
window.addEventListener("beforeunload", () => {
  if (isPlaying) {
    localStorage.setItem("musicPlaying", "true");
    localStorage.setItem("musicTime", music.currentTime);
  } else {
    localStorage.setItem("musicPlaying", "false");
  }
});

// Restore music state on load
window.addEventListener("load", () => {
  const wasPlaying = localStorage.getItem("musicPlaying") === "true";
  const savedTime = parseFloat(localStorage.getItem("musicTime")) || 0;

  if (wasPlaying) {
    music.currentTime = savedTime;
    music.volume = 0;
    music.play().then(() => {
      music.muted = false;
      fadeToVolume(0.15, 1500);
      isPlaying = true;
      toggleBtn.classList.add("playing");
      toggleBtn.textContent = "🔇";
    }).catch(() => {
      toggleBtn.textContent = "🎵";
    });
  } else {
    // Try autoplay only if not previously stopped by user
    if (localStorage.getItem("musicPlaying") === null) {
      music.play().then(() => {
        music.muted = false;
        fadeToVolume(0.15);
        isPlaying = true;
        toggleBtn.classList.add("playing");
        toggleBtn.textContent = "🔇";
      }).catch(() => {
        toggleBtn.textContent = "🎵";
      });
    }
  }
});

// Toggle playback
toggleBtn.addEventListener("click", () => {
  if (!isPlaying) {
    music.play();
    music.muted = false;
    fadeToVolume(0.15);
    isPlaying = true;

    toggleBtn.classList.add("playing");
    toggleBtn.textContent = "🔇";
    localStorage.setItem("musicPlaying", "true");
  } else {
    fadeToVolume(0, 500);
    setTimeout(() => music.pause(), 500);

    isPlaying = false;

    toggleBtn.classList.remove("playing");
    toggleBtn.textContent = "🎵";
    localStorage.setItem("musicPlaying", "false");
  }
});
