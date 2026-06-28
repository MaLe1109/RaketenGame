const app = new PIXI.Application({ width: 800, height: 600, backgroundColor: 0x0a0e27 });
const ufoList = [];
const activeBullets = [];
const maxActiveBullets = 4;
let score = 0;
let highscore = Number(localStorage.getItem('raketeHighscore') || '0');
let ufoSpeed = 2;
let ufoSpawnDelay = 500;
let lastSpawnTime = performance.now();
let gameStartTime = performance.now();

document.body.appendChild(app.view);

// Sterne zeichnen
function createStars() {
  for (let i = 0; i < 100; i++) {
    const star = new PIXI.Graphics();
    star.beginFill(0xffffff);
    const size = Math.random() * 1.5 + 0.5;
    star.drawCircle(0, 0, size);
    star.endFill();
    star.x = Math.random() * 800;
    star.y = Math.random() * 400;
    star.alpha = Math.random() * 0.7 + 0.3;
    app.stage.addChild(star);
  }
}

// Mond zeichnen
function createMoon() {
  const moon = new PIXI.Graphics();
  moon.beginFill(0xf4f1de);
  moon.drawCircle(0, 0, 60);
  moon.endFill();
  moon.x = 700;
  moon.y = 100;
  
  // Mondkrater
  const crater1 = new PIXI.Graphics();
  crater1.beginFill(0x0a0e27);
  crater1.drawCircle(0, 0, 8);
  crater1.endFill();
  crater1.x = -15;
  crater1.y = -10;
  moon.addChild(crater1);
  
  const crater2 = new PIXI.Graphics();
  crater2.beginFill(0x0a0e27);
  crater2.drawCircle(0, 0, 5);
  crater2.endFill();
  crater2.x = 20;
  crater2.y = 15;
  moon.addChild(crater2);
  
  const crater3 = new PIXI.Graphics();
  crater3.beginFill(0x0a0e27);
  crater3.drawCircle(0, 0, 6);
  crater3.endFill();
  crater3.x = 10;
  crater3.y = -20;
  moon.addChild(crater3);
  
  app.stage.addChild(moon);
}

createStars();
createMoon();

const scoreText = new PIXI.Text('Score: 0', {
  fontFamily: 'Arial',
  fontSize: 24,
  fill: 0xffffff,
  fontWeight: 'bold'
});
scoreText.x = 10;
scoreText.y = 10;
app.stage.addChild(scoreText);

const highscoreText = new PIXI.Text('Highscore: ' + highscore, {
  fontFamily: 'Arial',
  fontSize: 20,
  fill: 0xffffff
});
highscoreText.x = 10;
highscoreText.y = 40;
app.stage.addChild(highscoreText);

const rocket = PIXI.Sprite.from('rocket.png');
rocket.x = 350;
rocket.y = 520;
rocket.scale.x = 0.05;
rocket.scale.y = 0.05;
app.stage.addChild(rocket);

gameInterval(function () {
  const now = performance.now();
  const elapsedSeconds = (now - gameStartTime) / 1000;
  ufoSpeed = 2 + Math.floor(elapsedSeconds / 10);
  ufoSpawnDelay = Math.max(200, 500 - Math.floor(elapsedSeconds * 10));

  if (now - lastSpawnTime < ufoSpawnDelay) {
    return;
  }

  lastSpawnTime = now;
  const ufo = PIXI.Sprite.from('ufo' + random(1,2) + '.png');
  ufo.x = random(0, 700);
  ufo.y = -25;
  ufo.scale.x = 0.1;
  ufo.scale.y = 0.1;
  app.stage.addChild(ufo);
  ufoList.push(ufo);
  flyDown(ufo, ufoSpeed);

  waitForCollision(ufo, rocket).then(function() {
    app.stage.removeChild(rocket);
    updateHighscore();
    stopGame();
  });
}, 50);

function leftKeyPressed(){
    rocket.x = rocket.x - 5;
}

function rightKeyPressed(){
    rocket.x = rocket.x + 5;
}

function spaceKeyPressed() {
  if (activeBullets.length >= maxActiveBullets) {
    return;
  }

  const bullet = PIXI.Sprite.from('bullet.png');
  bullet.x = rocket.x + 13;
  bullet.y = 500;
  bullet.scale.x = 0.02;
  bullet.scale.y = 0.02;
  activeBullets.push(bullet);
  app.stage.addChild(bullet);
  flyUp(bullet);

  const bulletMoveInterval = gameInterval(() => {
    if (bullet.y < -10) {
      removeActiveBullet(bullet);
      if (app.stage.children.includes(bullet)) app.stage.removeChild(bullet);
      clearInterval(bulletMoveInterval);
    }
  }, 50);

  waitForCollision(bullet, ufoList).then(function([bullet, ufo]) {
    clearInterval(bulletMoveInterval);
    removeActiveBullet(bullet);
    if (app.stage.children.includes(bullet)) app.stage.removeChild(bullet);
    if (app.stage.children.includes(ufo)) app.stage.removeChild(ufo);
    addScore(1);
  });
}

function addScore(amount) {
  score += amount;
  scoreText.text = 'Score: ' + score;
}

function updateHighscore() {
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('raketeHighscore', String(highscore));
    highscoreText.text = 'Highscore: ' + highscore;
  }
}

function removeActiveBullet(bullet) {
  const bulletIndex = activeBullets.indexOf(bullet);
  if (bulletIndex !== -1) {
    activeBullets.splice(bulletIndex, 1);
  }
}
