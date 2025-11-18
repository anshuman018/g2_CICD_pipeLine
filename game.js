// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

let bird = { x: 50, y: 250, width: 34, height: 24, velocity: 0, gravity: 0.5, jump: -8 };
let pipes = [];
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let gameRunning = false;
let gameOver = false;
let frameCount = 0;

// Game elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScoreDisplay = document.getElementById('finalScore');
const highScoreDisplay = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Update high score display
highScoreDisplay.textContent = `Best: ${highScore}`;

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', handleInput);
canvas.addEventListener('click', handleInput);
canvas.addEventListener('touchstart', handleInput);

function handleInput(e) {
    if (gameRunning && !gameOver) {
        bird.velocity = bird.jump;
    }
}

function startGame() {
    startScreen.style.display = 'none';
    gameRunning = true;
    gameOver = false;
    bird.y = 250;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    scoreDisplay.textContent = score;
    gameLoop();
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

function createPipe() {
    const gap = 150;
    const minHeight = 50;
    const maxHeight = canvas.height - gap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    
    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        width: 60,
        passed: false
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Check boundaries
    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

function updatePipes() {
    if (frameCount % 90 === 0) {
        createPipe();
    }
    
    pipes.forEach((pipe, index) => {
        pipe.x -= 3;
        
        // Check collision
        if (bird.x + bird.width > pipe.x && 
            bird.x < pipe.x + pipe.width &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)) {
            endGame();
        }
        
        // Update score
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            pipe.passed = true;
            score++;
            scoreDisplay.textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
    });
}

function drawBird() {
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.arc(bird.x + 17, bird.y + 12, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + 22, bird.y + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + 23, bird.y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(bird.x + 26, bird.y + 12);
    ctx.lineTo(bird.x + 34, bird.y + 12);
    ctx.lineTo(bird.x + 26, bird.y + 15);
    ctx.fill();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Top pipe cap
        ctx.fillStyle = '#66bb6a';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);
        
        // Bottom pipe
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        
        // Bottom pipe cap
        ctx.fillStyle = '#66bb6a';
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 20);
        ctx.strokeRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 20);
    });
}

function drawBackground() {
    // Sky
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height - 100);
    
    // Ground
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    ctx.fillStyle = '#6d4c41';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 100, 10, 5);
    }
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreDisplay.textContent = `Best: ${highScore}`;
    }
    
    finalScoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}

function gameLoop() {
    if (!gameRunning || gameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawPipes();
    drawBird();
    
    updateBird();
    updatePipes();
    
    frameCount++;
    requestAnimationFrame(gameLoop);
}
