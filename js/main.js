/**
 * HTP PRO - Main JavaScript
 * Arquivo principal com funcionalidades core da landing page
 */

// ============================================
// ANALYTICS & TRACKING
// ============================================

class Analytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.trackClicks();
        this.trackScroll();
        this.trackTimeOnPage();
        this.trackUserInteraction();
    }

    trackPageView() {
        this.logEvent('page_view', {
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    trackClicks() {
        // Track all button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('a, button');
            if (button) {
                const buttonType = this.getButtonType(button);
                const destination = button.href || button.dataset.action || 'unknown';
                
                this.logEvent('button_click', {
                    button_type: buttonType,
                    button_text: button.textContent.trim(),
                    destination: destination,
                    timestamp: new Date().toISOString()
                });

                // Specific tracking for conversion buttons
                if (this.isConversionButton(button)) {
                    this.trackConversion(buttonType, destination);
                }
            }
        });
    }

    trackScroll() {
        let maxScroll = 0;
        const scrollMilestones = [25, 50, 75, 90, 100];
        const trackedMilestones = new Set();

        window.addEventListener('scroll', throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            maxScroll = Math.max(maxScroll, scrollPercent);

            // Track scroll milestones
            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
                    trackedMilestones.add(milestone);
                    this.logEvent('scroll_milestone', {
                        milestone: milestone,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }, 250));

        // Track max scroll on page unload
        window.addEventListener('beforeunload', () => {
            this.logEvent('max_scroll', {
                max_scroll_percent: maxScroll,
                timestamp: new Date().toISOString()
            });
        });
    }

    trackTimeOnPage() {
        const intervals = [10, 30, 60, 120, 300]; // seconds
        const trackedIntervals = new Set();

        setInterval(() => {
            const timeOnPage = Math.floor((Date.now() - this.sessionStart) / 1000);
            
            intervals.forEach(interval => {
                if (timeOnPage >= interval && !trackedIntervals.has(interval)) {
                    trackedIntervals.add(interval);
                    this.logEvent('time_on_page', {
                        seconds: interval,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        }, 5000);
    }

    trackUserInteraction() {
        let interactionCount = 0;
        
        ['click', 'scroll', 'keydown', 'mousemove'].forEach(eventType => {
            document.addEventListener(eventType, throttle(() => {
                interactionCount++;
                
                if (interactionCount === 1) {
                    this.logEvent('first_interaction', {
                        type: eventType,
                        time_to_first_interaction: Date.now() - this.sessionStart,
                        timestamp: new Date().toISOString()
                    });
                }
            }, 1000), { passive: true });
        });
    }

    getButtonType(button) {
        const href = button.href || '';
        const classes = button.className || '';
        
        if (href.includes('home.htppro.com')) return 'htp_pro_app';
        if (href.includes('luck.bet')) return 'platform';
        if (href.includes('youtube.com')) return 'youtube';
        if (href.includes('humildedaroleta.com.br')) return 'ebook_course';
        if (href.includes('t.me')) return 'telegram';
        if (href.includes('wa.me')) return 'whatsapp';
        if (href.includes('instagram.com')) return 'instagram';
        
        if (classes.includes('hero-cta')) return 'hero_cta';
        if (classes.includes('app-button')) return 'app_button';
        if (classes.includes('cta-button')) return 'final_cta';
        
        return 'other';
    }

    isConversionButton(button) {
        const conversionButtons = [
            'htp_pro_app', 'platform', 'ebook_course', 
            'hero_cta', 'app_button', 'final_cta'
        ];
        return conversionButtons.includes(this.getButtonType(button));
    }

    trackConversion(buttonType, destination) {
        this.logEvent('conversion', {
            conversion_type: buttonType,
            destination: destination,
            time_to_conversion: Date.now() - this.sessionStart,
            timestamp: new Date().toISOString()
        });

        // Send to external analytics if configured
        this.sendToExternalAnalytics('conversion', {
            type: buttonType,
            value: this.getConversionValue(buttonType)
        });
    }

    getConversionValue(buttonType) {
        const values = {
            'htp_pro_app': 100,
            'platform': 80,
            'ebook_course': 60,
            'youtube': 20,
            'telegram': 30
        };
        return values[buttonType] || 10;
    }

    logEvent(eventName, data) {
        const event = {
            event: eventName,
            ...data,
            session_id: this.getSessionId(),
            page_url: window.location.href
        };
        
        this.events.push(event);
        console.log('📊 Analytics Event:', event);
        
        // Send to server if endpoint is configured
        this.sendToServer(event);
    }

    sendToServer(event) {
        // Placeholder for server endpoint
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(event)
        // });
    }

    sendToExternalAnalytics(eventName, data) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
        
        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, data);
        }
        
        // Meta Pixel
        if (typeof _qevents !== 'undefined') {
            _qevents.push({
                qacct: "p-XXXXXXXXXX",
                labels: `${eventName},${data.type || ''}`
            });
        }
    }

    getSessionId() {
        let sessionId = localStorage.getItem('htp_session_id');
        if (!sessionId) {
            sessionId = 'htp_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('htp_session_id', sessionId);
        }
        return sessionId;
    }

    // Get analytics summary
    getSummary() {
        return {
            total_events: this.events.length,
            session_duration: Date.now() - this.sessionStart,
            events_by_type: this.events.reduce((acc, event) => {
                acc[event.event] = (acc[event.event] || 0) + 1;
                return acc;
            }, {}),
            last_events: this.events.slice(-5)
        };
    }
}

// ============================================
// FORM VALIDATION & HANDLING
// ============================================

class FormHandler {
    constructor() {
        this.forms = new Map();
        this.init();
    }

    init() {
        this.setupContactForms();
        this.setupNewsletterForms();
        this.setupValidation();
    }

    setupContactForms() {
        const contactForms = document.querySelectorAll('.contact-form');
        contactForms.forEach(form => {
            form.addEventListener('submit', this.handleContactSubmit.bind(this));
        });
    }

    setupNewsletterForms() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => {
            form.addEventListener('submit', this.handleNewsletterSubmit.bind(this));
        });
    }

    setupValidation() {
        const inputs = document.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
            input.addEventListener('input', this.clearFieldError.bind(this));
        });
    }

    handleContactSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        if (this.validateForm(form)) {
            this.submitForm(form, formData, 'contact');
        }
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        
        if (this.validateForm(form)) {
            this.submitForm(form, formData, 'newsletter');
        }
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        const type = field.type;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError({ target: field });

        // Required validation
        if (field.required && !value) {
            errorMessage = 'Este campo é obrigatório';
            isValid = false;
        }

        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Por favor, insira um email válido';
                isValid = false;
            }
        }

        // Phone validation
        else if (field.name === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                errorMessage = 'Por favor, insira um telefone válido';
                isValid = false;
            }
        }

        // Name validation
        else if (field.name === 'name' && value) {
            if (value.length < 2) {
                errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ff4757;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;
    }

    clearFieldError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async submitForm(form, formData, type) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        try {
            // Simulate API call
            await this.sendFormData(formData, type);
            
            // Success state
            this.showFormSuccess(form, type);
            form.reset();
            
            // Track conversion
            window.analytics?.logEvent('form_submit', {
                form_type: type,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            this.showFormError(form, 'Erro ao enviar formulário. Tente novamente.');
            console.error('Form submission error:', error);
        } finally {
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    async sendFormData(formData, type) {
        // Placeholder for actual API endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated error'));
                }
            }, 1500);
        });
        
        // Real implementation would be:
        // const response = await fetch('/api/forms', {
        //     method: 'POST',
        //     body: formData
        // });
        // return response.json();
    }

    showFormSuccess(form, type) {
        const message = type === 'newsletter' 
            ? 'Obrigado! Você foi inscrito com sucesso!'
            : 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
            
        this.showFormMessage(form, message, 'success');
    }

    showFormError(form, message) {
        this.showFormMessage(form, message, 'error');
    }

    showFormMessage(form, message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.style.cssText = `
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
            text-align: center;
            font-weight: 600;
            ${type === 'success' 
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;

        // Remove existing messages
        form.querySelectorAll('.form-message').forEach(el => el.remove());
        
        form.appendChild(messageElement);

        // Auto remove after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// ============================================
// LAZY LOADING & IMAGE OPTIMIZATION
// ============================================

class LazyLoader {
    constructor() {
        this.observer = null;
        this.images = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.loadImages();
        this.preloadCriticalImages();
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    loadImages() {
        const images = document.querySelectorAll('img[data-src], [data-bg]');
        
        images.forEach(img => {
            if (this.observer) {
                this.observer.observe(img);
            } else {
                // Fallback for browsers without IntersectionObserver
                this.loadImage(img);
            }
        });
    }

    loadImage(element) {
        const src = element.dataset.src;
        const bg = element.dataset.bg;

        if (src && element.tagName === 'IMG') {
            // Create a new image to preload
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                element.src = src;
                element.classList.add('loaded');
                element.removeAttribute('data-src');
            };
            
            imageLoader.onerror = () => {
                element.classList.add('error');
                console.error('Failed to load image:', src);
            };
            
            imageLoader.src = src;
            
        } else if (bg) {
            // Background image
            element.style.backgroundImage = `url(${bg})`;
            element.classList.add('loaded');
            element.removeAttribute('data-bg');
        }
    }

    preloadCriticalImages() {
        // Preload hero images and above-the-fold content
        const criticalImages = [
            './images/mentor/humilde-hero.png',
            './images/backgrounds/hero-bg.jpg',
            './images/cards/app-htp-card.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Method to manually trigger loading of specific images
    loadImagesBySelector(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => this.loadImage(element));
    }
}

// ============================================
// ERROR HANDLING & FALLBACKS
// ============================================

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupImageErrorHandling();
        this.setupPromiseRejectionHandling();
        this.setupConsoleOverride();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    setupImageErrorHandling() {
        document.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG') {
                this.handleImageError(event.target);
            }
        }, true);
    }

    handleImageError(img) {
        // Try fallback image or placeholder
        const fallbackSrc = './images/placeholder.jpg';
        
        if (img.src !== fallbackSrc) {
            img.src = fallbackSrc;
        } else {
            // If even fallback fails, create a CSS placeholder
            img.style.cssText = `
                width: ${img.width || 300}px;
                height: ${img.height || 200}px;
                background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `;
            img.alt = 'Imagem não disponível';
        }

        this.logError({
            type: 'image_load_error',
            src: img.dataset.originalSrc || img.src,
            alt: img.alt,
            timestamp: new Date().toISOString()
        });
    }

    setupPromiseRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'unhandled_promise_rejection',
                reason: event.reason?.toString(),
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    setupConsoleOverride() {
        const originalError = console.error;
        console.error = (...args) => {
            this.logError({
                type: 'console_error',
                message: args.join(' '),
                timestamp: new Date().toISOString()
            });
            originalError.apply(console, args);
        };
    }

    logError(error) {
        this.errors.push(error);
        
        // Send to analytics
        window.analytics?.logEvent('error', error);
        
        // Send to error reporting service
        this.sendToErrorService(error);
        
        // Show user-friendly message for critical errors
        if (this.isCriticalError(error)) {
            this.showUserErrorMessage();
        }
    }

    isCriticalError(error) {
        const criticalTypes = ['javascript_error', 'unhandled_promise_rejection'];
        return criticalTypes.includes(error.type);
    }

    showUserErrorMessage() {
        // Only show once per session
        if (sessionStorage.getItem('error_shown')) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        
        errorDiv.innerHTML = `
            <strong>Ops! Algo deu errado</strong><br>
            <small>Recarregue a página ou tente novamente em alguns minutos.</small>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                float: right;
                font-size: 18px;
                cursor: pointer;
                margin-top: -5px;
            ">&times;</button>
        `;
        
        document.body.appendChild(errorDiv);
        sessionStorage.setItem('error_shown', 'true');
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 10000);
    }

    sendToErrorService(error) {
        // Placeholder for error reporting service
        // Example: Sentry, LogRocket, etc.
        /*
        fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(error)
        }).catch(() => {
            // Fail silently
        });
        */
    }

    getErrorSummary() {
        return {
            total_errors: this.errors.length,
            errors_by_type: this.errors.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {}),
            recent_errors: this.errors.slice(-5)
        };
    }
}

// ============================================
// BROWSER COMPATIBILITY & POLYFILLS
// ============================================

class BrowserSupport {
    constructor() {
        this.features = {};
        this.init();
    }

    init() {
        this.detectFeatures();
        this.loadPolyfills();
        this.showBrowserWarning();
    }

    detectFeatures() {
        this.features = {
            intersectionObserver: 'IntersectionObserver' in window,
            webp: this.supportsWebP(),
            customProperties: CSS.supports('color', 'var(--test)'),
            grid: CSS.supports('display', 'grid'),
            flexbox: CSS.supports('display', 'flex'),
            fetch: 'fetch' in window,
            promises: 'Promise' in window,
            arrow_functions: this.supportsArrowFunctions(),
            es6_modules: this.supportsES6Modules()
        };
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    supportsArrowFunctions() {
        try {
            eval('() => {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    supportsES6Modules() {
        const script = document.createElement('script');
        return 'noModule' in script;
    }

    loadPolyfills() {
        const polyfills = [];

        if (!this.features.intersectionObserver) {
            polyfills.push('intersection-observer');
        }

        if (!this.features.fetch) {
            polyfills.push('fetch');
        }

        if (!this.features.promises) {
            polyfills.push('es6-promise');
        }

        if (polyfills.length > 0) {
            this.loadPolyfillsFromCDN(polyfills);
        }
    }

    loadPolyfillsFromCDN(polyfills) {
        const polyfillScript = document.createElement('script');
        polyfillScript.src = `https://polyfill.io/v3/polyfill.min.js?features=${polyfills.join(',')}`;
        polyfillScript.onload = () => {
            console.log('📦 Polyfills carregados:', polyfills);
        };
        document.head.appendChild(polyfillScript);
    }

    showBrowserWarning() {
        const isOldBrowser = !this.features.fetch || !this.features.promises || !this.features.flexbox;
        
        if (isOldBrowser && !sessionStorage.getItem('browser_warning_shown')) {
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background: #ffc107;
                color: #333;
                padding: 10px;
                text-align: center;
                z-index: 10001;
                font-family: Arial, sans-serif;
                font-size: 14px;
            `;
            
            warning.innerHTML = `
                <strong>Seu navegador está desatualizado!</strong> 
                Para uma melhor experiência, recomendamos atualizar seu navegador.
                <button onclick="this.parentElement.remove(); sessionStorage.setItem('browser_warning_shown', 'true')" 
                        style="margin-left: 10px; background: #333; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                    Fechar
                </button>
            `;
            
            document.body.appendChild(warning);
            sessionStorage.setItem('browser_warning_shown', 'true');
        }
    }

    getCompatibilityReport() {
        return {
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled
            },
            features: this.features,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1
            }
        };
    }
}

// ============================================
// INITIALIZATION & MAIN APP
// ============================================

class HTPProApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Inicializando HTP PRO Landing Page...');
            
            // Initialize core modules
            this.modules.browserSupport = new BrowserSupport();
            this.modules.errorHandler = new ErrorHandler();
            this.modules.analytics = new Analytics();
            this.modules.lazyLoader = new LazyLoader();
            this.modules.formHandler = new FormHandler();
            
            // Make analytics globally available
            window.analytics = this.modules.analytics;
            
            // Setup page interactions
            this.setupPageInteractions();
            
            // Setup development helpers
            if (this.isDevelopment()) {
                this.setupDevTools();
            }
            
            this.isInitialized = true;
            console.log('✅ HTP PRO inicializado com sucesso!');
            
            // Track successful initialization
            this.modules.analytics.logEvent('app_initialized', {
                modules: Object.keys(this.modules),
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.modules.errorHandler?.logError({
                type: 'initialization_error',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }

    setupPageInteractions() {
        // Setup smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Setup external link tracking
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('click', () => {
                // Small delay to ensure analytics is tracked
                setTimeout(() => {
                    if (link.target !== '_blank') {
                        window.location.href = link.href;
                    }
                }, 100);
            });
        });

        // Setup keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals or overlays
                document.querySelectorAll('.modal, .overlay').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });
    }

    setupDevTools() {
        // Add development helpers
        window.HTPDev = {
            app: this,
            analytics: () => this.modules.analytics.getSummary(),
            errors: () => this.modules.errorHandler.getErrorSummary(),
            compatibility: () => this.modules.browserSupport.getCompatibilityReport(),
            loadImages: (selector) => this.modules.lazyLoader.loadImagesBySelector(selector),
            clearAnalytics: () => {
                this.modules.analytics.events = [];
                console.log('📊 Analytics cleared');
            }
        };

        console.log('🛠️ Dev tools disponíveis em window.HTPDev');
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    // Public methods
    getModule(name) {
        return this.modules[name];
    }

    isReady() {
        return this.isInitialized;
    }
}

// ============================================
// UTILITY FUNCTIONS (from animations.js)
// ============================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// BOOTSTRAP APPLICATION
// ============================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.htpApp = new HTPProApp();
    });
} else {
    window.htpApp = new HTPProApp();
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HTPProApp, Analytics, FormHandler, LazyLoader, ErrorHandler, BrowserSupport };
}