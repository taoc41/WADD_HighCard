// iterate between both perk and debuff
function initAccordions() {
    document.querySelectorAll(".accordion-header").forEach(header => {
        const display = header.nextElementSibling; // assumes .accordion-display is right after header
        header.addEventListener("click", () => { // listen for event listener
            display.classList.toggle("closed"); // trigger closed
            const arrow = header.querySelector(".arrow"); // get the arrow
            if (arrow) arrow.classList.toggle("open"); // trigger open
        });
    });
}

// makes sure the DOM is loaded first
document.addEventListener("DOMContentLoaded", initAccordions);