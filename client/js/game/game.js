const roomCode =
    sessionStorage.getItem("roomCode");

const playerId =
    localStorage.getItem("playerId");

const username =
    sessionStorage.getItem("username");


/* =========================================
   AUTH / ROOM CHECK
========================================= */

if (!roomCode || !playerId) {

    window.location.href =
        "index.html";
}


/* =========================================
   DOM
========================================= */

const roundNumber =
    document.getElementById(
        "roundNumber"
    );

const turnMessage =
    document.getElementById(
        "turnMessage"
    );

const gameBoard =
    document.getElementById(
        "gameBoard"
    );

const gameMessage =
    document.getElementById(
        "gameMessage"
    );

const nextRoundBtn =
    document.getElementById(
        "nextRoundBtn"
    );

const leaveGameBtn =
    document.getElementById(
        "leaveGameBtn"
    );


const playerOneCard =
    document.getElementById(
        "playerOneCard"
    );

const playerTwoCard =
    document.getElementById(
        "playerTwoCard"
    );


const playerOneAvatar =
    document.getElementById(
        "playerOneAvatar"
    );

const playerTwoAvatar =
    document.getElementById(
        "playerTwoAvatar"
    );


const playerOneName =
    document.getElementById(
        "playerOneName"
    );

const playerTwoName =
    document.getElementById(
        "playerTwoName"
    );


const playerOneSymbol =
    document.getElementById(
        "playerOneSymbol"
    );

const playerTwoSymbol =
    document.getElementById(
        "playerTwoSymbol"
    );


const playerOneScore =
    document.getElementById(
        "playerOneScore"
    );

const playerTwoScore =
    document.getElementById(
        "playerTwoScore"
    );


const resultOverlay =
    document.getElementById(
        "resultOverlay"
    );

const resultIcon =
    document.getElementById(
        "resultIcon"
    );

const resultTitle =
    document.getElementById(
        "resultTitle"
    );

const resultMessage =
    document.getElementById(
        "resultMessage"
    );

const resultAction =
    document.getElementById(
        "resultAction"
    );


/* =========================================
   SYMBOL MAP
========================================= */

const SYMBOLS = {

    cross: "✕",

    circle: "○",

    star: "★",

    heart: "♥",

    fire: "🔥",

    lightning: "⚡",

    crown: "♛",

    diamond: "◆"

};


/* =========================================
   AVATAR MAP
========================================= */

const AVATARS = {

    "avatar-1": "🧑",

    "avatar-2": "👨‍💻",

    "avatar-3": "🧑‍🚀",

    "avatar-4": "🥷",

    "avatar-5": "🦸",

    "avatar-6": "🤖"

};


/* =========================================
   COLORS
========================================= */

const COLORS = {

    red: "#ff4d5e",

    blue: "#4d8dff",

    green: "#48d597",

    yellow: "#ffd34d",

    purple: "#a56cff",

    orange: "#ff873d"

};


/* =========================================
   STATE
========================================= */

let gameState = null;

let players = [];

let currentPlayer = null;

let matchFinished = false;

let resultShowing = false;


/* =========================================
   INITIAL STATE
========================================= */

const savedState =
    sessionStorage.getItem(
        "gameState"
    );


if (savedState) {

    try {

        const state =
            JSON.parse(savedState);

        applyState(state);

    } catch (error) {

        console.error(
            "Saved game state error:",
            error
        );
    }
}


/* =========================================
   SOCKET CONNECTION
========================================= */

socket.on(
    "connect",
    () => {

        console.log(
            "Game socket connected:",
            socket.id
        );

    }
);


/* =========================================
   GAME STARTED
========================================= */

socket.on(
    "game-started",
    state => {

        console.log(
            "Game started:",
            state
        );


        hideResultOverlay();

        applyState(state);
    }
);


/* =========================================
   GAME STATE
========================================= */

socket.on(
    "game-state",
    state => {

        console.log(
            "Game state:",
            state
        );


        applyState(state);
    }
);


/* =========================================
   ROUND STARTED
========================================= */

socket.on(
    "round-started",
    state => {

        console.log(
            "Round started:",
            state
        );


        hideResultOverlay();

        gameMessage.textContent = "";

        nextRoundBtn.style.display =
            "none";


        applyState(state);
    }
);


