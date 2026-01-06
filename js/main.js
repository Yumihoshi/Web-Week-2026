document.addEventListener('DOMContentLoaded', function () {
    // 轮播图功能逻辑
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

    // 导航交互逻辑
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
    const interactiveGrids = Array.from(document.querySelectorAll('.interactive-grid'));
    const getGridCards = grid => Array.from(grid.querySelectorAll('.category-card'));

    // 检测是否为移动设备
    const isMobile = () => window.innerWidth <= 768;

    const sectionBgConfigs = {
        festivals: {
            gradient: 'linear-gradient(115deg, rgba(111, 62, 46, 0.94), rgba(179, 76, 44, 0.78))',
            defaultImage: '../img/bg-festival.png'
        },
        literature: {
            gradient: 'linear-gradient(120deg, rgba(16, 31, 42, 0.94), rgba(63, 108, 87, 0.78))',
            defaultImage: '../img/bg-literature.png'
        },
        crafts: {
            gradient: 'linear-gradient(120deg, rgba(62, 50, 44, 0.92), rgba(170, 124, 74, 0.75))',
            defaultImage: '../img/bg-crafts.png'
        }
    };

    const sectionBgRegistry = new WeakMap();

    const initSectionBackgrounds = () => {
        Object.entries(sectionBgConfigs).forEach(([sectionId, config]) => {
            const section = document.getElementById(sectionId);
            if (!section || sectionBgRegistry.has(section)) {
                return;
            }

            const stack = document.createElement('div');
            stack.className = 'section-bg-stack';
            stack.setAttribute('aria-hidden', 'true');

            const primaryLayer = document.createElement('div');
            primaryLayer.className = 'section-bg-layer is-active';
            primaryLayer.style.backgroundImage = `${config.gradient}, url('${config.defaultImage}')`;

            const bufferLayer = document.createElement('div');
            bufferLayer.className = 'section-bg-layer';
            bufferLayer.style.backgroundImage = `${config.gradient}, url('${config.defaultImage}')`;

            stack.append(primaryLayer, bufferLayer);
            section.insertBefore(stack, section.firstChild);

            sectionBgRegistry.set(section, {
                layers: [primaryLayer, bufferLayer],
                activeIndex: 0,
                gradient: config.gradient,
                defaultImage: config.defaultImage,
                currentImage: config.defaultImage,
                resetTimer: null
            });
        });
    };

    const swapSectionBackground = (section, imagePath) => {
        const state = sectionBgRegistry.get(section);
        if (!state) {
            return;
        }

        const targetImage = imagePath || state.defaultImage;
        if (state.currentImage === targetImage) {
            return;
        }

        if (state.resetTimer) {
            clearTimeout(state.resetTimer);
            state.resetTimer = null;
        }

        const nextIndex = state.activeIndex === 0 ? 1 : 0;
        const nextLayer = state.layers[nextIndex];
        const activeLayer = state.layers[state.activeIndex];

        nextLayer.style.backgroundImage = `${state.gradient}, url('${targetImage}')`;

        requestAnimationFrame(() => {
            nextLayer.classList.add('is-active');
            activeLayer.classList.remove('is-active');
            state.activeIndex = nextIndex;
            state.currentImage = targetImage;
        });
    };

    const resetSectionBackground = (section, immediate = false) => {
        const state = sectionBgRegistry.get(section);
        if (!state) {
            return;
        }

        if (state.resetTimer) {
            clearTimeout(state.resetTimer);
            state.resetTimer = null;
        }

        if (immediate) {
            swapSectionBackground(section, state.defaultImage);
            return;
        }

        state.resetTimer = setTimeout(() => {
            swapSectionBackground(section, state.defaultImage);
            state.resetTimer = null;
        }, 200);
    };

    initSectionBackgrounds();

    categoryCards.forEach(card => {
        const cardHeader = card.querySelector('.card-header');
        if (!cardHeader) {
            return;
        }

        cardHeader.addEventListener('click', function (e) {
            if (!isMobile()) {
                return;
            }
            e.preventDefault();
            card.classList.toggle('expanded');
        });
    });

    const resetCardStates = () => {
        categoryCards.forEach(card => {
            card.classList.remove('card-focused', 'card-muted', 'expanded');
        });
        interactiveGrids.forEach(grid => grid.classList.remove('grid-focused'));
        interactiveGrids.forEach(grid => {
            const section = grid.closest('.content-section');
            if (section) {
                resetSectionBackground(section, true);
            }
        });
    };

    const lockGridHeight = grid => {
        if (!grid || isMobile()) {
            return;
        }

        const cards = getGridCards(grid);
        if (!cards.length) {
            return;
        }

        grid.classList.add('is-measuring');
        grid.style.removeProperty('min-height');
        grid.style.removeProperty('height');
        const hadGridFocus = grid.classList.contains('grid-focused');
        if (hadGridFocus) {
            grid.classList.remove('grid-focused');
        }

        let maxExpandedHeight = 0;

        cards.forEach(sourceCard => {
            const clone = sourceCard.cloneNode(true);
            clone.classList.add('card-focused');
            clone.classList.remove('card-muted', 'expanded');
            clone.style.position = 'absolute';
            clone.style.inset = '0';
            clone.style.width = '100%';
            clone.style.visibility = 'hidden';
            clone.style.pointerEvents = 'none';
            grid.appendChild(clone);

            const expandedHeight = clone.getBoundingClientRect().height;
            maxExpandedHeight = Math.max(maxExpandedHeight, expandedHeight);
            clone.remove();
        });

        grid.classList.remove('is-measuring');

        const baseHeight = grid.getBoundingClientRect().height;
        const targetHeight = Math.max(baseHeight, maxExpandedHeight);

        grid.style.minHeight = `${Math.ceil(targetHeight)}px`;
        grid.style.height = `${Math.ceil(targetHeight)}px`;
        if (hadGridFocus) {
            grid.classList.add('grid-focused');
        }
    };

    const releaseGridHeight = grid => {
        if (!grid) {
            return;
        }
        grid.style.removeProperty('min-height');
        grid.style.removeProperty('height');
    };

    const lockAllGridHeights = () => {
        if (isMobile()) {
            return;
        }
        interactiveGrids.forEach(grid => lockGridHeight(grid));
    };

    const releaseAllGridHeights = () => {
        interactiveGrids.forEach(grid => releaseGridHeight(grid));
    };

    const enableDesktopHover = () => {
        if (!interactiveGrids.length) {
            return;
        }

        interactiveGrids.forEach(grid => {
            const cards = getGridCards(grid);
            if (!cards.length) {
                return;
            }
            const section = grid.closest('.content-section');

            cards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    if (isMobile()) {
                        return;
                    }

                    cards.forEach(otherCard => {
                        if (otherCard !== card) {
                            otherCard.classList.add('card-muted');
                            otherCard.classList.remove('card-focused');
                        }
                    });

                    card.classList.add('card-focused');
                    card.classList.remove('card-muted');
                    grid.classList.add('grid-focused');
                    if (section) {
                        swapSectionBackground(section, card.dataset.bg);
                    }
                });
            });

            grid.addEventListener('mouseleave', () => {
                if (isMobile()) {
                    return;
                }
                cards.forEach(card => card.classList.remove('card-focused', 'card-muted'));
                grid.classList.remove('grid-focused');
                if (section) {
                    resetSectionBackground(section);
                }
            });
        });
    };

    enableDesktopHover();

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        if (isMobile()) {
            resetCardStates();
            releaseAllGridHeights();
        } else {
            categoryCards.forEach(card => card.classList.remove('expanded'));
            lockAllGridHeights();
        }
    });

    if (!isMobile()) {
        requestAnimationFrame(lockAllGridHeights);
    }

    window.addEventListener('load', () => {
        if (!isMobile()) {
            lockAllGridHeights();
        } else {
            releaseAllGridHeights();
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
