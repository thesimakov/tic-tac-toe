"use strict";

(function (G) {
  function isVkMiniApp() {
    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get("vk_app_id")) return true;
      if (q.get("vk_platform")) return true;
      if (q.get("vk_access_token_settings")) return true;
    } catch (e) {}
    return false;
  }

  function loadScript(src, onload, onerror) {
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = onload;
    s.onerror = onerror;
    document.head.appendChild(s);
  }

  if (isVkMiniApp()) {
    loadScript(
      "https://unpkg.com/@vkontakte/vk-bridge@2.14.1/dist/browser.min.js",
      function () {
        if (G.initVkSDK) G.initVkSDK();
        else {
          G.lang = G.getUrlLang() || G.lang || "ru";
          G.applyI18n();
          G.initUI();
          if (G.initOnline) G.initOnline();
        }
      },
      function () {
        if (G.initVkSDK) G.initVkSDK();
        else {
          G.lang = G.getUrlLang() || G.lang || "ru";
          G.applyI18n();
          G.initUI();
          if (G.initOnline) G.initOnline();
        }
      }
    );
  } else {
    loadScript(
      "/sdk.js",
      function () {
        if (G.initYandexSDK) G.initYandexSDK();
      },
      function () {
        if (G.initYandexSDK) G.initYandexSDK();
      }
    );
  }
})(window.Game);
