'use strict'

document.addEventListener("keydown", handleKeyPress);
button.addEventListener("click", initGame);




function initGame() {

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