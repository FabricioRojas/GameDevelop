const imgDir = 'src/img/';
const soundDir = 'src/sound/';


var game = new Game('gc', 800, 600, true);
game.canvas.addListener('click', handlemouseClick);
game.canvas.setBackgroundImage(game.addElement(game.ELEMENT.IMAGE, `${imgDir}background.png`, game.canvas.width, game.canvas.height, 0, 0));

game.gui.addMenu("main_menu", "rgba(0, 0, 0, 0.6)", game.canvas.width / 2,
    game.canvas.height - 200, game.canvas.width / 2 - (game.canvas.width / 4), (game.canvas.height / 2 - (game.canvas.height / 3)), "white", 2);

game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "white", 30, "Resume", null, null, () => {
    game.play();
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "white", 30, "Restart", null, null, () => {
    game.reset();
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "white", 30, "Exit", null, null, () => {
    confirm("Sure you want to go?");
});

setInterval(() => game.draw(drawing), 1000 / 60);

const INITIAL_MONEY = 45;
const INITIAL_LIVES = 15;
const SCORE_TEXT = 'Your score: ';

var path = [
    { x: 26.5, y: 330 }, { x: 79.5, y: 330 }, { x: 132.5, y: 330 },
    { x: 132.5, y: 270 }, { x: 132.5, y: 210 }, { x: 132.5, y: 150 },
    { x: 185.5, y: 150 }, { x: 238.5, y: 150 }, { x: 291.5, y: 150 },
    { x: 291.5, y: 210 }, { x: 291.5, y: 270 }, { x: 291.5, y: 330 }, { x: 291.5, y: 390 },
    { x: 344.5, y: 390 }, { x: 397.5, y: 390 }, { x: 450.5, y: 390 }, { x: 503.5, y: 390 },
    { x: 503.5, y: 330 }, { x: 503.5, y: 270 },
    { x: 556.5, y: 270 }, { x: 609.5, y: 270 }, { x: 662.5, y: 270 }, { x: 715.5, y: 270 },
    { x: 79.5, y: 150 }, { x: 503.5, y: 210 },
];
var waves = [{
    enemy1: { speed: 0.5, hitPoints: 20, drop: 3, image: 'enemy_1.png', w: 572, h: 256, qty: 40 },
    enemy2: { speed: 1, hitPoints: 100, drop: 5, image: 'enemy_2.png', w: 572, h: 256, qty: 10 },
    boss: { speed: 1, hitPoints: 10000, drop: 15, image: 'enemy_2.png', w: 572, h: 256, qty: 1 }
},
{
    enemy1: { speed: 0.5, hitPoints: 80, drop: 5, image: 'enemy_1.png', w: 572, h: 256, qty: 50 },
    enemy2: { speed: 1, hitPoints: 500, drop: 15, image: 'enemy_2.png', w: 572, h: 256, qty: 11 },
    boss: { speed: 1, hitPoints: 50000, drop: 30, image: 'enemy_2.png', w: 572, h: 256, qty: 1 }
},
{
    enemy1: { speed: 0.5, hitPoints: 200, drop: 5, image: 'enemy_1.png', w: 572, h: 256, qty: 60 },
    enemy2: { speed: 1, hitPoints: 1000, drop: 15, image: 'enemy_2.png', w: 572, h: 256, qty: 12 },
    boss: { speed: 1, hitPoints: 100000, drop: 30, image: 'enemy_2.png', w: 572, h: 256, qty: 1 }
}
];

var shots = [];
var coins = [];
var towers = [];
var towersTypes = [];
var enemies = [];
var currentMoney = INITIAL_MONEY;
var currentLives = INITIAL_LIVES;
var currentPoints = 0;
var currentWave = 1;
var enemiesCounter = 0;
var enemyCounter = 0;
var ingameTime = 0;
var loseState = false;
var towerPreview = null;
var messageTimeout = null;

var grid = game.addElement(game.ELEMENT.IMAGE, `${imgDir}background-grid.svg`, game.canvas.width, game.canvas.height, 0, 0);
var generalMessage = game.addElement(game.ELEMENT.TEXT, 'white', 15, '', game.canvas.width / 2, 500);
var loseText = game.addElement(game.ELEMENT.TEXT, 'white', 50, 'You lose', 350, 300);
var winText = game.addElement(game.ELEMENT.TEXT, 'white', 50, 'You win', 350, 300);
var scoreCounter = game.addElement(game.ELEMENT.TEXT, 'white', 35, SCORE_TEXT + currentPoints, 350, 350);
var livesCounter = game.addElement(game.ELEMENT.TEXT, 'white', 35, currentLives, game.canvas.width - 80, 55);
var livesCounterBackground = game.addElement(game.ELEMENT.RECT, 'rgba(0, 0, 0, 0.6)', 110, 45, game.canvas.width - 110, 20);
var heart = game.addElement(game.ELEMENT.IMAGE, `${imgDir}heart.png`, 30, 30, game.canvas.width - 50, 27);
var limit = game.addElement(game.ELEMENT.RECT, `red`, 10, 60, game.canvas.width + 10, 240);
var moneyCounter = game.addElement(game.ELEMENT.TEXT, 'white', 35, currentMoney, 80, 55);
var moneyCounterBackground = game.addElement(game.ELEMENT.RECT, 'rgba(0, 0, 0, 0.7)', 110, 45, 0, 20);
var coin = game.addElement(game.ELEMENT.IMAGE, `${imgDir}coin.png`, 508, 64, 10, 23);
var towerSelectorBackground = game.addElement(game.ELEMENT.RECT, 'rgba(0, 0, 0, 0.7)', 250, 45, (game.canvas.width / 2) - 110, 0);
var tower1 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_1.png`, 40, 40, towerSelectorBackground.x + 20, 2.5, true);
var tower2 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_2.png`, 40, 40, tower1.x + 15 + tower1.width, 2.5, true);
var tower3 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_3.png`, 40, 40, tower2.x + 15 + tower2.width, 2.5, true);
var tower4 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}tower_4.png`, 40, 40, tower3.x + 15 + tower3.width, 2.5, true);

