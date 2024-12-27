// Game Configuration
const GAME_CONFIG = {
    speed: 100,
    initialSnakePos: { x: 10, y: 10 },
    pointsPerFood: 10,
    gridSize: 20, // Base grid size for responsive calculations
    initialSnakeLength: 4,  // Add initial snake length configuration
    soundEnabled: true,
    musicEnabled: true
};

// Game State
let canvas, ctx, canvasWidth, canvasHeight, snakeSize;
let snake, direction, food, gameInterval;
let gamePaused = false;
let score = 0;
let soundEnabled = true;
let musicEnabled = true;

// Initialize DOM elements
const elements = {
    canvas: document.getElementById('gameCanvas'),
    menu: document.getElementById('menu'),
    gameOverScreen: document.getElementById('game-over'),
    startBtn: document.getElementById('startBtn'),
    restartBtn: document.getElementById('restartBtn'),
    controls: document.getElementById('controls'),
    scoreDisplay: document.getElementById('score'),
    finalScoreDisplay: document.getElementById('finalScore'),
    pauseBtn: document.getElementById('pauseBtn'),
    controlBtns: {
        left: document.getElementById('leftBtn'),
        up: document.getElementById('upBtn'),
        down: document.getElementById('downBtn'),
        right: document.getElementById('rightBtn')
    },
    soundToggle: document.getElementById('soundToggle'),
    musicToggle: document.getElementById('musicToggle'),
    bgMusic: document.getElementById('bgMusic'),
    eatSound: document.getElementById('eatSound')
};

// Initialize game
function initGame() {
    canvas = elements.canvas;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    snakeSize = Math.floor(Math.min(canvasWidth, canvasHeight) / 25);
    setupEventListeners();
}

// Game functions
function spawnFood() {
    const gridWidth = Math.floor((canvasWidth - 2 * snakeSize) / snakeSize);
    const gridHeight = Math.floor((canvasHeight - 2 * snakeSize) / snakeSize);
    
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * gridWidth + 1) * snakeSize,
            y: Math.floor(Math.random() * gridHeight + 1) * snakeSize
        };
    } while (isCollisionWithSnake(newFood));
    
    return newFood;
}

function isCollisionWithSnake(position) {
    return snake.some(segment => 
        segment.x === position.x && segment.y === position.y
    );
}

function drawSnake() {
    snake.forEach((segment, index) => {
        // Create gradient for snake body
        const gradient = ctx.createLinearGradient(
            segment.x, segment.y, 
            segment.x + snakeSize, segment.y + snakeSize
        );
        
        if (index === 0) {
            // Head with different color
            gradient.addColorStop(0, '#50fa7b');
            gradient.addColorStop(1, '#00b894');
        } else {
            gradient.addColorStop(0, '#00b894');
            gradient.addColorStop(1, '#00a884');
        }

        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle for each segment
        roundedRect(
            ctx, 
            segment.x, 
            segment.y, 
            snakeSize, 
            snakeSize, 
            snakeSize / 4
        );

        // Add eyes to snake head
        if (index === 0) {
            drawSnakeEyes(segment);
        }
    });
}

