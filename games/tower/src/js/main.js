const imgDir = 'src/img/';
const soundDir = 'src/sound/';


var game = new Game('gc', 800, 600, true);
game.canvas.addListener('click', handlemouseClick);
game.canvas.setBackgroundImage(game.addElement(game.ELEMENT.IMAGE, `${imgDir}background.png`, game.canvas.width, game.canvas.height, 0, 0));
setInterval(() => game.draw(drawing), 1000 / 60);

const INITIAL_MONEY = 45;
const INITIAL_LIVES = 15;

var shots = [];
var coins = [];
var towers = [];
var towersTypes = [];
var enemies = [];
var loseState = false;
var currentMoney = INITIAL_MONEY;
var currentLives = INITIAL_LIVES;
var towerPreview = null;
var enemiesCounter = 0;
var lastWave = 0;
var spawnEnemy1Interval;
var spawnEnemy2Interval;

// var test;
var loseText = game.addElement(game.ELEMENT.TEXT, 'white', 50, 'You lose', 350, 300);
var winText = game.addElement(game.ELEMENT.TEXT, 'white', 50, 'You win', 350, 300);

var livesCounter = game.addElement(game.ELEMENT.TEXT, 'white', 35, currentLives, game.canvas.width - 80, 55);
var livesCounterBackground = game.addElement(game.ELEMENT.RECT, 'rgba(0, 0, 0, 0.6)', 110, 45, game.canvas.width - 110, 20);
var heart = game.addElement(game.ELEMENT.IMAGE, `${imgDir}heart.png`, 30, 30, game.canvas.width - 50, 27);
var limit = game.addElement(game.ELEMENT.RECT, `red`, 10, 60, game.canvas.width + 10, 240);

var moneyCounter = game.addElement(game.ELEMENT.TEXT, 'white', 35, currentMoney, 80, 55);
var moneyCounterBackground = game.addElement(game.ELEMENT.RECT, 'rgba(0, 0, 0, 0.7)', 110, 45, 0, 20);
var coin = game.addElement(game.ELEMENT.IMAGE, `${imgDir}coin.png`, 508, 64, 10, 23);
coin.addAnimation('iddle', { rows: 1, cols: 8, update: 0.1, width: 35, height: 35 });
coin.setCurrentAnimation('iddle');

var towerSelectorBackground = game.addElement(game.ELEMENT.RECT, 'rgba(0, 0, 0, 0.7)', 250, 45, (game.canvas.width / 2) - 110, 0);
var tower1 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_1.png`, 40, 40, towerSelectorBackground.x + 20, 2.5, true);
var tower2 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_2.png`, 40, 40, tower1.x + 15 + tower1.width, 2.5, true);
var tower3 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_3.png`, 40, 40, tower2.x + 15 + tower2.width, 2.5, true);
var tower4 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_4.png`, 40, 40, tower3.x + 15 + tower3.width, 2.5, true);
tower1.towerRadius = 150;
tower1.color = '#7e92c4';
tower1.pointer = { color: '#4f5d7c', width: 5, hieght: 20 };
tower1.shot = { color: 'grey', width: 5, height: 10, speed: 7, fireRate: 0.5, damage: 2, timeout: null };
tower1.addListener("click", placeTower);

tower2.towerRadius = 125;
tower2.color = '#ec6401';
tower2.pointer = { color: '#4f5d7c', width: 5, hieght: 20 };
tower2.shot = { color: 'yellow', width: 3, height: 5, speed: 7, fireRate: 0.1, damage: 0.5, timeout: null };
tower2.addListener("click", placeTower);

tower3.towerRadius = 160;
tower3.color = '#e4e4e4';
tower3.pointer = { color: 'red', width: 5, hieght: 20 };
tower3.shot = { color: 'red', width: 2, height: 10, speed: 2, fireRate: 3, damage: 5, timeout: null };
tower3.addListener("click", placeTower);

