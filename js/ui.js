// ===== UI =====

// Элементы
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const p1Health = document.getElementById('p1Health');
const p2Health = document.getElementById('p2Health');
const p1Score = document.getElementById('p1Score');
const p2Score = document.getElementById('p2Score');
const winnerText = document.getElementById('winnerText');
const finalScore = document.getElementById('finalScore');
const highScoreEl = document.getElementById('highScore');

// Обновление HUD
function updateHUD(players) {
    if (!players) return;
    
    const p1 = players.find(p => p.id === 1);
    const p2 = players.find(p => p.id === 2);
    
    if (p1) {
        p1Health.style.width = (p1.health / p1.maxHealth * 100) + '%';
        p1Health.style.background = p1.health > 30 ? p1.color : '#ff0044';
        p1Score.textContent = p1.score;
    }
    
    if (p2) {
        p2Health.style.width = (p2.health / p2.maxHealth * 100) + '%';
        p2Health.style.background = p2.health > 30 ? p2.color : '#ff0044';
        p2Score.textContent = p2.score;
    }
}

// Показать экран
function showScreen(screen) {
    [menuScreen, gameScreen, gameOverScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Показать Game Over
function showGameOver(winner, score1, score2) {
    finalScore.textContent = `${score1} - ${score2}`;
    winnerText.textContent = winner
