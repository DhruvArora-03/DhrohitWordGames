'use strict'

document.addEventListener("keydown", handleKeyPress);
button.addEventListener("click", initGame);

// universal consts
const ALPHABET = Array.from("ABCDEFGHIJKLNNOPQRSTUVWXYZ");
const VOWELS = Array.from("AEIOU");

const ctx = canvas.getContext("2d");
ctx.font = "30px Arial";

function initGame() {

}


// returns an array of arrays of 3 letters each
// currently for testing purposes
function get_words() {
    return [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l']]
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