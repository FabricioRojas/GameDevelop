const imgDir = 'src/img/';
const soundDir = 'src/sound/';


var game = new Game('gc', 800, 600, false);
game.control.setStep(30);
game.canvas.setSolidBordersY(true);
setInterval(() => game.draw(drawing), 1000 / 30);

var square = 12;
var score1Val = 0, score2Val = 0;
var showingWinScreen = true;
var winningScore = 10;

var ball = game.addElement(game.ELEMENT.RECT, 'white', square, square, game.canvas.width / 2 - (square / 2), game.canvas.height / 2 - (square / 2));
var paddle2 = game.addElement(game.ELEMENT.RECT, 'white', 10, 100, 15, 50);
var paddle1 = game.addElement(game.ELEMENT.RECT, 'white', 10, 100, game.canvas.width - paddle2.width * 2, 40);
var score1 = game.addElement(game.ELEMENT.TEXT, 'white', 20, score1Val, 150, 80);
var score2 = game.addElement(game.ELEMENT.TEXT, 'white', 20, score2Val, game.canvas.width - score1.x, 80);
var winMessage = game.addElement(game.ELEMENT.TEXT, 'white', 30, '', game.canvas.width / 2, game.canvas.height / 2);
var readyMessage = game.addElement(game.ELEMENT.TEXT, 'white', 30, 'Ready?', game.canvas.width / 2, game.canvas.height / 2);
var clickMessage = game.addElement(game.ELEMENT.TEXT, 'white', 15, 'Click to start', game.canvas.width / 2, game.canvas.height / 2 + 50);

var BALLSPEEDX = 7;
var ballSpeedX = BALLSPEEDX;
var BALLSPEEDY = 4;
var ballSpeedY = BALLSPEEDY;
var BALLSPEDDLIMIT = BALLSPEEDY + 4;

ball.setXSpeed(ballSpeedX);
ball.setYSpeed(Math.floor(Math.random() * (BALLSPEEDY)));

ball.setIsSolid(true);
paddle2.setIsSolid(true);
paddle2.setIsSolid(true);

ball.addSound('background', `${soundDir}background.mp3`);
ball.setSoundVolume('background', 0.1);
ball.setSoundLoop('background', true);

ball.addSound('ball_fall', `${soundDir}ball_fall.mp3`);
ball.setSoundDuration('ball_fall', 0.3);
ball.setSoundVolume('ball_fall', 0.4);

paddle2.addSound('hit_paddle', `${soundDir}ball_hit_3.mp3`);
paddle2.setSoundDuration('hit_paddle', 0.5);

winMessage.addSound('win', `${soundDir}wining.mp3`);
winMessage.addSound('lose', `${soundDir}losing.mp3`);
winMessage.setSoundVolume('win', 0.2);

game.setReset(() => {
    showingWinScreen = false;
    score1Val = 0, score2Val = 0;
    score1.setText(score1Val);
    score2.setText(score2Val);
    ball.setX(game.canvas.width / 2 - (ball.width / 2));
    ball.setY(game.canvas.height / 2 - (ball.height / 2));
    ball.resetSound('background');
    ball.playSound('background');
    game.play();
});
game.reset();
var drawing = function () {
    if (showingWinScreen) {
        if (score1Val == winningScore) {
            winMessage.playSound('win');
            winMessage.setText('Player 1 wins');
            winMessage.print();
        } else if (score2Val == winningScore) {
            winMessage.playSound('lose');
            winMessage.setText('Player 2 wins');
            winMessage.print();
        } else readyMessage.print();
        clickMessage.print();
        return;
    } else {
        computerMovement();
        ball.move({x:true, y:true});
        paddle2.y += game.control.y;

        if (ball.collide(paddle2)) {
            paddle2.playSound('hit_paddle');
            // ball.setXSpeed(-ball.xSpeed);
            // var deltaY = ball.y - (paddle1.y + paddle1.height/2);
            // ball.setYSpeed(deltaY * 0.1);
            ball.setXSpeed(ball.xSpeed * -1);
            if (game.control.y < 0 && ball.ySpeed > 0) {
                ballSpeedY = BALLSPEEDY;
                ball.setYSpeed(-ballSpeedY);
            }
            if (game.control.y > 0 && ball.ySpeed < 0) {
                ballSpeedY = BALLSPEEDY;
                ball.setYSpeed(ballSpeedY);
            }

            if (game.control.y < 0 && ball.ySpeed < 0 || game.control.y < 0 && ball.ySpeed < 0) {
                if (ballSpeedY < BALLSPEDDLIMIT) ballSpeedY += 2;
            }

        } else if (ball.x >= (game.canvas.width)) {
            score1Val++;
            score1.setText(score1Val);
            ballReset();
        }

        if (ball.collide(paddle1)) {
            paddle2.playSound('hit_paddle');
            ball.setXSpeed(ball.xSpeed * -1);
        } else if (ball.x <= 0) {
            score2Val++;
            score2.setText(score2Val);
            ballReset();
        }

        ball.print();
        paddle1.print();
        paddle2.print();
        score1.print();
        score2.print();
    }
};
function ballReset() {
    ball.playSound('ball_fall');
    if (score1Val >= winningScore || score2Val >= winningScore) showingWinScreen = true;
    ball.setX(game.canvas.width / 2 - (ball.width / 2));
    ball.setY(game.canvas.height / 2 - (ball.width / 2));
    ballSpeedY = BALLSPEDDLIMIT;
    ball.setXSpeed(ballSpeedX);
    ball.setYSpeed(Math.floor(Math.random() * (BALLSPEEDY)));
}
function computerMovement() {
    var paddle1Center = paddle1.y + paddle1.height / 2

    if (paddle1Center < ball.y - 35) paddle1.y += 4;
    else if (paddle1Center > ball.y + 35) paddle1.y -= 4;
}

/* Custom Listeners */
game.canvas.addListener('click', handlemouseClick);
game.canvas.addListener('mousemove', function (e) {
    var mousePos = getMousePosition(e); paddle1.y = mousePos.y;
});

function handlemouseClick() {
    if (showingWinScreen) return game.reset();
}
function getMousePosition(e) {
    var rect = game.canvas.canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = e.clientX - rect.left - root.scrollLeft;
    var mouseY = e.clientY - rect.top - root.scrollTop - paddle1.height / 2;
    return { x: mouseX, y: mouseY }
}