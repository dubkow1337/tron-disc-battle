// ===== ОТРИСОВКА =====

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let WIDTH, HEIGHT;

function resizeCanvas() {
    WIDTH = canvas.width = window.innerWidth;
    HEIGHT = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===== ГЛОБАЛЬНЫЕ МАССИВЫ ДЛЯ ЭФФЕКТОВ =====
let particles = [];
let fireworks = [];
let shockwaves = [];
let trailEffects = [];

// ===== ОТРИСОВКА ФОНА =====
function drawBackground() {
    // Тёмный фон
    const grad = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, HEIGHT);
    grad.addColorStop(0, '#0a0a2a');
    grad.addColorStop(1, '#03050a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Неоновая сетка (перспективная)
    drawNeonGrid();

    // Центральное свечение
    const glow = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, HEIGHT/1.5);
    glow.addColorStop(0, 'rgba(0, 255, 255, 0.03)');
    glow.addColorStop(0.5, 'rgba(0, 255, 255, 0.01)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Границы арены
    const pad = 30;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.strokeRect(pad, pad, WIDTH - pad * 2, HEIGHT - pad * 2);
}

function drawNeonGrid() {
    const gridSize = 50;
    const perspective = 0.3;

    for (let i = 0; i <= 20; i++) {
        const x = (i / 20) * WIDTH;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + WIDTH * perspective, HEIGHT);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.03 + 0.02 * (i / 20)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    for (let i = 0; i <= 20; i++) {
        const y = (i / 20) * HEIGHT;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y + HEIGHT * perspective);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.03 + 0.02 * (i / 20)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
}

// ===== ОТРИСОВКА ИГРОКА С НЕОНОМ =====
function drawPlayer(player) {
    if (!player || !player.alive) return;

    const x = player.x;
    const y = player.y;
    const r = player.radius;
    const color = player.color;

    ctx.save();

    // ===== НЕОНОВОЕ СВЕЧЕНИЕ =====
    const glowRadius = r * 4 + 10 * Math.sin(Date.now() * 0.003 + player.id);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    glow.addColorStop(0, color + '40');
    glow.addColorStop(0.3, color + '20');
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // ===== ОСНОВНОЙ КРУГ =====
    if (player.hitFlash > 0) {
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
    } else {
        ctx.shadowBlur = 30;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // ===== ВНУТРЕННИЙ КРУГ (пульсирует) =====
    const pulse = 0.5 + 0.3 * Math.sin(player.pulse);
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(0, 0, 0, ${0.2 + 0.3 * pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.5 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // ===== НАПРАВЛЕНИЕ =====
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const angle = player.direction;
    const tipX = x + Math.cos(angle) * r * 1.3;
    const tipY = y + Math.sin(angle) * r * 1.3;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(x + Math.cos(angle + 2.3) * r * 0.7, y + Math.sin(angle + 2.3) * r * 0.7);
    ctx.lineTo(x + Math.cos(angle - 2.3) * r * 0.7, y + Math.sin(angle - 2.3) * r * 0.7);
    ctx.closePath();
    ctx.fill();

    // ===== ИМЯ =====
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = '12px "Orbitron", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(player.name, x, y - r - 12);

    ctx.restore();
}

// ===== ОТРИСОВКА ДИСКА С НЕОНОМ =====
function drawDisc(disc) {
    if (!disc || !disc.alive) return;

    const x = disc.x;
    const y = disc.y;
    const r = disc.radius;

    ctx.save();

    // ===== СЛЕД ДИСКА =====
    for (let i = 0; i < disc.trail.length; i++) {
        const alpha = (i / disc.trail.length) * 0.3;
        const size = r * (0.2 + 0.8 * (i / disc.trail.length));
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 0;
        ctx.fillStyle = disc.color;
        ctx.beginPath();
        ctx.arc(disc.trail[i].x, disc.trail[i].y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ===== НЕОНОВОЕ СВЕЧЕНИЕ ДИСКА =====
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
    glow.addColorStop(0, disc.color + '50');
    glow.addColorStop(0.5, disc.color + '20');
    glow.addColorStop(1, disc.color + '00');
    ctx.fillStyle = glow;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, r * 5, 0, Math.PI * 2);
    ctx.fill();

    // ===== САМ ДИСК =====
    ctx.shadowBlur = 30;
    ctx.shadowColor = disc.color;
    ctx.fillStyle = disc.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // ===== ВНУТРЕННЯЯ ЧАСТЬ =====
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // ===== ВРАЩАЮЩИЕСЯ СПИЦЫ =====
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
        const a = disc.rotation + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3);
        ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
        ctx.stroke();
    }

    // ===== ВНЕШНЯЯ ОБВОДКА =====
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.95, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

// ===== ЭФФЕКТЫ СТОЛКНОВЕНИЯ =====
function createExplosion(x, y, color, count = 60) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        const colors = [color, '#ffffff', '#ffcc00', color];
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            maxLife: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 6 + 2,
            gravity: 0.05
        });
    }

    // Ударная волна
    shockwaves.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 80,
        life: 1.0,
        color: color
    });
}

