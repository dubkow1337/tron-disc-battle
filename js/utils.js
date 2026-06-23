// ===== УТИЛИТЫ =====

// Случайное число в диапазоне
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Случайное целое число в диапазоне
function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

// Расстояние между двумя точками
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Ограничение значения
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Пересечение двух прямоугольников
function rectCollide(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx &&
           ay < by + bh && ay + ah > by;
}

// Загрузка рекорда
function loadHighScore() {
    return parseInt(localStorage.getItem('discBattleHighScore')) || 0;
}

// Сохранение рекорда
function saveHighScore(score) {
    const current = loadHighScore();
    if (score > current) {
        localStorage.setItem('discBattleHighScore', score.toString());
        return true;
    }
    return false;
}
