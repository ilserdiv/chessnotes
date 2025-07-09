# ♟️ ChessNotes

**ChessNotes** is a lightweight static chessboard renderer and PGN visualizer.  
It displays animated chess sequences from custom FEN positions and PGN strings.  
Designed for chess study, endgame notes, and move-by-move visual explanation.

---

## ✅ Features

- Render one or more independent chessboards
- Custom starting positions via FEN
- Move sequences from inline PGN
- Click-based board stepping (left = back, right = forward/reset)
- Keyboard navigation (← previous, → next/reset)
- Clickable PGN text to jump to specific moves
- Supports:
  - Move disambiguation (e.g. `Nbd2`, `R1e2`)
  - Castling (`O-O`, `O-O-O`)
  - Promotions (`e8=Q`)
  - En passant (`exd6`)
- Highlights source and destination squares
- No drag-and-drop or rule validation — pure replay system

---

## 🚀 How to Use

1. Include Files

   ```html
   <link rel="stylesheet" href="chessnotes.css">
   <script src="chessnotes.js"></script>
   ```

2. Add SVG Pieces

   ```
   chessPieces/
   ├── white/
   │   ├── k.svg q.svg r.svg b.svg n.svg p.svg
   └── black/
       ├── k.svg q.svg r.svg b.svg n.svg p.svg
   ```

3. Define a Board

   Use a `<div>` with class `chessnotes` and the following attributes:

   - `data-board` — Unique ID to associate board + moves + notation
   - `data-start` — FEN string to define starting position
   - `data-moves` — PGN string to animate move sequence

   ```html
   <div class="chessnotes"
        data-board="1"
        data-start="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        data-moves="1.e4 e5 2.Nf3 Nc6 3.Bb5 a6">
   </div>
   ```

4. Optional: Add Clickable Notation

   Create a separate container with move spans using `data-move`.  
   Must match the `data-board` of the target board.

   ```html
   <div class="chessnotes-notation" data-board="1">
     <span data-move="1.e4">1.e4</span>
     <span data-move="e5">e5</span>
     <span data-move="2.Nf3">2.Nf3</span>
     <span data-move="Nc6">Nc6</span>
     <span data-move="3.Bb5">3.Bb5</span>
     <span data-move="a6">a6</span>
   </div>
   ```

   Clicking any move will jump the board to that position.
