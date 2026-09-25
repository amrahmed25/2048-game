var board
var score = 0
var rows = 4
var columns = 4


var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;
var isMouseDown = false;
var isPaused = false;

window.onload = function() {
    setGame();
}
function setGame() {
    //   board = [
    //     [2, 2, 2, 2],
    //     [2, 2, 2, 2],
    //     [4, 4, 8, 8],
    //     [4, 4, 8, 8]
    //  ]; // a test for the board

board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
score = 0;
let boardElement = document.getElementById("board");
if (boardElement) boardElement.innerHTML = "";

for(let r = 0; r<rows; r++) {
    for(let c = 0; c < columns; c++) { // filling out the squares in the 2048 grid
        let tile = document.createElement("div")
        tile.id = r.toString() + "-" + c.toString();
        let num = board[r][c];
        updateTile(tile,num);
        document.getElementById("board").append(tile)
    }
}
setTwo();
setTwo();
let scoreElem = document.getElementById("score");
if (scoreElem) scoreElem.innerText = score;
}
function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList = "";
    tile.classList.add("tile")
    if(num > 0) {
        tile.innerText = num;
        if(num <= 4096) tile.classList.add("x"+num.toString())
            else tile.classList.add("x8192")
    }
}

function pauseGame() {
    isPaused = true;
    let menu = document.getElementById("pause-menu");
    if (menu) menu.style.display = "flex";
}


function continueGame() {
    isPaused = false;
    let menu = document.getElementById("pause-menu");
    if (menu) menu.style.display = "none";
}


function endGame() {
    isPaused = false;
    let menu = document.getElementById("pause-menu");
    if (menu) menu.style.display = "none";
    // Displays final score popup to user
    alert("Game Over! Your Final Score is: " + score);
    // Resets the board for a fresh game
    setGame();
}

function boardsAreEqual(boardA, boardB) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (boardA[r][c] !== boardB[r][c]) {
                return false;
            }
        }
    }
    return true;
}



document.addEventListener('keyup', (e) => {

    if (isPaused) return;
    let prevBoard = JSON.parse(JSON.stringify(board));

if(e.code == 'ArrowLeft') slideLeft();

if(e.code == 'ArrowRight') slideRight();

if(e.code == 'ArrowUp') slideUp();

if(e.code == 'ArrowDown') slideDown();
if (!boardsAreEqual(prevBoard, board)) {
        setTwo();
        let scoreElem = document.getElementById("score");
        if (scoreElem) scoreElem.innerText = score;
        checkGameOver();
    }
})


document.addEventListener('mousedown', (e) => {
    if(isPaused) return;
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
});

document.addEventListener('mouseup', (e) => {
    if (isPaused || !isMouseDown) return;
    isMouseDown = false;

    endX = e.clientX;
    endY = e.clientY;

    let diffX = endX - startX;
    let diffY = endY - startY;

    
    let minDistance = 30;
    let prevBoard = JSON.parse(JSON.stringify(board));

    if (Math.abs(diffX) > Math.abs(diffY)) { //Horizontal Movement
        if (Math.abs(diffX) > minDistance) {
            if (diffX > 0) {
                slideRight();
            } else {
                slideLeft();
            }
        }
    } else {
        // Vertical movement
        if (Math.abs(diffY) > minDistance) {
            if (diffY > 0) {
                slideDown();
            } else {
                slideUp();
            }
            
        }
    }
    if (!boardsAreEqual(prevBoard, board)) {
        setTwo();
        let scoreElem = document.getElementById("score");
        if (scoreElem) scoreElem.innerText = score;
        checkGameOver();
    }
});

function filterZero(row) {
    return row.filter(num => num != 0) // creates a different array that removes the zero and the number will replace the position of that zero
}
function slide(row) {
row = filterZero(row)
// sliding process
 for(let i = 0; i < row.length-1; i++) {
            if (row[i] == row[i+1]) {
            row[i] *= 2; //merging the squares together
            row[i+1] = 0;
            score += row[i]; //updating the score
            i++; // skip next merged tile
        }
        } // [2,2,2,0] => [4,0,2,0 (ignore this)]
        row = filterZero(row)
    //add zeros back
    while (row.length < columns) row.push(0);
    //[4, 2, 0, 0]
    return row;
       
}
function slideLeft() {
    for(let r = 0; r < rows; r++) {
        let row = board[r].slice();
        row = slide(row);
        board[r] = row
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}
function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r].slice().reverse(); //[0, 2, 2, 2] -> //[2, 2, 2, 0]
        row = slide(row)  //[4, 2, 0, 0]                     
        board[r] = row.reverse();   //[0, 0, 2, 4];
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = row.reverse(); 
        row = slide(row);
        row.reverse();
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function setTwo() {
    if (!hasEmptyTile()) return;
    
    let found = false;
    while (!found) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            // Standard rule: 90% chance for 2, 10% chance for 4
            let value = Math.random() < 0.9 ? 2 : 4;
            board[r][c] = value;
            
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            // Safe CSS application: delegates styling to updateTile
            updateTile(tile, value);
            found = true;
        }
    }
}

function hasEmptyTile() {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { //at least one zero in the board
                return true;
            }
        }
    }
    return false;
}

function hasTileMatch() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (c < columns - 1 && board[r][c] === board[r][c + 1]) {
                return true;
            }
            if (r < rows - 1 && board[r][c] === board[r + 1][c]) {
                return true;
            }
        }
    }
    return false;
}

function checkGameOver() {
    if (!hasEmptyTile() && !hasTileMatch()) {
        setTimeout(() => {
            alert("Game Over! No available moves left. Final Score: " + score);
            setGame();
        }, 100);
    }
}