const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.querySelector("#score");
const livesElement = document.querySelector("#lives");
const message = document.querySelector("#message");
const startButton = document.querySelector("#startButton");

const WORLD_WIDTH = 3600;
const GRAVITY = 0.65;
const keys = { left: false, right: false, jump: false };
let animationFrame;
let game;

const level = {
    platforms: [
        { x: 0, y: 460, width: 620, height: 80 },
        { x: 760, y: 410, width: 360, height: 130 },
        { x: 1250, y: 460, width: 720, height: 80 },
        { x: 2130, y: 385, width: 350, height: 155 },
        { x: 2640, y: 455, width: 960, height: 85 },
    ],
    coins: [
        { x: 230, y: 390 }, { x: 470, y: 330 }, { x: 860, y: 340 },
        { x: 1020, y: 340 }, { x: 1430, y: 390 }, { x: 1740, y: 390 },
        { x: 2240, y: 315 }, { x: 2350, y: 315 }, { x: 2900, y: 385 },
        { x: 3250, y: 385 },
    ],
    enemies: [
        { x: 440, y: 420, width: 34, height: 40, min: 350, max: 570, speed: 1.2 },
        { x: 1550, y: 420, width: 34, height: 40, min: 1350, max: 1900, speed: 1.5 },
        { x: 2220, y: 345, width: 34, height: 40, min: 2150, max: 2400, speed: 1.1 },
    ],
};

function newGame() {
    return {
        running: false,
        won: false,
        score: 0,
        lives: 3,
        cameraX: 0,
        player: { x: 80, y: 380, width: 30, height: 50, vx: 0, vy: 0, grounded: false },
        coins: level.coins.map((coin) => ({ ...coin, collected: false })),
        enemies: level.enemies.map((enemy) => ({ ...enemy, direction: 1 })),
    };
}

function startGame() {
    cancelAnimationFrame(animationFrame);
    game = newGame();
    game.running = true;
    message.classList.add("hidden");
    updateHud();
    animationFrame = requestAnimationFrame(loop);
}

function endGame(won) {
    game.running = false;
    game.won = won;
    message.querySelector("h2").textContent = won ? "Level complete!" : "Game over";
    message.querySelector("p").textContent = won
        ? `You collected ${game.score} points.`
        : "The drones got you. Try again!";
    startButton.textContent = "Play again";
    message.classList.remove("hidden");
}

function resetPlayer() {
    game.lives -= 1;
    if (game.lives <= 0) {
        endGame(false);
        return;
    }
    game.player.x = Math.max(80, game.player.x - 180);
    game.player.y = 300;
    game.player.vx = 0;
    game.player.vy = 0;
    updateHud();
}

function overlaps(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
        a.y < b.y + b.height && a.y + a.height > b.y;
}

function update() {
    const player = game.player;
    player.vx = (keys.right ? 4.5 : 0) - (keys.left ? 4.5 : 0);
    if (keys.jump && player.grounded) {
        player.vy = -12;
        player.grounded = false;
    }
    player.vy += GRAVITY;
    player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x + player.vx));
    player.y += player.vy;
    player.grounded = false;

    for (const platform of level.platforms) {
        const landing = player.y + player.height <= platform.y &&
            player.y + player.height + player.vy >= platform.y &&
            player.x + player.width > platform.x && player.x < platform.x + platform.width;
        if (landing) {
            player.y = platform.y - player.height;
            player.vy = 0;
            player.grounded = true;
        }
    }

    if (player.y > canvas.height + 100) resetPlayer();

    for (const coin of game.coins) {
        if (!coin.collected && overlaps(player, { x: coin.x - 12, y: coin.y - 12, width: 24, height: 24 })) {
            coin.collected = true;
            game.score += 10;
        }
    }

    for (const enemy of game.enemies) {
        enemy.x += enemy.speed * enemy.direction;
        if (enemy.x <= enemy.min || enemy.x >= enemy.max) enemy.direction *= -1;
        if (overlaps(player, enemy)) resetPlayer();
    }

    if (player.x > 3480) endGame(true);
    game.cameraX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, player.x - canvas.width * 0.35));
    updateHud();
}

function draw() {
    const player = game.player;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#173c66");
    sky.addColorStop(1, "#8dd5d2");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(-game.cameraX, 0);
    ctx.fillStyle = "#6ab5b1";
    for (let x = -200; x < WORLD_WIDTH; x += 360) ctx.fillRect(x, 330, 180, 130);

    for (const platform of level.platforms) {
        ctx.fillStyle = "#18334e";
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = "#55d6be";
        ctx.fillRect(platform.x, platform.y, platform.width, 9);
    }

    for (const coin of game.coins) {
        if (!coin.collected) {
            ctx.fillStyle = "#ffd166";
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (const enemy of game.enemies) {
        ctx.fillStyle = "#ef476f";
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = "#08111f";
        ctx.fillRect(enemy.x + 7, enemy.y + 10, 7, 7);
        ctx.fillRect(enemy.x + 21, enemy.y + 10, 7, 7);
    }

    ctx.fillStyle = "#f7f7ff";
    ctx.fillRect(3480, 250, 8, 210);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.moveTo(3488, 255);
    ctx.lineTo(3560, 280);
    ctx.lineTo(3488, 305);
    ctx.fill();

    ctx.fillStyle = "#55d6be";
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = "#06221f";
    ctx.fillRect(player.x + 18, player.y + 12, 6, 6);
    ctx.restore();
}

function loop() {
    if (!game.running) return;
    update();
    draw();
    animationFrame = requestAnimationFrame(loop);
}

function updateHud() {
    scoreElement.textContent = game.score;
    livesElement.textContent = game.lives;
}

function setKey(key, value) {
    keys[key] = value;
}

document.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "a"].includes(event.key)) setKey("left", true);
    if (["ArrowRight", "d"].includes(event.key)) setKey("right", true);
    if (["ArrowUp", "w", " "].includes(event.key)) {
        event.preventDefault();
        setKey("jump", true);
    }
});

document.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "a"].includes(event.key)) setKey("left", false);
    if (["ArrowRight", "d"].includes(event.key)) setKey("right", false);
    if (["ArrowUp", "w", " "].includes(event.key)) setKey("jump", false);
});

document.querySelectorAll("[data-key]").forEach((button) => {
    const key = button.dataset.key;
    button.addEventListener("pointerdown", () => setKey(key, true));
    button.addEventListener("pointerup", () => setKey(key, false));
    button.addEventListener("pointerleave", () => setKey(key, false));
});

startButton.addEventListener("click", startGame);
game = newGame();
draw();
