const User = require("../models/User");

const {
    SYMBOL_PRICE,
    THEME_PRICE,
    SYMBOLS,
    THEMES,
    AVATARS
} = require("../utils/constants");


/* =========================================
   BUY SYMBOL
========================================= */

const buySymbol = async (req, res) => {

    try {

        const {
            playerId,
            symbol
        } = req.body;


        if (!playerId || !symbol) {

            return res.status(400).json({
                success: false,
                message:
                    "Player ID and symbol are required"
            });
        }


        const symbolExists =
            SYMBOLS.some(
                item =>
                    item.id === symbol
            );


        if (!symbolExists) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid symbol"
            });
        }


        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "Player not found"
            });
        }


        /*
         * Already owned
         */

        if (
            user.ownedSymbols.includes(symbol)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You already own this symbol"
            });
        }


        /*
         * Balance check
         */

        if (
            user.balance < SYMBOL_PRICE
        ) {

            return res.status(400).json({
                success: false,
                message:
                    `You need ${SYMBOL_PRICE} points`
            });
        }


        /*
         * Purchase
         */

        user.balance -= SYMBOL_PRICE;

        user.ownedSymbols.push(symbol);

        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Symbol purchased successfully",

            balance:
                user.balance,

            ownedSymbols:
                user.ownedSymbols
        });


    } catch (error) {

        console.error(
            "Buy symbol error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to purchase symbol"
        });
    }
};


/* =========================================
   BUY THEME
========================================= */

const buyTheme = async (req, res) => {

    try {

        const {
            playerId,
            theme
        } = req.body;


        if (!playerId || !theme) {

            return res.status(400).json({
                success: false,
                message:
                    "Player ID and theme are required"
            });
        }


        const themeExists =
            THEMES.some(
                item =>
                    item.id === theme
            );


        if (!themeExists) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid theme"
            });
        }


        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "Player not found"
            });
        }


        /*
         * Already owned
         */

        if (
            user.ownedThemes.includes(theme)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You already own this theme"
            });
        }


        /*
         * Balance
         */

        if (
            user.balance < THEME_PRICE
        ) {

            return res.status(400).json({
                success: false,
                message:
                    `You need ${THEME_PRICE} points`
            });
        }


        user.balance -= THEME_PRICE;

        user.ownedThemes.push(theme);

        await user.save();


        return res.status(200).json({

            success: true,

            message:
                "Theme purchased successfully",

            balance:
                user.balance,

            ownedThemes:
                user.ownedThemes
        });


    } catch (error) {

        console.error(
            "Buy theme error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to purchase theme"
        });
    }
};


/* =========================================
   SELECT SYMBOL
========================================= */

const selectSymbol = async (req, res) => {

    try {

        const {
            playerId,
            symbol
        } = req.body;


        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "Player not found"
            });
        }


        if (
            !user.ownedSymbols.includes(symbol)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You do not own this symbol"
            });
        }


        user.selectedSymbol =
            symbol;


        await user.save();


        return res.json({

            success: true,

            message:
                "Symbol selected",

            selectedSymbol:
                user.selectedSymbol
        });


    } catch (error) {

        console.error(
            "Select symbol error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to select symbol"
        });
    }
};


/* =========================================
   SELECT THEME
========================================= */

const selectTheme = async (req, res) => {

    try {

        const {
            playerId,
            theme
        } = req.body;


        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "Player not found"
            });
        }


        if (
            !user.ownedThemes.includes(theme)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You do not own this theme"
            });
        }


        user.selectedTheme =
            theme;


        await user.save();


        return res.json({

            success: true,

            message:
                "Theme selected",

            selectedTheme:
                user.selectedTheme
        });


    } catch (error) {

        console.error(
            "Select theme error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to select theme"
        });
    }
};


/* =========================================
   SELECT AVATAR
========================================= */

const selectAvatar = async (req, res) => {

    try {

        const {
            playerId,
            avatar
        } = req.body;


        if (
            !AVATARS.includes(avatar)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid avatar"
            });
        }


        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "Player not found"
            });
        }


        user.avatar =
            avatar;


        await user.save();


        return res.json({

            success: true,

            message:
                "Avatar updated",

            avatar:
                user.avatar
        });


    } catch (error) {

        console.error(
            "Select avatar error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update avatar"
        });
    }
};


/* =========================================
   SELECT COLOR
========================================= */

const selectColor = async (req, res) => {

    try {

        const {
            playerId,
            color
        } = req.body;


        const allowedColors = [
            "red",
            "blue",
            "green",
            "yellow",
            "purple",
            "orange"
        ];


        if (
            !allowedColors.includes(color)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid color"
            });
        }


        const user =
            await User.findOne({
                playerId
            });


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "Player not found"
            });
        }


        user.selectedColor =
            color;


        await user.save();


        return res.json({

            success: true,

            message:
                "Color updated",

            selectedColor:
                user.selectedColor
        });


    } catch (error) {

        console.error(
            "Select color error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update color"
        });
    }
};


module.exports = {

    buySymbol,
    buyTheme,
    selectSymbol,
    selectTheme,
    selectAvatar,
    selectColor

};