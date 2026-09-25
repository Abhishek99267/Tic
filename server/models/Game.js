const mongoose = require("mongoose");


/* =========================================
   PLAYER SNAPSHOT
========================================= */

const playerSnapshotSchema =
    new mongoose.Schema(
        {
            playerId: {
                type: String,
                required: true
            },

            username: {
                type: String,
                required: true
            },

            avatar: {
                type: String,
                default: "avatar-1"
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
            }
        },

        {
            _id: false
        }
    );


/* =========================================
   ROUND
========================================= */

const roundSchema =
    new mongoose.Schema(
        {
            roundNumber: {
                type: Number,
                required: true
            },

            winnerPlayerId: {
                type: String,
                default: null
            },

            winnerUsername: {
                type: String,
                default: null
            },

            isDraw: {
                type: Boolean,
                default: false
            },

            winnerReward: {
                type: Number,
                default: 0
            },

            loserPenalty: {
                type: Number,
                default: 0
            }
        },

        {
            _id: false
        }
    );


/* =========================================
   GAME / MATCH
========================================= */

const gameSchema =
    new mongoose.Schema(
        {
            roomCode: {
                type: String,
                required: true,
                index: true
            },

            players: {
                type: [playerSnapshotSchema],
                required: true,

                validate: {
                    validator: function (value) {
                        return value.length === 2;
                    },

                    message:
                        "A game must have exactly two players"
                }
            },

            winnerPlayerId: {
                type: String,
                default: null
            },

            winnerUsername: {
                type: String,
                default: null
            },

            rounds: {
                type: [roundSchema],
                default: []
            },

            finalScores: {
                type: Map,
                of: Number,
                default: {}
            },

            totalRounds: {
                type: Number,
                default: 0
            },

            status: {
                type: String,

                enum: [
                    "started",
                    "completed",
                    "abandoned"
                ],

                default: "started"
            },

            startedAt: {
                type: Date,
                default: Date.now
            },

            completedAt: {
                type: Date,
                default: null
            }
        },

        {
            timestamps: true
        }
    );


module.exports =
    mongoose.model(
        "Game",
        gameSchema
    );