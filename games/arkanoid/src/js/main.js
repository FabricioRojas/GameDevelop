const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, false);
game.control.setStep(10);
game.canvas.setSolidBordersX(true);
game.canvas.setSolidBordersY(true);
game.canvas.canvas.addEventListener('click', handlemouseClick);
game.gui.addMenu("main_menu", "white", game.canvas.width / 2,
    game.canvas.height - 200, game.canvas.width / 2 - (game.canvas.width / 4), (game.canvas.height / 2 - (game.canvas.height / 3)), "white", 2);

game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Resume", null, null, () => {
    game.play();
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Restart", null, null, () => {
    reset();
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Exit", null, null, () => {
    if (confirm("Sure you want to go?")) window.close();
});

setInterval(() => game.draw(drawing), 1000 / 60);

var gameStarted = false;
var brickWidth = 80;
var brickHeight = 30;
var bricks = [];
var lives = 3;
const BALLSPEDD = 4;
const BALLSPEDDLIMIT = BALLSPEDD + 4;
var ballSpeed = BALLSPEDD;
var powerups = ["pad-smaller", "pad-bigger", "pad-faster"];
var powerupDrop = false;
var powerupsTimeout = 20;
var loseState = false;

var paddle = game.addElement(game.ELEMENT.RECT, "white", 100, 10, 0, 0);
var ball = game.addElement(game.ELEMENT.CIRCLE, "white", 5, 0, 0);
// var ball = game.addElement(game.ELEMENT.RECT, "white", 10, 10, 395, 540);
var brickCounter = game.addElement(game.ELEMENT.TEXT, "white", 35, bricks.length, game.canvas.width - 30, 50);
var livesCounter = game.addElement(game.ELEMENT.TEXT, "white", 35, lives, 30, 50);
var winText = game.addElement(game.ELEMENT.TEXT, "white", 50, "Stage cleared!", 300, 300);
var loseText = game.addElement(game.ELEMENT.TEXT, "white", 50, "You lose!", 300, 300);

var powerup = game.addElement(game.ELEMENT.CIRCLE, "red", 10, -20, -20);
powerup.setXSpeed(0);
powerup.setYSpeed(1);


winText.addSound('win', `${soundDir}wining.mp3`);
winText.setSoundVolume('win', 0.2);
loseText.addSound('lose', `${soundDir}losing.mp3`);
loseText.setSoundVolume('lose', 0.2);

paddle.addListener("keydown", keydown);
paddle.setIsSolid(true);
paddle.addSound('powerup', `${soundDir}powerup.mp3`);
// paddle.addSound('slide','slide.mp3');
// paddle.setSoundDuration('slide',0.1);

ball.setXSpeed(0);
ball.setYSpeed(0);
ball.setIsSolid(true);
ball.addSound('hit_wall', `${soundDir}ball_hit_2.mp3`);
ball.setSoundDuration('hit_wall', 0.1);
ball.addSound('hit_paddle', `${soundDir}ball_hit_3.mp3`);
ball.setSoundDuration('hit_paddle', 0.5);
ball.addSound('ball_fall', `${soundDir}ball_fall.mp3`);
ball.setSoundDuration('ball_fall', 0.3);
ball.setSoundVolume('ball_fall', 0.4);
ball.addSound('background', `${soundDir}background.mp3`);
ball.setSoundLoop('background', true);
ball.setSoundVolume('background', 0.1);

