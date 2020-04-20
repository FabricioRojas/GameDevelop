const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
game.control.setStep(5);
game.canvas.canvas.addEventListener('click', handlemouseClick);
setInterval(() => game.draw(drawing), 1000 / 60);

var ship = game.addElement(game.ELEMENT.RECT, "white", 50, 25, game.canvas.width / 2 - 50 / 2, 500);
var shipGun = game.addElement(game.ELEMENT.RECT, "white", 9, 8, game.canvas.width / 2 - 9 / 2, ship.y - 8);
var winText = game.addElement(game.ELEMENT.TEXT, "white", 50, "Aliens defeated!", 300, 300);
var loseText = game.addElement(game.ELEMENT.TEXT, "white", 50, "You've been invaded!", 300, 300);

ship.addSound('background', `${soundDir}background.mp3`);
ship.setSoundVolume('background', 0.3);

ship.addSound('shot', `${soundDir}shot.mp3`);
ship.setSoundDuration('shot', '0.5');

ship.addSound('brick_hit', `${soundDir}brick_hit.mp3`);
ship.setSoundDuration('brick_hit', '0.5');
ship.setSoundVolume('brick_hit', 0.5);


loseText.addSound('lose', `${soundDir}lose.mp3`);
loseText.setSoundDuration('lose', '5');
loseText.setSoundVolume('lose', 0.5);

var aliens = [];
var bricks = [];
var shots = [];
var shotTimeout = null;
var alienLives = 5;
var aliesSpeed = 0.3;
var brickLives = 10;
var loseState = false;

reset();
var drawing = function () {
    shipGun.print();
    ship.print();

    for (var a in aliens) if (aliens[a]) aliensMove(aliens[a]);
    for (var b in bricks) if (bricks[b]) bricks[b].print();

    for (var s in shots) {
        shots[s].move({y:true});
        shots[s].print();
        if (shots[s].y + shots[s].height < 0) removeElement(shots, s);
        for (var b in bricks) if (bricks[b] && shots[s] && shots[s].collide(bricks[b])) {
            ship.playSound('brick_hit');
            removeElement(shots, s);
            bricks[b].setHeight(bricks[b].height - (25 / brickLives));
            if (bricks[b].height == 0) removeElement(bricks, b);
        }
        for (var a in aliens) if (aliens[a] && shots[s] && shots[s].collide(aliens[a])) {
            removeElement(shots, s);
            aliens[a].hit--;
            if (aliens[a].hit < 1) removeElement(aliens, a);
        }
    }
    if (aliens.length == 0) win();

    ship.x += game.control.x;
    shipGun.x += game.control.x;

    if (game.control.y) shoot();
};
function removeElement(arr, index) {
    game.removeElement(arr[index]);
    arr.splice(index, 1);
}
function aliensMove(alien) {
    alien.print();
    alien.move({x:true});
    if (alien.x + alien.width >= game.canvas.width || alien.x <= 0) {
        for (var i in aliens)
            if (aliens[i]) {
                aliens[i].setXSpeed((aliens[i].xSpeed > 0 ? aliens[i].xSpeed + 0.1 : aliens[i].xSpeed - 0.1) * -1);
                aliens[i].setY(aliens[i].y + aliens[i].height / 2);
            }
    }
    if (alien.y + alien.height >= 400) lose();
}
function win() {
    game.pause();
    game.canvas.clear();
    game.canvas.print();
    winText.print();
}
function lose() {
    loseState = true;
    game.pause();
    ship.pauseSound('background');
    loseText.playSound('lose');
    loseText.print();
}
function reset() {
    aliens = generateElementsArray(3, 7, 50, 50, 25, 60, 'lightgreen', 'alien');
    bricks = generateElementsArray(1, 9, 25, 50, 25, 400, 'white', ' brick');
    ship.playSound('background');
    game.play();
}
function shoot() {
    if (shotTimeout) return;
    ship.playSound('shot');
    var shot = game.addElement(game.ELEMENT.RECT, "white", 2, 10, ship.x + (ship.width / 2) - (2 / 2), ship.y - 20);
    shot.setYSpeed(-2.5);
    shots.push(shot);
    shotTimeout = setTimeout(() => { clearTimeout(shotTimeout); shotTimeout = null; }, 1000 * 0.2);
}
function generateElementsArray(rows, columns, separation, elementWidth, elementHeight, yStart, color, type) {
    elements = [];
    var elementsSize = ((elementWidth + separation) * columns) - separation;
    var elementsStart = (game.canvas.width - elementsSize) / 2;
    var elementsX = elementsStart;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var newElement = game.addElement(game.ELEMENT.RECT, color, elementWidth, elementHeight, elementsX, yStart);
            if (type == 'alien') {
                newElement.setXSpeed(aliesSpeed);
                newElement.hit = alienLives;
            }
            elements.push(newElement);
            elementsX += elementWidth + separation;
        }
        elementsX = elementsStart;
        yStart += elementHeight + separation;
    }
    return elements;
}

function handlemouseClick() {
    if (loseState) return reset();
}