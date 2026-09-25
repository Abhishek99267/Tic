const User = require("../models/User");
const MatchManager = require("../game/MatchManager");
const RewardManager = require("../game/RewardManager");
const MatchHistoryManager = require("../game/MatchHistoryManager");


function registerGameSocket(io, socket, rooms) {

    /* =========================================
       START GAME
    ========================================= */

    socket.on("start-game", async ({ roomCode }) => {

        try {

            const room = rooms.get(roomCode);

            if (!room) {
                socket.emit("game-error", {
                    message: "Room not found"
                });
                return;
            }


            /*
             * Only first player / host can start.
             */

            if (room.players[0].id !== socket.id) {

                socket.emit("game-error", {
                    message: "Only the host can start the game"
                });

                return;
            }


            if (room.players.length !== 2) {

                socket.emit("game-error", {
                    message: "Two players are required"
                });

                return;
            }


            if (room.match) {

                socket.emit("game-error", {
                    message: "Game has already started"
                });

                return;
            }


            /*
             * Load both permanent player profiles.
             */

            const playerProfiles =
                await Promise.all(
                    room.players.map(
                        player =>
                            User.findOne({
                                playerId:
                                    player.playerId
                            })
                    )
                );


            if (
                playerProfiles.some(
                    profile => !profile
                )
            ) {

                socket.emit("game-error", {
                    message:
                        "Player profile not found"
                });

                return;
            }


            /*
             * Add profile customization
             * to realtime player object.
             */

            room.players =
                room.players.map(
                    (player, index) => {

                        const profile =
                            playerProfiles[index];

                        return {

                            id: player.id,

                            playerId:
                                player.playerId,

                            username:
                                profile.username,

                            avatar:
                                profile.avatar,

                            selectedSymbol:
                                profile.selectedSymbol,

                            selectedColor:
                                profile.selectedColor,

                            selectedTheme:
                                profile.selectedTheme
                        };
                    }
                );


            /*
             * Create in-memory game.
             */

            room.match =
                new MatchManager(
                    room.players[0],
                    room.players[1]
                );


            /*
             * Create MongoDB match history.
             */

            const history =
                await MatchHistoryManager.createMatch(
                    roomCode,
                    room.players
                );


            room.matchHistoryId =
                history._id;


            /*
             * Start game.
             */

            const state =
                room.match.start();


            io.to(roomCode).emit(
                "game-started",
                state
            );


            console.log(
                `Game started in room ${roomCode}`
            );

        } catch (error) {

            console.error(
                "Start game error:",
                error
            );


            socket.emit("game-error", {
                message:
                    error.message ||
                    "Unable to start game"
            });
        }
    });


    /* =========================================
       MAKE MOVE
    ========================================= */

    socket.on(
        "make-move",
        async ({ roomCode, cellIndex }) => {

            try {

                const room =
                    rooms.get(roomCode);


                if (!room) {

                    socket.emit("game-error", {
                        message:
                            "Room not found"
                    });

                    return;
                }


                if (!room.match) {

                    socket.emit("game-error", {
                        message:
                            "Game has not started"
                    });

                    return;
                }


                /*
                 * Validate cell index.
                 */

                const index =
                    Number(cellIndex);


                if (
                    !Number.isInteger(index) ||
                    index < 0 ||
                    index > 8
                ) {

                    socket.emit("game-error", {
                        message:
                            "Invalid board position"
                    });

                    return;
                }


                /*
                 * Server-authoritative move.
                 */

                const result =
                    room.match.makeMove(
                        socket.id,
                        index
                    );


                /*
                 * Send latest state
                 * to both players.
                 */

                io.to(roomCode).emit(
                    "game-state",
                    result.state
                );


                /* =================================
                   ROUND COMPLETED
                ================================= */

                if (
                    result.type ===
                    "round-complete"
                ) {

                    const winner =
                        result.roundWinner;


                    const loser =
                        room.match.players.find(
                            player =>
                                player.id !==
                                winner.id
                        );


                    /*
                     * Award points.
                     */

                    const reward =
                        await RewardManager
                            .awardRoundResult(
                                winner,
                                loser
                            );


                    /*
                     * Save round history.
                     */

                    const roundNumber =
                        result.state.game
                            .currentRound;


                    await MatchHistoryManager
                        .addRoundResult(
                            room.matchHistoryId,
                            roundNumber,
                            winner,
                            loser,
                            false
                        );


                    /*
                     * Send reward separately
                     * to each player.
                     */

                    io.to(winner.id).emit(
                        "round-reward",
                        {
                            type: "win",
                            reward:
                                reward.winner.reward,
                            balance:
                                reward.winner.balance,
                            roundsWon:
                                reward.winner.roundsWon,
                            roundsLost:
                                reward.winner.roundsLost
                        }
                    );


                    io.to(loser.id).emit(
                        "round-reward",
                        {
                            type: "loss",
                            penalty:
                                reward.loser.penalty,
                            balance:
                                reward.loser.balance,
                            roundsWon:
                                reward.loser.roundsWon,
                            roundsLost:
                                reward.loser.roundsLost
                        }
                    );


                    /*
                     * MATCH COMPLETED
                     */

                    if (result.matchFinished) {

                        /*
                         * Convert socket IDs
                         * into permanent player IDs.
                         */

                        const finalScores = {};

                        for (
                            const player
                            of room.match.players
                        ) {

                            const score =
                                result.state.game
                                    .scores[player.id] || 0;


                            finalScores[
                                player.playerId
                            ] = score;
                        }


                        /*
                         * Update match statistics.
                         */

                        await RewardManager
                            .recordMatchCompletion(
                                room.match.players
                            );


                        /*
                         * Update winner/loser
                         * stats.
                         */

                        await updateMatchWinLossStats(
                            result.matchWinner,
                            loser
                        );


                        /*
                         * Save completed match.
                         */

                        const completedGame =
                            await MatchHistoryManager
                                .completeMatch(
                                    room.matchHistoryId,
                                    result.matchWinner,
                                    finalScores
                                );


                        /*
                         * Notify both players.
                         */

                        io.to(roomCode).emit(
                            "match-completed",
                            {
                                winner:
                                    result.matchWinner,

                                finalScores,

                                gameId:
                                    completedGame._id
                            }
                        );


                        console.log(
                            `Match completed in room ${roomCode}`
                        );
                    }


                    return;
                }


                /* =================================
                   DRAW
                ================================= */

                if (
                    result.type ===
                    "draw"
                ) {

                    const drawReward =
                        await RewardManager
                            .recordDraw();


                    /*
                     * Save draw in history.
                     */

                    const roundNumber =
                        result.state.game
                            .currentRound;


                    await MatchHistoryManager
                        .addRoundResult(
                            room.matchHistoryId,
                            roundNumber,
                            null,
                            null,
                            true
                        );


                    io.to(roomCode).emit(
                        "round-reward",
                        {
                            type: "draw",
                            reward:
                                drawReward.reward,
                            penalty:
                                drawReward.penalty,
                            message:
                                drawReward.message
                        }
                    );


                    return;
                }

            } catch (error) {

                console.error(
                    "Make move error:",
                    error
                );


                socket.emit("game-error", {
                    message:
                        error.message ||
                        "Unable to make move"
                });
            }
        }
    );


    /* =========================================
       NEXT ROUND
    ========================================= */

    socket.on(
        "next-round",
        ({ roomCode }) => {

            try {

                const room =
                    rooms.get(roomCode);


                if (!room) {

                    socket.emit("game-error", {
                        message:
                            "Room not found"
                    });

                    return;
                }


                if (!room.match) {

                    socket.emit("game-error", {
                        message:
                            "Game has not started"
                    });

                    return;
                }


                /*
                 * Only allow next round after
                 * current round has finished.
                 */

                if (
                    !room.match.roundManager
                        .roundFinished
                ) {

                    socket.emit("game-error", {
                        message:
                            "Current round is still active"
                    });

                    return;
                }


                if (
                    room.match.roundManager
                        .matchFinished
                ) {

                    socket.emit("game-error", {
                        message:
                            "Match has already finished"
                    });

                    return;
                }


                const state =
                    room.match.nextRound();


                io.to(roomCode).emit(
                    "round-started",
                    state
                );


            } catch (error) {

                console.error(
                    "Next round error:",
                    error
                );


                socket.emit("game-error", {
                    message:
                        error.message ||
                        "Unable to start next round"
                });
            }
        }
    );


    /* =========================================
       LEAVE GAME
    ========================================= */

    socket.on(
        "leave-game",
        async ({ roomCode }) => {

            await handlePlayerLeave(
                io,
                socket,
                rooms,
                roomCode
            );
        }
    );


    /* =========================================
       DISCONNECT
    ========================================= */

    socket.on(
        "disconnect",
        async () => {

            /*
             * Find room containing this socket.
             */

            for (
                const [roomCode, room]
                of rooms
            ) {

                const player =
                    room.players.find(
                        p =>
                            p.id === socket.id
                    );


                if (!player) {
                    continue;
                }


                await handlePlayerLeave(
                    io,
                    socket,
                    rooms,
                    roomCode
                );


                break;
            }
        }
    );
}


