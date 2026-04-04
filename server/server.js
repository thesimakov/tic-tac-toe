"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = Number(process.env.PORT) || 8080;
const BOARD_MIN = 3;
const BOARD_MAX = 10;
const HEARTBEAT_INTERVAL = 30000;
const IDLE_TIMEOUT = 120000;

function clampBoardSize(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 3;
  return Math.min(BOARD_MAX, Math.max(BOARD_MIN, Math.floor(x)));
}

function buildWinLines(size, winLen) {
  const lines = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c <= size - winLen; c++) {
      const line = [];
      for (let k = 0; k < winLen; k++) line.push(r * size + c + k);
      lines.push(line);
    }
  for (let c = 0; c < size; c++)
    for (let r = 0; r <= size - winLen; r++) {
      const line = [];
      for (let k = 0; k < winLen; k++) line.push((r + k) * size + c);
      lines.push(line);
    }
  for (let r = 0; r <= size - winLen; r++)
    for (let c = 0; c <= size - winLen; c++) {
      const line = [];
      for (let k = 0; k < winLen; k++) line.push((r + k) * size + (c + k));
      lines.push(line);
    }
  for (let r = 0; r <= size - winLen; r++)
    for (let c = winLen - 1; c < size; c++) {
      const line = [];
      for (let k = 0; k < winLen; k++) line.push((r + k) * size + (c - k));
      lines.push(line);
    }
  return lines;
}

function checkWinnerBoard(board, size, winLen) {
  const lines = buildWinLines(size, winLen);
  for (const idxs of lines) {
    const first = board[idxs[0]];
    if (!first) continue;
    if (idxs.every(i => board[i] === first)) return first;
  }
  return null;
}

/** @type {Map<string, object>} */
const rooms = new Map();

/** @type {Map<number, Set<WebSocket>>} matchmaking queues keyed by boardSize */
const matchQueues = new Map();

function genRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  if (rooms.has(s)) return genRoomId();
  return s;
}

function makeSync(room) {
  return {
    type: "sync",
    board: room.board,
    boardSize: room.boardSize,
    winLen: room.winLen,
    currentPlayer: room.currentPlayer,
    gameOver: room.gameOver,
    winner: room.winner,
    opponentName: null,
    opponentAvatar: null
  };
}

function makeSyncFor(room, forSocket) {
  const sync = makeSync(room);
  if (forSocket === room.host && room.guest) {
    sync.opponentName = room.guestName;
    sync.opponentAvatar = room.guestAvatar;
  } else if (forSocket === room.guest && room.host) {
    sync.opponentName = room.hostName;
    sync.opponentAvatar = room.hostAvatar;
  }
  return sync;
}

function broadcast(room, msg, except) {
  const data = JSON.stringify(msg);
  if (room.host && room.host !== except && room.host.readyState === WebSocket.OPEN)
    room.host.send(data);
  if (room.guest && room.guest !== except && room.guest.readyState === WebSocket.OPEN)
    room.guest.send(data);
}

function sendSyncToAll(room) {
  if (room.host && room.host.readyState === WebSocket.OPEN)
    room.host.send(JSON.stringify(makeSyncFor(room, room.host)));
  if (room.guest && room.guest.readyState === WebSocket.OPEN)
    room.guest.send(JSON.stringify(makeSyncFor(room, room.guest)));
}

function resetRoomBoard(room) {
  const n = room.boardSize;
  room.board = Array(n * n).fill(null);
  room.currentPlayer = "X";
  room.gameOver = false;
  room.winner = null;
}

function normalizeRoomId(raw) {
  return String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function removeFromQueue(socket) {
  for (const [size, queue] of matchQueues) {
    if (queue.has(socket)) {
      queue.delete(socket);
      if (queue.size === 0) matchQueues.delete(size);
      return;
    }
  }
}

function tryMatch(boardSize) {
  const queue = matchQueues.get(boardSize);
  if (!queue || queue.size < 2) return;

  const iter = queue.values();
  const p1 = iter.next().value;
  const p2 = iter.next().value;
  queue.delete(p1);
  queue.delete(p2);
  if (queue.size === 0) matchQueues.delete(boardSize);

  const id = genRoomId();
  const winLen = boardSize;
  const room = {
    host: p1, guest: p2,
    boardSize, winLen,
    board: Array(boardSize * boardSize).fill(null),
    currentPlayer: "X", gameOver: false, winner: null,
    hostName: p1.playerName || "Гость",
    hostAvatar: p1.playerAvatar || "",
    guestName: p2.playerName || "Гость",
    guestAvatar: p2.playerAvatar || ""
  };
  rooms.set(id, room);
  p1.roomId = id; p1.role = "host";
  p2.roomId = id; p2.role = "guest";

  if (p1.readyState === WebSocket.OPEN)
    p1.send(JSON.stringify({
      type: "matched", role: "host", roomId: id, yourSymbol: "X",
      boardSize, winLen,
      opponentName: room.guestName, opponentAvatar: room.guestAvatar
    }));
  if (p2.readyState === WebSocket.OPEN)
    p2.send(JSON.stringify({
      type: "matched", role: "guest", roomId: id, yourSymbol: "O",
      boardSize, winLen,
      opponentName: room.hostName, opponentAvatar: room.hostAvatar
    }));

  sendSyncToAll(room);
}

/* ---- HTTP server ---- */
const indexPath = path.join(__dirname, "..", "index.html");
const staticBase = path.join(__dirname, "..");

const MIME = {
  ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];
  if (req.method !== "GET") { res.writeHead(405); res.end(); return; }

  let filePath;
  if (urlPath === "/" || urlPath === "/index.html") filePath = indexPath;
  else filePath = path.join(staticBase, urlPath);

  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(staticBase))) { res.writeHead(403); res.end(); return; }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(resolved, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, {
      "Content-Type": contentType + "; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    });
    res.end(data);
  });
});

