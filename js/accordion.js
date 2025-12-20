// FAQ Accordion functionality
const accordions = document.querySelectorAll(".accordion");

accordions.forEach((accordion) => {
  accordion.addEventListener("click", function () {

    // Close other accordions
    accordions.forEach((other) => {
      if (other !== this && other.classList.contains("active")) {
        other.classList.remove("active");
        other.setAttribute("aria-expanded", "false");
        other.nextElementSibling.style.maxHeight = null;
      }
    });

    // Toggle current accordion
    this.classList.toggle("active");
    const panel = this.nextElementSibling;
    this.setAttribute("aria-expanded", this.classList.contains("active"));

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }

  });
});
