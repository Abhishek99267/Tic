const User = require("../models/User");

const {
    WIN_REWARD,
    LOSS_PENALTY
} = require("../utils/constants");


class RewardManager {

    /* =========================================
       AWARD ROUND RESULT
    ========================================= */

    static async awardRoundResult(
        winnerPlayer,
        loserPlayer
    ) {

        if (
            !winnerPlayer ||
            !loserPlayer
        ) {

            throw new Error(
                "Winner and loser are required"
            );
        }


        /*
         * IMPORTANT:
         * Use permanent MongoDB playerId,
         * NOT socket.id.
         */

        const winner =
            await User.findOne({
                playerId:
                    winnerPlayer.playerId
            });


        const loser =
            await User.findOne({
                playerId:
                    loserPlayer.playerId
            });


        if (!winner) {

            throw new Error(
                `Winner profile not found: ${winnerPlayer.playerId}`
            );
        }


        if (!loser) {

            throw new Error(
                `Loser profile not found: ${loserPlayer.playerId}`
            );
        }


        /* =====================================
           WINNER
        ====================================== */

        winner.balance +=
            WIN_REWARD;

        winner.stats.roundsWon += 1;


        /* =====================================
           LOSER
        ====================================== */

        loser.balance =
            Math.max(
                0,
                loser.balance -
                LOSS_PENALTY
            );

        loser.stats.roundsLost += 1;


        /* =====================================
           SAVE
        ====================================== */

        await winner.save();

        await loser.save();


        /* =====================================
           RESPONSE
        ====================================== */

        return {

            winner: {

                playerId:
                    winner.playerId,

                username:
                    winner.username,

                reward:
                    WIN_REWARD,

                balance:
                    winner.balance,

                roundsWon:
                    winner.stats.roundsWon,

                roundsLost:
                    winner.stats.roundsLost
            },


            loser: {

                playerId:
                    loser.playerId,

                username:
                    loser.username,

                penalty:
                    LOSS_PENALTY,

                balance:
                    loser.balance,

                roundsWon:
                    loser.stats.roundsWon,

                roundsLost:
                    loser.stats.roundsLost
            }
        };
    }



    /* =========================================
       DRAW
    ========================================= */

    static async recordDraw() {

        return {

            reward: 0,

            penalty: 0,

            message:
                "Draw - no points gained or lost"
        };
    }



    /* =========================================
       MATCH COMPLETED
    ========================================= */

    static async recordMatchCompletion(
        players
    ) {

        if (
            !players ||
            players.length !== 2
        ) {

            throw new Error(
                "Exactly two players are required"
            );
        }


        const results = [];


        for (
            const player
            of players
        ) {

            const user =
                await User.findOne({
                    playerId:
                        player.playerId
                });


            if (!user) {
                continue;
            }


            user.stats.matchesPlayed += 1;


            await user.save();


            results.push({

                playerId:
                    user.playerId,

                username:
                    user.username,

                matchesPlayed:
                    user.stats.matchesPlayed
            });
        }


        return results;
    }



    /* =========================================
       GET PLAYER ECONOMY
    ========================================= */

    static async getEconomy(
        playerId
    ) {

        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            throw new Error(
                "Player not found"
            );
        }


        return {

            playerId:
                user.playerId,

            username:
                user.username,

            balance:
                user.balance,

            stats: {

                wins:
                    user.stats.wins,

                losses:
                    user.stats.losses,

                matchesPlayed:
                    user.stats.matchesPlayed,

                roundsWon:
                    user.stats.roundsWon,

                roundsLost:
                    user.stats.roundsLost
            }
        };
    }
}


module.exports =
    RewardManager;