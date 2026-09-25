class TicTacToe {

    constructor() {
        this.board = Array(9).fill(null);
    }

    reset() {
        this.board = Array(9).fill(null);
    }

    isValidCell(index) {
        return (
            Number.isInteger(index) &&
            index >= 0 &&
            index < 9
        );
    }

    makeMove(index, playerId) {

        if (!this.isValidCell(index)) {
            return {
                success: false,
                message: "Invalid cell"
            };
        }

        if (!playerId) {
            return {
                success: false,
                message: "Invalid player"
            };
        }

        if (this.board[index] !== null) {
            return {
                success: false,
                message: "Cell already occupied"
            };
        }

        this.board[index] = playerId;

        const winner =
            this.checkWinner(playerId);

        if (winner) {
            return {
                success: true,
                winner: playerId,
                draw: false
            };
        }

        const draw =
            this.board.every(
                cell => cell !== null
            );

        if (draw) {
            return {
                success: true,
                winner: null,
                draw: true
            };
        }

        return {
            success: true,
            winner: null,
            draw: false
        };
    }

    checkWinner(playerId) {

        const winningPatterns = [

            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],

            [0, 4, 8],
            [2, 4, 6]

        ];

        return winningPatterns.some(
            pattern =>
                pattern.every(
                    index =>
                        this.board[index] === playerId
                )
        );
    }

    getBoard() {
        return [...this.board];
    }
}

module.exports = TicTacToe;