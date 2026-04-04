# Крестики-нолики — Яндекс Игры

Онлайн-игра «Крестики-нолики» с интеграцией Яндекс Игры SDK: автоматический поиск соперника, приглашение друзей, внутриигровые покупки, реклама, облачные сохранения.

## Возможности

- **Размер поля** — от **3×3** до **10×10**
- **Робот** — три уровня сложности (minimax для 3×3)
- **Онлайн** — автоматический матчмейкинг + приглашение друга по коду
- **Яндекс ID** — авторизация, аватар, имя
- **Магазин** — отключение рекламы, скины/темы оформления
- **Реклама** — interstitial между партиями, rewarded video за подсказку
- **Облачные сохранения** — скины, статистика, настройки
- **Локализация** — русский и английский (автоопределение через SDK)

## Структура

```
├── index.html          # HTML-каркас
├── style.css           # Стили + темы скинов
├── js/
│   ├── game-core.js    # Состояние, i18n, проверка победы
│   ├── game-ai.js      # Робот (minimax, эвристики)
│   ├── game-ui.js      # DOM, анимации, модалки, магазин
│   ├── game-online.js  # WebSocket-клиент, матчмейкинг
│   └── yandex-sdk.js   # Обёртка SDK: auth, ads, payments, saves
├── server/
│   ├── server.js       # WebSocket-сервер (Node.js + ws)
│   └── package.json
├── Dockerfile          # Для деплоя сервера
└── README.md
```

## Локальная разработка

```bash
cd server
npm install
npm start
```

Откройте `http://localhost:8080/`. Сервер отдаёт страницу и поднимает WebSocket.

## Деплой

### Клиент (Яндекс Игры)

Заархивируйте в ZIP (без `server/` и `node_modules/`):

```
index.html
style.css
js/game-core.js
js/game-ai.js
js/game-ui.js
js/game-online.js
js/yandex-sdk.js
```

Загрузите архив через [Консоль разработчика Яндекс Игр](https://games.yandex.com/console).

### Сервер (WebSocket для онлайна)

Сервер нужно развернуть отдельно — Яндекс Игры хостят только статику.

**Render.com** (бесплатный тир):

1. Создайте Web Service, подключите репозиторий
2. Build Command: `cd server && npm install`
3. Start Command: `node server/server.js`
4. Environment: `PORT=8080`

**Docker:**

```bash
docker build -t zeroplus .
docker run -p 8080:8080 zeroplus
```

### Настройка URL сервера

В файле `js/game-online.js` измените константу `GAME_SERVER_URL` на адрес вашего сервера:

```js
var GAME_SERVER_URL = "wss://your-server.onrender.com";
```

## Настройка покупок

1. В [Консоли разработчика](https://games.yandex.com/console) включите покупки
2. Напишите на `games-partners@yandex-team.com` для активации
3. Добавьте товары: `disable_ads`, `skin_neon`, `skin_wood`, `skin_space`

## Требования Яндекс Игр

Игра соответствует [требованиям к играм](https://yandex.ru/dev/games/doc/ru/concepts/requirements):

- SDK подключён через `/sdk.js` (п. 1.1)
- Авторизация по кнопке + гостевой вход (п. 1.2)
- Звук останавливается при сворачивании (п. 1.3)
- Реклама только через SDK (п. 1.5)
- Адаптивный полноэкранный режим (п. 1.6)
- Нет контекстного меню / longtap (п. 1.6.1.8, 1.6.2.7)
- Облачные сохранения (п. 1.9)
- Нет browser scroll (п. 1.10.2)
- Покупки с консумированием (п. 1.13)
- SDK init + LoadingAPI.ready() + GameplayAPI (п. 1.19)
- Автоопределение языка (п. 2.14)
