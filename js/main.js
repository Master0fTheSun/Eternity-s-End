/* ============================================
   ETERNITY'S END - Main JavaScript
   ============================================ */

(function () {
    'use strict';

    // ---- Particle Canvas ----
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.floor((canvas.width * canvas.height) / 18000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.3,
                speedX: (Math.random() - 0.5) * 0.15,
                speedY: (Math.random() - 0.5) * 0.1 - 0.05,
                opacity: Math.random() * 0.5 + 0.1,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.01 + 0.005,
                gold: Math.random() < 0.2
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            const flicker = Math.sin(p.pulse) * 0.3 + 0.7;
            const alpha = p.opacity * flicker;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            if (p.gold) {
                ctx.fillStyle = 'rgba(201, 168, 76, ' + alpha + ')';
            } else {
                ctx.fillStyle = 'rgba(232, 220, 200, ' + alpha + ')';
            }
            ctx.fill();
        }
        animationId = requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', function () {
        resizeCanvas();
        createParticles();
    });

    // ---- Parallax Scrolling ----
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const celestialScar = document.getElementById('celestial-scar');

    function updateParallax() {
        const scrollY = window.scrollY;
        for (let i = 0; i < parallaxLayers.length; i++) {
            var layer = parallaxLayers[i];
            var speed = parseFloat(layer.getAttribute('data-speed')) || 0;
            layer.style.transform = 'translateY(' + (scrollY * speed * -0.5) + 'px)';
        }

        // Fade the celestial scar on scroll — fully gone by 50% of viewport
        if (celestialScar) {
            var fadeEnd = window.innerHeight * 0.5;
            var scarOpacity = 1 - Math.min(scrollY / fadeEnd, 1);
            celestialScar.style.opacity = scarOpacity;
        }
    }

    // ---- Navigation — Logo Hub (desktop) + Top Bar (mobile) ----
    const nav = document.getElementById('main-nav');
    const navLogoBtn = document.getElementById('nav-logo-btn');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');
    var navExpanded = true;
    var autoCollapseTimer = null;

    // Detect mobile layout (hamburger visible = mobile)
    function isMobile() {
        return navToggle && window.getComputedStyle(navToggle).display !== 'none';
    }

    // No-op — kept so the combined scroll handler doesn't break
    function updateNav() {}

    // ---- Desktop: logo-hub expand/collapse ----
    function expandNav() {
        if (!navLinks) return;
        navLinks.classList.add('expanded');
        navExpanded = true;
    }

    function collapseNav() {
        if (!navLinks) return;
        navLinks.classList.remove('expanded');
        navExpanded = false;

        // After stagger finishes, flash the logo to show tabs were absorbed
        var totalDuration = 8 * 60 + 350; // items * stagger + transition
        setTimeout(function () {
            if (navLogoBtn) {
                navLogoBtn.classList.add('absorbed');
                setTimeout(function () {
                    navLogoBtn.classList.remove('absorbed');
                }, 900);
            }
        }, totalDuration);
    }

    // Toggle on "E" click (desktop only)
    if (navLogoBtn) {
        navLogoBtn.addEventListener('click', function () {
            if (isMobile()) return; // On mobile, E is just a logo
            if (autoCollapseTimer) {
                clearTimeout(autoCollapseTimer);
                autoCollapseTimer = null;
            }
            if (navExpanded) {
                collapseNav();
            } else {
                expandNav();
            }
        });
    }

    // ---- Mobile: hamburger toggle ----
    function closeMobileNav() {
        if (!navLinks || !navToggle) return;
        navLinks.classList.remove('open');
        var spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            var spans = navToggle.querySelectorAll('span');
            if (navLinks.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Nav link click — desktop: collapse; mobile: close dropdown
    navAnchors.forEach(function (anchor) {
        anchor.addEventListener('click', function () {
            if (isMobile()) {
                closeMobileNav();
            } else {
                setTimeout(function () {
                    if (navExpanded) collapseNav();
                }, 300);
            }
        });
    });

    // Auto-collapse after 6 seconds — desktop home page only
    if (navLinks && navLinks.classList.contains('expanded') && !isMobile()) {
        autoCollapseTimer = setTimeout(function () {
            collapseNav();
            autoCollapseTimer = null;
        }, 6000);
    } else if (!navLinks || !navLinks.classList.contains('expanded')) {
        // Secondary pages: nav starts collapsed
        navExpanded = false;
    }

    // Active nav link tracking
    var sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        var scrollPos = window.scrollY + 150;
        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navAnchors.forEach(function (a) {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    }

    // ---- Book Tabs ----
    var bookTabs = document.querySelectorAll('.book-tab');
    var bookCards = document.querySelectorAll('.book-card');

    bookTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            var bookNum = this.getAttribute('data-book');
            bookTabs.forEach(function (t) { t.classList.remove('active'); });
            bookCards.forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
            var target = document.querySelector('.book-card[data-book="' + bookNum + '"]');
            if (target) target.classList.add('active');
        });
    });

    // ---- Book Cover Flip (tap toggle for touch devices only) ----
    var bookFlip = document.querySelector('.book-flip');
    if (bookFlip) {
        var isTouchDevice = false;
        window.addEventListener('touchstart', function onFirstTouch() {
            isTouchDevice = true;
            window.removeEventListener('touchstart', onFirstTouch);
        }, { passive: true });

        bookFlip.addEventListener('click', function () {
            if (isTouchDevice) {
                this.classList.toggle('flipped');
            }
        });
    }

    // ---- Reviews Carousel ----
    var track = document.querySelector('.reviews-track');
    var cards = track ? Array.prototype.slice.call(track.querySelectorAll('.review-card')) : [];
    var arrowLeft = document.querySelector('.carousel-arrow-left');
    var arrowRight = document.querySelector('.carousel-arrow-right');
    var dotsContainer = document.querySelector('.carousel-dots');

    if (track && cards.length) {
        // Shuffle review cards so platforms aren't grouped
        for (var i = cards.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            track.appendChild(cards[j]);
            var temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }

        var currentPage = 0;

        function getCardsPerPage() {
            var viewportWidth = window.innerWidth;
            if (viewportWidth <= 768) return 1;
            if (viewportWidth <= 1024) return 2;
            return 3;
        }

        function getTotalPages() {
            var perPage = getCardsPerPage();
            return Math.max(1, cards.length - perPage + 1);
        }

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            var total = getTotalPages();
            for (var i = 0; i < total; i++) {
                var dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
                dot.setAttribute('aria-label', 'Go to page ' + (i + 1));
                dot.dataset.page = i;
                dot.addEventListener('click', function () {
                    goToPage(parseInt(this.dataset.page, 10));
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateArrows() {
            if (arrowLeft) arrowLeft.disabled = false;
            if (arrowRight) arrowRight.disabled = false;
        }

        function updateDots() {
            if (!dotsContainer) return;
            var dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === currentPage);
            });
        }

        function goToPage(page) {
            var totalPages = getTotalPages();
            // Loop around
            if (page < 0) page = totalPages - 1;
            if (page >= totalPages) page = 0;
            currentPage = page;

            var gap = 25;
            var card = cards[0];
            var cardWidth = card.getBoundingClientRect().width;
            var offset = currentPage * (cardWidth + gap);

            track.style.transform = 'translateX(-' + offset + 'px)';
            updateArrows();
            updateDots();
        }

        if (arrowLeft) {
            arrowLeft.addEventListener('click', function () {
                goToPage(currentPage - 1);
            });
        }

        if (arrowRight) {
            arrowRight.addEventListener('click', function () {
                goToPage(currentPage + 1);
            });
        }

        // Touch / swipe support
        var touchStartX = 0;
        var touchEndX = 0;
        track.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToPage(currentPage + 1);
                else goToPage(currentPage - 1);
            }
        }, { passive: true });

        // Recalculate on resize
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (currentPage >= getTotalPages()) {
                    currentPage = getTotalPages() - 1;
                }
                buildDots();
                goToPage(currentPage);
            }, 200);
        });

        // Init
        buildDots();
        goToPage(0);
    }

    // ---- Location Card Navigate ----
    var locationCards = document.querySelectorAll('.location-card');
    locationCards.forEach(function (card) {
        card.addEventListener('click', function () {
            var href = card.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    // ---- Creature Card Navigate ----
    var creatureCards = document.querySelectorAll('.creature-card[data-href]');
    creatureCards.forEach(function (card) {
        card.addEventListener('click', function () {
            var href = card.getAttribute('data-href');
            if (href) {
                window.location.href = href;
            }
        });
    });

    // ---- Character Portrait Carousel ----
    var charCards = document.querySelectorAll('.char-page-card');
    charCards.forEach(function (card) {
        var imgs = card.querySelectorAll('.char-page-img');
        var dots = card.querySelectorAll('.char-dot');
        var leftBtn = card.querySelector('.char-arrow-left');
        var rightBtn = card.querySelector('.char-arrow-right');
        var current = 0;

        function showImage(idx) {
            imgs[current].classList.remove('active');
            dots[current].classList.remove('active');
            current = (idx + imgs.length) % imgs.length;
            imgs[current].classList.add('active');
            dots[current].classList.add('active');
        }

        if (leftBtn) {
            leftBtn.addEventListener('click', function () { showImage(current - 1); });
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', function () { showImage(current + 1); });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () { showImage(i); });
        });
    });

    // ---- Scroll Reveal ----
    var revealElements = document.querySelectorAll(
        '.location-card, .creature-card, .character-card, .char-page-card, ' +
        '.world-intro, .author-content, .book-card.active, .lore-block, .lore-image'
    );

    // Add reveal class to elements
    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    function checkReveal() {
        var windowHeight = window.innerHeight;
        revealElements.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            if (rect.top < windowHeight - 80) {
                el.classList.add('revealed');
            }
        });
    }

    // ---- Alliance Modal ----
    var modal = document.getElementById('alliance-modal');
    var modalContent = modal ? modal.querySelector('.modal-content') : null;
    var modalSuccess = document.getElementById('alliance-success');
    var modalClose = modal ? modal.querySelector('.modal-close') : null;
    var allianceForm = document.getElementById('alliance-form');

    // All triggers that open the modal
    var joinTriggers = document.querySelectorAll('#nav-join-btn, #book2-notify, #book3-notify, .join-trigger');

    function openModal(e) {
        if (e) e.preventDefault();
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    joinTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', openModal);
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }

    // Close modal/lightbox on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            if (mapLightbox && mapLightbox.classList.contains('active')) {
                mapLightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Alliance form submission
    if (allianceForm) {
        allianceForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Hide the form content and show success
            if (modalContent) modalContent.style.display = 'none';
            var sealSection = modal.querySelector('.modal-seal');
            if (sealSection) sealSection.style.display = 'none';
            if (modalSuccess) modalSuccess.style.display = 'block';

            // Reset after 3 seconds and close
            setTimeout(function () {
                closeModal();
                // Reset modal state after close animation
                setTimeout(function () {
                    if (modalContent) modalContent.style.display = '';
                    if (sealSection) sealSection.style.display = '';
                    if (modalSuccess) modalSuccess.style.display = 'none';
                    allianceForm.reset();
                }, 500);
            }, 3000);
        });
    }

    // ---- Stat Bar Animation ----
    var statBars = document.querySelectorAll('.stat-fill');
    var statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        var creaturesSection = document.getElementById('creatures');
        if (!creaturesSection) return;
        var rect = creaturesSection.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            statsAnimated = true;
            statBars.forEach(function (bar) {
                var width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(function () {
                    bar.style.width = width;
                }, 100);
            });
        }
    }

    // ---- Smooth Scroll for Anchors ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var targetPosition = target.offsetTop - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ---- Back to Top Button ----
    var backToTopBtn = document.getElementById('back-to-top');

    function updateBackToTop() {
        if (!backToTopBtn) return;
        if (window.scrollY > window.innerHeight) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---- Map Lightbox ----
    var mapImg = document.querySelector('.realm-map-img');
    var mapLightbox = document.getElementById('map-lightbox');
    var mapLightboxClose = mapLightbox ? mapLightbox.querySelector('.map-lightbox-close') : null;

    if (mapImg && mapLightbox) {
        mapImg.addEventListener('click', function () {
            mapLightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        mapLightboxClose.addEventListener('click', function () {
            mapLightbox.classList.remove('active');
            document.body.style.overflow = '';
        });

        mapLightbox.addEventListener('click', function (e) {
            if (e.target === mapLightbox) {
                mapLightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ---- Combined Scroll Handler (throttled) ----
    var ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(function () {
                updateParallax();
                updateNav();
                updateActiveLink();
                checkReveal();
                animateStats();
                updateBackToTop();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial calls
    updateNav();
    checkReveal();
    animateStats();
    updateBackToTop();

})();
