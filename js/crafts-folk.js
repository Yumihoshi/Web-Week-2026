document.addEventListener('DOMContentLoaded', function () {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    function checkScroll() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                element.classList.add('revealed');
            }
        });
    }

    checkScroll();
    window.addEventListener('scroll', checkScroll);

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });
        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
});
