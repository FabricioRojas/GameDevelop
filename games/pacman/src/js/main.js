const imgDir = 'src/img/';
const soundDir = 'src/sound/';


var game = new Game('gc', 800, 600, true);
setInterval(() => game.draw(drawing), 1000 / 60);

game.gui.addMenu('main_menu', 'rgba(37, 31, 128, 1)', game.canvas.width, game.canvas.height, 0, 0, 'white', 2);
game.gui.addItemMenu('main_menu', game.ELEMENT.IMAGE, `${imgDir}button_singleplayer.png`, 200, 50, game.canvas.width/2-100, 100, {
    click: () => {
        game.reset(0);
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
        game.reset(1);
    },
    hover: function() {
        this.setSrc(`${imgDir}button_hover_multiplayer.png`);
    },
    iddle: function() {
        this.setSrc(`${imgDir}button_multiplayer.png`);
    }
});


game.setReset((gameMode) =>{
    console.log(gameMode);
    game.play();
});

game.toggleMenuState();
game.gui.showMenu('main_menu');
var drawing = function () {
    

};