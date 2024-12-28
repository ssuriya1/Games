const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Update button references at the top
const desktopStartBtn = document.getElementById("desktopStartBtn");
const mobileStartBtn = document.getElementById("mobileStartBtn");
const pauseButton = document.getElementById("pauseBtn");
const mobilePauseBtn = document.getElementById("mobilePauseBtn");

// Add audio elements
const playerShootSound = document.getElementById('playerShoot');
const bossShootSound = document.getElementById('bossShoot');
const bgMusic = document.getElementById('bgMusic');
const soundVolume = document.getElementById('soundVolume');
const musicVolume = document.getElementById('musicVolume');

// Add near the top with other const declarations
const pauseMenu = document.getElementById('pauseMenu');
const resumeButton = document.getElementById('resumeButton');

const GAME_SETTINGS = {
  BULLET_POOL_SIZE: 30,
  BOSS_HEALTH: 500,
  PLAYER_HEALTH: 100,
  BOSS_SCORE_THRESHOLD: 1300,
  MAX_ENEMIES: 10,
  BULLET_SPEED: 15,
  FIRE_RATE: 150,
  ENEMY_BASE_SPEED: 1,
  BOSS_INTERVAL: 100,
  AUTO_FIRE_RATE: 200,
  BOSS_BULLET_SPEED: 3,
  BOSS_BULLET_SIZE: 5,
  BOSS_FIRE_RATE: 0.2,
  BOSS_TYPES: {
    MINI_BOSS: {
      health: 300,
      width: 100,
      height: 60,
      speed: 3,
      color: "#ff3366",
      glowColor: "#ff0044",
      bulletSpeed: 5,
      bulletSize: 6,
      fireRate: 0.005,
      score: 10
    },
    FINAL_BOSS: {
      health: 800,
      width: 150,
      height: 100,
      speed: 2,
      color: "#ff0000",
      glowColor: "#990000",
      bulletSpeed: 7,
      bulletSize: 10,
      fireRate: 0.03,
      score: 500
    }
  },
  NORMAL_BULLET_SPEED: 15,
  NORMAL_FIRE_RATE: 200,
  POWERED_BULLET_SPEED: 25,
  POWERED_FIRE_RATE: 100,
  NORMAL_PLAYER_SPEED: 5,
  POWERED_PLAYER_SPEED: 8,
};

const bulletPool = Array(GAME_SETTINGS.BULLET_POOL_SIZE)
  .fill(null)
  .map(() => ({
    active: false,
    x: 0,
    y: 0,
    width: 5,
    height: 10,
    speed: GAME_SETTINGS.BULLET_SPEED,
  }));

const mobileControls = {
    up: false,
    down: false,
    left: false,
    right: false
};

let canvasWidth, canvasHeight;
let lastFireTime = 0;

let spaceship,
  bullets,
  enemies,
  bossBullets,
  score,
  level,
  gameOver,
  keys,
  boss,
  paused,
  playerHealth;

function initializeGame() {
  canvasWidth = Math.min(window.innerWidth * 0.8, 500);
  canvasHeight = window.innerHeight * 0.85;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  spaceship = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: GAME_SETTINGS.NORMAL_PLAYER_SPEED,
  };

  bullets = [];
  enemies = [];
  bossBullets = [];
  score = 0;
  level = 1;
  gameOver = false;
  paused = false;
  boss = null;
  playerHealth = 100;
  keys = {};
}

initializeGame();

document.addEventListener("keydown", (e) => (keys[e.key] = true));
document.addEventListener("keyup", (e) => (keys[e.key] = false));

function setupMobileControls() {
    ['up', 'down', 'left', 'right'].forEach(direction => {
        const btn = document.getElementById(`${direction}Btn`);
        if (btn) {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                mobileControls[direction] = true;
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                mobileControls[direction] = false;
            });
        }
    });
}

// Audio management functions
function initAudio() {
    updateVolumes();
    soundVolume.addEventListener('change', updateVolumes);
    musicVolume.addEventListener('change', updateVolumes);
    // Start background music when page loads
    bgMusic.play().catch(error => {
        console.log("Auto-play prevented. Click anywhere to start music.");
        document.addEventListener('click', () => {
            bgMusic.play();
        }, { once: true });
    });
}

initAudio();

function updateVolumes() {
    playerShootSound.volume = soundVolume.value;
    bossShootSound.volume = soundVolume.value;
    bgMusic.volume = musicVolume.value;
}

function playSound(audio) {
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.play();
}

