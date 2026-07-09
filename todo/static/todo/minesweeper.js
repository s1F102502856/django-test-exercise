document.addEventListener('DOMContentLoaded', function () {
  const game = {
    rows: 8,
    cols: 12,
    mines: 14,
    board: [],
    revealed: [],
    flagged: [],
    gameOver: false,
  };

  const boardElement = document.getElementById('minesweeper-board');
  const statusElement = document.getElementById('minesweeper-status');
  const resetButton = document.getElementById('minesweeper-reset');

  function initGame() {
    game.gameOver = false;
    game.board = Array.from({ length: game.rows }, () => Array(game.cols).fill(0));
    game.revealed = Array.from({ length: game.rows }, () => Array(game.cols).fill(false));
    game.flagged = Array.from({ length: game.rows }, () => Array(game.cols).fill(false));
    statusElement.textContent = 'Ready to play';
    createBoard();
    placeMines();
    calculateNumbers();
  }

  function createBoard() {
    boardElement.innerHTML = '';
    boardElement.style.gridTemplateColumns = `repeat(${game.cols}, 32px)`;

    for (let row = 0; row < game.rows; row++) {
      for (let col = 0; col < game.cols; col++) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'minesweeper-cell';
        button.dataset.row = row;
        button.dataset.col = col;
        button.addEventListener('click', handleCellClick);
        button.addEventListener('contextmenu', handleCellRightClick);
        boardElement.appendChild(button);
      }
    }
  }

  function placeMines() {
    let placed = 0;
    while (placed < game.mines) {
      const row = Math.floor(Math.random() * game.rows);
      const col = Math.floor(Math.random() * game.cols);
      if (game.board[row][col] !== 'M') {
        game.board[row][col] = 'M';
        placed += 1;
      }
    }
  }

  function calculateNumbers() {
    for (let row = 0; row < game.rows; row++) {
      for (let col = 0; col < game.cols; col++) {
        if (game.board[row][col] === 'M') {
          continue;
        }
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < game.rows && nc >= 0 && nc < game.cols) {
              if (game.board[nr][nc] === 'M') {
                count += 1;
              }
            }
          }
        }
        game.board[row][col] = count;
      }
    }
  }

  function handleCellClick(event) {
    if (game.gameOver) return;
    const row = Number(event.currentTarget.dataset.row);
    const col = Number(event.currentTarget.dataset.col);
    if (game.flagged[row][col]) return;
    revealCell(row, col);
    checkGameStatus();
  }

  function handleCellRightClick(event) {
    event.preventDefault();
    if (game.gameOver) return;
    const row = Number(event.currentTarget.dataset.row);
    const col = Number(event.currentTarget.dataset.col);
    if (game.revealed[row][col]) return;
    game.flagged[row][col] = !game.flagged[row][col];
    updateCellElement(row, col);
  }

  function revealCell(row, col) {
    if (row < 0 || row >= game.rows || col < 0 || col >= game.cols) return;
    if (game.revealed[row][col] || game.flagged[row][col]) return;

    game.revealed[row][col] = true;
    updateCellElement(row, col);

    if (game.board[row][col] === 'M') {
      endGame(false);
      return;
    }

    if (game.board[row][col] === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          revealCell(row + dr, col + dc);
        }
      }
    }
  }

  function updateCellElement(row, col) {
    const index = row * game.cols + col;
    const button = boardElement.children[index];
    const value = game.board[row][col];

    button.classList.toggle('revealed', game.revealed[row][col]);
    button.classList.toggle('flagged', game.flagged[row][col]);

    if (game.revealed[row][col]) {
      button.disabled = true;
      button.textContent = value === 0 ? '' : value === 'M' ? '💣' : value;
      button.classList.add(value === 'M' ? 'mine' : '');
    } else {
      button.disabled = false;
      button.textContent = game.flagged[row][col] ? '🚩' : '';
    }
  }

  function revealAllMines() {
    for (let row = 0; row < game.rows; row++) {
      for (let col = 0; col < game.cols; col++) {
        if (game.board[row][col] === 'M') {
          game.revealed[row][col] = true;
          updateCellElement(row, col);
        }
      }
    }
  }

  function checkGameStatus() {
    if (game.gameOver) return;
    let safeCells = 0;
    for (let row = 0; row < game.rows; row++) {
      for (let col = 0; col < game.cols; col++) {
        if (game.board[row][col] !== 'M' && game.revealed[row][col]) {
          safeCells += 1;
        }
      }
    }
    const totalSafe = game.rows * game.cols - game.mines;
    if (safeCells === totalSafe) {
      endGame(true);
    }
  }

  function endGame(won) {
    game.gameOver = true;
    if (won) {
      statusElement.textContent = 'You win! 🎉';
    } else {
      revealAllMines();
      statusElement.textContent = 'Game over. 💥';
    }
  }

  resetButton.addEventListener('click', function () {
    initGame();
  });

  initGame();
});
