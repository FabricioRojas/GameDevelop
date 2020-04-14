class Game {

    KEY = {ESC: 27, SPACE_BAR:32, INTRO: 13, LEFT : 37,UP : 38,RIGHT : 39,DOWN : 40,W: 87, A: 65, S: 83, D: 68}
    ELEMENT = {CIRCLE : 'Circle',RECT : 'Rect',TEXT : 'Text',IMAGE:'Image',SOUND:'Sound'}
    STATE = {PAUSE : 'Pause',PLAY : 'Play',MENU : 'Menu',WIN : 'Win', LOSE: 'Lose'}

    constructor(element, width, height, develop){
        this.canvas = new GameCanvas(element, width, height);
        this.develop = develop;
        if(this.develop) this.fui = new FrameUI(this.canvas.canvas);
        this.control = new GameControls(this.KEY);
        this.gui = new GameUI(this);
        this.elements = {};
        this.currentMenu;
        this.init();
    }

    /* Methods */
    init(){
        this.state = this.STATE.PAUSE;
        this.canvas.clear();
        this.canvas.print();
        if(this.develop){
            var image = this.addElement(this.ELEMENT.IMAGE, "../frame/src/img/background-grid.svg", 
            this.canvas.width, this.canvas.height, 0, 0)
            this.canvas.setBackgroundImage(image);
        }
    
        var stopButton = document.getElementById("fui-stop");
        if(stopButton) stopButton.addEventListener('click', () => {
			this.togglePlayState();
        });
        this.canvas.canvas.addEventListener("mousedown", (e) => {
            if(this.menuDraw && this.state == this.STATE.MENU){
                for(var i in this.gui.listeners){
                    var click = this.canvas.getMousePosition(e);
                    var element = this.gui.listeners[i];
                    if(this.currentMenu == element.menu){
                        var finalX = element.x;
                        var finalY = element.y;
                        if(element.type == this.ELEMENT.TEXT){
                            finalX -= element.width/2;
                            finalY -= element.height;
                        }
                        if((click.x > finalX &&click.x < (finalX + element.width)) &&(click.y > finalY &&click.y < (finalY + element.height))){
                            element.action();
                        }
                    }
                }
            }
        });
    }
    draw(drawing){
        if(this.menuDraw && this.state == this.STATE.MENU){
            this.menuDraw();
            return;
        } 
        if(this.beforeDraw) this.beforeDraw();
        if(this.state == this.STATE.PAUSE) return;
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
    menu(){
        this.state = this.STATE.MENU;
    }
    togglePlayState(){
        if(this.state == this.STATE.PLAY) this.pause(); 
        else this.play();
    }
    toggleMenuState(){
        if(this.state != this.STATE.MENU) this.menu(); 
        else this.play();
    }


    /* Setters */
    setState(state) {
        this.state = state;
    }
    setMenuDraw(menuDraw) {
        this.menuDraw = menuDraw;
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
                element = new CircleElement(this.canvas, this.fui, this.ELEMENT.CIRCLE, color, var1, var2, var3);
                break;
            case this.ELEMENT.RECT:
                element = new RectElement(this.canvas, this.fui, this.ELEMENT.RECT, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.TEXT:
                element = new TextElement(this.canvas, this.fui, this.ELEMENT.TEXT, color, var1, var2, var3, var4);
                break;
            case this.ELEMENT.IMAGE:
                element = new ImageElement(this.canvas, this.fui, this.ELEMENT.IMAGE, color, var1, var2, var3, var4);
                break;
        }
        if(this.fui) this.fui.addElement(element);
        this.elements[element.id+''] = element;
        return element;
    }
    removeElement(element){
        if(this.elements[element.id+'']){
            this.elements[element.id+''] = undefined;
            delete this.elements[element.id+''];
            if(this.fui) this.fui.removeElement(element);
        }
    }
    setCurrentMenu(currentMenu) {
        console.log("currentMenu", currentMenu)
        this.currentMenu = currentMenu;
    }
}

class GameUI{

    constructor(game){
        this.game = game;
        this.listeners = [];
        this.menus = {};
    }

    addMenu(menu, color, width, height, x, y, borderColor, borderWidth){
        if(!this.menus[menu+'']){ 
            this.menus[menu+''] = this.game.addElement(this.game.ELEMENT.RECT, color, width, height, x, y);
            this.menus[menu+''] = this.game.addElement(this.game.ELEMENT.RECT, color, width, height, x, y);
            if(menu == "main_menu") this.menus[menu+''].addListener("keydown", (evt) => this.menuKeyDown(evt));
        }
    }
    menuKeyDown(evt){
        if(evt.keyCode == this.game.KEY.ESC){
            this.game.toggleMenuState();
            this.showMenu("main_menu");
        }
    }
    addItemMenu(menu, type, listener, color, var1, var2, var3, var4, action){
        if(this.menus[menu+'']){
            if(!this.menus[menu+''].items) this.menus[menu+''].items = [];
            if(!var3 && !var4){
                this.game.canvas.context.font = var1 + "px Verdana";
                var3 = (this.game.canvas.width/2);
                var4 = this.menus[menu+''].x+(this.menus[menu+''].items.length*50);
            }
            var newItemMenu = game.addElement(type, color, var1, var2, var3, var4);
            newItemMenu.action = action;
            newItemMenu.menu = menu;
            if(listener) this.addListener(newItemMenu);
            this.menus[menu+''].items.push(newItemMenu);
        }
    }
    addListener(element){
        if(!this.listeners[element.id+'']){
            this.listeners[element.id+''] = element;
        }
    }
    removeListener(elementId){
        if(this.listeners[elementId+'']){
            this.listeners[elementId+''] = undefined;
            delete this.listeners[elementId+'']; 
        }
    }
    removeMenu(menu){
        if(this.menus[menu+'']){
            this.menus[menu+''] = undefined;
            delete this.menus[menu+'']; 
        }
    }
    showMenu(menu){
		this.game.setCurrentMenu(menu);
        if(this.menus[menu+'']){
            this.game.setMenuDraw(() => {
                this.menus[menu+''].print();
                for(var i in this.menus[menu+''].items){
                    this.menus[menu+''].items[i].print();
                }
            })
        }
    }
    
    /* Setters */

}

class FrameUI {
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
            'isSolid',

            
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
        button.id = 'fui-stop';
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
        if(!ulElementL || !ulElementR) return;
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
        this.solidBordersX = false;
        this.solidBordersY = false;
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
    getMousePosition(event) { 
        let rect = this.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        return {x:x, y:y};
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
    setSolidBordersX(solidBordersX) {
        this.solidBordersX = solidBordersX;
    }
    setSolidBordersY(solidBordersY) {
        this.solidBordersY = solidBordersY;
    }
}

class CanvasElement{

    constructor(canvas, fui, type, color, x, y){
        this.canvas = canvas;
        this.context = canvas.context;

        this.isSolid = false;
        this.moveByChunk = false;

        this.type = type;
        this.fui = fui;
        
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
                if(this.x<0) this.x= this.moveByChunk ? this.canvas.width-this.width: this.canvas.width-1;
                if(this.x>this.canvas.width-1) this.x=0;
            }else if(this.isSolid && (this.canvas.solidBordersX && (this.x<0 || this.x+this.width>this.canvas.width-1))){
                this.xSpeed *= -1;
            }
            this.x += this.moveByChunk ? parseInt(this.xSpeed) : this.xSpeed;
        }
        if(vector == 'y'){
            if(this.infiniteMoveY){
                if(this.y<0) this.y=this.moveByChunk ? this.canvas.height-this.height: this.canvas.height-1;
                if(this.y>this.canvas.height-1) this.y=0;
            }else if(this.isSolid && (this.canvas.solidBordersY && (this.y<0 || this.y+this.height>this.canvas.height-1))){
                this.ySpeed *= -1;
            }
            this.y +=  this.moveByChunk ? parseInt(this.ySpeed + this.gravitySpeed) : this.ySpeed + this.gravitySpeed;
        }
    }
    addSound(event, track){
        if(!this.sounds[event+'']) this.sounds[event+''] = new Audio(track);
    }
    setSoundVolume(event, volume){
        if(this.sounds[event+'']) this.sounds[event+''].volume = volume;
    }
    setSoundLoop(event, loop){
        if(this.sounds[event+'']) this.sounds[event+''].loop = loop;
    }
    setSoundDuration(event, duration){
        if(this.sounds[event+'']) this.sounds[event+''].timeOut = duration;
    }
    playSound(event){
        if(this.sounds[event+'']){
            this.sounds[event+''].play();
            if(this.sounds[event+''].timeOut)
            setTimeout(() => {
                this.sounds[event+''].pause();
                this.sounds[event+''].load();
            }, this.sounds[event+''].timeOut*1000);
        } 
    }
    resetSound(event){
        if(this.sounds[event+'']) this.sounds[event+''].load();
    }
    pauseSound(event){
        if(this.sounds[event+'']) this.sounds[event+''].pause();
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
    collide(otherobj) {
        if(this.moveByChunk) return this.collideExact(otherobj);
        var crash = true;
        if (((this.y + (this.height)) < otherobj.y) ||
        (this.y > (otherobj.y + (otherobj.height))) ||
        ((this.x + (this.width)) < otherobj.x) ||
        (this.x > (otherobj.x + (otherobj.width)))) {
          crash = false;
        }
        return crash;
    }
    collideExact(otherobj) {
        return this.y == otherobj.y && this.x == otherobj.x;
    }
    collideWithDirecction(otherobj) {
        if (!this.collide(otherobj)) return -1;
        // console.log("y",this.y + this.height, otherobj.y, otherobj.y + otherobj.height, this.y);
        // console.log("x", this.x+this.width, otherobj.x, otherobj.x + otherobj.width, this.x);

        if((
            (this.y > otherobj.y && this.y < (otherobj.y + otherobj.height)) ||
            ((this.y + this.height) > otherobj.y && (this.y + this.height) < (otherobj.y + otherobj.height))
        ) && (this.x + this.width) <= otherobj.x+1)
            return 0;
        if((
            (this.y > otherobj.y && this.y < (otherobj.y + otherobj.height)) ||
            ((this.y + this.height) > otherobj.y && (this.y + this.height) < (otherobj.y + otherobj.height))
        ) && (otherobj.x + otherobj.width) <= this.x+1)
            return 2;
        if((
            (this.x > otherobj.x && this.x < (otherobj.x + otherobj.width)) ||
            ((this.x + this.width) > otherobj.x && (this.x + this.width) < (otherobj.x + otherobj.width))
        ) && (this.y + this.height-1) >= otherobj.y)
                return 1;
        if((
            (this.x > otherobj.x && this.x < (otherobj.x + otherobj.width)) ||
            ((this.x + this.width) > otherobj.x && (this.x + this.width) < (otherobj.x + otherobj.width))
        ) && (otherobj.y + otherobj.height-1) >= this.y)
            return 3;
        return -1
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
    setIsSolid(isSolid) {
        this.isSolid = isSolid;
    }
    setMoveByChunk(moveByChunk) {
        this.moveByChunk = moveByChunk;
    }
}

class CircleElement extends CanvasElement{

    constructor(canvas, fui, type, color, radius, x, y){
        super(canvas, fui, type, color, x, y);
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
        if(this.fui) this.fui.updateElement(this);
    }

    /* Setters */
    setRadius(radius) {
        this.radius = radius;
    }
}

class RectElement extends CanvasElement{

    constructor(canvas, fui, type, color, width, height, x, y){
        super(canvas, fui, type, color, x, y);
        this.width = width;
        this.height = height;
    }

    /* Methods */
    print(){
        if(this.rotate){
            this.context.save();            
            this.context.translate(this.x+(this.width/2), this.y+(this.height/2));
            this.context.rotate(this.angle);
            this.context.fillStyle = this.color;
            this.context.fillRect(this.width / -2, this.height / -2, this.width, this.height);
            this.context.restore();
        }else{
            this.context.fillStyle = this.color;
            this.context.fillRect(this.x, this.y, this.width, this.height); 
        }
        if(this.fui) this.fui.updateElement(this);
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

    constructor(canvas, fui, type, color, size, text, x, y){
        super(canvas, fui, type, color, x, y);
        this.size = size;
        this.text = text;
        this.align = "center";
        this.font = "Verdana";
        this.canvas.context.font = this.size + "px "+ this.font;
        this.width = this.canvas.context.measureText(this.text).width;
        this.height = this.size;
    }

    /* Methods */
    print(){
        this.context.font = this.size + "px "+ this.font;
        this.context.textAlign = this.align; 
        this.context.fillStyle = this.color;
        this.context.fillText(this.text, this.x, this.y);
        if(this.fui) this.fui.updateElement(this);
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

    constructor(canvas, fui, type, src, width, height, x, y){
        super(canvas, fui, type, null, x, y);
        this.src = src;
        this.image = new Image();
        this.image.src = this.src;
        this.width = width;
        this.height = height;
    }

    /* Methods */
    print(){
        if(this.rotate){
            this.context.save();
            this.context.translate(this.x+(this.width/2), this.y+(this.height/2));
            this.context.rotate(this.angle);
            this.context.translate(-this.x-(this.width/2), -this.y-(this.height/2));
            this.context.drawImage(this.image,this.x,this.y,this.width,this.height);
            this.context.restore();
        }else{
            this.context.drawImage(this.image,this.x,this.y,this.width,this.height);
        }
        if(this.fui) this.fui.updateElement(this);
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