// Update the togglePause function
function togglePause() {
    paused = !paused;
    if (!paused) {
        pauseMenu.classList.remove('active');
        requestAnimationFrame(gameLoop);
        bgMusic.play();
    } else {
        pauseMenu.classList.add('active');
        bgMusic.pause();
        // Add debug log
        console.log('Pause menu state:', {
            paused,
            menuVisible: pauseMenu.classList.contains('active'),
            menuDisplay: window.getComputedStyle(pauseMenu).display
        });
    }
}

// Update event listeners section
desktopStartBtn.addEventListener("click", startGame);
mobileStartBtn.addEventListener("click", startGame);
pauseButton.addEventListener('click', togglePause);
mobilePauseBtn.addEventListener('click', togglePause);
resumeButton.addEventListener('click', togglePause);

// Update startGame function
function startGame() {
    // Hide start buttons
    if (desktopStartBtn) desktopStartBtn.style.display = "none";
    if (mobileStartBtn) mobileStartBtn.style.display = "none";
    
    // Show pause buttons
    if (pauseButton) pauseButton.style.display = "inline-flex";
    if (mobilePauseBtn) mobilePauseBtn.style.display = "inline-flex";
    
    initializeGame();
    paused = false;
    requestAnimationFrame(gameLoop);
    if (bgMusic) bgMusic.play();
}

let lastTime = 0;
// Update gameLoop function
function gameLoop(timestamp) {
    if (!gameOver && !paused) {
        const deltaTime = timestamp - lastTime;
        if (deltaTime >= 16) {
            lastTime = timestamp;
            update();
            draw();
        }
        requestAnimationFrame(gameLoop);
    }
}

// Update draw function
function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Add semi-transparent overlay for better visibility
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawUI();
    drawSpaceship();
    drawBullets();
    drawEnemies();
    if (boss) {
        drawBoss();
        drawBossBullets();
    }
}

function update() {
  updatePlayer();
  autoFire();
  updateBullets();
  updateEnemies();
  if (boss) updateBoss();
  checkBossSpawn();
}

function autoFire() {
  const currentTime = Date.now();
  if (currentTime - lastFireTime >= GAME_SETTINGS.AUTO_FIRE_RATE && !paused) {
    const inactiveBullet = bulletPool.find(bullet => !bullet.active);
    if (inactiveBullet) {
      inactiveBullet.active = true;
      inactiveBullet.x = spaceship.x + spaceship.width / 2 - 2.5;
      inactiveBullet.y = spaceship.y;
      playSound(playerShootSound);
    }
    lastFireTime = currentTime;
  }
}

function checkBossSpawn() {
  if (!boss && score > 0 && score % GAME_SETTINGS.BOSS_INTERVAL === 0) {
    spawnBoss();
  }
}

function updatePlayer() {
  if (keys["ArrowLeft"] || mobileControls.left)
    spaceship.x = Math.max(0, spaceship.x - spaceship.speed);
  if (keys["ArrowRight"] || mobileControls.right)
    spaceship.x = Math.min(canvasWidth - spaceship.width, spaceship.x + spaceship.speed);
  if (keys["ArrowDown"] || mobileControls.down)
    spaceship.y = Math.min(canvasHeight - spaceship.height, spaceship.y + spaceship.speed);
  if (keys["ArrowUp"] || mobileControls.up)
    spaceship.y = Math.max(canvasHeight / 2, spaceship.y - spaceship.speed);
}

function updateBullets() {
  bulletPool.forEach((bullet) => {
    if (!bullet.active) return;

    bullet.y -= bullet.speed;
    if (bullet.y < 0) bullet.active = false;

    if (boss && isColliding(bullet, boss)) {
      bullet.active = false;
      boss.health -= 3;
      if (boss.health <= 0) handleBossDefeat();
    }

    enemies.forEach((enemy, index) => {
      if (isColliding(bullet, enemy)) {
        bullet.active = false;
        enemies.splice(index, 1);
        score += 5;
      }
    });
  });
}

function updateEnemies() {
  // Don't spawn new enemies if boss exists
  if (!boss && enemies.length < GAME_SETTINGS.MAX_ENEMIES) {
    if (enemies.length === 0 && score >= GAME_SETTINGS.BOSS_SCORE_THRESHOLD) {
      spawnBoss();
    } else if (Math.random() < 0.01 * level) {
      spawnEnemy();
    }
  }

  // Update existing enemies
  enemies.forEach((enemy, index) => {
    // Remove enemy if boss appears
    if (boss) {
      enemies.splice(index, 1);
      return;
    }

    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) {
      gameOver = true;
      alert("Game Over! Your Score: " + score);
      document.location.reload();
    }
  });

  bossBullets.forEach((bullet, index) => {
    bullet.y += bullet.speedY;
    bullet.x += bullet.speedX;

    if (bullet.y > canvas.height) {
      bossBullets.splice(index, 1);
    }

    if (isColliding(bullet, spaceship)) {
      bossBullets.splice(index, 1);
      playerHealth -= 5;
      if (playerHealth <= 0) {
        gameOver = true;
        alert("Game Over! Your Score: " + score);
        document.location.reload();
      }
    }
  });

  if (!boss && level < 10 && score > level * 100) {
    level++;
  }
}

