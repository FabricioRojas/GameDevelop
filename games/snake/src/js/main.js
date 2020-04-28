const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, false);
game.canvas.setBackgroundImage(game.addElement(game.ELEMENT.IMAGE, `${imgDir}background_1.jpg`, game.canvas.width, game.canvas.height, 0, 0));

game.gui.addMenu("main_menu", "white", game.canvas.width / 2,
    game.canvas.height - 200, game.canvas.width / 2 - (game.canvas.width / 4), (game.canvas.height / 2 - (game.canvas.height / 3)), "white", 2);

game.gui.addMenu("difficulty_menu", "white", game.canvas.width / 2,
    game.canvas.height - 200, game.canvas.width / 2 - (game.canvas.width / 4), (game.canvas.height / 2 - (game.canvas.height / 3)), "white", 2);

game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Resume", null, null, () => {
    game.play();
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Restart", null, null, () => {
    reset();
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Dificulty", null, null, () => {
    game.gui.showMenu("difficulty_menu");
});
game.gui.addItemMenu("main_menu", game.ELEMENT.TEXT, true, "black", 30, "Exit", null, null, () => {
    confirm("Sure you want to go?");
});


game.gui.addItemMenu("difficulty_menu", game.ELEMENT.TEXT, true, "black", 30, "EASY", null, null, () => {
    snakeHead.setInfiniteMoveX(true);
    snakeHead.setInfiniteMoveY(true);
    snakeHeadShadow.setInfiniteMoveX(true);
    snakeHeadShadow.setInfiniteMoveY(true);
    if (snakeTimeout) clearTimeout(snakeTimeout); snakeTimeout = null;
    snakeSpeed = 0.06;
    pointsValue = 10;
});
game.gui.addItemMenu("difficulty_menu", game.ELEMENT.TEXT, true, "black", 30, "MEDIUM", null, null, () => {
    snakeHead.setInfiniteMoveX(false);
    snakeHead.setInfiniteMoveY(false);
    snakeHeadShadow.setInfiniteMoveX(false);
    snakeHeadShadow.setInfiniteMoveY(false);
    if (snakeTimeout) clearTimeout(snakeTimeout); snakeTimeout = null;
    snakeSpeed = 0.03;
    pointsValue = 15;
});
game.gui.addItemMenu("difficulty_menu", game.ELEMENT.TEXT, true, "black", 30, "DIFICULT", null, null, () => {
    snakeHead.setInfiniteMoveX(false);
    snakeHead.setInfiniteMoveY(false);
    snakeHeadShadow.setInfiniteMoveX(false);
    snakeHeadShadow.setInfiniteMoveY(false);
    if (snakeTimeout) cclearTimeout(snakeTimeout); snakeTimeout = null;
    snakeSpeed = 0.01;
    pointsValue = 25;
});
game.gui.addItemMenu("difficulty_menu", game.ELEMENT.TEXT, true, "black", 30, "BACK", null, null, () => {
    game.gui.showMenu("main_menu");
});


game.canvas.canvas.addEventListener('click', handlemouseClick);

var gameInterval = setInterval(() => game.draw(drawing), 1000 / 60);

var square = 10;
var points = 0;
var pointsValue = 10;
var lastPress = null;
var LOSETXT = "SCORE: ";
var losetxt = LOSETXT;
var canibalism = false;
var loseState = false;
var SNAKETAIL = 5;
var snakeTail = SNAKETAIL;
var snakeTrail = [];
var snakeTrailShadow = [];
var snakeTimeout = null;
var snakeSpeed = 0.06;

var apple = game.addElement(game.ELEMENT.RECT, "red", square, square, 600, 270);
var snakeHead = game.addElement(game.ELEMENT.RECT, "darkgreen", square, square, 50, 60);
var snakeHeadShadow = game.addElement(game.ELEMENT.RECT, "black", square + 2, square + 2, snakeHead.x - 1, snakeHead.y - 1);
var pointsCounter = game.addElement(game.ELEMENT.TEXT, "white", 35, points, 50, 50);
var highScore = game.addElement(game.ELEMENT.TEXT, "white", 35, localStorage.getItem("snake-highscore") ? localStorage.getItem("snake-highscore") : 0, game.canvas.width - 50, 50);
var loseText = game.addElement(game.ELEMENT.TEXT, "white", 50, losetxt, 350, 300);

snakeHead.addSound('background', `${soundDir}background.mp3`);
snakeHead.setSoundVolume('background', 0.1);
snakeHead.setSoundLoop('background', true);

snakeHead.addSound('eat', `${soundDir}eat.mp3`);
snakeHead.setSoundDuration('eat', 0.3);
snakeHead.addSound('die', `${soundDir}die_2.mp3`);
snakeHead.setSoundDuration('die', 0.5);
snakeHead.setSoundVolume('die', 0.4);

// snakeHead.addListener("keydown", keyPress);

snakeHead.setMoveByChunk(true);
snakeHead.setInfiniteMoveX(true);
snakeHead.setInfiniteMoveY(true);
snakeHead.setXSpeed(0);
snakeHead.setYSpeed(0);

snakeHeadShadow.setMoveByChunk(true);
snakeHeadShadow.setInfiniteMoveX(true);
snakeHeadShadow.setInfiniteMoveY(true);
snakeHeadShadow.setXSpeed(0);
snakeHeadShadow.setYSpeed(0);

