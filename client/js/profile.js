//const API_BASE = "http://localhost:5000/api";
const API_BASE =
    APP_CONFIG.API_BASE;
const playerId = localStorage.getItem("playerId");


// =========================================
// AUTH CHECK
// =========================================

if (!playerId) {
    window.location.href = "index.html";
}


// =========================================
// AVATAR MAP
// =========================================

const AVATARS = {
    "avatar-1": "🧑",
    "avatar-2": "👨‍💻",
    "avatar-3": "🧑‍🚀",
    "avatar-4": "🥷",
    "avatar-5": "🦸",
    "avatar-6": "🤖"
};


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile() {

    try {

        const response = await fetch(
            `${API_BASE}/users/profile/${playerId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                "Unable to load profile"
            );
        }

        const user = data.user;

        // Username
        const usernameElement =
            document.getElementById(
                "profileUsername"
            );

        if (usernameElement) {
            usernameElement.textContent =
                user.username || "Player";
        }


        // Player ID
        const playerIdElement =
            document.getElementById(
                "profilePlayerId"
            );

        if (playerIdElement) {
            playerIdElement.textContent =
                user.playerId;
        }


        // Avatar
        const avatarElement =
            document.getElementById(
                "profileAvatar"
            );

        if (avatarElement) {

            avatarElement.textContent =
                AVATARS[user.avatar] ||
                AVATARS["avatar-1"];
        }


        // Balance
        const balanceElement =
            document.getElementById(
                "profileBalance"
            );

        if (balanceElement) {

            balanceElement.textContent =
                user.balance ?? 0;
        }


        // Stats
        const stats =
            user.stats || {};


        setText(
            "profileWins",
            stats.wins || 0
        );

        setText(
            "profileLosses",
            stats.losses || 0
        );

        setText(
            "profileMatches",
            stats.matchesPlayed || 0
        );

        setText(
            "profileRoundsWon",
            stats.roundsWon || 0
        );

        setText(
            "profileRoundsLost",
            stats.roundsLost || 0
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showProfileError(
            "Unable to load your profile."
        );
    }
}


// =========================================
// HELPER
// =========================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// =========================================
// LOAD MATCH HISTORY
// =========================================

async function loadMatchHistory() {

    const container =
        document.getElementById(
            "matchHistory"
        );

    if (!container) return;


    try {

        const response = await fetch(
            `${API_BASE}/games/history/${playerId}?limit=20`
        );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load match history"
            );
        }


        const matches =
            data.matches || [];


        // No matches
        if (matches.length === 0) {

            container.innerHTML = `
                <div class="empty-history">

                    <div class="empty-icon">
                        🎮
                    </div>

                    <h3>
                        No matches yet
                    </h3>

                    <p>
                        Play your first match
                        to see your history here.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = "";


        matches.forEach(match => {

            const card =
                createMatchCard(match);

            container.appendChild(card);
        });


    } catch (error) {

        console.error(
            "Match history error:",
            error
        );


        container.innerHTML = `
            <div class="history-error">
                Unable to load match history.
            </div>
        `;
    }
}


// =========================================
// CREATE MATCH CARD
// =========================================

function createMatchCard(match) {

    const card =
        document.createElement("div");


    card.className =
        "match-history-card";


    // Find opponent
    const opponent =
        (match.players || []).find(
            player =>
                player.playerId !== playerId
        );


    const opponentName =
        opponent?.username ||
        "Unknown Player";


    // Determine result

    let resultText;
    let resultClass;


    if (match.status === "abandoned") {

        resultText = "Abandoned";
        resultClass = "abandoned";

    } else if (
        match.winnerPlayerId === playerId
    ) {

        resultText = "Victory";
        resultClass = "win";

    } else {

        resultText = "Defeat";
        resultClass = "loss";
    }


    // Score

    const myScore =
        match.finalScores?.[playerId] ?? 0;


    const opponentScore =
        opponent
            ? match.finalScores?.[
                opponent.playerId
              ] ?? 0
            : 0;


    // Date

    const matchDate =
        formatDate(
            match.createdAt ||
            match.startedAt
        );


    card.innerHTML = `

        <div class="history-main">

            <div class="history-game-icon">
                🎮
            </div>


            <div class="history-info">

                <h3>
                    vs ${escapeHTML(
                        opponentName
                    )}
                </h3>

                <p>
                    Room:
                    ${escapeHTML(
                        match.roomCode ||
                        "Unknown"
                    )}
                </p>

                <p>
                    ${matchDate}
                </p>

            </div>

        </div>


        <div class="history-result">

            <span
                class="result-badge ${resultClass}"
            >
                ${resultText}
            </span>


            <strong class="match-score">
                ${myScore}
                -
                ${opponentScore}
            </strong>


            <span class="round-count">

                ${match.totalRounds || 0}

                ${
                    Number(match.totalRounds) === 1
                        ? "Round"
                        : "Rounds"
                }

            </span>

        </div>

    `;


    return card;
}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
    }


    const date =
        new Date(dateValue);


    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================================
// HTML ESCAPE
// =========================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================
// ERROR
// =========================================

function showProfileError(message) {

    const existing =
        document.getElementById(
            "profileError"
        );


    if (existing) {
        existing.textContent = message;
        return;
    }


    const error =
        document.createElement("div");


    error.id =
        "profileError";


    error.style.marginTop =
        "20px";


    error.style.padding =
        "12px 16px";


    error.style.borderRadius =
        "10px";


    error.style.background =
        "rgba(255,70,70,0.1)";


    error.style.border =
        "1px solid rgba(255,70,70,0.2)";


    error.style.color =
        "#ff8585";


    error.textContent =
        message;


    document
        .querySelector(".profile-page")
        ?.prepend(error);
}


// =========================================
// INITIALIZE
// =========================================

loadProfile();

loadMatchHistory();