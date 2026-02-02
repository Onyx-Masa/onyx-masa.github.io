// Matrix Rain Effect
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrix-rain');
        this.ctx = this.canvas.getContext('2d');
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];
        
        this.init();
        this.animate();
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.ctx.fillText(char, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    resize() {
        this.init();
    }
}

// Game System
class PortfolioGame {
    constructor() {
        this.currentSection = 'home';
        this.unlockedSections = ['home'];
        this.progress = 0;
        this.checkpoints = ['home', 'about', 'skills', 'projects', 'contact'];
        this.sectionProgress = {
            home: true,
            about: false,
            skills: false,
            projects: false,
            contact: false
        };
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupCheckpointNavigation();
        this.setupScrollListener(); // Add scroll listener as backup
        this.updateProgress(); // Initial progress update
        this.updateHUD();
        
        // Force initial progress update after a short delay
        setTimeout(() => {
            this.updateProgress();
        }, 1000);
    }
    
    setupScrollListener() {
        let ticking = false;
        
        const checkSections = () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
                    const sectionId = section.id;
                    if (sectionId && !this.sectionProgress[sectionId]) {
                        this.unlockSection(sectionId);
                    }
                    this.currentSection = sectionId;
                    this.updateHUD();
                }
            });
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(checkSections);
                ticking = true;
            }
        });
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: 0.3,
            rootMargin: '-50px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    console.log('Section in view:', sectionId); // Debug log
                    this.unlockSection(sectionId);
                    this.currentSection = sectionId;
                    this.updateHUD();
                }
            });
        }, options);
        
        // Make sure we're observing all sections
        const sections = document.querySelectorAll('section[id]');
        console.log('Observing sections:', sections.length); // Debug log
        sections.forEach(section => {
            console.log('Observing section:', section.id); // Debug log
            observer.observe(section);
        });
    }
    
    unlockSection(sectionId) {
        if (!this.sectionProgress[sectionId]) {
            this.sectionProgress[sectionId] = true;
            this.showUnlockAnimation(sectionId);
            this.updateProgress();
            
            // Unlock section visually
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('section-locked');
                section.classList.add('section-unlocked');
            }
            
            // Update checkpoint
            const checkpoint = document.querySelector(`[data-target="${sectionId}"]`);
            if (checkpoint) {
                checkpoint.setAttribute('data-unlocked', 'true');
            }
        }
    }
    
    showUnlockAnimation(sectionId) {
        const section = document.getElementById(sectionId);
        const unlockAnimation = section.querySelector('.unlock-animation');
        
        if (unlockAnimation) {
            unlockAnimation.classList.add('show');
            
            // Play unlock sound effect (if you want to add audio)
            this.playUnlockSound();
            
            setTimeout(() => {
                unlockAnimation.classList.remove('show');
            }, 3000);
        }
    }
    
    playUnlockSound() {
        // You can add audio here if desired
        // const audio = new Audio('unlock-sound.mp3');
        // audio.play();
    }
    
    updateProgress() {
        const unlockedCount = Object.values(this.sectionProgress).filter(Boolean).length;
        this.progress = (unlockedCount / this.checkpoints.length) * 100;
        
        console.log('Progress update:', this.progress, 'Unlocked:', unlockedCount, 'Total:', this.checkpoints.length); // Debug log
        
        const progressBar = document.querySelector('.progress-fill-hud');
        const progressText = document.getElementById('progress-percent');
        
        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
            console.log('Progress bar updated to:', this.progress + '%'); // Debug log
        } else {
            console.log('Progress bar not found!'); // Debug log
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.progress)}%`;
            console.log('Progress text updated to:', Math.round(this.progress) + '%'); // Debug log
        } else {
            console.log('Progress text not found!'); // Debug log
        }
    }
    
    setupCheckpointNavigation() {
        document.querySelectorAll('.checkpoint').forEach(checkpoint => {
            checkpoint.addEventListener('click', () => {
                const target = checkpoint.getAttribute('data-target');
                const isUnlocked = checkpoint.getAttribute('data-unlocked') === 'true';
                
                if (isUnlocked) {
                    this.scrollToSection(target);
                } else {
                    this.showLockedMessage();
                }
            });
        });
    }
    
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    showLockedMessage() {
        // Create a temporary message
        const message = document.createElement('div');
        message.textContent = 'CHECKPOINT LOCKED - EXPLORE TO UNLOCK';
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 2s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 2000);
    }
    
    updateHUD() {
        // Update any HUD elements based on current section
        document.querySelectorAll('.checkpoint').forEach(checkpoint => {
            const target = checkpoint.getAttribute('data-target');
            if (target === this.currentSection) {
                checkpoint.style.background = 'rgba(0, 255, 65, 0.2)';
            } else {
                checkpoint.style.background = 'transparent';
            }
        });
    }
}

// Loading Screen
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.init();
    }
    
    init() {
        setTimeout(() => {
            this.hide();
        }, 4000);
    }
    
    hide() {
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Skill Bar Animations
class SkillAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSkillBars(entry.target);
                }
            });
        }, { 
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.skills').forEach(section => {
            observer.observe(section);
        });
        
        // Also trigger on scroll for mobile
        let skillsAnimated = false;
        window.addEventListener('scroll', () => {
            if (!skillsAnimated) {
                const skillsSection = document.querySelector('.skills');
                if (skillsSection) {
                    const rect = skillsSection.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        this.animateSkillBars(skillsSection);
                        skillsAnimated = true;
                    }
                }
            }
        });
    }
    
    animateSkillBars(skillsSection) {
        const skillBars = skillsSection.querySelectorAll('.skill-progress');
        
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.getAttribute('data-width');
                if (width) {
                    bar.style.width = `${width}%`;
                    bar.style.transition = 'width 1.5s ease-out';
                }
            }, index * 150);
        });
    }
}

// Counter Animations
class CounterAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounters(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        document.querySelectorAll('.about').forEach(section => {
            observer.observe(section);
        });
    }
    
    animateCounters(aboutSection) {
        const counters = aboutSection.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }
}

// Global Functions
function startMission() {
    document.getElementById('about').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Glitch Effect for Text
function addGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch-text');
    
    glitchElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.animation = 'none';
            setTimeout(() => {
                element.style.animation = '';
            }, 10);
        });
    });
}

// Navbar Scroll Effect
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const gameHud = document.querySelector('.game-hud');
        
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            gameHud.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.8)';
            gameHud.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    });
}

// Terminal Typing Effect
function setupTerminalEffects() {
    const commands = document.querySelectorAll('.typing-effect, .typing-effect-2, .typing-effect-3');
    
    commands.forEach((command, index) => {
        const text = command.textContent;
        command.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeInterval = setInterval(() => {
                command.textContent += text[i];
                i++;
                if (i >= text.length) {
                    clearInterval(typeInterval);
                }
            }, 100);
        }, (index + 1) * 2000);
    });
}

// Image Loading Handler
function loadProfileImage() {
    const img = document.querySelector('.profile-image');
    const fallback = document.querySelector('.profile-fallback');
    
    // Try different possible paths
    const possiblePaths = [
        'static/uploads/a196f554-0403-4c22-997a-ed3e8edeaf01.jpg',
        './static/uploads/a196f554-0403-4c22-997a-ed3e8edeaf01.jpg',
        'a196f554-0403-4c22-997a-ed3e8edeaf01.jpg',
        './a196f554-0403-4c22-997a-ed3e8edeaf01.jpg'
    ];
    
    let currentIndex = 0;
    
    function tryNextPath() {
        if (currentIndex < possiblePaths.length) {
            console.log('Trying image path:', possiblePaths[currentIndex]);
            img.src = possiblePaths[currentIndex];
            currentIndex++;
        } else {
            console.log('All image paths failed, showing fallback');
            img.style.display = 'none';
            if (fallback) {
                fallback.style.display = 'flex';
            }
        }
    }
    
    img.onload = function() {
        console.log('Image loaded successfully:', this.src);
        this.style.display = 'block';
        if (fallback) {
            fallback.style.display = 'none';
        }
    };
    
    img.onerror = function() {
        console.log('Image failed to load:', this.src);
        tryNextPath();
    };
    
    // Start trying paths
    tryNextPath();
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Matrix Rain
    const matrixRain = new MatrixRain();
    
    // Initialize Loading Screen
    const loadingScreen = new LoadingScreen();
    
    // Initialize Game System
    const portfolioGame = new PortfolioGame();
    
    // Initialize Animations
    const skillAnimations = new SkillAnimations();
    const counterAnimations = new CounterAnimations();
    
    // Load Profile Image
    loadProfileImage();
    
    // Setup Effects
    addGlitchEffect();
    setupNavbarScroll();
    setupTerminalEffects();
    
    // Handle Window Resize
    window.addEventListener('resize', () => {
        matrixRain.resize();
    });
    
    // Add CSS for fadeInOut animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
});

// Easter Eggs and Special Effects
document.addEventListener('keydown', (e) => {
    // Konami Code Easter Egg
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.code === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            activateHackerMode();
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
});

function activateHackerMode() {
    document.body.style.filter = 'hue-rotate(180deg)';
    
    const message = document.createElement('div');
    message.textContent = 'HACKER MODE ACTIVATED';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 255, 0.9);
        color: white;
        padding: 30px;
        border-radius: 8px;
        font-family: 'Orbitron', monospace;
        font-weight: bold;
        font-size: 2rem;
        z-index: 10000;
        animation: glitch-1 0.5s infinite;
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        document.body.removeChild(message);
        document.body.style.filter = '';
    }, 3000);
}