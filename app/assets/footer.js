let lastScrollPosition = window.pageYOffset;
const codeLink = document.querySelector('.code-link');

window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    
    // Wenn wir nach oben scrollen und nicht ganz oben sind
    if (currentScrollPosition < lastScrollPosition && currentScrollPosition > 100) {
        codeLink.classList.add('hidden');
    } else {
        codeLink.classList.remove('hidden');
    }
    
    lastScrollPosition = currentScrollPosition;
});
