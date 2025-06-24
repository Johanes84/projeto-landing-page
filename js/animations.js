/**
 * HTP PRO - Animations & Effects
 * Arquivo responsável por todas as animações e efeitos visuais
 */

// ============================================
// INTERSECTION OBSERVER - ANIMAÇÕES DE ENTRADA
// ============================================

class AnimationObserver {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        // Observer para cards
        this.createObserver('card-observer', {
            selector: '[data-aos]',
            threshold: 0.1,
            rootMargin: '50px',
            callback: this.handleCardAnimation.bind(this)
        });

        // Observer para elementos do hero
        this.createObserver('hero-observer', {
            selector: '.hero-content > *',
            threshold: 0.2,
            callback: this.handleHeroAnimation.bind(this)
        });

        // Observer para seções
        this.createObserver('section-observer', {
            selector: 'section',
            threshold: 0.1,
            callback: this.handleSectionAnimation.bind(this)
        });
    }

    createObserver(name, options) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(options.callback);
        }, {
            threshold: options.threshold || 0.1,
            rootMargin: options.rootMargin || '0px'
        });

        const elements = document.querySelectorAll(options.selector);
        elements.forEach(el => observer.observe(el));
        
        this.observers.set(name, observer);
    }

    handleCardAnimation(entry) {
        if (entry.isIntersecting) {
            const delay = entry.target.dataset.aosDelay || 0;
            
            setTimeout(() => {
                entry.target.classList.add('aos-animate');
                
                // Adiciona animação personalizada baseada no tipo
                this.addCustomAnimation(entry.target);
            }, delay);
        }
    }

    handleHeroAnimation(entry) {
        if (entry.isIntersecting) {
            const element = entry.target;
            const delay = Array.from(element.parentNode.children).indexOf(element) * 200;
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    }

    handleSectionAnimation(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
        }
    }

    addCustomAnimation(element) {
        // Animações específicas por tipo de elemento
        if (element.classList.contains('option-card')) {
            this.animateCard(element);
        } else if (element.classList.contains('app-card')) {
            this.animateAppCard(element);
        }
    }

    animateCard(card) {
        const icon = card.querySelector('.card-icon');
        const button = card.querySelector('.card-button');
        
        if (icon) {
            setTimeout(() => {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 300);
            }, 200);
        }

        if (button) {
            setTimeout(() => {
                button.style.animation = 'pulse 1s ease-in-out';
            }, 400);
        }
    }

    animateAppCard(card) {
        const elements = card.querySelectorAll('.app-icon, .app-title, .app-description, .app-button');
        
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }
}

// ============================================
// SCROLL EFFECTS
// ============================================

class ScrollEffects {
    constructor() {
        this.lastScrollY = window.scrollY;
        this.ticking = false;
        this.init();
    }

    init() {
        window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
        this.createParallaxEffects();
    }

    onScroll() {
        if (!this.ticking) {
            requestAnimationFrame(this.updateScrollEffects.bind(this));
            this.ticking = true;
        }
    }

    updateScrollEffects() {
        const scrollY = window.scrollY;
        const scrollDiff = scrollY - this.lastScrollY;

        // Parallax no hero
        this.updateHeroParallax(scrollY);
        
        // Efeito de blur no scroll
        this.updateScrollBlur(scrollY);
        
        // Animação do mentor
        this.updateMentorAnimation(scrollY);

        this.lastScrollY = scrollY;
        this.ticking = false;
    }

    updateHeroParallax(scrollY) {
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            const parallaxSpeed = 0.5;
            heroBackground.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
        }
    }

    updateScrollBlur(scrollY) {
        const hero = document.querySelector('.hero-section');
        if (hero) {
            const blurAmount = Math.min(scrollY / 500, 1) * 3;
            hero.style.filter = `blur(${blurAmount}px)`;
        }
    }

    updateMentorAnimation(scrollY) {
        const mentorImage = document.querySelector('.mentor-image');
        if (mentorImage) {
            const rotation = (scrollY * 0.1) % 360;
            const scale = 1 + (Math.sin(scrollY * 0.01) * 0.05);
            mentorImage.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        }
    }

    createParallaxEffects() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -speed;
                element.style.transform = `translateY(${rate}px)`;
            }, { passive: true });
        });
    }
}

// ============================================
// BUTTON EFFECTS
// ============================================

class ButtonEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addClickEffects();
        this.addHoverEffects();
        this.addMagneticEffect();
    }

    addClickEffects() {
        const buttons = document.querySelectorAll('.hero-cta, .app-button, .card-button, .cta-button');
        
        buttons.forEach(button => {
            button.addEventListener('click', this.createRippleEffect.bind(this));
        });
    }

    createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;

        // Adiciona CSS da animação se não existir
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addHoverEffects() {
        const cards = document.querySelectorAll('.option-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.card-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                }
            });

            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.card-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    addMagneticEffect() {
        const magneticElements = document.querySelectorAll('.hero-cta, .cta-button');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const moveX = x * 0.1;
                const moveY = y * 0.1;
                
                element.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translate(0px, 0px) scale(1)';
            });
        });
    }
}

// ============================================
// DYNAMIC BACKGROUNDS
// ============================================

class DynamicBackgrounds {
    constructor() {
        this.particles = [];
        this.init();
    }

    init() {
        this.createFloatingParticles();
        this.createMouseTrail();
        this.animateGradients();
    }

    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'floating-particles';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 215, 0, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                animation: float ${Math.random() * 20 + 10}s linear infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            particleContainer.appendChild(particle);
        }

        document.body.appendChild(particleContainer);

        // CSS para animação das partículas
        if (!document.querySelector('#particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                @keyframes float {
                    0% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createMouseTrail() {
        let trail = [];
        const maxTrailLength = 10;

        document.addEventListener('mousemove', (e) => {
            trail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
            
            if (trail.length > maxTrailLength) {
                trail.shift();
            }

            this.updateTrail(trail);
        });
    }

    updateTrail(trail) {
        // Remove trail antigo
        document.querySelectorAll('.mouse-trail').forEach(el => el.remove());

        trail.forEach((point, index) => {
            const trailElement = document.createElement('div');
            const opacity = (index / trail.length) * 0.5;
            const size = (index / trail.length) * 20 + 5;

            trailElement.className = 'mouse-trail';
            trailElement.style.cssText = `
                position: fixed;
                left: ${point.x}px;
                top: ${point.y}px;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, rgba(255, 215, 0, ${opacity}) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                transform: translate(-50%, -50%);
                transition: all 0.1s ease-out;
            `;

            document.body.appendChild(trailElement);

            setTimeout(() => {
                trailElement.remove();
            }, 500);
        });
    }

    animateGradients() {
        const gradientElements = document.querySelectorAll('.hero-section, .app-section, .final-cta');
        
        gradientElements.forEach(element => {
            let hue = 0;
            
            setInterval(() => {
                hue = (hue + 1) % 360;
                const filter = `hue-rotate(${hue * 0.1}deg) saturate(1.1)`;
                element.style.filter = filter;
            }, 100);
        });
    }
}

// ============================================
// PERFORMANCE MONITOR
// ============================================

class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.init();
    }

    init() {
        if (this.shouldReduceAnimations()) {
            this.reduceAnimations();
        }
        
        this.monitorFPS();
    }

    shouldReduceAnimations() {
        // Verifica se deve reduzir animações baseado na performance
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return isSlowConnection || isLowEndDevice || prefersReducedMotion;
    }

    reduceAnimations() {
        // Adiciona classe para reduzir animações
        document.documentElement.classList.add('reduced-animations');
        
        // CSS para animações reduzidas
        const style = document.createElement('style');
        style.textContent = `
            .reduced-animations * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
    }

    monitorFPS() {
        const measureFPS = (currentTime) => {
            this.frameCount++;
            
            if (currentTime - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // Se FPS muito baixo, reduz qualidade
                if (this.fps < 30) {
                    this.optimizePerformance();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    optimizePerformance() {
        // Remove partículas se performance baixa
        document.querySelectorAll('.floating-particles').forEach(el => el.remove());
        
        // Reduz blur effects
        document.querySelectorAll('.hero-section').forEach(el => {
            el.style.filter = 'none';
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todos os módulos
    new AnimationObserver();
    new ScrollEffects();
    new ButtonEffects();
    new DynamicBackgrounds();
    new PerformanceMonitor();
    
    // Inicializa elementos do hero com delay
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
    
    // Smooth scroll para links internos
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
    
    console.log('🚀 HTP PRO - Todas as animações inicializadas com sucesso!');
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function para otimização
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

// Throttle function para scroll events
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

// Exporta funções para uso global se necessário
window.HTPAnimations = {
    AnimationObserver,
    ScrollEffects,
    ButtonEffects,
    DynamicBackgrounds,
    PerformanceMonitor,
    debounce,
    throttle
};