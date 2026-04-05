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
    if (Array.isArray(settings.ownedSkins)) G.ownedSkins = settings.ownedSkins.slice();
    if (settings.skinLeaseExpiry && typeof settings.skinLeaseExpiry === "object") {
      G.skinLeaseExpiry = {};
      Object.keys(settings.skinLeaseExpiry).forEach(function (k) {
        var v = settings.skinLeaseExpiry[k];
        if (typeof v === "number" && !Number.isNaN(v)) G.skinLeaseExpiry[k] = v;
      });
    }
    if (settings.showAds === false) G.showAds = false;
    if (typeof settings.adsFreeUntil === "number" && !Number.isNaN(settings.adsFreeUntil)) {
      G.adsFreeUntil = settings.adsFreeUntil;
    }
    if (G.isLangSupported && G.isLangSupported(settings.manualLang)) G.manualLang = settings.manualLang;

    if (typeof settings.coins === "number" && !Number.isNaN(settings.coins)) {
      G.coins = Math.max(0, Math.floor(settings.coins));
    }
    if (settings.stats) {
      if (typeof settings.stats.wins === "number") G.stats.wins = settings.stats.wins;
      if (typeof settings.stats.losses === "number") G.stats.losses = settings.stats.losses;
      if (typeof settings.stats.draws === "number") G.stats.draws = settings.stats.draws;
    }
    if (settings.skin && G.applySkin) {
      G.activeSkin = settings.skin;
      G.applySkin(settings.skin);
    }
    if (G.validateActiveSkinLease) G.validateActiveSkinLease();
    if (!G.getUrlLang() && G.isLangSupported && G.isLangSupported(G.manualLang)) G.lang = G.manualLang;
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

  function staticCatalogRow(id, titleKey, descKey) {
    var spec = G.shopCoinPrices && G.shopCoinPrices[id];
    var pv = "—";
    if (spec) {
      pv = String(spec.coins) + " " + G.t("shopCoinsShort");
      if (spec.perDay) pv += " " + G.t("shopPerDaySuffix");
    }
    return { id: id, title: G.t(titleKey), description: G.t(descKey), priceValue: pv, price: "" };
  }

  function staticCatalog() {
    return [
      staticCatalogRow("disable_ads", "disableAds", "disableAdsDesc"),
      staticCatalogRow("skin_neon", "skinNeon", "skinNeonDesc"),
      staticCatalogRow("skin_wood", "skinWood", "skinWoodDesc"),
      staticCatalogRow("skin_space", "skinSpace", "skinSpaceDesc")
    ];
  }

  function showVkUser(player) {
    var loginBtn = document.getElementById("loginBtn");
    var userAvatar = document.getElementById("userAvatar");
    var userAvatarBtn = document.getElementById("userAvatarBtn");
    if (loginBtn) loginBtn.hidden = true;
    var name = player.getName() || "";
    G.playerDisplayName = name;
    var photo = player.getPhoto("small");
    if (photo && userAvatar) {
      userAvatar.src = photo;
      userAvatar.hidden = false;
      if (userAvatarBtn) userAvatarBtn.hidden = false;
    }
  }

  function captureVkLaunchParamsForLb() {
    var o = {};
    function feed(qs) {
      if (!qs) return;
      try {
        new URLSearchParams(qs).forEach(function (v, k) {
          if (k === "sign" || k.indexOf("vk_") === 0) o[k] = v;
        });
      } catch (e) {}
    }
    try {
      feed(window.location.search.slice(1));
      var h = window.location.hash || "";
      var qi = h.indexOf("?");
      if (qi >= 0) feed(h.slice(qi + 1).split("#")[0]);
    } catch (e2) {}
    if (o.sign && o.vk_user_id) G.vkLaunchParamsForLb = o;
    else if (Object.keys(o).length) G.vkLaunchParamsForLb = o;
    else G.vkLaunchParamsForLb = null;
  }

  function getVkLbApiUrl() {
    try {
      var m = document.querySelector('meta[name="vk-lb-api-url"]');
      var c = m && m.getAttribute("content");
      if (c != null && String(c).trim() !== "") {
        var u = String(c).trim().replace(/\/$/, "");
        if (u.indexOf("/api/lb/vk") >= 0) return u;
        return u + "/api/lb/vk";
      }
    } catch (e) {}
    try {
      return new URL("/api/lb/vk", window.location.origin).href;
    } catch (e2) {
      return "";
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
      var code = (el ? el.textContent.trim() : "") || (G.hostRoomCode || "").trim();
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
        skinLeaseExpiry: G.skinLeaseExpiry && typeof G.skinLeaseExpiry === "object" ? G.skinLeaseExpiry : {},
        showAds: G.showAds,
        stats: { wins: G.stats.wins, losses: G.stats.losses, draws: G.stats.draws },
        coins: Math.max(0, Math.floor(G.coins || 0))
      };
      if (typeof G.adsFreeUntil === "number" && !Number.isNaN(G.adsFreeUntil)) {
        settings.adsFreeUntil = G.adsFreeUntil;
      }
      if (G.isLangSupported && G.isLangSupported(G.manualLang)) settings.manualLang = G.manualLang;
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

    G.submitScore = function (opts) {
      if (!opts || !opts.humanWin) return;
      var url = getVkLbApiUrl();
      var p = G.vkLaunchParamsForLb;
      if (!url || !p || !p.sign) return;
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          params: p,
          name: G.player && G.player.getName ? G.player.getName() : "",
          photo: G.player && G.player.getPhoto ? G.player.getPhoto("small") : ""
        })
      }).catch(function () {});
    };

    G.loadLeaderboard = function () {
      var url = getVkLbApiUrl();
      if (!url) {
        if (G.renderLeaderboard) G.renderLeaderboard([]);
        return;
      }
      var myId = G.vkLaunchParamsForLb && G.vkLaunchParamsForLb.vk_user_id;
      var sep = url.indexOf("?") >= 0 ? "&" : "?";
      fetch(url + sep + "limit=30")
        .then(function (r) {
          if (!r.ok) throw new Error("bad_status");
          return r.json();
        })
        .then(function (data) {
          var entries = (data.entries || []).map(function (e) {
            return {
              rank: e.rank,
              name: e.name || (G.t ? G.t("guest") : ""),
              avatar: e.avatar || "",
              score: e.score,
              isCurrentPlayer: Boolean(myId && String(e.vkUserId) === String(myId))
            };
          });
          if (G.renderLeaderboard) G.renderLeaderboard(entries);
        })
        .catch(function () {
          if (G.showLeaderboardError) G.showLeaderboardError();
        });
    };

    function getVkAppIdStatic() {
      try {
        var pickQs = function (qs) {
          if (!qs) return 0;
          var id = parseInt(new URLSearchParams(qs).get("vk_app_id") || "0", 10);
          return id > 0 ? id : 0;
        };
        var a = pickQs(window.location.search.slice(1));
        if (a) return a;
        var h = window.location.hash || "";
        var qi = h.indexOf("?");
        if (qi >= 0) {
          a = pickQs(h.slice(qi + 1).split("#")[0]);
          if (a) return a;
        }
        var m = document.querySelector('meta[name="vk-app-id"]');
        if (m && m.content && String(m.content).trim() !== "") {
          var mid = parseInt(String(m.content).trim(), 10);
          if (mid > 0) return mid;
        }
      } catch (e) {}
      return null;
    }

    function resolveVkAppId(done) {
      var id = getVkAppIdStatic();
      if (id) {
        done(id);
        return;
      }
      var b = getBridge();
      if (!b) {
        done(null);
        return;
      }
      b.send("VKWebAppGetLaunchParams", {})
        .then(function (data) {
          var raw = data && (data.vk_app_id != null ? data.vk_app_id : data.app_id);
          var n = parseInt(String(raw || "0"), 10);
          done(n > 0 ? n : null);
        })
        .catch(function () {
          done(null);
        });
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
      if (hint) hint.hidden = true;
      if (!b) {
        if (hint) {
          hint.textContent = G.t("donateVkOnlyHintText");
          hint.hidden = false;
        }
        return;
      }
      resolveVkAppId(function (appId) {
        if (!appId) {
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
      });
    };

    G.openVotesDonate = function (amountVotes) {
      var b = getBridge();
      var hint = document.getElementById("donateVkOnlyHint");
      if (hint) hint.hidden = true;

      if (!b) {
        if (hint) {
          hint.textContent = G.t("donateVkOnlyHintText");
          hint.hidden = false;
        }
        return;
      }

      var allowed = Array.isArray(G.DONATE_VOTE_AMOUNTS) ? G.DONATE_VOTE_AMOUNTS : [1, 5, 10, 50, 100];
      var amount = Math.floor(Number(amountVotes));
      if (allowed.indexOf(amount) === -1) amount = allowed[0] || 1;
      var desc = G.t("donatePayDescription");
      var groupId = getDonateGroupIdFromMeta();

      resolveVkAppId(function (appId) {
        if (!appId) {
          if (hint) {
            hint.textContent = G.t("donateVkOnlyHintText");
            hint.hidden = false;
          }
          return;
        }
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
      });
    };
  }

  G.initVkSDK = function () {
    captureVkLaunchParamsForLb();
    registerVkPlatformAPI();
    wireJoinLinkForVk();
    var b = getBridge();
    if (!b) {
      try {
        var raw = localStorage.getItem(LS_FALLBACK);
        if (raw) parseStorageJson(raw);
      } catch (e0) {}
      if (G.resolveLanguageAfterLoad) G.resolveLanguageAfterLoad();
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
        if (G.resolveLanguageAfterLoad) G.resolveLanguageAfterLoad();
        G.applyI18n();
        catalogCache = staticCatalog();
        if (G.renderShopItems) G.renderShopItems(catalogCache);
        showVkSocialButtons();
        G.initUI();
        if (G.initOnline) G.initOnline();
      });
  };
})(window.Game);