coin.addAnimation('iddle', { rows: 1, cols: 8, update: 0.1, width: 35, height: 35 });
coin.setCurrentAnimation('iddle');

tower1.towerRadius = 150;
tower1.cost = 15;
tower1.color = '#7e92c4';
tower1.pointer = { color: '#4f5d7c', width: 5, hieght: 20 };
tower1.shot = { color: 'grey', width: 5, height: 10, speed: 7, fireRate: 0.5, damage: 2, timeout: null };
tower1.addListener('click', placeTower);

tower2.towerRadius = 125;
tower2.cost = 20;
tower2.color = '#ec6401';
tower2.pointer = { color: '#4f5d7c', width: 5, hieght: 20 };
tower2.shot = { color: 'yellow', width: 3, height: 5, speed: 7, fireRate: 0.1, damage: 0.5, timeout: null };
tower2.addListener('click', placeTower);

tower3.towerRadius = 160;
tower3.cost = 25;
tower3.color = '#e4e4e4';
tower3.pointer = { color: 'red', width: 5, hieght: 20 };
tower3.shot = { color: 'red', width: 2, height: 10, speed: 2, fireRate: 3, damage: 5, timeout: null };
tower3.addListener('click', placeTower);

tower4.towerRadius = 400;
tower4.cost = 50;
tower4.color = '#ffcb00';
tower4.pointer = { color: '#4f5d7c', width: 5, hieght: 20 };
tower4.shot = { color: 'brown', width: 2, height: 10, speed: 7, fireRate: 0.1, damage: 1, timeout: null };
tower4.addListener('click', placeTower);

towersTypes.push(tower1);
towersTypes.push(tower2);
towersTypes.push(tower3);
towersTypes.push(tower4);

game.setReset(() => {
    game.play();
    shots = [];
    coins = [];
    towers = [];
    enemies = [];
    enemiesQueue = [];
    currentMoney = INITIAL_MONEY;
    currentLives = INITIAL_LIVES;
    livesCounter.setText(currentLives);
    livesCounter.print();
    moneyCounter.setText(currentMoney);
    moneyCounter.print();
    ingameTime = 0;
    currentPoints = 0; 
    currentWave = 1;
    enemiesCounter = 0;
    enemyCounter = 0;
    loseState = false;
    towerPreview = null;
    messageTimeout = null;
    showMessage(`First wave!`, 2);
    programWave(1);
});

