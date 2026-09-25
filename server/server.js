require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");


const connectDB =
    require("./config/db");


const userRoutes =
    require("./routes/userRoutes");

const shopRoutes =
    require("./routes/shopRoutes");

const gameRoutes =
    require("./routes/gameRoutes");


const registerRoomSocket =
    require("./socket/roomSocket");

const registerGameSocket =
    require("./socket/gameSocket");


/* =========================================
   DATABASE
========================================= */

connectDB();


/* =========================================
   EXPRESS APP
========================================= */

const app =
    express();


const server =
    http.createServer(app);


/* =========================================
   CORS
========================================= */

const allowedOrigin =
    process.env.CLIENT_URL ||
    "http://localhost:5500";


app.use(
    cors({
        origin: allowedOrigin,
        credentials: true
    })
);


/* =========================================
   BODY PARSER
========================================= */

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =========================================
   STATIC FRONTEND
========================================= */

/*
 * If you want the Node server to also
 * serve the client folder locally:
 */

app.use(
    express.static(
        path.join(
            __dirname,
            "../client"
        )
    )
);


/* =========================================
   HEALTH CHECK
========================================= */

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Tic Tac Arena server is running",

            status: "online"

        });

    }
);


app.get(
    "/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            status: "healthy",

            service:
                "Tic Tac Arena API"

        });

    }
);


/* =========================================
   API ROUTES
========================================= */

app.use(
    "/api/users",
    userRoutes
);


app.use(
    "/api/shop",
    shopRoutes
);


app.use(
    "/api/games",
    gameRoutes
);


/* =========================================
   SOCKET.IO
========================================= */

const io =
    new Server(
        server,
        {
            cors: {

                origin:
                    allowedOrigin,

                methods: [
                    "GET",
                    "POST"
                ],

                credentials: true
            }
        }
    );


/* =========================================
   IN-MEMORY ROOMS
========================================= */

/*
 * IMPORTANT:
 *
 * MongoDB stores permanent data:
 *
 * - profiles
 * - coins
 * - inventory
 * - match history
 *
 * This Map stores LIVE game state:
 *
 * - room
 * - connected players
 * - current board
 * - current turn
 * - current round
 */

const rooms =
    new Map();


/* =========================================
   SOCKET CONNECTION
========================================= */

io.on(
    "connection",
    socket => {

        console.log(
            `Socket connected: ${socket.id}`
        );


        /*
         * Room management
         */

        registerRoomSocket(
            io,
            socket,
            rooms
        );


        /*
         * Game management
         */

        registerGameSocket(
            io,
            socket,
            rooms
        );


        socket.on(
            "disconnect",
            reason => {

                console.log(
                    `Socket disconnected: ${socket.id}`,
                    reason
                );

            }
        );

    }
);


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(
    (err, req, res, next) => {

        console.error(
            "Server error:",
            err
        );


        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);


/* =========================================
   404 API HANDLER
========================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found"

        });

    }
);


/* =========================================
   START SERVER
========================================= */

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    () => {

        console.log(
            `🚀 Tic Tac Arena server running on port ${PORT}`
        );

        console.log(
            `🌐 Client URL: ${allowedOrigin}`
        );

    }
);