function drawSnakeEyes(head) {
    const eyeSize = snakeSize / 6;
    const eyeOffset = snakeSize / 4;
    ctx.fillStyle = 'white';
    
    // Eye positions based on direction
    let eyePositions;
    switch(direction) {
        case 'right':
            eyePositions = [
                { x: head.x + snakeSize - eyeOffset, y: head.y + eyeOffset },
                { x: head.x + snakeSize - eyeOffset, y: head.y + snakeSize - eyeOffset * 2 }
            ];
            break;
        case 'left':
            eyePositions = [
                { x: head.x + eyeOffset, y: head.y + eyeOffset },
                { x: head.x + eyeOffset, y: head.y + snakeSize - eyeOffset * 2 }
            ];
            break;
        case 'up':
            eyePositions = [
                { x: head.x + eyeOffset, y: head.y + eyeOffset },
                { x: head.x + snakeSize - eyeOffset * 2, y: head.y + eyeOffset }
            ];
            break;
        case 'down':
            eyePositions = [
                { x: head.x + eyeOffset, y: head.y + snakeSize - eyeOffset * 2 },
                { x: head.x + snakeSize - eyeOffset * 2, y: head.y + snakeSize - eyeOffset * 2 }
            ];
            break;
    }

    eyePositions.forEach(pos => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add black pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawFood() {
    const centerX = food.x + snakeSize/2;
    const centerY = food.y + snakeSize/2;
    const radius = snakeSize/2;

    // Create gradient for apple
    const gradient = ctx.createRadialGradient(
        centerX - radius/3, centerY - radius/3, radius/6,
        centerX, centerY, radius
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#c0392b');

    // Draw apple body
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw apple stem
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(
        centerX - snakeSize/8, 
        food.y, 
        snakeSize/4, 
        snakeSize/3
    );
}

// Helper function for rounded rectangles
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
}

function moveSnake() {
    const head = { ...snake[0] };
    const moves = {
        up: () => head.y -= snakeSize,
        down: () => head.y += snakeSize,
        left: () => head.x -= snakeSize,
        right: () => head.x += snakeSize
    };

    moves[direction]();

    // Check boundary collision
    if (head.x < 0 || 
        head.x >= canvasWidth || 
        head.y < 0 || 
        head.y >= canvasHeight) {
        endGame();
        return;
    }

    // Check self-collision
    if (isCollisionWithSnake(head)) {
        endGame();
        return;
    }

    snake.unshift(head);

    // Food collision with improved detection
    if (checkFoodCollision(head)) {
        food = spawnFood();
        updateScore(GAME_CONFIG.pointsPerFood);
        playEatSound(); // Add sound effect
    } else {
        snake.pop();
    }
}

function checkFoodCollision(head) {
    // Add small tolerance for collision detection
    const tolerance = snakeSize / 4;
    return Math.abs(head.x - food.x) < tolerance && 
           Math.abs(head.y - food.y) < tolerance;
}

function gameLoop() {
    if (gamePaused) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawFood();
    moveSnake();
    drawSnake();
}

function updateScore(points) {
    score += points;
    elements.scoreDisplay.textContent = `Score: ${score}`;
}

function resetGame() {
    // Create initial snake with multiple segments
    snake = [];
    for (let i = 0; i < GAME_CONFIG.initialSnakeLength; i++) {
        snake.push({
            x: (GAME_CONFIG.initialSnakePos.x - i) * snakeSize,
            y: GAME_CONFIG.initialSnakePos.y * snakeSize
        });
    }
    
    direction = 'right';
    food = spawnFood();
    score = 0;
    gamePaused = false;
    
    elements.pauseBtn.style.display = 'block';
    elements.scoreDisplay.textContent = 'Score: 0';
    
    // Show controls only on mobile devices
    if (window.innerWidth <= 768) {
        elements.controls.style.display = 'grid';
    } else {
        elements.controls.style.display = 'none';
    }
    
    gameInterval = setInterval(gameLoop, GAME_CONFIG.speed);
    
    // Start background music when game starts
    playBackgroundMusic();
}

function endGame() {
    clearInterval(gameInterval);
    gamePaused = true;
    elements.menu.style.display = 'none';
    elements.controls.style.display = 'none';
    elements.pauseBtn.style.display = 'none';
    elements.finalScoreDisplay.textContent = `Final Score: ${score}`;
    elements.gameOverScreen.style.display = 'block';
    elements.bgMusic.pause();
}

// Event Handlers
function changeDirection(event) {
    const keyMap = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right'
    };

    const newDirection = keyMap[event.key];
    if (newDirection && !gamePaused) {
        const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
        if (opposites[newDirection] !== direction) {
            direction = newDirection;
        }
    }
}

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Recalculate snake size based on screen dimensions
    snakeSize = Math.floor(Math.min(canvasWidth, canvasHeight) / GAME_CONFIG.gridSize);
    
    // Adjust existing snake and food positions
    if (snake) {
        snake = snake.map(segment => ({
            x: Math.round(segment.x / snakeSize) * snakeSize,
            y: Math.round(segment.y / snakeSize) * snakeSize
        }));
    }
    
    if (food) {
        food = {
            x: Math.round(food.x / snakeSize) * snakeSize,
            y: Math.round(food.y / snakeSize) * snakeSize
        };
    }
}

// Setup Event Listeners
function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', changeDirection);

    elements.startBtn.addEventListener('click', () => {
        elements.menu.style.display = 'none';
        resetGame();
    });

    elements.restartBtn.addEventListener('click', () => {
        elements.gameOverScreen.style.display = 'none';
        resetGame();
    });

    elements.pauseBtn.addEventListener('click', () => {
        gamePaused = !gamePaused;
        elements.pauseBtn.innerText = gamePaused ? 'Resume' : 'Pause';
    });

    // Mobile controls
    elements.controlBtns.left.addEventListener('click', () => { if (direction !== 'right') direction = 'left'; });
    elements.controlBtns.up.addEventListener('click', () => { if (direction !== 'down') direction = 'up'; });
    elements.controlBtns.down.addEventListener('click', () => { if (direction !== 'up') direction = 'down'; });
    elements.controlBtns.right.addEventListener('click', () => { if (direction !== 'left') direction = 'right'; });

    // Improve resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            resizeCanvas();
            // Update controls visibility on resize
            if (window.innerWidth <= 768) {
                elements.controls.style.display = 'grid';
            } else {
                elements.controls.style.display = 'none';
            }
            if (!gamePaused) {
                drawFood();
                drawSnake();
            }
        }, 250);
    });

    // Sound controls
    elements.soundToggle.addEventListener('click', toggleSound);
    elements.musicToggle.addEventListener('click', toggleMusic);

    // Update endGame to pause music
    elements.bgMusic.addEventListener('ended', () => {
        if (musicEnabled) {
            elements.bgMusic.play();
        }
    });
}

// Add sound functions
function playEatSound() {
    if (soundEnabled) {
        elements.eatSound.currentTime = 0; // Reset sound to start
        elements.eatSound.volume = 0.6; // Set volume to 60%
        elements.eatSound.play().catch(error => console.log('Error playing sound:', error));
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    elements.soundToggle.textContent = `🔊 Sound: ${soundEnabled ? 'ON' : 'OFF'}`;
    elements.soundToggle.classList.toggle('off', !soundEnabled);
    
    if (!soundEnabled) {
        elements.eatSound.pause();
        elements.eatSound.currentTime = 0;
    }
}

// Add music functions
function toggleMusic() {
    musicEnabled = !musicEnabled;
    elements.musicToggle.textContent = `🎵 Music: ${musicEnabled ? 'ON' : 'OFF'}`;
    elements.musicToggle.classList.toggle('off', !musicEnabled);
    
    if (musicEnabled) {
        playBackgroundMusic();
    } else {
        elements.bgMusic.pause();
    }
}

function playBackgroundMusic() {
    if (musicEnabled) {
        elements.bgMusic.volume = 0.2; // Set volume to 50%
        elements.bgMusic.play().catch(error => console.log('Error playing music:', error));
    }
}

// Start game initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Preload audio
    elements.eatSound.load();
    elements.bgMusic.load();
});
