function scrollToSection(sectionId) {
    // Get the target section element by its ID
    const section = document.getElementById(sectionId);
    
    // Check if the section exists
    if (section) {
        // Get the height of the navbar
        const navbar = document.getElementById('buttons-header');
        const offset = navbar.offsetHeight; // Get the height of the navbar

        // Calculate the top position of the section relative to the viewport
        const topPosition = section.getBoundingClientRect().top + window.pageYOffset - offset;

        // Scroll to the calculated position with smooth behavior
        window.scrollTo({
            top: topPosition,
            behavior: 'smooth'
        });
    } else {
        console.error(`Section with ID "${sectionId}" not found.`);
    }
}

function redirectToSection(sectionId) {
    // Redirect to the main page with a hash for the section
    window.location.href = `../../index.html#${sectionId}`;
}