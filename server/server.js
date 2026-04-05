"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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

/* ---- VK leaderboard API (проверка подписи launch params, см. README) ---- */
const LB_VK_PATH = "/api/lb/vk";
const LB_VK_FILE = path.join(__dirname, "lb-vk.json");
const VK_PROTECTED_KEY = String(process.env.VK_PROTECTED_KEY || "").trim();
const LB_VK_MAX_BODY = 65536;

function lbSendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function lbCorsPreflight(res) {
  res.writeHead(204, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  });
  res.end();
}

function vkBuildSignString(params) {
  return Object.keys(params)
    .filter((k) => k !== "sign" && k.startsWith("vk_"))
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("");
}

function verifyVkLaunchSign(params, secret) {
  if (!secret || !params || typeof params !== "object") return false;
  const sign = params.sign;
  if (!sign || typeof sign !== "string") return false;
  const s = vkBuildSignString(params);
  const h = crypto.createHash("md5").update(s + secret).digest("hex");
  return h === sign;
}

let lbVkData = { users: {} };
function loadLbVkFile() {
  try {
    const raw = fs.readFileSync(LB_VK_FILE, "utf8");
    const j = JSON.parse(raw);
    if (j && j.users && typeof j.users === "object") lbVkData = j;
  } catch {
    lbVkData = { users: {} };
  }
}

function saveLbVkFile() {
  try {
    fs.writeFileSync(LB_VK_FILE, JSON.stringify(lbVkData), "utf8");
  } catch {
    /* ephemeral FS и т.п. */
  }
}

loadLbVkFile();

const lbSubmitLast = new Map();

function handleLbVkGet(res, limit) {
  const users = Object.entries(lbVkData.users || {}).map(([id, row]) => ({
    vkUserId: id,
    name: (row && row.name) || "Player",
    score: Math.max(0, Math.floor(Number((row && row.wins) || 0))),
    avatar: (row && row.avatar) || ""
  }));
  users.sort((a, b) => b.score - a.score || String(a.vkUserId).localeCompare(String(b.vkUserId)));
  const top = users.slice(0, limit).map((u, i) => ({
    rank: i + 1,
    name: u.name,
    score: u.score,
    avatar: u.avatar,
    vkUserId: u.vkUserId
  }));
  lbSendJson(res, 200, { entries: top });
}

function readReqBody(req, maxLen) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let len = 0;
    req.on("data", (ch) => {
      len += ch.length;
      if (len > maxLen) {
        reject(new Error("too_large"));
        return;
      }
      chunks.push(ch);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function handleLbVkPost(req, res) {
  readReqBody(req, LB_VK_MAX_BODY)
    .then((raw) => {
      if (!VK_PROTECTED_KEY) {
        lbSendJson(res, 503, { error: "leaderboard_disabled", message: "Set VK_PROTECTED_KEY" });
        return;
      }
      let body;
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        lbSendJson(res, 400, { error: "bad_json" });
        return;
      }
      const params = body.params;
      if (!params || typeof params !== "object") {
        lbSendJson(res, 400, { error: "missing_params" });
        return;
      }
      if (!verifyVkLaunchSign(params, VK_PROTECTED_KEY)) {
        lbSendJson(res, 403, { error: "bad_sign" });
        return;
      }
      const uid = String(params.vk_user_id || "").trim();
      if (!uid) {
        lbSendJson(res, 400, { error: "missing_vk_user_id" });
        return;
      }
      const now = Date.now();
      const last = lbSubmitLast.get(uid) || 0;
      if (now - last < 1500) {
        lbSendJson(res, 429, { error: "rate_limit" });
        return;
      }
      lbSubmitLast.set(uid, now);
      if (!lbVkData.users) lbVkData.users = {};
      const prev = lbVkData.users[uid] || { wins: 0, name: "", avatar: "" };
      const wins = Math.max(0, Math.floor(Number(prev.wins) || 0)) + 1;
      const name = typeof body.name === "string" ? body.name.slice(0, 120) : prev.name;
      const photo =
        typeof body.photo === "string" && /^https?:\/\//i.test(body.photo)
          ? body.photo.slice(0, 512)
          : prev.avatar;
      lbVkData.users[uid] = {
        wins,
        name: name || prev.name || "Player",
        avatar: photo || prev.avatar || "",
        updated: now
      };
      saveLbVkFile();
      lbSendJson(res, 200, { ok: true, wins });
    })
    .catch((err) => {
      if (err && err.message === "too_large") lbSendJson(res, 413, { error: "payload_too_large" });
      else lbSendJson(res, 500, { error: "server" });
    });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = new URL(req.url || "/", "http://127.0.0.1").pathname;
  } catch {
    pathname = "/";
  }

  if (pathname === LB_VK_PATH) {
    if (req.method === "OPTIONS") {
      lbCorsPreflight(res);
      return;
    }
    if (req.method === "GET") {
      let lim = 30;
      try {
        const sp = new URL(req.url || "/", "http://127.0.0.1").searchParams.get("limit");
        const n = parseInt(sp, 10);
        if (!Number.isNaN(n)) lim = Math.min(100, Math.max(1, n));
      } catch {
        /* keep default */
      }
      handleLbVkGet(res, lim);
      return;
    }
    if (req.method === "POST") {
      handleLbVkPost(req, res);
      return;
    }
    lbSendJson(res, 405, { error: "method" });
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405);
    res.end();
    return;
  }

  const urlPath = pathname;
  let filePath;
  if (urlPath === "/" || urlPath === "/index.html") filePath = indexPath;
  else filePath = path.join(staticBase, urlPath);

  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(staticBase))) {
    res.writeHead(403);
    res.end();
    return;
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(resolved, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
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
