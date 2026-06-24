// ===== game.js =====

class Game {
    constructor() {
        this.players = [];
        this.discs = [];
        this.ai = null;
        this.mode = '1p';
        this.paused = false;
        this.gameOver = false;
        this.winner = null;
        this.frameCount = 0;
        this.keys = {};
        this.maxScore = 5;
        this.rounds = 0;
        this.initialized = false; // 👈 Добавляем флаг
    }

    // Инициализация
    init(mode) {
        this.mode = mode;
        this.discs = [];
        this.gameOver = false;
        this.winner = null;
        this.frameCount = 0;
        
        // Создаем игроков
        this.players = [
            new Player(1, 'PLAYER 1', '#00ffff', WIDTH * 0.25, HEIGHT * 0.5),
            new Player(2, 'PLAYER 2', '#ff6600', WIDTH * 0.75, HEIGHT * 0.5)
        ];
        
        this.initialized = true; // 👈 Помечаем, что игра готова
        
        // Если режим 1p, добавляем ИИ
        if (mode === '1p') {
            this.ai = new AIController('medium');
            this.players[1].name = 'AI';
            this.players[1].color = '#ff44ff';
        } else {
            this.ai = null;
        }
        
        this.paused = false;
        this.rounds = 0;
        
        // Обновляем HUD
        updateHUD(this.players);
        showScreen(gameScreen);
    }

    // ============================================================
    // ===== ИСПРАВЛЕННЫЙ МЕТОД ОБРАБОТКИ ВВОДА =====
    // ============================================================
    handleInput() {
        // ===== ПРОВЕРКА: Инициализирована ли игра =====
        if (!this.initialized || !this.players || this.players.length === 0) {
            return;
        }

        // ===== ПРОВЕРКА: Существует ли игрок 1 =====
        const p1 = this.players[0];
        if (!p1) {
            console.warn('Игрок 1 не найден');
            return;
        }

        // ===== ПРОВЕРКА: Существует ли игрок 2 =====
        const p2 = this.players[1];
        if (!p2) {
            console.warn('Игрок 2 не найден');
            return;
        }

        // ===== ТЕПЕРЬ БЕЗОПАСНО РАБОТАЕМ С ИГРОКАМИ =====
        
        // Игрок 1: WASD + Space
        if (p1.alive) {
            let dx = 0, dy = 0;
            if (this.keys['w'] || this.keys['W']) dy = -1;
            if (this.keys['s'] || this.keys['S']) dy = 1;
            if (this.keys['a'] || this.keys['A']) dx = -1;
            if (this.keys['d'] || this.keys['D']) dx = 1;
            
            if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
            }
            p1.move(dx, dy);
            
            if ((this.keys[' '] || this.keys['Space']) && p1.canThrow()) {
                // Целимся во второго игрока
                const target = p2.alive ? p2 : { x: p1.x + 100, y: p1.y };
                const disc = p1.throwDisc(target.x, target.y);
                if (disc) this.discs.push(disc);
            }
        }

