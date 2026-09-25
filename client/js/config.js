const APP_CONFIG = {
    API_BASE:
        window.location.hostname === "localhost"
            ? "http://localhost:5000/api"
            : "https://YOUR-SERVER.onrender.com/api",

    SOCKET_URL:
        window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "https://YOUR-SERVER.onrender.com"
};