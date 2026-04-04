"use strict";

window.Game = window.Game || {};

(function (G) {
  /* ---- i18n ---- */
  G.lang = "ru";
  G.texts = {
    ru: {
      title: "Крестики-нолики",
      playAsX: "Играть за X", playAsO: "Играть за O",
      fieldSize: "Размер поля",
      reset: "Сброс игры", newGame: "Новая игра",
      robotOn: "Робот: Вкл", robotOff: "Робот: Выкл",
      diffTitle: "Уровень сложности",
      easy: "Легко", normal: "Нормально", hard: "Сложно",
      turnX: "Ход: крестики (X)", turnO: "Ход: нолики (O)",
      robotThinks: "Робот думает...",
      robotTurn: "Ход робота",
      yourTurn: "Ваш ход",
      opponentTurn: "Ход соперника",
      waitPeer: "Ожидаем второго игрока…",
      winX: "Победили крестики", winO: "Победили нолики", draw: "Ничья",
      winMsg: "Отличная игра. Нажмите, чтобы начать заново.",
      loseMsg: "Не расстраивайся, попробуй сыграть ещё раз — у тебя точно получится!",
      drawMsg: "Все клетки заняты. Сыграем еще раз?",
      gameOver: "Игра окончена", playAgain: "Сыграть снова",
      onlineTitle: "Онлайн-игра",
      findMatch: "Найти соперника", inviteFriend: "Пригласить друга",
      searching: "Поиск соперника...", cancel: "Отмена",
      roomCode: "Код", copy: "Копировать", join: "Войти",
      copied: "Скопировано в буфер обмена.",
      connecting: "Подключение…",
      noServer: "Нет связи с сервером.",
      roomNotFound: "Комната не найдена или уже занята",
      peerJoined: "Соперник подключился!",
      peerLeft: "Соперник вышел. Ожидаем нового игрока.",
      hostLeft: "Комната закрыта хостом.",
      disconnected: "Отключено от сервера.",
      disconnect: "Отключиться",
      enterCode: "Введите код комнаты (от 4 символов).",
      inRoom: "Вы в комнате.",
      waitCode: "Ждём второго игрока. Передайте код или ссылку.",
      login: "Войти", guest: "Гость",
      shop: "Магазин", close: "Закрыть",
      shopCourierNotice: "Ожидаем курьера с товаром. Зайдите позже, или подпишитесь на нашу группу в ВК.",
      subscribeVk: "Подписаться",
      disableAds: "Без рекламы", disableAdsDesc: "Отключить всю рекламу",
      skinNeon: "Тема: Неон", skinNeonDesc: "Неоновая тема оформления",
      skinWood: "Тема: Дерево", skinWoodDesc: "Деревянная тема оформления",
      skinSpace: "Тема: Космос", skinSpaceDesc: "Космическая тема оформления",
      owned: "Куплено", buy: "Купить", hintBtn: "Подсказка",
      wow: ["Вау!","Круто!","Супер!","Класс!","Ура!","Ого!","Кайф!","Найс!","Так держать!","Огонь!","Бум!","Есть!","Шик!","Мощно!","Зачёт!"],
      celeb: ["НЕВЕРОЯТНО!","ВАУ!","ПОТРЯСАЮЩЕ!","СУПЕР!"],
      bannerWin: "Ура! Ты выиграл!",
      howToPlay: "Нажимайте на клетки, чтобы ставить фигуры. Выстройте ряд своих фигур — по горизонтали, вертикали или диагонали.",
      timeout: "Соперник не найден. Сыграть с роботом?",
      timeoutYes: "Да, с роботом", timeoutNo: "Искать дальше",
      leaderboard: "Рейтинг", lbToggleAria: "Открыть или закрыть рейтинг",
      statsLabel: "Победы / Поражения / Ничьи",
      lbLoading: "Загрузка рейтинга…", lbEmpty: "Пока нет записей",
      lbError: "Не удалось загрузить рейтинг", lbYou: "(вы)",
      lbRefresh: "Обновить",
      score: "Очки",
      adNoticeTitle: "Реклама",
      adNoticeBody: "Сейчас будет небольшая реклама, мы дарим Вам за это 10 монет, на эти монеты скоро можно купить скины.",
      adNoticeOk: "Хорошо",
      coins: "Монеты",
      langGroupAria: "Язык интерфейса",
      playSideAria: "Сторона и размер поля",
      difficultyPickerAria: "Выбор уровня сложности робота",
      resultHint: "Результат",
      statsBarAria: "Счёт: победы, поражения, ничьи",
      boardAria: "Игровое поле {n} на {n}",
      cellAria: "Клетка {r}, {c}",
      shareRoomVk: "Поделиться в ВК",
      inviteVkFriends: "Пригласить в ВК",
      playVsRobot: "Против робота",
      playOnline: "Онлайн",
      switchToOnline: "Играть онлайн",
      switchToRobot: "Играть с роботом",
      connectToPlay: "Найдите соперника или введите код комнаты."
    },
    en: {
      title: "Tic-Tac-Toe",
      playAsX: "Play as X", playAsO: "Play as O",
      fieldSize: "Board size",
      reset: "Reset", newGame: "New game",
      robotOn: "Bot: On", robotOff: "Bot: Off",
      diffTitle: "Difficulty",
      easy: "Easy", normal: "Normal", hard: "Hard",
      turnX: "Turn: X", turnO: "Turn: O",
      robotThinks: "Bot is thinking...",
      robotTurn: "Bot's turn",
      yourTurn: "Your turn",
      opponentTurn: "Opponent's turn",
      waitPeer: "Waiting for opponent…",
      winX: "X wins!", winO: "O wins!", draw: "Draw",
      winMsg: "Great game! Press to play again.",
      loseMsg: "Don't worry, try again — you can do it!",
      drawMsg: "All cells taken. Play again?",
      gameOver: "Game over", playAgain: "Play again",
      onlineTitle: "Online",
      findMatch: "Find opponent", inviteFriend: "Invite friend",
      searching: "Searching...", cancel: "Cancel",
      roomCode: "Code", copy: "Copy", join: "Join",
      copied: "Copied to clipboard.",
      connecting: "Connecting…",
      noServer: "Cannot reach server.",
      roomNotFound: "Room not found or full",
      peerJoined: "Opponent joined!",
      peerLeft: "Opponent left. Waiting for a new player.",
      hostLeft: "Room closed by host.",
      disconnected: "Disconnected.",
      disconnect: "Disconnect",
      enterCode: "Enter room code (4+ characters).",
      inRoom: "You are in the room.",
      waitCode: "Waiting for opponent. Share the code.",
      login: "Login", guest: "Guest",
      shop: "Shop", close: "Close",
      shopCourierNotice: "We're waiting for the courier with your order. Check back later or join our VK group.",
      subscribeVk: "Subscribe",
      disableAds: "No Ads", disableAdsDesc: "Disable all ads",
      skinNeon: "Theme: Neon", skinNeonDesc: "Neon color theme",
      skinWood: "Theme: Wood", skinWoodDesc: "Wooden color theme",
      skinSpace: "Theme: Space", skinSpaceDesc: "Space color theme",
      owned: "Owned", buy: "Buy", hintBtn: "Hint",
      wow: ["Wow!","Cool!","Super!","Nice!","Yay!","Great!","Boom!","Yes!","Awesome!","Nice one!","Sweet!","Nailed it!","Crushed it!","Epic!","Love it!"],
      celeb: ["INCREDIBLE!","WOW!","AMAZING!","SUPER!"],
      bannerWin: "You won!",
      howToPlay: "Tap cells to place marks. Line up your marks in a row — horizontally, vertically, or diagonally.",
      timeout: "No opponent found. Play with bot?",
      timeoutYes: "Yes, bot", timeoutNo: "Keep searching",
      leaderboard: "Leaderboard", lbToggleAria: "Open or close leaderboard",
      statsLabel: "Wins / Losses / Draws",
      lbLoading: "Loading leaderboard…", lbEmpty: "No entries yet",
      lbError: "Failed to load leaderboard", lbYou: "(you)",
      lbRefresh: "Refresh",
      score: "Score",
      adNoticeTitle: "Ad",
      adNoticeBody: "A short ad will play now. We’ll give you 10 coins for watching — you’ll soon be able to spend them on skins.",
      adNoticeOk: "OK",
      coins: "Coins",
      langGroupAria: "Interface language",
      playSideAria: "Side and board size",
      difficultyPickerAria: "Bot difficulty level",
      resultHint: "Result",
      statsBarAria: "Score: wins, losses, draws",
      boardAria: "Game board {n} by {n}",
      cellAria: "Cell {r}, {c}",
      shareRoomVk: "Share in VK",
      inviteVkFriends: "Invite VK friends",
      playVsRobot: "Vs bot",
      playOnline: "Online",
      switchToOnline: "Play online",
      switchToRobot: "Play vs bot",
      connectToPlay: "Find an opponent or enter a room code."
    }
  };

  /** Выбранный вручную язык: null = только SDK / URL при старте */
  G.manualLang = null;

  G.setLanguage = function (code) {
    if (!G.texts[code]) return;
    G.lang = code;
    G.manualLang = code;
    if (G.applyI18n) G.applyI18n();
    if (G.saveCloud) G.saveCloud();
  };

  /** Параметр ?lang=ru|en в URL (приоритет над облаком при первом показе). */
  G.getUrlLang = function () {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "en" || q === "ru") return q;
    } catch (e) {}
    return null;
  };

  G.t = function (key) {
    var table = G.texts[G.lang] || G.texts.ru;
    return table[key] !== undefined ? table[key] : (G.texts.ru[key] || key);
  };

  /* ---- game state ---- */
  G.boardSize = 3;
  G.winLen = 3;
  G.winningLines = [];
  G.board = Array(9).fill(null);
  G.currentPlayer = "X";
  G.gameOver = false;
  G.winner = null;
  G.robotEnabled = true;
  G.robotThinking = false;
  G.humanSymbol = "X";
  G.robotSymbol = "O";
  G.robotLevel = "normal";
  G.waitingForPeer = false;
  G.onlineWs = null;
  G.onlineRole = null;
  G.myOnlineSymbol = null;

  /* SDK state */
  G.ysdk = null;
  G.player = null;
  G.payments = null;
  G.showAds = true;
  G.activeSkin = null;
  G.ownedSkins = [];
  G.lastAdTime = 0;
  G.stats = { wins: 0, losses: 0, draws: 0 };
  G.coins = 0;
  G.COINS_PER_NEW_GAME_AD = 10;

  /* ---- helpers ---- */
  G.clampBoardSize = function (n) {
    var x = Number(n);
    if (Number.isNaN(x)) return 3;
    return Math.min(10, Math.max(3, Math.floor(x)));
  };

  G.buildWinningLines = function (size, len) {
    var lines = [];
    for (var r = 0; r < size; r++)
      for (var c = 0; c <= size - len; c++) {
        var line = [];
        for (var k = 0; k < len; k++) line.push(r * size + c + k);
        lines.push(line);
      }
    for (var c2 = 0; c2 < size; c2++)
      for (var r2 = 0; r2 <= size - len; r2++) {
        var line2 = [];
        for (var k2 = 0; k2 < len; k2++) line2.push((r2 + k2) * size + c2);
        lines.push(line2);
      }
    for (var r3 = 0; r3 <= size - len; r3++)
      for (var c3 = 0; c3 <= size - len; c3++) {
        var line3 = [];
        for (var k3 = 0; k3 < len; k3++) line3.push((r3 + k3) * size + (c3 + k3));
        lines.push(line3);
      }
    for (var r4 = 0; r4 <= size - len; r4++)
      for (var c4 = len - 1; c4 < size; c4++) {
        var line4 = [];
        for (var k4 = 0; k4 < len; k4++) line4.push((r4 + k4) * size + (c4 - k4));
        lines.push(line4);
      }
    return lines;
  };

  G.rebuildWinningLines = function () {
    G.winningLines = G.buildWinningLines(G.boardSize, G.winLen);
  };

  G.checkWinner = function () {
    for (var i = 0; i < G.winningLines.length; i++) {
      var idxs = G.winningLines[i];
      var first = G.board[idxs[0]];
      if (!first) continue;
      var win = true;
      for (var j = 1; j < idxs.length; j++) { if (G.board[idxs[j]] !== first) { win = false; break; } }
      if (win) return first;
    }
    return null;
  };

  /** Индексы клеток выигрышной линии или null (при ничьей / нет победителя). */
  G.getWinningLineIndices = function () {
    for (var i = 0; i < G.winningLines.length; i++) {
      var idxs = G.winningLines[i];
      var first = G.board[idxs[0]];
      if (!first) continue;
      var win = true;
      for (var j = 1; j < idxs.length; j++) { if (G.board[idxs[j]] !== first) { win = false; break; } }
      if (win) return idxs.slice();
    }
    return null;
  };

  G.isDraw = function () {
    return G.board.every(function (c) { return c !== null; });
  };

  /** Переопределяется в game-online.js после загрузки модуля. */
  G.isOnline = function () { return false; };

  /** Ссылка с параметром join для приглашения друга (VK SDK может подставить URL мини-приложения). */
  G.getJoinLinkForRoom = function (code) {
    try {
      return window.location.origin + window.location.pathname + "?join=" + encodeURIComponent(code || "");
    } catch (e) { return ""; }
  };

  G.disconnectOnlineSession = function () {};
  G.initOnline = function () {};

  G.getCenterCellIndices = function () {
    var n = G.boardSize, c0 = Math.floor((n - 1) / 2), c1 = Math.ceil((n - 1) / 2), out = [];
    [c0, c1].forEach(function (r) { [c0, c1].forEach(function (cc) { var idx = r * n + cc; if (out.indexOf(idx) === -1) out.push(idx); }); });
    return out;
  };

  G.getCornerIndices = function () {
    var n = G.boardSize, last = n * n - 1;
    return [0, n - 1, n * (n - 1), last];
  };

  G.rebuildWinningLines();
})(window.Game);
