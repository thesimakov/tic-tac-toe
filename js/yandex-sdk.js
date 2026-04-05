"use strict";

(function (G) {
  var AD_COOLDOWN = 60000;
  var catalogCache = null;

  function detectLang(ysdk) {
    try {
      var raw = ysdk.environment.i18n.lang;
      if (raw) {
        var base = String(raw).split("-")[0].toLowerCase();
        if (G.isLangSupported && G.isLangSupported(base)) return base;
      }
    } catch (e) {}
    return G.detectLocaleLang ? G.detectLocaleLang() : "ru";
  }

  function initPayments(ysdk) {
    ysdk.getPayments().then(function (payments) {
      G.payments = payments;
      checkPendingPurchases(payments);
      loadCatalog(payments);
    }).catch(function () {});
  }

  function checkPendingPurchases(payments) {
    payments.getPurchases().then(function (purchases) {
      purchases.forEach(function (p) {
        if (p.productID === "disable_ads") {
          G.showAds = false;
        } else if (p.productID.startsWith("skin_")) {
          if (G.ownedSkins.indexOf(p.productID) === -1) G.ownedSkins.push(p.productID);
          payments.consumePurchase(p.purchaseToken);
        }
      });
    }).catch(function () {});
  }

  function loadCatalog(payments) {
    payments.getCatalog().then(function (products) {
      catalogCache = products;
      G.renderShopItems(products);
    }).catch(function () {});
  }

  G.doPurchase = function (productId) {
    if (!G.payments) return;
    G.payments.purchase({ id: productId }).then(function (purchase) {
      if (productId === "disable_ads") {
        G.showAds = false;
      } else if (productId.startsWith("skin_")) {
        if (G.ownedSkins.indexOf(productId) === -1) G.ownedSkins.push(productId);
        G.applySkin(productId);
        G.payments.consumePurchase(purchase.purchaseToken);
      }
      if (catalogCache) G.renderShopItems(catalogCache);
      if (G.saveCloud) G.saveCloud();
    }).catch(function () {});
  };

  G.showInterstitialAd = function (afterCallback) {
    if ((G.isAdsSuppressed && G.isAdsSuppressed()) || !G.ysdk) { if (afterCallback) afterCallback(); return; }
    var now = Date.now();
    if (now - G.lastAdTime < AD_COOLDOWN) { if (afterCallback) afterCallback(); return; }
    G.ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: function () {
          try { G.ysdk.features.GameplayAPI.stop(); } catch (e) {}
        },
        onClose: function (wasShown) {
          G.lastAdTime = Date.now();
          try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
          if (afterCallback) afterCallback();
        },
        onError: function () {
          try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
          if (afterCallback) afterCallback();
        }
      }
    });
  };

  /** Полноэкранная реклама при «Новая игра» — каждый раз, без кулдауна. afterCallback(earnedReward). */
  G.showNewGameInterstitial = function (afterCallback) {
    if (G.isAdsSuppressed && G.isAdsSuppressed()) {
      if (afterCallback) afterCallback(false);
      return;
    }
    if (!G.ysdk) {
      /* Вне платформы Яндекса рекламу не показать — награда из модалки всё равно обещана игроку */
      if (afterCallback) afterCallback(true);
      return;
    }
    var advDidOpen = false;
    G.ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: function () {
          advDidOpen = true;
          try { G.ysdk.features.GameplayAPI.stop(); } catch (e) {}
        },
        onClose: function (wasShown) {
          G.lastAdTime = Date.now();
          try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
          /* SDK иногда отдаёт wasShown: false, хотя onOpen уже был — не лишаем монет */
          var ok = Boolean(wasShown) || advDidOpen;
          if (afterCallback) afterCallback(ok);
        },
        onError: function () {
          try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
          if (afterCallback) afterCallback(false);
        }
      }
    });
  };

  G.showRewardedAd = function (rewardCallback) {
    if (!G.ysdk) { if (rewardCallback) rewardCallback(); return; }
    G.ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: function () {
          try { G.ysdk.features.GameplayAPI.stop(); } catch (e) {}
        },
        onRewarded: function () {
          if (rewardCallback) rewardCallback();
        },
        onClose: function () {
          try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
        },
        onError: function () {
          try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
        }
      }
    });
  };

  /* ---- auth ---- */
  function initAuth(ysdk) {
    var loginBtn = document.getElementById("loginBtn");
    var userBar = document.getElementById("userBar");
    var userAvatar = document.getElementById("userAvatar");
    var userAvatarBtn = document.getElementById("userAvatarBtn");

    ysdk.getPlayer({ scopes: false }).then(function (player) {
      G.player = player;
      var authorized = typeof player.isAuthorized === "function"
        ? player.isAuthorized()
        : (player.getMode && player.getMode() !== "lite");
      if (!authorized) {
        if (loginBtn) loginBtn.hidden = false;
      } else {
        showPlayerInfo(player);
      }
      loadCloudData(player);
    }).catch(function () {});

    function showPlayerInfo(player) {
      if (loginBtn) loginBtn.hidden = true;
      var name = player.getName() || "";
      G.playerDisplayName = name;
      var photo = player.getPhoto("small");
      if (photo && userAvatar) {
        userAvatar.src = photo;
        userAvatar.hidden = false;
        if (userAvatarBtn) userAvatarBtn.hidden = false;
      }
      if (userBar) userBar.hidden = false;
    }

    if (loginBtn) loginBtn.addEventListener("click", function () {
      ysdk.auth.openAuthDialog().then(function () {
        ysdk.getPlayer({ scopes: false }).then(function (player) {
          G.player = player;
          showPlayerInfo(player);
          loadCloudData(player);
        });
      }).catch(function () {});
    });
  }

  /* ---- облако Яндекса: player.getData/setData + player.getStats/setStats (см. документацию SDK) ---- */
  function loadCloudData(player) {
    if (!player || !player.getData) return;
    var dataP = player.getData(["settings"]).catch(function () { return {}; });
    var statsP = (player.getStats && typeof player.getStats === "function")
      ? player.getStats(["coins", "wins", "losses", "draws"]).catch(function () { return {}; })
      : Promise.resolve({});

    Promise.all([dataP, statsP]).then(function (pair) {
      var data = pair[0] || {};
      var cloudStats = pair[1] || {};
      var s = data.settings;

      if (s) {
        if (Array.isArray(s.ownedSkins)) G.ownedSkins = s.ownedSkins;
        if (s.skinLeaseExpiry && typeof s.skinLeaseExpiry === "object") {
          G.skinLeaseExpiry = {};
          Object.keys(s.skinLeaseExpiry).forEach(function (k) {
            var v = s.skinLeaseExpiry[k];
            if (typeof v === "number" && !Number.isNaN(v)) G.skinLeaseExpiry[k] = v;
          });
        }
        if (s.showAds === false) G.showAds = false;
        if (typeof s.adsFreeUntil === "number" && !Number.isNaN(s.adsFreeUntil)) G.adsFreeUntil = s.adsFreeUntil;
        if (G.isLangSupported && G.isLangSupported(s.manualLang)) G.manualLang = s.manualLang;
        if (s.skin && G.applySkin) {
          G.activeSkin = s.skin;
          G.applySkin(s.skin);
        }
        if (G.validateActiveSkinLease) G.validateActiveSkinLease();
      }

      if (typeof cloudStats.coins === "number" && !Number.isNaN(cloudStats.coins)) {
        G.coins = Math.max(0, Math.floor(cloudStats.coins));
      } else if (s && typeof s.coins === "number" && !Number.isNaN(s.coins)) {
        G.coins = Math.max(0, Math.floor(s.coins));
      }

      var hw = typeof cloudStats.wins === "number" && !Number.isNaN(cloudStats.wins);
      var hl = typeof cloudStats.losses === "number" && !Number.isNaN(cloudStats.losses);
      var hd = typeof cloudStats.draws === "number" && !Number.isNaN(cloudStats.draws);
      if (hw) G.stats.wins = cloudStats.wins;
      else if (s && s.stats) G.stats.wins = s.stats.wins || 0;
      if (hl) G.stats.losses = cloudStats.losses;
      else if (s && s.stats) G.stats.losses = s.stats.losses || 0;
      if (hd) G.stats.draws = cloudStats.draws;
      else if (s && s.stats) G.stats.draws = s.stats.draws || 0;

      if (!G.getUrlLang() && G.isLangSupported && G.isLangSupported(G.manualLang)) G.lang = G.manualLang;
      if (G.updateStatsUI) G.updateStatsUI();
      if (G.updateCoinsUI) G.updateCoinsUI();
      if (G.applyI18n) G.applyI18n();
      if (catalogCache) G.renderShopItems(catalogCache);
    }).catch(function () {});
  }

  /**
   * Сохранение на сервер Яндекса: setData (настройки) + setStats (монеты/статистика — рекомендовано SDK).
   * @see https://yandex.ru/dev/games/doc/ru/sdk/sdk-player.html#sdk-player__ingame-data
   */
  G.saveCloud = function () {
    if (!G.player || !G.player.setData) return;
    var settings = {
      skin: G.activeSkin,
      ownedSkins: G.ownedSkins,
      skinLeaseExpiry: G.skinLeaseExpiry && typeof G.skinLeaseExpiry === "object" ? G.skinLeaseExpiry : {},
      showAds: G.showAds,
      stats: { wins: G.stats.wins, losses: G.stats.losses, draws: G.stats.draws },
      coins: Math.max(0, Math.floor(G.coins || 0))
    };
    if (typeof G.adsFreeUntil === "number" && !Number.isNaN(G.adsFreeUntil)) settings.adsFreeUntil = G.adsFreeUntil;
    if (G.isLangSupported && G.isLangSupported(G.manualLang)) settings.manualLang = G.manualLang;

    var flush = true;
    var pData = G.player.setData({ settings: settings }, flush);

    var pStats = Promise.resolve();
    if (G.player.setStats && typeof G.player.setStats === "function") {
      pStats = G.player.setStats({
        coins: Math.max(0, Math.floor(G.coins || 0)),
        wins: Math.max(0, Math.floor(G.stats.wins || 0)),
        losses: Math.max(0, Math.floor(G.stats.losses || 0)),
        draws: Math.max(0, Math.floor(G.stats.draws || 0))
      });
    }

    Promise.all([pData, pStats]).catch(function () {});
  };

  /* ---- leaderboard ---- */
  var lbInstance = null;
  var LEADERBOARD_NAME = "wins";

  function initLeaderboard(ysdk) {
    ysdk.getLeaderboards().then(function (lb) {
      lbInstance = lb;
      if (G.openLeaderboard) G.openLeaderboard();
    }).catch(function () {
      if (G.openLeaderboard) G.openLeaderboard();
    });
  }

  /* Аргумент { humanWin } из game-ui игнорируется — в Яндексе пишется суммарное число побед. */
  G.submitScore = function () {
    if (!lbInstance) return;
    lbInstance.setLeaderboardScore(LEADERBOARD_NAME, G.stats.wins).catch(function () {});
  };

  G.loadLeaderboard = function () {
    if (!lbInstance) { G.showLeaderboardError(); return; }
    lbInstance.getLeaderboardEntries(LEADERBOARD_NAME, { quantityTop: 10, includeUser: true })
      .then(function (res) {
        var entries = (res.entries || []).map(function (e) {
          var p = e.player || {};
          return {
            rank: e.rank,
            name: p.publicName || G.t("guest"),
            avatar: p.scopePermissions && p.scopePermissions.avatar !== "forbid"
              ? (p.getAvatarSrc ? p.getAvatarSrc("small") : "")
              : "",
            score: e.score,
            isCurrentPlayer: Boolean(e.player && G.player && e.player.uniqueID === G.player.getUniqueID())
          };
        });
        G.renderLeaderboard(entries);
      })
      .catch(function () { G.showLeaderboardError(); });
  };

  /* ---- visibility / pause ---- */
  document.addEventListener("visibilitychange", function () {
    if (!G.ysdk) return;
    if (document.hidden) {
      try { G.ysdk.features.GameplayAPI.stop(); } catch (e) {}
    } else {
      try { G.ysdk.features.GameplayAPI.start(); } catch (e) {}
    }
  });

  /* ---- SDK init ---- */
  G.initYandexSDK = function () {
    if (typeof YaGames === "undefined") {
      if (G.resolveLanguageAfterLoad) G.resolveLanguageAfterLoad();
      G.applyI18n(); G.initUI();
      if (G.initOnline) G.initOnline();
      if (G.openLeaderboard) G.openLeaderboard();
      return;
    }
    YaGames.init().then(function (ysdk) {
      G.ysdk = ysdk;
      G.lang = G.getUrlLang() || detectLang(ysdk);
      G.applyI18n();

      try { ysdk.features.LoadingAPI.ready(); } catch (e) {}
      try { ysdk.features.GameplayAPI.start(); } catch (e) {}

      initAuth(ysdk);
      initPayments(ysdk);
      initLeaderboard(ysdk);

      G.initUI();
      if (G.initOnline) G.initOnline();
    }).catch(function () {
      if (G.resolveLanguageAfterLoad) G.resolveLanguageAfterLoad();
      G.applyI18n(); G.initUI();
      if (G.initOnline) G.initOnline();
      if (G.openLeaderboard) G.openLeaderboard();
    });
  };
})(window.Game);
