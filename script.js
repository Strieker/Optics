const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const progressBar = document.querySelector("progress");
const gameOverInnerHTML = "Game Over";
const stripeWidth = 30;

function distanceBetween(c1, c2) {
  return Math.hypot(c1.x - c2.x, c1.y - c2.y);
}

function circlesCollided(c1, c2) {
  return distanceBetween(c1, c2) < c1.radius + c2.radius;
}

function rectanglesOverlapped(r1, r2) {
  return (
    r1.x + r1.width / 2 > r2.x &&
    r2.x + r2.width / 2 > r1.x &&
    r1.y + r1.height > r2.y &&
    r2.y + r2.height > r1.y
  );
}

function boundedBySquare(c) {
  return {
    x: c.x - c.radius / 2,
    y: c.y - c.radius / 2,
    width: 2 * c.radius,
    height: 2 * c.radius
  };
}

function randomCoord() {
  let i = 20;
  return i * Math.floor(Math.random() * 56);
}

function restartGame() {
  if (document.getElementById("title").innerHTML === gameOverInnerHTML) {
    location.reload();
  }
}

canvas.addEventListener("click", restartGame);

let mouse = { x: 0, y: 0 };
document.body.addEventListener("mousemove", updateMouse);

function updateMouse(event) {
  const { left, top, right, bottom } = canvas.getBoundingClientRect();
  if (event.clientX >= left && event.clientX <= right) {
    mouse.x = event.clientX - left;
  }
  if (event.clientY >= top && event.clientY <= bottom) {
    mouse.y = event.clientY - top;
  }
}

document.body.addEventListener("keydown", updateColor, false);

function updateColor(e) {
  let space = false;
  if (e.keyCode !== 32) {
    space = false;
  }
  if (e.keyCode === 32) {
    space = true;

    function changeColor(objectArray) {
      objectArray.forEach((object, i) => {
        if (object.color !== "black" && object.color !== "black") {
          object.color = "black";
        } else {
          object.color = ["cyan", "pink", "yellow"][i % 3];
        }
      });
    }
    changeColor(enemies);
    changeColor(obstacles);
  }
}

class Sprite {
  constructor(x, y, radius, color, speed) {
    Object.assign(this, { x, y, radius, color, speed });
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

let player = new Sprite(250, 150, 15, "#FF2D00", 0.04);

let enemies = [
  new Sprite(80, 220, 20, "yellow", 0.01),
  new Sprite(350, 500, 10, "yellow", 0.054),
  new Sprite(300, 300, 20, "pink", 0.007),
  new Sprite(150, 600, 10, "pink", 0.077),
  new Sprite(280, 620, 20, "cyan", 0.021),
  new Sprite(200, 100, 10, "cyan", 0.0023)
];

function pursue(leader, follower, speed) {
  follower.x += (leader.x - follower.x) * speed;
  follower.y += (leader.y - follower.y) * speed;
}

class Obstacle {
  constructor(width, height) {
    Object.assign(this, {width, height });
    this.dy = 10;
    this.timer = 0;
    this.color = ["cyan", "pink", "yellow"][Math.floor(Math.random() * 3)];
    this.x = randomCoord();
    this.y = randomCoord();
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

let obstacles = [
  new Obstacle(10, 60),
  new Obstacle(40, 70),
  new Obstacle(70, 80),
  new Obstacle(60, 20),
  new Obstacle(10, 70),
  new Obstacle(50, 10),
  new Obstacle(60, 20),
  new Obstacle(30, 10),
  new Obstacle(10, 20)
];

function playerCollidedObstacle(player, obstacle) {
  return rectanglesOverlapped(boundedBySquare(player), obstacle);
}

function changeObstaclePosition(obstacle) {
  obstacle.y += obstacle.dy;
  if (obstacle.y <= 0) {
    obstacle.dy = 10;
  } else if (obstacle.y >= canvas.height) {
    obstacle.dy = -10;
  }
  obstacle.timer += 1;
  if (obstacle.timer % 100 === 0) {
    obstacle.x = randomCoord();
    obstacle.y = randomCoord();
  }
}


function updateScene() {
  pursue(mouse, player, player.speed);
  enemies.forEach(enemy => {
    pursue(player, enemy, enemy.speed);
    if (circlesCollided(player, enemy)) {
      progressBar.value -= 1;
    }
  });
  obstacles.forEach(obstacle => {
    changeObstaclePosition(obstacle);
    if (playerCollidedObstacle(player, obstacle)) {
      progressBar.value -= 1;
    }
  });
}

function clearBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width; x += stripeWidth) {
    ctx.fillStyle = x % (2 * stripeWidth) === 0 ? "white" : "black";
    ctx.fillRect(x, 0, stripeWidth, canvas.height);
  }
}

let currentScore = 0;
function updateCurrentScore() {
  if (progressBar.value > 0) {
    currentScore += 60;
    requestAnimationFrame(drawScene);
    document.getElementById(
      "current_score"
    ).innerHTML = `Current Score: ${currentScore}`;
  }
}

let highScore = 0;
function updateHighScore() {
  if (!(progressBar.value > 0)) {
    document.getElementById("title").innerHTML = gameOverInnerHTML;
    var oldHighScore = JSON.parse(localStorage.getItem("highScore")) || -1;
    highScore = oldHighScore;
    if (oldHighScore < currentScore) {
      highScore = currentScore;
    }
    localStorage.setItem("highScore", JSON.stringify(highScore));
    document.getElementById(
      "high_score"
    ).innerHTML = `High Score: ${highScore}`;
    clearBackground();
  }
}

function drawScene() {
  clearBackground();
  player.draw();
  enemies.forEach(enemy => enemy.draw());
  obstacles.forEach(obstacle => obstacle.draw());
  updateScene();
  updateCurrentScore();
  updateHighScore();
}

requestAnimationFrame(drawScene);
