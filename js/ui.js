// ===== UI =====

// Элементы
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const p1Health = document.getElementById('p1Health');
const p2Health = document.getElementById('p2Health');
const p1HealthText = document.getElementById('p1HealthText');
const p2HealthText = document.getElementById('p2HealthText');
const p1Score = document.getElementById('p1Score');
const p2Score = document.getElementById('p2Score');
const winnerText = document.getElementById('winnerText');
const winnerIcon = document.getElementById('winnerIcon');
const finalScore = document.getElementById('finalScore');
const highScoreEl = document.getElementById('highScore');
const roundDisplay = document.getElementById('roundDisplay');
const messageContainer = document.getElementById('messageContainer');

let messageTimeout = null;

// ===== ОБНОВЛЕНИЕ HUD =====
function updateHUD(players) {
    if (!players || players.length < 2) return;
    
    const p1 = players[0];
    const p2 = players[1];
    
    if (p1) {
        const healthPercent = (p1.health / p1.maxHealth * 100);
        p1Health.style.width = healthPercent + '%';
        p1Health.style.background = healthPercent > 30 ? '#00ffff' : '#ff0044';
        p1HealthText.textContent = Math.round(p1.health);
        p1Score.textContent = p1.score;
    }
    
    if (p2) {
        const healthPercent = (p2.health / p2.maxHealth * 100);
        p2Health.style.width = healthPercent + '%';
        p2Health.style.background = healthPercent > 30 ? '#ff6600' : '#ff0044';
        p2HealthText.textContent = Math.round(p2.health);
        p2Score.textContent = p2.score;
    }
}

// ===== ОБНОВЛЕНИЕ РАУНДА =====
function updateRound(round) {
    roundDisplay.textContent = `ROUND ${round || 1}`;
}

// ===== ПОКАЗАТЬ СООБЩЕНИЕ =====
function showMessage(text, duration = 1500) {
    if (messageTimeout) {
        clearTimeout(messageTimeout);
        const old = messageContainer.querySelector('.message-popup');
        if (old) old.remove();
    }

    const el = document.createElement('div');
    el.className = 'message-popup';
    el.textContent = text;
    messageContainer.appendChild(el);

    messageTimeout = setTimeout(() => {
        el.classList.add('fade-out');
        setTimeout(() => {
            el.remove();
            messageTimeout = null;
        }, 500);
    }, duration);
}

// ===== ПОКАЗАТЬ ЭКРАН =====
function showScreen(screen) {
    [menuScreen, gameScreen, gameOverScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// ===== ПОКАЗАТЬ GAME OVER =====
function showGameOver(winner, score1, score2) {
    finalScore.textContent = `${score1} - ${score2}`;
    
    if (winner) {
        winnerText.textContent = `${winner} ПОБЕДИЛ!`;
        winnerIcon.textContent = '🏆';
        // Фейерверк для победителя
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const x = Math.random() * WIDTH;
                    const y = Math.random() * HEIGHT * 0.5;
                    const colors = ['#00ffff', '#ff00ff', '#ffcc00', '#00ff88', '#ff6600'];
                    createFirework(x, y, colors[Math.floor(Math.random() * colors.length)]);
                }, i * 300);
            }
        }, 500);
    } else {
        winnerText.textContent = 'НИЧЬЯ!';
        winnerIcon.textContent = '🤝';
    }
    
    showScreen(gameOverScreen);
}

// ===== ОБНОВЛЕНИЕ РЕКОРДА =====
function updateHighScore() {
    highScoreEl.textContent = loadHighScore();
}

// ===== ОБРАБОТЧИКИ =====
function startGame(mode) {
    if (window.startGameCallback) {
        window.startGameCallback(mode);
    }
}

function openSettings() {
    showMessage('⚙️ Настройки будут доступны в следующей версии', 2000);
}

function togglePause() {
    if (window.togglePauseCallback) {
        window.togglePauseCallback();
    }
}

function backToMenu() {
    if (window.backToMenuCallback) {
        window.backToMenuCallback();
    }
}

function rematch() {
    if (window.rematchCallback) {
        window.rematchCallback();
    }
}
