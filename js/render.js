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
let stars = [];

// ===== ИНИЦИАЛИЗАЦИЯ ЗВЕЗД =====
function initStars() {
    stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.02 + 0.005,
            alpha: Math.random() * 0.8 + 0.2,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }
}
initStars();

// ===== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ЗАТЕМНЕНИЯ ЦВЕТА =====
function darkenColor(color, factor) {
    if (!color || color.length < 4) return '#333333';
    
    let r, g, b;
    if (color.startsWith('#')) {
        if (color.length === 7) {
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else if (color.length === 4) {
            r = parseInt(color.slice(1, 2), 16) * 17;
            g = parseInt(color.slice(2, 3), 16) * 17;
            b = parseInt(color.slice(3, 4), 16) * 17;
        } else {
            return '#333333';
        }
    } else {
        return '#333333';
    }
    
    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ============================================================
// ===== ОТРИСОВКА ФОНА =====
// ============================================================
function drawBackground() {
    // Тёмный фон с градиентом
    const grad = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, HEIGHT);
    grad.addColorStop(0, '#0a0a2a');
    grad.addColorStop(0.5, '#07071a');
    grad.addColorStop(1, '#03050a');
    ctx.fillStyle = grad;
    ctx.shadowBlur = 0;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Звезды
    for (const star of stars) {
        star.alpha += star.speed * star.direction;
        if (star.alpha > 0.9 || star.alpha < 0.1) star.direction *= -1;
        
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Динамическая сетка (перспективная)
    const gridSize = 60;
    const offset = Date.now() * 0.00008;
    
    // Горизонтальные линии
    for (let i = 0; i <= 25; i++) {
        const x = (i / 25) * WIDTH + offset * 5 % (WIDTH / 25);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + WIDTH * 0.3, HEIGHT);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.015 + 0.015 * Math.sin(i * 0.5 + offset * 2)})`;
        ctx.lineWidth = 0.5;
        ctx.shadowBlur = 0;
        ctx.stroke();
    }

    // Вертикальные линии
    for (let i = 0; i <= 25; i++) {
        const y = (i / 25) * HEIGHT + offset * 8 % (HEIGHT / 25);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y + HEIGHT * 0.3);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.015 + 0.015 * Math.cos(i * 0.5 + offset * 2)})`;
        ctx.lineWidth = 0.5;
        ctx.shadowBlur = 0;
        ctx.stroke();
    }

    // Центральный ореол
    const glow = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, HEIGHT/1.2);
    glow.addColorStop(0, 'rgba(0, 255, 255, 0.03)');
    glow.addColorStop(0.5, 'rgba(0, 255, 255, 0.01)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.shadowBlur = 0;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Границы арены
    const pad = 30;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.strokeRect(pad, pad, WIDTH - pad * 2, HEIGHT - pad * 2);
    
    // Внутренняя рамка
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.02)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(pad + 10, pad + 10, WIDTH - pad * 2 - 20, HEIGHT - pad * 2 - 20);
}

