class KeyControls {
    constructor() {
        this.keys = {};
        document.addEventListener(
            'keydown',
            e => {
                if ([37, 38, 39, 40].indexOf(e.which) >= 0) {
                    e.preventDefault();
                }
                this.keys[e.which] = true;
            },
            false,
        );

        document.addEventListener(
            'keyup',
            e => {
                this.keys[e.which] = false;
            },
            false,
        );
    }

    get action() {
        return this.keys[32];
    }

    get x() {
        if (this.keys[37] || this.keys[65]) return -1;
        if (this.keys[39] || this.keys[68]) return 1;
        return 0;
    }

    get y() {
        if (this.keys[38] || this.keys[87]) return -1;
        if (this.keys[40] || this.keys[83]) return 1;
        return 0;
    }
}

const controls = new KeyControls


var game = new Game("gc", 800, 600, true);
const canvas = game.canvas;
const ctx = game.canvas.context

var animationTest = game.addElement(game.ELEMENT.IMAGE, `src/img/animation_test.png`, 900, 136, 0, 200);
animationTest.setAnimation({
    currentFrame: 0,
    frameCount: 7,
    rows: 1,
    cols: 7,
});


const { width: w, height: h } = canvas;

let rectW = 50;
let rectH = 50;
let x = w / 2 - rectW / 2;
let y = h / 2 - rectH / 2;
let color = 0;

function loop() {
    requestAnimationFrame(loop);
    x += controls.x;
    y += controls.y;

    if (controls.action) {
        color += 10;
        if (color > 360) {
            color -= 360;
        }
    }

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = `hsl(${color}, 50%, 50%)`;
    ctx.fillRect(x, y, 50, 50);

   animationTest.print();
}

// requestAnimationFrame(loop);

setInterval(loop, 1000/60);