class Game {

    KEY = {LEFT : 37,UP : 38,RIGHT : 39,DOWN : 40}
    ELEMENT = {CIRCLE : 'circle',RECT : 'rect',TEXT : 'text',IMAGE:'image',SOUND:'sound'}
    STATE = {PAUSE : 'pause',PLAY : 'play',MENU : 'menu'}

    constructor(element, width, height){
        this.canvas = new GameCanvas(element, width, height);
        this.elements = {};
        this.init();
    }

    /* Methods */
    init(){
        this.state = this.STATE.PAUSE;
        this.canvas.clear();
        this.canvas.print();
        var image = this.addElement(this.ELEMENT.IMAGE, "../frame/src/img/background-grid.svg", 
        this.canvas.width, this.canvas.height, 0, 0)
        this.canvas.setBackgroundImage(image);
    }
    draw(drawing){
        if(this.state == this.STATE.PAUSE) return;
        if(this.beforeDraw) this.beforeDraw();
        if(this.canvas.shouldClear) this.canvas.clear();
        this.canvas.print();
        if(drawing) drawing();
        if(this.afterDraw) this.afterDraw();
    }
    pause(){
        this.state = this.STATE.PAUSE;
    }
    play(){
        this.state = this.STATE.PLAY;
    }


    /* Setters */
    setState(state) {
        this.state = state;
    }
    setBeforeDraw(beforeDraw) {
        this.beforeDraw = beforeDraw;
    }
    setAfterDraw(afterDraw) {
        this.afterDraw = afterDraw;
    }
    addElement(type, color, var1, var2, var3, var4) {
        var element;
        switch(type){
            case this.ELEMENT.CIRCLE:
                element = new CircleElement(this.canvas, color, var1, var2, var3);
                break;
            case this.ELEMENT.RECT:
                element = new RectElement(this.canvas, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.TEXT:
                element = new TextElement(this.canvas, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.IMAGE:
                element = new ImageElement(this.canvas, color, var1, var2, var3, var4);
                break;
        }
        this.elements[element.id+''] = element;
        return element;
    }
}


class GameCanvas{

    constructor(element, width, height){
        this.canvas = document.getElementById(element);
        this.backgroundColor = "black";
        this.shouldClear = true;
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext("2d");
        this.fps = 1000/60;
    }

    /* Methods */
    print(){
        this.context.fillStyle=this.backgroundColor;
        this.context.fillRect(0,0,this.width,this.height);
        if(this.backgroundImage) this.backgroundImage.print();
    }
    clear(){
        this.context.clearRect(0, 0, this.width, this.height);
    }

    /* Setters */
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }
    setFps(fps) {
        this.fps = fps;
    }
    setBackgroundColor(backgroundColor) {
        this.backgroundColor = backgroundColor;
    }
    setBackgroundImage(backgroundImage) {
        this.backgroundImage = backgroundImage;
    }
    setShouldClear(shouldClear) {
        this.shouldClear = shouldClear;
    }
}

class CanvasElement{

    constructor(canvas, color, x, y){
        this.canvas = canvas;
        this.context = canvas.context;
        
        this.id = '_' + Math.random().toString(36).substr(2, 9);
        this.color = color;
        this.x = x ? x : 0;
        this.y = y ? y : 0;
        this.xSpeed = 1;
        this.ySpeed = 1;
        this.width = 0;
        this.height = 0;

        this.angle = 0;
        this.rotate = false;

        this.gravity = 0;
        this.gravitySpeed = 0;
        this.bounce = 0;

        this.listeners = {};

        this.sounds = {};

        this.infiniteMoveX = false;
        this.infiniteMoveY = false;
    }

