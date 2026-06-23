// ===== MAIN =====

let game;

// Инициализация
function init() {
    game = new Game();
    updateHighScore();
    
    // Обработка клавиш
    document.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;
        if (e.key === 'Escape') {
            game.togglePause();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });
    
    // Запуск игрового цикла
    gameLoop();
}

// Игровой цикл
function gameLoop() {
    if (game) {
        game.update();
    }
    requestAnimationFrame(gameLoop);
}

// ===== КОЛБЭКИ ДЛЯ UI =====

window.startGameCallback = function(mode) {
    game.init(mode);
};

window.togglePauseCallback = function() {
    if (game) game.togglePause();
};

window.backToMenuCallback = function() {
    showScreen(menuScreen);
    updateHighScore();
};

window.rematchCallback = function() {
    if (game) {
        game.reset();
        showScreen(gameScreen);
    }
};

// Глобальные переменные для частиц (из render.js)
window.particles = [];

// Старт
document.addEventListener('DOMContentLoaded', init);
