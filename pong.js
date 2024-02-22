// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);

// Define the paddles, ball, and score
var player1 = { 
    x: 0,
    y: 0,
    y: 200, 
    width: 20, 
    height: 100, 
    dy: 20, 
    score: 0,
    moveUp: function() {
        console.log('moveUp called'); // Add this line
        if (this.y - this.dy > 0) {
            this.y -= this.dy;
        }
    },
    moveDown: function() {
        console.log('moveDown called'); // Add this line
        if (this.y + this.height + this.dy < canvas.height) {
            this.y += this.dy;
        }
    }
};
var player2 = { 
    x: 620, 
    y: 200, 
    width: 20, 
    height: 100, 
    dy: 20, 
    score: 0,
    moveUp: function() {
        if (this.y - this.dy > 0) { // Add a boundary check
            this.y -= this.dy;
        }
    },
    moveDown: function() {
        if (this.y + this.height + this.dy < canvas.height) { // Add a boundary check
            this.y += this.dy;
        }
    }
};
class Ball {
    constructor() {
        this.x = 300;
        this.y = 200;
        this.radius = 10;
        this.dx = 2;
        this.dy = 2;
    }

    move() {
        // If the ball hits the top or bottom of the canvas, reverse its y direction
        if (this.y + this.dy < this.radius || this.y + this.dy > canvas.height - this.radius) {
            this.dy = -this.dy;
        }

        // If the ball hits the left or right of the canvas, reverse its x direction
        if (this.x + this.dx < this.radius || this.x + this.dx > canvas.width - this.radius) {
            this.dx = -this.dx;
        }

        // Update the ball's position
        this.x += this.dx;
        this.y += this.dy;
    }

    hits(paddle) {
        // Check if the ball hits the given paddle
        return this.x - this.radius < paddle.x + paddle.width &&
               this.x + this.radius > paddle.x &&
               this.y - this.radius < paddle.y + paddle.height &&
               this.y + this.radius > paddle.y;
    }

    misses(paddle) {
        // Check if the ball misses the given paddle
        // For player 1, the ball misses if it goes past the right edge of the paddle
        // For player 2, the ball misses if it goes past the left edge of the paddle
        // Also check if the ball is within the paddle's y-coordinates
        return paddle === player1 ? this.x - this.radius > paddle.x + paddle.width && this.y + this.radius > paddle.y && this.y - this.radius < paddle.y + paddle.height :
                                    this.x + this.radius < paddle.x && this.y + this.radius > paddle.y && this.y - this.radius < paddle.y + paddle.height;
        
    }

}

    window.addEventListener('keyup', event => {
        switch (event.key) {
            case 'ArrowUp':
                player1.upPressed = false;
                break;
            case 'ArrowDown':
                player1.downPressed = false;
                break;
        }
    });

var ball = new Ball();

// Draw the paddles, ball, and score
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.font = "20px Arial";
    ctx.fillText("Player 1: " + player1.score, 10, 30);
    ctx.fillText("Player 2: " + player2.score, canvas.width - 120, 30);
}



class Paddle {
    constructor(x, y, width, height, dy) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dy = dy;
    }

    moveUp() {
        this.y -= this.dy;
    }

    moveDown() {
        this.y += this.dy;
    }
}

// Handle user input
window.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'w':
            player1.moveUp();
            break;
        case 's':
            player1.moveDown();
            break;
        // Handle other keys...
    }
});
// Handle user input
window.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'w':
            player1.moveUp();
            break;
        case 's':
            player1.moveDown();
            break;
        case 'ArrowUp':
            player2.moveUp();
            break;
        case 'ArrowDown':
            player2.moveDown();
            break;
    }
});

// In your game loop...
function gameLoop() {
    // Move the paddles
    player1.move();
    player2.move();

    // Other game logic...
}

class PongEnvironment {
    constructor() {
        this.paddle1 = new Paddle();
        this.paddle2 = new Paddle();
        this.ball = new Ball();
    }

    get_state() {
        return [this.paddle1.position, this.paddle2.position, this.ball.position, this.ball.velocity];
    }

    get_actions() {
        return ['move up', 'move down'];
    }

    step(action) {
        if (action === 'move up') {
            this.paddle2.move_up();
        } else if (action === 'move down') {
            this.paddle2.move_down();
        }

        this.ball.move();
    }
}

class MLBot {
    constructor(alpha, gamma) {
        this.alpha = alpha;  // learning rate
        this.gamma = gamma;  // discount factor
        this.qTable = {};  // Q-table for storing Q-values
    }

    getState(game) {
        return {
            ballPosition: game.getBallPosition(),
            ballVelocity: game.getBallVelocity(),
            playerPaddlePosition: game.getPlayerPaddlePosition(),
            opponentPaddlePosition: game.getOpponentPaddlePosition()
        };
    }