reset();
var drawing = function () {
    keyPress();
    snakeHeadMovement();
    snakeHeadShadow.print();
    snakeHead.print();
    
    for (var i in snakeTrail) {
        // if ((snakeHead.xSpeed || snakeHead.ySpeed) && snakeHead.collide(snakeTrail[i])) canibalism = true;
        game.canvas.context.fillStyle = "black";
        game.canvas.context.fillRect(snakeTrailShadow[i].x, snakeTrailShadow[i].y, snakeTrailShadow[i].width, snakeTrailShadow[i].height);
        game.canvas.context.fillStyle = "green";
        game.canvas.context.fillRect(snakeTrail[i].x, snakeTrail[i].y, snakeTrail[i].width, snakeTrail[i].height);
    }

    snakeWallCollision(snakeHead);
    if (canibalism) reset(true);

    if (snakeTrail.length > snakeTail) snakeTrail.shift();
    if (snakeTrailShadow.length > snakeTail) snakeTrailShadow.shift();

    if (snakeHead.collide(apple)) {
        snakeHead.playSound('eat');
        apple.setX(rand(game.canvas.width - square, square));
        apple.setY(rand(game.canvas.height - square, square));
        snakeTail++;
        points += pointsValue;
        pointsCounter.setText(points);
    }

    highScore.print();
    pointsCounter.print();
    apple.print();
};
function snakeHeadMovement() {
    if (snakeTimeout) return;
    
    snakeTrail.push({ x: snakeHead.x, y: snakeHead.y, width: square, height: square });
    snakeTrailShadow.push({ x: snakeHeadShadow.x, y: snakeHeadShadow.y, width: square + 2, height: square + 2 });
    snakeTimeout = setTimeout(() => { clearTimeout(snakeTimeout); snakeTimeout = null; }, 1000 * snakeSpeed);

    snakeHead.move({x:true, y:true});
    snakeHeadShadow.setX(snakeHead.x - 1);
    snakeHeadShadow.setY(snakeHead.y - 1);

    for (var i in snakeTrail) if ((snakeHead.xSpeed || snakeHead.ySpeed) && snakeHead.collide(snakeTrail[i])) canibalism = true;
}
function handlemouseClick() {
    if (loseState) reset();
}
function snakeWallCollision(elm) {
    if (snakeHead.infiniteMoveX) return;
    if (elm.x < 0 || elm.x > game.canvas.width - 1 || elm.y < 0 || elm.y > game.canvas.height - 1) reset(true);
}
function reset(playSound) {
    snakeHead.resetSound('background');
    snakeHead.playSound('background');
    game.pause();
    if (playSound) {
        loseState = true;
        snakeHead.playSound('die');
    }
    checkScore();
    loseText.setText(losetxt + points);
    loseText.print();
    snakeTail = SNAKETAIL;
    snakeTrail = [];
    snakeTrailShadow = [];
    snakeHead.setXSpeed(0);
    snakeHead.setYSpeed(0);
    snakeHead.setX(50);
    snakeHead.setY(60);
    snakeHeadShadow.setXSpeed(0);
    snakeHeadShadow.setYSpeed(0);
    snakeHeadShadow.setX(50 - 1);
    snakeHeadShadow.setY(60 - 1);
    apple.setX(600);
    apple.setY(270);
    points = 0;
    canibalism = false;
    highScore.setText(localStorage.getItem("snake-highscore") ? localStorage.getItem("snake-highscore") : 0);
    if (!playSound) game.play();
}
function checkScore() {
    if (!localStorage.getItem("snake-highscore")) localStorage.setItem("snake-highscore", 0);
    if (points > 0 && points > parseInt(localStorage.getItem("snake-highscore"))) {
        localStorage.setItem("snake-highscore", points);
        losetxt = "NEW HIGH-SCORE: ";
    } else {
        losetxt = LOSETXT;
    }
}
function rand(maxNum, factorial) {
    return Math.floor(Math.floor(Math.random() * (maxNum + factorial)) / factorial) * factorial;
};
/* Custom listeners */
function keyPress(evt) {
    switch (game.control.x) {
        case -1:
            if (lastPress == game.KEY.RIGHT) return;
            snakeHead.setXSpeed(-square);
            snakeHead.setYSpeed(0);
            snakeHeadShadow.setXSpeed(-square);
            snakeHeadShadow.setYSpeed(0);
            lastPress = game.KEY.LEFT;
            break;
        case 1:
            if (lastPress == game.KEY.LEFT) return;
            snakeHead.setXSpeed(square);
            snakeHead.setYSpeed(0);
            snakeHeadShadow.setXSpeed(square);
            snakeHeadShadow.setYSpeed(0);
            lastPress = game.KEY.RIGHT;
            break;
    }
    switch (game.control.y) {
        case -1:
            if (lastPress == game.KEY.DOWN) return;
            snakeHead.setXSpeed(0);
            snakeHead.setYSpeed(-square);
            snakeHeadShadow.setXSpeed(0);
            snakeHeadShadow.setYSpeed(-square);
            lastPress = game.KEY.UP;
            break;
        case 1:
            if (lastPress == game.KEY.UP) return;
            snakeHead.setXSpeed(0);
            snakeHead.setYSpeed(square);
            snakeHeadShadow.setXSpeed(0);
            snakeHeadShadow.setYSpeed(square);
            lastPress = game.KEY.DOWN;
            break;
    }
}