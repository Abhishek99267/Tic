const STARTING_BALANCE = 10;

const WIN_REWARD = 15;

const LOSS_PENALTY = 5;

const SYMBOL_PRICE = 70;

const THEME_PRICE = 225;


const MAX_PLAYERS = 2;

const TOTAL_ROUNDS = 3;

const WINS_REQUIRED = 2;


const SYMBOLS = [

    {
        id: "cross",
        name: "Cross",
        icon: "✕"
    },

    {
        id: "circle",
        name: "Circle",
        icon: "○"
    },

    {
        id: "star",
        name: "Star",
        icon: "★"
    },

    {
        id: "heart",
        name: "Heart",
        icon: "♥"
    },

    {
        id: "fire",
        name: "Fire",
        icon: "🔥"
    },

    {
        id: "lightning",
        name: "Lightning",
        icon: "⚡"
    },

    {
        id: "crown",
        name: "Crown",
        icon: "♛"
    },

    {
        id: "diamond",
        name: "Diamond",
        icon: "◆"
    }

];


const THEMES = [

    {
        id: "default",
        name: "Default",
        price: 0
    },

    {
        id: "neon",
        name: "Neon",
        price: 225
    },

    {
        id: "space",
        name: "Space",
        price: 225
    },

    {
        id: "fire",
        name: "Fire",
        price: 225
    },

    {
        id: "nature",
        name: "Nature",
        price: 225
    }

];


const AVATARS = [
    "avatar-1",
    "avatar-2",
    "avatar-3",
    "avatar-4",
    "avatar-5",
    "avatar-6"
];


module.exports = {

    STARTING_BALANCE,

    WIN_REWARD,

    LOSS_PENALTY,

    SYMBOL_PRICE,

    THEME_PRICE,

    MAX_PLAYERS,

    TOTAL_ROUNDS,

    WINS_REQUIRED,

    SYMBOLS,

    THEMES,

    AVATARS

};