    getAction(state) {
        // Convert the state to a string to use it as a key in the Q-table
        let stateStr = JSON.stringify(state);
    
        // Get the Q-values for this state
        let qValues = this.qTable[stateStr];
    
        // If there are no Q-values for this state, return a random action
        if (!qValues) {
            return Math.random() < 0.5 ? 'move up' : 'move down';
        }
    
        // Find the action with the highest Q-value
        let maxQValue = Math.max(...Object.values(qValues));
        let bestActions = Object.keys(qValues).filter(action => qValues[action] === maxQValue);
    
        // Return a random action among the best actions
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }

    updateQValue(state, action, reward, nextState) {
        const currentStateQValues = this.qTable[state] || {};
        const currentQValue = currentStateQValues[action] || 0;

        const nextMaxQValue = Math.max(...Object.values(this.qTable[nextState] || {}), 0);
        const updatedQValue = currentQValue + this.alpha * (reward + this.gamma * nextMaxQValue - currentQValue);

        class MLBot {
            getAction(state) {
                // Add your machine learning logic here
            }
        }

        const MLBotInstance = new MLBot();

        // ... existing code ...


        // ... existing code ...
    ball.dx = Math.sign(ball.dx) * 2;
    ball.dy = Math.sign(ball.dy) * 2;
}
}

function update() {
    // Move the ball
    ball.move();

    // Move the paddles
    if (typeof player1.move === 'function') {
        player1.move();
    }
    if (typeof player2.move === 'function') {
        player2.move();
    }

    // Check if the ball hits the paddles
    if (ball.hits(player1)) {
        ball.dx = -ball.dx;
    } else if (ball.hits(player2)) {
        ball.dx = -ball.dx;
    }

    // Check if the ball misses the paddles
    if (ball.misses(player1)) {
        // Player 2 scores a point
        player2.score++;
    } else if (ball.misses(player2)) {
        // Player 1 scores a point
        player1.score++;
    }
}

// Game loop
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();

// In your game loop...
function gameLoop() {
    // Move the paddles
    player1.move();
    player2.move();

    // Move the ball
    ball.move();

    // Check if the ball hits or misses the paddles
    if (ball.hits(player1)) {
        // Reverse the ball's direction
        ball.dx = -ball.dx;
    } else if (ball.hits(player2)) {
        // Reverse the ball's direction
        ball.dx = -ball.dx;
    } else if (ball.misses(player1)) {
        // Player 2 scores a point
        player2.score++;
    } else if (ball.misses(player2)) {
        // Player 1 scores a point
        player1.score++;
    }
}


// Keyboard controls


window.addEventListener("keydown", function(e) {
    switch(e.key) {
        case "w":
            player1.dy = -2;
            break;
        case "s":
            player1.dy = 2;
            break;
        case "ArrowUp":
            player2.dy = -2;
            break;
        case "ArrowDown":
            player2.dy = 2;
            break;
    }
});

window.addEventListener("keyup", function(e) {
    if (e.key == "w" || e.key == "s") {
        player1.dy = 0;
    }
    if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        player2.dy = 0;
    }
});
// Define the MLBot class with a getAction method
class MLBotClass {
    getAction(state) {
        // Implement your action selection logic here
        console.log(state); // Log the state object

        if (state && state.ball && state.player2 && state.player2.position) {
            if (state.ball.y < state.player2.position.y) {
                return 'move up';
            } else if (state.ball.y > state.player2.position.y + state.player2.height) {
                return 'move down';
            } else {
                return 'stay';
            }
        } else {
            // Handle the case where state, state.ball, or state.player2.position is undefined
            console.error('Invalid state:', state);
            return 'stay'; // Default action
        }
    }
}


function getState(game) {
    return {
        ballPosition: game.ball.position,
        ballVelocity: game.ball.velocity,
        player1PaddlePosition: game.player1.position,
        player2PaddlePosition: game.player2.position
    };
}
let game = {
    ball: {
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 1 }
    },
    player1: {
        position: { x: 0, y: 0 }
    },
    player2: {
        position: { x: 10, y: 10 }
    }
};
// Instantiate the MLBot object
let newMLBot = new MLBotClass();

// Get the current game state
let state = getState(game);

// Get the action from the MLBot
let action = newMLBot.getAction(state);

// MLBot controls player2.dy
function MLBotControl() {
   // Define the game object
let game = {
    ball: {
        position: { x: 0, y: 0 },
        velocity: { x: 1, y: 1 }
    },
    player1: {
        position: { x: 0, y: 0 }
    },
    player2: {
        position: { x: 10, y: 10 }
    }
};

// Define the getState function
function getState(game) {
    return {
        ballPosition: game.ball.position,
        ballVelocity: game.ball.velocity,
        player1PaddlePosition: game.player1.position,
        player2PaddlePosition: game.player2.position
    };
}

// Call the getState function with the game object
let state = getState(game);

    // Ask the MLBot for the best action in this state
    let action = newMLBot.getAction(state);

    // Convert the action to a change in paddle position
    switch (action) {
        case 'move up':
            player2.dy = -paddleSpeed;
            break;
        case 'move down':
            player2.dy = paddleSpeed;
            break;
        default:
            player2.dy = 0;
            break;
    }
}

// Call the mlBotControl function to control player2.dy
MLBotControl();
