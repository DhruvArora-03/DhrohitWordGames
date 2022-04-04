'use strict'

document.addEventListener("keydown", handleKeyPress);
resetButton.addEventListener("click", initGame);

// universal consts
const ALPHABET = Array.from("ABCDEFGHIJKLNNOPQRSTUVWXYZ");
const VOWELS = Array.from("AEIOU");

const ctx = canvas.getContext("2d");
ctx.font = "35px Arial";
ctx.textAlign = "center";
ctx.lineWidth = 6;

const BACKGROUND_COLOR = "#FAA6A4";

const BOARD_VALS = {
    x: 400,
    y: 100,
    width: 300,
    height: 300,
}

const LETTER_COORDS = [
    [ // top row
        {x: BOARD_VALS.x + (BOARD_VALS.width / 6), y: BOARD_VALS.y}, // left
        {x: BOARD_VALS.x + (BOARD_VALS.width / 2), y: BOARD_VALS.y}, // middle
        {x: BOARD_VALS.x + (BOARD_VALS.width / 6 * 5), y: BOARD_VALS.y} // right
    ],
    [ // right side
        {x: BOARD_VALS.x + BOARD_VALS.width, y: BOARD_VALS.y + (BOARD_VALS.height / 6)}, // top
        {x: BOARD_VALS.x + BOARD_VALS.width, y: BOARD_VALS.y + (BOARD_VALS.height / 2)}, // middle
        {x: BOARD_VALS.x + BOARD_VALS.width, y: BOARD_VALS.y + (BOARD_VALS.height / 6 * 5)} // bottom
    ],
    [ // bottom row
        {x: BOARD_VALS.x + (BOARD_VALS.width / 6 * 5), y: BOARD_VALS.y + BOARD_VALS.height}, // right
        {x: BOARD_VALS.x + (BOARD_VALS.width / 2), y: BOARD_VALS.y + BOARD_VALS.height}, // middle
        {x: BOARD_VALS.x + (BOARD_VALS.width / 6), y: BOARD_VALS.y + BOARD_VALS.height} // left
    ],
    [ // left side
        {x: BOARD_VALS.x, y: BOARD_VALS.y + (BOARD_VALS.height / 6 * 5)}, // bottom
        {x: BOARD_VALS.x, y: BOARD_VALS.y + (BOARD_VALS.height / 2)}, // middle
        {x: BOARD_VALS.x, y: BOARD_VALS.y + (BOARD_VALS.height / 6)} // top
    ]
];

const LETTER_OFFSETS = [
    {x: 0, y: -30}, // top row
    {x: 40, y: 10}, // right side
    {x: 0, y: 57}, // bottom row
    {x: -40, y: 10} // left side
]

const CIRCLE_RADIUS = 10;

const GUESS_LINE_LENGTH = ctx.measureText("LETTER").width; // default width of line

const GUESS_COORDS = {
    x: 198,
    y: 100
};

const PAST_GUESS_COORDS = {
    x: GUESS_COORDS.x,
    y: GUESS_COORDS.y + 70
}

// game vars
let guess;
let pastGuesses;
let letters; // size 4 array of size 3 arrays
let lettersUsed; // same dimensions as letters array - holds ints representing # of times used
let current;
let lines;

initGame(); 

function initGame() {
    // take away focus from button
    resetButton.blur();
    // clear anything from prev instance of game
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // reset game vars
    guess = "";
    pastGuesses = [];
    letters = generateLetters();
    lettersUsed = new Array(letters.length).fill(undefined).map(() => Array(letters[0].length).fill(0));
    current = {side: -1, index: -1};
    lines = [];

    redraw();

}


// returns an array of arrays of 3 letters each
// currently using static vals for testing purposes
function generateLetters() {
    return [
        ['S', 'A', 'D',], // top row
        ['H', 'F', 'M',], // right side
        ['U', 'I', 'C',], // bottom row
        ['P', 'R', 'L',]  // left side
    ];
}

