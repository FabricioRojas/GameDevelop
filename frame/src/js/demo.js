window.onload=function() {
    var game = new Game("gc", 800, 600);        
    var circle1 = game.addElement(game.ELEMENT.CIRCLE, "red", 5, 22, 33);
    var circle2 = game.addElement(game.ELEMENT.CIRCLE, "blue", 5, 22, 43);
    var circle3 = game.addElement(game.ELEMENT.CIRCLE, "orange", 5, 12, 43);
    var rect1 = game.addElement(game.ELEMENT.RECT, "red", 10, 50, 40, 60);
    var rect2 = game.addElement(game.ELEMENT.RECT, "blue", 10, 50, 50, 60);
    var rect3 = game.addElement(game.ELEMENT.RECT, "orange", 20, 20, 390, 290);
    var text = game.addElement(game.ELEMENT.TEXT, "orange", 50, "Functions testing", 370, 200);
    var image = game.addElement(game.ELEMENT.IMAGE, "src/img/game-development.png", 
    40, 40, 100, 160);
    
    game.canvas.setBackgroundColor("white");

    rect1.setGravity(0.1);
    rect1.setBounce(0.5);
    rect1.setYSpeed(20);
    rect1.setXSpeed(2);

    rect2.setRotate(true);

    rect3.setXSpeed(20);
    rect3.setYSpeed(20);

    circle2.setBounce(0.9);    
    circle2.setGravity(0.1);

    circle3.setGravity(0.1);
    
    var drawing = function(){
        image.print();
        text.print();

        rect1.print();
        rect1.move('y');
        rect1.move('x');
        rect1.hitBottom();

        rect2.print();
        rect2.setAngle(rect2.angle+(1 * Math.PI / 180));

        rect3.print();

        circle1.print();
        circle1.move('x');

        circle2.print();
        circle2.move('y');
        circle2.hitBottom();

        circle3.print();
        circle3.move('y');
        circle3.hitBottom();
    }
    
    rect3.addListener("keydown");       
    game.init(); 

    var buttonStop = document.getElementById("stop");
    buttonStop.addEventListener('click', function(){
        if(game.state == game.STATE.PLAY) game.pause(); 
        else game.play();
    } );
    
    setInterval(() => game.draw(drawing), 1000/60);     
}