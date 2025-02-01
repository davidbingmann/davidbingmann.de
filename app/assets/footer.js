const codeLink = document.querySelector('.code-link');

window.addEventListener('scroll', () => {
    // Prüfe, ob wir am Ende der Seite sind
    const isAtBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 10;
    
    if (isAtBottom) {
        codeLink.classList.remove('hidden');
    } else {
        codeLink.classList.add('hidden');
    }
});

// Initial ausführen
window.dispatchEvent(new Event('scroll'));