    /* Methods */
    move(vector){
        this.gravitySpeed += this.gravity;
        if(vector == 'x'){
            if(this.infiniteMoveX){
                if(this.x<0) this.x=this.canvas.width-1;
                if(this.x>this.canvas.width-1) this.x=0;
            }
            this.x += this.xSpeed;
        }
        if(vector == 'y'){
            if(this.infiniteMoveY){
                if(this.y<0) this.y=this.canvas.height-1;
                if(this.y>this.canvas.height-1) this.y=0;
            }
            this.y += this.ySpeed + this.gravitySpeed;
        }
    }
    addSound(event, track){
        if(!this.sounds[event+'']) this.sounds[event+''] = new sound(track);
    }
    playSound(event){
        if(!this.sounds[event+'']) this.sounds[event+''].play();
    }
    removeSound(event){
        if(this.sounds[event+'']){
            this.sounds[event+''] = undefined;
            delete this.sounds[event+'']; 
        }
    }
    addListener(event, callback){
        if(!callback){
            switch(event){
                case "keydown":
                    callback = (evt) => this.keyDown(evt);
                    break;
            }
        }
        if(!this.listeners[event+'']) this.listeners[event+''] = document.addEventListener(event,callback);
    }
    removeListener(event){
        if(this.listeners[event+'']){
            document.removeEventListener(event);
            this.listeners[event+''] = undefined;
            delete this.listeners[event+'']; 
        }
    }
    hitBottom() {
        var elementBottom = this.canvas.height - this.height;
        if (this.y > elementBottom) {
          this.y = elementBottom;
          this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }else{
            this.setYSpeed(0);
            var number1 = Number(this.gravitySpeed-(this.gravitySpeed * this.bounce)).toFixed(2);
            var number2 = Number(this.gravitySpeed+(this.gravitySpeed * this.bounce)).toFixed(2)
            if(Math.abs(number1 - number2) < 0.02) this.setXSpeed(0);
        }
    }

    /* Listeners */
    keyDown(evt){
        switch(evt.keyCode) {
            case 37:
                this.setXSpeed(-10);
                this.move('x');
                break;
            case 38:
                this.setYSpeed(-10);
                this.move('y');
                break;
            case 39:
                this.setXSpeed(10);
                this.move('x');
                break;
            case 40:
                this.setYSpeed(10);
                this.move('y');
                break;
        }
    }


    /* Setters */
    setColor(color) {
        this.color = color;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    setXSpeed(xSpeed) {
        this.xSpeed = xSpeed;
    }
    setYSpeed(ySpeed) {
        this.ySpeed = ySpeed;
    }
    setGravity(gravity) {
        this.gravity = gravity;
    }
    setGravitySpeed(gravitySpeed) {
        this.gravitySpeed = gravitySpeed;
    }
    setBounce(bounce) {
        this.bounce = bounce;
    }
    setAngle(angle) {
        this.angle = angle;
    }
    setRotate(rotate) {
        this.rotate = rotate;
    }
    setInfiniteMoveX(infiniteMoveX) {
        this.infiniteMoveX = infiniteMoveX;
    }
    setInfiniteMoveY(infiniteMoveY) {
        this.infiniteMoveY = infiniteMoveY;
    }
}

class CircleElement extends CanvasElement{

    constructor(canvas, color, radius, x, y){
        super(canvas, color, x, y);
        this.radius = radius;
        this.width = radius*2;
        this.height = radius*2;
    }

    /* Methods */
    print(){
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        this.context.fill();
    }

    /* Setters */
    setRadius(radius) {
        this.radius = radius;
    }
}

class RectElement extends CanvasElement{

    constructor(canvas, color, width, height, x, y){
        super(canvas, color, x, y);
        this.width = width;
        this.height = height;
    }

    /* Methods */
    print(){
        if(this.rotate){
            this.context.save();
            this.context.translate(this.x, this.y);
            this.context.rotate(this.angle);
            this.context.fillStyle = this.color;
            this.context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
            this.context.restore();
        }else{
            this.context.fillStyle = this.color;
            this.context.fillRect(this.x, this.y, this.width, this.height); 
        }
    }

    /* Setters */
    setWidth(width) {
        this.width = width;
    }
    setHeight(height) {
        this.height = height;
    }
}

class TextElement extends CanvasElement{

    constructor(canvas, color, size, text, x, y){
        super(canvas, color, x, y);
        this.size = size;
        this.text = text;
        this.align = "center";
        this.font = "Verdana";
    }

    /* Methods */
    print(){
        this.context.font = this.size + "px "+ this.font;
        this.context.textAlign = this.align; 
        this.context.fillStyle = this.color;
        this.context.fillText(this.text, this.x, this.y);
    }

    /* Setters */
    setSize(size) {
        this.size = size;
    }    
    setText(text) {
        this.text = text;
    }    
    setAlign(align) {
        this.align = align;
    }    
    setFont(font) {
        this.font = font;
    }
}

class ImageElement extends CanvasElement{

    constructor(canvas, src, width, height, x, y){
        super(canvas, src, x, y);
        this.image = new Image();
        this.image.src = src;
        this.width = width;
        this.height = height;
    }

    /* Methods */
    print(){
        this.context.drawImage(this.image,this.x,this.y,this.width,this.height);
    }

    /* Setters */
    setSize(size) {
        this.size = size;
    }    
    setText(text) {
        this.text = text;
    }    
    setAlign(align) {
        this.align = align;
    }    
    setFont(font) {
        this.font = font;
    }
}