/* ---- WebSocket ---- */
const wss = new WebSocket.Server({ server });

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) { ws.terminate(); return; }
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);

wss.on("close", () => clearInterval(heartbeatInterval));

wss.on("connection", (ws) => {
  const socket = ws;
  socket.isAlive = true;
  socket.lastActivity = Date.now();

  socket.on("pong", () => { socket.isAlive = true; socket.lastActivity = Date.now(); });

  socket.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(String(raw)); } catch { return; }
    socket.lastActivity = Date.now();

    /* ---- matchmaking ---- */
    if (msg.type === "findMatch") {
      removeFromQueue(socket);
      const boardSize = clampBoardSize(msg.boardSize);
      socket.playerName = msg.playerName || "Гость";
      socket.playerAvatar = msg.playerAvatar || "";
      if (!matchQueues.has(boardSize)) matchQueues.set(boardSize, new Set());
      matchQueues.get(boardSize).add(socket);
      tryMatch(boardSize);
      return;
    }

    /* ---- create room (invite friend) ---- */
    if (msg.type === "create") {
      removeFromQueue(socket);
      const id = genRoomId();
      const boardSize = clampBoardSize(msg.boardSize);
      const winLen = boardSize;
      const room = {
        host: socket, guest: null, boardSize, winLen,
        board: Array(boardSize * boardSize).fill(null),
        currentPlayer: "X", gameOver: false, winner: null,
        hostName: msg.playerName || socket.playerName || "Гость",
        hostAvatar: msg.playerAvatar || socket.playerAvatar || "",
        guestName: "", guestAvatar: ""
      };
      rooms.set(id, room);
      socket.roomId = id; socket.role = "host";
      socket.send(JSON.stringify({ type: "created", roomId: id, yourSymbol: "X", boardSize, winLen }));
      return;
    }

    /* ---- join room ---- */
    if (msg.type === "join") {
      removeFromQueue(socket);
      const id = normalizeRoomId(msg.roomId);
      const room = rooms.get(id);
      if (!room || room.guest) {
        socket.send(JSON.stringify({ type: "error", message: "Комната не найдена или уже занята" }));
        return;
      }
      room.guest = socket;
      room.guestName = msg.playerName || socket.playerName || "Гость";
      room.guestAvatar = msg.playerAvatar || socket.playerAvatar || "";
      socket.roomId = id; socket.role = "guest";
      socket.send(JSON.stringify({ type: "joined", roomId: id, yourSymbol: "O" }));
      if (room.host && room.host.readyState === WebSocket.OPEN)
        room.host.send(JSON.stringify({
          type: "peerJoined",
          opponentName: room.guestName,
          opponentAvatar: room.guestAvatar
        }));
      sendSyncToAll(room);
      return;
    }

    const room = rooms.get(socket.roomId);
    if (!room) return;

    if (msg.type === "leave") { socket.close(); return; }

    if (msg.type === "newGame") {
      resetRoomBoard(room);
      sendSyncToAll(room);
      return;
    }

    if (msg.type === "move" && typeof msg.index === "number") {
      if (room.gameOver || !room.guest) return;
      const sym = socket.role === "host" ? "X" : "O";
      if (room.currentPlayer !== sym) return;
      const i = msg.index;
      if (i < 0 || i >= room.board.length || room.board[i] !== null) return;
      room.board[i] = sym;
      const w = checkWinnerBoard(room.board, room.boardSize, room.winLen);
      if (w) { room.gameOver = true; room.winner = w; }
      else if (room.board.every(c => c !== null)) { room.gameOver = true; room.winner = null; }
      else room.currentPlayer = sym === "X" ? "O" : "X";
      sendSyncToAll(room);
    }
  });

  socket.on("close", () => {
    removeFromQueue(socket);
    const room = rooms.get(socket.roomId);
    if (!room) return;
    if (socket.role === "host") {
      if (room.guest && room.guest.readyState === WebSocket.OPEN)
        try { room.guest.send(JSON.stringify({ type: "hostLeft" })); } catch {}
      rooms.delete(socket.roomId);
    } else if (socket.role === "guest") {
      room.guest = null; room.guestName = ""; room.guestAvatar = "";
      resetRoomBoard(room);
      if (room.host && room.host.readyState === WebSocket.OPEN) {
        try {
          room.host.send(JSON.stringify({ type: "guestLeft" }));
          room.host.send(JSON.stringify(makeSyncFor(room, room.host)));
        } catch {}
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Игра: http://localhost:${PORT}/  (WebSocket на том же порту)`);
});
