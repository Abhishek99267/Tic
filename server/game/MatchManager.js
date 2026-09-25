const RoundManager = require("./RoundManager");

class MatchManager {

    constructor(playerOne, playerTwo) {

        if (!playerOne || !playerTwo) {
            throw new Error(
                "Two players are required"
            );
        }

        this.players = [
            this.normalizePlayer(playerOne),
            this.normalizePlayer(playerTwo)
        ];

        this.roundManager =
            new RoundManager(
                this.players[0],
                this.players[1]
            );

        this.started = false;
    }


    /* =========================================
       NORMALIZE PLAYER
    ========================================= */

    normalizePlayer(player) {

        return {

            id: player.id,

            playerId: player.playerId,

            username:
                player.username || "Player",

            avatar:
                player.avatar || "avatar-1",

            selectedSymbol:
                player.selectedSymbol || "cross",

            selectedColor:
                player.selectedColor || "red",

            selectedTheme:
                player.selectedTheme || "default"
        };
    }


    /* =========================================
       START MATCH
    ========================================= */

    start() {

        if (this.started) {

            throw new Error(
                "Game has already started"
            );
        }

        this.started = true;

        return this.getState();
    }


    /* =========================================
       MAKE MOVE
    ========================================= */

    makeMove(playerId, cellIndex) {

        if (!this.started) {

            throw new Error(
                "Game has not started"
            );
        }


        if (
            this.roundManager.matchFinished
        ) {

            throw new Error(
                "Match has already finished"
            );
        }


        if (
            this.roundManager.roundFinished
        ) {

            throw new Error(
                "Current round has finished"
            );
        }


        /*
         * Make sure player belongs
         * to this match.
         */

        const player =
            this.players.find(
                p => p.id === playerId
            );


        if (!player) {

            throw new Error(
                "Player does not belong to this game"
            );
        }


        /*
         * RoundManager handles:
         * - turn validation
         * - cell validation
         * - winner
         * - draw
         */

        const result =
            this.roundManager.makeMove(
                playerId,
                cellIndex
            );


        /* =====================================
           ROUND WIN
        ====================================== */

        if (result.type === "round-complete") {

            return {

                type: "round-complete",

                winner:
                    this.getPlayer(
                        result.winner
                    ),

                roundWinner:
                    this.getPlayer(
                        result.winner
                    ),

                matchWinner:
                    result.matchWinner
                        ? this.getPlayer(
                            result.matchWinner
                        )
                        : null,

                matchFinished:
                    result.matchFinished,

                state:
                    this.getState()
            };
        }


        /* =====================================
           DRAW
        ====================================== */

        if (result.type === "draw") {

            return {

                type: "draw",

                winner: null,

                roundWinner: null,

                matchWinner: null,

                matchFinished: false,

                state:
                    this.getState()
            };
        }


        /* =====================================
           NORMAL MOVE
        ====================================== */

        return {

            type: "move",

            winner: null,

            roundWinner: null,

            matchWinner: null,

            matchFinished: false,

            state:
                this.getState()
        };
    }


    /* =========================================
       NEXT ROUND
    ========================================= */

    nextRound() {

        if (!this.started) {

            throw new Error(
                "Game has not started"
            );
        }


        if (
            this.roundManager.matchFinished
        ) {

            throw new Error(
                "Match has already finished"
            );
        }


        this.roundManager.startNextRound();


        return this.getState();
    }


    /* =========================================
       GET PLAYER
    ========================================= */

    getPlayer(playerId) {

        if (!playerId) {
            return null;
        }


        return (
            this.players.find(
                player =>
                    player.id === playerId
            ) || null
        );
    }


    /* =========================================
       GET PUBLIC PLAYER DATA
    ========================================= */

    getPublicPlayer(player) {

        if (!player) {
            return null;
        }


        return {

            id: player.id,

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
        };
    }


    /* =========================================
       GET GAME STATE
    ========================================= */

    getState() {

        const roundState =
            this.roundManager.getState();


        return {

            started:
                this.started,

            players:
                this.players.map(
                    player =>
                        this.getPublicPlayer(
                            player
                        )
                ),

            game:
                roundState
        };
    }
}


module.exports = MatchManager;