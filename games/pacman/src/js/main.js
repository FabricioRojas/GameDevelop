const imgDir = 'src/img/';
const soundDir = 'src/sound/';


var game = new Game('gc', 800, 600, true);
setInterval(() => game.draw(drawing), 1000 / 60);

game.canvas.setBackgroundImage('');
game.canvas.setBackgroundColor('#000');
game.gui.addMenu('main_menu', 'rgba(37, 31, 128, 1)', game.canvas.width, game.canvas.height, 0, 0, 'white', 2);
game.gui.addItemMenu('main_menu', game.ELEMENT.IMAGE, `${imgDir}button_singleplayer.png`, 200, 50, game.canvas.width/2-100, 100, {
    click: () => {
        startGameMode(0);
    },
    hover: function() {
        this.setSrc(`${imgDir}button_hover_singleplayer.png`);
    },
    iddle: function() {
        this.setSrc(`${imgDir}button_singleplayer.png`);
    }
});
game.gui.addItemMenu('main_menu', game.ELEMENT.IMAGE, `${imgDir}button_multiplayer.png`, 200, 50, game.canvas.width/2-100, 180, {
    click: () => {
        startGameMode(1);
    },
    hover: function() {
        this.setSrc(`${imgDir}button_hover_multiplayer.png`);
    },
    iddle: function() {
        this.setSrc(`${imgDir}button_multiplayer.png`);
    }
});


var pacman = game.addElement(game.ELEMENT.IMAGE, `${imgDir}pacman2.png`, 131, 174, 100, 200, true);
pacman.addAnimation('left', { rows: 4, cols: 3, fixedY: true, update: 0.1, width: 35, height: 35 });
pacman.addAnimation('right', { rows: 4, cols: 3, currentRow:1, fixedY: true,update: 0.1, width: 35, height: 35 });
pacman.addAnimation('up', { rows: 4, cols: 3, currentRow:2, fixedY: true,update: 0.1, width: 35, height: 35 });
pacman.addAnimation('down', { rows: 4, cols: 3, currentRow:3, fixedY: true,update: 0.1, width: 35, height: 35 });
pacman.addAnimation('iddle', { rows: 4, cols: 3, currentFrame: 2, currentRow:1, fixedX: true, fixedY: true, update: 0.1, width: 35, height: 35 });
pacman.addListener('keydown', keyPress);
pacman.setMoveByChunk(true);
pacman.setInfiniteMoveX(true);
pacman.setInfiniteMoveY(true);

var gap = 5;
game.setReset(() =>{
    game.setState(game.STATE.MENU);
    game.gui.showMenu('main_menu');
    
    pacman.setXSpeed(0);
    pacman.setYSpeed(0);
    pacman.setCurrentAnimation('iddle');
    
});

game.reset();
var drawing = () => {
    pacman.move({x:true,y:true});
    pacman.print();
}


function startGameMode(gameMode){
    game.play();

}



/* Custom listeners */
function keyPress(evt, player) {
    console.log(evt.keyCode)
    switch (game.control.x) {
        case -1:
            player.setXSpeed(-gap);
            player.setYSpeed(0);
            player.setCurrentAnimation('left');
            break;
        case 1:
            player.setXSpeed(gap);
            player.setYSpeed(0);
            player.setCurrentAnimation('right');
            break;
    }
    switch (game.control.y) {
        case -1:
            player.setXSpeed(0);
            player.setYSpeed(-gap);
            player.setCurrentAnimation('up');
            break;
        case 1:
            player.setXSpeed(0);
            player.setYSpeed(gap);
            player.setCurrentAnimation('down');
            break;
    }
}