function redraw() {
    // clear everything
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    redrawBoard();
    
    // draw guess and line under it
    ctx.fillStyle = ctx.strokeStyle = "black";
    ctx.fillText(guess, GUESS_COORDS.x, GUESS_COORDS.y);
    ctx.beginPath();
    var width = ctx.measureText(guess).width;
    width = width > GUESS_LINE_LENGTH ? width: GUESS_LINE_LENGTH; // allows for automatically resizing line
    ctx.moveTo(GUESS_COORDS.x - width / 2 - 20, GUESS_COORDS.y + 15);
    ctx.lineTo(GUESS_COORDS.x + width / 2 + 20, GUESS_COORDS.y + 15);
    ctx.stroke();

    // draw all old guesses
    for (let i = 0; i < pastGuesses.length; i++) {
        ctx.fillText(pastGuesses[i], PAST_GUESS_COORDS.x, PAST_GUESS_COORDS.y + (i * 30));
    }
}

function redrawBoard() {
    // draw the inside of the board (white part where the lines will be drawn)
    ctx.fillStyle = "white";
    ctx.fillRect(BOARD_VALS.x, BOARD_VALS.y, BOARD_VALS.width, BOARD_VALS.height);
    
    // draw the lines
    if (lines.length > 0) {
        ctx.strokeStyle = BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.moveTo(LETTER_COORDS[lines[0].start.side][lines[0].start.index].x, LETTER_COORDS[lines[0].start.side][lines[0].start.index].y);
        for (let i = 0; i < lines.length; i++) {
            ctx.lineTo(LETTER_COORDS[lines[i].end.side][lines[i].end.index].x, LETTER_COORDS[lines[i].end.side][lines[i].end.index].y);
        }
        ctx.stroke();
    }

    // draw the border rectange of the board
    ctx.strokeStyle = "black";
    ctx.strokeRect(BOARD_VALS.x, BOARD_VALS.y, BOARD_VALS.width, BOARD_VALS.height);
    
    // draw the letters and their circles
    for (let side = 0; side < letters.length; side++) {
        for (let i = 0; i < letters[side].length; i++) {
            ctx.fillStyle = lettersUsed[side][i] > 0 ? "black" : "white";
            ctx.fillText(letters[side][i], LETTER_COORDS[side][i].x + LETTER_OFFSETS[side].x, LETTER_COORDS[side][i].y + LETTER_OFFSETS[side].y);

            // draw path of circle
            ctx.beginPath();
            ctx.arc(LETTER_COORDS[side][i].x, LETTER_COORDS[side][i].y, CIRCLE_RADIUS, 0, 2 * Math.PI);

            // fill black if this spot is the last entered letter and pink if used
            if (current.side == side && current.index == i) {
                ctx.fillStyle = "black";
            } else if (lettersUsed[side][i] > 0) {
                ctx.fillStyle = BACKGROUND_COLOR;
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fill();
            ctx.stroke();
        }
    }
}

function handleKeyPress(e) {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
        console.log("letter pressed");

        handleLetter(e.keyCode);
    } else if (e.keyCode == 8) { // backspace
        console.log("backspace pressed");

        handleBackspace();
    } else if (e.keyCode == 13) { // enter
        console.log("enter pressed");

        handleEnter();
    }
}

function handleLetter(keyCode) {
    // check letter limit
    if (guess.length > 15) {
        return;
    }

    // check if letter pressed is exists, and if so act accordingly
    let letter = String.fromCharCode(keyCode);

    let location = indexOfLetter(letter);
    if (location.side >= 0 && location.side != current.side) {
        // update guess
        guess += letter;

        // add line to list
        if (current.side >= 0) {
            lines.push({ start: current, end: location});
        }

        current = location;
        lettersUsed[location.side][location.index]++;
        redraw();
    } else if (location.side < 0) {
        alert(`${letter} isn't a valid option!`);
    } else {
        alert(`Can't repeat letters from the same side!`);
    }
}

function handleBackspace() {
    if (guess.length < 1) {
        return;
    }

    lettersUsed[current.side][current.index]--;
    guess = guess.slice(0, -1);
    current = indexOfLetter(guess.slice(-1));
    lines.pop();
    redraw();
}

function indexOfLetter(letter) {
    // search through all letters
    for (let side = 0; side < letters.length; side++) {
        for (let i = 0; i < letters[side].length; i++) {
            if (letters[side][i] == letter) { // once letter is found, return
                return {side: side, index: i};
            }
        }
    }

    return {side: -1, index: -1};
}

function handleEnter() {
    // if guess is a real word:
    if (isWordInDictionary(guess)) {
        console.log(`Logging ${guess} as a guess`);
        pastGuesses.push(guess);
        guess = "";
        lines.add
        redraw();
    }
}