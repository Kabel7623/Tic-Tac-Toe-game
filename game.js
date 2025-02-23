const board = document.getElementById("board");
const statusDisplay = document.getElementById("status");
const resetButton = document.getElementById("reset");

let currentPlayer = "X";
let gameState = Array(9).fill(null);

board.addEventListener("click", handleCellClick);
resetButton.addEventListener("click", resetGame);

async function handleCellClick(event) {
    const clickedCell = event.target;
    if (!clickedCell.classList.contains("cell")) return;

    const clickedIndex = parseInt(clickedCell.getAttribute("data-cell-index"));

    if (gameState[clickedIndex] !== null) return; // Ignore if already filled

    // Update UI immediately
    gameState[clickedIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;

    console.log(`Cell clicked: ${clickedIndex}, Player: ${currentPlayer}`);

    try {
        const response = await fetch("http://127.0.0.1:5000/move", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ position: clickedIndex, player: currentPlayer })
        });

        const data = await response.json();

        if (data.winner) {
            statusDisplay.innerText = `${data.winner} Wins!`;
            board.removeEventListener("click", handleCellClick); // Stop further clicks
            return;
        }

        if (data.ai_move !== undefined) {
            gameState[data.ai_move] = "O";
            document.querySelector(`[data-cell-index='${data.ai_move}']`).innerText = "O";
        }

        if (!gameState.includes(null)) {
            statusDisplay.innerText = "It's a tie!";
            return;
        }

        currentPlayer = "X";
        statusDisplay.innerText = `Your Turn (X)`;

    } catch (error) {
        console.error("Error communicating with server:", error);
        statusDisplay.innerText = "Error connecting to server!";
    }
}

async function resetGame() {
    try {
        const response = await fetch("http://127.0.0.1:5000/reset", { method: "POST" });
        const data = await response.json();
        
        gameState = Array(9).fill(null);
        document.querySelectorAll(".cell").forEach(cell => cell.innerText = "");
        currentPlayer = "X";
        statusDisplay.innerText = "Your Turn (X)";
        board.addEventListener("click", handleCellClick);
        
        console.log("Game reset:", data.message);
    } catch (error) {
        console.error("Error resetting game:", error);
    }
}