/* =============================================
   PLAYER LEAVE HELPER
============================================= */

async function handlePlayerLeave(
    io,
    socket,
    rooms,
    roomCode
) {

    try {

        const room =
            rooms.get(roomCode);


        if (!room) {
            return;
        }


        const leavingPlayer =
            room.players.find(
                player =>
                    player.id === socket.id
            );


        if (!leavingPlayer) {
            return;
        }


        /*
         * If a match is active and has not
         * completed, mark history abandoned.
         */

        if (
            room.match &&
            room.matchHistoryId &&
            !room.match.roundManager
                .matchFinished
        ) {

            await MatchHistoryManager
                .abandonMatch(
                    room.matchHistoryId
                );
        }


        /*
         * Remove player.
         */

        room.players =
            room.players.filter(
                player =>
                    player.id !== socket.id
            );


        /*
         * Tell remaining player.
         */

        socket.to(roomCode).emit(
            "player-left",
            {
                playerId:
                    leavingPlayer.id,

                permanentPlayerId:
                    leavingPlayer.playerId,

                username:
                    leavingPlayer.username
            }
        );


        /*
         * Send updated room state.
         */

        io.to(roomCode).emit(
            "room-updated",
            {
                roomCode,
                players:
                    room.players
            }
        );


        /*
         * Delete empty room.
         */

        if (
            room.players.length === 0
        ) {

            rooms.delete(roomCode);

        } else {

            /*
             * Reset active match because
             * multiplayer game needs 2 players.
             */

            room.match = null;
            room.matchHistoryId = null;
        }


        console.log(
            `${leavingPlayer.username} left room ${roomCode}`
        );

    } catch (error) {

        console.error(
            "Player leave error:",
            error
        );
    }
}


/* =============================================
   MATCH WIN / LOSS STATS
============================================= */

async function updateMatchWinLossStats(
    winner,
    loser
) {

    if (!winner || !loser) {
        return;
    }


    const winnerUser =
        await User.findOne({
            playerId:
                winner.playerId
        });


    const loserUser =
        await User.findOne({
            playerId:
                loser.playerId
        });


    if (winnerUser) {

        winnerUser.stats.wins += 1;

        await winnerUser.save();
    }


    if (loserUser) {

        loserUser.stats.losses += 1;

        await loserUser.save();
    }
}


module.exports =
    registerGameSocket;