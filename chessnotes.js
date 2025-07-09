//========== Phase 1: Board ==========\\

let activeBoardDiv = null;

document.addEventListener("DOMContentLoaded", () => {
  const boards = document.querySelectorAll(".chessnotes");
  boards.forEach(initBoard);

  // Clickable PGN text
  document.querySelectorAll("[data-move]").forEach(span => {
    span.addEventListener("click", () => {
      const moveText = span.dataset.move.trim();
      const boardId = span.closest("[data-board]")?.dataset.board;
      if (!boardId) return;

      const boardDiv = document.querySelector(`.chessnotes[data-board="${boardId}"]`);
      const textDiv = document.querySelector(`[data-board="${boardId}"][data-moves]`);
      if (!boardDiv || !textDiv) return;

      const allMoves = getMoveList(textDiv.dataset.moves);
      const cleanMove = moveText.replace(/^\d+\.(\.\.)?\s*/, "").replace(/[+#]$/, "");
      const moveIndex = allMoves.findIndex(m => m.replace(/[+#]$/, "") === cleanMove);
      if (moveIndex === -1) return;

      resetBoardToMove(boardDiv, allMoves, moveIndex + 1);
    });
  });
});

document.addEventListener("keydown", (e) => {
  if (!activeBoardDiv) return;

  const boardId = activeBoardDiv.dataset.board;
  const textDiv = document.querySelector(`[data-board="${boardId}"][data-moves]`);
  if (!textDiv) return;

  const allMoves = getMoveList(textDiv.dataset.moves);
  const boardElm = activeBoardDiv.querySelector(".board");
  boardElm.moveIndex ??= 0;

  if (e.key === "ArrowLeft" && boardElm.moveIndex > 0) {
    boardElm.moveIndex--;
  } else if (e.key === "ArrowRight") {
    if (boardElm.moveIndex < allMoves.length) {
      boardElm.moveIndex++;
    } else {
      boardElm.moveIndex = 0;
    }
  } else {
    return;
  }

  const startFEN = activeBoardDiv.dataset.start;
  let boardState = fenToBoard(startFEN);
  let prevState = [...boardState];

  for (let i = 0; i < boardElm.moveIndex; i++) {
    const isWhite = i % 2 === 0;
    prevState = [...boardState];
    boardState = applyMove(allMoves[i], boardState, isWhite);
  }

  const { from, to } = findMoveDiff(prevState, boardState);
  renderBoard(boardElm, boardState, from, to);
});

function initBoard(chessDiv) {
  const startFEN = chessDiv.dataset.start;
  const boardId = chessDiv.dataset.board;
  const textDiv = document.querySelector(`[data-board="${boardId}"][data-moves]`);
  if (!textDiv) return;

  const allMoves = getMoveList(textDiv.dataset.moves);
  let moveIndex = 0;

  const board = document.createElement("div");
  board.classList.add("board");
  chessDiv.innerHTML = "";
  chessDiv.appendChild(board);

  createBoardSquares(board);
  let boardState = fenToBoard(startFEN);
  renderBoard(board, boardState);

  board.addEventListener("click", (e) => {
    // Mark this board as active
    document.querySelectorAll(".chessnotes").forEach(b => b.classList.remove("active"));
    chessDiv.classList.add("active");
    activeBoardDiv = chessDiv;

    const rect = board.getBoundingClientRect();
    const isLeft = e.clientX < rect.left + rect.width / 2;

    if (isLeft && moveIndex > 0) moveIndex--;
    else if (!isLeft && moveIndex < allMoves.length) moveIndex++;
    else if (!isLeft && moveIndex >= allMoves.length) moveIndex = 0;

    let boardState = fenToBoard(startFEN);
    let prevState = [...boardState];

    for (let i = 0; i < moveIndex; i++) {
      const isWhite = i % 2 === 0;
      prevState = [...boardState];
      boardState = applyMove(allMoves[i], boardState, isWhite);
    }

    const { from, to } = findMoveDiff(prevState, boardState);
    renderBoard(board, boardState, from, to);
  });
}

//========== Phase 2: Pieces ==========\\

function createBoardSquares(board) {
  board.innerHTML = "";
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = document.createElement("div");
      square.classList.add("square");
      const isLight = (rank + file) % 2 === 0;
      square.classList.add(isLight ? "light" : "dark");
      board.appendChild(square);
    }
  }
}

function fenToBoard(fen) {
  const board = [];
  const rows = fen.split(" ")[0].split("/");

  rows.forEach(row => {
    for (const char of row) {
      if (isNaN(char)) {
        board.push(char);
      } else {
        for (let i = 0; i < Number(char); i++) board.push("");
      }
    }
  });

  return board;
}

function renderBoard(boardDiv, state, fromIndex = -1, toIndex = -1) {
  const squares = boardDiv.querySelectorAll(".square");
  squares.forEach((square, i) => {
    square.innerHTML = "";
    square.classList.remove("highlight-from", "highlight-to");

    const piece = state[i];
    if (piece) {
      const img = document.createElement("img");
      const folder = piece === piece.toUpperCase() ? "white" : "black";
      const filename = piece.toLowerCase() + ".svg";
      img.src = `chessPieces/${folder}/${filename}`;
      square.appendChild(img);
    }

    if (i === fromIndex) square.classList.add("highlight-from");
    if (i === toIndex)   square.classList.add("highlight-to");
  });
}

//========== Phase 3: Moves ==========\\

function getMoveList(pgn) {
  return pgn.replace(/\d+\./g, "").trim().split(/\s+/);
}

function resetBoardToMove(boardDiv, moves, moveCount) {
  const startFEN = boardDiv.dataset.start;
  let boardState = fenToBoard(startFEN);
  let prevState = [...boardState];

  for (let i = 0; i < moveCount; i++) {
    const isWhite = i % 2 === 0;
    prevState = [...boardState];
    boardState = applyMove(moves[i], boardState, isWhite);
  }

  const boardElm = boardDiv.querySelector(".board");
  const { from, to } = findMoveDiff(prevState, boardState);
  renderBoard(boardElm, boardState, from, to);
}

function moveCastling(state, kFrom, rFrom, kTo, rTo, kCode, rCode) {
  state[squareToIndex(kFrom)] = "";
  state[squareToIndex(rFrom)] = "";
  state[squareToIndex(kTo)] = kCode;
  state[squareToIndex(rTo)] = rCode;
  return state;
}

function applyMove(move, state, isWhite) {
  const newState = [...state];

  if (move === "O-O" || move === "0-0") {
    return isWhite
      ? moveCastling(newState, "e1", "h1", "g1", "f1", "K", "R")
      : moveCastling(newState, "e8", "h8", "g8", "f8", "k", "r");
  }
  if (move === "O-O-O" || move === "0-0-0") {
    return isWhite
      ? moveCastling(newState, "e1", "a1", "c1", "d1", "K", "R")
      : moveCastling(newState, "e8", "a8", "c8", "d8", "k", "r");
  }

  move = move.replace(/[+#]$/, "");
  const promotion = move.includes("=") ? move.split("=")[1][0] : null;
  const destMatch = move.match(/[a-h][1-8](?==|$)/);
  if (!destMatch) return newState;
  const dest = destMatch[0];
  const destIndex = squareToIndex(dest);

  const pieceType = move[0].match(/[KQRBN]/) ? move[0] : "P";
  const pieceCode = isWhite ? pieceType.toUpperCase() : pieceType.toLowerCase();

  let disambiguator = "";
  const moveCore = move.replace(/=.+$/, "").replace(/[+#]$/, "");
  const match = moveCore.match(/^[KQRBN]?([a-h1-8]{0,2})x?[a-h][1-8]$/);
  if (match) disambiguator = match[1];

  const candidates = [];
  for (let i = 0; i < 64; i++) {
    if (state[i] === pieceCode) candidates.push(i);
  }

  const filtered = candidates.filter(index => {
    const square = indexToSquare(index);
    if (!disambiguator) return true;
    if (disambiguator.length === 2) return square === disambiguator;
    if (/[a-h]/.test(disambiguator)) return square[0] === disambiguator;
    if (/[1-8]/.test(disambiguator)) return square[1] === disambiguator;
    return true;
  });

  if (filtered.length === 0) return newState;
  const fromIndex = filtered[0];
  const isCapture = move.includes("x");

  const isPawnMove = pieceType === "P";
  const targetEmpty = state[destIndex] === "";
  const epCaptureIndex = destIndex + (isWhite ? 8 : -8);
  const epVictim = isWhite ? "p" : "P";
  const isEnPassant = (
    isPawnMove && isCapture && targetEmpty &&
    state[epCaptureIndex] === epVictim
  );

  if (isEnPassant) {
    newState[epCaptureIndex] = "";
  }

  newState[fromIndex] = "";
  newState[destIndex] = promotion
    ? (isWhite ? promotion.toUpperCase() : promotion.toLowerCase())
    : pieceCode;

  return newState;
}

function squareToIndex(square) {
  const file = square.charCodeAt(0) - "a".charCodeAt(0);
  const rank = 8 - parseInt(square[1]);
  return rank * 8 + file;
}

function indexToSquare(index) {
  const file = "abcdefgh"[index % 8];
  const rank = 8 - Math.floor(index / 8);
  return `${file}${rank}`;
}

function findMoveDiff(prev, next) {
  let from = -1, to = -1;

  for (let i = 0; i < 64; i++) {
    if (prev[i] !== next[i]) {
      if (prev[i] && !next[i]) from = i;
      else if (!prev[i] && next[i]) to = i;
      else if (prev[i] && next[i] && prev[i] !== next[i]) {
        // Capture case — destination changed ownership
        to = i;
      }
    }
  }

  return { from, to };
}