/* =========================================
   ROUND REWARD
========================================= */

socket.on(
    "round-reward",
    reward => {

        handleReward(
            reward
        );
    }
);


/* =========================================
   MATCH COMPLETED
========================================= */

socket.on(
    "match-completed",
    data => {

        console.log(
            "Match completed:",
            data
        );


        matchFinished = true;


        applyMatchResult(
            data
        );
    }
);


/* =========================================
   GAME ERROR
========================================= */

socket.on(
    "game-error",
    data => {

        console.error(
            "Game error:",
            data
        );


        showGameMessage(
            data.message ||
            "Something went wrong."
        );
    }
);


/* =========================================
   PLAYER LEFT
========================================= */

socket.on(
    "player-left",
    data => {

        console.log(
            "Player left:",
            data
        );


        matchFinished = true;


        showGameMessage(
            `${data.username || "The other player"} left the game.`
        );


        disableBoard();


        setTimeout(
            () => {

                window.location.href =
                    "lobby.html";

            },
            2200
        );
    }
);


/* =========================================
   APPLY STATE
========================================= */

function applyState(state) {

    if (!state) {
        return;
    }


    gameState =
        state;


    players =
        state.players || [];


    /*
     * Save latest state.
     */

    sessionStorage.setItem(
        "gameState",
        JSON.stringify(state)
    );


    /*
     * Find current browser player.
     */

    currentPlayer =
        players.find(
            player =>
                player.playerId ===
                playerId
        );


    /*
     * Apply player's personal theme.
     */

    applyPersonalTheme();


    /*
     * Render UI.
     */

    renderPlayers();

    renderRound();

    renderBoard();

    renderTurn();


    /*
     * Round result.
     */

    if (
        state.game?.roundFinished
    ) {

        disableBoard();

        showRoundResult(
            state
        );

    } else {

        hideResultOverlay();
    }


    /*
     * Match result.
     */

    if (
        state.game?.matchFinished
    ) {

        matchFinished = true;

        disableBoard();

    }
}


/* =========================================
   PERSONAL THEME
========================================= */

function applyPersonalTheme() {

    const theme =
        currentPlayer?.selectedTheme ||
        "default";


    document.body.className =
        `theme-${theme}`;
}


/* =========================================
   PLAYERS
========================================= */

function renderPlayers() {

    if (players.length < 2) {
        return;
    }


    const playerOne =
        players[0];

    const playerTwo =
        players[1];


    renderPlayer(
        playerOne,
        {
            card: playerOneCard,
            avatar: playerOneAvatar,
            name: playerOneName,
            symbol: playerOneSymbol
        }
    );


    renderPlayer(
        playerTwo,
        {
            card: playerTwoCard,
            avatar: playerTwoAvatar,
            name: playerTwoName,
            symbol: playerTwoSymbol
        }
    );


    /*
     * Score
     */

    const scores =
        gameState?.game?.scores || {};


    playerOneScore.textContent =
        scores[playerOne.id] || 0;


    playerTwoScore.textContent =
        scores[playerTwo.id] || 0;
}


/* =========================================
   RENDER PLAYER
========================================= */

function renderPlayer(
    player,
    elements
) {

    elements.name.textContent =
        player.username ||
        "Player";


    elements.avatar.textContent =
        AVATARS[player.avatar] ||
        "🧑";


    const symbol =
        SYMBOLS[
            player.selectedSymbol
        ] ||
        "✕";


    elements.symbol.textContent =
        symbol;


    /*
     * Selected player color.
     */

    let color =
        COLORS[
            player.selectedColor
        ] ||
        COLORS.red;


    /*
     * If both players use same color,
     * automatically make Player 2 blue.
     */

    if (
        players.length === 2 &&
        players[0].selectedColor ===
        players[1].selectedColor
    ) {

        if (
            player.id ===
            players[1].id
        ) {

            color =
                COLORS.blue;
        }
    }


    elements.symbol.style.color =
        color;


    /*
     * Highlight current browser player.
     */

    elements.card.classList.toggle(
        "current-player",
        player.playerId === playerId
    );
}


/* =========================================
   ROUND
========================================= */

