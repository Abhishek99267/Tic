//const API_BASE =
   // "http://localhost:5000/api";

const API_BASE =
    APP_CONFIG.API_BASE;
const playerId =
    localStorage.getItem("playerId");


if (!playerId) {

    window.location.href =
        "index.html";
}


/* =========================================
   DATA
========================================= */

const AVATAR_MAP = {

    "avatar-1": "🧑",

    "avatar-2": "👨‍💻",

    "avatar-3": "🧑‍🚀",

    "avatar-4": "🥷",

    "avatar-5": "🦸",

    "avatar-6": "🤖"

};


const SYMBOL_MAP = {

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
   STATE
========================================= */

let user = null;

let catalog = {

    symbols: [],

    themes: [],

    avatars: []

};


/* =========================================
   DOM
========================================= */

const previewCard =
    document.getElementById(
        "previewCard"
    );


const previewAvatar =
    document.getElementById(
        "previewAvatar"
    );


const previewUsername =
    document.getElementById(
        "previewUsername"
    );


const previewSymbol =
    document.getElementById(
        "previewSymbol"
    );


const avatarGrid =
    document.getElementById(
        "avatarGrid"
    );


const symbolGrid =
    document.getElementById(
        "symbolGrid"
    );


const colorGrid =
    document.getElementById(
        "colorGrid"
    );


const themeGrid =
    document.getElementById(
        "themeGrid"
    );


const toast =
    document.getElementById(
        "toast"
    );


/* =========================================
   INITIALIZE
========================================= */

async function initialize() {

    try {

        await loadProfile();

        await loadCatalog();

        renderEverything();

    } catch (error) {

        console.error(
            "Customize initialization error:",
            error
        );

        showToast(
            "Unable to load customization.",
            "error"
        );
    }
}


/* =========================================
   PROFILE
========================================= */

async function loadProfile() {

    const response =
        await fetch(
            `${API_BASE}/users/profile/${playerId}`
        );


    const data =
        await response.json();


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Unable to load profile"
        );
    }


    user =
        data.user;
}


/* =========================================
   CATALOG
========================================= */

async function loadCatalog() {

    const response =
        await fetch(
            `${API_BASE}/users/shop`
        );


    const data =
        await response.json();


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Unable to load catalog"
        );
    }


    catalog = {

        symbols:
            data.symbols || [],

        themes:
            data.themes || [],

        avatars:
            data.avatars || []

    };
}


/* =========================================
   RENDER EVERYTHING
========================================= */

function renderEverything() {

    renderPreview();

    renderAvatars();

    renderSymbols();

    renderColors();

    renderThemes();

}


/* =========================================
   PREVIEW
========================================= */

function renderPreview() {

    if (!user) return;


    previewUsername.textContent =
        user.username || "Player";


    previewAvatar.textContent =
        AVATAR_MAP[
            user.avatar
        ] || "🧑";


    previewSymbol.textContent =
        SYMBOL_MAP[
            user.selectedSymbol
        ] || "✕";


    /*
     * Apply symbol color
     */

    previewSymbol.style.color =
        getColorValue(
            user.selectedColor
        );


    /*
     * Apply theme
     */

    previewCard.className =
        "preview-card";


    previewCard.classList.add(
        `theme-${user.selectedTheme || "default"}`
    );
}


/* =========================================
   AVATARS
========================================= */

function renderAvatars() {

    avatarGrid.innerHTML = "";


    catalog.avatars.forEach(
        avatar => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "avatar-option";


            if (
                user.avatar === avatar
            ) {

                button.classList.add(
                    "selected"
                );
            }


            button.textContent =
                AVATAR_MAP[avatar] ||
                "🧑";


            button.addEventListener(
                "click",
                () => {

                    updateAvatar(
                        avatar
                    );
                }
            );


            avatarGrid.appendChild(
                button
            );
        }
    );
}


/* =========================================
   SYMBOLS
========================================= */

