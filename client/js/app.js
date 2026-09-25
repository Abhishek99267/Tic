const usernameInput =
    document.getElementById(
        "username"
    );

const createButton =
    document.getElementById(
        "createGameBtn"
    );

const joinButton =
    document.getElementById(
        "joinGameBtn"
    );


// =========================
// PLAYER ID
// =========================

let playerId =
    localStorage.getItem(
        "playerId"
    );


if (!playerId) {

    playerId =
        crypto.randomUUID();

    localStorage.setItem(
        "playerId",
        playerId
    );
}


// =========================
// CONTINUE
// =========================

function continueToLobby(mode) {

    const username =
        usernameInput.value.trim();


    if (
        username.length < 2 ||
        username.length > 20
    ) {

        alert(
            "Username must be 2-20 characters"
        );

        return;
    }


    sessionStorage.setItem(
        "username",
        username
    );


    sessionStorage.setItem(
        "playerId",
        playerId
    );


    window.location.href =
        `lobby.html?mode=${mode}`;
}


// =========================
// CREATE
// =========================

createButton.addEventListener(
    "click",
    () => {

        continueToLobby(
            "create"
        );
    }
);


// =========================
// JOIN
// =========================

joinButton.addEventListener(
    "click",
    () => {

        continueToLobby(
            "join"
        );
    }
);