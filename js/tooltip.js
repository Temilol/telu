// Tooltip functionality for venue info
function toggleTooltip(event) {
  event.stopPropagation();
  const tooltip = document.getElementById('venueInfo');
  tooltip.classList.toggle('active');
}

// Close tooltip when clicking outside
document.addEventListener('click', function(event) {
  const tooltip = document.getElementById('venueInfo');
  const trigger = document.querySelector('.tooltip-trigger');
  
  if (!tooltip.contains(event.target) && !trigger.contains(event.target)) {
    tooltip.classList.remove('active');
  }
});

// Prevent clicks inside tooltip from closing it
document.addEventListener('DOMContentLoaded', function() {
  const tooltip = document.getElementById('venueInfo');
  if (tooltip) {
    tooltip.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }
});
