const express = require("express");

const {
    getPlayerMatchHistory,
    getMatchById
} = require("../controllers/gameController");


const router =
    express.Router();


/*
 * GET:
 * /api/games/history/:playerId
 */

router.get(
    "/history/:playerId",
    getPlayerMatchHistory
);


/*
 * GET:
 * /api/games/:gameId
 */

router.get(
    "/:gameId",
    getMatchById
);


module.exports = router;