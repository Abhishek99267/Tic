const generateRoomCode =
    require("../utils/generateRoomCode");


function registerRoomSocket(
    io,
    socket,
    rooms
) {


    // =========================
    // CREATE ROOM
    // =========================

    socket.on(
        "create-room",
        ({ username, playerId }) => {

            try {

                if (!username) {

                    socket.emit(
                        "room-error",
                        {
                            message:
                                "Username is required"
                        }
                    );

                    return;
                }


                if (!playerId) {

                    socket.emit(
                        "room-error",
                        {
                            message:
                                "Player ID is required"
                        }
                    );

                    return;
                }


                let roomCode;


                do {

                    roomCode =
                        generateRoomCode();

                } while (
                    rooms.has(roomCode)
                );


                const player = {

                    id:
                        socket.id,

                    playerId,

                    username
                };


                const room = {

                    roomCode,

                    players: [
                        player
                    ],

                    match: null

                };


                rooms.set(
                    roomCode,
                    room
                );


                socket.join(
                    roomCode
                );


                socket.emit(
                    "room-created",
                    {
                        roomCode,

                        players:
                            room.players
                    }
                );


                console.log(
                    `Room ${roomCode} created by ${username}`
                );


            } catch (error) {

                console.error(
                    "Create room error:",
                    error
                );


                socket.emit(
                    "room-error",
                    {
                        message:
                            "Unable to create room"
                    }
                );
            }
        }
    );


    // =========================
    // JOIN ROOM
    // =========================

    socket.on(
        "join-room",
        ({
            roomCode,
            username,
            playerId
        }) => {

            try {

                if (
                    !roomCode ||
                    !username ||
                    !playerId
                ) {

                    socket.emit(
                        "room-error",
                        {
                            message:
                                "Room code, username and player ID are required"
                        }
                    );

                    return;
                }


                const code =
                    roomCode
                        .trim()
                        .toUpperCase();


                const room =
                    rooms.get(code);


                if (!room) {

                    socket.emit(
                        "room-error",
                        {
                            message:
                                "Room not found"
                        }
                    );

                    return;
                }


                if (
                    room.players.length >= 2
                ) {

                    socket.emit(
                        "room-error",
                        {
                            message:
                                "Room is full"
                        }
                    );

                    return;
                }


                const alreadyJoined =
                    room.players.some(
                        player =>
                            player.playerId ===
                            playerId
                    );


                if (alreadyJoined) {

                    socket.emit(
                        "room-error",
                        {
                            message:
                                "You are already in this room"
                        }
                    );

                    return;
                }


                const player = {

                    id:
                        socket.id,

                    playerId,

                    username

                };


                room.players.push(
                    player
                );


                socket.join(
                    code
                );


                io.to(code).emit(
                    "room-updated",
                    {
                        roomCode:
                            code,

                        players:
                            room.players
                    }
                );


                console.log(
                    `${username} joined room ${code}`
                );


            } catch (error) {

                console.error(
                    "Join room error:",
                    error
                );


                socket.emit(
                    "room-error",
                    {
                        message:
                            "Unable to join room"
                    }
                );
            }
        }
    );


    // =========================
    // DISCONNECT
    // =========================

    socket.on(
        "disconnect",
        () => {

            for (
                const [
                    roomCode,
                    room
                ] of rooms
            ) {

                const index =
                    room.players.findIndex(
                        player =>
                            player.id ===
                            socket.id
                    );


                if (index === -1) {
                    continue;
                }


                room.players.splice(
                    index,
                    1
                );


                io.to(roomCode).emit(
                    "room-updated",
                    {
                        roomCode,

                        players:
                            room.players
                    }
                );


                if (
                    room.players.length === 0
                ) {

                    rooms.delete(
                        roomCode
                    );

                } else {

                    room.match = null;

                }

            }
        }
    );
}


module.exports =
    registerRoomSocket;