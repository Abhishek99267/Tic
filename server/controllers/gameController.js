const MatchHistoryManager =
    require("../game/MatchHistoryManager");


/* =========================================
   GET PLAYER MATCH HISTORY
========================================= */

const getPlayerMatchHistory =
    async (req, res) => {

        try {

            const { playerId } =
                req.params;


            if (!playerId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Player ID is required"
                });
            }


            const limit =
                Math.min(
                    Number(req.query.limit) || 20,
                    50
                );


            const matches =
                await MatchHistoryManager
                    .getPlayerHistory(
                        playerId,
                        limit
                    );


            return res.status(200).json({

                success: true,

                count:
                    matches.length,

                matches
            });

        } catch (error) {

            console.error(
                "Get match history error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch match history"
            });
        }
    };


/* =========================================
   GET SINGLE MATCH
========================================= */

const getMatchById =
    async (req, res) => {

        try {

            const { gameId } =
                req.params;


            if (!gameId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Game ID is required"
                });
            }


            const match =
                await MatchHistoryManager
                    .getMatch(gameId);


            if (!match) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Match not found"
                });
            }


            return res.status(200).json({

                success: true,

                match
            });

        } catch (error) {

            console.error(
                "Get match error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to fetch match"
            });
        }
    };


module.exports = {

    getPlayerMatchHistory,

    getMatchById
};