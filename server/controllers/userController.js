const User = require("../models/User");

const {
    SYMBOLS,
    THEMES,
    AVATARS,
    SYMBOL_PRICE,
    THEME_PRICE
} = require("../utils/constants");


/* =========================================
   CREATE / UPDATE USER
========================================= */

const getOrCreateUser = async (req, res) => {

    try {

        const {
            playerId,
            username
        } = req.body;


        if (!playerId) {

            return res.status(400).json({

                success: false,

                message:
                    "Player ID is required"

            });
        }


        if (!username) {

            return res.status(400).json({

                success: false,

                message:
                    "Username is required"

            });
        }


        /*
         * Find existing permanent player.
         */

        let user =
            await User.findOne({
                playerId
            });


        /*
         * Create new player.
         */

        if (!user) {

            user =
                await User.create({

                    playerId,

                    username,

                    balance: 10,

                    avatar: "avatar-1",

                    selectedSymbol: "cross",

                    selectedColor: "red",

                    selectedTheme: "default",

                    ownedSymbols: [
                        "cross"
                    ],

                    ownedThemes: [
                        "default"
                    ],

                    stats: {

                        wins: 0,

                        losses: 0,

                        matchesPlayed: 0,

                        roundsWon: 0,

                        roundsLost: 0

                    }

                });


            return res.status(201).json({

                success: true,

                message:
                    "Player profile created",

                user

            });
        }


        /*
         * Existing player.
         *
         * Update username only.
         */

        user.username =
            username;


        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Player profile loaded",

            user

        });


    } catch (error) {

        console.error(
            "Create/update user error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create player profile"

        });
    }
};


/* =========================================
   GET PROFILE
========================================= */

const getProfile = async (req, res) => {

    try {

        const {
            playerId
        } = req.params;


        if (!playerId) {

            return res.status(400).json({

                success: false,

                message:
                    "Player ID is required"

            });
        }


        const user =
            await User.findOne({
                playerId
            }).lean();


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "Player not found"

            });
        }


        return res.status(200).json({

            success: true,

            user

        });


    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load profile"

        });
    }
};


/* =========================================
   GET SHOP CATALOG
========================================= */

const getShopCatalog = async (req, res) => {

    try {

        /*
         * Add prices to symbols.
         *
         * Cross is the default/free symbol.
         * Other symbols cost 70 points.
         */

        const symbols =
            SYMBOLS.map(symbol => ({

                ...symbol,

                price:
                    symbol.id === "cross"
                        ? 0
                        : SYMBOL_PRICE

            }));


        /*
         * Themes already contain their
         * prices in constants.js.
         *
         * Make sure price is available.
         */

        const themes =
            THEMES.map(theme => ({

                ...theme,

                price:
                    theme.id === "default"
                        ? 0
                        : (
                            theme.price ||
                            THEME_PRICE
                        )

            }));


        return res.status(200).json({

            success: true,

            symbols,

            themes,

            avatars: AVATARS

        });


    } catch (error) {

        console.error(
            "Get shop catalog error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load shop catalog"

        });
    }
};


/* =========================================
   EXPORT
========================================= */

module.exports = {

    getOrCreateUser,

    getProfile,

    getShopCatalog

};