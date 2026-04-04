"use strict";

(function (G) {
  function tryLineMove(symbol) {
    for (var i = 0; i < G.winningLines.length; i++) {
      var idxs = G.winningLines[i];
      var empties = idxs.filter(function (j) { return G.board[j] === null; });
      var count = idxs.filter(function (j) { return G.board[j] === symbol; }).length;
      if (empties.length === 1 && count === G.winLen - 1) return empties[0];
    }
    return null;
  }

  function pickHeuristicMove() {
    var free = G.board.map(function (v, i) { return v === null ? i : null; }).filter(function (v) { return v !== null; });
    var w = tryLineMove(G.robotSymbol);
    if (w !== null) return w;
    var b = tryLineMove(G.humanSymbol);
    if (b !== null) return b;
    var centers = G.getCenterCellIndices().filter(function (i) { return G.board[i] === null; });
    if (centers.length) return centers[Math.floor(Math.random() * centers.length)];
    var corners = G.getCornerIndices().filter(function (i) { return G.board[i] === null; });
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    return free[Math.floor(Math.random() * free.length)];
  }

  function evaluateState(cells) {
    for (var i = 0; i < G.winningLines.length; i++) {
      var idxs = G.winningLines[i];
      var first = cells[idxs[0]];
      if (!first) continue;
      var win = true;
      for (var j = 1; j < idxs.length; j++) { if (cells[idxs[j]] !== first) { win = false; break; } }
      if (win) return first;
    }
    return cells.every(function (c) { return c !== null; }) ? "draw" : null;
  }

  function minimax(cells, isRobotTurn) {
    var outcome = evaluateState(cells);
    if (outcome === G.robotSymbol) return 10;
    if (outcome === G.humanSymbol) return -10;
    if (outcome === "draw") return 0;
    var available = cells.map(function (v, i) { return v === null ? i : null; }).filter(function (v) { return v !== null; });
    if (isRobotTurn) {
      var best = -Infinity;
      for (var k = 0; k < available.length; k++) { cells[available[k]] = G.robotSymbol; best = Math.max(best, minimax(cells, false)); cells[available[k]] = null; }
      return best;
    }
    var bestMin = Infinity;
    for (var k2 = 0; k2 < available.length; k2++) { cells[available[k2]] = G.humanSymbol; bestMin = Math.min(bestMin, minimax(cells, true)); cells[available[k2]] = null; }
    return bestMin;
  }

  function getBestMoveMinimax() {
    if (G.boardSize !== 3) return pickHeuristicMove();
    var clone = G.board.slice();
    var available = clone.map(function (v, i) { return v === null ? i : null; }).filter(function (v) { return v !== null; });
    var bestMove = available[0], bestScore = -Infinity;
    for (var k = 0; k < available.length; k++) {
      clone[available[k]] = G.robotSymbol;
      var score = minimax(clone, false);
      clone[available[k]] = null;
      if (score > bestScore) { bestScore = score; bestMove = available[k]; }
    }
    return bestMove;
  }

  G.pickRobotMove = function () {
    var free = G.board.map(function (v, i) { return v === null ? i : null; }).filter(function (v) { return v !== null; });
    if (G.robotLevel === "easy") return free[Math.floor(Math.random() * free.length)];
    if (G.robotLevel === "hard" && G.boardSize === 3) return getBestMoveMinimax();
    return pickHeuristicMove();
  };

  G.getHintMove = function () {
    return pickHeuristicMove();
  };
})(window.Game);
