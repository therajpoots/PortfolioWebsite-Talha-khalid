class PortfolioManager {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = document.getElementById('nav-links');
        this.scrollTopBtn = document.getElementById('scrollTop');
        this.projectModal = document.getElementById('projectModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalClose = document.getElementById('modalClose');
        this.modalBody = document.getElementById('modalBody');

        // Hardcoded stats from Google Scholar (update as needed)
        this.authorStats = { cited_by_count: 34, h_index: 3, i10_index: 2 };
        this.publicationCitations = [5, 15, 0, 0, 13, 1]; // Order: Nano Energy, Chem Eng J (Reshaping), JSAMD (Electrospun), Chem Eng J (Next-gen), JSAMD (Hybrid), Mater Proc

        // Sample projectData for modals (add 'data-project="id"' to project-cards and 'btn-read-more' buttons if needed)
        this.projectData = {
            'upec': {
                title: 'UPEC: A Multi-Modal AI-Powered Device',
                date: '2024-2025',
                description: 'Compact handheld device for cardiac diagnostics using Hybrid LSTM-CNN.',
                features: ['AUC >97%', 'Real-time alerts', 'Portable design'],
                technologies: ['TensorFlow', 'LSTM-CNN', 'Arduino'],
                image: 'ucpe.jpg'
            },
            'eeg': {
                title: 'EEG-Driven Motor Imagery Classification',
                date: '2025',
                description: 'CNN-Transformer system for stroke rehabilitation.',
                features: ['88% accuracy', 'Real-time biofeedback', 'Gamified platform'],
                technologies: ['PyTorch', 'CNN-Transformer', 'EEG Processing'],
                image: 'eeg.jpg'
            }
            // Add more projects as needed
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
        this.initializeAnimations();
        this.loadPublicationStats(); // Load hardcoded stats
    }

    loadPublicationStats() {
        // Insert author stats
        this.insertAuthorStats(this.authorStats);

        // Update individual publication citations
        this.publicationCitations.forEach((citations, index) => {
            this.updatePublicationCitations(index, citations);
        });
    }

    insertAuthorStats(stats) {
        const publicationsSection = document.getElementById('publications');
        if (!publicationsSection || document.querySelector('.author-stats')) return;

        const statsDiv = document.createElement('div');
        statsDiv.className = 'author-stats';
        statsDiv.innerHTML = `
            <div class="stat">
                <div class="stat-number">${stats.cited_by_count}</div>
                <div class="stat-label">Total Citations</div>
            </div>
            <div class="stat">
                <div class="stat-number">${stats.h_index}</div>
                <div class="stat-label">h-index</div>
            </div>
            <div class="stat">
                <div class="stat-number">${stats.i10_index}</div>
                <div class="stat-label">i10-index</div>
            </div>
        `;

        publicationsSection.parentNode.insertBefore(statsDiv, publicationsSection);
    }

    updatePublicationCitations(index, citations) {
        const cards = document.querySelectorAll('.publication-card');
        if (!cards[index]) return;

        let citDiv = cards[index].querySelector('.publication-citations');
        if (!citDiv) {
            citDiv = document.createElement('div');
            citDiv.className = 'publication-citations';
            cards[index].appendChild(citDiv);
        }

        citDiv.innerHTML = `<i class="fas fa-citation"></i> <strong>Citations:</strong> ${citations}`;
    }

    setupEventListeners() {
        // Throttled scroll handler for better performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Mobile menu toggle
        if (this.mobileMenu) {
            this.mobileMenu.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking nav links
        if (this.navLinks) {
            this.navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
        }

        // Scroll to top button
        if (this.scrollTopBtn) {
            this.scrollTopBtn.addEventListener('click', () => {
                this.scrollToTop();
            });
        }

        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.handleFormSubmission(e);
            });
        }

        // Project modal handlers (add class="btn-read-more" to buttons and data-project to cards if using)
        document.querySelectorAll('.btn-read-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const projectCard = btn.closest('.project-card');
                const projectId = projectCard.getAttribute('data-project');
                this.openProjectModal(projectId);
            });
        });

        // Modal close handlers
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => {
                this.closeProjectModal();
            });
        }

        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', () => {
                this.closeProjectModal();
            });
        }

        // Keyboard event handlers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.projectModal && this.projectModal.classList.contains('active')) {
                    this.closeProjectModal();
                } else if (this.navLinks && this.navLinks.classList.contains('active')) {
                    this.closeMobileMenu();
                }
            }
        });

        // Responsive handler
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.navLinks && this.navLinks.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }

    handleScroll() {
        const scrollY = window.pageYOffset;

        // Update navbar appearance
        if (this.navbar) {
            if (scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
        }

        // Show/hide scroll to top button
        if (this.scrollTopBtn) {
            if (scrollY > 400) {
                this.scrollTopBtn.classList.add('visible');
            } else {
                this.scrollTopBtn.classList.remove('visible');
            }
        }

        // Update active navigation link
        this.updateActiveNavLink();

        // Trigger scroll animations
        this.handleScrollAnimations();
    }

    toggleMobileMenu() {
        if (this.mobileMenu && this.navLinks) {
            this.mobileMenu.classList.toggle('active');
            this.navLinks.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (this.navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    closeMobileMenu() {
        if (this.mobileMenu && this.navLinks) {
            this.mobileMenu.classList.remove('active');
            this.navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionHeight = section.offsetHeight;

            if (sectionTop <= 200 && sectionTop + sectionHeight > 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));

                if (target) {
                    const navbarHeight = this.navbar ? this.navbar.offsetHeight : 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Elements to observe for animations
        const elementsToObserve = [
            '.section-header',
            '.experience-card',
            '.project-card',
            '.skill-category',
            '.stat',
            '.contact-item'
        ];

        elementsToObserve.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (el) observer.observe(el);
            });
        });
    }

    initializeAnimations() {
        // Stagger animation delays for section headers
        const animatedElements = document.querySelectorAll('.section-header');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.2}s`;
        });
    }

    handleScrollAnimations() {
        const elements = document.querySelectorAll('.stat, .skill-category, .experience-card, .project-card');
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100 && rect.bottom > 0) {
                el.classList.add('fade-in-up');
            }
        });
    }

    openProjectModal(projectId) {
        const project = this.projectData[projectId];
        if (!project) return;

        // Generate image HTML
        let imageHTML = '';
        if (project.images) {
            imageHTML = project.images.map(img =>
                `<div class="modal-image" style="margin-top: 1.5rem;">
                    <h4 style="margin-bottom: 0.5rem; color: var(--primary);">${img.caption}</h4>
                    <img src="${img.src}" alt="${img.caption}" 
                         style="width: 100%; border-radius: var(--radius-lg); margin-bottom: 1rem; box-shadow: var(--shadow-medium);">
                </div>`
            ).join('');
        } else if (project.image) {
            imageHTML = `
                <div class="modal-image" style="margin-top: 1.5rem;">
                    <img src="${project.image}" alt="${project.title}" 
                         style="width: 100%; border-radius: var(--radius-lg); margin-bottom: 1rem; box-shadow: var(--shadow-medium);">
                </div>
            `;
        }

        // Generate modal content
        const modalContent = `
            <h2 class="modal-title">${project.title}</h2>
            <p class="modal-subtitle">${project.date}</p>

            <div class="modal-description">
                <p>${project.description}</p>
            </div>
            
            <div class="modal-features">
                <h4>Key Features & Capabilities:</h4>
                <ul>
                    ${project.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div class="modal-features">
                <h4>Technologies Used:</h4>
                <div class="project-tech" style="margin-top: 1rem;">
                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
            
            ${project.code ? `
            <div class="modal-features">
                <h4>Code Implementation:</h4>
                <div class="modal-code">${project.code}</div>
            </div>` : ''}

            ${imageHTML} 
        `;

        this.modalBody.innerHTML = modalContent;
        this.projectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeProjectModal() {
        this.projectModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleFormSubmission(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        // Validate form data
        if (!name || !email || !message) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Show loading state
        this.showLoadingState(form);

        // Simulate form submission (replace with actual API call, e.g., Netlify Forms)
        setTimeout(() => {
            this.hideLoadingState(form);
            this.showNotification('Thank you for your message! I will get back to you soon.', 'success');
            form.reset();
        }, 2000);
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoadingState(form) {
        const submitBtn = form.querySelector('.btn-form');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.classList.add('loading');
        }
    }

    hideLoadingState(form) {
        const submitBtn = form.querySelector('.btn-form');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message';
            submitBtn.classList.remove('loading');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        // Notification styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '400px',
            boxShadow: 'var(--shadow-heavy)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });

        // Set background color based on type
        if (type === 'success') {
            notification.style.background = 'var(--success)';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = 'var(--primary)';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
}

// Initialize portfolio manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioManager();

    // Add loading animation to images
    const images = document.querySelectorAll('img:not(.no-fade)');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});