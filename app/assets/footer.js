const codeLink = document.querySelector('.code-link');

// Funktion zum Überprüfen der Scroll-Position
function checkScroll() {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Zeige Link nur an, wenn wir fast am Ende der Seite sind
    if (scrollPosition + windowHeight >= documentHeight - 20) {
        codeLink.classList.remove('hidden');
    } else {
        codeLink.classList.add('hidden');
    }
}

// Event Listener für Scroll-Events
window.addEventListener('scroll', checkScroll);

// Initial ausführen
checkScroll();
