const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
setInterval(() => game.draw(drawing), 1000 / 60);

var shots = [];
var shotTimeout = null;

var towerRadius = 200;
var towerFire = 0.7;
var towerFireSpeed = 3;

var tower = game.addElement(game.ELEMENT.CIRCLE, "white", 10, 300, 100);
// var enemy = game.addElement(game.ELEMENT.CIRCLE, "red", 7, 127.60, 200);
var enemy = game.addElement(game.ELEMENT.CIRCLE, "red", 7, 120, 200);


enemy.setXSpeed(0.4);
var drawing = function () {
    enemy.move('x');

    if (enemy.x >= (tower.x - towerRadius + tower.width) && enemy.x <= (tower.x + towerRadius - tower.width)) shoot(enemy, tower);
    for (var s in shots) {
        shots[s].move('y');
        shots[s].move('x');
        shots[s].print();
        // game.pause();
    }


    tower.print();
    enemy.print();
};

function shoot(e, t) {
    if (shotTimeout) return;
    var shot = game.addElement(game.ELEMENT.RECT, "white", 2, 10, tower.x, tower.y);
    shot.setRotate(true);
    var c1 = e.x - t.x;
    var c2 = e.y - t.y;
    shot.setAngle(angle(c1, c2));

    var xSpeed = 0;
    var ySpeed = 0;
    var factor = c1 < 0 ? -1 : 1;    
    if(c1 > c2){
        xSpeed = (towerFireSpeed*c2)/(Math.abs(c1)+c2);
        ySpeed = towerFireSpeed-xSpeed;
    }else{
        ySpeed = (towerFireSpeed*c2)/(Math.abs(c1)+c2);
        xSpeed = towerFireSpeed-ySpeed;
    }

    console.log(c1,c2, xSpeed, ySpeed)
    
    shot.setXSpeed(xSpeed*factor);
    shot.setYSpeed(ySpeed);
    
    
    shots.push(shot);
    shotTimeout = setTimeout(() => { clearTimeout(shotTimeout); shotTimeout = null; }, 1000 * towerFire);
}

function angle(c1,c2) {
    var angleRad = Math.atan((c1 + 30) / (c2));
    return angleRad * -1;
}