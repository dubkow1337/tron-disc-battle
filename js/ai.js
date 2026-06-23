// ===== ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ =====

class AIController {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.thinkInterval = 20;
        this.thinkCounter = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.shootCooldown = 0;
        this.state = 'chase'; // chase, evade, attack
        this.stateTimer = 0;
    }

    // Обновление ИИ
    update(player, enemy, discs) {
        if (!player.alive || !enemy.alive) return { dx: 0, dy: 0, shoot: false };

        this.thinkCounter++;
        this.shootCooldown = Math.max(0, this.shootCooldown - 1);
        this.stateTimer--;

        // Меняем состояние
        if (this.stateTimer <= 0) {
            const rand = Math.random();
            if (rand < 0.3 && player.health < 50) {
                this.state = 'evade';
            } else if (rand < 0.6 && this.shootCooldown === 0) {
                this.state = 'attack';
            } else {
                this.state = 'chase';
            }
            this.stateTimer = 60 + Math.floor(Math.random() * 60);
        }

        // Двигаемся к цели
        let dx = 0, dy = 0;
        let shoot = false;

        switch (this.state) {
            case 'chase':
                dx = enemy.x - player.x;
                dy = enemy.y - player.y;
                break;
            case 'evade':
                dx = -(enemy.x - player.x);
                dy = -(enemy.y - player.y);
                // Добавляем случайность
                dx += random(-20, 20);
                dy += random(-20, 20);
                break;
            case 'attack':
                // Ищем хорошую позицию для броска
                const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                const dist = distance(player.x, player.y, enemy.x, enemy.y);
                const offset = 30 + random(-20, 20);
                dx = Math.cos(angle) * offset;
                dy = Math.sin(angle) * offset;
                shoot = dist < 400 && this.shootCooldown === 0;
                if (shoot) {
                    this.shootCooldown = 40 + Math.floor(random(0, 20));
                }
                break;
        }

        // Нормализация
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
            dx /= len;
            dy /= len;
        }

        // Добавляем ошибку в зависимости от сложности
        if (this.difficulty === 'easy') {
            if (Math.random() < 0.3) {
                dx += random(-0.5, 0.5);
                dy += random(-0.5, 0.5);
            }
        } else if (this.difficulty === 'medium') {
            if (Math.random() < 0.15) {
                dx += random(-0.3, 0.3);
                dy += random(-0.3, 0.3);
            }
        }

        // Возвращаем нормализованный вектор и флаг броска
        const len2 = Math.sqrt(dx * dx + dy * dy);
        if (len2 > 0) {
            dx /= len2;
            dy /= len2;
        }

        // Проверяем, не слишком ли близко к врагу
        const distToEnemy = distance(player.x, player.y, enemy.x, enemy.y);
        if (distToEnemy < 60) {
            // Отходим
            const angleFromEnemy = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            dx = Math.cos(angleFromEnemy);
            dy = Math.sin(angleFromEnemy);
        }

        return { dx, dy, shoot };
    }

    // Получить цель для броска
    getThrowTarget(enemy) {
        // Добавляем небольшое предугадывание движения
        const predX = enemy.x + (enemy.isMoving ? enemy.speed * 3 : 0);
        const predY = enemy.y + (enemy.isMoving ? enemy.speed * 3 : 0);
        return { x: predX + random(-20, 20), y: predY + random(-20, 20) };
    }
}
