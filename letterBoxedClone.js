'use strict'

document.addEventListener("keydown", handleKeyPress);
button.addEventListener("click", initGame);

// universal consts
const ALPHABET = Array.from("ABCDEFGHIJKLNNOPQRSTUVWXYZ");
const VOWELS = Array.from("AEIOU");

const ctx = canvas.getContext("2d");
ctx.font = "30px Arial";
// setup canvas and constants
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = Math.floor(canvas.getBoundingClientRect().width);
const CANVAS_HEIGHT = Math.floor(canvas.getBoundingClientRect().height);

const TILE_WIDTH = CANVAS_WIDTH / 5;
const TILE_HEIGHT = CANVAS_HEIGHT / 6;
console.log(CANVAS_WIDTH);
console.log(CANVAS_HEIGHT);

const BACKGROUND_COLOR = "#ECECEC";
const GREEN = "#008000";
const YELLOW = "#A6A600";
const GRAY = "#373737";


function initGame() {

}

resetGame()

function resetGame() {
    // clear anything from current instance of game
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    winLossText.textContent = "";

    drawLetterSquares();
    console.log("board drawn");

    //wordToGuess = generateWordToGuess();
    console.log(`Word to guess is ${wordToGuess}`);

    // keep track of current guess and number of guesses
    gameIsGoing = true;
    lettersTyped = 0;
    numGuesses = 0;
    guess = "";
    correct = true; // if current guess is correct

    // take away focus from button
    resetButton.blur();
}


// returns an array of arrays of 3 letters each
// currently for testing purposes
function get_words() {
    return [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l']]
}

function drawLetterSquares() {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    // draw a large square
    ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.stroke();
}

function handleKeyPress(e) {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
        console.log("letter pressed");
    } else if (e.keyCode == 8) { // backspace
        console.log("backspace pressed");
    } else if (e.keyCode == 13) { // enter
        console.log("enter pressed");
    }
}