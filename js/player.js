// ===== player.js =====

class Player {
    constructor(id, name, color, x, y) {
        this.id = id;
        this.name = name;
        this.color = color;
        
        // Позиция
        this.x = x;
        this.y = y;
        this.radius = 16; // Увеличили
        
        // Характеристики
        this.speed = 2.8;
        this.health = 100;
        this.maxHealth = 100;
        this.score = 0;
        this.alive = true;
        this.discCooldown = 0;
        this.discCooldownMax = 25;
        this.direction = 0;
        this.isMoving = false;
        
        // Визуальные параметры
        this.trail = [];
        this.maxTrail = 20;
        this.pulse = 0;
        this.hitFlash = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.boostActive = false;
        this.boostTimer = 0;
        
        // Позывной (рандомный)
        this.callSign = this.generateCallSign();
        
        // Уровень (для прогрессии)
        this.level = 1;
        this.exp = 0;
    }

    generateCallSign() {
        const prefixes = ['NEO', 'TRON', 'CYBER', 'PHANTOM', 'RAVEN', 'VIPER', 'SHADOW', 'BLAZE'];
        const suffixes = ['X', 'Z', 'K', 'V', 'R', 'S', 'N', 'M'];
        return prefixes[Math.floor(Math.random() * prefixes.length)] + 
               suffixes[Math.floor(Math.random() * suffixes.length)] +
               Math.floor(Math.random() * 99);
    }

    move(dx, dy) {
        if (!this.alive) return;
        
        const speed = this.boostActive ? this.speed * 1.8 : this.speed;
        this.x += dx * speed;
        this.y += dy * speed;
        
        this.x = clamp(this.x, this.radius, WIDTH - this.radius);
        this.y = clamp(this.y, this.radius, HEIGHT - this.radius);
        
        if (dx !== 0 || dy !== 0) {
            this.direction = Math.atan2(dy, dx);
            this.isMoving = true;
            
            // Добавляем след
            if (this.trail.length === 0 || 
                distance(this.trail[this.trail.length - 1], {x: this.x, y: this.y}) > 5) {
                this.trail.push({x: this.x, y: this.y});
                if (this.trail.length > this.maxTrail) {
                    this.trail.shift();
                }
            }
        } else {
            this.isMoving = false;
        }
    }

    throwDisc(targetX, targetY) {
        if (!this.alive) return null;
        if (this.discCooldown > 0) return null;
        
        this.discCooldown = this.discCooldownMax;
        const angle = Math.atan2(targetY - this.y, targetX - this.x);
        return new Disc(this.x, this.y, angle, this.color, this.id);
    }

    takeDamage(amount) {
        if (!this.alive) return false;
        if (this.shieldActive) {
            this.shieldActive = false;
            showMessage(`🛡️ ${this.name} отразил удар!`, 800);
            return false;
        }
        
        this.health -= amount;
        this.hitFlash = 12;
        
        // Эффект удара
        if (typeof createExplosion === 'function') {
            createExplosion(this.x, this.y, '#ff0044', 30);
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
            return true;
        }
        return false;
    }

    update() {
        if (!this.alive) return;
        
        if (this.discCooldown > 0) this.discCooldown--;
        if (this.hitFlash > 0) this.hitFlash--;
        if (this.shieldTimer > 0) {
            this.shieldTimer--;
            this.shieldActive = true;
        } else {
            this.shieldActive = false;
        }
        if (this.boostTimer > 0) {
            this.boostTimer--;
            this.boostActive = true;
        } else {
            this.boostActive = false;
        }
        
        this.pulse += 0.04;
    }

    canThrow() {
        return this.alive && this.discCooldown === 0;
    }

    // Активация щита
    activateShield(duration = 120) {
        this.shieldTimer = duration;
        this.shieldActive = true;
        showMessage(`🛡️ ${this.name} активировал ЩИТ!`, 1000);
    }

    // Активация ускорения
    activateBoost(duration = 90) {
        this.boostTimer = duration;
        this.boostActive = true;
        showMessage(`⚡ ${this.name} активировал УСКОРЕНИЕ!`, 1000);
    }

    getHUD() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            score: this.score,
            name: this.name,
            color: this.color,
            callSign: this.callSign
        };
    }
}