// ============================================================
// ===== ОТРИСОВКА ПЕРСОНАЖА =====
// ============================================================
function drawPlayer(player) {
    if (!player || !player.alive) return;

    const x = player.x;
    const y = player.y;
    const r = player.radius;
    const color = player.color;
    const isMoving = player.isMoving;

    ctx.save();

    // ===== СЛЕД ЗА ИГРОКОМ =====
    if (player.trail && player.trail.length > 1) {
        for (let i = 0; i < player.trail.length - 1; i++) {
            const alpha = (i / player.trail.length) * 0.25;
            const size = r * (0.2 + 0.8 * (i / player.trail.length));
            const t = player.trail[i];
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 0;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // ===== НЕОНОВЫЙ ОРЕОЛ =====
    const glowSize = r * 5 + 20 * Math.sin(player.pulse);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    const alpha = 0.25 + 0.15 * Math.sin(player.pulse);
    const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, '0');
    glow.addColorStop(0, color + hexAlpha);
    glow.addColorStop(0.3, color + '30');
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    ctx.fill();

    // ===== КОРПУС (основа) =====
    ctx.shadowBlur = 35;
    ctx.shadowColor = color;
    
    // Основной круг с градиентом
    const bodyGrad = ctx.createRadialGradient(
        x - r * 0.3, y - r * 0.3, 0,
        x, y, r
    );
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.15, color);
    bodyGrad.addColorStop(0.7, darkenColor(color, 0.5));
    bodyGrad.addColorStop(1, darkenColor(color, 0.2));
    
    ctx.fillStyle = player.hitFlash > 0 ? '#ffffff' : bodyGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // ===== ВНУТРЕННИЙ КРУГ (пульсирующий) =====
    const pulseR = r * (0.35 + 0.2 * Math.sin(player.pulse));
    ctx.shadowBlur = 0;
    const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, pulseR);
    innerGrad.addColorStop(0, 'rgba(0,0,0,0.05)');
    innerGrad.addColorStop(0.5, 'rgba(0,0,0,0.2)');
    innerGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(x, y, pulseR, 0, Math.PI * 2);
    ctx.fill();

    // ===== ПАНЕЛЬ УПРАВЛЕНИЯ (неоновые линии) =====
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = 0.5;
    
    // Горизонтальная линия
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y);
    ctx.lineTo(x + r * 0.7, y);
    ctx.stroke();
    
    // Вертикальная линия
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.7);
    ctx.lineTo(x, y + r * 0.7);
    ctx.stroke();
    
    // Диагональные линии
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.5, y - r * 0.5);
    ctx.lineTo(x + r * 0.5, y + r * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + r * 0.5, y - r * 0.5);
    ctx.lineTo(x - r * 0.5, y + r * 0.5);
    ctx.stroke();
    
    ctx.globalAlpha = 1;

    // ===== НАПРАВЛЕНИЕ (стрелка) =====
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    const angle = player.direction;
    const tipDist = r * 1.5;
    const tipX = x + Math.cos(angle) * tipDist;
    const tipY = y + Math.sin(angle) * tipDist;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(x + Math.cos(angle + 2.4) * r * 0.7, y + Math.sin(angle + 2.4) * r * 0.7);
    ctx.lineTo(x + Math.cos(angle - 2.4) * r * 0.7, y + Math.sin(angle - 2.4) * r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // ===== БРОНЯ (кольца) =====
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.25;
    
    for (let i = 0; i < 3; i++) {
        const ringR = r * (0.55 + i * 0.18);
        const rot = player.pulse + i * 1.2;
        ctx.beginPath();
        ctx.arc(x, y, ringR, rot, rot + Math.PI * 1.3);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // ===== ЩИТ =====
    if (player.shieldActive) {
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#00ffff';
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(player.pulse * 2);
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Вращающиеся сегменты щита
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        for (let i = 0; i < 6; i++) {
            const a = player.pulse * 2 + i * Math.PI / 3;
            ctx.beginPath();
            ctx.arc(x, y, r * 2.2, a, a + 0.3);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    // ===== УСКОРЕНИЕ =====
    if (player.boostActive) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffcc00';
        // Трассы ускорения
        for (let i = 0; i < 3; i++) {
            const a = player.direction + Math.PI + (i - 1) * 0.25;
            const dist = r + 10 + i * 7;
            ctx.globalAlpha = 0.2 - i * 0.05;
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(
                x + Math.cos(a) * dist,
                y + Math.sin(a) * dist,
                4 - i,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // ===== ИМЯ И ПОЗЫВНОЙ =====
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.font = 'bold 13px "Orbitron", "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(player.name, x, y - r - 16);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '8px "Orbitron", "Courier New", monospace';
    ctx.textBaseline = 'bottom';
    ctx.shadowBlur = 5;
    ctx.shadowColor = 'rgba(255,255,255,0.1)';
    if (player.callSign) {
        ctx.fillText('『' + player.callSign + '』', x, y - r - 28);
    }

    // ===== УРОВЕНЬ =====
    if (player.level && player.level > 1) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = '9px "Orbitron", "Courier New", monospace';
        ctx.textBaseline = 'bottom';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffcc00';
        ctx.fillText(`★ Lv.${player.level}`, x, y - r - 40);
    }

    // ===== ИНДИКАТОР ЗДОРОВЬЯ НАД ГОЛОВОЙ =====
    const healthWidth = r * 2.5;
    const healthX = x - healthWidth / 2;
    const healthY = y - r - 52;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(healthX, healthY, healthWidth, 3);
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = healthPercent > 0.3 ? color : '#ff0044';
    ctx.shadowBlur = 5;
    ctx.shadowColor = healthPercent > 0.3 ? color : '#ff0044';
    ctx.fillRect(healthX, healthY, healthWidth * healthPercent, 3);
    ctx.shadowBlur = 0;

    ctx.restore();
}

// ============================================================
// ===== ОТРИСОВКА ДИСКА =====
// ============================================================
function drawDisc(disc) {
    if (!disc || !disc.alive) return;

    const x = disc.x;
    const y = disc.y;
    const r = disc.radius;

    ctx.save();

    // След
    if (disc.trail && disc.trail.length > 0) {
        for (let i = 0; i < disc.trail.length; i++) {
            const alpha = (i / disc.trail.length) * 0.35;
            const size = r * (0.2 + 0.8 * (i / disc.trail.length));
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 0;
            ctx.fillStyle = disc.color;
            ctx.beginPath();
            ctx.arc(disc.trail[i].x, disc.trail[i].y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Неоновый ореол
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
    glow.addColorStop(0, disc.color + '60');
    glow.addColorStop(0.3, disc.color + '20');
    glow.addColorStop(1, disc.color + '00');
    ctx.fillStyle = glow;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, r * 6, 0, Math.PI * 2);
    ctx.fill();

    // Основной диск
    ctx.shadowBlur = 40;
    ctx.shadowColor = disc.color;
    
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.15, disc.color);
    grad.addColorStop(0.7, darkenColor(disc.color, 0.5));
    grad.addColorStop(1, darkenColor(disc.color, 0.2));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Внутренний круг
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Спицы
    ctx.shadowBlur = 8;
    ctx.shadowColor = disc.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        const a = disc.rotation + i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25);
        ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
        ctx.stroke();
    }

    // Внешняя обводка
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.98, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}

// ============================================================
// ===== ЭФФЕКТЫ =====
// ============================================================

function createExplosion(x, y, color, count = 60) {
    // Основные частицы
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 3;
        const colors = [color, '#ffffff', '#ffcc00', '#ff4400'];
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            life: 1.0,
            maxLife: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 2,
            gravity: 0.03,
            trail: []
        });
    }

    // Ударная волна
    shockwaves.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: 100,
        life: 1.0,
        color: color
    });

    // Искры
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 20 + 5;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            life: 0.5,
            maxLife: 0.5,
            color: '#ffffff',
            size: Math.random() * 3 + 1,
            gravity: 0.1,
            trail: []
        });
    }
}

