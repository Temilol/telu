// Development Configuration
// Auto-detect dev vs production based on domain

// Auto-detect: dev mode for localhost, staging, or explicitly set
const isDevelopment = () => {
  const hostname = window.location.hostname;
  // Dev if localhost or starts with specific dev domains
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('dev.') ||
    hostname.includes('staging.') ||
    hostname.includes('localhost')
  );
};

// Set global isDev flag
if (typeof window.isDev === 'undefined') {
  window.isDev = isDevelopment();
}

// Helper functions for dev logging (safe fallback if called before load)
if (typeof window.devLog === 'undefined') {
  window.devLog = function(...args) {
    if (window.isDev) console.log(...args);
  };
}
if (typeof window.devWarn === 'undefined') {
  window.devWarn = function(...args) {
    if (window.isDev) console.warn(...args);
  };
}
if (typeof window.devError === 'undefined') {
  window.devError = function(...args) {
    if (window.isDev) console.error(...args);
  };
}