tower4.towerRadius = 400;
tower4.color = '#ffcb00';
tower4.pointer = { color: '#4f5d7c', width: 5, hieght: 20 };
tower4.shot = { color: 'brown', width: 2, height: 10, speed: 7, fireRate: 0.1, damage: 1, timeout: null };
tower4.addListener("click", placeTower);

towersTypes.push(tower1);
towersTypes.push(tower2);
towersTypes.push(tower3);
towersTypes.push(tower4);

coinDrop = game.addElement(game.ELEMENT.IMAGE, `${imgDir}coin.png`, 508, 64, -50, -50);
coinDrop.addAnimation('iddle', { rows: 1, cols: 8, update: 0.1, width: 15, height: 15 });
coinDrop.setCurrentAnimation('iddle');

reset();
var drawing = function () {
    moneyCounterBackground.print();
    coin.print();
    moneyCounter.print();
    livesCounterBackground.print();
    heart.print();
    livesCounter.print();
    towerSelectorBackground.print();
    for (var tt in towersTypes) towersTypes[tt].print();
    coinDrop.print();
    limit.print();

    if (towerPreview) {
        towerPreview.towerRadiusElm.print();
        towerPreview.print();
    }
    if (currentLives < 1) lose();
    for (var e in enemies) enemyRoutine(enemies[e], e);

    for (var s in shots) {
        shots[s].move({ x: true, y: true });
        shots[s].print();

        for (var e in enemies)
            if (shots[s] && enemies[e] && shots[s].collide(enemies[e])) {
                var aux = enemies[e].hitPoints;
                enemies[e].hitPoints -= shots[s].damage;
                var percentage = (enemies[e].hitPoints * enemies[e].lifeBar.width) / aux;
                enemies[e].lifeBar.width = percentage;

                game.removeElement(shots[s]);
                shots.splice(s, 1);
                s--
                if (enemies[e].hitPoints < 1) {
                    coinDrop.setX(enemies[e].x + (enemies[e].currentAnimation.width / 2));
                    coinDrop.setY(enemies[e].y + enemies[e].currentAnimation.height / 2);
                    setTimeout(() => { coinDrop.setX(-50); coinDrop.setY(-50); }, 1000 * 1);

                    currentMoney += enemies[e].drop;
                    moneyCounter.setText(currentMoney);
                    game.removeElement(enemies[e].lifeBar);
                    game.removeElement(enemies[e]);
                    enemies.splice(e, 1); e--;

                    if (enemiesCounter >= 50 && lastWave && enemies.length < 1) win();
                }
            }
        if (shots[s] && shots[s].outOfBounds()) {
            game.removeElement(shots[s]);
            shots.splice(s, 1); s--
        }
    }
    for (var t in towers) {
        for (var e in enemies) if (enemies[e] && enemies[e].whitinOfBounds(towers[t], towers[t].towerRadius)) shoot(enemies[e], towers[t]);
        if (towers[t].towerRadiusElm) towers[t].towerRadiusElm.print();
        towers[t].print();
        if (towers[t].pointer) towers[t].pointer.print();
    }
};

