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

        // Project data with updated professional color scheme
        this.projectData = {
            'heart-rate-monitor': {
                title: 'Beat Per Minute Calculator / Heart Rate Monitor',
                date: 'Jul 2023 – Sep 2023',
                description: 'A comprehensive biomedical project implementing a MATLAB-based Heart Rate Monitor system. This innovative solution performs real-time heartbeat detection, calculates accurate BPM measurements, conducts FFT spectrum analysis, identifies ECG peaks (R-wave and T-wave), and analyzes instantaneous power and energy for both medical diagnostics and fitness monitoring applications.',
                features: [
                    'Real-time Beats Per Minute (BPM) calculation with high precision',
                    'Advanced ECG R-wave and T-wave detection using adaptive thresholding',
                    'Heart rate variability tracking for cardiac health assessment',
                    'Intelligent abnormal heart rate detection and alert system'
                ],
                technologies: ['MATLAB', 'Signal Processing', 'ECG Analysis', 'Biomedical Algorithms', 'FFT Analysis', 'Peak Detection'],
                 images: [
                    { src: 'output.png', caption: 'Result' }
                ],
                code: `%% Advanced Heart Rate Monitor - BPM, Spectrum, and ECG Peak Detection

% === SIGNAL PREPROCESSING ===
% Load and filter ECG signal
fs = 100;                           % Sampling frequency (Hz)
N = length(ECG);                    % Signal length
duration_in_seconds = N / fs;
duration_in_minutes = duration_in_seconds / 60;

% Apply bandpass filter to remove noise
[b, a] = butter(4, [0.5 40]/(fs/2), 'bandpass');
ECG_filtered = filtfilt(b, a, ECG);

% === ADVANCED PEAK DETECTION & BPM CALCULATION ===
% Dynamic threshold calculation
ECG_squared = ECG_filtered.^2;
ECG_integrated = conv(ECG_squared, ones(1,30)/30, 'same');

% Adaptive threshold using signal statistics
threshold = 0.3 * max(ECG_integrated);
beat_count = 0;
peak_locations = [];

for k = 2:length(ECG_integrated)-1
    if (ECG_integrated(k) > ECG_integrated(k-1) && ...
        ECG_integrated(k) > ECG_integrated(k+1) && ...
        ECG_integrated(k) > threshold)
        beat_count = beat_count + 1;
        peak_locations = [peak_locations, k];
    end
end

% Calculate average BPM
BPM_avg = beat_count / duration_in_minutes;
fprintf('Average Heart Rate: %.1f BPM\\n', BPM_avg);

% === FFT SPECTRUM ANALYSIS ===
NFFT = 2^nextpow2(N);              % Next power of 2 for efficiency
Y = fft(ECG_filtered, NFFT) / N;   % Normalized FFT
f = (fs/2 * linspace(0,1,NFFT/2+1))'; % Frequency vector
amplitude_spectrum = 2*abs(Y(1:NFFT/2+1));

% Plot spectrum
figure('Name', 'ECG Frequency Spectrum');
plot(f, amplitude_spectrum, 'LineWidth', 2);
title('Single-Sided Amplitude Spectrum of ECG Signal');
xlabel('Frequency (Hz)');
ylabel('|Y(f)| Amplitude');
grid on;
xlim([0 50]); % Focus on relevant frequencies

% === ADVANCED SPECTROGRAM ANALYSIS ===
Nspec = 256;                       % Window length
wspec = hamming(Nspec);            % Hamming window
Noverlap = Nspec/2;                % 50% overlap
[S, W, T] = spectrogram(ECG_filtered, wspec, Noverlap, NFFT, fs);

figure('Name', 'ECG Spectrogram');
spectrogram(ECG_filtered, wspec, Noverlap, NFFT, fs, 'yaxis');
title('ECG Signal Spectrogram');
colormap('jet');

% === PRECISION R-WAVE & T-WAVE DETECTION ===
% R-wave detection (positive peaks)
[R_peaks, R_locs] = findpeaks(ECG_filtered, ...
    'MinPeakHeight', 0.5, ...
    'MinPeakDistance', 60, ...
    'MinPeakProminence', 0.3);

% T-wave detection (smaller positive peaks)
[T_peaks, T_locs] = findpeaks(ECG_filtered, ...
    'MinPeakHeight', 0.1, ...
    'MaxPeakHeight', 0.4, ...
    'MinPeakDistance', 30);

% Visualization
figure('Name', 'ECG Peak Detection');
plot(ECG_filtered, 'b-', 'LineWidth', 1.5);
hold on;
plot(R_locs, R_peaks, 'rv', 'MarkerSize', 8, 'MarkerFaceColor', 'r');
plot(T_locs, T_peaks, 'g^', 'MarkerSize', 6, 'MarkerFaceColor', 'g');
legend('ECG Signal', 'R-waves', 'T-waves');
xlabel('Sample Number');
ylabel('Amplitude (mV)');
title('ECG Signal with R-wave and T-wave Detection');
grid on;

% === POWER AND ENERGY ANALYSIS ===
% Instantaneous power calculation
instantaneous_power = ECG_filtered.^2;
average_power = mean(instantaneous_power);
total_energy = sum(instantaneous_power) / fs; % Energy per second

% Power spectrum density
[psd, f_psd] = pwelch(ECG_filtered, [], [], [], fs);

figure('Name', 'Power Analysis');
subplot(2,1,1);
plot(instantaneous_power, 'g-', 'LineWidth', 1);
hold on;
plot(ones(size(ECG_filtered))*average_power, 'r--', 'LineWidth', 2);
title('Instantaneous Power Analysis');
ylabel('Power (mV²)');
legend('Instantaneous Power', 'Average Power');
grid on;

subplot(2,1,2);
semilogy(f_psd, psd, 'b-', 'LineWidth', 1.5);
title('Power Spectral Density');
xlabel('Frequency (Hz)');
ylabel('PSD (mV²/Hz)');
grid on;

% === CLINICAL METRICS CALCULATION ===
% Heart Rate Variability (HRV)
if length(R_locs) > 1
    RR_intervals = diff(R_locs) / fs * 1000; % in milliseconds
    RMSSD = sqrt(mean(diff(RR_intervals).^2)); % Root mean square of successive differences
    SDNN = std(RR_intervals); % Standard deviation of NN intervals
    
    fprintf('Heart Rate Variability Metrics:\\n');
    fprintf('RMSSD: %.2f ms\\n', RMSSD);
    fprintf('SDNN: %.2f ms\\n', SDNN);
end

% Display results
fprintf('\\n=== ECG ANALYSIS RESULTS ===\\n');
fprintf('Total Energy: %.4f mV²·s\\n', total_energy);
fprintf('Average Power: %.4f mV²\\n', average_power);
fprintf('Peak Count: %d beats\\n', length(R_locs));
fprintf('Signal Duration: %.1f seconds\\n', duration_in_seconds);

% Save results to workspace
save('ecg_analysis_results.mat', 'BPM_avg', 'R_locs', 'T_locs', ...
     'instantaneous_power', 'total_energy', 'RR_intervals');

disp('ECG analysis complete. Results saved to workspace.');`
            },

            'therapeutic-device': {
                title: 'Wearable Therapeutic Device for Chronic Venous Insufficiency',
                date: 'Sep 2023 – Jul 2024',
                description: 'Advanced wearable medical device engineered for Chronic Venous Insufficiency (CVI) treatment. This innovative therapeutic solution integrates intelligent graduated compression therapy with precision pressure sensors and real-time monitoring capabilities. The device optimizes patient comfort while delivering clinically effective therapeutic intervention for improved venous circulation, reduced edema, and enhanced quality of life.',
                features: [
                    'Patient comfort optimization through adaptive compression algorithms',
                    'Therapeutic effectiveness tracking with clinical outcome metrics',
                    'Lightweight, breathable materials with ergonomic design for daily wear'
                ],
                technologies: ['Medical Device Design', 'Pressure Sensors', 'Therapeutic Systems', 'Biomechanics', 'Patient Monitoring', 'Wearable Electronics', 'Clinical Validation'],
                images: [
                    { src: 'flowcircuit.png.jpg', caption: 'Flow Diagram' },
                    { src: 'cvi.jpg', caption: ' Output' }
                ]
            },

            'drug-delivery': {
                title: 'Automated Precision Drug Delivery System',
                date: 'Jul 2023 – Sep 2023',
                description: 'Precision-engineered automated drug delivery system utilizing advanced Arduino microcontroller architecture and intelligent control algorithms. This comprehensive healthcare IoT solution minimizes human intervention while ensuring accurate, timely medication administration. The system enhances patient safety, improves treatment compliance, and reduces medication errors through sophisticated automation and monitoring capabilities.',
                features: [
                    'Reduce Human Intervention', 'Enhance Accuracy and Safety', 'Improve Patient Compliance & Convenience'
                ],
                technologies: ['Arduino', 'Healthcare IoT', 'Automation Systems', 'Precision Control', 'Safety Systems', 'Sensor Integration', 'Wireless Communication'],
                images: [
                    { src: 'arduino.jpg', caption: 'Circuit Design' },
                    { src: 'drug1.png', caption: ' Output' }
                ]
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupSmoothScrolling();
        this.initializeAnimations();
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

        // Project modal handlers
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

        // Simulate form submission (replace with actual API call)
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