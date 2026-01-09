document.addEventListener('DOMContentLoaded', function () {
    // 导航交互逻辑
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href') || '';
            const isHashLink = targetId.startsWith('#');

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            if (!isHashLink) {
                return;
            }

            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 卡片交互：移动端点击展开，桌面端悬停展开
    const categoryCards = document.querySelectorAll('.category-card');
    const interactiveGrids = Array.from(document.querySelectorAll('.interactive-grid'));
    const getGridCards = grid => Array.from(grid.querySelectorAll('.category-card'));
    const getCardHref = card => {
        const btn = card ? card.querySelector('.card-button') : null;
        if (!btn) {
            return null;
        }
        const href = btn.getAttribute('href');
        return href && href !== '#' ? href : null;
    };

    // 检测是否为移动设备
    const isMobile = () => window.innerWidth <= 768;

    const sectionBgConfigs = {
        festivals: {
            defaultImage: null
        },
        literature: {
            defaultImage: null
        },
        crafts: {
            defaultImage: null
        }
    };

    const composeSectionBackground = imagePath => {
        return imagePath ? `url('${imagePath}')` : 'none';
    };

    const sanitizeImagePath = value => {
        if (typeof value !== 'string') {
            return null;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : null;
    };

    const setLayerBackground = (layer, imagePath) => {
        if (!layer) {
            return null;
        }
        const sanitized = sanitizeImagePath(imagePath);
        layer.style.backgroundImage = composeSectionBackground(sanitized);
        if (sanitized) {
            layer.classList.add('has-image');
        } else {
            layer.classList.remove('has-image');
        }
        return sanitized;
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

            const bufferLayer = document.createElement('div');
            bufferLayer.className = 'section-bg-layer';

            stack.append(primaryLayer, bufferLayer);
            section.insertBefore(stack, section.firstChild);

            const defaultImage = setLayerBackground(primaryLayer, config.defaultImage);
            setLayerBackground(bufferLayer, defaultImage);

            sectionBgRegistry.set(section, {
                layers: [primaryLayer, bufferLayer],
                activeIndex: 0,
                defaultImage,
                currentImage: defaultImage,
                resetTimer: null,
                swapTimer: null
            });
        });
    };

    const swapSectionBackground = (section, imagePath, { immediate = false } = {}) => {
        const state = sectionBgRegistry.get(section);
        if (!state) {
            return;
        }

        const normalizedPath = sanitizeImagePath(imagePath);
        const targetImage = normalizedPath ?? state.defaultImage;
        if (state.currentImage === targetImage && !state.swapTimer) {
            return;
        }

        if (state.resetTimer) {
            clearTimeout(state.resetTimer);
            state.resetTimer = null;
        }
        if (state.swapTimer) {
            clearTimeout(state.swapTimer);
            state.swapTimer = null;
        }

        const runSwap = () => {
            const nextIndex = state.activeIndex === 0 ? 1 : 0;
            const nextLayer = state.layers[nextIndex];
            const activeLayer = state.layers[state.activeIndex];

            const appliedImage = setLayerBackground(nextLayer, targetImage);

            requestAnimationFrame(() => {
                nextLayer.classList.add('is-active');
                activeLayer.classList.remove('is-active');
                state.activeIndex = nextIndex;
                state.currentImage = appliedImage;
                state.swapTimer = null;
            });
        };

        if (immediate) {
            runSwap();
        } else {
            state.swapTimer = setTimeout(runSwap, 40);
        }
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
            swapSectionBackground(section, state.defaultImage, { immediate: true });
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

        card.addEventListener('click', e => {
            if (isMobile()) {
                return;
            }
            if (e.target.closest('a')) {
                return;
            }
            const href = getCardHref(card);
            if (href) {
                window.location.href = href;
            }
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
