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
        const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 25000));
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

    // Pause particle animation when tab is hidden or scrolled past hero to save CPU
    var particlesPaused = false;

    function pauseParticles() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        particlesPaused = true;
    }

    function resumeParticles() {
        if (!animationId && !document.hidden) {
            particlesPaused = false;
            drawParticles();
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            pauseParticles();
        } else if (!particlesPaused) {
            resumeParticles();
        }
    });

    window.addEventListener('resize', function () {
        resizeCanvas();
        createParticles();
    });

    // ---- Parallax Scrolling ----
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const celestialScar = document.getElementById('celestial-scar');

    function updateParallax() {
        const scrollY = window.scrollY;
        // Skip expensive parallax transforms once hero is well off-screen
        var heroHeight = window.innerHeight * 1.5;
        if (scrollY < heroHeight) {
            for (let i = 0; i < parallaxLayers.length; i++) {
                var layer = parallaxLayers[i];
                var speed = parseFloat(layer.getAttribute('data-speed')) || 0;
                layer.style.transform = 'translateY(' + (scrollY * speed * -0.5) + 'px)';
            }
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

    // ---- Draggable Nav (desktop only) ----
    var logoNavContainer = document.querySelector('.logo-nav-container');
    if (logoNavContainer && nav) {
        var dragState = {
            active: false,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0,
            moved: false,
            holdTimer: null
        };

        // On mousedown, start tracking — drag begins after small movement
        logoNavContainer.addEventListener('mousedown', function (e) {
            if (isMobile()) return;
            // Don't interfere with link/button clicks unless they drag
            dragState.startX = e.clientX;
            dragState.startY = e.clientY;
            dragState.moved = false;

            // Get current position of the container
            var rect = logoNavContainer.getBoundingClientRect();
            dragState.offsetX = e.clientX - rect.left - rect.width / 2;
            dragState.offsetY = e.clientY - rect.top - rect.height / 2;

            // Listen for move to decide if it's a drag
            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragEnd);
        });

        function onDragMove(e) {
            var dx = e.clientX - dragState.startX;
            var dy = e.clientY - dragState.startY;

            // Only activate drag after moving at least 5px (avoids hijacking clicks)
            if (!dragState.active && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
                dragState.active = true;
                dragState.moved = true;
                logoNavContainer.classList.add('is-dragging');

                // Switch nav from right-aligned to position-based
                nav.style.right = 'auto';
                nav.style.top = 'auto';
                nav.style.left = '0';
                nav.style.height = 'auto';
                nav.style.width = '100%';
                nav.style.pointerEvents = 'none';
                nav.style.position = 'fixed';
                nav.style.display = 'block';
                nav.style.justifyContent = '';
                nav.style.alignItems = '';
            }

            if (dragState.active) {
                e.preventDefault();
                var x = e.clientX - dragState.offsetX;
                var y = e.clientY - dragState.offsetY;

                // Clamp within viewport
                var cw = logoNavContainer.offsetWidth;
                var ch = logoNavContainer.offsetHeight;
                x = Math.max(cw / 2, Math.min(window.innerWidth - cw / 2, x));
                y = Math.max(ch / 2, Math.min(window.innerHeight - ch / 2, y));

                logoNavContainer.style.position = 'fixed';
                logoNavContainer.style.left = x + 'px';
                logoNavContainer.style.top = y + 'px';
                logoNavContainer.style.transform = 'translate(-50%, -50%)';
            }
        }

        function onDragEnd() {
            document.removeEventListener('mousemove', onDragMove);
            document.removeEventListener('mouseup', onDragEnd);

            if (dragState.active) {
                dragState.active = false;
                logoNavContainer.classList.remove('is-dragging');
            }
        }

        // Suppress click on the E button if we just finished dragging
        if (navLogoBtn) {
            navLogoBtn.addEventListener('click', function (e) {
                if (dragState.moved) {
                    e.stopImmediatePropagation();
                    dragState.moved = false;
                }
            }, true); // capture phase to run before the toggle handler
        }
    }

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

    var lastActiveId = '';
    function updateActiveLink() {
        var scrollPos = window.scrollY + 150;
        var currentId = '';
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var top = section.offsetTop;
            if (scrollPos >= top && scrollPos < top + section.offsetHeight) {
                currentId = section.getAttribute('id');
                break;
            }
        }
        if (currentId === lastActiveId) return;
        lastActiveId = currentId;
        navAnchors.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
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

    // ---- Character Page: Carousel & Detail ----
    var carouselViewport = document.getElementById('carousel-viewport');
    if (carouselViewport) {
        var characterData = [
            {
                name: 'Aden',
                portrait: 'images/aden111.png',
                artwork: 'images/adenoffical22.png',
                extraArt: 'images/Aden3.png',
                lore: 'Aden walks a path not chosen but thrust upon him \u2014 a journey born from loss and forged in the fires of a world unraveling. Raised in the quiet margins of ZeilGalia, far from the machinations of kings and sorcerers, he lived a life of obscurity until the Celestial Scar carved its wound across the heavens. Now burdened with a purpose he barely understands, Aden must navigate a realm where trust is a currency few can afford and survival demands more than courage alone. His story is one of transformation \u2014 from reluctant wanderer to the fulcrum upon which the fate of an age may turn.',
                attributes: [
                    { label: 'Title', value: 'The Wanderer' },
                    { label: 'Origin', value: 'Outskirts of ZeilGalia' },
                    { label: 'Affiliation', value: 'The Alliance' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Active' }
                ]
            },
            {
                name: 'Ronan',
                portrait: 'images/ronan11.png',
                artwork: 'images/ronan2.png',
                extraArt: 'images/ronan3.png',
                lore: 'Ronan is steel given form \u2014 a warrior whose reputation was forged long before the world began its descent into chaos. Battle-hardened and unflinching, he carries the scars of conflicts most men would not survive, and the weight of loyalties that have been tested beyond breaking. Behind the armor and the blade lies a man haunted by the choices that led him here, fighting not just the enemies before him but the ghosts that follow in his wake.',
                attributes: [
                    { label: 'Title', value: 'The Ironclad' },
                    { label: 'Origin', value: 'Northern Reaches' },
                    { label: 'Affiliation', value: 'The Alliance' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Active' }
                ]
            },
            {
                name: 'Vladimir',
                portrait: 'images/vladimir1.png',
                artwork: 'images/vladimir1.png',
                extraArt: 'images/vladimir1.png',
                lore: 'Vladimir exists in the space between light and shadow \u2014 a figure of immense power whose true allegiances remain an enigma even to those closest to him. His name is spoken in whispers across ZeilGalia, equal parts reverence and dread. A master of manipulation and arcane knowledge, Vladimir moves through the world like a chess player who sees twelve moves ahead, and every piece on the board is expendable.',
                attributes: [
                    { label: 'Title', value: 'The Unseen Hand' },
                    { label: 'Origin', value: 'Classified' },
                    { label: 'Affiliation', value: 'Unknown' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Active' }
                ]
            },
            {
                name: 'Rune',
                portrait: 'images/Rune1.png',
                artwork: 'images/rune2.png',
                extraArt: 'images/rune4.png',
                lore: 'Rune is a paradox wrapped in mystery \u2014 a being whose very existence defies the natural order of ZeilGalia. Tied to forces older than the realm itself, Rune possesses abilities that blur the line between miracle and catastrophe. Few understand the true nature of this power, and fewer still can comprehend the burden it carries. In a world where magic flows like a river through fractured stone, Rune stands as both its greatest vessel and its most vulnerable keeper.',
                attributes: [
                    { label: 'Title', value: 'The Conduit' },
                    { label: 'Origin', value: 'Unknown' },
                    { label: 'Affiliation', value: 'The Alliance' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Active' }
                ]
            },
            {
                name: 'Sarra',
                portrait: 'images/Sarra1.png',
                artwork: 'images/sarra2.png',
                extraArt: 'images/sarra4.png',
                lore: 'Sarra carries herself with the quiet ferocity of someone who has learned that the world will not be gentle, and so she will not be gentle with it. Skilled, sharp-tongued, and fiercely independent, she has carved her own path through a realm that offers little mercy to those who walk alone. Beneath her guarded exterior lies a depth of conviction that few ever glimpse \u2014 a loyalty that, once earned, is absolute and unyielding.',
                attributes: [
                    { label: 'Title', value: 'The Blade' },
                    { label: 'Origin', value: 'Grey-Haven' },
                    { label: 'Affiliation', value: 'The Alliance' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Active' }
                ]
            },
            {
                name: 'Javi',
                portrait: 'images/javi1.png',
                artwork: 'images/javi2.png',
                extraArt: 'images/javi3.png',
                lore: 'Javi brings light to the darkest corners \u2014 not through naivety, but through a stubborn, almost defiant refusal to let the darkness win. In a company of warriors, mystics, and morally grey operatives, Javi serves as the unexpected heart. Quick-witted and resourceful, there is a talent for finding solutions where others see only dead ends, and for keeping hope alive when the world seems determined to extinguish it.',
                attributes: [
                    { label: 'Title', value: 'The Spark' },
                    { label: 'Origin', value: 'Aleslydon' },
                    { label: 'Affiliation', value: 'The Alliance' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Active' }
                ]
            },
            {
                name: 'Corvus',
                portrait: 'images/corvus1.png',
                artwork: 'images/corvus2.png',
                extraArt: 'images/corvus3.png',
                lore: 'Corvus is shadow incarnate \u2014 a presence felt more than seen, whose motives are as inscrutable as the darkness from which he draws his power. Named for the raven, he is an omen in living form, appearing at the crossroads of fate with an uncanny sense of timing. Whether he serves a higher purpose or merely his own unfathomable agenda, none can say with certainty. What is known is this: where Corvus treads, the world changes \u2014 and rarely for the better.',
                attributes: [
                    { label: 'Title', value: 'The Omen' },
                    { label: 'Origin', value: 'Unknown' },
                    { label: 'Affiliation', value: 'Unaligned' },
                    { label: 'Ethergem', value: '\u2014' },
                    { label: 'Status', value: 'Unknown' }
                ]
            }
        ];

        var cCards = carouselViewport.querySelectorAll('.carousel-card');
        var cDots = document.querySelectorAll('.carousel-dot');
        var prevBtn = document.querySelector('.carousel-prev');
        var nextBtn = document.querySelector('.carousel-next');
        var activeIdx = 0;

        function positionCards() {
            var spacing = window.innerWidth < 480 ? 110 : (window.innerWidth < 768 ? 130 : 150);
            cCards.forEach(function (card, i) {
                var offset = i - activeIdx;
                var absOffset = Math.abs(offset);

                if (absOffset > 3) {
                    card.style.opacity = '0';
                    card.style.pointerEvents = 'none';
                    card.classList.remove('is-active');
                    return;
                }

                var tx = offset * spacing;
                var scale = Math.max(0.5, 1 - absOffset * 0.16);
                var opa = Math.max(0.15, 1 - absOffset * 0.3);
                var z = 10 - absOffset;
                var bright = absOffset > 0 ? Math.max(0.4, 1 - absOffset * 0.2) : 1;

                card.style.transform = 'translate(calc(-50% + ' + tx + 'px), -50%) scale(' + scale + ')';
                card.style.opacity = opa;
                card.style.zIndex = z;
                card.style.filter = 'brightness(' + bright + ')';
                card.style.pointerEvents = 'auto';

                if (absOffset === 0) {
                    card.classList.add('is-active');
                } else {
                    card.classList.remove('is-active');
                }
            });
        }

        function updateCarouselDots() {
            cDots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === activeIdx);
            });
        }

        function updateCharDetail() {
            var charData = characterData[activeIdx];
            var grid = document.getElementById('char-detail-grid');
            grid.classList.add('is-transitioning');

            setTimeout(function () {
                document.getElementById('char-lore-text').textContent = charData.lore;
                document.getElementById('char-art-img').src = charData.artwork;
                document.getElementById('char-art-img').alt = charData.name;
                document.getElementById('char-art-name').textContent = charData.name;
                document.getElementById('char-extra-img').src = charData.extraArt;
                document.getElementById('char-extra-img').alt = charData.name + ' \u2014 Additional Art';

                var loreBody = document.getElementById('char-lore-body');
                loreBody.classList.remove('is-expanded');
                var rmBtn = document.getElementById('char-read-more-btn');
                if (rmBtn) rmBtn.textContent = 'Read more';

                var calloutsEl = document.getElementById('char-callouts');
                calloutsEl.innerHTML = '';
                charData.attributes.forEach(function (attr) {
                    var item = document.createElement('div');
                    item.className = 'callout-item';
                    item.innerHTML =
                        '<div class="callout-content">' +
                        '<span class="callout-label">' + attr.label + '</span>' +
                        '<span class="callout-value">' + attr.value + '</span>' +
                        '</div>';
                    calloutsEl.appendChild(item);
                });

                grid.classList.remove('is-transitioning');

                setTimeout(function () {
                    var items = document.querySelectorAll('.callout-item');
                    items.forEach(function (item, idx) {
                        setTimeout(function () {
                            item.classList.add('is-visible');
                        }, idx * 80);
                    });
                }, 50);
            }, 300);
        }

        function selectChar(index) {
            if (index < 0 || index >= characterData.length || index === activeIdx) return;
            activeIdx = index;
            positionCards();
            updateCarouselDots();
            updateCharDetail();
        }

        prevBtn.addEventListener('click', function () {
            if (activeIdx > 0) selectChar(activeIdx - 1);
        });
        nextBtn.addEventListener('click', function () {
            if (activeIdx < characterData.length - 1) selectChar(activeIdx + 1);
        });

        cCards.forEach(function (card) {
            card.addEventListener('click', function () {
                var idx = parseInt(card.getAttribute('data-index'), 10);
                selectChar(idx);
            });
        });

        cDots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var idx = parseInt(dot.getAttribute('data-index'), 10);
                selectChar(idx);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (!carouselViewport) return;
            if (e.key === 'ArrowLeft' && activeIdx > 0) {
                selectChar(activeIdx - 1);
            } else if (e.key === 'ArrowRight' && activeIdx < characterData.length - 1) {
                selectChar(activeIdx + 1);
            }
        });

        var touchStartX = 0;
        carouselViewport.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        carouselViewport.addEventListener('touchend', function (e) {
            var diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0 && activeIdx < characterData.length - 1) {
                    selectChar(activeIdx + 1);
                } else if (diff < 0 && activeIdx > 0) {
                    selectChar(activeIdx - 1);
                }
            }
        }, { passive: true });

        var charReadMoreBtn = document.getElementById('char-read-more-btn');
        if (charReadMoreBtn) {
            charReadMoreBtn.addEventListener('click', function () {
                var loreBody = document.getElementById('char-lore-body');
                var expanded = loreBody.classList.toggle('is-expanded');
                charReadMoreBtn.textContent = expanded ? 'Read less' : 'Read more';
            });
        }

        window.addEventListener('resize', function () { positionCards(); });

        positionCards();
        updateCarouselDots();
        updateCharDetail();
    }

    // ---- Scroll Reveal ----
    var revealElements = Array.prototype.slice.call(document.querySelectorAll(
        '.location-card, .creature-card, .character-card, .char-col-lore, .char-col-artwork, .char-col-attrs, ' +
        '.world-intro, .author-content, .book-card.active, .lore-block, .lore-image, ' +
        '.gw-h-entry, .gw-era-marker'
    ));

    // Add reveal class to elements
    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    function checkReveal() {
        var windowHeight = window.innerHeight;
        // Iterate in reverse so we can splice revealed elements out of the array
        for (var i = revealElements.length - 1; i >= 0; i--) {
            var el = revealElements[i];
            var rect = el.getBoundingClientRect();
            if (rect.top < windowHeight - 40) {
                el.classList.add('revealed');
                revealElements.splice(i, 1);
            }
        }
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

    // ---- Horizontal Timeline: Progressive Reveal & Click-to-Expand ----
    var detailOverlay = document.getElementById('gw-detail-overlay');
    var detailPanel = detailOverlay ? detailOverlay.querySelector('.gw-detail-panel') : null;
    var lastClickedEntry = null;

    function openDetailOverlay(entry) {
        if (!detailOverlay || !detailPanel) return;

        var detail = entry.querySelector('.gw-h-detail');
        var img = entry.querySelector('.gw-h-img img');
        var dateEl = entry.querySelector('.gw-h-date');
        var titleEl = entry.querySelector('.gw-h-title');

        var dateTarget = detailPanel.querySelector('.gw-detail-date');
        var titleTarget = detailPanel.querySelector('.gw-detail-title');
        var bodyTarget = detailPanel.querySelector('.gw-detail-body');
        var imgWrap = detailPanel.querySelector('.gw-detail-img-wrap');

        if (dateTarget) dateTarget.textContent = dateEl ? dateEl.textContent : '';
        if (titleTarget) titleTarget.textContent = titleEl ? titleEl.textContent : '';
        if (bodyTarget) bodyTarget.innerHTML = detail ? detail.innerHTML : '';

        if (imgWrap) {
            if (img) {
                imgWrap.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="' + (img.getAttribute('alt') || '') + '">';
            } else {
                imgWrap.innerHTML = '';
            }
        }

        lastClickedEntry = entry;
        detailOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDetailOverlay() {
        if (!detailOverlay) return;
        detailOverlay.classList.remove('active');
        document.body.style.overflow = '';
        lastClickedEntry = null;
    }

    if (detailOverlay) {
        var detailCloseBtn = detailOverlay.querySelector('.gw-detail-close');
        if (detailCloseBtn) {
            detailCloseBtn.addEventListener('click', closeDetailOverlay);
        }
        detailOverlay.addEventListener('click', function (e) {
            if (e.target === detailOverlay) closeDetailOverlay();
        });
    }

    // Click handler for timeline entries — all entries always clickable
    var timelineEntries = document.querySelectorAll('.gw-h-entry');
    timelineEntries.forEach(function (entry) {
        entry.addEventListener('click', function () {
            openDetailOverlay(entry);
        });
    });

    // Drag-to-scroll removed — track fits within viewport, no scrolling needed

    // Close modal/lightbox/detail overlay on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDetailOverlay();
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
                if (revealElements.length > 0) checkReveal();
                if (!statsAnimated) animateStats();
                updateBackToTop();

                // Pause particle animation when scrolled well past the hero
                var heroThreshold = window.innerHeight * 2;
                if (window.scrollY > heroThreshold && !particlesPaused) {
                    pauseParticles();
                } else if (window.scrollY <= heroThreshold && particlesPaused && !document.hidden) {
                    resumeParticles();
                }

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
