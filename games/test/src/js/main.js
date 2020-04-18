var game = new Game("gc", 800, 600, true);
const canvas = game.canvas;
const ctx = game.canvas.context
const { width: w, height: h } = canvas;


let rectW = 50;
let rectH = rectW;
let x = w / 2 - rectW / 2;
let y = h / 2 - rectH / 2;

var cube = game.addElement(game.ELEMENT.RECT, `hsl(0, 50%, 50%)`, rectW, rectH, x, y);
var portalA = game.addElement(game.ELEMENT.RECT, 'orange', 10, 155, w-10, 345);
var portalB = game.addElement(game.ELEMENT.RECT, 'blue', 10, 155, 0, 345);
var floor = game.addElement(game.ELEMENT.RECT, 'red', w, 10, 0, 500);
var animationTest = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test_full.png`, 913, 609, 0, 360);
// var animationTest = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test.png`, 900, 136, 0, 200);
animationTest.setAnimation({
    currentFrame: 0,
    frameCount: 7,
    rows: 4,
    cols: 7,
    update: 0.01
});
animationTest.setXSpeed(8);
animationTest.setInfiniteMoveX(true);

game.play();
var loop = function () {
    // requestAnimationFrame(loop);
    cube.x += game.control.x;
    cube.y += game.control.y;

    animationTest.move('x');

    cube.print();
    floor.print();
    animationTest.print();
    portalA.print();
    portalB.print();
}

// requestAnimationFrame(loop);
setInterval(() => game.draw(loop), 1000 / 60);