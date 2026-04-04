"use strict";

(function (G) {
  /**
   * WSS URL для онлайна. Деплой: HTTPS-хостинг для мини-приложения ВК + WSS (тот же домен или отдельный).
   * Локально: ws://localhost:8080. Прод: задать Render/сервер и добавить домен в настройках приложения ВК.
   */
  var GAME_SERVER_URL = "wss://zeroplus-server.onrender.com";

  G.isOnline = function () {
    return Boolean(G.onlineWs && G.onlineWs.readyState === WebSocket.OPEN && G.onlineRole);
  };

  G.disconnectOnlineSession = function () {
    clearSearchTimeout();
    if (G.onlineWs) {
      if (G.onlineWs.readyState === WebSocket.OPEN) {
        try { G.onlineWs.send(JSON.stringify({ type: "leave" })); } catch (e) {}
      }
      try { G.onlineWs.close(); } catch (e2) {}
    } else {
      onWsDisconnected();
    }
  };

  function getPlayerProfile() {
    var playerName = (G.player && G.player.getName) ? G.player.getName() : G.t("guest");
    var playerAvatar = (G.player && G.player.getPhoto) ? G.player.getPhoto("small") : "";
    return { playerName: playerName, playerAvatar: playerAvatar || "" };
  }

  var onlineStatusText, findMatchBtn, inviteFriendBtn, cancelSearchBtn,
    joinCodeInput, joinRoomBtn, roomCodeRow, roomCodeText, copyCodeBtn,
    disconnectOnlineBtn;
  var searchTimeout = null;

  function $(id) { return document.getElementById(id); }

  function initRefs() {
    onlineStatusText = $("onlineStatusText");
    findMatchBtn = $("findMatchBtn");
    inviteFriendBtn = $("inviteFriendBtn");
    cancelSearchBtn = $("cancelSearchBtn");
    joinCodeInput = $("joinCodeInput");
    joinRoomBtn = $("joinRoomBtn");
    roomCodeRow = $("roomCodeRow");
    roomCodeText = $("roomCodeText");
    copyCodeBtn = $("copyCodeBtn");
    disconnectOnlineBtn = $("disconnectOnlineBtn");
  }

  function normalizeJoinCode(raw) {
    return String(raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  }

  function getWsUrl() {
    var params = new URLSearchParams(window.location.search);
    var custom = params.get("ws");
    if (custom) return custom;
    if (window.location.protocol === "file:") return "ws://localhost:8080";
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      return (window.location.protocol === "https:" ? "wss:" : "ws:") + "//" + window.location.host;
    return GAME_SERVER_URL;
  }

  function onWsMessage(event) {
    var data;
    try { data = JSON.parse(event.data); } catch (e) { return; }
    var sock = event.currentTarget;

    if (data.type === "error") {
      if (onlineStatusText) onlineStatusText.textContent = data.message || G.t("roomNotFound");
      if (sock instanceof WebSocket && sock.readyState === WebSocket.OPEN) sock.close();
      return;
    }
    if (data.type === "created") {
      G.onlineRole = "host"; G.myOnlineSymbol = "X";
      G.humanSymbol = "X"; G.robotSymbol = "O";
      if (data.boardSize != null) {
        G.boardSize = G.clampBoardSize(data.boardSize);
        G.winLen = data.winLen != null ? G.clampBoardSize(data.winLen) : G.boardSize;
        G.rebuildWinningLines(); G.syncBoardSizeUI();
      }
      G.waitingForPeer = true; G.updateSideButtons(); G.refreshPlaySideLock();
      if (roomCodeText) roomCodeText.textContent = data.roomId;
      if (roomCodeRow) roomCodeRow.hidden = false;
      if (disconnectOnlineBtn) disconnectOnlineBtn.hidden = false;
      if (onlineStatusText) onlineStatusText.textContent = G.t("waitCode");
      G.resetGameLocal(); G.disableBoard(); G.updateStatus();
      setSearchUI(false);
      return;
    }
    if (data.type === "joined") {
      G.onlineRole = "guest"; G.myOnlineSymbol = "O";
      G.humanSymbol = "O"; G.robotSymbol = "X";
      G.waitingForPeer = false; G.updateSideButtons(); G.refreshPlaySideLock();
      if (disconnectOnlineBtn) disconnectOnlineBtn.hidden = false;
      if (roomCodeRow) roomCodeRow.hidden = true;
      if (onlineStatusText) onlineStatusText.textContent = G.t("inRoom");
      setSearchUI(false);
      return;
    }
    if (data.type === "matched") {
      G.onlineRole = data.role || "host";
      G.myOnlineSymbol = data.yourSymbol || (G.onlineRole === "host" ? "X" : "O");
      G.humanSymbol = G.myOnlineSymbol; G.robotSymbol = G.myOnlineSymbol === "X" ? "O" : "X";
      G.waitingForPeer = false; G.updateSideButtons(); G.refreshPlaySideLock();
      if (disconnectOnlineBtn) disconnectOnlineBtn.hidden = false;
      if (roomCodeRow) roomCodeRow.hidden = true;
      if (onlineStatusText) onlineStatusText.textContent = G.t("peerJoined");
      if (data.opponentName) G.showOpponent(data.opponentName, data.opponentAvatar);
      clearSearchTimeout();
      setSearchUI(false);
      return;
    }
    if (data.type === "peerJoined") {
      G.waitingForPeer = false;
      if (onlineStatusText) onlineStatusText.textContent = G.t("peerJoined");
      if (data.opponentName) G.showOpponent(data.opponentName, data.opponentAvatar);
      G.updateStatus();
      return;
    }
    if (data.type === "guestLeft") {
      G.waitingForPeer = true;
      if (onlineStatusText) onlineStatusText.textContent = G.t("peerLeft");
      G.hideOpponent();
      return;
    }
    if (data.type === "hostLeft") {
      if (onlineStatusText) onlineStatusText.textContent = G.t("hostLeft");
      G.hideOpponent();
      if (sock instanceof WebSocket && sock.readyState === WebSocket.OPEN) sock.close();
      return;
    }
    if (data.type === "sync") {
      G.applyServerSync(data);
    }
  }

  function onWsDisconnected() {
    var was = Boolean(G.onlineRole);
    G.onlineRole = null; G.myOnlineSymbol = null; G.waitingForPeer = false;
    if (roomCodeRow) roomCodeRow.hidden = true;
    if (disconnectOnlineBtn) disconnectOnlineBtn.hidden = true;
    if (was && !G.robotEnabled && onlineStatusText) onlineStatusText.textContent = G.t("disconnected");
    G.humanSymbol = "X"; G.robotSymbol = "O";
    G.updateSideButtons(); G.refreshPlaySideLock(); G.resetGameLocal();
    G.hideOpponent(); setSearchUI(false);
  }

  function connectWebSocket(afterOpen) {
    var prev = G.onlineWs;
    G.onlineRole = null; G.myOnlineSymbol = null; G.waitingForPeer = false;
    if (roomCodeRow) roomCodeRow.hidden = true;
    if (disconnectOnlineBtn) disconnectOnlineBtn.hidden = true;
    if (onlineStatusText) onlineStatusText.textContent = G.t("connecting");

    var ws;
    try { ws = new WebSocket(getWsUrl()); } catch (e) {
      if (onlineStatusText) onlineStatusText.textContent = G.t("noServer");
      return;
    }
    G.onlineWs = ws;
    ws.addEventListener("message", onWsMessage);
    ws.addEventListener("close", function () { if (G.onlineWs !== ws) return; G.onlineWs = null; onWsDisconnected(); });
    ws.addEventListener("error", function () { if (onlineStatusText) onlineStatusText.textContent = G.t("noServer"); });
    ws.addEventListener("open", function () { if (G.onlineWs !== ws) return; if (onlineStatusText) onlineStatusText.textContent = ""; afterOpen(ws); });
    if (prev) prev.close();
  }

  function setSearchUI(searching) {
    if (findMatchBtn) findMatchBtn.hidden = searching;
    if (inviteFriendBtn) inviteFriendBtn.hidden = searching;
    if (cancelSearchBtn) cancelSearchBtn.hidden = !searching;
  }

  function clearSearchTimeout() { if (searchTimeout) { clearTimeout(searchTimeout); searchTimeout = null; } }

  function doFindMatch() {
    if (G.robotEnabled) return;
    setSearchUI(true);
    if (onlineStatusText) onlineStatusText.innerHTML = '<span class="search-spinner"></span>' + G.t("searching");
    connectWebSocket(function (ws) {
      var playerName = (G.player && G.player.getName) ? G.player.getName() : G.t("guest");
      var playerAvatar = (G.player && G.player.getPhoto) ? G.player.getPhoto("small") : "";
      ws.send(JSON.stringify({ type: "findMatch", boardSize: G.boardSize, playerName: playerName, playerAvatar: playerAvatar }));
    });
    clearSearchTimeout();
    searchTimeout = setTimeout(function () {
      if (!G.isOnline() && G.onlineWs && G.onlineWs.readyState === WebSocket.OPEN) {
        if (onlineStatusText) onlineStatusText.textContent = G.t("timeout");
        setSearchUI(false);
      }
    }, 30000);
  }

  function doInviteFriend() {
    if (G.robotEnabled) return;
    var p = getPlayerProfile();
    connectWebSocket(function (ws) {
      ws.send(JSON.stringify({
        type: "create",
        boardSize: G.boardSize,
        playerName: p.playerName,
        playerAvatar: p.playerAvatar
      }));
    });
  }

  function doCancelSearch() {
    clearSearchTimeout();
    if (G.onlineWs && G.onlineWs.readyState === WebSocket.OPEN) {
      try { G.onlineWs.send(JSON.stringify({ type: "leave" })); } catch (e) {}
      G.onlineWs.close();
    }
    setSearchUI(false);
    if (onlineStatusText) onlineStatusText.textContent = "";
  }

  G.onNewGame = function () {
    if (G.isOnline()) { G.onlineWs.send(JSON.stringify({ type: "newGame" })); return; }
    if (!G.robotEnabled) {
      if (G.showInterstitialAd) G.showInterstitialAd(function () { doFindMatch(); });
      else doFindMatch();
      return;
    }
    if (G.showInterstitialAd) G.showInterstitialAd(function () { G.resetGameLocal(); });
    else G.resetGameLocal();
  };

  G.initOnline = function () {
    initRefs();

    if (findMatchBtn) findMatchBtn.addEventListener("click", doFindMatch);
    if (inviteFriendBtn) inviteFriendBtn.addEventListener("click", doInviteFriend);
    if (cancelSearchBtn) cancelSearchBtn.addEventListener("click", doCancelSearch);

    if (joinRoomBtn) joinRoomBtn.addEventListener("click", function () {
      if (G.robotEnabled) return;
      var code = normalizeJoinCode(joinCodeInput.value);
      if (code.length < 4) { if (onlineStatusText) onlineStatusText.textContent = G.t("enterCode"); return; }
      var p = getPlayerProfile();
      connectWebSocket(function (ws) {
        ws.send(JSON.stringify({
          type: "join",
          roomId: code,
          playerName: p.playerName,
          playerAvatar: p.playerAvatar
        }));
      });
    });

    if (joinCodeInput) joinCodeInput.addEventListener("input", function () {
      var c = normalizeJoinCode(joinCodeInput.value);
      if (c !== joinCodeInput.value) joinCodeInput.value = c;
    });

    if (copyCodeBtn) copyCodeBtn.addEventListener("click", function () {
      var code = roomCodeText ? roomCodeText.textContent.trim() : "";
      if (!code) return;
      var text = G.t("roomCode") + ": " + code;
      var joinUrl = (G.getJoinLinkForRoom && G.getJoinLinkForRoom(code)) || "";
      if (joinUrl) text += "\n" + joinUrl;
      navigator.clipboard.writeText(text).then(function () {
        if (onlineStatusText) onlineStatusText.textContent = G.t("copied");
      }).catch(function () {
        if (onlineStatusText) onlineStatusText.textContent = text.replace(/\n/g, " \u00b7 ");
      });
    });

    if (disconnectOnlineBtn) disconnectOnlineBtn.addEventListener("click", function () {
      G.disconnectOnlineSession();
    });

    var joinParam = new URLSearchParams(window.location.search).get("join");
    if (joinParam && joinCodeInput) joinCodeInput.value = normalizeJoinCode(joinParam);

    setSearchUI(false);

    var shareVkBtn = $("shareVkBtn"), inviteVkBtn = $("inviteVkBtn");
    if (shareVkBtn) shareVkBtn.addEventListener("click", function () {
      if (G.shareRoomVk) G.shareRoomVk();
    });
    if (inviteVkBtn) inviteVkBtn.addEventListener("click", function () {
      if (G.inviteFriendsVk) G.inviteFriendsVk();
    });
  };
})(window.Game);
