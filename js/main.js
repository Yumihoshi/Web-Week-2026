document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('page-ready');
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

    const detailBlocks = document.querySelectorAll('.theme-detail');
    detailBlocks.forEach(block => {
        const tabs = block.querySelectorAll('.detail-tab');
        const panels = block.querySelectorAll('.detail-card');

        const activatePanel = (target) => {
            tabs.forEach(btn => {
                const isActive = btn.dataset.target === target;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-selected', isActive);
            });

            panels.forEach(panel => {
                const isMatch = panel.dataset.panel === target;
                panel.classList.toggle('active', isMatch);
                panel.setAttribute('aria-hidden', (!isMatch).toString());
            });
        };

        tabs.forEach(tab => {
            if (!tab.hasAttribute('aria-selected')) {
                tab.setAttribute('aria-selected', tab.classList.contains('active'));
            }

            tab.addEventListener('click', () => {
                activatePanel(tab.dataset.target);
            });
        });

        panels.forEach(panel => {
            panel.setAttribute('aria-hidden', (!panel.classList.contains('active')).toString());
        });
    });

    const detailLinks = document.querySelectorAll('.detail-link');
    detailLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const panel = this.closest('.detail-card');
            const title = panel ? panel.querySelector('h3').textContent.trim() : '该主题';
            const prompts = [
                `即将深入探索「${title}」的秘密档案。`,
                `准备好一起走进「${title}」的文化现场了吗？`,
                `「${title}」还藏着更多故事，敬请期待！`
            ];
            alert(prompts[Math.floor(Math.random() * prompts.length)]);
        });
    });

    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach(el => {
        const randomDelay = Math.random() * 5;
        el.style.animationDelay = `${randomDelay}s`;
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
