`use strict`

document.addEventListener("keydown", handleKeyPress);

// universal consts
const ALPHABET = Array.from("ABCDEFGHIJKLNNOPQRSTUVWXYZ");
const VOWELS = Array.from("AEIOU");

const ctx = canvas.getContext("2d");
ctx.font = "30px Arial";

const TILE_CONSTS = {
    size: 50,
    color: "#E0E0E0",
    centerColor: "#FFD700",
    centerCoords: {
        x: 200,
        y: 250
    },
    locationOffsets: [
        { x: 0, y: 0 },
        { x: 0, y: -100 },
        { x: 87, y: -50 },
        { x: 87, y: 50 },
        { x: 0, y: 100 },
        { x: -87, y: -50 },
        { x: -87, y: 50 }
    ],
    letterOffsets: {
        x: 0,
        y: 10
    }
}

const GUESS_COORDS = {
    x: 200,
    y: 65
}

const MAX_GUESS_LENGTH = 20;

const SCORE_TEXT_COORDS = {
    score: {
        x: 430,
        y: 50
    },
    wordsFound: {
        x: 430,
        y: 80
    },
    wordList: {
        x: 450,
        y: 80
    }
}

// game vars
const letters = []; // index 0 is center letter, rest start at top and go around
const wordsFound = [];
let score;
let currentWord;

initGame();

function initGame() {
    letters.length = 0;
    wordsFound.length = 0;
    score = 0;
    currentWord = "";

    pickLetters(false);
    console.log(`Letters chosen: ${letters.join(', ')}`);

    drawBlankTiles();
    console.log("Blank tiles drawn");
    writeLettersOnTiles();
    console.log("Letters written on tiles");

    SCORE_TEXT_COORDS.wordList.y = SCORE_TEXT_COORDS.wordsFound.y;
    updateScore();
}

function handleKeyPress(e) {
    if (e.keyCode >= 65 && e.keyCode <= 90) {
        console.log("letter pressed");
        if (currentWord.length < MAX_GUESS_LENGTH) {
            const letter = String.fromCharCode(e.keyCode);

            if (letters.includes(letter)) {
                currentWord += letter;
                updateText();
            }
        }
    } else if (e.keyCode == 8) { // backspace
        console.log("backspace pressed");
        currentWord = currentWord.slice(0, -1);
        updateText();
    } else if (e.keyCode == 13) { // enter
        console.log("enter pressed");
        if (currentWord.length < 3) {
            alert(`${currentWord} is only ${currentWord.length} characters long, it must be at least 3 characters long`);
        } else if (!currentWord.includes(letters[0])) {
            alert(`${currentWord} doesn't use ${letters[0]}`);
        } else {
            // var newApi = new XMLHttpRequest();
            // newApi.open('GET', 'http://www.angramica.com/lookup/' + currentWord.toLowerCase(), false);
            
            var request = new XMLHttpRequest();

            request.open('GET', 'https://dictionaryapi.com/api/v3/references/collegiate/json/' + currentWord.toLowerCase() + '?key=ca6d5bad-825b-4d20-824c-3441f01a52ec', true)
            request.onload = function () {
                // Begin accessing JSON data here
                var data = JSON.parse(this.response) // returns arr of strings if invalid, objs otherwise
                console.log(typeof data[0])
                if(typeof data[0] != "string" && currentWord.length > 2 && currentWord.includes(letters[0])) {
                    handleEnter();
                }
                else{
                    alert(`${currentWord} doesn't exist in the dictionary!`);
                }
            }
            request.send()
        }
    }
}

function updateText() {
    clearGuessText();
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(currentWord, GUESS_COORDS.x, GUESS_COORDS.y);
}

function clearGuessText() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 420, 100);
}

function handleEnter() {
    wordsFound.push(currentWord);
    score += currentWord.length * 100;
    updateScore();
    updateText();
    currentWord = "";
    clearGuessText();
}


function updateScore() {
    clearScoreText();
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, SCORE_TEXT_COORDS.score.x, SCORE_TEXT_COORDS.score.y);
    ctx.fillText(`Words Found: ${wordsFound.length}`, SCORE_TEXT_COORDS.wordsFound.x, SCORE_TEXT_COORDS.wordsFound.y);
    ctx.fillText(`${currentWord}`, SCORE_TEXT_COORDS.wordList.x, SCORE_TEXT_COORDS.wordList.y);
    SCORE_TEXT_COORDS.wordList.y += 30;
}

function clearScoreText() {
    ctx.fillStyle = "white";
    ctx.fillRect(SCORE_TEXT_COORDS.score.x, 0, canvas.width - SCORE_TEXT_COORDS.score.x, 80);
}

function pickLetters(debuggging_print_letters) {
    let vowelCount = 0;
    for (let i = 0; i < 7; i++) {
        do {
            letters[i] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        } while (letters.slice(0, i).includes(letters[i]));
        if (debuggging_print_letters) {
            console.log(`Picked letter ${i} to be ${letters[i]}`);
        }

        if (VOWELS.includes(letters[i])) {
            vowelCount++;
            if (debuggging_print_letters) {
                console.log(`${letters[i]} is a vowel, vowel count is now ${vowelCount}`);
            }
        }
    }

    if (vowelCount < 2 || vowelCount > 2) {
        if (debuggging_print_letters) {
            console.log(`Only had ${vowelCount} vowel(s), running pick_letters() again`);
        }
        pickLetters(debuggging_print_letters);
    }
}

function drawBlankTiles() {
    for (let i = 0; i < TILE_CONSTS.locationOffsets.length; i++) {
        drawTile(TILE_CONSTS.locationOffsets[i], i == 0 ? TILE_CONSTS.centerColor : TILE_CONSTS.color);
    }
}

// x and y point to center
function drawTile(offset, color) {
    let hexagon = new Path2D();
    hexagon.moveTo(TILE_CONSTS.centerCoords.x + offset.x + TILE_CONSTS.size * Math.cos(0), TILE_CONSTS.centerCoords.y + offset.y + TILE_CONSTS.size * Math.sin(0));
    ctx.fillStyle = color;

    for (var i = 1; i <= 6; i++) {
        hexagon.lineTo(TILE_CONSTS.centerCoords.x + offset.x + TILE_CONSTS.size * Math.cos(i * 2 * Math.PI / 6), TILE_CONSTS.centerCoords.y + offset.y + TILE_CONSTS.size * Math.sin(i * 2 * Math.PI / 6));
    }

    ctx.fill(hexagon, "nonzero");
}

function writeLettersOnTiles() {
    for (let i = 0; i < TILE_CONSTS.locationOffsets.length; i++) {
        writeOnTile(TILE_CONSTS.locationOffsets[i], letters[i]);
    }
}

function writeOnTile(offset, letter) {
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(letter, TILE_CONSTS.centerCoords.x + offset.x + TILE_CONSTS.letterOffsets.x, TILE_CONSTS.centerCoords.y + offset.y + TILE_CONSTS.letterOffsets.y);
}

