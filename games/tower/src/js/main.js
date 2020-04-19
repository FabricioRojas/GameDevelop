const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
setInterval(() => game.draw(drawing), 1000 / 60);

var shots = [];
var shotTimeout = null;

var towerRadius = 200;
var towerFire = 0.5;
var towerFireSpeed = 7;

var tower = game.addElement(game.ELEMENT.CIRCLE, "white", 10, 300, 100);
var enemy = game.addElement(game.ELEMENT.CIRCLE, "blue", 7, 120, 200);
var enemyS = game.addElement(game.ELEMENT.RECT, "red", 14, 14, 120-(enemy.width/2), 200-(enemy.width/2));

enemy.setInfiniteMoveX(true);
enemy.setXSpeed(1);
enemyS.setInfiniteMoveX(true);
enemyS.setXSpeed(1);

var drawing = function () {
    enemy.move('x');
    enemyS.move('x');

    if (enemy.x >= (tower.x - towerRadius + tower.width) && enemy.x <= (tower.x + towerRadius - tower.width)) shoot(enemyS, tower);
    for (var s in shots) {
        shots[s].move('y');
        shots[s].move('x');
        shots[s].print();
        if(shots[s].collide(enemyS)){
            console.log("hit");
        }
        // game.pause();
        if(shots[s].outOfbounds() || shots[s].collide(enemyS)){
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

    var shot = game.addElement(game.ELEMENT.RECT, "white", 2, 10, tower.x, tower.y);
    shot.setRotate(true);
    shot.setAngle(angle(c1, c2));
    

    var adjacentSide = ((tower.height/4)+tower.y)-tower.y;
    var hypotenuseSide = (adjacentSide/Math.cos(Math.abs(shot.angle)));
    var oppositeSide = hypotenuseSide*Math.sin(Math.abs(shot.angle));
    shot.setX(c1 < 0 ? shot.x-oppositeSide : shot.x+oppositeSide);
    shot.setY(shot.y+adjacentSide);

    var xSpeed = 0;
    var ySpeed = 0;
    var distance = 30;
    var factor = c1 < 0 ? -1 : 1;    
    c1 = e.x+distance-t.x;  
    // c2 = e.y+distance-t.y;  

    c1 = Math.abs(c1); 
    if(c1 > c2){
        xSpeed = (towerFireSpeed*c1)/(c1+c2);
        ySpeed = towerFireSpeed-xSpeed;
    }else{
        ySpeed = (towerFireSpeed*c2)/(c1+c2);
        xSpeed = towerFireSpeed-ySpeed;
    }
    shot.setXSpeed(xSpeed*factor);
    shot.setYSpeed(ySpeed);
    
    
    shots.push(shot);
    shotTimeout = setTimeout(() => { clearTimeout(shotTimeout); shotTimeout = null; }, 1000 * towerFire);
}

function angle(c1,c2) {
    return Math.atan((c1 + 30) / (c2)) * -1;
}