function renderSymbols() {

    symbolGrid.innerHTML = "";


    catalog.symbols.forEach(
        symbol => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "symbol-option";


            if (
                user.selectedSymbol ===
                symbol.id
            ) {

                button.classList.add(
                    "selected"
                );
            }


            button.innerHTML = `

                <span class="symbol-icon">
                    ${
                        symbol.icon ||
                        SYMBOL_MAP[
                            symbol.id
                        ] ||
                        "?"
                    }
                </span>

                <span class="symbol-name">
                    ${escapeHTML(
                        symbol.name ||
                        symbol.id
                    )}
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    /*
                     * Only owned symbols
                     * can be equipped.
                     */

                    if (
                        !user.ownedSymbols
                            ?.includes(
                                symbol.id
                            )
                    ) {

                        showToast(
                            "You don't own this symbol. Buy it from the Shop.",
                            "error"
                        );

                        return;
                    }


                    updateSymbol(
                        symbol.id
                    );
                }
            );


            symbolGrid.appendChild(
                button
            );
        }
    );
}


/* =========================================
   COLORS
========================================= */

function renderColors() {

    const colors =
        document.querySelectorAll(
            ".color-option"
        );


    colors.forEach(
        button => {

            const color =
                button.dataset.color;


            button.classList.toggle(
                "selected",
                color ===
                    user.selectedColor
            );


            button.onclick =
                () => {

                    updateColor(
                        color
                    );
                };
        }
    );
}


/* =========================================
   THEMES
========================================= */

function renderThemes() {

    themeGrid.innerHTML = "";


    catalog.themes.forEach(
        theme => {

            const owned =
                user.ownedThemes
                    ?.includes(
                        theme.id
                    );


            const selected =
                user.selectedTheme ===
                theme.id;


            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "theme-option";


            if (selected) {

                card.classList.add(
                    "selected"
                );
            }


            const status =
                selected
                    ? "✓ Equipped"
                    : owned
                        ? "Owned • Equip"
                        : "🔒 Purchase in Shop";


            card.innerHTML = `

                <div
                    class="
                        theme-preview
                        theme-${theme.id}
                    "
                >
                    ✕ ○
                </div>


                <span class="theme-name">
                    ${escapeHTML(
                        theme.name ||
                        theme.id
                    )}
                </span>


                <span class="theme-status">
                    ${status}
                </span>

            `;


            card.addEventListener(
                "click",
                () => {

                    if (!owned) {

                        showToast(
                            "You don't own this theme. Buy it from the Shop.",
                            "error"
                        );

                        return;
                    }


                    updateTheme(
                        theme.id
                    );
                }
            );


            themeGrid.appendChild(
                card
            );
        }
    );
}


/* =========================================
   UPDATE AVATAR
========================================= */

async function updateAvatar(
    avatar
) {

    try {

        await post(
            "/shop/avatar/select",
            {
                playerId,
                avatar
            }
        );


        user.avatar =
            avatar;


        renderEverything();


        showToast(
            "Avatar updated!",
            "success"
        );


    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}


/* =========================================
   UPDATE SYMBOL
========================================= */

async function updateSymbol(
    symbol
) {

    try {

        await post(
            "/shop/symbol/select",
            {
                playerId,
                symbol
            }
        );


        user.selectedSymbol =
            symbol;


        renderEverything();


        showToast(
            "Symbol equipped!",
            "success"
        );


    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}


/* =========================================
   UPDATE COLOR
========================================= */

async function updateColor(
    color
) {

    try {

        await post(
            "/shop/color/select",
            {
                playerId,
                color
            }
        );


        user.selectedColor =
            color;


        renderEverything();


        showToast(
            "Symbol color updated!",
            "success"
        );


    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}


/* =========================================
   UPDATE THEME
========================================= */

async function updateTheme(
    theme
) {

    try {

        await post(
            "/shop/theme/select",
            {
                playerId,
                theme
            }
        );


        user.selectedTheme =
            theme;


        renderEverything();


        showToast(
            "Theme equipped!",
            "success"
        );


    } catch (error) {

        showToast(
            error.message,
            "error"
        );
    }
}


/* =========================================
   API POST
========================================= */

async function post(
    endpoint,
    body
) {

    const response =
        await fetch(
            `${API_BASE}${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(body)
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
            "Request failed"
        );
    }


    return data;
}


/* =========================================
   COLORS
========================================= */

function getColorValue(color) {

    const colors = {

        red: "#ff4d5e",

        blue: "#4d8dff",

        green: "#48d597",

        yellow: "#ffd34d",

        purple: "#a56cff",

        orange: "#ff873d"

    };


    return colors[color] ||
        colors.red;
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    clearTimeout(toastTimer);


    toast.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    toastTimer =
        setTimeout(
            () => {

                toast.className =
                    "toast";

            },
            2500
        );
}


/* =========================================
   BACK BUTTON
========================================= */

const backBtn =
    document.getElementById(
        "backBtn"
    );


if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "index.html";

        }
    );
}


/* =========================================
   START
========================================= */

initialize();