const crypto = require("crypto");

function generatePlayerId() {

    return crypto.randomUUID();
}

module.exports = generatePlayerId;