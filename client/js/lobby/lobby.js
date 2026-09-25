const API_BASE =
    APP_CONFIG.API_BASE;

/* =========================================
   PLAYER IDENTITY
========================================= */

const username = sessionStorage.getItem("username");
const persistentPlayerId = localStorage.getItem("playerId");

if (!username || !persistentPlayerId) {
    window.location.href = "index.html";
}


/* =========================================
   DOM ELEMENTS
========================================= */

const createSection =
    document.getElementById("createSection");

const joinSection =
    document.getElementById("joinSection");

const roomCodeDisplay =
    document.getElementById("roomCodeDisplay");

const joinRoomInput =
    document.getElementById("joinRoomInput");

const joinRoomButton =
    document.getElementById("joinRoomBtn");

const playersList =
    document.getElementById("playersList");

const startGameButton =
    document.getElementById("startGameBtn");

const copyRoomButton =
    document.getElementById("copyRoomBtn");

const backButton =
    document.getElementById("backBtn");

const playerCount =
    document.getElementById("playerCount");


/* =========================================
   STATE
========================================= */

let roomCode = "";

let players = [];

let roomCreated = false;

let gameStarted = false;

let joinedRoom = false;


/* =========================================
   MODE
========================================= */

const params =
    new URLSearchParams(window.location.search);

const mode =
    params.get("mode");


if (mode === "create") {

    if (createSection) {
        createSection.style.display = "block";
    }

    if (joinSection) {
        joinSection.style.display = "none";
    }

} else if (mode === "join") {

    if (createSection) {
        createSection.style.display = "none";
    }

    if (joinSection) {
        joinSection.style.display = "block";
    }

} else {

    window.location.href = "index.html";
}


/* =========================================
   CREATE / UPDATE PROFILE
========================================= */

// async function createOrUpdateProfile() {

//     try {

//         const response =
//             await fetch(`${API_BASE}/users`, {

//                 method: "POST",

//                 headers: {
//                     "Content-Type":
//                         "application/json"
//                 },

//                 body: JSON.stringify({
//                     playerId:
//                         persistentPlayerId,

//                     username:
//                         username
//                 })
//             });


//         const data =
//             await response.json();


//         if (!response.ok || !data.success) {

//             throw new Error(
//                 data.message ||
//                 "Unable to create player profile"
//             );
//         }


//         console.log(
//             "Player profile:",
//             data.user
//         );


//         return data.user;

//     } catch (error) {

//         console.error(
//             "Profile error:",
//             error
//         );


//         showError(
//             "Unable to connect to player profile."
//         );


//         return null;
//     }
// }
async function createOrUpdateProfile() {

    try {

        const response =
            await fetch(
                `${API_BASE}/users`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            playerId:
                                persistentPlayerId,

                            username:
                                username
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to create player profile"
            );
        }


        return data.user;

    } catch (error) {

        console.error(
            "Profile error:",
            error
        );

        showError(
            "Unable to connect to player profile."
        );

        return null;
    }
}

/* =========================================
   SOCKET CONNECT
========================================= */

socket.on("connect", async () => {

    console.log(
        "Lobby socket connected:",
        socket.id
    );


    const user =
        await createOrUpdateProfile();


    if (!user) {
        return;
    }


    /*
       CREATE MODE:
       Automatically create room
    */

    if (
        mode === "create" &&
        !roomCreated
    ) {

        socket.emit(
            "create-room",
            {
                username:
                    username,

                playerId:
                    persistentPlayerId
            }
        );
    }


    /*
       JOIN MODE:
       Don't automatically join.
       User enters room code.
    */

});


/* =========================================
   SOCKET DISCONNECT
========================================= */

socket.on("disconnect", reason => {

    console.log(
        "Lobby socket disconnected:",
        reason
    );


    if (!gameStarted) {

        showError(
            "Disconnected from server. Trying to reconnect..."
        );
    }

});


/* =========================================
   SOCKET CONNECTION ERROR
========================================= */

socket.on("connect_error", error => {

    console.error(
        "Socket connection error:",
        error
    );


    showError(
        "Unable to connect to game server."
    );

});


/* =========================================
   ROOM CREATED
========================================= */