function createFirework(x, y, color) {
    const count = 80;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 3;
        const colors = [color, '#00ffff', '#ff00ff', '#ffcc00', '#ffffff'];
        fireworks.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            life: 1.0,
            maxLife: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2,
            gravity: 0.08,
            trail: []
        });
    }
}

// ===== ОБНОВЛЕНИЕ ЭФФЕКТОВ =====
function updateEffects() {
    // Частицы
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.02;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= 0.015;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Фейерверки
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += f.gravity || 0.05;
        f.vx *= 0.99;
        f.vy *= 0.99;
        f.life -= 0.01;
        
        f.trail.push({ x: f.x, y: f.y });
        if (f.trail.length > 10) f.trail.shift();
        
        if (f.life <= 0) {
            fireworks.splice(i, 1);
        }
    }

    // Ударные волны
    for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 3;
        sw.life -= 0.025;
        if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
            shockwaves.splice(i, 1);
        }
    }
}

// ===== ОТРИСОВКА ЭФФЕКТОВ =====
function drawEffects() {
    // Частицы
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }

    // Фейерверки
    for (const f of fireworks) {
        ctx.globalAlpha = f.life;
        ctx.shadowBlur = 20;
        ctx.shadowColor = f.color;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * f.life, 0, Math.PI * 2);
        ctx.fill();

        // След
        for (let i = 0; i < f.trail.length; i++) {
            const alpha = (i / f.trail.length) * 0.3 * f.life;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 0;
            ctx.fillStyle = f.color;
            const t = f.trail[i];
            ctx.beginPath();
            ctx.arc(t.x, t.y, f.size * 0.3 * (i / f.trail.length), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Ударные волны
    for (const sw of shockwaves) {
        ctx.globalAlpha = sw.life * 0.5;
        ctx.shadowBlur = 30;
        ctx.shadowColor = sw.color;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3 * sw.life;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Вторая волна
        ctx.globalAlpha = sw.life * 0.2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ===== ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ =====
function render(game) {
    if (!game) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Фон
    drawBackground();
    
    // Эффекты (под игроками)
    drawEffects();

    // Диски
    for (const disc of game.discs || []) {
        drawDisc(disc);
    }
    
    // Игроки
    for (const player of game.players || []) {
        drawPlayer(player);
    }

    // Сообщения на экране
    if (game.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px "Orbitron", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#00ffff';
        ctx.fillText('⏸ ПАУЗА', WIDTH/2, HEIGHT/2);
        ctx.shadowBlur = 0;
    }

    updateEffects();
}

// ===== ЭКСПОРТ ФУНКЦИЙ =====
window.createExplosion = createExplosion;
window.createFirework = createFirework;
