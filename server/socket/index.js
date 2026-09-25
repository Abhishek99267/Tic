const registerRoomSocket =
    require("./roomSocket");

const registerGameSocket =
    require("./gameSocket");


const rooms = new Map();


function initializeSocket(io) {

    io.on(
        "connection",
        socket => {

            console.log(
                "Player connected:",
                socket.id
            );


            registerRoomSocket(
                io,
                socket,
                rooms
            );


            registerGameSocket(
                io,
                socket,
                rooms
            );

        }
    );

}


module.exports = {
    initializeSocket,
    rooms
};