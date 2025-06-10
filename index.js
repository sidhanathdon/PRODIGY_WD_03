// DOM Elements
const gameHome = document.getElementById('game-home');
const gameBoardContainer = document.getElementById('game-board-container');
const cells = document.querySelectorAll('.cell');
const playerTurnDisplay = document.getElementById('player-turn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const startBtn = document.getElementById('start-btn');
const messageOverlay = document.getElementById('message-overlay');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const playAgainBtn = document.getElementById('play-again-btn');
const menuBtn = document.getElementById('menu-btn');
const particlesContainer = document.getElementById('particles');
const aiSettings = document.getElementById('ai-settings');
const playerMode = document.getElementById('player-mode');
const aiMode = document.getElementById('ai-mode');
// Removed tournamentMode because it is unused

// Audio Elements
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');
const aiMoveSound = document.getElementById('ai-move-sound');

// Game State
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let gameMode = 'ai'; // 'ai', 'player', 'tournament'
let aiDifficulty = 'impossible';
let aiPersonality = 'minimax';
let aiStrategy = 'balanced';
let isAgainstComputer = true;

// Initialize particles
function initParticles() {
    particlesContainer.innerHTML = '';
    const colors = [
        'rgba(255, 45, 117, 0.7)', 'rgba(0, 242, 255, 0.7)', 
        'rgba(255, 204, 0, 0.7)', 'rgba(102, 0, 255, 0.7)',
        'rgba(255, 0, 102, 0.7)', 'rgba(0, 255, 204, 0.7)'
    ];
    
    for (let i = 0; i < 150; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
    }
}

// Show game board
function showGameBoard() {
    gameHome.style.display = 'none';
    gameBoardContainer.style.display = 'flex';
    resetGame();
}

// Show home screen
function showHomeScreen() {
    gameBoardContainer.style.display = 'none';
    gameHome.style.display = 'block';
    hideMessage();
}

// Show message
function showMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
    messageOverlay.classList.add('active');
    
    if (title.includes('Win')) {
        winSound.currentTime = 0;
        winSound.play();
        createConfetti();
    } else {
        drawSound.currentTime = 0;
        drawSound.play();
    }
}

// Hide message
function hideMessage() {
    messageOverlay.classList.remove('active');
}

// Create confetti effect
function createConfetti() {
    const colors = [
        '#ff2d75', '#00f2ff', '#ffcc00', 
        '#9900ff', '#00ffcc', '#ff0066'
    ];
    
    for (let i = 0; i < 200; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 15 + 5;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Handle cell click
function handleCellClick(event) {
    const cellIndex = parseInt(event.target.getAttribute('data-index'));

    if (board[cellIndex] !== '' || !isGameActive) return;

    // Play click sound
    clickSound.currentTime = 0;
    clickSound.play();

    makeMove(cellIndex, currentPlayer);
    checkGameStatus();

    if (isGameActive && isAgainstComputer && currentPlayer === 'O') {
        setTimeout(() => {
            makeAiMove();
            checkGameStatus();
        }, 500);
    }
}

// Make a move
function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player);

    // Add animation
    cell.style.animation = 'pulse 0.3s ease';
    setTimeout(() => {
        cell.style.animation = '';
    }, 300);

    currentPlayer = player === 'X' ? 'O' : 'X';
    updatePlayerTurn();
}

// Update player turn display
function updatePlayerTurn() {
    playerTurnDisplay.textContent = `${currentPlayer}'s Turn`;
    playerTurnDisplay.className = `player-turn ${currentPlayer}`;
    
    // Add animation
    playerTurnDisplay.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        playerTurnDisplay.style.animation = '';
    }, 500);
}

// Check game status
function checkGameStatus() {
    const winner = checkWinner();

    if (winner) {
        isGameActive = false;
        const winningCombination = getWinningCombination();
        animateWin(winningCombination);
        showMessage(`${winner} Wins!`, winner === 'X' ? 'Congratulations!' : 'The AI wins again!');
        return;
    }

    if (!board.includes('')) {
        isGameActive = false;
        showMessage("It's a Tie!", 'No one wins this round');
        cells.forEach(cell => cell.classList.add('draw'));
    }
}