function renderRound() {

    const round =
        gameState?.game?.currentRound ||
        1;


    roundNumber.textContent =
        `Round ${round}`;
}


/* =========================================
   BOARD
========================================= */

function renderBoard() {

    if (!gameBoard) {
        return;
    }


    gameBoard.innerHTML = "";


    const board =
        gameState?.game?.board ||
        Array(9).fill(null);


    board.forEach(
        (cell, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "game-cell";


            button.dataset.index =
                index;


            if (cell) {

                renderCell(
                    button,
                    cell
                );

            } else {

                button.addEventListener(
                    "click",
                    () => {

                        makeMove(index);

                    }
                );
            }


            gameBoard.appendChild(
                button
            );
        }
    );


    /*
     * Disable board if it is not
     * this player's turn.
     */

    if (
        gameState?.game?.currentTurn !==
        socket.id
    ) {

        disableBoard();
    }
}


/* =========================================
   CELL
========================================= */

function renderCell(
    cellElement,
    playerIdFromMove
) {

    const player =
        players.find(
            player =>
                player.id ===
                playerIdFromMove
        );


    if (!player) {
        return;
    }


    const symbol =
        SYMBOLS[
            player.selectedSymbol
        ] ||
        "✕";


    cellElement.textContent =
        symbol;


    let color =
        COLORS[
            player.selectedColor
        ] ||
        COLORS.red;


    /*
     * Same symbol + same color:
     * Player 2 becomes blue.
     */

    if (
        players.length === 2 &&
        players[0].selectedColor ===
        players[1].selectedColor
    ) {

        if (
            player.id ===
            players[1].id
        ) {

            color =
                COLORS.blue;
        }
    }


    cellElement.style.color =
        color;


    cellElement.classList.add(
        "filled"
    );


    cellElement.disabled =
        true;
}


/* =========================================
   TURN
========================================= */

function renderTurn() {

    if (!turnMessage) {
        return;
    }


    if (
        gameState?.game?.roundFinished
    ) {

        turnMessage.textContent =
            "Round Finished";

        return;
    }


    if (
        gameState?.game?.matchFinished
    ) {

        turnMessage.textContent =
            "Match Finished";

        return;
    }


    const turnId =
        gameState?.game?.currentTurn;


    const turnPlayer =
        players.find(
            player =>
                player.id ===
                turnId
        );


    if (!turnPlayer) {

        turnMessage.textContent =
            "Waiting...";

        return;
    }


    if (
        turnId === socket.id
    ) {

        turnMessage.textContent =
            "Your Turn";

        turnMessage.classList.add(
            "your-turn"
        );

    } else {

        turnMessage.textContent =
            `${turnPlayer.username}'s Turn`;

        turnMessage.classList.remove(
            "your-turn"
        );
    }
}


/* =========================================
   MAKE MOVE
========================================= */

function makeMove(
    cellIndex
) {

    if (!gameState) {
        return;
    }


    if (
        gameState.game.roundFinished
    ) {
        return;
    }


    if (
        gameState.game.matchFinished
    ) {
        return;
    }


    if (
        gameState.game.currentTurn !==
        socket.id
    ) {

        showGameMessage(
            "It is not your turn."
        );

        return;
    }


    socket.emit(
        "make-move",
        {
            roomCode,
            cellIndex
        }
    );
}


/* =========================================
   DISABLE BOARD
========================================= */

function disableBoard() {

    const cells =
        document.querySelectorAll(
            ".game-cell"
        );


    cells.forEach(
        cell => {

            if (!cell.classList.contains(
                "filled"
            )) {

                cell.disabled = true;
            }
        }
    );
}


/* =========================================
   ROUND RESULT
========================================= */

function showRoundResult(
    state
) {

    if (resultShowing) {
        return;
    }


    const roundWinner =
        state.game.roundWinner;


    if (!roundWinner) {

        /*
         * Draw
         */

        showResultOverlay(
            "🤝",
            "Round Draw",
            "No points gained or lost.",
            false
        );


        return;
    }


    const isMe =
        roundWinner ===
        socket.id;


    if (isMe) {

        showResultOverlay(
            "🏆",
            "Round Won!",
            "You earned +15 points.",
            !state.game.matchFinished
        );

    } else {

        const winner =
            players.find(
                player =>
                    player.id ===
                    roundWinner
            );


        showResultOverlay(
            "😔",
            "Round Lost",
            `${winner?.username || "Opponent"} won this round.`,
            !state.game.matchFinished
        );
    }
}


