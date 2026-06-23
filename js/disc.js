// ===== ДИСК =====

class Disc {
    constructor(x, y, angle, color, ownerId) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.speed = 6;
        this.angle = angle;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.color = color;
        this.ownerId = ownerId;
        this.alive = true;
        this.life = 180; // кадров до самоуничтожения
        this.trail = [];
        this.rotation = 0;
        this.bounces = 0;
        this.maxBounces = 3;
    }

    // Обновление позиции
    update() {
        if (!this.alive) return;
        
        this.life--;
        if (this.life <= 0) {
            this.alive = false;
            return;
        }

        // Сохраняем след
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) {
            this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;

        // Отскок от стен
        let bounced = false;
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
            bounced = true;
        } else if (this.x + this.radius > WIDTH) {
            this.x = WIDTH - this.radius;
            this.vx *= -1;
            bounced = true;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
            bounced = true;
        } else if (this.y + this.radius > HEIGHT) {
            this.y = HEIGHT - this.radius;
            this.vy *= -1;
            bounced = true;
        }

        if (bounced) {
            this.bounces++;
            this.angle = Math.atan2(this.vy, this.vx);
            if (this.bounces >= this.maxBounces) {
                this.alive = false;
            }
        }

        // Вращение диска
        this.rotation += 0.3;
    }

    // Проверка попадания в игрока
    hitPlayer(player) {
        if (!this.alive || !player.alive) return false;
        if (this.ownerId === player.id) return false;
        
        const dist = distance(this.x, this.y, player.x, player.y);
        return dist < this.radius + player.radius;
    }

    // Отражение диска (если игрок успел поймать)
    reflect(targetX, targetY) {
        if (!this.alive) return false;
        
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.angle = angle;
        this.ownerId = -1; // нейтральный диск
        return true;
    }

    // Проверка столкновения с другим диском
    collideWithDisc(other) {
        if (!this.alive || !other.alive) return false;
        if (this.ownerId === other.ownerId) return false;
        
        const dist = distance(this.x, this.y, other.x, other.y);
        if (dist < this.radius + other.radius) {
            // Отталкиваем диски друг от друга
            const angle = Math.atan2(other.y - this.y, other.x - this.x);
            const overlap = (this.radius + other.radius - dist) / 2;
            
            this.x -= Math.cos(angle) * overlap;
            this.y -= Math.sin(angle) * overlap;
            other.x += Math.cos(angle) * overlap;
            other.y += Math.sin(angle) * overlap;
            
            // Меняем направления
            const tempVx = this.vx;
            const tempVy = this.vy;
            this.vx = other.vx;
            this.vy = other.vy;
            other.vx = tempVx;
            other.vy = tempVy;
            
            this.angle = Math.atan2(this.vy, this.vx);
            other.angle = Math.atan2(other.vy, other.vx);
            
            return true;
        }
        return false;
    }
}