socket.on("room-created", data => {

    console.log(
        "Room created:",
        data
    );


    roomCreated = true;

    joinedRoom = true;


    roomCode =
        data.roomCode;


    players =
        data.players || [];


    sessionStorage.setItem(
        "roomCode",
        roomCode
    );


    if (roomCodeDisplay) {

        roomCodeDisplay.textContent =
            roomCode;
    }


    renderPlayers();

    clearError();

});


/* =========================================
   ROOM UPDATED
========================================= */

socket.on("room-updated", data => {

    console.log(
        "Room updated:",
        data
    );


    /*
       Ignore updates from rooms
       this player is not part of.
    */

    const isMyRoom =
        data.players &&
        data.players.some(
            player =>
                player.playerId ===
                persistentPlayerId
        );


    if (!isMyRoom) {
        return;
    }


    joinedRoom = true;


    if (data.roomCode) {

        roomCode =
            data.roomCode;


        sessionStorage.setItem(
            "roomCode",
            roomCode
        );
    }


    players =
        data.players || [];


    if (roomCodeDisplay) {

        roomCodeDisplay.textContent =
            roomCode || "------";
    }


    renderPlayers();

    clearError();


    /*
       If join button exists,
       restore its state.
    */

    if (joinRoomButton) {

        joinRoomButton.disabled =
            false;

        joinRoomButton.textContent =
            "Join Room";
    }

});


/* =========================================
   RENDER PLAYERS
========================================= */

function renderPlayers() {

    if (!playersList) {
        return;
    }


    playersList.innerHTML = "";


    /* -------------------------------
       UPDATE PLAYER COUNT
    -------------------------------- */

    if (playerCount) {

        playerCount.textContent =
            `${players.length} / 2`;
    }


    /* -------------------------------
       NO PLAYERS
    -------------------------------- */

    if (players.length === 0) {

        const empty =
            document.createElement("li");


        empty.textContent =
            "Waiting for players...";


        empty.classList.add(
            "waiting-player"
        );


        playersList.appendChild(empty);


        updateStartButton();

        return;
    }


    /* -------------------------------
       PLAYERS
    -------------------------------- */

    players.forEach(
        (player, index) => {

            const li =
                document.createElement("li");


            const isMe =
                player.playerId ===
                persistentPlayerId;


            li.textContent =
                `${index + 1}. ${player.username}`;


            if (isMe) {

                li.textContent +=
                    " (You)";


                li.classList.add(
                    "current-player"
                );
            }


            playersList.appendChild(li);
        }
    );


    /* -------------------------------
       WAITING PLAYER
    -------------------------------- */

    if (players.length < 2) {

        const waiting =
            document.createElement("li");


        waiting.textContent =
            "Waiting for another player...";


        waiting.classList.add(
            "waiting-player"
        );


        playersList.appendChild(waiting);
    }


    updateStartButton();
}


/* =========================================
   START BUTTON
========================================= */

function updateStartButton() {

    if (!startGameButton) {
        return;
    }


    /*
       Only host should actually
       start the game.

       In create mode:
       player who created room = host.
    */

    if (
        players.length === 2 &&
        mode === "create"
    ) {

        startGameButton.disabled =
            false;


        startGameButton.textContent =
            "Start Game";


        return;
    }


    /*
       Joiner doesn't start game.
    */

    if (mode === "join") {

        startGameButton.disabled =
            true;


        startGameButton.textContent =
            "Waiting for Host...";


        return;
    }


    /*
       Waiting for second player.
    */

    startGameButton.disabled =
        true;


    startGameButton.textContent =
        "Waiting for Player...";
}


/* =========================================
   JOIN ROOM BUTTON
========================================= */

if (joinRoomButton) {

    joinRoomButton.addEventListener(
        "click",
        joinRoom
    );
}


/* =========================================
   ENTER KEY
========================================= */

if (joinRoomInput) {

    joinRoomInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                joinRoom();
            }
        }
    );
}


/* =========================================
   JOIN ROOM
========================================= */

function joinRoom() {

    const code =
        joinRoomInput.value
            .trim()
            .toUpperCase();


    /* -------------------------------
       EMPTY
    -------------------------------- */

    if (!code) {

        showError(
            "Please enter a room code."
        );

        return;
    }


    /* -------------------------------
       LENGTH
    -------------------------------- */

    if (code.length !== 6) {

        showError(
            "Room code must be 6 characters."
        );

        return;
    }


    /* -------------------------------
       DISABLE BUTTON
    -------------------------------- */

    if (joinRoomButton) {

        joinRoomButton.disabled =
            true;

        joinRoomButton.textContent =
            "Joining...";
    }


    clearError();


    /* -------------------------------
       SEND REQUEST
    -------------------------------- */

    socket.emit(
        "join-room",
        {
            roomCode:
                code,

            username:
                username,

            playerId:
                persistentPlayerId
        }
    );
}


