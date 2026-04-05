"use strict";

(function (G) {
  var STORAGE_KEY = "zeroplus_save_v1";
  var LS_FALLBACK = "zeroplus_vk_local";
  var AD_COOLDOWN = 60000;
  var catalogCache = null;
  var bridgeRef = null;
  var hooksRegistered = false;

  function getBridge() {
    if (bridgeRef) return bridgeRef;
    try {
      var vb = window.vkBridge;
      if (vb && vb.default && typeof vb.default.send === "function") bridgeRef = vb.default;
      else if (vb && typeof vb.send === "function") bridgeRef = vb;
    } catch (e) {}
    return bridgeRef;
  }

  function wrapPlayer(user) {
    var first = (user && user.first_name) || "";
    var last = (user && user.last_name) || "";
    var name = (first + " " + last).trim() || G.t("guest");
    var photo = (user && (user.photo_200 || user.photo_100)) || "";
    return {
      getName: function () { return name; },
      getPhoto: function () { return photo; },
      isAuthorized: function () { return true; }
    };
  }

  function applySettingsPayload(settings) {
    if (!settings || typeof settings !== "object") return;
    if (settings.skin && G.applySkin) {
      G.activeSkin = settings.skin;
      G.applySkin(settings.skin);
    }
    if (Array.isArray(settings.ownedSkins)) G.ownedSkins = settings.ownedSkins.slice();
    if (settings.showAds === false) G.showAds = false;
    if (typeof settings.adsFreeUntil === "number" && !Number.isNaN(settings.adsFreeUntil)) {
      G.adsFreeUntil = settings.adsFreeUntil;
    }
    if (settings.manualLang === "ru" || settings.manualLang === "en") G.manualLang = settings.manualLang;

    if (typeof settings.coins === "number" && !Number.isNaN(settings.coins)) {
      G.coins = Math.max(0, Math.floor(settings.coins));
    }
    if (settings.stats) {
      if (typeof settings.stats.wins === "number") G.stats.wins = settings.stats.wins;
      if (typeof settings.stats.losses === "number") G.stats.losses = settings.stats.losses;
      if (typeof settings.stats.draws === "number") G.stats.draws = settings.stats.draws;
    }
    if (!G.getUrlLang() && (G.manualLang === "ru" || G.manualLang === "en")) G.lang = G.manualLang;
    if (G.updateStatsUI) G.updateStatsUI();
    if (G.updateCoinsUI) G.updateCoinsUI();
    if (G.applyI18n) G.applyI18n();
    if (catalogCache && G.renderShopItems) G.renderShopItems(catalogCache);
  }

  function parseStorageJson(raw) {
    if (!raw || typeof raw !== "string") return;
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.settings) applySettingsPayload(parsed.settings);
      else applySettingsPayload(parsed);
    } catch (e) {}
  }

  function readStorageValue(data) {
    if (!data) return null;
    if (data.keys && data.keys.length) {
      for (var i = 0; i < data.keys.length; i++) {
        var k = data.keys[i];
        if (k && k.key === STORAGE_KEY && k.value) return k.value;
      }
    }
    if (typeof data[STORAGE_KEY] === "string") return data[STORAGE_KEY];
    return null;
  }

  function staticCatalog() {
    return [
      { id: "disable_ads", title: G.t("disableAds"), description: G.t("disableAdsDesc"), priceValue: "—", price: "VK Pay" },
      { id: "skin_neon", title: G.t("skinNeon"), description: G.t("skinNeonDesc"), priceValue: "—", price: "VK Pay" },
      { id: "skin_wood", title: G.t("skinWood"), description: G.t("skinWoodDesc"), priceValue: "—", price: "VK Pay" },
      { id: "skin_space", title: G.t("skinSpace"), description: G.t("skinSpaceDesc"), priceValue: "—", price: "VK Pay" }
    ];
  }

  function showVkUser(player) {
    var loginBtn = document.getElementById("loginBtn");
    var userAvatar = document.getElementById("userAvatar");
    var userName = document.getElementById("userName");
    if (loginBtn) loginBtn.hidden = true;
    var name = player.getName();
    var photo = player.getPhoto("small");
    if (userName) userName.textContent = name;
    if (photo && userAvatar) {
      userAvatar.src = photo;
      userAvatar.hidden = false;
    }
  }

  function wireJoinLinkForVk() {
    try {
      var aid = new URLSearchParams(window.location.search).get("vk_app_id");
      if (aid) {
        G.getJoinLinkForRoom = function (code) {
          return "https://vk.com/app" + encodeURIComponent(aid) + "?join=" + encodeURIComponent(code || "");
        };
      }
    } catch (e) {}
  }

  function showVkSocialButtons() {
    var s = document.getElementById("shareVkBtn");
    var i = document.getElementById("inviteVkBtn");
    if (s) s.hidden = false;
    if (i) i.hidden = false;
  }

  function sendNativeAd(format, afterCallback) {
    var b = getBridge();
    if (!b) {
      if (afterCallback) afterCallback(false);
      return;
    }
    b.send("VKWebAppShowNativeAds", { ad_format: format })
      .then(function (res) {
        G.lastAdTime = Date.now();
        var ok = Boolean(res && (res.result === true || res.result === "true" || res.success));
        if (afterCallback) afterCallback(ok);
      })
      .catch(function () {
        if (afterCallback) afterCallback(false);
      });
  }

  function registerVkPlatformAPI() {
    if (hooksRegistered) return;
    hooksRegistered = true;

    G.shareRoomVk = function () {
      var b = getBridge();
      var el = document.getElementById("roomCodeText");
      var code = el ? el.textContent.trim() : "";
      if (!b || !code) return;
      var link = G.getJoinLinkForRoom ? G.getJoinLinkForRoom(code) : "";
      b.send("VKWebAppShare", {
        link: link,
        text: G.t("roomCode") + ": " + code
      }).catch(function () {});
    };

    G.inviteFriendsVk = function () {
      var b = getBridge();
      if (!b) return;
      var aid = "";
      try { aid = new URLSearchParams(window.location.search).get("vk_app_id") || ""; } catch (e2) {}
      var link = aid ? "https://vk.com/app" + encodeURIComponent(aid) : (window.location.href || "");
      b.send("VKWebAppShare", {
        link: link,
        text: G.t("title")
      }).catch(function () {});
    };

    G.saveCloud = function () {
      var settings = {
        skin: G.activeSkin,
        ownedSkins: G.ownedSkins,
        showAds: G.showAds,
        stats: { wins: G.stats.wins, losses: G.stats.losses, draws: G.stats.draws },
        coins: Math.max(0, Math.floor(G.coins || 0))
      };
      if (typeof G.adsFreeUntil === "number" && !Number.isNaN(G.adsFreeUntil)) {
        settings.adsFreeUntil = G.adsFreeUntil;
      }
      if (G.manualLang === "ru" || G.manualLang === "en") settings.manualLang = G.manualLang;
      var payload = JSON.stringify({ settings: settings });
      try { localStorage.setItem(LS_FALLBACK, payload); } catch (e) {}
      var b = getBridge();
      if (b) {
        b.send("VKWebAppStorageSet", { key: STORAGE_KEY, value: payload }).catch(function () {});
      }
    };

    G.showInterstitialAd = function (afterCallback) {
      if ((G.isAdsSuppressed && G.isAdsSuppressed()) || !getBridge()) {
        if (afterCallback) afterCallback();
        return;
      }
      var now = Date.now();
      if (now - G.lastAdTime < AD_COOLDOWN) {
        if (afterCallback) afterCallback();
        return;
      }
      sendNativeAd("interstitial", function () {
        if (afterCallback) afterCallback();
      });
    };

    G.showNewGameInterstitial = function (afterCallback) {
      if (G.isAdsSuppressed && G.isAdsSuppressed()) {
        if (afterCallback) afterCallback(false);
        return;
      }
      if (!getBridge()) {
        if (afterCallback) afterCallback(true);
        return;
      }
      getBridge()
        .send("VKWebAppShowNativeAds", { ad_format: "interstitial" })
        .then(function (res) {
          G.lastAdTime = Date.now();
          var ok = Boolean(res && (res.result === true || res.result === "true" || res.success));
          if (afterCallback) afterCallback(ok);
        })
        .catch(function () {
          if (afterCallback) afterCallback(false);
        });
    };

    G.showRewardedAd = function (rewardCallback) {
      if (!getBridge()) {
        if (rewardCallback) rewardCallback();
        return;
      }
      sendNativeAd("reward", function (ok) {
        if (rewardCallback && ok) rewardCallback();
      });
    };

    G.doPurchase = function (productId) {
      var b = getBridge();
      if (!b) return;
      b.send("VKWebAppShowOrderBox", { type: "goods", item: productId })
        .then(function (res) {
          var ok = res && (res.success === true || res.status === "success");
          if (!ok) return;
          if (productId === "disable_ads") G.showAds = false;
          else if (String(productId).indexOf("skin_") === 0) {
            if (G.ownedSkins.indexOf(productId) === -1) G.ownedSkins.push(productId);
            if (G.applySkin) G.applySkin(productId);
          }
          if (catalogCache && G.renderShopItems) G.renderShopItems(catalogCache);
          G.saveCloud();
        })
        .catch(function () {});
    };

    G.submitScore = function () {};

    G.loadLeaderboard = function () {
      if (G.renderLeaderboard) G.renderLeaderboard([]);
    };

    function getVkAppIdFromQuery() {
      try {
        var q = new URLSearchParams(window.location.search);
        var id = parseInt(q.get("vk_app_id") || "0", 10);
        return id > 0 ? id : null;
      } catch (e) { return null; }
    }

    function getDonateGroupIdFromMeta() {
      var m = document.querySelector('meta[name="vk-donate-group-id"]');
      if (!m || !m.content) return null;
      var n = parseInt(String(m.content).trim(), 10);
      return Number.isNaN(n) || n <= 0 ? null : n;
    }

    function readMetaVotes(name, fallback) {
      var m = document.querySelector('meta[name="' + name + '"]');
      if (!m || !m.content) return fallback;
      var n = parseInt(String(m.content).trim(), 10);
      return Number.isNaN(n) || n <= 0 ? fallback : n;
    }

    var ADS_FREE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    var ADS_FREE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

    G.openVkPayNoAds = function (plan) {
      var b = getBridge();
      var hint = document.getElementById("adNoticePayHint");
      var appId = getVkAppIdFromQuery();
      if (hint) hint.hidden = true;
      if (!b || !appId) {
        if (hint) {
          hint.textContent = G.t("donateVkOnlyHintText");
          hint.hidden = false;
        }
        return;
      }
      var isYear = plan === "year";
      var votes = isYear
        ? readMetaVotes("vk-ads-year-votes", typeof G.VK_ADS_YEAR_VOTES === "number" ? G.VK_ADS_YEAR_VOTES : 1500)
        : readMetaVotes("vk-ads-week-votes", typeof G.VK_ADS_WEEK_VOTES === "number" ? G.VK_ADS_WEEK_VOTES : 100);
      var desc = isYear ? G.t("adPayYearDesc") : G.t("adPayWeekDesc");
      var duration = isYear ? ADS_FREE_YEAR_MS : ADS_FREE_WEEK_MS;
      var groupId = getDonateGroupIdFromMeta();
      var payload = groupId
        ? { app_id: appId, action: "pay-to-group", params: { group_id: groupId, amount: votes, description: desc } }
        : { app_id: appId, action: "pay-to-service", params: { amount: votes, description: desc } };

      b.send("VKWebAppOpenPayForm", payload)
        .then(function () {
          if (G.extendAdsFreePeriod) G.extendAdsFreePeriod(duration);
          if (G.closeAdNoticeModal) G.closeAdNoticeModal();
          if (G.resetGameLocal) G.resetGameLocal();
        })
        .catch(function () {
          if (hint) {
            hint.textContent = G.t("donateBridgeFail");
            hint.hidden = false;
          }
        });
    };

    G.openVotesDonate = function () {
      var b = getBridge();
      var hint = document.getElementById("donateVkOnlyHint");
      var appId = getVkAppIdFromQuery();
      if (hint) hint.hidden = true;

      if (!b || !appId) {
        if (hint) {
          hint.textContent = G.t("donateVkOnlyHintText");
          hint.hidden = false;
        }
        return;
      }

      var amount = typeof G.VK_DONATE_MIN_VOTES === "number" ? G.VK_DONATE_MIN_VOTES : 7;
      var desc = G.t("donatePayDescription");
      var groupId = getDonateGroupIdFromMeta();
      var payload = groupId
        ? { app_id: appId, action: "pay-to-group", params: { group_id: groupId, amount: amount, description: desc } }
        : { app_id: appId, action: "pay-to-service", params: { amount: amount, description: desc } };

      b.send("VKWebAppOpenPayForm", payload)
        .then(function () {
          if (G.closeDonateModal) G.closeDonateModal();
        })
        .catch(function () {
          if (hint) {
            hint.textContent = G.t("donateBridgeFail");
            hint.hidden = false;
          }
        });
    };
  }

  G.initVkSDK = function () {
    registerVkPlatformAPI();
    wireJoinLinkForVk();
    var b = getBridge();
    if (!b) {
      G.lang = G.getUrlLang() || G.lang || "ru";
      try {
        var raw = localStorage.getItem(LS_FALLBACK);
        if (raw) parseStorageJson(raw);
      } catch (e0) {}
      G.applyI18n();
      G.initUI();
      if (G.initOnline) G.initOnline();
      return;
    }

    b.send("VKWebAppInit", {})
      .then(function () {
        return b.send("VKWebAppGetUserInfo", {});
      })
      .then(function (user) {
        G.player = wrapPlayer(user);
        showVkUser(G.player);
        return b.send("VKWebAppStorageGet", { keys: [STORAGE_KEY] });
      })
      .then(function (data) {
        var raw = readStorageValue(data);
        if (raw) parseStorageJson(raw);
        else {
          try {
            var loc = localStorage.getItem(LS_FALLBACK);
            if (loc) parseStorageJson(loc);
          } catch (e1) {}
        }
      })
      .catch(function () {
        try {
          var loc = localStorage.getItem(LS_FALLBACK);
          if (loc) parseStorageJson(loc);
        } catch (e2) {}
      })
      .then(function () {
        G.lang = G.getUrlLang() || G.lang || "ru";
        G.applyI18n();
        catalogCache = staticCatalog();
        if (G.renderShopItems) G.renderShopItems(catalogCache);
        showVkSocialButtons();
        G.initUI();
        if (G.initOnline) G.initOnline();
      });
  };
})(window.Game);
