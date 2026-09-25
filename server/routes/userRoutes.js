const express = require("express");

const {
    getOrCreateUser,
    getProfile,
    getShopCatalog
} = require("../controllers/userController");


const router = express.Router();


/* =========================================
   CREATE / UPDATE USER
========================================= */

/*
 * POST /api/users
 *
 * Body:
 * {
 *   "playerId": "uuid",
 *   "username": "Abhishek"
 * }
 */

router.post(
    "/",
    getOrCreateUser
);


/* =========================================
   GET PLAYER PROFILE
========================================= */

/*
 * GET /api/users/profile/:playerId
 */

router.get(
    "/profile/:playerId",
    getProfile
);


/* =========================================
   GET SHOP CATALOG
========================================= */

/*
 * GET /api/users/shop
 *
 * Returns:
 * - symbols
 * - themes
 * - avatars
 */

router.get(
    "/shop",
    getShopCatalog
);


module.exports = router;