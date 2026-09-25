//const API_BASE = "http://localhost:5000/api";
const API_BASE =
    APP_CONFIG.API_BASE;
const playerId =
    localStorage.getItem("playerId");


if (!playerId) {
    window.location.href = "index.html";
}


const symbolGrid =
    document.getElementById("symbolGrid");

const themeGrid =
    document.getElementById("themeGrid");

const balanceElement =
    document.getElementById("balance");

const backButton =
    document.getElementById("backBtn");

const toast =
    document.getElementById("toast");


let user = null;

let catalog = {
    symbols: [],
    themes: [],
    avatars: []
};


const FALLBACK_SYMBOL_ICONS = {
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
   INITIALIZE SHOP
========================================= */

async function initializeShop() {

    try {

        await Promise.all([
            loadProfile(),
            loadCatalog()
        ]);


        renderShop();

    } catch (error) {

        console.error(
            "Shop initialization error:",
            error
        );


        showToast(
            "Unable to load the shop.",
            "error"
        );
    }
}


/* =========================================
   LOAD PROFILE
========================================= */

async function loadProfile() {

    const response =
        await fetch(
            `${API_BASE}/users/profile/${playerId}`
        );


    const data =
        await response.json();


    if (!response.ok || !data.success) {

        throw new Error(
            data.message ||
            "Unable to load profile"
        );
    }


    user = data.user;


    updateBalance();
}


/* =========================================
   LOAD SHOP CATALOG
========================================= */

async function loadCatalog() {

    const response =
        await fetch(
            `${API_BASE}/users/shop`
        );


    const data =
        await response.json();


    if (!response.ok || !data.success) {

        throw new Error(
            data.message ||
            "Unable to load shop"
        );
    }


    /*
     * Supports either:
     *
     * { symbols, themes, avatars }
     *
     * or
     *
     * { catalog: { ... } }
     */

    const source =
        data.catalog || data;


    catalog = {

        symbols:
            source.symbols || [],

        themes:
            source.themes || [],

        avatars:
            source.avatars || []
    };
}


/* =========================================
   RENDER SHOP
========================================= */

function renderShop() {

    if (!user) {
        return;
    }


    renderSymbols();

    renderThemes();

    updateBalance();
}


/* =========================================
   SYMBOLS
========================================= */

function renderSymbols() {

    if (!symbolGrid) {
        return;
    }


    symbolGrid.innerHTML = "";


    catalog.symbols.forEach(symbol => {

        const owned =
            user.ownedSymbols?.includes(
                symbol.id
            );


        const selected =
            user.selectedSymbol ===
            symbol.id;


        const card =
            document.createElement("article");


        card.className =
            `shop-card ${
                selected
                    ? "selected"
                    : ""
            }`;


        const icon =
            symbol.icon ||
            FALLBACK_SYMBOL_ICONS[
                symbol.id
            ] ||
            "?";


        card.innerHTML = `

            ${
                owned
                    ? `
                    <span class="owned-badge">
                        OWNED
                    </span>
                    `
                    : ""
            }


            <div class="item-icon">
                ${icon}
            </div>


            <h3>
                ${escapeHTML(
                    symbol.name ||
                    symbol.id
                )}
            </h3>


            <div class="item-price">

                ${
                    symbol.id === "cross"
                        ? "Starter Symbol"
                        : `🪙 ${symbol.price ?? 70}`
                }

            </div>


            ${getSymbolButton(
                symbol,
                owned,
                selected
            )}

        `;


        symbolGrid.appendChild(card);
    });
}


/* =========================================
   SYMBOL BUTTON
========================================= */

function getSymbolButton(
    symbol,
    owned,
    selected
) {

    if (selected) {

        return `
            <button
                class="
                    shop-button
                    selected-button
                "
                disabled
            >
                ✓ Equipped
            </button>
        `;
    }


    if (owned) {

        return `
            <button
                class="
                    shop-button
                    select-button
                "
                data-action="select-symbol"
                data-id="${symbol.id}"
            >
                Equip
            </button>
        `;
    }


    return `
        <button
            class="
                shop-button
                buy-button
            "
            data-action="buy-symbol"
            data-id="${symbol.id}"
        >
            Buy for 🪙 ${symbol.price ?? 70}
        </button>
    `;
}


/* =========================================
   THEMES
========================================= */

function renderThemes() {

    if (!themeGrid) {
        return;
    }


    themeGrid.innerHTML = "";


    catalog.themes.forEach(theme => {

        const owned =
            user.ownedThemes?.includes(
                theme.id
            );


        const selected =
            user.selectedTheme ===
            theme.id;


        const card =
            document.createElement("article");


        card.className =
            `shop-card ${
                selected
                    ? "selected"
                    : ""
            }`;


        card.innerHTML = `

            ${
                owned
                    ? `
                    <span class="owned-badge">
                        OWNED
                    </span>
                    `
                    : ""
            }


            <div
                class="
                    theme-preview
                    preview-${theme.id}
                "
            >
                ✕ ○
            </div>


            <h3>
                ${escapeHTML(
                    theme.name ||
                    theme.id
                )}
            </h3>


            <div class="item-price">

                ${
                    theme.id === "default"
                        ? "Free"
                        : `🪙 ${theme.price ?? 225}`
                }

            </div>


            ${getThemeButton(
                theme,
                owned,
                selected
            )}

        `;


        themeGrid.appendChild(card);
    });
}


/* =========================================
   THEME BUTTON
========================================= */

function getThemeButton(
    theme,
    owned,
    selected
) {

    if (selected) {

        return `
            <button
                class="
                    shop-button
                    selected-button
                "
                disabled
            >
                ✓ Equipped
            </button>
        `;
    }


    if (owned) {

        return `
            <button
                class="
                    shop-button
                    select-button
                "
                data-action="select-theme"
                data-id="${theme.id}"
            >
                Equip
            </button>
        `;
    }


    return `
        <button
            class="
                shop-button
                buy-button
            "
            data-action="buy-theme"
            data-id="${theme.id}"
        >
            Buy for 🪙 ${theme.price ?? 225}
        </button>
    `;
}


/* =========================================
   EVENT DELEGATION
========================================= */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const itemId =
            button.dataset.id;


        if (!action || !itemId) {
            return;
        }


        button.disabled = true;


        const originalText =
            button.textContent;


        button.textContent =
            "Please wait...";


        try {

            switch (action) {

                case "buy-symbol":

                    await buySymbol(
                        itemId
                    );

                    break;


                case "select-symbol":

                    await selectSymbol(
                        itemId
                    );

                    break;


                case "buy-theme":

                    await buyTheme(
                        itemId
                    );

                    break;


                case "select-theme":

                    await selectTheme(
                        itemId
                    );

                    break;
            }

        } catch (error) {

            console.error(
                "Shop action error:",
                error
            );


            showToast(
                error.message ||
                "Something went wrong.",
                "error"
            );


            button.disabled = false;

            button.textContent =
                originalText;
        }
    }
);


