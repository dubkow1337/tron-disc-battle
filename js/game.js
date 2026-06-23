// ===== ИГРА =====

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
        
        // Управление
        this.keysPressed = {
            p1: { up: false, down: false, left: false, right: false, shoot: false },
            p2: { up: false, down: false, left: false, right: false, shoot: false }
        };
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

    // Обновление игры
    update() {
        if (this.paused || this.gameOver) return;
        
        this.frameCount++;
        
        // Обновляем игроков
        for (const p of this.players) {
            p.update();
        }
        
        // Обработка ввода
        this.handleInput();
        
        // Обновляем ИИ
        if (this.ai && this.players[1].alive) {
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
            disc.update();
            
            // Проверяем попадания
            for (const p of this.players) {
                if (disc.hitPlayer(p)) {
                    const killed = p.takeDamage(25);
                    disc.alive = false;
                    
                    // Если игрок убит
                    if (killed) {
                        const killer = this.players.find(pl => pl.id === disc.ownerId);
                        if (killer) {
                            killer.score++;
                            this.rounds++;
                            this.checkWin(killer);
                            updateHUD(this.players);
                            
                            // Создаем эффект частиц
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
                this.discs[i].collideWithDisc(this.discs[j]);
            }
        }
        
        // Проверка на ничью (если оба мертвы)
        if (this.players.every(p => !p.alive) && !this.gameOver) {
            this.gameOver = true;
            showGameOver(null, this.players[0].score, this.players[1].score);
        }
        
        // Рендеринг
        render(this);
    }

    // Обработка ввода
    handleInput() {
        // Игрок 1: WASD + Space
        const p1 = this.players[0];
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
                const disc = p1.throwDisc(this.players[1].x, this.players[1].y);
                if (disc) this.discs.push(disc);
            }
        }
        
        // Игрок 2: Стрелки + Enter (только для 2p)
        if (this.mode === '2p') {
            const p2 = this.players[1];
            if (p2.alive) {
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
                    const disc = p2.throwDisc(this.players[0].x, this.players[0].y);
                    if (disc) this.discs.push(disc);
                }
            }
        }
    }

    // Проверка победы
    checkWin(player) {
        if (player.score >= this.maxScore) {
            this.gameOver = true;
            this.winner = player.name;
            // Сохраняем рекорд
            if (player.id === 1) {
                saveHighScore(player.score);
                updateHighScore();
            }
            showGameOver(player.name, this.players[0].score, this.players[1].score);
        }
    }

    // Эффект смерти
    createDeathEffect(player) {
        // Добавляем частицы
        for (let i = 0; i < 50; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(1, 6);
            // Используем глобальный массив particles из render.js
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

    // Пауза
    togglePause() {
        this.paused = !this.paused;
    }

    // Сброс игры
    reset() {
        this.players.forEach(p => {
            p.alive = true;
            p.health = p.maxHealth;
            p.discCooldown = 0;
        });
        this.players[0].x = WIDTH * 0.25;
        this.players[0].y = HEIGHT * 0.5;
        this.players[1].x = WIDTH * 0.75;
        this.players[1].y = HEIGHT * 0.5;
        this.discs = [];
        this.gameOver = false;
        this.winner = null;
        this.paused = false;
        updateHUD(this.players);
    }
                }
