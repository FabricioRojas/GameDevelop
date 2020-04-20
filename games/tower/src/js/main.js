const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
setInterval(() => game.draw(drawing), 1000 / 60);

var shots = [];
var shotTimeout = null;


var tower = game.addElement(game.ELEMENT.CIRCLE, "white", 10, 300, 200);
var enemy = game.addElement(game.ELEMENT.CIRCLE, "blue", 7, 396, 104);
var enemyS = game.addElement(game.ELEMENT.RECT, "red", 14, 14, 396-(enemy.width/2), 104-(enemy.width/2));
tower.towerFireSpeed = 7;
tower.towerFire = 0.5;
tower.towerRadius = 100;


enemy.setInfiniteMoveX(true);
enemy.setInfiniteMoveY(true);
enemy.setXSpeed(1);

enemyS.setInfiniteMoveX(true);
enemyS.setInfiniteMoveY(true);
enemyS.setXSpeed(1);

var drawing = function () {
    enemy.move('y');
    enemyS.move('y');
    // enemy.move('x');
    // enemyS.move('x');

    if (enemy.whitinOfBounds(tower, tower.towerRadius)) shoot(enemyS, tower);
    for (var s in shots) {
        shots[s].move('y');
        shots[s].move('x');
        shots[s].print();
        if(shots[s].collide(enemyS)){
            console.log("hit");
        }
        // game.pause();
        if(shots[s].outOfBounds() || shots[s].collide(enemyS)){
            game.removeElement(shots[s]);
            shots.shift();
        }

    }

    tower.print();
    // enemyS.print();
    enemy.print();
};

function shoot(e, t) {
    if (shotTimeout) return;
    var c1 = e.x - t.x;
    var c2 = e.y - t.y;

    var shot = game.addElement(game.ELEMENT.RECT, "white", 2, 10, t.x, t.y);
    shot.setRotate(true);
    shot.setAngle(angle(c1, c2));
    

    var adjacentSide = ((t.width/4)+t.x)-t.x;
    // var adjacentSide = ((t.height/4)+t.y)-t.y;
    var hypotenuseSide = (adjacentSide/Math.cos(Math.abs(shot.angle)));
    var oppositeSide = hypotenuseSide*Math.sin(Math.abs(shot.angle));
    // shot.setX(c1 < 0 ? shot.x-oppositeSide : shot.x+oppositeSide);
    // shot.setY(shot.y+adjacentSide);
    // shot.setX(shot.x+adjacentSide);
    // shot.setY(c1 < 0 ? shot.y-oppositeSide : shot.y+oppositeSide);

    console.log("enemy cords",e.x,e.y, c1, c2);

    var xSpeed = 0;
    var ySpeed = 0;
    var distance = 30;
    var factorY = c2 < 0 ? -1 : 1;
    var factorX = c1 < 0 ? -1 : 1;
    // c1 = e.x+distance-t.x;
    // c2 = e.y+distance-t.y;
    
    c1 = Math.abs(c1);
    c2 = Math.abs(c2);
    if(c1 > c2){
        xSpeed = (t.towerFireSpeed*c1)/(c1+c2);
        ySpeed = t.towerFireSpeed-xSpeed;
    }else{
        ySpeed = (t.towerFireSpeed*c2)/(c1+c2);
        xSpeed = t.towerFireSpeed-ySpeed;
    }
    shot.setXSpeed(xSpeed*factorX);
    shot.setYSpeed(ySpeed*factorY);
    
    shots.push(shot);
    shotTimeout = setTimeout(() => { clearTimeout(shotTimeout); shotTimeout = null; }, 1000 * t.towerFire);
}

function angle(c1,c2) {
    return Math.atan((c1 + 30) / (c2)) * -1;
}