/* =========================================
   ROOM ERROR
========================================= */

socket.on("room-error", data => {

    console.error(
        "Room error:",
        data
    );


    showError(
        data.message ||
        "Something went wrong."
    );


    if (joinRoomButton) {

        joinRoomButton.disabled =
            false;

        joinRoomButton.textContent =
            "Join Room";
    }

});


/* =========================================
   START GAME
========================================= */

if (startGameButton) {

    startGameButton.addEventListener(
        "click",
        () => {

            /*
               Only host can start.
            */

            if (mode !== "create") {

                showError(
                    "Only the room host can start the game."
                );

                return;
            }


            if (players.length !== 2) {

                showError(
                    "Wait for another player."
                );

                return;
            }


            if (!roomCode) {

                showError(
                    "Room code not found."
                );

                return;
            }


            startGameButton.disabled =
                true;


            startGameButton.textContent =
                "Starting...";


            socket.emit(
                "start-game",
                {
                    roomCode:
                        roomCode
                }
            );
        }
    );
}


/* =========================================
   GAME STARTED
========================================= */

socket.on("game-started", state => {

    console.log(
        "Game started:",
        state
    );


    gameStarted = true;


    sessionStorage.setItem(
        "gameState",
        JSON.stringify(state)
    );


    if (roomCode) {

        sessionStorage.setItem(
            "roomCode",
            roomCode
        );
    }


    window.location.href =
        "game.html";
});


/* =========================================
   GAME ERROR
========================================= */

socket.on("game-error", data => {

    console.error(
        "Game error:",
        data
    );


    showError(
        data.message ||
        "Unable to start game."
    );


    if (startGameButton) {

        updateStartButton();
    }

});


/* =========================================
   COPY ROOM CODE
========================================= */

if (copyRoomButton) {

    copyRoomButton.addEventListener(
        "click",
        async () => {

            if (!roomCode) {

                showError(
                    "Room Code is not available yet."
                );

                return;
            }


            try {

                await navigator.clipboard.writeText(
                    roomCode
                );


                copyRoomButton.textContent =
                    "Copied!";


                setTimeout(
                    () => {

                        copyRoomButton.textContent =
                            "Copy";

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Copy error:",
                    error
                );


                showError(
                    `Room Code: ${roomCode}`
                );
            }
        }
    );
}


/* =========================================
   BACK BUTTON
========================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        () => {

            if (
                roomCode &&
                !gameStarted
            ) {

                socket.emit(
                    "leave-game",
                    {
                        roomCode:
                            roomCode
                    }
                );
            }


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
   PLAYER LEFT
========================================= */

socket.on("player-left", data => {

    console.log(
        "Player left:",
        data
    );


    showError(
        "The other player left the room."
    );


    players =
        players.filter(
            player =>
                player.id !==
                data.playerId
        );


    renderPlayers();
});


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    let errorElement =
        document.getElementById(
            "lobbyError"
        );


    if (!errorElement) {

        errorElement =
            document.createElement("div");


        errorElement.id =
            "lobbyError";


        errorElement.style.marginTop =
            "15px";


        errorElement.style.padding =
            "12px";


        errorElement.style.borderRadius =
            "10px";


        errorElement.style.background =
            "rgba(255, 80, 80, 0.12)";


        errorElement.style.border =
            "1px solid rgba(255, 80, 80, 0.20)";


        errorElement.style.color =
            "#ff7b7b";


        errorElement.style.textAlign =
            "center";


        errorElement.style.fontSize =
            "14px";


        const section =
            document.querySelector(
                ".lobby-section"
            );


        if (section) {

            section.appendChild(
                errorElement
            );

        } else {

            document.body.appendChild(
                errorElement
            );
        }
    }


    errorElement.textContent =
        message;
}


/* =========================================
   CLEAR ERROR
========================================= */

function clearError() {

    const errorElement =
        document.getElementById(
            "lobbyError"
        );


    if (errorElement) {

        errorElement.textContent =
            "";
    }
}