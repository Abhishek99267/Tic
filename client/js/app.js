"use strict";

/*
==================================================
TIC TAC ARENA - HOME PAGE
==================================================

Flow:

Username
   ↓
Create Room / Join Room
   ↓
Save username
   ↓
Open lobby.html
*/


// ================================================
// GET HTML ELEMENTS
// ================================================

const usernameInput =
    document.getElementById("usernameInput");

const createButton =
    document.getElementById("createButton");

const joinButton =
    document.getElementById("joinButton");

const errorMessage =
    document.getElementById("errorMessage");


// ================================================
// CHECK ELEMENTS
// ================================================

console.log("Home page loaded");

console.log("usernameInput:", usernameInput);
console.log("createButton:", createButton);
console.log("joinButton:", joinButton);


// ================================================
// GENERATE PERMANENT PLAYER ID
// ================================================

function getPlayerId() {

    let playerId =
        localStorage.getItem("ticTacArenaPlayerId");


    if (!playerId) {

        if (
            window.crypto &&
            crypto.randomUUID
        ) {

            playerId =
                crypto.randomUUID();

        } else {

            playerId =
                "player-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);
        }


        localStorage.setItem(
            "ticTacArenaPlayerId",
            playerId
        );
    }


    return playerId;
}


// ================================================
// VALIDATE USERNAME
// ================================================

function getUsername() {

    if (!usernameInput) {
        console.error(
            "Username input not found."
        );

        return null;
    }


    const username =
        usernameInput.value.trim();


    if (!username) {

        showError(
            "Please enter your name."
        );

        usernameInput.focus();

        return null;
    }


    if (username.length < 2) {

        showError(
            "Name must contain at least 2 characters."
        );

        usernameInput.focus();

        return null;
    }


    if (username.length > 20) {

        showError(
            "Name must be 20 characters or less."
        );

        usernameInput.focus();

        return null;
    }


    return username;
}


// ================================================
// SHOW ERROR
// ================================================

function showError(message) {

    if (!errorMessage) {

        console.error(message);

        return;
    }


    errorMessage.textContent =
        message;
}


// ================================================
// CLEAR ERROR
// ================================================

function clearError() {

    if (errorMessage) {
        errorMessage.textContent = "";
    }
}


// ================================================
// CONTINUE TO LOBBY
// ================================================

function continueToLobby(mode) {

    clearError();


    const username =
        getUsername();


    if (!username) {
        return;
    }


    // Create/get permanent player ID
    const playerId =
        getPlayerId();


    // Save player information
    sessionStorage.setItem(
        "ticTacArenaUsername",
        username
    );

    sessionStorage.setItem(
        "ticTacArenaPlayerId",
        playerId
    );


    // Save for compatibility
    sessionStorage.setItem(
        "username",
        username
    );

    localStorage.setItem(
        "username",
        username
    );


    console.log(
        "Player:",
        username
    );

    console.log(
        "Player ID:",
        playerId
    );

    console.log(
        "Lobby mode:",
        mode
    );


    // Open lobby
    window.location.href =
        `lobby.html?mode=${mode}`;
}


// ================================================
// CREATE ROOM BUTTON
// ================================================

if (createButton) {

    createButton.addEventListener(
        "click",
        () => {

            console.log(
                "Create Room clicked"
            );

            continueToLobby(
                "create"
            );
        }
    );

} else {

    console.error(
        "Create Room button not found."
    );
}


// ================================================
// JOIN ROOM BUTTON
// ================================================

if (joinButton) {

    joinButton.addEventListener(
        "click",
        () => {

            console.log(
                "Join Room clicked"
            );

            continueToLobby(
                "join"
            );
        }
    );

} else {

    console.error(
        "Join Room button not found."
    );
}


// ================================================
// ENTER KEY SUPPORT
// ================================================

if (usernameInput) {

    usernameInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                continueToLobby(
                    "create"
                );
            }
        }
    );
}


// ================================================
// CLEAR ERROR WHILE TYPING
// ================================================

if (usernameInput) {

    usernameInput.addEventListener(
        "input",
        () => {

            clearError();

        }
    );
}