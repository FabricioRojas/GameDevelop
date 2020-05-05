var game = new Game('gc', 1920, 1080, true);
const canvas = game.canvas;
const ctx = game.canvas.context
const { width: w, height: h } = canvas;
var dragging = false;
var lastX;
var marginLeft = 0;


let rectW = 50;
let rectH = rectW;
let x = w / 2 - rectW / 2;
let y = h / 2 - rectH / 2;

var portalA = game.addElement(game.ELEMENT.RECT, 'orange', 10, 155, w-10, 345);
var portalB = game.addElement(game.ELEMENT.RECT, 'blue', 10, 155, 0, 345);
var floor = game.addElement(game.ELEMENT.RECT, 'red', w, 10, 0, 500);
var ball = game.addElement(game.ELEMENT.CIRCLE, 'green', 20, 100, 100);
var animationTestDirections = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test_3.png`, 572, 256, 300, 150);
// var animationTest = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test_2.png`, 1536, 2565, 0, 360);
var animationTest = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test_full.png`, 913, 609, 0, 360);
// var animationTest = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test.png`, 900, 136, 0, 200);

animationTest.setXSpeed(10);
animationTest.setInfiniteMoveX(true);
animationTest.addAnimation('right', {rows: 4,cols: 7, update: 0.01});
animationTest.setCurrentAnimation('right');

animationTestDirections.addAnimation('up', {rows: 4,cols: 9, currentRow:0, fixedY: true, update: 0.1});
animationTestDirections.addAnimation('left', {rows: 4,cols: 9, currentRow:1, fixedY: true, update: 0.1});
animationTestDirections.addAnimation('down', {rows: 4,cols: 9, currentRow:2, fixedY: true, update: 0.1});
animationTestDirections.addAnimation('right', {rows: 4,cols: 9, currentRow:3, fixedY: true, update: 0.1});
animationTestDirections.addAnimation('stop', {rows: 4,cols: 9, currentRow:2, currentFrame:1, fixedX: true, fixedY: true, update: 0.1});


game.play();
var loop = function () {
    // requestAnimationFrame(loop);

    animationTest.move({x:true});
    if(game.control.x != 0){
        game.control.x == 1 ? animationTestDirections.setCurrentAnimation('right') : animationTestDirections.setCurrentAnimation('left');
        animationTestDirections.x += game.control.x;
    }else if(game.control.y != 0){
        game.control.y == 1 ? animationTestDirections.setCurrentAnimation('down') : animationTestDirections.setCurrentAnimation('up');
        animationTestDirections.y += game.control.y;
    }else{
        animationTestDirections.setCurrentAnimation('stop')
    }
    console.log('state', ball.state);

    floor.print();
    animationTest.print();
    portalA.print();
    portalB.print();
    ball.print();

    
    if(animationTestDirections.currentAnimation) animationTestDirections.print();
}

// requestAnimationFrame(loop);
setInterval(() => game.draw(loop), 1000 / 60);

// var game = new Game('gc', 1920, 1080, true);

// // var canvas = document.getElementById('gc');
// var canvas = game.canvas
// var dc = game.canvas.context
// var angle = 0;

// var rectWidth = 10;
// var circleWidth = 10;


// var dragging = false;
// var lastX;
// var marginLeft = 0;
// window.setInterval(function(){
//     angle = (angle + 1) % 360;
//     dc.clearRect(0, 0, canvas.width, canvas.height);

//     dc.fillStyle = 'white';
//     dc.beginPath();
//     dc.arc(100, 200, circleWidth, 0, Math.PI * 2, true);
//     dc.fill();


//     // dc.save();  
//     // dc.fillStyle = '#FF0000';
//     // dc.translate(100,200);
//     // console.log(angle*Math.PI/180);
//     // dc.rotate(angle*Math.PI/180);
//     // dc.translate(-100,-200);
//     // dc.fillRect(100-(rectWidth/2), 200+circleWidth, rectWidth, 200);
//     // dc.restore();

// }, 5);