reset();
var drawing = function () {
    ball.print();
    paddle.print();
    brickCounter.print();
    livesCounter.print();

    ball.move('x');
    if (game.canvas.solidBordersX && (ball.x < 0 || ball.x > game.canvas.width - 1)) {
        ball.playSound('hit_wall');
    }
    ball.move('y');
    if (game.canvas.solidBordersY && (ball.y < 0 || ball.y > game.canvas.height - 1)) {
        ball.playSound('hit_wall');
    }

    // if(game.control.x != 0) paddle.playSound('slide');
    // else paddle.pauseSound('slide');
    paddle.x += game.control.x;

    hitBottom();

    ballPaddleCollision(ball.collide(paddle));
    for (var i in bricks) {
        ballBrickCollision(ball.collideWithDirecction(bricks[i]), bricks[i], i);
        if (bricks[i]) bricks[i].print();
    }
    if (powerupDrop) {
        powerup.print();
        powerup.move('y');
        powerupPaddleCollision(powerup.collide(paddle))
    }
};
function hitBottom() {
    if (ball.y < game.canvas.height - ball.height) return;
    ball.playSound('ball_fall');
    lives--;
    livesCounter.setText(lives);
    livesCounter.print();
    powerupDrop = false;
    resetBall();
    if (lives == 0) lose();
}
function resetBall() {
    ball.setXSpeed(0);
    ball.setYSpeed(0);
    ball.setX(game.canvas.width / 2);
    ball.setY(game.canvas.height - 50 - (ball.height / 2));
    paddle.setX((game.canvas.width / 2) - (paddle.width / 2));
    paddle.setY(game.canvas.height - 50);
    ballSpeed = BALLSPEDD;
    gameStarted = false;
}
function lose() {
    loseState = true;
    game.pause();
    ball.pauseSound('background');
    loseText.playSound('lose');
    game.canvas.clear();
    game.canvas.print();
    bricks = [];
    loseText.print();
}
function reset() {
    loseState = false;
    game.canvas.clear();
    game.canvas.print();
    resetBall();
    lives = 3;
    livesCounter.setText(lives);
    generateBlocks(4, 7, 20, brickWidth, brickHeight, 3);
    brickCounter.setText(bricks.length);
    ball.resetSound('background');
    ball.playSound('background');
    game.play();
}
function win() {
    game.pause();
    ball.pauseSound('background');
    winText.playSound('win');
    game.canvas.clear();
    game.canvas.print();
    winText.print();
}
function ballPaddleCollision(collided) {
    if (!collided || !gameStarted) return;

    if (game.control.x < 0 && ball.xSpeed > 0) {
        ballSpeed = BALLSPEDD;
        ball.setXSpeed(-ballSpeed);
    }
    if (game.control.x > 0 && ball.xSpeed < 0) {
        ballSpeed = BALLSPEDD;
        ball.setXSpeed(ballSpeed);
    }
    if (game.control.x < 0 && ball.xSpeed < 0 || game.control.x < 0 && ball.xSpeed < 0) {
        if (ballSpeed < BALLSPEDDLIMIT) ballSpeed += 2;
    }

    ball.playSound('hit_paddle');
    ball.setYSpeed(-ballSpeed);
}
function applyProwerUpEffect(effect) {
    paddle.playSound('powerup');
    switch (effect) {
        case "pad-bigger":
            paddle.setX(paddle.x - paddle.width);
            paddle.setWidth(paddle.width * 2);
            setTimeout(() => {
                paddle.setWidth(paddle.width / 2);
                paddle.setX(paddle.x + paddle.width);
            }, 1000 * powerupsTimeout);
            break;
        case "pad-smaller":
            paddle.setX(paddle.x + paddle.width);
            paddle.setWidth(paddle.width / 2);
            setTimeout(() => {
                paddle.setWidth(paddle.width * 2);
                paddle.setX(paddle.x - paddle.width);
            }, 1000 * powerupsTimeout);
            break;
        case "pad-faster":
            ballSpeed = BALLSPEDDLIMIT;
            setTimeout(() => {
                ballSpeed = BALLSPEDD;
            }, 1000 * powerupsTimeout);
            break;
    }
}
function powerupPaddleCollision(collided) {
    if (!collided) return;
    powerupDrop = false;
    powerup.setX(-20);
    powerup.setY(-20);
    applyProwerUpEffect(powerup.effect)
}
function ballBrickCollision(collided, brick, index) {
    if (collided == -1 || !gameStarted) return;

    brick.playSound('crash');
    bricks.splice(index, 1);

    if (brick.powerup) {
        powerupDrop = true;
        powerup.effect = brick.powerup;
        powerup.setX(brick.x + (brick.width / 2));
        powerup.setY(brick.y + powerup.height);
    }

    game.removeElement(brick);

    brickCounter.setText(bricks.length);
    brickCounter.print();
    if (bricks.length == 0) win();

    switch (collided) {
        case 0:
            ball.setXSpeed(ball.xSpeed * -1);
            break;
        case 1:
            ball.setYSpeed(ball.ySpeed * -1);
            break;
        case 2:
            ball.setXSpeed(ball.xSpeed * -1);
            break;
        case 3:
            ball.setYSpeed(ball.ySpeed * -1);
            break;
    }
}
function moveBall() {
    if (gameStarted) return;
    if (game.control.x < 0) ball.setXSpeed(-ballSpeed);
    if (game.control.x > 0) ball.setXSpeed(ballSpeed);
    ball.setYSpeed(-ballSpeed);
    gameStarted = true;
    ball.playSound('hit_paddle');
}
function generateBlocks(rows, columns, separation, brickWidth, brickHeight, powerupsBlocks) {
    bricks = [];
    var bricksSize = ((brickWidth + separation) * columns) - separation;
    var bricksStart = (game.canvas.width - bricksSize) / 2;
    var yStart = 70;
    var color = "white";
    var bricksX = bricksStart;
    var powerupsBlock = {};
    for (var p = 0; p < powerupsBlocks; p++) {
        var iv = Math.floor(Math.random() * (rows));
        var jv = Math.floor(Math.random() * (columns));
        powerupsBlock[iv] = {};
        powerupsBlock[iv][jv] = true;
    }
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            if (powerupsBlock[i] ? powerupsBlock[i][j] : false) color = "yellow";
            else color = "white";
            var newBrick = game.addElement(game.ELEMENT.RECT, color, brickWidth, brickHeight, bricksX, yStart);
            newBrick.addSound('crash', `${soundDir}brick_crash_2.mp3`);
            newBrick.setSoundDuration('crash', 0.2);
            if (powerupsBlock[i] ? powerupsBlock[i][j] : false) newBrick.powerup = powerups[Math.floor(Math.random() * (powerups.length))];
            bricks.push(newBrick);
            bricksX += brickWidth + separation;
        }
        bricksX = bricksStart;
        yStart += brickHeight + separation;
    }
}
function rand(maxNum, factorial) {
    return Math.floor(Math.floor(Math.random() * (maxNum + factorial)) / factorial) * factorial;
};
/* Custom listeners */
function keydown(evt) {
    if (evt.keyCode == game.KEY.LEFT || evt.keyCode == game.KEY.RIGHT) moveBall();
}
function handlemouseClick() {
    if (loseState) return reset();
}