function createFirework(x, y, color) {
    const count = 80;
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 3;
        const colors = [color, '#00ffff', '#ff00ff', '#ffcc00', '#ffffff'];
        fireworks.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            life: 1.0,
            maxLife: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2,
            gravity: 0.05,
            trail: []
        });
    }
}

// ============================================================
// ===== ОБНОВЛЕНИЕ ЭФФЕКТОВ =====
// ============================================================

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
        
        if (p.trail) {
            p.trail.push({x: p.x, y: p.y});
            if (p.trail.length > 5) p.trail.shift();
        }
        
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
        
        if (f.trail) {
            f.trail.push({x: f.x, y: f.y});
            if (f.trail.length > 10) f.trail.shift();
        }
        
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

// ============================================================
// ===== ОТРИСОВКА ЭФФЕКТОВ =====
// ============================================================

function drawEffects() {
    // Частицы
    for (const p of particles) {
        ctx.globalAlpha = p.life * 0.9;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        
        const size = p.size * (0.3 + 0.7 * (p.life / p.maxLife));
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // След частицы
        if (p.trail && p.trail.length > 1) {
            for (let j = 0; j < p.trail.length - 1; j++) {
                const alpha = (j / p.trail.length) * 0.2 * p.life;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 0;
                const t = p.trail[j];
                ctx.beginPath();
                ctx.arc(t.x, t.y, size * 0.3 * (j / p.trail.length), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Фейерверки
    for (const f of fireworks) {
        ctx.globalAlpha = f.life * 0.9;
        ctx.shadowBlur = 25;
        ctx.shadowColor = f.color;
        ctx.fillStyle = f.color;
        const size = f.size * f.life;
        ctx.beginPath();
        ctx.arc(f.x, f.y, size, 0, Math.PI * 2);
        ctx.fill();

        // След фейерверка
        if (f.trail && f.trail.length > 1) {
            for (let j = 0; j < f.trail.length; j++) {
                const alpha = (j / f.trail.length) * 0.3 * f.life;
                ctx.globalAlpha = alpha;
                ctx.shadowBlur = 0;
                ctx.fillStyle = f.color;
                const t = f.trail[j];
                const s = size * 0.3 * (j / f.trail.length);
                ctx.beginPath();
                ctx.arc(t.x, t.y, s, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Ударные волны
    for (const sw of shockwaves) {
        ctx.globalAlpha = sw.life * 0.4;
        ctx.shadowBlur = 40;
        ctx.shadowColor = sw.color;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 3 * sw.life;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Вторая волна (внутренняя)
        ctx.globalAlpha = sw.life * 0.15;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Третья волна (внешняя)
        ctx.globalAlpha = sw.life * 0.1;
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 1.4, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

// ============================================================
// ===== ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ =====
// ============================================================

function render(game) {
    if (!game) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Фон
    drawBackground();
    
    // Эффекты (под игроками)
    drawEffects();

    // Диски
    if (game.discs) {
        for (const disc of game.discs) {
            drawDisc(disc);
        }
    }
    
    // Игроки
    if (game.players) {
        for (const player of game.players) {
            drawPlayer(player);
        }
    }

    // Пауза
    if (game.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 0;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 48px "Orbitron", "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#00ffff';
        ctx.fillText('⏸ ПАУЗА', WIDTH/2, HEIGHT/2);
        ctx.shadowBlur = 0;
    }

    // Обновляем эффекты
    updateEffects();
}

// ===== ЭКСПОРТ ФУНКЦИЙ ДЛЯ ДРУГИХ ФАЙЛОВ =====
window.createExplosion = createExplosion;
window.createFirework = createFirework;
window.particles = particles;
window.fireworks = fireworks;
window.shockwaves = shockwaves;
