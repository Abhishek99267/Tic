const APP_CONFIG = {
    API_BASE:
        window.location.hostname === "localhost"
            ? "https://tic-delta-woad.vercel.app/"
            : "https://tic-t1wc.onrender.com/",

    SOCKET_URL:
        window.location.hostname === "localhost"
            ? "https://tic-delta-woad.vercel.app/"
            : "https://tic-t1wc.onrender.com/"
};