/* =========================================
   RESULT OVERLAY
========================================= */

function showResultOverlay(
    icon,
    title,
    message,
    showNextButton
) {

    if (!resultOverlay) {
        return;
    }


    resultShowing =
        true;


    resultIcon.textContent =
        icon;


    resultTitle.textContent =
        title;


    resultMessage.textContent =
        message;


    if (showNextButton) {

        resultAction.style.display =
            "block";

        resultAction.textContent =
            "Next Round";

    } else {

        resultAction.style.display =
            "none";
    }


    resultOverlay.classList.add(
        "show"
    );
}


/* =========================================
   HIDE RESULT
========================================= */

function hideResultOverlay() {

    resultShowing =
        false;


    if (!resultOverlay) {
        return;
    }


    resultOverlay.classList.remove(
        "show"
    );
}


/* =========================================
   NEXT ROUND
========================================= */

if (resultAction) {

    resultAction.addEventListener(
        "click",
        () => {

            if (
                gameState?.game
                    ?.matchFinished
            ) {
                return;
            }


            resultAction.disabled =
                true;


            resultAction.textContent =
                "Starting...";


            socket.emit(
                "next-round",
                {
                    roomCode
                }
            );


            setTimeout(
                () => {

                    resultAction.disabled =
                        false;

                    resultAction.textContent =
                        "Next Round";

                },
                1500
            );
        }
    );
}


if (nextRoundBtn) {

    nextRoundBtn.addEventListener(
        "click",
        () => {

            socket.emit(
                "next-round",
                {
                    roomCode
                }
            );
        }
    );
}


/* =========================================
   REWARD
========================================= */

function handleReward(
    reward
) {

    if (!reward) {
        return;
    }


    if (
        reward.type ===
        "win"
    ) {

        showGameMessage(
            `+${reward.reward} Points • Balance: ${reward.balance}`
        );

    } else if (
        reward.type ===
        "loss"
    ) {

        showGameMessage(
            `-${reward.penalty} Points • Balance: ${reward.balance}`
        );

    } else if (
        reward.type ===
        "draw"
    ) {

        showGameMessage(
            "Draw • No points gained or lost"
        );
    }
}


/* =========================================
   MATCH RESULT
========================================= */

function applyMatchResult(
    data
) {

    if (!data) {
        return;
    }


    const winner =
        data.winner;


    if (!winner) {

        showResultOverlay(
            "🏁",
            "Match Finished",
            "The match has ended.",
            false
        );

        return;
    }


    if (
        winner.id ===
        socket.id
    ) {

        showResultOverlay(
            "🏆",
            "You Won the Match!",
            "Congratulations! You won the best-of-3 match.",
            false
        );

    } else {

        showResultOverlay(
            "😔",
            "Match Lost",
            `${winner.username} won the match.`,
            false
        );
    }


    disableBoard();
}


/* =========================================
   MESSAGE
========================================= */

function showGameMessage(
    message
) {

    if (!gameMessage) {
        return;
    }


    gameMessage.textContent =
        message;


    gameMessage.classList.add(
        "visible"
    );


    setTimeout(
        () => {

            gameMessage.classList.remove(
                "visible"
            );

        },
        3000
    );
}


/* =========================================
   LEAVE GAME
========================================= */

if (leaveGameBtn) {

    leaveGameBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to leave the game?"
                );


            if (!confirmed) {
                return;
            }


            socket.emit(
                "leave-game",
                {
                    roomCode
                }
            );


            sessionStorage.removeItem(
                "roomCode"
            );

            sessionStorage.removeItem(
                "gameState"
            );


            window.location.href =
                "index.html";
        }
    );
}


/* =========================================
   PAGE CLOSE
========================================= */

window.addEventListener(
    "beforeunload",
    () => {

        /*
         * Don't emit leave here.
         *
         * Socket.IO disconnect handler
         * on server handles it.
         */
    }
);