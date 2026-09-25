const TicTacToe = require("./TicTacToe");

class RoundManager {
    constructor(playerOne, playerTwo) {
        this.players = [playerOne, playerTwo];

        this.currentRound = 1;

        this.scores = {
            [playerOne.id]: 0,
            [playerTwo.id]: 0
        };

        this.previousWinner = null;

        // First round player one starts
        this.currentTurn = playerOne.id;

        this.game = new TicTacToe();

        this.roundWinner = null;
        this.roundFinished = false;

        this.matchWinner = null;
        this.matchFinished = false;
    }

    getPlayerById(playerId) {
        return this.players.find(player => player.id === playerId);
    }

    getOpponent(playerId) {
        return this.players.find(player => player.id !== playerId);
    }

    isPlayer(playerId) {
        return this.players.some(player => player.id === playerId);
    }

    recordWinner(playerId) {
        if (!this.isPlayer(playerId)) {
            throw new Error("Invalid player");
        }

        if (this.roundFinished) {
            throw new Error("Round already finished");
        }

        this.roundWinner = playerId;
        this.roundFinished = true;

        this.scores[playerId]++;

        // First to 2 wins the complete match
        if (this.scores[playerId] >= 2) {
            this.matchWinner = playerId;
            this.matchFinished = true;
        }

        this.previousWinner = playerId;

        return {
            roundWinner: playerId,
            matchWinner: this.matchWinner,
            matchFinished: this.matchFinished
        };
    }

    recordDraw() {
        if (this.roundFinished) {
            throw new Error("Round already finished");
        }

        this.roundFinished = true;
        this.roundWinner = null;

        return {
            roundWinner: null,
            matchWinner: null,
            matchFinished: false
        };
    }

    startNextRound() {
        if (this.matchFinished) {
            throw new Error("Match already completed");
        }

        if (!this.roundFinished) {
            throw new Error("Current round is not finished");
        }

        if (this.currentRound >= 3) {
            throw new Error("Maximum rounds reached");
        }

        this.currentRound++;

        this.game = new TicTacToe();

        // Previous round winner gets first turn
        if (this.previousWinner) {
            this.currentTurn = this.previousWinner;
        } else {
            // If previous round was draw,
            // alternate starting player
            const previousStarter = this.currentTurn;

            const opponent = this.getOpponent(previousStarter);

            this.currentTurn = opponent.id;
        }

        this.roundWinner = null;
        this.roundFinished = false;

        return this.getState();
    }

    changeTurn(playerId) {
        const opponent = this.getOpponent(playerId);

        if (!opponent) {
            throw new Error("Opponent not found");
        }

        this.currentTurn = opponent.id;
    }

    getState() {
        return {
            currentRound: this.currentRound,

            scores: {
                ...this.scores
            },

            currentTurn: this.currentTurn,

            roundWinner: this.roundWinner,

            matchWinner: this.matchWinner,

            roundFinished: this.roundFinished,

            matchFinished: this.matchFinished,

            board: [...this.game.board]
        };
    }
}

module.exports = RoundManager;