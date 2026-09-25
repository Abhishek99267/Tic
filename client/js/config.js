const APP_CONFIG = {
    API_BASE:
        window.location.hostname === "localhost"
            ? "http://localhost:5000/"
            : "https://tic-t1wc.onrender.com/",

    SOCKET_URL:
        window.location.hostname === "localhost"
            ? "http://localhost:5000/"
            : "https://tic-t1wc.onrender.com/"
};