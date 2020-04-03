class Game {

    KEY = {LEFT : 37,UP : 38,RIGHT : 39,DOWN : 40, ACTION:32, W: 87, A: 65, S: 83, D: 68}
    ELEMENT = {CIRCLE : 'Circle',RECT : 'Rect',TEXT : 'Text',IMAGE:'Image',SOUND:'Sound'}
    STATE = {PAUSE : 'Pause',PLAY : 'Play',MENU : 'Menu'}

    constructor(element, width, height){
        this.canvas = new GameCanvas(element, width, height);
        this.ui = new GameUI(this.canvas.canvas);
        this.control = new GameControls(this.KEY);
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

        var buttonStop = document.getElementById("ui-stop");
		buttonStop.addEventListener('click', () => {
			if(this.state == this.STATE.PLAY) this.pause(); 
			else this.play();
		});
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
                element = new CircleElement(this.canvas, this.ui, this.ELEMENT.CIRCLE, color, var1, var2, var3);
                break;
            case this.ELEMENT.RECT:
                element = new RectElement(this.canvas, this.ui, this.ELEMENT.RECT, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.TEXT:
                element = new TextElement(this.canvas, this.ui, this.ELEMENT.TEXT, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.IMAGE:
                element = new ImageElement(this.canvas, this.ui, this.ELEMENT.IMAGE, color, var1, var2, var3, var4);
                break;
        }
        this.ui.addElement(element);
        this.elements[element.id+''] = element;
        return element;
    }
    removeElement(element){
        if(this.elements[element.id+'']){
            this.elements[element.id+''] = undefined;
            delete this.elements[element.id+''];
            this.ui.removeElement(element);
        }
    }
}

class GameUI {
    constructor(canvas){
        this.canvas = canvas;
        this.properties = [
            'color',
            'width',
            'height',
            'x',
            'y',
            'xSpeed',
            'ySpeed',
            'gravity',
            'gravitySpeed',
            'bounce',

            
            'radius',
            'text',
            'size',
            'align',
            'font',
            'src',
            'angle',
            'rotate',

        ];
        this.init();
    }

    init(){        
        this.rightPanel = document.createElement('div');
        this.rightPanel.id='rightpanel';

        var h2Title = document.createElement('h2');
        h2Title.innerHTML = 'Development Panel'; 

        var button = document.createElement('button');
        button.id = 'ui-stop';
        button.innerText = 'Play/Pause';

        this.rightPanel.appendChild(h2Title);
        this.rightPanel.appendChild(button);

        this.canvas.parentNode.insertBefore(this.rightPanel, this.canvas.nextSibling);
        this.addElement('ul',"test");
    }

    addElement(element){
        if(!element.id) return;
        
        let divElement = document.createElement("div");
        let textElement = document.createElement("h3");
        let ulElementL = document.createElement("ul");
        let ulElementR = document.createElement("ul");
        let divColumnL = document.createElement("div");
        let divColumnR = document.createElement("div");


        divElement.className = 'containerDiv';
        textElement.className = 'elementText';

        divColumnL.className = 'divColumn';
        divColumnR.className = 'divColumn';
        
        ulElementL.className = 'elementUl';
        ulElementR.className = 'elementUl';
        ulElementL.id = 'elementUl-'+element.id+"-L";
        ulElementR.id = 'elementUl-'+element.id+"-R";

        textElement.innerHTML = element.type+': '+element.id;

        for(var i in this.properties){
            var propertyVal = element[this.properties[i]];
            if(element[this.properties[i]]){
                var liElement = document.createElement("li");
                if(typeof propertyVal == 'number' && propertyVal != parseInt(propertyVal))
                propertyVal = propertyVal.toFixed(2);
                liElement.innerHTML = "<b>"+this.properties[i].toUpperCase()+":</b> " + propertyVal + (this.properties[i] == 'width' || this.properties[i] == 'height' ? "px" : "");
                if(i<10) ulElementL.appendChild(liElement);
                else ulElementR.appendChild(liElement);
            }
        }
        
        divColumnL.appendChild(ulElementL);
        divColumnR.appendChild(ulElementR);

        divElement.appendChild(textElement);

        divElement.appendChild(divColumnL);
        divElement.appendChild(divColumnR);
        this.rightPanel.appendChild(divElement);
    }
    updateElement(element){
        let ulElementL = document.getElementById('elementUl-'+element.id+"-L");
        let ulElementR = document.getElementById('elementUl-'+element.id+"-R");
        ulElementL.innerHTML = '';
        ulElementR.innerHTML = '';
        for(var i in this.properties){
            var propertyVal = element[this.properties[i]];
            if(propertyVal){
                var liElement = document.createElement("li");
                if(typeof propertyVal == 'number' && propertyVal != parseInt(propertyVal))
                propertyVal = propertyVal.toFixed(2);
                liElement.innerHTML = "<b>"+this.properties[i].toUpperCase()+":</b> " + propertyVal + (this.properties[i] == 'width' || this.properties[i] == 'height' ? "px" : "");
                if(i<10) ulElementL.appendChild(liElement);
                else ulElementR.appendChild(liElement);
            }
        }
    }
    removeElement(element){
        document.getElementById('elementUl-'+element.id+'-L').parentNode.parentNode.remove();
    }
}

class GameControls {
    constructor(KEY) {
        this.KEY = KEY;
        this.keys = {};
        this.step = 1;
        document.addEventListener(
            'keydown',
            e => {
                if ([this.KEY.LEFT, this.KEY.UP, this.KEY.RIGHT, this.KEY.DOWN].indexOf(e.which) >= 0) {
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
        return this.keys[this.KEY.ACTION];
    }

    get x() {
        if (this.keys[this.KEY.LEFT] || this.keys[this.KEY.A]) return -this.step;
        if (this.keys[this.KEY.RIGHT] || this.keys[this.KEY.D]) return this.step;
        return 0;
    }

    get y() {
        if (this.keys[this.KEY.UP] || this.keys[this.KEY.W]) return -this.step;
        if (this.keys[this.KEY.DOWN] || this.keys[this.KEY.S]) return this.step;
        return 0;
    }
    setStep(step){
        this.step = step;
    }
}

class GameCanvas{

    constructor(element, width, height){
        this.canvas = document.getElementById(element);
        this.backgroundColor = "black";
        this.shouldClear = true;
        this.solidBorders = false;
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
    setSolidBorders(solidBorders) {
        this.solidBorders = solidBorders;
    }
}

class CanvasElement{

    constructor(canvas, ui, type, color, x, y){
        this.canvas = canvas;
        this.context = canvas.context;

        this.type = type;
        this.ui = ui;
        
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
            }else if(this.canvas.setSolidBorders && (this.x<0 || this.x>this.canvas.width-1)){
                this.xSpeed *= -1;
            }
            this.x += this.xSpeed;
        }
        if(vector == 'y'){
            if(this.infiniteMoveY){
                if(this.y<0) this.y=this.canvas.height-1;
                if(this.y>this.canvas.height-1) this.y=0;
            }else if(this.canvas.setSolidBorders && (this.y<0 || this.y>this.canvas.height-1)){
                this.ySpeed *= -1;
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

    constructor(canvas, ui, type, color, radius, x, y){
        super(canvas, ui, type, color, x, y);
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
        this.ui.updateElement(this);
    }

    /* Setters */
    setRadius(radius) {
        this.radius = radius;
    }
}

class RectElement extends CanvasElement{

    constructor(canvas, ui, type, color, width, height, x, y){
        super(canvas, ui, type, color, x, y);
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
        this.ui.updateElement(this);
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

    constructor(canvas, ui, type, color, size, text, x, y){
        super(canvas, ui, type, color, x, y);
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
        this.ui.updateElement(this);
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

    constructor(canvas, ui, type, src, width, height, x, y){
        super(canvas, ui, type, null, x, y);
        this.src = src;
        this.image = new Image();
        this.image.src = this.src;
        this.width = width;
        this.height = height;
    }

    /* Methods */
    print(){
        this.context.drawImage(this.image,this.x,this.y,this.width,this.height);
        this.ui.updateElement(this);
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