function spanwEnemy(enemiesSpeed, hitPoints, drop, image, width, height) {
    if (enemiesCounter >= 50) return;
    var newEnemy = game.addElement(game.ELEMENT.IMAGE, `${imgDir}${image}`, width, height, 1, 270, true);
    var lifeBar = game.addElement(game.ELEMENT.RECT, 'red', 20, 3, newEnemy.x + 10, newEnemy.y + newEnemy.width / 2);
    newEnemy.addAnimation('up', { rows: 4, cols: 9, currentRow: 0, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('left', { rows: 4, cols: 9, currentRow: 1, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('down', { rows: 4, cols: 9, currentRow: 2, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('right', { rows: 4, cols: 9, currentRow: 3, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('stop', { rows: 4, cols: 9, currentRow: 2, currentFrame: 1, fixedX: true, fixedY: true, update: 0.1 });
    newEnemy.enemiesSpeed = enemiesSpeed;
    newEnemy.hitPoints = hitPoints;
    newEnemy.lifeBar = lifeBar;
    newEnemy.drop = drop;
    newEnemy.setCurrentAnimation('right');
    newEnemy.setXSpeed(newEnemy.enemiesSpeed);
    newEnemy.setYSpeed(0);
    // test = game.addElement(game.ELEMENT.RECT, 'red', 2, 2, (newEnemy.x + newEnemy.currentAnimation.width/2), 
    // (newEnemy.y + newEnemy.currentAnimation.height/2));
    enemiesCounter++;
    if (enemiesCounter < 50) enemies.push(newEnemy);
    else lastWave = true;
}

function enemyRoutine(e, index) {
    if (e.x == 96 && e.y == 270 || e.x == 471 && e.y == 335) {
        e.setCurrentAnimation('up');
        e.setXSpeed(0);
        e.setYSpeed(-e.enemiesSpeed);
    }
    if (e.x == 96 && e.y == 96 || e.x == 260 && e.y == 335 || e.x == 471 && e.y == 217) {
        e.setCurrentAnimation('right');
        e.setXSpeed(e.enemiesSpeed);
        e.setYSpeed(0);
    }
    if (e.x == 260 && e.y == 96) {
        e.setCurrentAnimation('down');
        e.setXSpeed(0);
        e.setYSpeed(e.enemiesSpeed);
    }
    e.move({ x: true, y: true });
    e.print();

    // test.setX((e.x + e.currentAnimation.width/2));
    // test.setY((e.y + e.currentAnimation.height/2));
    // test.print();
    e.lifeBar.setX(e.x + (e.currentAnimation.width / 3));
    e.lifeBar.setY(e.y);
    e.lifeBar.print();

    if (limit.collide(e)) {
        currentLives--;
        livesCounter.setText(currentLives);
        game.removeElement(e.lifeBar);
        game.removeElement(e);
        enemies.splice(index, 1);
    }
}

function placeTower(e) {
    if (e.clientX && e.clientY && currentMoney >= 15) {
        let x = e.clientX;
        let y = e.clientY;
        for (var tt in towersTypes) {
            var elm = towersTypes[tt];
            if ((x > elm.x && x < (elm.x + elm.width)) && (y > elm.y && y < (elm.y + elm.height)) && !towerPreview) {
                towerPreview = addTowerPreview(elm, x, y);
                return;
            }
        }
    }
}

function reset() {
    game.play();
    if (spawnEnemy1Interval) clearInterval(spawnEnemy1Interval);
    spawnEnemy1Interval = setInterval(() => { if (game.state == game.STATE.PLAY) spanwEnemy(0.5, 20, 5, 'enemy_1.png', 572, 256); }, 1000 * 5);
    if (spawnEnemy2Interval) clearInterval(spawnEnemy2Interval);
    spawnEnemy2Interval; setInterval(() => { if (game.state == game.STATE.PLAY) spanwEnemy(1, 100, 15, 'enemy_2.png', 576, 256); }, 1000 * 23);
    shots = [];
    coins = [];
    towers = [];
    enemies = [];
    loseState = false;
    currentMoney = INITIAL_MONEY;
    currentLives = INITIAL_LIVES;
    towerPreview = null;
    enemiesCounter = 0;
    livesCounter.setText(currentLives);
    livesCounter.print();
    moneyCounter.setText(currentMoney);
    moneyCounter.print();
    lastWave = false;
}
function lose() {
    loseState = true;
    game.pause();
    loseText.print();
}
function win() {
    loseState = true;
    game.pause();
    winText.print();
}

function shoot(e, t) {
    if (t.shotTimeout) return;
    var c1 = (e.x + (e.currentAnimation.width / 2)) - t.x;
    var c2 = (e.y + (e.currentAnimation.height / 2)) - t.y;
    var angle = getAngle(c1, c2);
    t.pointer.setRotate({ x: t.x, y: t.y, width: 5 });
    t.pointer.setAngle(angle);
    var shot = game.addElement(game.ELEMENT.RECT, t.shot.color, t.shot.width, t.shot.height, t.x, t.y);
    shot.damage = t.shot.damage;
    shot.setRotate(true);
    shot.setAngle(angle);
    var xSpeed = 0;
    var ySpeed = 0;
    var distance = 30;
    var factorY = c2 < 0 ? -1 : 1;
    var factorX = c1 < 0 ? -1 : 1;
    c1 = e.x + distance - t.x;
    // c2 = e.y+distance-t.y;

    c1 = Math.abs(c1);
    c2 = Math.abs(c2);
    if (c1 > c2) {
        xSpeed = (t.shot.speed * c1) / (c1 + c2);
        ySpeed = t.shot.speed - xSpeed;
    } else {
        ySpeed = (t.shot.speed * c2) / (c1 + c2);
        xSpeed = t.shot.speed - ySpeed;
    }
    shot.setXSpeed(xSpeed * factorX);
    shot.setYSpeed(ySpeed * factorY);

    shots.push(shot);
    t.shotTimeout = setTimeout(() => { clearTimeout(t.shotTimeout); t.shotTimeout = null; }, 1000 * t.shot.fireRate);
}

function getAngle(c1, c2) {
    var angle = Math.atan(c1 / c2) * -1;
    if (c1 < 0 && c2 < 0 || c1 > 0 && c2 < 0) angle += Math.PI;
    return angle
}

function addTower(tower) {
    var newTower = Object.create(tower);
    newTower.towerRadiusElm = null;
    newTower.shotTimeout = null;
    newTower.pointer = game.addElement(game.ELEMENT.RECT, tower.pointer.color, tower.pointer.width, tower.pointer.hieght, tower.x - 2.5, tower.y + tower.width / 2);
    newTower.removeListener("click");
    newTower.addListener("click", (e) => {
        console.log("newTower newTower", e);
        if (towerPreview) return;
        if (newTower.towerRadiusElm) newTower.towerRadiusElm = null;
        else newTower.towerRadiusElm = game.addElement(game.ELEMENT.CIRCLE, 'rgba(255, 255, 255, 0.2)', newTower.towerRadius, newTower.x, newTower.y);
    });
    towers.push(newTower);
}

function addTowerPreview(tower, x, y) {
    var newTower = game.addElement(game.ELEMENT.CIRCLE, tower.color, 20, x, y, true);
    var towerRadius = game.addElement(game.ELEMENT.CIRCLE, 'rgba(255, 255, 255, 0.2)', tower.towerRadius, x, y);
    newTower.towerRadiusElm = towerRadius;
    newTower.color = tower.color;
    newTower.towerRadius = tower.towerRadius;
    newTower.pointer = tower.pointer;
    newTower.shot = tower.shot;
    newTower.addListener("click", () => {
        if (currentMoney < towerPreview.cost) return;
        currentMoney -= 15;
        moneyCounter.setText(currentMoney);
        addTower(towerPreview);
        game.removeElement(towerPreview.towerRadius);
        game.removeElement(towerPreview);
        towerPreview = null;
    });
    return newTower;
}

/* Custom Listeners */
function removePreview(evt) {
    if (evt.keyCode == game.KEY.ESC && towerPreview) {
        game.removeElement(towerPreview.towerRadius);
        game.removeElement(towerPreview);
        towerPreview = null;
    }
}
function handlemouseClick(e) {
    if (loseState) return reset();
}

game.canvas.addListener('mousemove', () => {
    if (!towerPreview) return;
    let x = game.canvas.mousePosition.x;
    let y = game.canvas.mousePosition.y;
    var grid = 50;
    for (var i = 0; i < game.canvas.width; i += grid) {
        for (var j = 0; j < game.canvas.height; j += grid) {
            if ((x > i && x < (i + grid)) && (y > j && y < (j + grid))) {
                x = i + (grid / 2);
                y = j + (grid / 2);
                towerPreview.towerRadiusElm.setX(x);
                towerPreview.towerRadiusElm.setY(y);
                towerPreview.setX(x);
                towerPreview.setY(y);
                return;
            }
        }
    }
})