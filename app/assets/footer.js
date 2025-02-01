const codeLink = document.querySelector('.code-link');

let lastScrollPosition = window.pageYOffset;

// Funktion zum Überprüfen der Scroll-Position
function checkScroll() {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Zeige Link nur an, wenn wir fast am Ende der Seite sind
    if (scrollPosition + windowHeight >= documentHeight - 20) {
        codeLink.classList.add('visible');
    } else {
        codeLink.classList.remove('visible');
    }

    // Blende den Link aus, wenn nach oben gescrollt wird
    if (scrollPosition < lastScrollPosition) {
        codeLink.classList.remove('visible');
    }

    lastScrollPosition = scrollPosition;
}

// Event Listener für Scroll-Events
window.addEventListener('scroll', checkScroll);

// Initial ausführen
checkScroll();
