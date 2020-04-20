const imgDir = "src/img/";
const soundDir = "src/sound/";


var game = new Game("gc", 800, 600, true);
setInterval(() => game.draw(drawing), 1000 / 60);

var shots = [];
var shotTimeout = null;
var enemiesSpeed = 0.5;

var tower = game.addElement(game.ELEMENT.CIRCLE, "white", 10, 300, 200);
// var enemy = game.addElement(game.ELEMENT.CIRCLE, "blue", 7, 400, 100);
var enemy = game.addElement(game.ELEMENT.IMAGE, `src/img/enemy_1.png`, 572, 256, 400, 100-50);
enemy.addAnimation('up', {rows: 4,cols: 9, currentRow:0, fixedY: true, update: 0.1});
enemy.addAnimation('left', {rows: 4,cols: 9, currentRow:1, fixedY: true, update: 0.1});
enemy.addAnimation('down', {rows: 4,cols: 9, currentRow:2, fixedY: true, update: 0.1});
enemy.addAnimation('right', {rows: 4,cols: 9, currentRow:3, fixedY: true, update: 0.1});
enemy.addAnimation('stop', {rows: 4,cols: 9, currentRow:2, currentFrame:1, fixedX: true, fixedY: true, update: 0.1});

tower.towerFireSpeed = 7;
tower.towerFire = 0.5;
tower.towerRadius = 100;

enemy.setInfiniteMoveX(true);
enemy.setInfiniteMoveY(true);
enemy.setXSpeed(0);
enemy.setYSpeed(enemiesSpeed);
enemy.setCurrentAnimation('down');

var drawing = function () {
    enemyRoutine(enemy);

    if (enemy.whitinOfBounds(tower, tower.towerRadius)) shoot(enemy, tower);
    for (var s in shots) {
        shots[s].move({x:true, y:true});
        shots[s].print();
        if(shots[s].collide(enemy)){
            console.log("hit");
        }
        // game.pause();
        if(shots[s].outOfBounds() || shots[s].collide(enemy)){
            game.removeElement(shots[s]);
            shots.shift();
        }
    }

    tower.print();
    enemy.print();
};

function enemyRoutine(e){
    if(e.y == 100 && e.x == 400){
        enemy.setCurrentAnimation('down');
        e.setXSpeed(0);
        e.setYSpeed(enemiesSpeed);
    }
    if(e.y == 300 && e.x == 400){
        enemy.setCurrentAnimation('left');
        e.setXSpeed(-enemiesSpeed);
        e.setYSpeed(0);
    }
    if(e.x == 200 && e.y == 100){
        enemy.setCurrentAnimation('right');
        e.setXSpeed(enemiesSpeed);
        e.setYSpeed(0);
    }
    if(e.x == 200 && e.y == 300){
        enemy.setCurrentAnimation('up');
        e.setXSpeed(0);
        e.setYSpeed(-enemiesSpeed);
    }    
    e.move({x:true, y:true});
}

function shoot(e, t) {
    if (shotTimeout) return;
    var c1 = (e.x+(e.currentAnimation.width/2)) - t.x;
    var c2 = (e.y+(e.currentAnimation.height/2)) - t.y;

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