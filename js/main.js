document.addEventListener('DOMContentLoaded', function () {
    // Carousel functionality
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length) {
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        const carouselContainer = document.querySelector('.carousel-container');
        let currentSlide = 0;
        let autoPlayInterval;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                if (indicators[i]) {
                    indicators[i].classList.remove('active');
                }
            });

            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if (indicators[currentSlide]) {
                indicators[currentSlide].classList.add('active');
            }
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoPlay();
                startAutoPlay();
            });

            nextBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoPlay();
                startAutoPlay();
            });
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                stopAutoPlay();
                startAutoPlay();
            });
        });

        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoPlay);
            carouselContainer.addEventListener('mouseleave', startAutoPlay);
        }

        startAutoPlay();
    }

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 卡片交互：移动端点击展开，桌面端悬停展开
    const categoryCards = document.querySelectorAll('.category-card');

    // 检测是否为移动设备
    const isMobile = () => window.innerWidth <= 768;

    categoryCards.forEach(card => {
        // 移动端：点击卡片标题区域切换展开/折叠
        if (isMobile()) {
            const cardHeader = card.querySelector('.card-header');
            cardHeader.addEventListener('click', function (e) {
                e.preventDefault();
                card.classList.toggle('expanded');
            });
        }
    });

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        if (!isMobile()) {
            categoryCards.forEach(card => card.classList.remove('expanded'));
        }
    });

    const cardButtons = document.querySelectorAll('.card-button');
    cardButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const card = this.closest('.category-card');
            const title = card ? card.querySelector('.card-title').textContent : "该内容";

            const messages = [
                `即将深入探索「${title}」的奥秘！`,
                `准备好开启「${title}」的学习之旅了吗？`,
                `「${title}」蕴藏着丰富的文化宝藏，让我们一探究竟！`
            ];

            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            alert(randomMessage);
        });
    });

    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-item');

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = '#' + section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    });

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -10% 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('is-visible'));
    }
});