game.reset();
var drawing = function () {
    ingameTime++;
    if (enemiesQueue[1000 * ingameTime / 60]) {
        var e = enemiesQueue[1000 * ingameTime / 60].e;
        spanwEnemy(e.speed, e.hitPoints, e.drop, e.image, e.w, e.h);
    }
    for (var t in towers) if (towers[t].towerRadiusElm) towers[t].towerRadiusElm.print();
    for (var s in shots) {
        shots[s].move({ x: true, y: true });
        shots[s].print();
        for (var e in enemies)
            if (shots[s] && enemies[e] && shots[s].collide(enemies[e])) {
                hitEnemy(enemies[e], shots[s]);
                removeElement(shots, s);
                s--;
                if (enemies[e].hitPoints < 1) {
                    dropCoin(enemies[e]);
                    game.removeElement(enemies[e].lifeBar);
                    game.removeElement(e.lifeBarBackground);
                    removeElement(enemies, e);
                    e--;
                }
            }
        if (shots[s] && shots[s].outOfBounds()) {
            removeElement(shots, s);
            s--
        }
    }
    for (var t in towers) {
        for (var e in enemies) if (enemies[e] && enemies[e].whitinOfBounds(towers[t], towers[t].towerRadius)) shoot(enemies[e], towers[t]);
        towers[t].print();
        if (towers[t].pointer) towers[t].pointer.print();
    }
    for (var c in coins) coins[c].print();
    for (var e in enemies) enemyRoutine(enemies[e], e);
    printTowerPreview();
    if (currentLives < 1) lose();
    if (enemiesCounter >= enemyCounter && enemies.length < 1){
        if(currentWave == waves.length) win();
        currentWave++;
        if(currentWave == waves.length) showMessage(`Final wave!`, 2);
        else showMessage(`Next wave!`, 2);
        programWave(currentWave);
    }
    printGameUI();
};

function removeElement(arr, index){
    game.removeElement(arr[index]);
    arr.splice(index, 1);
}

function hitEnemy(e,s) {
    var aux = e.hitPoints;
    e.hitPoints -= s.damage;
    var percentage = (e.hitPoints * e.lifeBar.width) / aux;
    e.lifeBar.width = percentage;
}

function dropCoin(e) {
    var coinDrop = game.addElement(game.ELEMENT.IMAGE, `${imgDir}coin.png`, 508, 64, -50, -50);
    coinDrop.addAnimation('iddle', { rows: 1, cols: 8, update: 0.1, width: 15, height: 15 });
    coinDrop.setCurrentAnimation('iddle');
    coinDrop.setX(e.x + (e.currentAnimation.width / 2));
    coinDrop.setY(e.y + e.currentAnimation.height / 2);
    coins.push(coinDrop);
    setTimeout(() => {
        game.addElement(coinDrop.id);
        coins.shift();
    }, 1000 * 1);
    currentPoints += 15;
    currentMoney += e.drop;
    moneyCounter.setText(currentMoney);
}

function printTowerPreview() {
    if (towerPreview) {
        grid.print();
        towerPreview.towerRadiusElm.print();
        towerPreview.print();
    }
}

function printGameUI() {
    moneyCounterBackground.print();
    coin.print();
    moneyCounter.print();
    livesCounterBackground.print();
    heart.print();
    livesCounter.print();
    towerSelectorBackground.print();
    for (var tt in towersTypes) towersTypes[tt].print();
    limit.print();
    generalMessage.print();
}

function programWave(i) {
    var curWave = waves[i - 1];
    var subWave = curWave.enemy1.qty / curWave.enemy2.qty;
    var gap = 1;
    var waveGap = 10;
    for (var j = 0; j < curWave.enemy1.qty + curWave.boss.qty; j++) {
        if (j % subWave < 1 && j > 0) {
            gap += 10;
            enemiesQueue[1000 * (j + gap + waveGap + 0.1)] = { e: curWave.enemy2 };
            enemyCounter++;
        }
        enemiesQueue[1000 * (j + gap + waveGap)] = { e: curWave.enemy1 };
        enemyCounter++;
        if (enemyCounter == curWave.enemy1.qty + curWave.enemy2.qty + curWave.boss.qty) {
            enemiesQueue[1000 * (j + gap + waveGap + 0.2)] = { e: curWave.boss };
            waveGap += 30;
        }
    }
}

