const Game = require("../models/Game");


class MatchHistoryManager {

    /* =========================================
       CREATE MATCH HISTORY
    ========================================= */

    static async createMatch(roomCode, players) {

        if (!roomCode) {
            throw new Error(
                "Room code is required"
            );
        }


        if (
            !players ||
            players.length !== 2
        ) {

            throw new Error(
                "Exactly two players are required"
            );
        }


        const game =
            await Game.create({

                roomCode,

                players: players.map(
                    player => ({
                        playerId:
                            player.playerId,

                        username:
                            player.username,

                        avatar:
                            player.avatar,

                        selectedSymbol:
                            player.selectedSymbol,

                        selectedColor:
                            player.selectedColor,

                        selectedTheme:
                            player.selectedTheme
                    })
                ),

                status: "started",

                startedAt: new Date(),

                rounds: []
            });


        return game;
    }


    /* =========================================
       ADD ROUND RESULT
    ========================================= */

    static async addRoundResult(
        gameId,
        roundNumber,
        winner,
        loser = null,
        isDraw = false
    ) {

        const game =
            await Game.findById(gameId);


        if (!game) {

            throw new Error(
                "Game history not found"
            );
        }


        const alreadyExists =
            game.rounds.some(
                round =>
                    round.roundNumber ===
                    roundNumber
            );


        /*
         * Prevent duplicate round history.
         */

        if (alreadyExists) {

            return game;
        }


        game.rounds.push({

            roundNumber,

            winnerPlayerId:
                winner
                    ? winner.playerId
                    : null,

            winnerUsername:
                winner
                    ? winner.username
                    : null,

            isDraw,

            winnerReward:
                winner && !isDraw
                    ? 15
                    : 0,

            loserPenalty:
                loser && !isDraw
                    ? 5
                    : 0
        });


        game.totalRounds =
            game.rounds.length;


        await game.save();


        return game;
    }


    /* =========================================
       COMPLETE MATCH
    ========================================= */

    static async completeMatch(
        gameId,
        winner,
        finalScores
    ) {

        const game =
            await Game.findById(gameId);


        if (!game) {

            throw new Error(
                "Game history not found"
            );
        }


        game.winnerPlayerId =
            winner
                ? winner.playerId
                : null;


        game.winnerUsername =
            winner
                ? winner.username
                : null;


        game.finalScores =
            finalScores || {};


        game.totalRounds =
            game.rounds.length;


        game.status =
            "completed";


        game.completedAt =
            new Date();


        await game.save();


        return game;
    }


    /* =========================================
       ABANDON MATCH
    ========================================= */

    static async abandonMatch(
        gameId
    ) {

        const game =
            await Game.findById(gameId);


        if (!game) {
            return null;
        }


        /*
         * Don't overwrite an already
         * completed match.
         */

        if (
            game.status ===
            "completed"
        ) {

            return game;
        }


        game.status =
            "abandoned";


        game.completedAt =
            new Date();


        await game.save();


        return game;
    }


    /* =========================================
       GET PLAYER HISTORY
    ========================================= */

    static async getPlayerHistory(
        playerId,
        limit = 20
    ) {

        return Game.find({

            "players.playerId":
                playerId

        })
            .sort({
                createdAt: -1
            })
            .limit(limit)
            .lean();
    }


    /* =========================================
       GET MATCH BY ID
    ========================================= */

    static async getMatch(
        gameId
    ) {

        return Game.findById(
            gameId
        ).lean();
    }
}


module.exports =
    MatchHistoryManager;