const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const startBtn = document.querySelector("#start");
const pauseBtn = document.querySelector("#pause");
const restartBtn = document.querySelector("#restart");
const speedEl = document.querySelector("#speed");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayText = document.querySelector("#overlay-text");

const gridSize = 20;
const tile = canvas.width / gridSize;
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

let snake;
let food;
let direction;
let nextDirection;
let score;
let timer;
let running;
let paused;
let best = Number(localStorage.getItem("snakeBest") || 0);

bestEl.textContent = best;
reset();

function reset() {
  snake = [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
  direction = directions.right;
  nextDirection = directions.right;
  score = 0;
  running = false;
  paused = false;
  clearInterval(timer);
  spawnFood();
  updateScore();
  draw();
  showOverlay("准备开始", "按空格或点击开始");
}

function start() {
  if (running && !paused) return;
  running = true;
  paused = false;
  hideOverlay();
  clearInterval(timer);
  timer = setInterval(tick, Number(speedEl.value));
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearInterval(timer);
    showOverlay("已暂停", "按空格继续");
  } else {
    hideOverlay();
    timer = setInterval(tick, Number(speedEl.value));
  }
}

function tick() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (isWallHit(head) || isSnakeHit(head)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > best) {
      best = score;
      localStorage.setItem("snakeBest", String(best));
    }
    updateScore();
    spawnFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameOver() {
  running = false;
  paused = false;
  clearInterval(timer);
  draw();
  showOverlay("游戏结束", "按重开或空格再来一局");
}

function spawnFood() {
  do {
    food = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake?.some((part) => part.x === food.x && part.y === food.y));
}

function draw() {
  ctx.fillStyle = "#0d151b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(244, 251, 248, 0.055)";
  ctx.lineWidth = 1;
  for (let i = 1; i < gridSize; i += 1) {
    const pos = i * tile;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    const inset = index === 0 ? 3 : 4;
    const x = part.x * tile + inset;
    const y = part.y * tile + inset;
    const size = tile - inset * 2;
    ctx.fillStyle = index === 0 ? "#7ee09a" : "#55c27a";
    ctx.strokeStyle = "#1f6f49";
    roundedRect(x, y, size, size, 7);
    ctx.fill();
    ctx.stroke();

    if (index === 0) {
      ctx.fillStyle = "#0d151b";
      const eyeSize = 3.4;
      const eyeOffsetX = direction.x === 0 ? 7 : direction.x > 0 ? 15 : 6;
      const eyeOffsetY = direction.y === 0 ? 7 : direction.y > 0 ? 15 : 6;
      ctx.beginPath();
      ctx.arc(part.x * tile + eyeOffsetX, part.y * tile + eyeOffsetY, eyeSize, 0, Math.PI * 2);
      ctx.arc(part.x * tile + (direction.x === 0 ? 19 : eyeOffsetX), part.y * tile + (direction.y === 0 ? 19 : eyeOffsetY), eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawFood() {
  const cx = food.x * tile + tile / 2;
  const cy = food.y * tile + tile / 2;
  ctx.fillStyle = "#ff6b57";
  ctx.beginPath();
  ctx.arc(cx, cy, tile * 0.34, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f7c65a";
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 5, tile * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function setDirection(name) {
  const proposed = directions[name];
  if (!proposed) return;
  if (proposed.x + direction.x === 0 && proposed.y + direction.y === 0) return;
  nextDirection = proposed;
}

function isWallHit(head) {
  return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
}

function isSnakeHit(head) {
  return snake.some((part) => part.x === head.x && part.y === head.y);
}

function updateScore() {
  scoreEl.textContent = score;
  bestEl.textContent = best;
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

document.addEventListener("keydown", (event) => {
  const keys = {
    ArrowUp: "up",
    w: "up",
    W: "up",
    ArrowDown: "down",
    s: "down",
    S: "down",
    ArrowLeft: "left",
    a: "left",
    A: "left",
    ArrowRight: "right",
    d: "right",
    D: "right",
  };

  if (keys[event.key]) {
    event.preventDefault();
    setDirection(keys[event.key]);
    start();
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (!running) start();
    else togglePause();
  }
});

document.querySelectorAll("[data-dir]").forEach((button) => {
  button.addEventListener("click", () => {
    setDirection(button.dataset.dir);
    start();
  });
});

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", reset);
speedEl.addEventListener("change", () => {
  if (running && !paused) start();
});
