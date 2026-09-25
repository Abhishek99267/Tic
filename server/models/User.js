const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        playerId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        username: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 20
        },

        avatar: {
            type: String,
            default: "avatar-1"
        },

        balance: {
            type: Number,
            default: 10,
            min: 0
        },

        selectedSymbol: {
            type: String,
            default: "cross"
        },

        selectedColor: {
            type: String,
            default: "red"
        },

        selectedTheme: {
            type: String,
            default: "default"
        },

        ownedSymbols: {
            type: [String],
            default: ["cross"]
        },

        ownedThemes: {
            type: [String],
            default: ["default"]
        },

        stats: {
            wins: {
                type: Number,
                default: 0
            },

            losses: {
                type: Number,
                default: 0
            },

            matchesPlayed: {
                type: Number,
                default: 0
            },

            roundsWon: {
                type: Number,
                default: 0
            },

            roundsLost: {
                type: Number,
                default: 0
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("User", UserSchema);