/* =========================================
   BUY SYMBOL
========================================= */

async function buySymbol(symbol) {

    const data =
        await postRequest(
            "/shop/symbol/buy",
            {
                playerId,
                symbol
            }
        );


    showToast(
        data.message ||
        "Symbol purchased!",
        "success"
    );


    await refreshProfile();
}


/* =========================================
   SELECT SYMBOL
========================================= */

async function selectSymbol(symbol) {

    const data =
        await postRequest(
            "/shop/symbol/select",
            {
                playerId,
                symbol
            }
        );


    showToast(
        data.message ||
        "Symbol equipped!",
        "success"
    );


    await refreshProfile();
}


/* =========================================
   BUY THEME
========================================= */

async function buyTheme(theme) {

    const data =
        await postRequest(
            "/shop/theme/buy",
            {
                playerId,
                theme
            }
        );


    showToast(
        data.message ||
        "Theme purchased!",
        "success"
    );


    await refreshProfile();
}


/* =========================================
   SELECT THEME
========================================= */

async function selectTheme(theme) {

    const data =
        await postRequest(
            "/shop/theme/select",
            {
                playerId,
                theme
            }
        );


    showToast(
        data.message ||
        "Theme equipped!",
        "success"
    );


    await refreshProfile();
}


/* =========================================
   POST REQUEST
========================================= */

async function postRequest(
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


    let data;


    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "Invalid server response"
        );
    }


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
   REFRESH USER
========================================= */

async function refreshProfile() {

    await loadProfile();

    renderShop();
}


/* =========================================
   BALANCE
========================================= */

function updateBalance() {

    if (!balanceElement) {
        return;
    }


    balanceElement.textContent =
        user?.balance ?? 0;
}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    if (!toast) {
        return;
    }


    clearTimeout(toastTimer);


    toast.textContent =
        message;


    toast.className =
        `toast ${type} show`;


    toastTimer =
        setTimeout(() => {

            toast.className =
                "toast";

        }, 2600);
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
   BACK
========================================= */

if (backButton) {

    backButton.addEventListener(
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

initializeShop();