// Update the drawUI function
function drawUI() {
    // Draw Score at the center bottom
    ctx.fillStyle = "#00ff88";
    ctx.font = window.innerWidth <= 768 ? "bold 16px Arial" : "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}`, canvasWidth / 2, canvasHeight - canvasHeight + 20);

    // Adjust health bar positions
    const barWidth = window.innerWidth <= 768 ? 100 : 150;
    const barHeight = window.innerWidth <= 768 ? 12 : 15;
    const barPadding = window.innerWidth <= 768 ? 20 : 20;
    drawHealthBar(barPadding, barPadding, barWidth, barHeight, playerHealth, "#00ff88", "Player");

    // Boss health bar (right) if boss exists
    if (boss) {
        drawHealthBar(
            canvasWidth - barWidth - barPadding, 
            barPadding, 
            barWidth, 
            barHeight, 
            (boss.health / boss.maxHealth) * 100,
            "#ff3366",
            boss.type === 'FINAL_BOSS' ? "Final Boss" : "Mini Boss"
        );
    }
}

function drawSpaceship() {
  ctx.fillStyle = "#00ff88";
  ctx.beginPath();
  ctx.moveTo(spaceship.x + spaceship.width / 2, spaceship.y);
  ctx.lineTo(spaceship.x, spaceship.y + spaceship.height);
  ctx.lineTo(spaceship.x + spaceship.width, spaceship.y + spaceship.height);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBullets() {
  ctx.fillStyle = "#fff";
  bulletPool.forEach((bullet) => {
    if (!bullet.active) return;
    ctx.beginPath();
    ctx.arc(
      bullet.x + bullet.width / 2,
      bullet.y + bullet.height / 2,
      bullet.width / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ff88";
  });
  ctx.shadowBlur = 0;
}

function drawEnemies() {
  ctx.fillStyle = "#ff3366";
  enemies.forEach((enemy) => {
    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    ctx.rotate(Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, -enemy.height / 2);
    ctx.lineTo(-enemy.width / 2, enemy.height / 2);
    ctx.lineTo(enemy.width / 2, enemy.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function drawBoss() {
  const bossType = GAME_SETTINGS.BOSS_TYPES[boss.type];

  // Draw boss body
  const gradient = ctx.createLinearGradient(boss.x, boss.y, boss.x, boss.y + boss.height);
  gradient.addColorStop(0, bossType.color);
  gradient.addColorStop(1, bossType.glowColor);
  ctx.fillStyle = gradient;

  if (boss.type === 'FINAL_BOSS') {
    // Draw final boss (more complex shape)
    ctx.beginPath();
    ctx.moveTo(boss.x + boss.width/2, boss.y);
    ctx.lineTo(boss.x, boss.y + boss.height/3);
    ctx.lineTo(boss.x - 20, boss.y + boss.height/2);
    ctx.lineTo(boss.x, boss.y + boss.height);
    ctx.lineTo(boss.x + boss.width, boss.y + boss.height);
    ctx.lineTo(boss.x + boss.width + 20, boss.y + boss.height/2);
    ctx.lineTo(boss.x + boss.width, boss.y + boss.height/3);
    ctx.closePath();
  } else {
    // Draw mini boss (simpler shape)
    ctx.beginPath();
    ctx.moveTo(boss.x + boss.width/2, boss.y);
    ctx.lineTo(boss.x, boss.y + boss.height);
    ctx.lineTo(boss.x + boss.width, boss.y + boss.height);
    ctx.closePath();
  }
  
  ctx.fill();
  ctx.strokeStyle = bossType.glowColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 15;
  ctx.shadowColor = bossType.glowColor;

  // Add boss details
  ctx.fillStyle = bossType.glowColor;
  ctx.beginPath();
  const eyeSize = boss.type === 'FINAL_BOSS' ? 20 : 15;
  ctx.arc(boss.x + boss.width/4, boss.y + boss.height/2, eyeSize, 0, Math.PI * 2);
  ctx.arc(boss.x + (boss.width * 3/4), boss.y + boss.height/2, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Draw health bar
  const bossHealthPercentage = (boss.health / boss.maxHealth) * 100;
  drawHealthBar(canvasWidth - 170, 20, 150, 15, bossHealthPercentage, bossType.color, 
      boss.type === 'FINAL_BOSS' ? "Final Boss" : "Mini Boss");
}

function drawHealthBar(x, y, width, height, healthPercentage, color, label) {
    // Adjust size for mobile
    if (window.innerWidth <= 768) {
        width = width * 0.7;
        height = height * 0.8;
        x = x * 0.8;
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(x, y, width, height);
    
    let gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "#ffffff");
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, (healthPercentage / 100) * width, height);
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${label}: ${Math.ceil(healthPercentage)}%`, x, y - 5);
}

function fireBullet() {
  const currentTime = Date.now();
  if (currentTime - lastFireTime >= GAME_SETTINGS.FIRE_RATE) {
    const inactiveBullet = bulletPool.find((bullet) => !bullet.active);
    if (inactiveBullet) {
      inactiveBullet.active = true;
      inactiveBullet.x = spaceship.x + spaceship.width / 2 - 2.5;
      inactiveBullet.y = spaceship.y;
    }
    lastFireTime = currentTime;
  }
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvasWidth - 40),
    y: -40,
    width: 40,
    height: 40,
    speed: GAME_SETTINGS.ENEMY_BASE_SPEED + level * 0.1,
    health: 30,
    maxHealth: 30,
    rotation: Math.PI,
  });
}

function spawnBoss() {
  const isFinalBoss = score >= 1000;
  const bossType = isFinalBoss ? GAME_SETTINGS.BOSS_TYPES.FINAL_BOSS : GAME_SETTINGS.BOSS_TYPES.MINI_BOSS;
  enemies = [];

  // Power up player for final boss
  if (isFinalBoss) {
    playerHealth = GAME_SETTINGS.PLAYER_HEALTH;
    GAME_SETTINGS.BULLET_SPEED = GAME_SETTINGS.POWERED_BULLET_SPEED;
    GAME_SETTINGS.AUTO_FIRE_RATE = GAME_SETTINGS.POWERED_FIRE_RATE;
    spaceship.speed = GAME_SETTINGS.POWERED_PLAYER_SPEED;
  }
  
  boss = {
      x: canvas.width / 2 - bossType.width / 2,
      y: 50,
      width: bossType.width,
      height: bossType.height,
      speed: bossType.speed,
      health: bossType.health,
      maxHealth: bossType.health,
      direction: 1,
      type: isFinalBoss ? 'FINAL_BOSS' : 'MINI_BOSS',
      fireRate: bossType.fireRate,
      bulletSpeed: bossType.bulletSpeed,
      bulletSize: bossType.bulletSize,
      score: bossType.score
  };
}

function updateBoss() {
  boss.x += boss.speed * boss.direction;

  if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
    boss.direction *= -1;

    fireBossBullets();
  }

  if (Math.random() < boss.fireRate) {
    fireBossBullets();
  }
}

function fireBossBullets() {
  const angles = boss.type === 'FINAL_BOSS' ? [-45, -30, -15, 0, 15, 30, 45] : [-30, -15, 0, 15, 30];
  angles.forEach(angle => {
      const radians = (angle * Math.PI) / 180;
      bossBullets.push({
          x: boss.x + boss.width/2 - boss.bulletSize/2,
          y: boss.y + boss.height,
          width: boss.bulletSize,
          height: boss.bulletSize,
          speedX: Math.sin(radians) * boss.bulletSpeed,
          speedY: Math.cos(radians) * boss.bulletSpeed
      });
  });
  playSound(bossShootSound);
}

function drawBossBullets() {
  ctx.fillStyle = "#ff3366";
  bossBullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(
      bullet.x + bullet.width/2,
      bullet.y + bullet.height/2,
      bullet.width/2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff0044";
  });
  ctx.shadowBlur = 0;
}

function isColliding(a, b) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

function handleBossDefeat() {
  const scoreIncrease = boss.score;
  score += scoreIncrease;
  boss = null;

  // Reset player stats after boss fight
  GAME_SETTINGS.BULLET_SPEED = GAME_SETTINGS.NORMAL_BULLET_SPEED;
  GAME_SETTINGS.AUTO_FIRE_RATE = GAME_SETTINGS.NORMAL_FIRE_RATE;
  spaceship.speed = GAME_SETTINGS.NORMAL_PLAYER_SPEED;

  if (score >= 1500) {
    gameOver = true;
    alert(`Congratulations! You defeated the final boss! Final Score: ${score}`);
    document.location.reload();
  } else {
    gameOver = false;
  }
}

// Initialize audio when game loads
setupMobileControls();
