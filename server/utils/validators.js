function isValidUsername(username) {
    if (typeof username !== "string") {
        return false;
    }

    const trimmed = username.trim();

    return (
        trimmed.length >= 2 &&
        trimmed.length <= 20
    );
}

function isValidSymbol(symbol) {
    const allowedSymbols = [
        "cross",
        "circle",
        "star",
        "heart",
        "fire",
        "lightning",
        "crown",
        "diamond"
    ];

    return allowedSymbols.includes(symbol);
}

function isValidTheme(theme) {
    const allowedThemes = [
        "default",
        "neon",
        "space",
        "fire",
        "nature"
    ];

    return allowedThemes.includes(theme);
}

module.exports = {
    isValidUsername,
    isValidSymbol,
    isValidTheme
};