"use strict";

(function (G) {
  /* ---- DOM refs ---- */
  var $ = function (id) { return document.getElementById(id); };
  var boardEl = $("board"), statusEl = $("status"),
    resetBtn = $("resetBtn"), newGameBtn = $("newGameBtn"),
    playAsXBtn = $("playAsXBtn"), playAsOBtn = $("playAsOBtn"),
    levelEasyBtn = $("levelEasyBtn"), levelNormalBtn = $("levelNormalBtn"), levelHardBtn = $("levelHardBtn"),
    resultModal = $("resultModal"), modalTitle = $("modalTitle"), modalText = $("modalText"), playAgainBtn = $("playAgainBtn"),
    fireworksConfettiEl = $("fireworksConfetti"), fireworksSparksEl = $("fireworksSparks"),
    celebrationBanner = $("celebrationBanner"), wowLayer = $("wowLayer"),
    difficultySuperWrap = $("difficultySuperWrap"),
    difficultyTrigger = $("difficultyTrigger"), difficultyPopover = $("difficultyPopover"),
    difficultyCurrentLabel = $("difficultyCurrentLabel"),
    boardSizeTrigger = $("boardSizeTrigger"), boardSizePopover = $("boardSizePopover"),
    boardSizeCurrentLabel = $("boardSizeCurrentLabel"), boardSizeOptionsEl = $("boardSizeOptions"),
    hintBtn = $("hintBtn"),
    shopBtn = $("shopBtn"), shopOverlay = $("shopOverlay"), shopItems = $("shopItems"), shopCloseBtn = $("shopCloseBtn"),
    statsWinsEl = $("statsWins"), statsLossesEl = $("statsLosses"), statsDrawsEl = $("statsDraws"),
    leaderboardList = $("leaderboardList"), lbRefreshBtn = $("lbRefreshBtn"),
    leaderboardPanel = $("leaderboardPanel"), lbDrawerBackdrop = $("lbDrawerBackdrop"),
    lbToggleBtn = $("lbToggleBtn"), lbDrawerCloseBtn = $("lbDrawerCloseBtn"),
    adNoticeModal = $("adNoticeModal"), adNoticeText = $("adNoticeText"), adNoticeOkBtn = $("adNoticeOkBtn"),
    userCoinsLabel = $("userCoinsLabel"), coinsValueEl = $("coinsValue"), userCoinsWrap = $("userCoinsWrap"),
    langSelect = $("langSelect"),
    robotModeBtn = $("robotModeBtn"),
    modeDifficultyRow = $("modeDifficultyRow"),
    donateModal = $("donateModal"), donateFabBtn = $("donateFabBtn"),
    donateModalCloseBtn = $("donateModalCloseBtn"), donateVotesGrid = $("donateVotesGrid"),
    profileModal = $("profileModal"), profileModalCloseBtn = $("profileModalCloseBtn"),
    profileModalOkBtn = $("profileModalOkBtn"), userAvatarBtn = $("userAvatarBtn");

  var celebrationTimers = [];

  function syncAdNoticePayControls() {
    var tf = G.t.bind(G);
    var sel = $("adNoticeNoAdsPlan");
    if (sel) {
      sel.setAttribute("aria-label", tf("adPayPlanAria"));
      var ow = sel.querySelector('option[value="week"]');
      var oy = sel.querySelector('option[value="year"]');
      if (ow) ow.textContent = tf("adPayWeekBtn");
      if (oy) oy.textContent = tf("adPayYearBtn");
    }
    if ($("adNoticePayBtn")) $("adNoticePayBtn").textContent = tf("adPaySubmit");
    if ($("adNoticeDisableAdsLabel")) $("adNoticeDisableAdsLabel").textContent = tf("adNoAdsOffer");
  }

  function resetAdNoticePaySection() {
    var cb = $("adNoticeDisableAdsCb");
    var expand = $("adNoticePayExpand");
    var hint = $("adNoticePayHint");
    if (cb) {
      cb.checked = false;
      cb.setAttribute("aria-expanded", "false");
    }
    if (expand) expand.hidden = true;
    if (hint) hint.hidden = true;
  }

  /* ---- board size options ---- */
  for (var sz = 3; sz <= 10; sz++) {
    var opt = document.createElement("button");
    opt.type = "button"; opt.className = "btn board-size-opt";
    opt.dataset.size = String(sz); opt.setAttribute("role", "option");
    opt.setAttribute("aria-selected", "false"); opt.textContent = sz + " \u00d7 " + sz;
    boardSizeOptionsEl.appendChild(opt);
  }

  var WELCOME_SESSION_KEY = "zeroplus_welcome_enter";

  G.syncWelcomeI18n = function () {
    var t = G.t.bind(G);
    if ($("welcomeTitle")) $("welcomeTitle").textContent = t("welcomeTitle");
    if ($("welcomeSub")) $("welcomeSub").textContent = t("welcomeSub");
    if ($("welcomeEnterBtn")) $("welcomeEnterBtn").textContent = t("welcomeEnter");
  };

  /* ---- i18n UI update ---- */
  G.applyI18n = function () {
    var t = G.t.bind(G);
    var root = document.documentElement;
    if (root) root.lang = G.lang || "ru";

    document.title = t("title");
    $("titleText").textContent = t("title");
    playAsXBtn.textContent = t("playAsX"); playAsOBtn.textContent = t("playAsO");
    $("boardSizeTriggerTitle").textContent = t("fieldSize");
    resetBtn.textContent = t("reset");
    newGameBtn.textContent = t("newGame");
    $("diffTriggerTitle").textContent = t("diffTitle");
    levelEasyBtn.textContent = t("easy"); levelNormalBtn.textContent = t("normal"); levelHardBtn.textContent = t("hard");
    playAgainBtn.textContent = t("playAgain");
    celebrationBanner.textContent = t("bannerWin");
    if (hintBtn) hintBtn.textContent = t("hintBtn");
    if (shopBtn) shopBtn.textContent = t("shop");
    if ($("shopCloseBtn")) {
      $("shopCloseBtn").setAttribute("aria-label", t("close"));
      $("shopCloseBtn").setAttribute("title", t("close"));
    }
    if ($("shopCardTitle")) $("shopCardTitle").textContent = t("shop");
    if ($("shopCoinRate")) $("shopCoinRate").textContent = t("shopCoinVoteRate");
    if ($("shopCourierText")) $("shopCourierText").textContent = t("shopCourierNotice");
    if ($("shopVkLink")) {
      $("shopVkLink").textContent = t("subscribeVk");
      $("shopVkLink").setAttribute("aria-label", t("subscribeVk") + " — VK");
    }
    if ($("loginBtn")) $("loginBtn").textContent = t("login");
    if ($("lbTitle")) $("lbTitle").textContent = t("leaderboard");
    if (lbRefreshBtn) lbRefreshBtn.textContent = t("lbRefresh");
    if (lbToggleBtn) {
      lbToggleBtn.setAttribute("aria-label", t("lbToggleAria"));
      lbToggleBtn.setAttribute("title", t("leaderboard"));
    }
    if (lbDrawerCloseBtn) lbDrawerCloseBtn.setAttribute("aria-label", t("close"));
    if ($("adNoticeTitle")) $("adNoticeTitle").textContent = t("adNoticeTitle");
    if (adNoticeText) adNoticeText.textContent = t("adNoticeBody");
    if (adNoticeOkBtn) adNoticeOkBtn.textContent = t("adNoticeOk");
    syncAdNoticePayControls();
    if (userCoinsLabel) userCoinsLabel.textContent = t("coins") + ":";
    if (userCoinsWrap) userCoinsWrap.setAttribute("title", t("coins"));
    if ($("appMain")) $("appMain").setAttribute("aria-label", t("title"));
    if ($("playSideGroup")) $("playSideGroup").setAttribute("aria-label", t("playSideAria"));
    if (boardSizePopover) boardSizePopover.setAttribute("aria-label", t("fieldSize"));
    if (difficultyPopover) difficultyPopover.setAttribute("aria-label", t("difficultyPickerAria"));
    if ($("statsBar")) $("statsBar").setAttribute("aria-label", t("statsBarAria"));
    if (!resultModal.classList.contains("show")) {
      modalTitle.textContent = t("gameOver");
      modalText.textContent = t("resultHint");
    }
    if (langSelect) {
      if (!langSelect.options.length) {
        var order = ["ru", "en", "kk", "uz", "tg"];
        for (var li = 0; li < order.length; li++) {
          var lc = order[li];
          if (!G.isLangSupported || !G.isLangSupported(lc)) continue;
          var opt = document.createElement("option");
          opt.value = lc;
          opt.textContent = (G.langNativeNames && G.langNativeNames[lc]) ? G.langNativeNames[lc] : lc.toUpperCase();
          langSelect.appendChild(opt);
        }
      }
      if (G.isLangSupported && G.isLangSupported(G.lang)) langSelect.value = G.lang;
      langSelect.setAttribute("aria-label", t("langGroupAria"));
    }
    if ($("onlineSectionTitle")) $("onlineSectionTitle").textContent = t("onlineTitle");
    if ($("onlinePanelCloseBtn")) {
      $("onlinePanelCloseBtn").setAttribute("aria-label", t("onlinePanelCloseAria"));
      $("onlinePanelCloseBtn").setAttribute("title", t("onlinePanelCloseAria"));
    }
    if ($("findMatchBtn")) $("findMatchBtn").textContent = t("findMatch");
    if ($("inviteFriendBtn")) $("inviteFriendBtn").textContent = t("inviteFriend");
    if ($("cancelSearchBtn")) $("cancelSearchBtn").textContent = t("cancel");
    if ($("joinRoomBtn")) $("joinRoomBtn").textContent = t("join");
    if ($("copyCodeBtn")) $("copyCodeBtn").textContent = t("copy");
    if ($("roomCodeLabel")) $("roomCodeLabel").textContent = t("roomCode") + ":";
    if ($("joinCodeInput")) {
      $("joinCodeInput").setAttribute("aria-label", t("roomCode"));
      $("joinCodeInput").setAttribute("placeholder", t("roomCode"));
    }
    if ($("disconnectOnlineBtn")) $("disconnectOnlineBtn").textContent = t("disconnect");
    var osh = $("onlineServerHint");
    if (osh && !osh.hidden) osh.textContent = t("noServerHint");
    if ($("shareVkBtn")) $("shareVkBtn").textContent = t("shareRoomVk");
    if ($("inviteVkBtn")) $("inviteVkBtn").textContent = t("inviteVkFriends");
    if (donateFabBtn) {
      donateFabBtn.setAttribute("aria-label", t("donateFabAria"));
      donateFabBtn.setAttribute("title", t("donateFabAria"));
    }
    if ($("donateModalTitle")) $("donateModalTitle").textContent = t("donateTitle");
    if ($("donateModalText")) $("donateModalText").textContent = t("donateBody");
    if (donateVotesGrid) {
      donateVotesGrid.setAttribute("aria-label", t("donateVotesGroupAria"));
      var dvBtns = donateVotesGrid.querySelectorAll(".donate-vote-btn");
      for (var di = 0; di < dvBtns.length; di++) {
        var b = dvBtns[di];
        var vn = Number(b.getAttribute("data-votes"));
        if (!Number.isFinite(vn)) continue;
        var lbl = G.donateVotesLabel ? G.donateVotesLabel(vn) : String(vn);
        b.textContent = lbl;
        b.setAttribute("aria-label", lbl);
      }
    }
    if (donateModalCloseBtn) {
      donateModalCloseBtn.setAttribute("aria-label", t("donateCloseAria"));
      donateModalCloseBtn.setAttribute("title", t("donateCloseAria"));
    }
    if ($("profileModalHeading")) $("profileModalHeading").textContent = t("profileTitle");
    if (profileModalOkBtn) profileModalOkBtn.textContent = t("close");
    if (profileModalCloseBtn) {
      profileModalCloseBtn.setAttribute("aria-label", t("close"));
      profileModalCloseBtn.setAttribute("title", t("close"));
    }
    if (userAvatarBtn) {
      userAvatarBtn.setAttribute("aria-label", t("profileAvatarBtnAria"));
      userAvatarBtn.setAttribute("title", t("profileAvatarBtnAria"));
    }
    G.syncWelcomeI18n();
    G.applyBoardLayout();
    G.updateDifficultyCurrentLabel();
    G.updateStatsUI();
    G.updateCoinsUI();
    G.updateStatus();
    G.updateRobotDependentUI();
  };

  G.updateCoinsUI = function () {
    if (coinsValueEl) coinsValueEl.textContent = String(Math.max(0, Math.floor(G.coins || 0)));
    if (profileModal && profileModal.classList.contains("show") && G.syncProfileModalContent) G.syncProfileModalContent();
  };

  G.syncProfileModalContent = function () {
    var t = G.t.bind(G);
    var rawName = G.playerDisplayName && String(G.playerDisplayName).trim();
    var displayName = rawName ? rawName : t("guest");
    if ($("profileModalName")) $("profileModalName").textContent = displayName;
    var av = $("userAvatar");
    var pmAv = $("profileModalAvatar");
    if (pmAv) {
      if (av && av.getAttribute("src") && !av.hidden) {
        pmAv.src = av.src;
        pmAv.hidden = false;
      } else {
        pmAv.removeAttribute("src");
        pmAv.hidden = true;
      }
    }
    if ($("profileModalCoins")) $("profileModalCoins").textContent = t("coins") + ": " + String(Math.max(0, Math.floor(G.coins || 0)));
    if ($("profileModalStats")) {
      $("profileModalStats").textContent = t("profileStatsCaption") + ": " + G.stats.wins + " / " + G.stats.losses + " / " + G.stats.draws;
    }
  };

  G.openProfileModal = function () {
    if (G.syncProfileModalContent) G.syncProfileModalContent();
    if (profileModal) profileModal.classList.add("show");
    if (userAvatarBtn) userAvatarBtn.setAttribute("aria-expanded", "true");
  };

  G.closeProfileModal = function () {
    if (profileModal) profileModal.classList.remove("show");
    if (userAvatarBtn) userAvatarBtn.setAttribute("aria-expanded", "false");
  };

  G.closeAdNoticeModal = function () { if (adNoticeModal) adNoticeModal.classList.remove("show"); };

  G.openDonateModal = function () {
    var hint = $("donateVkOnlyHint");
    if (hint) hint.hidden = true;
    if (donateModal) donateModal.classList.add("show");
    if (donateFabBtn) donateFabBtn.setAttribute("aria-expanded", "true");
  };

  G.closeDonateModal = function () {
    if (donateModal) donateModal.classList.remove("show");
    if (donateFabBtn) donateFabBtn.setAttribute("aria-expanded", "false");
  };

  G.openAdNoticeBeforeNewGame = function () {
    G.closeModal();
    G.closeProfileModal();
    if ($("adNoticeTitle")) $("adNoticeTitle").textContent = G.t("adNoticeTitle");
    if (adNoticeText) adNoticeText.textContent = G.t("adNoticeBody");
    if (adNoticeOkBtn) adNoticeOkBtn.textContent = G.t("adNoticeOk");
    resetAdNoticePaySection();
    var selOpen = $("adNoticeNoAdsPlan");
    if (selOpen && selOpen.value !== "year") selOpen.value = "week";
    syncAdNoticePayControls();
    if (adNoticeModal) adNoticeModal.classList.add("show");
  };

  G.onNewGameWithAdFlow = function () {
    G.closeShop();
    G.closeProfileModal();
    if (G.isOnline()) {
      G.closeModal();
      if (G.onNewGame) G.onNewGame();
      return;
    }
    if (G.isAdsSuppressed && G.isAdsSuppressed()) {
      G.closeModal();
      G.resetGameLocal();
      return;
    }
    G.openAdNoticeBeforeNewGame();
  };

  function afterAdNoticeConfirmed() {
    G.closeAdNoticeModal();
    var reward = G.COINS_PER_NEW_GAME_AD || 10;
    function grantAdCoins() {
      G.coins = Math.max(0, Math.floor(G.coins || 0) + reward);
      G.updateCoinsUI();
      if (G.saveCloud) G.saveCloud();
    }
    if (G.showNewGameInterstitial) {
      G.showNewGameInterstitial(function (earned) {
        if (earned) grantAdCoins();
        G.resetGameLocal();
      });
    } else {
      grantAdCoins();
      G.resetGameLocal();
    }
  }

  /* ---- board layout ---- */
  G.applyBoardLayout = function () {
    var n = G.boardSize;
    boardEl.style.setProperty("--bs", String(n));
    boardEl.style.gridTemplateColumns = "repeat(" + n + ", 1fr)";
    boardEl.style.gridTemplateRows = "repeat(" + n + ", 1fr)";
    boardEl.dataset.size = String(n);
    boardEl.setAttribute("aria-label", G.t("boardAria").replace(/\{n\}/g, String(n)));
  };

  G.syncBoardSizeUI = function () {
    boardSizeCurrentLabel.textContent = G.boardSize + " \u00d7 " + G.boardSize;
    boardSizeOptionsEl.querySelectorAll(".board-size-opt").forEach(function (btn) {
      var n = Number(btn.dataset.size), on = n === G.boardSize;
      btn.classList.toggle("active", on); btn.classList.toggle("accent", on);
      btn.setAttribute("aria-selected", String(on));
    });
  };

  /* ---- status ---- */
  G.updateStatus = function () {
    if (G.gameOver) return;
    var t = G.t.bind(G);
    if (G.isOnline()) {
      if (G.waitingForPeer) { statusEl.textContent = t("waitPeer"); return; }
      if (G.currentPlayer === G.myOnlineSymbol) statusEl.textContent = t("yourTurn");
      else statusEl.textContent = t("opponentTurn");
      return;
    }
    if (!G.robotEnabled) { statusEl.textContent = t("connectToPlay"); return; }
    if (G.robotThinking) { statusEl.textContent = t("robotThinks"); return; }
    if (G.currentPlayer === G.robotSymbol) { statusEl.textContent = t("robotTurn") + " (" + G.robotSymbol + ")"; return; }
    statusEl.textContent = G.currentPlayer === "X" ? t("turnX") : t("turnO");
  };

  G.updateSideButtons = function () {
    var playingAsX = G.humanSymbol === "X";
    playAsXBtn.classList.toggle("active", playingAsX); playAsOBtn.classList.toggle("active", !playingAsX);
    playAsXBtn.setAttribute("aria-pressed", String(playingAsX)); playAsOBtn.setAttribute("aria-pressed", String(!playingAsX));
  };

  G.updateLevelButtons = function () {
    var e = G.robotLevel === "easy", n = G.robotLevel === "normal", h = G.robotLevel === "hard";
    levelEasyBtn.classList.toggle("active", e); levelNormalBtn.classList.toggle("active", n); levelHardBtn.classList.toggle("active", h);
    levelEasyBtn.classList.toggle("accent", e); levelNormalBtn.classList.toggle("accent", n); levelHardBtn.classList.toggle("accent", h);
    levelEasyBtn.setAttribute("aria-pressed", String(e)); levelNormalBtn.setAttribute("aria-pressed", String(n)); levelHardBtn.setAttribute("aria-pressed", String(h));
    G.updateDifficultyCurrentLabel();
  };

  G.updateDifficultyCurrentLabel = function () {
    var t = G.t.bind(G);
    var labels = { easy: t("easy"), normal: t("normal"), hard: t("hard") };
    difficultyCurrentLabel.textContent = labels[G.robotLevel] || t("normal");
  };

  G.updateRobotDependentUI = function () {
    var onlineActive = G.isOnline();
    var robot = G.robotEnabled;
    difficultySuperWrap.hidden = onlineActive || !robot;
    if (modeDifficultyRow) {
      modeDifficultyRow.classList.toggle("mode-difficulty-row--online-only", onlineActive || !robot);
    }
    if (hintBtn) hintBtn.hidden = onlineActive || !robot;
    var onlinePanel = $("onlinePanel");
    if (onlinePanel) {
      onlinePanel.hidden = robot;
      onlinePanel.setAttribute("aria-hidden", robot ? "true" : "false");
    }
    if (robotModeBtn) {
      robotModeBtn.textContent = robot ? G.t("switchToOnline") : G.t("switchToRobot");
      robotModeBtn.setAttribute("aria-pressed", robot ? "true" : "false");
    }
  };

  G.refreshPlaySideLock = function () {
    var lock = G.isOnline() || G.waitingForPeer;
    playAsXBtn.disabled = lock;
    playAsOBtn.disabled = lock;
    if (boardSizeTrigger) boardSizeTrigger.disabled = lock;
  };

  /* ---- stats UI ---- */
  G.updateStatsUI = function () {
    if (statsWinsEl) statsWinsEl.textContent = G.stats.wins;
    if (statsLossesEl) statsLossesEl.textContent = G.stats.losses;
    if (statsDrawsEl) statsDrawsEl.textContent = G.stats.draws;
    if (profileModal && profileModal.classList.contains("show") && G.syncProfileModalContent) G.syncProfileModalContent();
  };

  /* ---- leaderboard (боковая панель / мобильный drawer) ---- */
  function isMobileLeaderboardDrawer() {
    try {
      return window.matchMedia("(max-width: 720px), (max-height: 520px) and (orientation: landscape)").matches;
    } catch (e) { return false; }
  }

  function setLeaderboardDrawerOpen(open) {
    if (!leaderboardPanel) return;
    if (!isMobileLeaderboardDrawer()) {
      leaderboardPanel.classList.remove("lb-drawer-open");
      if (lbDrawerBackdrop) lbDrawerBackdrop.hidden = true;
      if (lbToggleBtn) {
        lbToggleBtn.setAttribute("aria-expanded", "false");
        lbToggleBtn.classList.remove("lb-toggle--on");
      }
      leaderboardPanel.removeAttribute("aria-hidden");
      document.body.classList.remove("lb-drawer-active");
      return;
    }
    leaderboardPanel.classList.toggle("lb-drawer-open", open);
    if (lbDrawerBackdrop) lbDrawerBackdrop.hidden = !open;
    if (lbToggleBtn) {
      lbToggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      lbToggleBtn.classList.toggle("lb-toggle--on", open);
    }
    if (open) leaderboardPanel.removeAttribute("aria-hidden");
    else leaderboardPanel.setAttribute("aria-hidden", "true");
    document.body.classList.toggle("lb-drawer-active", open);
    if (open) G.openLeaderboard();
  }

  G.openLeaderboard = function () {
    if (leaderboardList) leaderboardList.innerHTML = '<p class="lb-loading">' + G.t("lbLoading") + '</p>';
    if (G.loadLeaderboard) G.loadLeaderboard();
  };

  G.closeLeaderboard = function () {
    setLeaderboardDrawerOpen(false);
  };

  G.toggleLeaderboardDrawer = function () {
    if (!leaderboardPanel || !isMobileLeaderboardDrawer()) return;
    setLeaderboardDrawerOpen(!leaderboardPanel.classList.contains("lb-drawer-open"));
  };

  G.renderLeaderboard = function (entries) {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = "";
    if (!entries || entries.length === 0) {
      leaderboardList.innerHTML = '<p class="lb-empty">' + G.t("lbEmpty") + '</p>';
      return;
    }
    entries.forEach(function (e) {
      var row = document.createElement("div");
      row.className = "lb-row" + (e.isCurrentPlayer ? " lb-row--you" : "");
      var rank = document.createElement("span"); rank.className = "lb-rank"; rank.textContent = "#" + e.rank;
      var avatar = null;
      if (e.avatar) {
        avatar = document.createElement("img"); avatar.className = "lb-avatar"; avatar.src = e.avatar; avatar.alt = "";
      }
      var name = document.createElement("span"); name.className = "lb-name";
      name.textContent = e.name + (e.isCurrentPlayer ? " " + G.t("lbYou") : "");
      var score = document.createElement("span"); score.className = "lb-score"; score.textContent = e.score;
      row.appendChild(rank);
      if (avatar) row.appendChild(avatar);
      row.appendChild(name);
      row.appendChild(score);
      leaderboardList.appendChild(row);
    });
  };

  G.showLeaderboardError = function () {
    if (leaderboardList) leaderboardList.innerHTML = '<p class="lb-empty">' + G.t("lbError") + '</p>';
  };

  /* ---- board ---- */
  G.createBoard = function () {
    boardEl.innerHTML = "";
    var n = G.boardSize, line = "1px solid var(--grid-line-color)";
    for (var i = 0; i < n * n; i++) {
      var row = Math.floor(i / n), col = i % n;
      var cell = document.createElement("button");
      cell.type = "button"; cell.className = "cell"; cell.dataset.index = String(i);
      cell.setAttribute("aria-label", G.t("cellAria").replace("{r}", String(row + 1)).replace("{c}", String(col + 1)));
      cell.style.borderTop = "none"; cell.style.borderLeft = "none";
      cell.style.borderRight = col < n - 1 ? line : "none";
      cell.style.borderBottom = row < n - 1 ? line : "none";
      boardEl.appendChild(cell);
    }
    G.applyBoardLayout();
  };

  G.disableBoard = function () {
    boardEl.querySelectorAll(".cell").forEach(function (c) { c.classList.add("disabled"); c.disabled = true; });
  };
  G.enableBoard = function () {
    boardEl.querySelectorAll(".cell").forEach(function (c) { c.classList.remove("disabled"); c.disabled = false; });
  };

  G.redrawBoardFromState = function () {
    clearBoardWinLine();
    G.createBoard();
    for (var i = 0; i < G.board.length; i++) {
      var sym = G.board[i];
      if (!sym) continue;
      var cell = boardEl.querySelector('.cell[data-index="' + i + '"]');
      if (cell) G.markCell(cell, sym, { silent: true });
    }
  };

  G.showOpponent = function (name, avatarUrl) {
    var row = $("opponentRow"), img = $("opponentAvatarImg"), nm = $("opponentNameText");
    if (!row) return;
    if (nm) nm.textContent = name || "";
    if (img) {
      if (avatarUrl) { img.src = avatarUrl; img.hidden = false; }
      else { img.removeAttribute("src"); img.hidden = true; }
    }
    row.hidden = false;
  };

  G.hideOpponent = function () {
    var row = $("opponentRow"), img = $("opponentAvatarImg");
    if (row) row.hidden = true;
    if (img) { img.removeAttribute("src"); img.hidden = true; }
  };

  G.applyServerSync = function (data) {
    if (!data || data.type !== "sync") return;
    var prevGameOver = G.gameOver;
    var prevBoardSize = G.boardSize;
    if (data.boardSize != null) {
      G.boardSize = G.clampBoardSize(data.boardSize);
      G.winLen = data.winLen != null ? G.clampBoardSize(data.winLen) : G.boardSize;
      G.rebuildWinningLines();
    }
    if (Array.isArray(data.board)) G.board = data.board.slice();
    G.currentPlayer = data.currentPlayer === "O" ? "O" : "X";
    G.gameOver = Boolean(data.gameOver);
    G.winner = null;
    if (G.gameOver && (data.winner === "X" || data.winner === "O")) G.winner = data.winner;

    if (G.boardSize !== prevBoardSize) G.syncBoardSizeUI();
    G.applyBoardLayout();
    G.redrawBoardFromState();

    if (data.opponentName) G.showOpponent(data.opponentName, data.opponentAvatar || "");

    if (G.gameOver) {
      if (!prevGameOver) G.showEndGameUI(G.winner);
      else G.disableBoard();
    } else {
      if (prevGameOver) {
        G.closeModal();
        boardEl.classList.remove("finished");
        clearBoardWinLine();
        G.redrawBoardFromState();
      }
      if (G.isOnline()) {
        var allow = !G.waitingForPeer && G.currentPlayer === G.myOnlineSymbol;
        if (allow) G.enableBoard();
        else G.disableBoard();
      }
    }
    G.robotThinking = false;
    G.updateStatus();
  };

  /* ---- mark cell ---- */
  G.markCell = function (cell, player, options) {
    var silent = options && options.silent;
    var mark = document.createElement("span");
    mark.className = "mark mark-" + player.toLowerCase();
    mark.style.setProperty("--rot", player === "X" ? "-6deg" : "5deg");
    if (silent) { mark.style.opacity = "1"; mark.style.animation = "none"; mark.style.transform = "scale(1) rotate(" + (player === "X" ? "-6deg" : "5deg") + ")"; }

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("class", "mark-svg");
    svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");

    var scheduleDraw = function (path, delaySec, durationSec) {
      requestAnimationFrame(function () {
        var len = path.getTotalLength();
        path.style.setProperty("--path-len", String(len));
        path.style.strokeDasharray = String(len);
        if (silent) { path.style.strokeDashoffset = "0"; path.style.animation = "none"; }
        else { path.style.strokeDashoffset = String(len); path.style.animation = "drawPencilStroke " + durationSec + "s cubic-bezier(0.33,0.85,0.45,1) " + delaySec + "s forwards"; }
      });
    };

    if (player === "X") {
      [{ d: "M 22 24 Q 50 48 76 76", delay: 0, dur: 0.38, extra: "x-thick" },
       { d: "M 76 24 Q 50 52 22 76", delay: 0.14, dur: 0.38, extra: "x-thick" }]
        .forEach(function (s) {
          var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
          p.setAttribute("d", s.d); p.setAttribute("class", "pencil-stroke " + s.extra);
          svg.appendChild(p); scheduleDraw(p, s.delay, s.dur);
        });
    } else {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", "M 50 17 C 31 17 17 31 17 50 C 17 69 31 83 50 83 C 69 83 83 69 83 50 C 83 31 69 17 50 17 Z");
      p.setAttribute("class", "pencil-stroke"); svg.appendChild(p); scheduleDraw(p, 0, 0.52);
    }
    mark.appendChild(svg); cell.appendChild(mark); cell.classList.add("filled");
    if (!silent) spawnWowNearCell(cell);
  };

  function spawnWowNearCell(cell) {
    var labels = G.t("wow");
    var rect = cell.getBoundingClientRect();
    var pop = document.createElement("span");
    pop.className = "wow-pop wow-pop--cell";
    pop.textContent = labels[Math.floor(Math.random() * labels.length)];
    var corners = [[0.82,0.2],[0.82,0.8],[0.18,0.22],[0.18,0.78]];
    var c = corners[Math.floor(Math.random() * corners.length)];
    pop.style.left = (rect.left + rect.width * c[0]) + "px";
    pop.style.top = (rect.top + rect.height * c[1]) + "px";
    pop.style.setProperty("--r", (-6 + Math.random() * 12) + "deg");
    wowLayer.appendChild(pop);
    setTimeout(function () { pop.remove(); }, 1000);
  }

  /* ---- modals ---- */
  G.showModal = function (title, text) { modalTitle.textContent = title; modalText.textContent = text; resultModal.classList.add("show"); };
  G.closeModal = function () { resultModal.classList.remove("show"); };

  /* ---- celebrations ---- */
  G.clearCelebration = function () {
    celebrationTimers.forEach(clearTimeout); celebrationTimers = [];
    if (fireworksSparksEl) fireworksSparksEl.innerHTML = "";
    if (fireworksConfettiEl) fireworksConfettiEl.innerHTML = "";
    celebrationBanner.hidden = true; wowLayer.innerHTML = "";
    document.body.classList.remove("celebrating");
  };

  function createConfetti(amount) {
    var palette = ["#ff4d6d","#ffbe0b","#3a86ff","#2ec4b6","#8338ec","#fb5607","#80ed99"];
    var frag = document.createDocumentFragment();
    for (var i = 0; i < amount; i++) {
      var piece = document.createElement("span"); piece.className = "confetti";
      piece.style.left = (Math.random() * 100) + "%";
      piece.style.background = palette[Math.floor(Math.random() * palette.length)];
      piece.style.setProperty("--drift", (-72 + Math.random() * 144) + "px");
      piece.style.setProperty("--fall", (3600 + Math.random() * 2400) + "ms");
      piece.style.setProperty("--r", (Math.random() * 360) + "deg");
      piece.style.animationDelay = (Math.random() * 480) + "ms";
      frag.appendChild(piece);
    }
    fireworksConfettiEl.appendChild(frag);
  }

  function launchFireworks(fullReset, confettiAmount) {
    if (fullReset) { fireworksSparksEl.innerHTML = ""; fireworksConfettiEl.innerHTML = ""; }
    else fireworksSparksEl.innerHTML = "";
    var bursts = fullReset ? 8 : 5, sparksPerBurst = fullReset ? 24 : 20;
    var colors = ["#ffd166","#ef476f","#06d6a0","#118ab2","#f28482","#7c83fd","#ffc857","#8ac926","#ff6b9d","#00f5d4"];
    var frag = document.createDocumentFragment();
    for (var b = 0; b < bursts; b++) {
      var cx = 6 + Math.random() * 88, cy = 8 + Math.random() * 58;
      for (var i = 0; i < sparksPerBurst; i++) {
        var spark = document.createElement("span"); spark.className = "spark";
        var angle = (Math.PI * 2 * i) / sparksPerBurst + (Math.random() - 0.5) * 0.35;
        var dist = 52 + Math.random() * 118;
        spark.style.left = cx + "%"; spark.style.top = cy + "%";
        spark.style.setProperty("--dx", (Math.cos(angle) * dist) + "px");
        spark.style.setProperty("--dy", (Math.sin(angle) * dist) + "px");
        spark.style.background = colors[Math.floor(Math.random() * colors.length)];
        spark.style.animationDelay = (b * 85 + Math.random() * 90) + "ms";
        frag.appendChild(spark);
      }
    }
    fireworksSparksEl.appendChild(frag);
    createConfetti(confettiAmount);
  }

  function spawnCenterWow(text) {
    var pop = document.createElement("span"); pop.className = "wow-pop wow-pop--center"; pop.textContent = text;
    pop.style.left = "50%"; pop.style.top = "48%";
    pop.style.setProperty("--r", (-8 + Math.random() * 16) + "deg");
    wowLayer.appendChild(pop); setTimeout(function () { pop.remove(); }, 1320);
  }

  G.launchCelebration = function () {
    G.clearCelebration(); document.body.classList.add("celebrating");
    celebrationBanner.hidden = false;
    var celebTexts = G.t("celeb");
    requestAnimationFrame(function () { launchFireworks(true, 88); });
    spawnCenterWow(celebTexts[0]);
    celebrationTimers.push(setTimeout(function () { requestAnimationFrame(function () { launchFireworks(false, 36); }); }, 520));
    celebrationTimers.push(setTimeout(function () { requestAnimationFrame(function () { launchFireworks(false, 36); }); }, 1050));
    celebrationTimers.push(setTimeout(function () { spawnCenterWow(celebTexts[1]); }, 1100));
    celebrationTimers.push(setTimeout(function () { requestAnimationFrame(function () { launchFireworks(false, 34); }); }, 1680));
    celebrationTimers.push(setTimeout(function () { spawnCenterWow(celebTexts[2]); }, 1750));
    celebrationTimers.push(setTimeout(function () { requestAnimationFrame(function () { launchFireworks(false, 32); }); }, 2350));
    celebrationTimers.push(setTimeout(function () { spawnCenterWow(celebTexts[3] || celebTexts[0]); }, 2400));
    celebrationTimers.push(setTimeout(function () { fireworksSparksEl.innerHTML = ""; fireworksConfettiEl.innerHTML = ""; }, 10200));
    celebrationTimers.push(setTimeout(function () { celebrationBanner.hidden = true; }, 10400));
    celebrationTimers.push(setTimeout(function () { document.body.classList.remove("celebrating"); }, 10800));
  };

  /* ---- game flow ---- */
  function clearBoardWinLine() {
    var old = boardEl.querySelector(".board-win-line");
    if (old) old.remove();
  }

  /** Одна непрерывная линия от центра первой клетки ряда до центра последней (как на эталоне). */
  function drawBoardWinLine(winnerSymbol) {
    clearBoardWinLine();
    var idxs = G.getWinningLineIndices();
    if (!idxs || idxs.length < 2) return;
    var n = G.boardSize;
    function centerPct(i) {
      var row = Math.floor(i / n), col = i % n;
      return { x: ((col + 0.5) / n) * 100, y: ((row + 0.5) / n) * 100 };
    }
    var a = centerPct(idxs[0]);
    var b = centerPct(idxs[idxs.length - 1]);
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var pad = 5;
    var x1 = a.x - (dx / len) * pad;
    var y1 = a.y - (dy / len) * pad;
    var x2 = b.x + (dx / len) * pad;
    var y2 = b.y + (dy / len) * pad;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "board-win-line");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "board-win-line-stroke");
    line.setAttribute("x1", String(x1));
    line.setAttribute("y1", String(y1));
    line.setAttribute("x2", String(x2));
    line.setAttribute("y2", String(y2));
    var sym = winnerSymbol || G.board[idxs[0]];
    if (sym === "X") line.style.stroke = "var(--x-color, #1e40e8)";
    else if (sym === "O") line.style.stroke = "var(--o-color, #e9166e)";
    else line.style.stroke = "var(--win-strike, #d63031)";
    svg.appendChild(line);
    boardEl.appendChild(svg);

    var pathLen = line.getTotalLength();
    line.style.strokeDasharray = String(pathLen);
    line.style.strokeDashoffset = String(pathLen);
    var reduceMotion = false;
    try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    requestAnimationFrame(function () {
      if (reduceMotion) {
        line.style.strokeDashoffset = "0";
        return;
      }
      line.style.transition = "stroke-dashoffset 0.42s cubic-bezier(0.22, 1, 0.36, 1)";
      line.style.strokeDashoffset = "0";
    });
  }

  G.showEndGameUI = function (winner) {
    G.gameOver = true; G.disableBoard(); boardEl.classList.add("finished"); G.robotThinking = false;
    if (winner != null) drawBoardWinLine(winner);
    var t = G.t.bind(G);
    var isHumanWin = winner != null && winner === G.humanSymbol;
    if (winner === "X") {
      statusEl.textContent = t("winX");
      if (isHumanWin) { G.launchCelebration(); G.stats.wins++; } else G.stats.losses++;
      G.showModal(t("winX"), isHumanWin ? t("winMsg") : t("loseMsg"));
    } else if (winner === "O") {
      statusEl.textContent = t("winO");
      if (isHumanWin) { G.launchCelebration(); G.stats.wins++; } else G.stats.losses++;
      G.showModal(t("winO"), isHumanWin ? t("winMsg") : t("loseMsg"));
    } else {
      statusEl.textContent = t("draw"); G.stats.draws++;
      G.showModal(t("draw"), t("drawMsg"));
    }
    G.updateStatsUI();
    if (G.submitScore) G.submitScore();
    if (G.saveCloud) G.saveCloud();
  };

  G.applyMove = function (index) {
    if (index < 0 || index >= G.board.length || G.board[index] !== null || G.gameOver) return false;
    var cell = boardEl.querySelector('.cell[data-index="' + index + '"]');
    if (!cell) return false;
    G.board[index] = G.currentPlayer;
    G.markCell(cell, G.currentPlayer);
    var winner = G.checkWinner();
    if (winner) { G.showEndGameUI(winner); return true; }
    if (G.isDraw()) { G.showEndGameUI(null); return true; }
    G.currentPlayer = G.currentPlayer === "X" ? "O" : "X";
    G.updateStatus(); return true;
  };

  G.scheduleRobotMove = function () {
    if (!G.robotEnabled || G.gameOver || G.currentPlayer !== G.robotSymbol) return;
    G.robotThinking = true; G.updateStatus();
    setTimeout(function () {
      if (G.gameOver || !G.robotEnabled || G.currentPlayer !== G.robotSymbol) { G.robotThinking = false; G.updateStatus(); return; }
      var move = G.pickRobotMove();
      G.robotThinking = false; G.applyMove(move);
    }, 350);
  };

  G.resetGameLocal = function () {
    G.board = Array(G.boardSize * G.boardSize).fill(null);
    G.currentPlayer = G.robotEnabled && G.humanSymbol === "O" ? G.robotSymbol : "X";
    G.gameOver = false; G.winner = null; G.robotThinking = false;
    G.closeModal(); boardEl.classList.remove("finished"); G.clearCelebration();
    clearBoardWinLine();
    G.createBoard();
    if (!G.robotEnabled) {
      G.disableBoard();
      G.updateStatus();
      return;
    }
    G.enableBoard(); G.updateStatus(); G.scheduleRobotMove();
  };

  G.resetGame = function () {
    G.resetGameLocal();
  };

  /* ---- hint (rewarded ad) ---- */
  function doHint() {
    if (G.isOnline() || !G.robotEnabled) return;
    if (G.gameOver || G.currentPlayer === G.robotSymbol || G.robotThinking) return;
    var move = G.getHintMove();
    if (move == null) return;
    var cell = boardEl.querySelector('.cell[data-index="' + move + '"]');
    if (cell) { cell.style.boxShadow = "inset 0 0 0 3px rgba(255,200,0,0.7)"; setTimeout(function () { cell.style.boxShadow = ""; }, 2000); }
  }

  /* ---- skin theme ---- */
  G.applySkin = function (skinId) {
    document.body.classList.remove("theme-neon", "theme-wood", "theme-space");
    if (skinId) document.body.classList.add("theme-" + skinId.replace("skin_", ""));
    G.activeSkin = skinId;
  };

  /* ---- popovers ---- */
  function positionPopover(trigger, popover) {
    var r = trigger.getBoundingClientRect(), pad = 8, vw = window.innerWidth;
    var width = Math.min(Math.max(r.width, 200), vw - pad * 2);
    var left = r.left + (r.width - width) / 2;
    left = Math.max(pad, Math.min(left, vw - pad - width));
    popover.style.left = left + "px"; popover.style.width = width + "px";
    var top = r.bottom + 6; popover.style.top = top + "px";
    var pr = popover.getBoundingClientRect();
    if (pr.bottom > window.innerHeight - pad) { top = Math.max(pad, r.top - pr.height - 6); popover.style.top = top + "px"; }
  }

  function closePopover(popover, trigger) { if (popover.hidden) return; popover.hidden = true; trigger.setAttribute("aria-expanded", "false"); }
  function openPopover(popover, trigger, otherPopover, otherTrigger) {
    closePopover(otherPopover, otherTrigger); popover.hidden = false; trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(function () { positionPopover(trigger, popover); positionPopover(trigger, popover); });
  }

  var closeDiff = function () { closePopover(difficultyPopover, difficultyTrigger); };
  var closeBoardSize = function () { closePopover(boardSizePopover, boardSizeTrigger); };
  var openDiff = function () { openPopover(difficultyPopover, difficultyTrigger, boardSizePopover, boardSizeTrigger); };
  var openBoardSize = function () { openPopover(boardSizePopover, boardSizeTrigger, difficultyPopover, difficultyTrigger); };

  /* ---- shop ---- */
  var shopFlashTimer = null;
  G.showShopFlash = function (msg) {
    var el = $("shopPurchaseHint");
    if (!el) return;
    if (shopFlashTimer) {
      clearTimeout(shopFlashTimer);
      shopFlashTimer = null;
    }
    el.textContent = msg || "";
    el.hidden = !msg;
    if (msg) {
      shopFlashTimer = setTimeout(function () {
        el.hidden = true;
        el.textContent = "";
        shopFlashTimer = null;
      }, 2800);
    }
  };

  G.openShop = function () {
    if (G.validateActiveSkinLease) G.validateActiveSkinLease();
    if (shopOverlay) shopOverlay.classList.add("show");
    if (G.renderShopItems && G._shopCatalogLast) G.renderShopItems(G._shopCatalogLast);
  };
  G.closeShop = function () { if (shopOverlay) shopOverlay.classList.remove("show"); };
  G.renderShopItems = function (catalog) {
    if (!shopItems) return;
    G._shopCatalogLast = catalog;
    shopItems.innerHTML = "";
    var t = G.t.bind(G);
    var formatCoinPrice = function (productId, product) {
      var spec = G.shopCoinPrices && G.shopCoinPrices[productId];
      if (!spec) return product.priceValue || product.price || "—";
      var s = String(spec.coins) + " " + t("shopCoinsShort");
      if (spec.perDay) s += " " + t("shopPerDaySuffix");
      return s;
    };
    var descs = {
      disable_ads: { name: t("disableAds"), desc: t("disableAdsDesc") },
      skin_neon: { name: t("skinNeon"), desc: t("skinNeonDesc") },
      skin_wood: { name: t("skinWood"), desc: t("skinWoodDesc") },
      skin_space: { name: t("skinSpace"), desc: t("skinSpaceDesc") }
    };
    catalog.forEach(function (product) {
      var d = descs[product.id] || { name: product.title, desc: product.description };
      var permOwned = (product.id === "disable_ads" && !G.showAds) || G.ownedSkins.indexOf(product.id) !== -1;
      var div = document.createElement("div");
      div.className = "shop-item" + (permOwned ? " owned" : "");
      var infoDiv = document.createElement("div"); infoDiv.className = "shop-item-info";
      var nameEl = document.createElement("div"); nameEl.className = "shop-item-name"; nameEl.textContent = d.name;
      var descEl = document.createElement("div"); descEl.className = "shop-item-desc"; descEl.textContent = permOwned ? t("owned") : d.desc;
      infoDiv.appendChild(nameEl); infoDiv.appendChild(descEl); div.appendChild(infoDiv);
      if (!permOwned) {
        var priceDiv = document.createElement("div"); priceDiv.className = "shop-item-price";
        if (product.getPriceCurrencyImage && !(G.shopCoinPrices && G.shopCoinPrices[product.id])) {
          var img = document.createElement("img"); img.src = product.getPriceCurrencyImage("small"); img.alt = "";
          priceDiv.appendChild(img);
        }
        var priceSpan = document.createElement("span"); priceSpan.textContent = formatCoinPrice(product.id, product);
        priceDiv.appendChild(priceSpan); div.appendChild(priceDiv);
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "btn btn-tiny";
        btn.textContent = t("buy"); btn.dataset.productId = product.id;
        btn.addEventListener("click", function () { if (G.purchaseShopItem) G.purchaseShopItem(product.id); });
        div.appendChild(btn);
      }
      shopItems.appendChild(div);
    });
  };

  /* ---- event bindings ---- */
  boardEl.addEventListener("click", function (event) {
    var target = event.target.closest(".cell");
    if (!target || G.gameOver || G.robotThinking) return;
    var idx = Number(target.dataset.index);
    if (G.board[idx] !== null) return;
    if (G.isOnline()) {
      if (G.waitingForPeer || G.currentPlayer !== G.myOnlineSymbol) return;
      if (G.onlineWs && G.onlineWs.readyState === WebSocket.OPEN) {
        try { G.onlineWs.send(JSON.stringify({ type: "move", index: idx })); } catch (e) {}
      }
      return;
    }
    if (G.currentPlayer === G.robotSymbol) return;
    G.applyMove(idx); G.scheduleRobotMove();
  });

  resetBtn.addEventListener("click", function () {
    if (G.isOnline()) {
      if (G.onlineWs && G.onlineWs.readyState === WebSocket.OPEN) {
        try { G.onlineWs.send(JSON.stringify({ type: "newGame" })); } catch (e) {}
      }
      return;
    }
    G.resetGame();
  });
  newGameBtn.addEventListener("click", function () { G.onNewGameWithAdFlow(); });

  function setHumanSymbol(sym) {
    if (G.isOnline() || G.waitingForPeer) return;
    G.humanSymbol = sym; G.robotSymbol = sym === "X" ? "O" : "X";
    G.updateSideButtons(); G.resetGame();
  }
  playAsXBtn.addEventListener("click", function () { setHumanSymbol("X"); });
  playAsOBtn.addEventListener("click", function () { setHumanSymbol("O"); });

  if (langSelect) langSelect.addEventListener("change", function () { G.setLanguage(langSelect.value); });

  function setRobotLevel(level) { G.robotLevel = level; G.updateLevelButtons(); if (G.robotEnabled) G.resetGame(); }
  difficultyTrigger.addEventListener("click", function (e) { e.stopPropagation(); if (difficultyPopover.hidden) openDiff(); else closeDiff(); });
  boardSizeTrigger.addEventListener("click", function (e) { e.stopPropagation(); if (boardSizePopover.hidden) openBoardSize(); else closeBoardSize(); });

  document.addEventListener("click", function (e) {
    if (!difficultyPopover.hidden && !difficultyTrigger.contains(e.target) && !difficultyPopover.contains(e.target)) closeDiff();
    if (!boardSizePopover.hidden && !boardSizeTrigger.contains(e.target) && !boardSizePopover.contains(e.target)) closeBoardSize();
  });
  window.addEventListener("resize", function () {
    closeDiff(); closeBoardSize();
    G.closeLeaderboard();
  });
  window.addEventListener("scroll", function () { closeDiff(); closeBoardSize(); }, true);

  levelEasyBtn.addEventListener("click", function () { setRobotLevel("easy"); closeDiff(); });
  levelNormalBtn.addEventListener("click", function () { setRobotLevel("normal"); closeDiff(); });
  levelHardBtn.addEventListener("click", function () { setRobotLevel("hard"); closeDiff(); });

  playAgainBtn.addEventListener("click", function () { G.onNewGameWithAdFlow(); });
  resultModal.addEventListener("click", function (e) { if (e.target === resultModal) G.closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var op = $("onlinePanel");
      if (!G.robotEnabled && op && !op.hidden) {
        switchToRobotMode();
        e.preventDefault();
        return;
      }
      closeDiff(); closeBoardSize(); G.closeModal(); G.closeShop(); G.closeAdNoticeModal(); G.closeLeaderboard(); G.closeDonateModal(); G.closeProfileModal();
    }
  });

  if (adNoticeOkBtn) adNoticeOkBtn.addEventListener("click", function () { afterAdNoticeConfirmed(); });
  if ($("adNoticeDisableAdsCb")) $("adNoticeDisableAdsCb").addEventListener("change", function () {
    var cb = $("adNoticeDisableAdsCb");
    var expand = $("adNoticePayExpand");
    var hint = $("adNoticePayHint");
    if (expand) expand.hidden = !cb || !cb.checked;
    if (hint && (!cb || !cb.checked)) hint.hidden = true;
    if (cb) cb.setAttribute("aria-expanded", cb.checked ? "true" : "false");
  });
  if ($("adNoticePayBtn")) $("adNoticePayBtn").addEventListener("click", function () {
    var sel = $("adNoticeNoAdsPlan");
    var plan = sel && sel.value === "year" ? "year" : "week";
    if (G.openVkPayNoAds) G.openVkPayNoAds(plan);
  });
  if (adNoticeModal) adNoticeModal.addEventListener("click", function (e) { if (e.target === adNoticeModal) G.closeAdNoticeModal(); });

  if (donateFabBtn) donateFabBtn.addEventListener("click", function () { G.openDonateModal(); });
  if (donateModalCloseBtn) donateModalCloseBtn.addEventListener("click", function () { G.closeDonateModal(); });
  if (donateModal) donateModal.addEventListener("click", function (e) { if (e.target === donateModal) G.closeDonateModal(); });
  if (donateVotesGrid) {
    donateVotesGrid.addEventListener("click", function (e) {
      var btn = e.target.closest(".donate-vote-btn");
      if (!btn || !donateVotesGrid.contains(btn)) return;
      var v = Number(btn.getAttribute("data-votes"));
      if (!Number.isFinite(v)) return;
      if (G.openVotesDonate) G.openVotesDonate(v);
    });
  }

  if (userAvatarBtn) userAvatarBtn.addEventListener("click", function () { G.openProfileModal(); });
  if (profileModalCloseBtn) profileModalCloseBtn.addEventListener("click", function () { G.closeProfileModal(); });
  if (profileModalOkBtn) profileModalOkBtn.addEventListener("click", function () { G.closeProfileModal(); });
  if (profileModal) profileModal.addEventListener("click", function (e) { if (e.target === profileModal) G.closeProfileModal(); });

  if (lbRefreshBtn) lbRefreshBtn.addEventListener("click", function () { G.openLeaderboard(); });
  if (lbToggleBtn) lbToggleBtn.addEventListener("click", function () { G.toggleLeaderboardDrawer(); });
  if (lbDrawerCloseBtn) lbDrawerCloseBtn.addEventListener("click", function () { G.closeLeaderboard(); });
  if (lbDrawerBackdrop) lbDrawerBackdrop.addEventListener("click", function () { G.closeLeaderboard(); });

  boardSizeOptionsEl.addEventListener("click", function (e) {
    var o = e.target.closest(".board-size-opt");
    if (!o || G.isOnline()) return;
    G.boardSize = G.clampBoardSize(Number(o.dataset.size));
    G.winLen = G.boardSize; G.rebuildWinningLines(); G.resetGameLocal(); G.syncBoardSizeUI(); closeBoardSize();
  });

  if (hintBtn) hintBtn.addEventListener("click", function () {
    if (!(G.isAdsSuppressed && G.isAdsSuppressed()) && G.showRewardedAd) G.showRewardedAd(doHint);
    else doHint();
  });
  if (shopBtn) shopBtn.addEventListener("click", function () { G.openShop(); });
  if (shopCloseBtn) shopCloseBtn.addEventListener("click", function () { G.closeShop(); });
  if (shopOverlay) shopOverlay.addEventListener("click", function (e) { if (e.target === shopOverlay) G.closeShop(); });

  function switchToOnlineMode() {
    G.disconnectOnlineSession();
    G.robotEnabled = false;
    G.resetGameLocal();
    G.updateRobotDependentUI();
    G.refreshPlaySideLock();
  }
  function switchToRobotMode() {
    G.disconnectOnlineSession();
    G.robotEnabled = true;
    G.waitingForPeer = false;
    G.hideOpponent();
    G.resetGameLocal();
    G.updateRobotDependentUI();
    G.refreshPlaySideLock();
  }
  if (robotModeBtn) robotModeBtn.addEventListener("click", function () {
    if (G.robotEnabled) switchToOnlineMode();
    else switchToRobotMode();
  });
  if ($("onlinePanelCloseBtn")) $("onlinePanelCloseBtn").addEventListener("click", switchToRobotMode);
  var onlinePanelEl = $("onlinePanel");
  if (onlinePanelEl) {
    onlinePanelEl.addEventListener("click", function (e) {
      if (e.target === onlinePanelEl) switchToRobotMode();
    });
  }

  /* ---- contextmenu / longtap prevention (Yandex Games 1.6.1.8 & 1.6.2.7) ---- */
  document.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  /* ---- init ---- */
  G.initUI = function () {
    G.updateSideButtons(); G.updateLevelButtons(); G.syncBoardSizeUI();
    G.updateRobotDependentUI(); G.updateStatsUI(); G.updateCoinsUI();
    G.resetGame();
    G.closeLeaderboard();
    G.closeDonateModal();
    G.closeProfileModal();
  };

  function initWelcomeOverlay() {
    var overlay = $("welcomeOverlay");
    var btn = $("welcomeEnterBtn");
    if (!overlay || !btn) return;
    G.syncWelcomeI18n();
    if (sessionStorage.getItem(WELCOME_SESSION_KEY)) {
      overlay.hidden = true;
      return;
    }
    overlay.hidden = false;
    document.documentElement.classList.add("welcome-active");
    document.body.classList.add("welcome-active");
    function dismissWelcome() {
      if (overlay.hidden) return;
      sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
      overlay.classList.add("welcome-overlay--leaving");
      document.documentElement.classList.remove("welcome-active");
      document.body.classList.remove("welcome-active");
      window.setTimeout(function () {
        overlay.hidden = true;
        overlay.classList.remove("welcome-overlay--leaving");
      }, 400);
    }
    btn.addEventListener("click", dismissWelcome);
    document.addEventListener(
      "keydown",
      function welcomeOverlayEsc(e) {
        if (e.key !== "Escape" || overlay.hidden) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        dismissWelcome();
      },
      true
    );
    try {
      btn.focus();
    } catch (e0) {}
  }

  initWelcomeOverlay();
})(window.Game);
