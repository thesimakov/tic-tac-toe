"use strict";

window.Game = window.Game || {};

(function (G) {
  /* ---- i18n ---- */
  G.lang = "ru";
  G.texts = {
    ru: {
      title: "Крестики-нолики",
      welcomeTitle: "Крестики-нолики",
      welcomeSub: "Сыграй с роботом или с другом онлайн — жми «Войти» и поехали!",
      welcomeEnter: "Войти",
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
      noServerHint:
        "Локально: в папке server выполните npm install и node server.js, откройте игру по адресу http://localhost:8080/. " +
        "Для своего хоста укажите wss в <meta name=\"game-ws-url\"> в index.html или константу GAME_SERVER_URL в js/game-online.js; " +
        "временно можно передать ?ws=wss://ваш-сервер в адресе страницы.",
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
      timeout: "Соперник не найден. Сыграть с роботом?",
      timeoutYes: "Да, с роботом", timeoutNo: "Искать дальше",
      leaderboard: "Рейтинг", lbToggleAria: "Открыть или закрыть рейтинг",
      statsLabel: "Победы / Поражения / Ничьи",
      lbLoading: "Загрузка рейтинга…", lbEmpty: "Пока нет записей",
      lbError: "Не удалось загрузить рейтинг", lbYou: "(вы)",
      lbRefresh: "Обновить",
      score: "Очки",
      adNoticeTitle: "Реклама",
      adNoticeBody: "Сейчас будет небольшая реклама, мы дарим Вам за это 1 монету, на эти монеты скоро можно купить скины.",
      adNoticeOk: "Хорошо",
      adNoAdsOffer: "Отключить рекламу",
      adPayPlanAria: "Период без рекламы",
      adPaySubmit: "Оплатить голосами",
      adPayWeekBtn: "2 голоса · неделя",
      adPayYearBtn: "5 голосов · месяц",
      adPayWeekDesc: "Отключение рекламы на 7 дней",
      adPayYearDesc: "Отключение рекламы на 1 месяц",
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
      onlinePanelCloseAria: "Закрыть и играть с роботом",
      switchToOnline: "Играть онлайн",
      switchToRobot: "Играть с роботом",
      onlineDisabledHint: "Онлайн временно недоступен — подключаем сервер.",
      connectToPlay: "Найдите соперника или введите код комнаты.",
      donateFabAria: "Поддержать проект",
      donateTitle: "Ваш донат важен для нас",
      donateBody: "Спасибо за поддержку. Выберите сумму в голосах — откроется форма оплаты ВКонтакте.",
      donateVoteOne: "1 голос",
      donateVotesPlural: "голосов",
      donateVotesGroupAria: "Сумма пожертвования в голосах ВКонтакте",
      donateSubmit: "Пожертвовать",
      donatePayDescription: "Пожертвование на развитие игры",
      donateVkOnlyHintText: "Оплата голосами доступна в приложении ВКонтакте.",
      donateCloseAria: "Закрыть окно доната",
      donateBridgeFail: "Не удалось открыть форму оплаты. Попробуйте позже.",
      shopCoinVoteRate: "Скины и отключение рекламы: 1 монета = 1 голосу. Пакеты монет: база 15 монет за 1 голос; крупные пакеты выгоднее.",
      coinPackName: "{n} монет",
      coinPackDesc: "Пополнение баланса. Оплата голосами ВК или через каталог Яндекс Игр.",
      coinPackPayDescription: "Покупка {n} монет",
      coinPackPriceNote: "вместо {base} при базе без скидки",
      shopCoinsShort: "монет",
      shopPerDaySuffix: "(сутки)",
      shopNotEnoughCoins: "Недостаточно монет.",
      shopPurchaseOk: "Покупка оформлена!",
      profileTitle: "Профиль",
      profileAvatarBtnAria: "Профиль",
      profileStatsCaption: "Статистика"
    },
    en: {
      title: "Tic-Tac-Toe",
      welcomeTitle: "Tic-Tac-Toe",
      welcomeSub: "Play vs bot or a friend online — tap below and go!",
      welcomeEnter: "Play",
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
      noServerHint:
        "Local: cd server && npm install && node server.js, then open http://localhost:8080/. " +
        "For production set wss in <meta name=\"game-ws-url\"> in index.html or GAME_SERVER_URL in js/game-online.js; " +
        "you can override with ?ws=wss://your-host in the page URL.",
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
      timeout: "No opponent found. Play with bot?",
      timeoutYes: "Yes, bot", timeoutNo: "Keep searching",
      leaderboard: "Leaderboard", lbToggleAria: "Open or close leaderboard",
      statsLabel: "Wins / Losses / Draws",
      lbLoading: "Loading leaderboard…", lbEmpty: "No entries yet",
      lbError: "Failed to load leaderboard", lbYou: "(you)",
      lbRefresh: "Refresh",
      score: "Score",
      adNoticeTitle: "Ad",
      adNoticeBody: "A short ad will play now. We’ll give you 1 coin for watching — you’ll soon be able to spend it on skins.",
      adNoticeOk: "OK",
      adNoAdsOffer: "Remove ads",
      adPayPlanAria: "Ad-free period",
      adPaySubmit: "Pay with votes",
      adPayWeekBtn: "2 votes · 1 week",
      adPayYearBtn: "5 votes · 1 month",
      adPayWeekDesc: "No ads for 7 days",
      adPayYearDesc: "No ads for 1 month",
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
      onlinePanelCloseAria: "Close and play vs bot",
      switchToOnline: "Play online",
      switchToRobot: "Play vs bot",
      onlineDisabledHint: "Online is temporarily unavailable while we connect the server.",
      connectToPlay: "Find an opponent or enter a room code.",
      donateFabAria: "Support the project",
      donateTitle: "Your donation means a lot",
      donateBody: "Thank you for your support. Choose an amount in votes to open the VK payment form.",
      donateVoteOne: "1 vote",
      donateVotesPlural: "votes",
      donateVotesGroupAria: "Donation amount in VK votes",
      donateSubmit: "Donate",
      donateVkOnlyHintText: "Vote payments are available in the VK app.",
      donatePayDescription: "Donation to support the game",
      donateCloseAria: "Close donation dialog",
      donateBridgeFail: "Could not open the payment form. Try again later.",
      shopCoinVoteRate: "Skins & no-ads: 1 coin = 1 vote. Coin packs: base 15 coins per vote; larger packs cost less per coin.",
      coinPackName: "{n} coins",
      coinPackDesc: "Top up your balance. Pay with VK votes or via Yandex Games catalog.",
      coinPackPayDescription: "Purchase {n} coins",
      coinPackPriceNote: "instead of {base} at base rate",
      shopCoinsShort: "coins",
      shopPerDaySuffix: "(per day)",
      shopNotEnoughCoins: "Not enough coins.",
      shopPurchaseOk: "Purchase complete!",
      profileTitle: "Profile",
      profileAvatarBtnAria: "Profile",
      profileStatsCaption: "Stats"
    }
  };

  /** Выбранный вручную язык: null = авто (браузер / регион / SDK). */
  G.manualLang = null;

  G.isLangSupported = function (code) {
    return Boolean(code && G.texts && G.texts[code]);
  };

  G.detectLocaleLang = function () {
    var list = [];
    if (typeof navigator.languages !== "undefined" && navigator.languages.length) {
      for (var i = 0; i < navigator.languages.length; i++) list.push(navigator.languages[i]);
    }
    if (navigator.language) list.push(navigator.language);
    try {
      list.push(Intl.DateTimeFormat().resolvedOptions().locale);
    } catch (e0) {}
    var seen = {};
    for (var j = 0; j < list.length; j++) {
      var loc = list[j];
      if (!loc || seen[loc]) continue;
      seen[loc] = true;
      var base = String(loc).split("-")[0].toLowerCase();
      if (G.isLangSupported(base)) return base;
    }
    for (var k = 0; k < list.length; k++) {
      var loc2 = list[k];
      if (!loc2) continue;
      var parts = String(loc2).split("-");
      if (parts.length >= 2) {
        var reg = parts[parts.length - 1].replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (reg === "KZ" && G.isLangSupported("kk")) return "kk";
        if (reg === "UZ" && G.isLangSupported("uz")) return "uz";
        if (reg === "TJ" && G.isLangSupported("tg")) return "tg";
        if (reg === "KG" && G.isLangSupported("ky")) return "ky";
        if (reg === "RU" && G.isLangSupported("ru")) return "ru";
        if ((reg === "US" || reg === "GB" || reg === "AU") && G.isLangSupported("en")) return "en";
      }
    }
    return "ru";
  };

  /** Параметр ?lang= в URL (приоритет над облаком при старте). */
  G.getUrlLang = function () {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q && G.isLangSupported(q)) return q;
    } catch (e) {}
    return null;
  };

  /** После загрузки облака: URL → сохранённый вручную → язык/регион браузера. */
  G.resolveLanguageAfterLoad = function () {
    var url = G.getUrlLang();
    if (url) {
      G.lang = url;
      return;
    }
    if (G.isLangSupported(G.manualLang)) {
      G.lang = G.manualLang;
      return;
    }
    G.lang = G.detectLocaleLang();
  };

  G.setLanguage = function (code) {
    if (!G.isLangSupported(code)) return;
    G.lang = code;
    G.manualLang = code;
    if (G.applyI18n) G.applyI18n();
    if (G.saveCloud) G.saveCloud();
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
  /** Код комнаты хоста (пригласить друга); дублируется в DOM при смене языка / UI. */
  G.hostRoomCode = "";

  /* SDK state */
  G.ysdk = null;
  G.player = null;
  G.payments = null;
  G.showAds = true;
  /** Время (ms), до которого действует оплата «без рекламы» через VKWebAppOpenPayForm. */
  G.adsFreeUntil = null;
  G.playerDisplayName = "";
  G.activeSkin = null;
  G.ownedSkins = [];
  /** Срок аренды тем (мс): skin_id → timestamp окончания. */
  G.skinLeaseExpiry = {};
  G.lastAdTime = 0;
  G.stats = { wins: 0, losses: 0, draws: 0 };
  G.coins = 0;
  G.COINS_PER_NEW_GAME_AD = 1;

  var SHOP_DAY_MS = 86400000;

  /**
   * Базовая цена пака без скидки: ⌈монеты / 15⌉ голосов (15 монет = 1 голос).
   * Скидка в UI: округление (base − votes) / base в процентах.
   */
  G.coinPackBaselineVotes = function (coins) {
    var c = Math.floor(Number(coins) || 0);
    if (c < 1) c = 1;
    return Math.ceil(c / 15);
  };

  G.coinPackDiscountPct = function (coins, votes) {
    var base = G.coinPackBaselineVotes(coins);
    var v = Math.floor(Number(votes) || 0);
    if (base < 1 || v >= base) return 0;
    return Math.max(0, Math.min(99, Math.round(100 * (base - v) / base)));
  };

  G.shopCoinPacks = [
    { id: "coins_15", coins: 15, votes: 1 },
    { id: "coins_50", coins: 50, votes: 3 },
    { id: "coins_150", coins: 150, votes: 9 },
    { id: "coins_500", coins: 500, votes: 30 },
    { id: "coins_1000", coins: 1000, votes: 50 },
    { id: "coins_5000", coins: 5000, votes: 270 }
  ];

  /** Цены в монетах внутриигровые (1 монета = 1 голосу для скинов). Темы — аренда на сутки. */
  G.shopCoinPrices = {
    disable_ads: { coins: 14, perDay: false },
    skin_wood: { coins: 5, perDay: true },
    skin_space: { coins: 10, perDay: true }
  };

  G.getCoinPackById = function (id) {
    var packs = G.shopCoinPacks;
    if (!packs || !id) return null;
    for (var i = 0; i < packs.length; i++) {
      if (packs[i].id === id) return packs[i];
    }
    return null;
  };

  G.grantCoinPack = function (packId) {
    var p = G.getCoinPackById(packId);
    if (!p) return;
    G.coins = Math.max(0, Math.floor(G.coins + p.coins));
    if (G.updateCoinsUI) G.updateCoinsUI();
    if (G.saveCloud) G.saveCloud();
    if (G.showShopFlash) G.showShopFlash(G.t("shopPurchaseOk"));
    if (G.renderShopItems && G._shopCatalogLast) G.renderShopItems(G._shopCatalogLast);
  };

  G.isShopProductOwned = function (id) {
    if (id === "disable_ads") return G.showAds === false;
    if (String(id).indexOf("skin_") !== 0) return false;
    if (G.ownedSkins.indexOf(id) !== -1) return true;
    var until = (G.skinLeaseExpiry && G.skinLeaseExpiry[id]) || 0;
    return until > Date.now();
  };

  G.validateActiveSkinLease = function () {
    if (!G.activeSkin || String(G.activeSkin).indexOf("skin_") !== 0) return;
    if (G.ownedSkins.indexOf(G.activeSkin) !== -1) return;
    var until = (G.skinLeaseExpiry && G.skinLeaseExpiry[G.activeSkin]) || 0;
    if (until > Date.now()) return;
    G.activeSkin = null;
    if (G.applySkin) G.applySkin(null);
  };

  G.purchaseShopItem = function (productId) {
    if (G.getCoinPackById && G.getCoinPackById(productId)) {
      if (G.openCoinPackPayVk) {
        G.openCoinPackPayVk(productId);
        return;
      }
      if (G.doPurchase) {
        G.doPurchase(productId);
        return;
      }
      if (G.showShopFlash) G.showShopFlash(G.t("donateVkOnlyHintText"));
      return;
    }
    if (productId === "disable_ads" && G.showAds === false) return;
    if (String(productId).indexOf("skin_") === 0 && G.ownedSkins.indexOf(productId) !== -1) return;
    var spec = G.shopCoinPrices && G.shopCoinPrices[productId];
    if (!spec) {
      if (G.doPurchase) G.doPurchase(productId);
      return;
    }
    var cost = spec.coins;
    if (G.coins < cost) {
      if (G.showShopFlash) G.showShopFlash(G.t("shopNotEnoughCoins"));
      else if (typeof window !== "undefined" && window.alert) window.alert(G.t("shopNotEnoughCoins"));
      return;
    }
    G.coins = Math.max(0, Math.floor(G.coins - cost));
    if (productId === "disable_ads") {
      G.showAds = false;
    } else if (String(productId).indexOf("skin_") === 0) {
      if (!G.skinLeaseExpiry) G.skinLeaseExpiry = {};
      var prev = G.skinLeaseExpiry[productId] || 0;
      var base = Math.max(Date.now(), prev);
      G.skinLeaseExpiry[productId] = base + SHOP_DAY_MS;
      G.activeSkin = productId;
      if (G.applySkin) G.applySkin(productId);
    }
    if (G.updateCoinsUI) G.updateCoinsUI();
    if (G.saveCloud) G.saveCloud();
    if (G.showShopFlash) G.showShopFlash(G.t("shopPurchaseOk"));
    if (G.renderShopItems && G._shopCatalogLast) G.renderShopItems(G._shopCatalogLast);
  };

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

  /** Допустимые суммы доната в голосах (VKWebAppOpenPayForm). */
  G.DONATE_VOTE_AMOUNTS = [1, 5, 10, 50, 100];

  /** @deprecated используйте DONATE_VOTE_AMOUNTS; оставлено для совместимости. */
  G.VK_DONATE_MIN_VOTES = 1;

  G.donateVotesLabel = function (n) {
    var v = Math.floor(Number(n));
    if (!Number.isFinite(v)) v = 0;
    v = Math.abs(v);
    if (G.lang === "ru") {
      var m10 = v % 10;
      var m100 = v % 100;
      if (m10 === 1 && m100 !== 11) return String(v) + "\u00a0голос";
      if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return String(v) + "\u00a0голоса";
      return String(v) + "\u00a0голосов";
    }
    if (v === 1) return G.t("donateVoteOne");
    return String(v) + "\u00a0" + G.t("donateVotesPlural");
  };
  /** Значения по умолчанию; переопределяются meta vk-ads-week-votes / vk-ads-month-votes. */
  G.VK_ADS_WEEK_VOTES = 2;
  G.VK_ADS_YEAR_VOTES = 5;

  G.isAdsSuppressed = function () {
    if (G.showAds === false) return true;
    if (typeof G.adsFreeUntil === "number" && G.adsFreeUntil > Date.now()) return true;
    return false;
  };

  G.extendAdsFreePeriod = function (durationMs) {
    var now = Date.now();
    var base = (typeof G.adsFreeUntil === "number" && G.adsFreeUntil > now) ? G.adsFreeUntil : now;
    G.adsFreeUntil = base + durationMs;
    if (G.saveCloud) G.saveCloud();
  };

  G.openVkPayNoAds = function (plan) {
    void plan;
    var hint = document.getElementById("adNoticePayHint");
    if (hint) {
      hint.textContent = G.t("donateVkOnlyHintText");
      hint.hidden = false;
    }
  };

  G.openVotesDonate = function (amountVotes) {
    var allowed = Array.isArray(G.DONATE_VOTE_AMOUNTS) ? G.DONATE_VOTE_AMOUNTS : [1, 5, 10, 50, 100];
    var amount = Math.floor(Number(amountVotes));
    if (allowed.indexOf(amount) === -1) amount = allowed[0] || 1;
    void amount;
    var el = document.getElementById("donateVkOnlyHint");
    if (el) {
      el.textContent = G.t("donateVkOnlyHintText");
      el.hidden = false;
    }
  };

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
