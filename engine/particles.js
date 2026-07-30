class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ambient-particles';
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 120; // Increased density
        // Warmer, brighter revolution embers palette
        this.colors = ['#ff595e', '#ffca3a', '#ff924c', '#ff3366', '#ffffff'];

        this.init();
    }

    init() {
        // Setup canvas styles
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        document.body.prepend(this.canvas);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize initial particles
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle(true));
        }

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(randomY = false) {
        // Focus density towards the left (0-25%) and right (75-100%) margins
        let x;
        if (Math.random() > 0.5) {
            x = Math.random() * (this.canvas.width * 0.25);
        } else {
            x = this.canvas.width * 0.75 + Math.random() * (this.canvas.width * 0.25);
        }

        return {
            x: x,
            y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 10,
            size: Math.random() * 2 + 1, // 1px to 3px
            speedY: Math.random() * 1.5 + 0.5, // Faster drift: 0.5 to 2.0 pixels/frame
            speedX: (Math.random() - 0.5) * 0.5,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            opacity: Math.random() * 0.5 + 0.5, // Brighter opacity range (0.5 to 1.0)
            life: 0,
            maxLife: Math.random() * 1000 + 1000, // Increased lifespan to reach the top
            sway: Math.random() * Math.PI * 2, // Initial offset for Math.sin
            swaySpeed: Math.random() * 0.02 + 0.01
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Movement
            p.y -= p.speedY;
            p.sway += p.swaySpeed;
            p.x += Math.sin(p.sway) * 0.5 + p.speedX;
            p.life++;

            // Fade out towards the end of life or top of screen
            let currentOpacity = p.opacity;
            if (p.life > p.maxLife * 0.8) {
                currentOpacity = p.opacity * (1 - (p.life - p.maxLife * 0.8) / (p.maxLife * 0.2));
            }
            if (p.y < this.canvas.height * 0.1) {
                currentOpacity *= (p.y / (this.canvas.height * 0.1));
            }

            // Draw particle
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = Math.max(0, currentOpacity);
            this.ctx.globalCompositeOperation = 'screen'; // Creates a slight glowing effect
            this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
            this.ctx.globalAlpha = 1.0;
            this.ctx.globalCompositeOperation = 'source-over';

            // Reset particle if it goes off screen or dies
            if (p.life >= p.maxLife || p.y < -10) {
                this.particles[i] = this.createParticle(false);
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
