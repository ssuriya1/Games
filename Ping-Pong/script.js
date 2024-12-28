const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const BALL_SPEED = 3;
const PADDLE_SPEED = 8;
const WINNING_SCORE = 10;

// Game state
let gameState = {
    ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: BALL_SPEED,
        dy: BALL_SPEED,
        radius: BALL_RADIUS
    },
    paddles: {
        p1: {
            x: 10,
            y: canvas.height / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        },
        p2: {
            x: canvas.width - 30,
            y: canvas.height / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT
        }
    },
    score: {
        p1: 0,
        p2: 0
    },
    controls: {
        uparrow: false,
        downarrow: false,
        wkey: false,
        skey: false,
        touchSide: null
    },
    isPlaying: false,
    isPaused: false,
    lastTime: 0,
    deltaTime: 0,
    animationFrameId: null  // Add this to track animation frame
};

// Event Listeners
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Touch handling for canvas
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);

// Only pause button touch listener
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('pause-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    togglePause();
});

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    
    // Determine which half of the screen was touched
    if (x < canvas.width / 2) {
        gameState.controls.touchSide = 'left';
    } else {
        gameState.controls.touchSide = 'right';
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!gameState.controls.touchSide) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const y = touch.clientY - rect.top;
    
    // Update paddle position based on touch
    if (gameState.controls.touchSide === 'left') {
        gameState.paddles.p1.y = Math.min(
            Math.max(y - gameState.paddles.p1.height / 2, 0),
            canvas.height - gameState.paddles.p1.height
        );
    } else {
        gameState.paddles.p2.y = Math.min(
            Math.max(y - gameState.paddles.p2.height / 2, 0),
            canvas.height - gameState.paddles.p2.height
        );
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    gameState.controls.touchSide = null;
}

function handleKeyUp(k) {
    if (k.key === "ArrowUp") gameState.controls.uparrow = false;
    if (k.key === "ArrowDown") gameState.controls.downarrow = false;
    if (k.key === "w" || k.key === "W") gameState.controls.wkey = false;
    if (k.key === "s" || k.key === "S") gameState.controls.skey = false;
}

