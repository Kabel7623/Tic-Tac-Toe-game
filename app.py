from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # Allow frontend to connect

class TicTacToe:
    def __init__(self):
        self.board = [None] * 9
        self.player_turn = 'X'

    def available_moves(self):
        return [i for i, spot in enumerate(self.board) if spot is None]

    def make_move(self, position, player):
        if self.board[position] is None:
            self.board[position] = player
            return True
        return False

    def check_winner(self):
        lines = [
            (0, 1, 2), (3, 4, 5), (6, 7, 8),
            (0, 3, 6), (1, 4, 7), (2, 5, 8),
            (0, 4, 8), (2, 4, 6)
        ]
        for a, b, c in lines:
            if self.board[a] == self.board[b] == self.board[c] and self.board[a] is not None:
                return self.board[a]
        if all(spot is not None for spot in self.board):
            return 'Tie'
        return None

    def ai_move(self):
        available = self.available_moves()
        if available:
            return random.choice(available)
        return None

game = TicTacToe()

@app.route("/")
def home():
    return "Tic-Tac-Toe API is running. Use the frontend to play."

@app.route("/move", methods=["POST"])
def make_move():
    data = request.json
    print("Received data:", data)  # Debugging statement

    position = int(data["position"])
    player = data["player"]

    if game.make_move(position, player):
        winner = game.check_winner()
        if winner:
            return jsonify({"winner": winner, "board": game.board})

        # AI move
        ai_pos = game.ai_move()
        if ai_pos is not None:
            game.make_move(ai_pos, "O")
            winner = game.check_winner()
            return jsonify({"winner": winner, "board": game.board, "ai_move": ai_pos})

    return jsonify({"error": "Invalid move"})

@app.route("/reset", methods=["POST"])
def reset_game():
    global game
    game = TicTacToe()
    return jsonify({"message": "Game Reset", "board": game.board})

if __name__ == "__main__":
    app.run(debug=True)
