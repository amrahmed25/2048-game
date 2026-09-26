const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Supabase-backed game session state
var currentUser = null;      // the authenticated auth.users row
var currentGameId = null;    // public.games.id for this session (null if not saved)
var movesCount = 0;
var gameStartedAt = null;
var gameEnded = false;       // guards against finalizing the same game twice

window.onload = function() {
    initGame();
}

// Resolves the authenticated user, then either resumes an existing game
// (?gameId=... in the URL, as linked from the dashboard) or starts a new one.
async function initGame() {
    const { data: authData, error: authError } = await db.auth.getUser();
    if (authError || !authData?.user) {
        // No session — send back to login, same as the dashboard does.
        location.href = 'index.html';
        return;
    }
    currentUser = authData.user;

    const params = new URLSearchParams(location.search);
    const gameId = params.get('gameId');

    if (gameId) {
        await resumeGame(gameId);
    } else {
        await startNewGame();
    }
}

// Loads a game the user was already playing. Falls back to a fresh game
// if the id doesn't exist, isn't theirs, or was already finished.
async function resumeGame(gameId) {
    const { data: existingGame, error } = await db
        .from('games')
        .select('*')
        .eq('id', gameId)
        .eq('user_id', currentUser.id) // never trust the id alone — scope to this user
        .eq('status', 'playing')
        .maybeSingle();

    if (error || !existingGame) {
        await startNewGame();
        return;
    }

    currentGameId = existingGame.id;
    score = existingGame.score || 0;
    movesCount = existingGame.moves_count || 0;
    gameStartedAt = existingGame.started_at ? new Date(existingGame.started_at) : new Date();
    gameEnded = false;
    setGame(existingGame.board);
}

// Builds a fresh local board and creates the matching row in public.games.
async function startNewGame() {
    gameStartedAt = new Date();
    movesCount = 0;
    gameEnded = false;
    currentGameId = null;
    setGame(); // builds a random starting board locally, score = 0

    const { data: newGame, error } = await db
        .from('games')
        .insert({
            user_id: currentUser.id,
            score: 0,
            board: board,
            status: 'playing',
            moves_count: 0,
            highest_tile: highestTileOnBoard(board),
            started_at: gameStartedAt.toISOString(),
        })
        .select()
        .single();

    if (error) {
        // Game is still playable locally; it just won't be saved/resumable.
        console.error('Could not create a new game:', error.message);
        return;
    }
    currentGameId = newGame.id;
}

// Renders the board. Pass an existing board (from a resumed game) to load it
// as-is; call with no argument to start a blank board with two random tiles.
function setGame(loadedBoard) {
    if (loadedBoard) {
        board = loadedBoard;
    } else {
        board = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        score = 0;
    }

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

    if (!loadedBoard) {
        setTwo();
        setTwo();
    }
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


async function endGame() {
    isPaused = false;
    let menu = document.getElementById("pause-menu");
    if (menu) menu.style.display = "none";

    if (!gameEnded) {
        gameEnded = true;
        await finalizeGame('abandoned', 'quit');
    }

    // Displays final score popup to user
    alert("Game ended. Your Final Score is: " + score);
    // Starts a fresh, saved game
    await startNewGame();
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
    let scoreBefore = score;
    let direction = null;

if(e.code == 'ArrowLeft') { slideLeft(); direction = 'left'; }

if(e.code == 'ArrowRight') { slideRight(); direction = 'right'; }

if(e.code == 'ArrowUp') { slideUp(); direction = 'up'; }

if(e.code == 'ArrowDown') { slideDown(); direction = 'down'; }
if (direction && !boardsAreEqual(prevBoard, board)) {
        setTwo();
        let scoreElem = document.getElementById("score");
        if (scoreElem) scoreElem.innerText = score;
        recordMove(direction, scoreBefore);
        checkGameOutcome();
    }
})