function handleKeyDown(k) {
    if (k.key === "ArrowUp") gameState.controls.uparrow = true;
    if (k.key === "ArrowDown") gameState.controls.downarrow = true;
    if (k.key === "w" || k.key === "W") gameState.controls.wkey = true;
    if (k.key === "s" || k.key === "S") gameState.controls.skey = true;
    if (k.key === "p" || k.key === "P") {
        togglePause();
    }
}

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Adjust aspect ratio for mobile
    const aspectRatio = isMobileDevice() ? 16/9 : 4/3;
    let newWidth = containerWidth;
    let newHeight = containerWidth / aspectRatio;

    if (newHeight > containerHeight) {
        newHeight = containerHeight;
        newWidth = containerHeight * aspectRatio;
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    // Reset positions
    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height / 2;
    gameState.paddles.p1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    gameState.paddles.p2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    gameState.paddles.p2.x = canvas.width - 30;
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffdd';
    
    // Add glow effect
    ctx.shadowColor = '#00ffdd';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.closePath();
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function drawPaddles() {
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
    ctx.shadowBlur = 10;
    
    // Player 1
    ctx.fillStyle = 'red';
    ctx.fillRect(
        gameState.paddles.p1.x,
        gameState.paddles.p1.y,
        gameState.paddles.p1.width,
        gameState.paddles.p1.height
    );

    // Player 2
    ctx.fillStyle = 'blue';
    ctx.fillRect(
        gameState.paddles.p2.x,
        gameState.paddles.p2.y,
        gameState.paddles.p2.width,
        gameState.paddles.p2.height
    );
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function createText(text, x, y, fontSize = '20px', color = 'white', withShadow = true) {
    ctx.font = `bold ${fontSize} 'Arial', sans-serif`;
    ctx.textAlign = 'center';
    
    if (withShadow) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
    
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function drawScore() {
    // Player 1 (Left side - Red)
    createText('Score: ' + gameState.score.p1, 60, 30, '20px', '#ff0000');
    
    // Player 2 (Right side - Blue)
    createText('Score: ' + gameState.score.p2, canvas.width - 60, 30, '20px', '#0000ff');
}

function updateGame(deltaTime) {
    const timeStep = deltaTime / 16; // Normalize to 60fps

    // Ball movement
    gameState.ball.x += gameState.ball.dx * timeStep;
    gameState.ball.y += gameState.ball.dy * timeStep;

    // Wall collisions
    if (gameState.ball.y + gameState.ball.dy > canvas.height - gameState.ball.radius || 
        gameState.ball.y + gameState.ball.dy < gameState.ball.radius) {
        gameState.ball.dy = -gameState.ball.dy;
    }

    // Score points
    if (gameState.ball.x > canvas.width - gameState.ball.radius) {
        gameState.score.p1++;
        resetBall();
    } else if (gameState.ball.x < gameState.ball.radius) {
        gameState.score.p2++;
        resetBall();
    }

    // Paddle collisions
    if (checkPaddleCollision(gameState.paddles.p1) || checkPaddleCollision(gameState.paddles.p2)) {
        gameState.ball.dx = -gameState.ball.dx * 1.1; // Increase speed slightly
    }

    // Only use keyboard controls if not touching
    if (!gameState.controls.touchSide) {
        const paddleStep = PADDLE_SPEED * timeStep;
        
        if (gameState.controls.wkey && gameState.paddles.p1.y > 0) {
            gameState.paddles.p1.y -= paddleStep;
        }
        if (gameState.controls.skey && gameState.paddles.p1.y < canvas.height - gameState.paddles.p1.height) {
            gameState.paddles.p1.y += paddleStep;
        }
        if (gameState.controls.uparrow && gameState.paddles.p2.y > 0) {
            gameState.paddles.p2.y -= paddleStep;
        }
        if (gameState.controls.downarrow && gameState.paddles.p2.y < canvas.height - gameState.paddles.p2.height) {
            gameState.paddles.p2.y += paddleStep;
        }
    }
}

function checkPaddleCollision(paddle) {
    return gameState.ball.x < paddle.x + paddle.width &&
           gameState.ball.x + gameState.ball.radius > paddle.x &&
           gameState.ball.y < paddle.y + paddle.height &&
           gameState.ball.y + gameState.ball.radius > paddle.y;
}

function resetBall() {
    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height / 2;
    gameState.ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    gameState.ball.dy = BALL_SPEED * (Math.random() * 2 - 1); // Random angle
}

function resetGame() {
    gameState.score.p1 = 0;
    gameState.score.p2 = 0;
    resetBall();
    gameState.isPlaying = true;
}

function gameLoop(timestamp = 0) {
    if (!gameState.isPlaying) return;
    
    if (!gameState.isPaused) {
        // Only update time when not paused
        if (gameState.lastTime === 0) {
            gameState.lastTime = timestamp;
        }
        gameState.deltaTime = timestamp - gameState.lastTime;
        gameState.lastTime = timestamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (gameState.score.p1 >= WINNING_SCORE || gameState.score.p2 >= WINNING_SCORE) {
            showGameOver();
            return;
        }

        updateGame(gameState.deltaTime);
        drawBall();
        drawPaddles();
        drawScore();
        
        // Store animation frame ID
        gameState.animationFrameId = requestAnimationFrame(gameLoop);
    } else {
        // Just draw pause screen when paused
        drawPauseScreen();
    }
}

function showGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const winner = gameState.score.p1 > gameState.score.p2;
    const winColor = winner ? '#ff0000' : '#0000ff';
    
    createText(
        `Player ${winner ? '1' : '2'} Wins!`,
        canvas.width/2,
        canvas.height/2 - 30,
        '50px',
        winColor,
        true
    );
    
    // Replay instruction with animation
    const scale = 1 + Math.sin(Date.now() / 500) * 0.1;
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2 + 40);
    ctx.scale(scale, scale);
    createText(
        isMobileDevice() ? 'Tap to play again' : 'Click to play again',
        0,
        0,
        '24px',
        'white',
        true
    );
    ctx.restore();

    // Add both click and touch handlers for restart
    canvas.addEventListener('click', restartGame);
    canvas.addEventListener('touchend', handleRestartTouch);
}

function restartGame() {
    canvas.removeEventListener('click', restartGame);
    canvas.removeEventListener('touchend', handleRestartTouch);
    resetGame();
    gameLoop();
}

// Handle window resize
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

// Initial setup
resizeCanvas();

// Start menu
function showMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create gradient
    var grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grd.addColorStop(0, "#ff0000");
    grd.addColorStop(1, "#0000ff");
    
    // Draw text with gradient fill
    ctx.fillStyle = grd;
    ctx.font = `bold ${Math.min(60, canvas.width/15)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText('PING PONG', canvas.width/2, canvas.height/2 - 40);
    
    // Instructions
    const fontSize = Math.min(20, canvas.width/30);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Update instructions based on device
    if (isMobileDevice()) {
        ctx.fillStyle = '#ff0000';
        ctx.fillText('Touch left side', canvas.width * 0.25, canvas.height - 50);
        ctx.fillStyle = '#0000ff';
        ctx.fillText('Touch right side', canvas.width * 0.75, canvas.height - 50);
    } else {
        ctx.fillStyle = '#ff0000';
        ctx.fillText('Player 1: W/S keys', canvas.width * 0.25, canvas.height - 50);
        ctx.fillStyle = '#0000ff';
        ctx.fillText('Player 2: ↑/↓ keys', canvas.width * 0.75, canvas.height - 50);
    }
    
    // Start instruction
    createText(
        'Tap/Click to Start',
        canvas.width/2,
        canvas.height/2 + 20,
        `${fontSize}px`,
        'white',
        true
    );
    
    // Pause instruction
    const pauseText = isMobileDevice() ? 'Tap ⏸️ to Pause' : 'Press P to Pause';
    createText(
        pauseText,
        canvas.width/2,
        canvas.height - 20,
        '16px',
        'white',
        true
    );
    
    canvas.addEventListener('click', startGame);
}

// Initialize game
function init() {
    resizeCanvas();
    showMenu();
    
    // Add both click and touch handlers for starting
    canvas.addEventListener('click', startGame);
    canvas.addEventListener('touchend', handleStartTouch);
}

function handleStartTouch(e) {
    e.preventDefault();
    if (!gameState.isPlaying) {
        startGame();
    }
}

function startGame() {
    canvas.removeEventListener('click', startGame);
    canvas.removeEventListener('touchend', handleStartTouch);
    resetGame();
    gameState.lastTime = 0;  // Reset time
    gameState.isPaused = false;
    gameLoop();
}

// Add pause functionality
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        // Cancel the animation frame when pausing
        if (gameState.animationFrameId) {
            cancelAnimationFrame(gameState.animationFrameId);
            gameState.animationFrameId = null;
        }
        drawPauseScreen();
    } else {
        // Reset last time to prevent large delta time
        gameState.lastTime = 0;
        gameLoop();
    }
}

function drawPauseScreen() {
    if (!gameState.isPaused) return;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    createText(
        'PAUSED',
        canvas.width/2,
        canvas.height/2 - 30,
        '40px',
        'white',
        true
    );
    createText(
        'Press P to continue',
        canvas.width/2,
        canvas.height/2 + 20,
        '20px',
        'white',
        true
    );
}

function handleRestartTouch(e) {
    e.preventDefault();
    restartGame();
}

function isMobileDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

// Start the game
init();