        // Игрок 2: Стрелки + Enter (только для 2p)
        if (this.mode === '2p' && p2.alive) {
            let dx = 0, dy = 0;
            if (this.keys['ArrowUp']) dy = -1;
            if (this.keys['ArrowDown']) dy = 1;
            if (this.keys['ArrowLeft']) dx = -1;
            if (this.keys['ArrowRight']) dx = 1;
            
            if (dx !== 0 && dy !== 0) {
                dx *= 0.707;
                dy *= 0.707;
            }
            p2.move(dx, dy);
            
            if ((this.keys['Enter'] || this.keys['Shift']) && p2.canThrow()) {
                const target = p1.alive ? p1 : { x: p2.x + 100, y: p2.y };
                const disc = p2.throwDisc(target.x, target.y);
                if (disc) this.discs.push(disc);
            }
        }
    }

    // ============================================================
    // ===== ИСПРАВЛЕННЫЙ МЕТОД ОБНОВЛЕНИЯ =====
    // ============================================================
    update() {
        // ===== ПРОВЕРКА: Инициализирована ли игра =====
        if (!this.initialized) {
            console.warn('Игра не инициализирована');
            return;
        }

        if (this.paused || this.gameOver) return;
        
        this.frameCount++;
        
        // ===== БЕЗОПАСНОЕ ОБНОВЛЕНИЕ ИГРОКОВ =====
        for (const p of this.players) {
            if (p && p.alive) {
                p.update();
            }
        }
        
        // Обработка ввода
        this.handleInput();
        
        // Обновляем ИИ
        if (this.ai && this.players[1] && this.players[1].alive) {
            const input = this.ai.update(this.players[1], this.players[0], this.discs);
            this.players[1].move(input.dx, input.dy);
            
            if (input.shoot && this.players[1].canThrow()) {
                const target = this.ai.getThrowTarget(this.players[0]);
                const disc = this.players[1].throwDisc(target.x, target.y);
                if (disc) this.discs.push(disc);
            }
        }
        
        // Обновляем диски
        for (let i = this.discs.length - 1; i >= 0; i--) {
            const disc = this.discs[i];
            if (!disc) continue;
            
            disc.update();
            
            // Проверяем попадания
            for (const p of this.players) {
                if (!p || !p.alive) continue;
                if (disc.hitPlayer(p)) {
                    const killed = p.takeDamage(25);
                    disc.alive = false;
                    
                    if (killed) {
                        const killer = this.players.find(pl => pl && pl.id === disc.ownerId);
                        if (killer) {
                            killer.score++;
                            this.rounds++;
                            this.checkWin(killer);
                            updateHUD(this.players);
                            this.createDeathEffect(p);
                        }
                    }
                    updateHUD(this.players);
                    break;
                }
            }
            
            // Удаляем мертвые диски
            if (!disc.alive) {
                this.discs.splice(i, 1);
            }
        }
        
        // Проверка столкновений дисков
        for (let i = 0; i < this.discs.length; i++) {
            for (let j = i + 1; j < this.discs.length; j++) {
                if (this.discs[i] && this.discs[j]) {
                    this.discs[i].collideWithDisc(this.discs[j]);
                }
            }
        }
        
        // Проверка на ничью
        const alivePlayers = this.players.filter(p => p && p.alive);
        if (alivePlayers.length === 0 && !this.gameOver) {
            this.gameOver = true;
            showGameOver(null, this.players[0]?.score || 0, this.players[1]?.score || 0);
        }
        
        // Рендеринг
        render(this);
    }

    // ============================================================
    // ===== ВСПОМОГАТЕЛЬНЫЙ МЕТОД ДЛЯ ПОЛУЧЕНИЯ ИГРОКА =====
    // ============================================================
    getPlayer(id) {
        if (!this.players) return null;
        const player = this.players.find(p => p && p.id === id);
        if (!player) {
            console.warn(`Игрок с ID ${id} не найден`);
            return null;
        }
        return player;
    }

    // ============================================================
    // ===== ОСТАЛЬНЫЕ МЕТОДЫ (без изменений) =====
    // ============================================================
    
    checkWin(player) {
        if (!player) return;
        if (player.score >= this.maxScore) {
            this.gameOver = true;
            this.winner = player.name;
            if (player.id === 1) {
                saveHighScore(player.score);
                updateHighScore();
            }
            showGameOver(player.name, this.players[0]?.score || 0, this.players[1]?.score || 0);
        }
    }

    createDeathEffect(player) {
        if (!player) return;
        for (let i = 0; i < 50; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(1, 6);
            if (typeof particles !== 'undefined') {
                particles.push({
                    x: player.x,
                    y: player.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.0,
                    color: player.color,
                    size: random(2, 6)
                });
            }
        }
    }

    togglePause() {
        this.paused = !this.paused;
    }

    reset() {
        if (!this.players || this.players.length === 0) return;
        
        this.players.forEach(p => {
            if (p) {
                p.alive = true;
                p.health = p.maxHealth;
                p.discCooldown = 0;
            }
        });
        
        if (this.players[0]) {
            this.players[0].x = WIDTH * 0.25;
            this.players[0].y = HEIGHT * 0.5;
        }
        if (this.players[1]) {
            this.players[1].x = WIDTH * 0.75;
            this.players[1].y = HEIGHT * 0.5;
        }
        
        this.discs = [];
        this.gameOver = false;
        this.winner = null;
        this.paused = false;
        updateHUD(this.players);
    }
}