// Check for winner
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}

// Get winning combination
function getWinningCombination() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return pattern;
        }
    }

    return [];
}

// Animate winning combination
function animateWin(combination) {
    combination.forEach(index => {
        const cell = cells[index];
        cell.classList.add('winner');
        
        // Add extra glow effect
        const glow = document.createElement('div');
        glow.className = 'win-glow';
        glow.style.position = 'absolute';
        glow.style.width = '100%';
        glow.style.height = '100%';
        glow.style.borderRadius = '15px';
        glow.style.background = `radial-gradient(circle, ${cell.classList.contains('X') ? 'rgba(255, 45, 117, 0.5)' : 'rgba(0, 242, 255, 0.5)'}, transparent 70%)`;
        glow.style.animation = 'pulse 1s infinite';
        cell.appendChild(glow);
    });
}

// Reset game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    updatePlayerTurn();

    // Reset cells
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.style.animation = '';
    });

    // Remove all confetti and win effects
    document.querySelectorAll('.confetti, .win-glow').forEach(el => {
        el.remove();
    });
}

// AI Move functions
function makeAiMove() {
    let move;

    // Play AI move sound
    aiMoveSound.currentTime = 0;
    aiMoveSound.play();

    // Choose move based on AI personality
    switch (aiPersonality) {
        case 'minimax':
            move = getBestMoveUsingMinimax();
            break;
        case 'alphabeta':
            move = getBestMoveUsingAlphaBeta();
            break;
        case 'mcts':
            move = getMoveUsingMCTS();
            break;
        case 'neural':
            move = getMoveUsingNeuralNet();
            break;
        default:
            move = getRandomMove();
    }

    // Apply strategy modifications
    move = applyStrategy(move);

    if (move !== undefined) {
        setTimeout(() => {
            makeMove(move, 'O');
        }, 300);
    }
}

// Apply AI strategy to move
function applyStrategy(move) {
    return move;
}

// Get mistake chance based on difficulty
function getMistakeChance() {
    switch (aiDifficulty) {
        case 'hard': return 0.1;
        default: return 0;
    }
}

// Get available moves
function getAvailableMoves() {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') moves.push(i);
    }
    return moves;
}

// Get random move
function getRandomMove() {
    const availableMoves = getAvailableMoves();
    if (availableMoves.length === 0) return undefined;
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Minimax algorithm
function getBestMoveUsingMinimax() {
    let bestScore = -Infinity;
    let bestMove;

    const availableMoves = getAvailableMoves();

    for (const move of availableMoves) {
        board[move] = 'O';
        const score = minimax(board, 0, false);
        board[move] = '';

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    const winner = checkWinnerOnBoard(board);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (!board.includes('')) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }

        return bestScore;
    }
}

// Check winner on a given board
function checkWinnerOnBoard(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
}

// Get available moves on a given board
function getAvailableMovesOnBoard(board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') moves.push(i);
    }
    return moves;
}

// Event Listeners
startBtn.addEventListener('click', showGameBoard);
restartBtn.addEventListener('click', resetGame);
homeBtn.addEventListener('click', showHomeScreen);
playAgainBtn.addEventListener('click', () => {
    hideMessage();
    resetGame();
});
menuBtn.addEventListener('click', showHomeScreen);
cells.forEach(cell => cell.addEventListener('click', handleCellClick));

aiMode.addEventListener('click', () => {
    gameMode = 'ai';
    isAgainstComputer = true;
    aiSettings.classList.add('active');
    playerMode.classList.remove('active');
    aiMode.classList.add('active');
    // Removed tournamentMode reference here
});

// Initialize the game
function init() {
    initParticles();
    showHomeScreen();
}

// Start the game
init();
