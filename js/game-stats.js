/* ============================================================
   游戏统计系统 — 记录分数、游玩次数、最近游玩时间
   用 localStorage 持久化，各游戏页面和首页共享
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'gameParadise_stats_v1';
  var THEME_KEY = 'gameParadise_theme';

  // 游戏元数据：分类、图标、名称
  var GAMES = {
    snake:       { name: '贪吃蛇',    icon: '🐍', cat: '休闲', desc: '经典贪吃蛇，吃食物变长，速度越来越快' },
    tetris:      { name: '俄罗斯方块', icon: '🧱', cat: '休闲', desc: '旋转下落的方块，消除整行得分' },
    minesweeper: { name: '扫雷',      icon: '💣', cat: '益智', desc: '根据数字提示，找出所有隐藏的地雷' },
    '2048':      { name: '2048',     icon: '🔢', cat: '益智', desc: '滑动合并数字，挑战达到 2048' },
    memory:      { name: '记忆翻牌',   icon: '🃏', cat: '益智', desc: '翻开卡牌找到配对，考验你的记忆力' },
    gomoku:      { name: '五子棋',    icon: '⚫', cat: '策略', desc: '先连成五子者胜，经典策略对弈' },
    tank:        { name: '坦克大战',   icon: '🚀', cat: '动作', desc: '驾驶坦克保卫基地，消灭敌方坦克军团' },
    xiangqi:     { name: '中国象棋',   icon: '♟️', cat: '策略', desc: '楚汉对弈，炮马车兵，演绎经典智慧对决' },
    breakout:    { name: '打砖块',    icon: '🏓', cat: '动作', desc: '操控挡板弹球，击碎所有砖块通关' },
    sokoban:     { name: '推箱子',    icon: '📦', cat: '益智', desc: '将所有箱子推到目标位置，考验逻辑思维' },
    match3:      { name: '消消乐',    icon: '💎', cat: '休闲', desc: '交换相邻宝石，三个或以上消除得分' },
  };

  // 读取全部统计
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (_) { return {}; }
  }

  // 保存全部统计
  function save(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  // 记录一次游玩结果
  // gameId: 游戏ID, score: 本局得分
  function record(gameId, score) {
    var data = load();
    var g = data[gameId] || { highScore: 0, plays: 0, lastPlayed: 0 };
    g.plays = (g.plays || 0) + 1;
    if (score !== undefined && score !== null) {
      g.highScore = Math.max(g.highScore || 0, score);
      g.lastScore = score;
    }
    g.lastPlayed = Date.now();
    data[gameId] = g;
    save(data);
    return g;
  }

  // 获取单游戏统计
  function getStats(gameId) {
    var data = load();
    return data[gameId] || { highScore: 0, plays: 0, lastPlayed: 0, lastScore: 0 };
  }

  // 获取最近游玩的游戏列表（按时间排序）
  function getRecent(limit) {
    var data = load();
    var arr = Object.keys(data).map(function (id) {
      return { id: id, lastPlayed: data[id].lastPlayed || 0 };
    });
    arr.sort(function (a, b) { return b.lastPlayed - a.lastPlayed; });
    return arr.filter(function (x) { return x.lastPlayed > 0; }).slice(0, limit || 4).map(function (x) { return x.id; });
  }

  // 获取总游玩次数
  function getTotalPlays() {
    var data = load();
    var total = 0;
    for (var k in data) { total += data[k].plays || 0; }
    return total;
  }

  // 获取总游戏数
  function getGameCount() {
    return Object.keys(GAMES).length;
  }

  // 获取游戏元数据
  function getMeta(gameId) {
    return GAMES[gameId] || null;
  }

  // 获取所有游戏ID
  function getAllGameIds() {
    return Object.keys(GAMES);
  }

  // 获取所有分类
  function getCategories() {
    var cats = {};
    Object.keys(GAMES).forEach(function (id) {
      var c = GAMES[id].cat;
      cats[c] = (cats[c] || 0) + 1;
    });
    return Object.keys(cats);
  }

  // 按分类筛选
  function getByCategory(cat) {
    if (!cat || cat === '全部') return Object.keys(GAMES);
    return Object.keys(GAMES).filter(function (id) { return GAMES[id].cat === cat; });
  }

  // 搜索
  function search(query) {
    if (!query) return Object.keys(GAMES);
    var q = query.toLowerCase();
    return Object.keys(GAMES).filter(function (id) {
      var g = GAMES[id];
      return g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q) || g.cat.toLowerCase().includes(q);
    });
  }

  // 主题
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }
  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  // 初始化主题
  setTheme(getTheme());

  // 暴露 API
  window.GameStats = {
    record: record,
    getStats: getStats,
    getRecent: getRecent,
    getTotalPlays: getTotalPlays,
    getGameCount: getGameCount,
    getMeta: getMeta,
    getAllGameIds: getAllGameIds,
    getCategories: getCategories,
    getByCategory: getByCategory,
    search: search,
    getTheme: getTheme,
    setTheme: setTheme,
    toggleTheme: toggleTheme,
    GAMES: GAMES,
  };
})();
