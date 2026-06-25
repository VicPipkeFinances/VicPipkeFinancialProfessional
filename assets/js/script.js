document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 80;
    
    // Mobile Menu Logic
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('is-open');
            if (isOpen) {
                mobileMenu.classList.remove('is-open');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            } else {
                mobileMenu.classList.add('is-open');
                mobileMenu.setAttribute('aria-hidden', 'false');
                mobileMenuToggle.setAttribute('aria-expanded', 'true');
            }
        });

        // Close menu when a link is clicked
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('is-open');
                mobileMenu.setAttribute('aria-hidden', 'true');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
    
    // 1. Smooth Scrolling for Navigation Links with Header Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerHeight - 20; // 20px extra padding
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 2. Cursor Spotlight Logic
    if (header) {
        header.addEventListener('mousemove', (e) => {
            const rect = header.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            header.style.setProperty('--x', `${x}px`);
            header.style.setProperty('--y', `${y}px`);
        });
    }

    // 3. Scroll Observer (Navbar Compression & Progress)
    const progressIndicator = document.querySelector('.nav-progress-indicator');
    
    window.addEventListener('scroll', () => {
        // Toggle Scrolled State
        if (window.scrollY > 50) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }

        // Update Progress Indicator
        if (progressIndicator) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            // Cap at 100% and scale appropriately to fit within the border radius
            const finalWidth = Math.min(Math.max(scrolled, 0), 100);
            progressIndicator.style.width = `calc(${finalWidth}% - 36px)`; 
        }
    });

    // 4. Active Section Intelligence (Intersection Observer)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    const activeIndicator = document.querySelector('.nav-active-indicator');
    const navLinksWrapper = document.querySelector('.nav-links-wrapper');

    function updateActiveIndicator(targetLink) {
        if (!activeIndicator || !targetLink) return;
        
        // Show indicator if it was hidden
        activeIndicator.style.opacity = '1';
        
        const linkRect = targetLink.getBoundingClientRect();
        const wrapperRect = navLinksWrapper.getBoundingClientRect();
        
        // Calculate offset relative to the wrapper
        const offsetLeft = linkRect.left - wrapperRect.left;
        const width = linkRect.width;
        
        activeIndicator.style.transform = `translateX(${offsetLeft}px)`;
        activeIndicator.style.width = `${width}px`;
    }

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the top/middle of the viewport
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        let activeSectionId = null;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activeSectionId = entry.target.getAttribute('id');
            }
        });

        if (activeSectionId) {
            const activeLink = document.querySelector(`.nav-links .nav-link[href="#${activeSectionId}"]`);
            if (activeLink) {
                updateActiveIndicator(activeLink);
                
                // Highlight logic
                navLinks.forEach(link => {
                    link.style.color = 'rgba(255, 255, 255, 0.7)';
                    link.style.textShadow = 'none';
                });
                
                activeLink.style.color = '#D4AF37';
                activeLink.style.textShadow = '0 0 12px rgba(212, 175, 55, 0.3)';
            } else {
                // If the section doesn't have a direct nav link, hide the indicator or keep previous
                // For a cleaner look, fade it out if no match
                activeIndicator.style.opacity = '0';
                navLinks.forEach(link => {
                    link.style.color = 'rgba(255, 255, 255, 0.7)';
                    link.style.textShadow = 'none';
                });
            }
        }
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Initial active indicator setup based on initial hash or scroll position
    setTimeout(() => {
        const hash = window.location.hash;
        if (hash) {
            const initialLink = document.querySelector(`.nav-links .nav-link[href="${hash}"]`);
            if (initialLink) updateActiveIndicator(initialLink);
        } else {
             // Default to home if at top
             if(window.scrollY < 100) {
                 const homeLink = document.querySelector('.nav-links .nav-link[href="#hero"]');
                 if(homeLink) {
                     updateActiveIndicator(homeLink);
                     homeLink.style.color = '#D4AF37';
                 }
             }
        }
    }, 500); // Small delay to ensure CSS fonts/layout are loaded for accurate width
    
    // 4. Reveal Animations (IntersectionObserver 2026 Engine)
    const revealElements = document.querySelectorAll('.reveal, .reveal-up');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -10% 0px'
        });

        revealElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('reveal-visible'));
    }

    // 5. Premium Accordion Logic
    const detailsElements = document.querySelectorAll('details.assessment-card, details.faq-item');
    detailsElements.forEach(details => {
        const summary = details.querySelector('summary');
        const answer = details.querySelector('.assessment-answer, .faq-answer');
        
        if (answer && !answer.querySelector('.assessment-answer-inner, .faq-answer-inner')) {
            const innerClass = answer.classList.contains('faq-answer') ? 'faq-answer-inner' : 'assessment-answer-inner';
            const innerDiv = document.createElement('div');
            innerDiv.className = innerClass;
            while(answer.firstChild) {
                innerDiv.appendChild(answer.firstChild);
            }
            answer.appendChild(innerDiv);
        }

        summary.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (details.classList.contains('is-open')) {
                // Closing
                details.classList.remove('is-open');
                setTimeout(() => {
                    details.removeAttribute('open');
                }, 300); // 300ms matches hover duration
            } else {
                // Opening
                details.setAttribute('open', '');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        details.classList.add('is-open');
                    });
                });
            }
        });
    });
});
