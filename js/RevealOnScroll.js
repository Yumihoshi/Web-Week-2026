// 滚动显示动画
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

    // 初始检查
    checkScroll();

    // 滚动时检查
    window.addEventListener('scroll', checkScroll);

    // 导航栏交互效果
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