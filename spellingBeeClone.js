`use strict`

document.addEventListener("keydown", handleKeyPress);
resetButton.addEventListener("click", initGame);

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

const MAX_GUESS_LENGTH = 7;
const POSSIBLE_WORD_THRESHOLD = 15;
const FAIL_THRESHOLD = 20000;

const SCORE_TEXT_COORDS = {
    score: {
        x: 430,
        y: 50
    },
    numWordsFound: {
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
let possibleWordCount;
const wordsFound = [];
let score;
let currentWord;

// start game
initGame();

function initGame() {
    // take away focus from button
    resetButton.blur();

    letters.length = 0;
    currentWord = "";

    pickLetters();
    console.log(`Letters chosen: ${letters.join(', ')}`);

    drawBlankTiles();
    console.log("Blank tiles drawn");
    writeLettersOnTiles();
    console.log("Letters written on tiles");

    resetWordsFound();
}

function resetWordsFound() {
    wordsFound.length = 0;
    score = 0;

    SCORE_TEXT_COORDS.wordList.y = SCORE_TEXT_COORDS.numWordsFound.y;
    updateScore();
    
    // erase words found
    ctx.fillStyle = "white";
    ctx.fillRect(SCORE_TEXT_COORDS.wordList.x, SCORE_TEXT_COORDS.wordList.y, canvas.width - SCORE_TEXT_COORDS.wordList.x, canvas.height - SCORE_TEXT_COORDS.wordList.y);
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
        } else if (wordsFound.includes(currentWord)) {
            alert(`${currentWord} has already been found!`);
        } else {
            console.log(`using dictionary.js, is word valid: ${isWordInDictionary(currentWord)}`);

            if(isWordInDictionary(currentWord) && currentWord.length > 2 && currentWord.includes(letters[0])) {
                handleEnter();
            } else {
                alert(`${currentWord} doesn't exist in the dictionary!`);
            }
        }
        
        currentWord = "";
        updateText();
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
    currentWord = "";
    updateText();
}

function updateScore() {
    clearScoreText();
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, SCORE_TEXT_COORDS.score.x, SCORE_TEXT_COORDS.score.y);
    ctx.fillText(`Words Found: ${wordsFound.length}`, SCORE_TEXT_COORDS.numWordsFound.x, SCORE_TEXT_COORDS.numWordsFound.y);
    ctx.fillText(`${currentWord}`, SCORE_TEXT_COORDS.wordList.x, SCORE_TEXT_COORDS.wordList.y);
    SCORE_TEXT_COORDS.wordList.y += 30;
}

function clearScoreText() {
    ctx.fillStyle = "white";
    ctx.fillRect(SCORE_TEXT_COORDS.score.x, 0, canvas.width - SCORE_TEXT_COORDS.score.x, 80);
}

function pickLetters() {
    let vowelCount = 0;
    for (let i = 0; i < 7; i++) {
        do {
            letters[i] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
        } while (letters.slice(0, i).includes(letters[i]));

        if (VOWELS.includes(letters[i])) {
            vowelCount++;
        }
    }

    if (vowelCount < 2 || vowelCount > 3) {
        console.log(`vowel count is ${vowelCount}, trying again`);
        pickLetters();
    } else {
        console.log(`running numWordsPossible with, letters: ${letters}`);
        possibleWordCount = 0;
        numWordsPossibleBFS();
        console.log(`${possibleWordCount} possible words`);
        if (possibleWordCount < POSSIBLE_WORD_THRESHOLD) {
            console.log("fuckywucky, trying again")
            pickLetters();
        }
    }
}

function numWordsPossibleDFS() {
    numPossibleDFS("");
}

function numPossibleDFS(wordSoFar) {
    if (possibleWordCount >= POSSIBLE_WORD_THRESHOLD || (wordSoFar.length > 3 && (wordSoFar[-1] == wordSoFar[-2] == wordSoFar[-3] || !VOWELS.some(vowel => wordSoFar.includes(vowel))))) {
        return;
    }
    
    // check current word so far
    if (wordSoFar.length > 2 && wordSoFar.includes(letters[0]) && isWordInDictionary(wordSoFar)) {
        possibleWordCount++;
        console.log(`word found: ${wordSoFar}, num words found so far: ${possibleWordCount}`);
    }

    // check all recurrisve possibilities
    if (wordSoFar.length < MAX_GUESS_LENGTH) {
        for (let i = 0; i < letters.length && possibleWordCount < POSSIBLE_WORD_THRESHOLD; i++) {
            numPossibleDFS(wordSoFar + letters[i]);
        }
    }
}

function numWordsPossibleBFS() {
    let queue = [""];
    let numFails = 0;

    do {
        var word = queue.shift();
        
        // check word
        if (word.length > 3 && word.includes(letters[0]) && isWordInDictionary(word)) {
            possibleWordCount++;
            console.log(`word found: ${word}, num words found so far: ${possibleWordCount}, tries taken: ${numFails}`);
        } else {
            numFails++;

            if (numFails % 1000 == 0) {
                console.log(`Now at ${numFails} tries`);
            }
        }

        // if (word.length > 3 &&
        //     (word[-1] == word[-2] == word[-3] ||
        //         !VOWELS.some(vowel => word.includes(vowel)))) {
        //     continue;
        // }

        // add possibilities to queue
        for (let i = 0; i < letters.length; i++) {
            queue.push(word + letters[i]);
        }

    } while(numFails < FAIL_THRESHOLD && possibleWordCount < POSSIBLE_WORD_THRESHOLD && queue.length > 0);
}

function drawBlankTiles() {
    for (let i = 0; i < TILE_CONSTS.locationOffsets.length; i++) {
        drawTile(TILE_CONSTS.locationOffsets[i], i == 0 ? TILE_CONSTS.centerColor : TILE_CONSTS.color);
    }
}

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