function spanwEnemy(enemiesSpeed, hitPoints, drop, image, width, height) {
    var newEnemy = game.addElement(game.ELEMENT.IMAGE, `${imgDir}${image}`, width, height, 1, 270, true);
    var lifeBar = game.addElement(game.ELEMENT.RECT, 'red', 20, 3, newEnemy.x + 10, newEnemy.y + newEnemy.width / 2);
    var lifeBarBackground = game.addElement(game.ELEMENT.RECT, "rgba(0, 0, 0, 0.6)", 22, 5, newEnemy.x + 10 - 1, newEnemy.y + newEnemy.width / 2 - 1);
    newEnemy.addAnimation('up', { rows: 4, cols: 9, currentRow: 0, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('left', { rows: 4, cols: 9, currentRow: 1, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('down', { rows: 4, cols: 9, currentRow: 2, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('right', { rows: 4, cols: 9, currentRow: 3, fixedY: true, update: 0.1 });
    newEnemy.addAnimation('stop', { rows: 4, cols: 9, currentRow: 2, currentFrame: 1, fixedX: true, fixedY: true, update: 0.1 });
    newEnemy.enemiesSpeed = enemiesSpeed;
    newEnemy.hitPoints = hitPoints;
    newEnemy.lifeBar = lifeBar;
    newEnemy.lifeBarBackground = lifeBarBackground;
    newEnemy.drop = drop;
    newEnemy.setCurrentAnimation('right');
    newEnemy.setXSpeed(newEnemy.enemiesSpeed);
    newEnemy.setYSpeed(0);
    enemiesCounter++;
    if (enemiesCounter <= enemyCounter) enemies.push(newEnemy);
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

    e.lifeBarBackground.setX(e.x + (e.currentAnimation.width / 3) - 1);
    e.lifeBarBackground.setY(e.y - 1);
    e.lifeBarBackground.print();
    e.lifeBar.setX(e.x + (e.currentAnimation.width / 3));
    e.lifeBar.setY(e.y);
    e.lifeBar.print();

    if (limit.collide(e)) {
        currentLives--;
        livesCounter.setText(currentLives);
        game.removeElement(e.lifeBar);
        game.removeElement(e.lifeBarBackground);
        game.removeElement(e);
        enemies.splice(index, 1);
    }
}

function lose() {
    loseState = true;
    game.pause();
    loseText.print();
    scoreCounter.setText(SCORE_TEXT + (currentPoints / parseInt(ingameTime / 60)));
    scoreCounter.print();
}
function win() {
    loseState = true;
    game.pause();
    game.canvas.clear();
    game.canvas.print();
    winText.print();
    scoreCounter.setText(SCORE_TEXT + (currentPoints / parseInt(ingameTime / 60)));
    scoreCounter.print();
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
    newTower.removeListener('click');
    newTower.addListener('click', (e) => {
        if (towerPreview) return;
        if (newTower.towerRadiusElm) newTower.towerRadiusElm = null;
        else newTower.towerRadiusElm = game.addElement(game.ELEMENT.CIRCLE, 'rgba(255, 255, 255, 0.1)', newTower.towerRadius, newTower.x, newTower.y);
    });
    towers.push(newTower);
}

function placeTower(e) {
    if (e.clientX && e.clientY) {
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

function addTowerPreview(tower, x, y) {
    var newTower = game.addElement(game.ELEMENT.CIRCLE, tower.color, 20, x, y, true);
    var towerRadius = game.addElement(game.ELEMENT.CIRCLE, 'rgba(255, 255, 255, 0.1)', tower.towerRadius, x, y);
    newTower.towerRadiusElm = towerRadius;
    newTower.color = tower.color;
    newTower.towerRadius = tower.towerRadius;
    newTower.pointer = tower.pointer;
    newTower.shot = tower.shot;
    newTower.cost = tower.cost;
    newTower.addListener('keydown', removePreview);
    newTower.addListener('click', () => {
        if (currentMoney < towerPreview.cost) 
            return showMessage(`You dont't have enought money`, 2);
        for (var t in towers) if (towers[t].x == towerPreview.x && towers[t].y == towerPreview.y)
            return showMessage(`You can't place the tower over an other tower`, 2);

        currentMoney -= towerPreview.cost;
        moneyCounter.setText(currentMoney);
        addTower(towerPreview);
        game.removeElement(towerPreview.towerRadius);
        game.removeElement(towerPreview);
        towerPreview = null;
    });
    return newTower;
}

function showMessage(message, duration) {
    generalMessage.setText(message);
    if (messageTimeout) { clearTimeout(messageTimeout); messageTimeout = null; }
    messageTimeout = setTimeout(() => { generalMessage.setText(''); }, 1000 * duration);
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
    if (loseState) return game.reset();
}

game.canvas.addListener('mousemove', () => {
    if (!towerPreview) return;
    let x = game.canvas.mousePosition.x;
    let y = game.canvas.mousePosition.y;
    var gridX = 53;
    var gridY = 60;
    for (var i = 0; i < game.canvas.width; i += gridX) {
        for (var j = 0; j < game.canvas.height; j += gridY) {
            if ((x > i && x < (i + gridX)) && (y > j && y < (j + gridY))) {
                x = i + (gridX / 2);
                y = j + (gridY / 2);

                for (var p in path) if (path[p].x == x && path[p].y == y || y == 30 || y >= 510) return;

                towerPreview.towerRadiusElm.setX(x);
                towerPreview.towerRadiusElm.setY(y);
                towerPreview.setX(x);
                towerPreview.setY(y);
                return;
            }
        }
    }
});