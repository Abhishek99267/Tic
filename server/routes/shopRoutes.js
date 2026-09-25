const express = require("express");

const {
    buySymbol,
    buyTheme,
    selectSymbol,
    selectTheme,
    selectAvatar,
    selectColor
} = require("../controllers/shopController");


const router = express.Router();


router.post(
    "/symbol/buy",
    buySymbol
);


router.post(
    "/theme/buy",
    buyTheme
);


router.post(
    "/symbol/select",
    selectSymbol
);


router.post(
    "/theme/select",
    selectTheme
);


router.post(
    "/avatar/select",
    selectAvatar
);


router.post(
    "/color/select",
    selectColor
);


module.exports = router;