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

// ===== ОТРИСОВКА ФОНА =====
function drawBackground() {
    // Тёмный фон с сеткой
    ctx.fillStyle = '#03050a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Сетка
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
    }

    // Центральная арена (подсветка)
    const grad = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, 0, WIDTH/2, HEIGHT/2, HEIGHT/2);
    grad.addColorStop(0, 'rgba(0, 255, 255, 0.03)');
    grad.addColorStop(0.5, 'rgba(0, 255, 255, 0.01)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Границы арены
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);
}

// ===== ОТРИСОВКА ИГРОКА =====
function drawPlayer(player) {
    if (!player.alive) return;

    const x = player.x;
    const y = player.y;
    const r = player.radius;
    const color = player.color;

    ctx.save();

    // Свечение
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    glow.addColorStop(0, color + '80');
    glow.addColorStop(1, color + '00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Тело игрока
    if (player.hitFlash > 0) {
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
    } else {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Внутренний круг (пульсирует)
    const pulse = 0.7 + 0.3 * Math.sin(player.pulse);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, r * pulse * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Направление (треугольник)
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const angle = player.direction;
    ctx.moveTo(x + Math.cos(angle) * r * 1.1, y + Math.sin(angle) * r * 1.1);
    ctx.lineTo(x + Math.cos(angle + 2.5) * r * 0.5, y + Math.sin(angle + 2.5) * r * 0.5);
    ctx.lineTo(x + Math.cos(angle - 2.5) * r * 0.5, y + Math.sin(angle - 2.5) * r * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Имя игрока
    ctx.fillStyle = color;
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
    ctx.fillText(player.name, x, y - r - 16);
    ctx.shadowBlur = 0;
}

// ===== ОТРИСОВКА ДИСКА =====
function drawDisc(disc) {
    if (!disc.alive) return;

    const x = disc.x;
    const y = disc.y;
    const r = disc.radius;

    ctx.save();

    // След диска
    for (let i = 0; i < disc.trail.length; i++) {
        const alpha = i / disc.trail.length * 0.3;
        const size = r * (0.3 + 0.7 * (i / disc.trail.length));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = disc.color;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(disc.trail[i].x, disc.trail[i].y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Свечение диска
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    glow.addColorStop(0, disc.color + '60');
    glow.addColorStop(1, disc.color + '00');
    ctx.fillStyle = glow;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // Сам диск
    ctx.shadowBlur = 30;
    ctx.shadowColor = disc.color;
    ctx.fillStyle = disc.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Вращающийся внутренний круг
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Спицы (вращаются)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        const a = disc.rotation + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3);
        ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
        ctx.stroke();
    }

    ctx.restore();
}

// ===== ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ =====
function render(game) {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    drawBackground();
    
    // Отрисовка дисков
    for (const disc of game.discs) {
        drawDisc(disc);
    }
    
    // Отрисовка игроков
    for (const player of game.players) {
        drawPlayer(player);
    }

    // Если игра на паузе
    if (game.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffffff';
        ctx.fillText('⏸ ПАУЗА', WIDTH/2, HEIGHT/2);
        ctx.shadowBlur = 0;
    }
}