function handleSwipeEnd() {
    let diffX = endX - startX;
    let diffY = endY - startY;

    let minDistance = 30;
    let prevBoard = JSON.parse(JSON.stringify(board));
    let scoreBefore = score;
    let direction = null;

    if (Math.abs(diffX) > Math.abs(diffY)) { //Horizontal Movement
        if (Math.abs(diffX) > minDistance) {
            if (diffX > 0) {
                slideRight();
                direction = 'right';
            } else {
                slideLeft();
                direction = 'left';
            }
        }
    } else {
        // Vertical movement
        if (Math.abs(diffY) > minDistance) {
            if (diffY > 0) {
                slideDown();
                direction = 'down';
            } else {
                slideUp();
                direction = 'up';
            }
            
        }
    }
    if (direction && !boardsAreEqual(prevBoard, board)) {
        setTwo();
        let scoreElem = document.getElementById("score");
        if (scoreElem) scoreElem.innerText = score;
        recordMove(direction, scoreBefore);
        checkGameOutcome();
    }
}

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
    handleSwipeEnd();
});

// Touch support (mobile swipe) — mirrors the mouse drag logic above.
document.addEventListener('touchstart', (e) => {
    if (isPaused) return;
    isMouseDown = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (isPaused || !isMouseDown) return;
    // Prevent the page from scrolling while swiping on the board
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (isPaused || !isMouseDown) return;
    isMouseDown = false;
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    handleSwipeEnd();
}, { passive: true });

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

function hasTile(target) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] >= target) return true;
        }
    }
    return false;
}

function highestTileOnBoard(b) {
    let max = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (b[r][c] > max) max = b[r][c];
        }
    }
    return max;
}

// Checks for a win (reached 2048) or a loss (no moves left) and finalizes
// the game in Supabase accordingly, then starts a fresh saved game.
function checkGameOutcome() {
    if (gameEnded) return;

    if (hasTile(2048)) {
        gameEnded = true;
        setTimeout(async () => {
            alert("You reached 2048! Final Score: " + score);
            await finalizeGame('completed', 'won');
            await startNewGame();
        }, 100);
        return;
    }

    if (!hasEmptyTile() && !hasTileMatch()) {
        gameEnded = true;
        setTimeout(async () => {
            alert("Game Over! No available moves left. Final Score: " + score);
            await finalizeGame('completed', 'lost');
            await startNewGame();
        }, 100);
    }
}

// Logs one move to game_moves and keeps the games row in sync, so the
// dashboard's "Current Game" preview always reflects the latest state.
async function recordMove(direction, scoreBefore) {
    movesCount++;
    if (!currentUser || !currentGameId) return; // nothing to sync (e.g. game row failed to create)

    const { error: moveError } = await db.from('game_moves').insert({
        game_id: currentGameId,
        user_id: currentUser.id,
        direction,
        score_before: scoreBefore,
        score_after: score,
        board_after: board,
    });
    if (moveError) console.error('Could not log move:', moveError.message);

    const { error: updateError } = await db
        .from('games')
        .update({
            score,
            board,
            moves_count: movesCount,
            highest_tile: highestTileOnBoard(board),
        })
        .eq('id', currentGameId)
        .eq('user_id', currentUser.id);
    if (updateError) console.error('Could not update game state:', updateError.message);
}

// Marks the current game row as finished (won/lost/quit) with its duration.
// Triggers on the games table are assumed to roll this into player_stats.
async function finalizeGame(status, result) {
    if (!currentUser || !currentGameId) return;

    const endedAt = new Date();
    const durationSeconds = gameStartedAt
        ? Math.round((endedAt - gameStartedAt) / 1000)
        : null;

    const { error } = await db
        .from('games')
        .update({
            status,
            result,
            score,
            board,
            moves_count: movesCount,
            highest_tile: highestTileOnBoard(board),
            duration_seconds: durationSeconds,
            ended_at: endedAt.toISOString(),
        })
        .eq('id', currentGameId)
        .eq('user_id', currentUser.id);

    if (error) console.error('Could not finalize game:', error.message);
    currentGameId = null;
}