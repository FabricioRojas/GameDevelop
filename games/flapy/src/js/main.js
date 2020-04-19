const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
game.control.setStep(13);
game.canvas.setBackgroundImage(game.addElement(game.ELEMENT.IMAGE, `${imgDir}background.png`, game.canvas.width * 2, game.canvas.height, 0, 0));
game.canvas.backgroundImage.setXSpeed(-0.3);
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
    confirm("Sure you want to go?");
});

setInterval(() => game.draw(drawing), 1000 / 60);

var walls = [];
var wallsInterval;
var square = 70;
var points = 0;
var gap = 70;
var wallWidth = 20;
var loseState = false;
var LOSETXT = "SCORE: ";
var losetxt = LOSETXT;
// var bird = game.addElement(game.ELEMENT.RECT, "red", square, square, 150, 250);
var bird = game.addElement(game.ELEMENT.IMAGE, `${imgDir}bird.png`, square, square, 150, 250);
var background2 = game.addElement(game.ELEMENT.IMAGE, `${imgDir}background.png`, game.canvas.width * 2, game.canvas.height, game.canvas.width, 0);
var pointsCounter = game.addElement(game.ELEMENT.TEXT, "white", 35, points, 50, 50);
var highScore = game.addElement(game.ELEMENT.TEXT, "white", 35, localStorage.getItem("flapy-highscore") ? localStorage.getItem("flapy-highscore") : 0, game.canvas.width - 50, 50);
var loseMessage = game.addElement(game.ELEMENT.TEXT, "black", 30, losetxt, game.canvas.width / 2, game.canvas.height / 2);
var clickMessage = game.addElement(game.ELEMENT.TEXT, "black", 15, "Click to restart", game.canvas.width / 2, game.canvas.height / 2 + 50);


bird.setGravity(0.2);
bird.setRotate(true);
bird.addSound("background", `${soundDir}background.mp3`);
bird.setSoundVolume("background", "0.2");
bird.setSoundLoop('background', true);

bird.addSound("wingspan", `${soundDir}wingspan_1.mp3`);
bird.setSoundDuration("wingspan", "0.4");

bird.addSound("hit", `${soundDir}hit.mp3`);
bird.setSoundDuration("hit", "1");

bird.addSound("point", `${soundDir}point.mp3`);
bird.setSoundDuration("point", "1");

background2.setXSpeed(-0.3);

reset();
game.pause();
var drawing = function () {
    if (!wallsInterval) wallsInterval = setInterval(() => {
        if (game.state == game.STATE.PLAY) randomWall();
    }, 1000 * 3);

    loopBackground();
    printWalls();
    bird.move('y');

    if (game.control.y != 0) {
        bird.playSound("wingspan");
        bird.y += game.control.y;
        bird.setGravitySpeed(bird.gravity);
        bird.setAngle(-0.5);
    }
    else bird.setAngle(bird.angle + (2 * Math.PI / 180));


    highScore.print();
    pointsCounter.print();
    bird.print();
};

function printWalls() {
    try {
        for (var i in walls) {
            if (!walls[i]) continue;
            walls[i].move('x');
            walls[i].print();
            if (bird.collide(walls[i])) lose();
            if (walls[parseInt(i) + 1] && bird.collide({ x: walls[i].x, y: (walls[i].y + walls[i].height), width: walls[i].width, height: (walls[parseInt(i) + 1].y - (walls[i].y + walls[i].height)) })) {
                bird.playSound("point");
                points++;
                pointsCounter.setText(points);
            }
            if (walls[i].x == -1 * walls[i].width) {
                // walls.splice(i, 1);
                // walls.shift();
                game.removeElement(walls[i]);
                // i --; 
            }
        }
    } catch (err) {
        console.debug("err", err);
    }
}

function randomWall() {
    var wallUpHeight = randomValue(100, game.canvas.height - (square * 2) - gap - wallWidth);
    var wallDownY = wallUpHeight + (square * 2) + gap;
    var wallUp = game.addElement(game.ELEMENT.RECT, "yellow", wallWidth, wallUpHeight, game.canvas.width - 20, 0);
    var wallDown = game.addElement(game.ELEMENT.RECT, "yellow", wallWidth, game.canvas.height - wallDownY, game.canvas.width - 20, wallDownY);
    wallUp.setXSpeed(-2);
    wallDown.setXSpeed(-2);
    walls.push(wallUp);
    walls.push(wallDown);
}

function randomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkScore() {
    if (!localStorage.getItem("flapy-highscore")) localStorage.setItem("flapy-highscore", 0);
    if (points > 0 && points > parseInt(localStorage.getItem("flapy-highscore"))) {
        localStorage.setItem("flapy-highscore", points);
        losetxt = "NEW HIGH-SCORE: ";
    } else {
        losetxt = LOSETXT;
    }
}

function loopBackground() {
    game.canvas.backgroundImage.move('x');
    background2.move('x');
    if (game.canvas.backgroundImage.x == -1 * game.canvas.width) {
        game.canvas.backgroundImage.x = game.canvas.width;
    }
    if (background2.x == -1 * game.canvas.width * 2) {
        background2.x = game.canvas.width;
    }
    background2.print();
}
function lose() {
    bird.pauseSound("point");
    bird.pauseSound("wingspan");
    bird.playSound("hit");
    loseState = true;
    game.pause();
    checkScore();
    loseMessage.setText(losetxt + points);
    loseMessage.print();
    clickMessage.print();

}
function reset() {
    loseState = false;
    game.canvas.clear();
    game.canvas.print();
    bird.setX(150);
    bird.setY(250);
    bird.setGravitySpeed(0);
    game.canvas.backgroundImage.setX(0);
    game.canvas.backgroundImage.setY(0);
    background2.setX(game.canvas.width);
    background2.setY(0);
    points = 0;
    pointsCounter.setText(points);
    for (var i in walls) if (walls[i]) game.removeElement(walls[i]);
    walls = [];
    randomWall();
    if (wallsInterval) {
        clearInterval(wallsInterval);
        wallsInterval = null;
    }
    highScore.setText(localStorage.getItem("flapy-highscore") ? localStorage.getItem("flapy-highscore") : 0);
    bird.resetSound('background');
    bird.playSound('background');
    game.play();
}
function handlemouseClick() {
    if (loseState) reset();
}