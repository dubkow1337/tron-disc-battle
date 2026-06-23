// ===== ИГРОК =====

class Player {
    constructor(id, name, color, x, y) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.x = x;
        this.y = y;
        this.radius = 12;
        this.speed = 2.5;
        this.health = 100;
        this.maxHealth = 100;
        this.score = 0;
        this.alive = true;
        this.discCooldown = 0;
        this.discCooldownMax = 30; // кадров
        this.direction = 0; // угол в радианах
        this.isMoving = false;
        
        // Для анимации
        this.pulse = 0;
        this.hitFlash = 0;
    }

    // Движение
    move(dx, dy) {
        if (!this.alive) return;
        
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        
        // Ограничение по границам
        this.x = clamp(this.x, this.radius, WIDTH - this.radius);
        this.y = clamp(this.y, this.radius, HEIGHT - this.radius);
        
        // Обновляем направление
        if (dx !== 0 || dy !== 0) {
            this.direction = Math.atan2(dy, dx);
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
    }

    // Метание диска
    throwDisc(targetX, targetY) {
        if (!this.alive) return null;
        if (this.discCooldown > 0) return null;
        
        this.discCooldown = this.discCooldownMax;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        return new Disc(
            this.x,
            this.y,
            angle,
            this.color,
            this.id
        );
    }

    // Получение урона
    takeDamage(amount) {
        if (!this.alive) return false;
        
        this.health -= amount;
        this.hitFlash = 10;
        
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            return true; // Игрок убит
        }
        return false;
    }

    // Обновление состояния
    update() {
        if (this.discCooldown > 0) {
            this.discCooldown--;
        }
        if (this.hitFlash > 0) {
            this.hitFlash--;
        }
        this.pulse += 0.05;
    }

    // Проверка готовности бросить диск
    canThrow() {
        return this.alive && this.discCooldown === 0;
    }

    // Получение координат для HUD
    getHUD() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            score: this.score
        };
    }
}
