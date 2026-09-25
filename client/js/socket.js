const socket =
    io(APP_CONFIG.SOCKET_URL, {
        transports: [
            "websocket",
            "polling"
        ],

        reconnection: true,

        reconnectionAttempts: 10,

        reconnectionDelay: 1000,

        timeout: 10000
    });


socket.on(
    "connect",
    () => {

        console.log(
            "Connected to game server:",
            socket.id
        );

    }
);


socket.on(
    "disconnect",
    reason => {

        console.log(
            "Disconnected:",
            reason
        );

    }
);


socket.on(
    "connect_error",
    error => {

        console.error(
            "Socket connection error:",
            error.message
        );

    }
);