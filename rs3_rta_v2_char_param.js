// rs3_rta_v2_char_param.js
// ============================================================
// 役割：
//   ・rs3chrparam.js（RS3_CHAR_DATA）を元に、
//       - 主人公／仲間1〜4プルダウンへキャラ一覧を流し込む
//       - 選択されたキャラに応じて「剣レベル／JP」を自動設定する
//       - お供キャラ（ハーマン／タチアナ）の基礎HPを自動設定する
//   ・現在の選択状態（どの枠にどのキャラIDが入っているか）を
//     rs3_rta_v2_party_state として保持し、
//     他のロジックから参照できるようにする。
//
// 仕様：
//   ・主人公スロットの候補は「ユリアン〜カタリナ」の 8人に限定。
//   ・JP は術適性（蒼龍・朱鳥・白虎・玄武・太陽・月）の上位2つから算出。
//       JP = (最大値 * 3) + 2番目
//     ただし主人公スロットでは JP が 0 の場合、最低値 5 に補正。
//   ・主／仲プルダウンに「選択なし」は置かない。
// ============================================================
(function (global) {
  "use strict";

  // ----------------------------------------------------------
  // 0. 前提チェック
  // ----------------------------------------------------------
  if (!global.RS3_CHAR_DATA || !Array.isArray(global.RS3_CHAR_DATA)) {
    console.warn("[rs3_rta_v2_char_param] RS3_CHAR_DATA が見つかりません。rs3chrparam.js の読み込み順を確認してください。");
    return;
  }

  const CHAR_DATA = global.RS3_CHAR_DATA;

  const CHAR_BY_ID = (function buildCharById() {
    const map = Object.create(null);
    CHAR_DATA.forEach(function (ch) {
      map[ch.id] = ch;
    });
    return map;
  })();

  function toDisplayName(name) {
    return String(name || "").replace(/一/g, "ー");
  }

  const PROTAGONIST_IDS = [0, 1, 2, 3, 4, 5, 6, 7];
  const ALL_ALLY_IDS = CHAR_DATA.map(function (ch) { return ch.id; });

  const DEFAULT_PARTY = {
    main: 7,   // カタリナ
    ally1: 4,  // ハリード
    ally2: 13, // ロビン(細)
    ally3: 28, // ようせい
    ally4: 22  // ハーマン
  };

  function byId(id) {
    return document.getElementById(id) || null;
  }

  function getIntOrNull(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.floor(n);
  }

  const PARTY_SLOTS = [
    {
      roleKey: "main",
      charSelectId: "char-main",
      swordInputId: "sword-main",
      jpInputId: "jp-main",
      labelPrefix: "主",
      candidateIds: PROTAGONIST_IDS
    },
    {
      roleKey: "ally1",
      charSelectId: "char-ally1",
      swordInputId: "sword-ally1",
      jpInputId: "jp-ally1",
      labelPrefix: "仲1",
      candidateIds: ALL_ALLY_IDS
    },
    {
      roleKey: "ally2",
      charSelectId: "char-ally2",
      swordInputId: "sword-ally2",
      jpInputId: "jp-ally2",
      labelPrefix: "仲2",
      candidateIds: ALL_ALLY_IDS
    },
    {
      roleKey: "ally3",
      charSelectId: "char-ally3",
      swordInputId: "sword-ally3",
      jpInputId: "jp-ally3",
      labelPrefix: "仲3",
      candidateIds: ALL_ALLY_IDS
    },
    {
      roleKey: "ally4",
      charSelectId: "char-ally4",
      swordInputId: "sword-ally4",
      jpInputId: "jp-ally4",
      labelPrefix: "仲4",
      candidateIds: ALL_ALLY_IDS
    }
  ];

  const partyState = {
    main: null,
    ally1: null,
    ally2: null,
    ally3: null,
    ally4: null
  };

  // ----------------------------------------------------------
  // 2. 分身剣適正 ＋ アイコン表示制御
  //    ・techtype から「分身剣の閃き適正あり／なし」を判定
  //    ・【適正なし ＞ 王冠 ＞ 何もなし】の優先で
  //      .crown-icon に付けるクラスを決める
  // ----------------------------------------------------------

  // 分身剣：分身剣.txt による techtype ごとの適正表
  // TY00,TY03,TY04,TY06,TY07,TY08 が ×、他は ○
  const BUNSHIN_OK_BY_TECHTYPE = {
    TY00: false,
    TY01: true,
    TY02: true,
    TY03: false,
    TY04: false,
    TY05: true,
    TY06: false,
    TY07: false,
    TY08: false,
    TY09: true,
    TY10: true,
    TY11: true,
    TY12: true,
    TY13: true,
    TY14: true,
    TY15: true
  };

  // RS3_CHAR_DATA 側の techtype を "TY00"〜"TY15" に正規化
  function getTechtypeKeyFromChar(charData) {
    if (!charData || charData.techtype == null) return null;

    var t = charData.techtype;

    // 文字列で持っている場合（例: "ty02" / "TY02"）
    if (typeof t === "string") {
      return String(t).toUpperCase();
    }

    // 数値で持っている場合（例: 2 → "TY02"）
    var n = Number(t);
    if (Number.isFinite(n)) {
      if (n < 0 || n > 15) return null;
      return (n < 10 ? "TY0" : "TY") + String(n);
    }

    return null;
  }

  // 分身剣の閃き適正が「あるかどうか」
  function hasBunshinApt(charData) {
    var key = getTechtypeKeyFromChar(charData);
    if (!key) return false;

    if (!Object.prototype.hasOwnProperty.call(BUNSHIN_OK_BY_TECHTYPE, key)) {
      return false;
    }
    return !!BUNSHIN_OK_BY_TECHTYPE[key];
  }

  // .crown-icon に状態クラスを付け替える
  // state: "nolight" | "crown" | "empty"
  function setIconState(iconEl, state) {
    if (!iconEl) return;

    iconEl.classList.remove("icon-nolight", "icon-crown", "icon-empty");

    if (state === "nolight") {
      iconEl.classList.add("icon-nolight");
    } else if (state === "crown") {
      iconEl.classList.add("icon-crown");
    } else {
      iconEl.classList.add("icon-empty");
    }
  }

  // 対象スロット（main / ally1〜4）に対応する .crown-icon を探す
  // 前提：各キャラ枠の HTML が
  //   <div class="char-cell">
  //     <span class="char-role-label">主:</span>
  //     <span class="crown-icon"></span>
  //     <select id="char-xxxx">...
  //   </div>
  function findIconElementForSlot(slot) {
    var sel = byId(slot.charSelectId);
    if (!sel) return null;

    var cell = sel.closest(".char-cell");
    if (!cell) return null;

    return cell.querySelector(".crown-icon");
  }

  // スロットごとのアイコン状態を更新する
  // 優先順位：【適正なし ＞ 王冠 ＞ 何もなし】
  function updateIconForSlot(slot, charDataOrNull) {
    var iconEl = findIconElementForSlot(slot);
    if (!iconEl) return;

    // キャラ未選択 → 何もなし（空枠）
    if (!charDataOrNull) {
      setIconState(iconEl, "empty");
      return;
    }

    // 分身剣の閃き適正なし → nolight アイコン固定
    if (!hasBunshinApt(charDataOrNull)) {
      setIconState(iconEl, "nolight");
      return;
    }

    // 分身剣適正あり → JP = 0 なら王冠、それ以外は空枠
    var jpInput = byId(slot.jpInputId);
    var jp = 0;

    if (jpInput) {
      var n = Number(jpInput.value);
      if (Number.isFinite(n)) {
        jp = Math.floor(n);
      }
    }

    if (jp === 0) {
      setIconState(iconEl, "crown");
    } else {
      setIconState(iconEl, "empty");
    }
  }


  // ----------------------------------------------------------
  // 3. JP算出ロジック
  // ----------------------------------------------------------
  function computeJP(charData, isMain) {
    const arr = [
      charData.seiryu || 0,
      charData.syucho || 0,
      charData.byakko || 0,
      charData.genbu || 0,
      charData.taiyo || 0,
      charData.tsuki || 0
    ];

    const sorted = arr.slice().sort(function (a, b) { return b - a; });
    const top = sorted[0] || 0;
    const second = sorted[1] || 0;

    let jp = top * 3 + second;

    if (isMain && jp === 0) {
      jp = 5;
    }

    return jp;
  }

  // ----------------------------------------------------------
  // 4. 主／仲プルダウンへキャラ一覧を流し込む
  // ----------------------------------------------------------
  function buildCharOptionsForSelect(selectEl, candidateIds) {
    if (!selectEl) return;

    const chars = candidateIds
      .map(function (id) { return CHAR_BY_ID[id]; })
      .filter(function (ch) { return !!ch; })
      .slice()
      .sort(function (a, b) { return a.id - b.id; });

    selectEl.innerHTML = "";

    chars.forEach(function (ch) {
      const opt = document.createElement("option");
      opt.value = String(ch.id);
      opt.textContent = toDisplayName(ch.name);
      selectEl.appendChild(opt);
    });
  }

  function initAllCharSelects() {
    PARTY_SLOTS.forEach(function (slot) {
      const sel = byId(slot.charSelectId);
      if (!sel) return;
      buildCharOptionsForSelect(sel, slot.candidateIds);
    });
  }

  // ----------------------------------------------------------
  // 5. 主／仲選択 → 剣レベル／JP 自動設定
  // ----------------------------------------------------------
function applyCharSelectionForSlot(slot, charIdOrNull) {
  partyState[slot.roleKey] = charIdOrNull;

  const swordInput = byId(slot.swordInputId);
  const jpInput    = byId(slot.jpInputId);

  // 「選択なし」などでキャラが居ない場合
  if (charIdOrNull == null) {
    if (swordInput) swordInput.value = "0";
    if (jpInput)    jpInput.value    = "0";

    // アイコンも空枠にしておく
    updateIconForSlot(slot, null);
    return;
  }

  const ch = CHAR_BY_ID[charIdOrNull];
  if (!ch) {
    if (swordInput) swordInput.value = "0";
    if (jpInput)    jpInput.value    = "0";

    updateIconForSlot(slot, null);
    return;
  }

  // 剣レベル初期値
  if (swordInput) {
    const swordLv = getIntOrNull(ch.sword);
    swordInput.value = swordLv != null ? String(swordLv) : "0";
  }

  // JP初期値（主人公だけ JP=0 を 5 に補正する既存仕様）
  if (jpInput) {
    const isMain = slot.roleKey === "main";
    const jp     = computeJP(ch, isMain);
    jpInput.value = String(jp);
  }

  // 分身剣適正／JP に応じてアイコン更新
  updateIconForSlot(slot, ch);
}


  function onCharSelectChange(slot, event) {
    const sel = event.currentTarget;
    const val = sel.value;

    const idNum = getIntOrNull(val);
    if (idNum == null) {
      applyCharSelectionForSlot(slot, null);
    } else {
      applyCharSelectionForSlot(slot, idNum);
    }

    if (global.rs3_rta_v2_bunshin_link &&
        typeof global.rs3_rta_v2_bunshin_link.recalc === "function") {
      global.rs3_rta_v2_bunshin_link.recalc();
    }
  }

  function attachCharSelectHandlers() {
    PARTY_SLOTS.forEach(function (slot) {
      const sel = byId(slot.charSelectId);
      if (!sel) return;
      sel.addEventListener("change", onCharSelectChange.bind(null, slot));
    });
  }

  // ----------------------------------------------------------
  // 6. お供キャラ（ハーマン／タチアナ）HP連動
  // ----------------------------------------------------------
  var supportBaseHp = null;  // 現在選択中お供の「基準HP」を保持

  // 現在の support-hp 入力値を基準HPでクランプし、
  // 基準HPとの差分から「お供レベル」を算出して反映する。
  function clampSupportHpAndUpdateLevel() {
    var hpInput = byId("support-hp");
    if (!hpInput) return;

    var base = supportBaseHp != null ? supportBaseHp : 0;
    var raw = getIntOrNull(hpInput.value);
    if (raw == null) raw = base;

    // デフォルト値より小さくならないように下限を固定
    if (raw < base) raw = base;

    // レベル算出： (現在HP - 基準HP) / 15 の切り捨て、下限 0
    var level = 0;
    if (supportBaseHp != null && raw > base) {
      var diff = raw - base;
      level = Math.floor(diff / 15);
      if (level < 0) level = 0;
    }

    hpInput.value = String(raw);

    // ★ お供レベル表示用の入力欄
    // id="support-level" の <input> が存在する前提です。
    // 別IDで運用されている場合は、この取得IDだけ合わせてくださいませ。
    var lvlInput = byId("support-level");
    if (lvlInput) {
      lvlInput.value = String(level);
    }
  }

  function findCharByExactName(name) {
    for (var i = 0; i < CHAR_DATA.length; i++) {
      if (CHAR_DATA[i].name === name) return CHAR_DATA[i];
    }
    return null;
  }

  function findSupportCharData(supportValue) {
    if (supportValue === "herman") {
      return findCharByExactName("ハ一マン");
    }
    if (supportValue === "tatiana") {
      return findCharByExactName("タチアナ");
    }
    return null;
  }

  function applySupportCharSelection(value) {
    const hpInput = byId("support-hp");
    if (!hpInput) return;

    const ch = findSupportCharData(value);
    if (!ch) {
      supportBaseHp = null;
      hpInput.value = "0";

      // お供レベルも 0 にリセット
      var lvlInput = byId("support-level");
      if (lvlInput) {
        lvlInput.value = "0";
      }
      return;
    }

    const baseHp = getIntOrNull(ch.hp);
    const hpValue = baseHp != null ? baseHp : 0;

    // 基準HPを覚えておく
    supportBaseHp = hpValue;

    // 最低値と刻み幅を設定
    hpInput.min = String(hpValue);
    hpInput.step = "15";           // ★ HPスピンボタンは 15 刻み
    hpInput.value = String(hpValue);

    // 基準HP時点でレベル0として反映
    clampSupportHpAndUpdateLevel();
  }

  function onSupportHpChange() {
    clampSupportHpAndUpdateLevel();
  }

  function attachSupportHpHandler() {
    var hpInput = byId("support-hp");
    if (!hpInput) return;

    // スピンボタン／キーボード入力の両方に対応
    hpInput.addEventListener("change", onSupportHpChange);
    hpInput.addEventListener("input", onSupportHpChange);
  }

  function onSupportCharChange(event) {
    const sel = event.currentTarget;
    applySupportCharSelection(sel.value);
  }

  function initSupportChar() {
    const sel = byId("support-char");
    if (!sel) return;

    sel.addEventListener("change", onSupportCharChange);

    // 初期選択に応じて基準HP／レベルを反映
    applySupportCharSelection(sel.value);

    // HP入力の変更を監視して、お供レベルを更新
    attachSupportHpHandler();
  }

  function setupSpinSteps() {
    // 剣レベル／JP は 1 刻み
    PARTY_SLOTS.forEach(function (slot) {
      var swordInput = byId(slot.swordInputId);
      var jpInput = byId(slot.jpInputId);

      if (swordInput) swordInput.step = "1";
      if (jpInput)   jpInput.step = "1";
    });

    // お供HP は 15 刻み（基準HPセット時にも再設定しているが、念のため）
    var supportHp = byId("support-hp");
    if (supportHp) {
      supportHp.step = "15";
    }
  }

  function initCharParam() {
    initAllCharSelects();

    PARTY_SLOTS.forEach(function (slot) {
      const sel = byId(slot.charSelectId);
      if (!sel) return;

      const defaultId = DEFAULT_PARTY[slot.roleKey];

      if (typeof defaultId === "number") {
        sel.value = String(defaultId);
        applyCharSelectionForSlot(slot, defaultId);
      } else if (sel.options.length > 0) {
        const firstId = getIntOrNull(sel.options[0].value);
        if (firstId != null) {
          sel.value = sel.options[0].value;
          applyCharSelectionForSlot(slot, firstId);
        } else {
          applyCharSelectionForSlot(slot, null);
        }
      } else {
        applyCharSelectionForSlot(slot, null);
      }
    });

    attachCharSelectHandlers();
    initSupportChar();

    // ★ スピンボタンの刻み幅を設定
    setupSpinSteps();

    if (global.rs3_rta_v2_bunshin_link &&
        typeof global.rs3_rta_v2_bunshin_link.recalc === "function") {
      global.rs3_rta_v2_bunshin_link.recalc();
    }
  }


  // ----------------------------------------------------------
  // 7. 初期化 & 外部公開
  // ----------------------------------------------------------
  function initCharParam() {
    initAllCharSelects();

    PARTY_SLOTS.forEach(function (slot) {
      const sel = byId(slot.charSelectId);
      if (!sel) return;

      const defaultId = DEFAULT_PARTY[slot.roleKey];

      if (typeof defaultId === "number") {
        sel.value = String(defaultId);
        applyCharSelectionForSlot(slot, defaultId);
      } else if (sel.options.length > 0) {
        const firstId = getIntOrNull(sel.options[0].value);
        if (firstId != null) {
          sel.value = sel.options[0].value;
          applyCharSelectionForSlot(slot, firstId);
        } else {
          applyCharSelectionForSlot(slot, null);
        }
      } else {
        applyCharSelectionForSlot(slot, null);
      }
    });

    attachCharSelectHandlers();
    initSupportChar();

    if (global.rs3_rta_v2_bunshin_link &&
        typeof global.rs3_rta_v2_bunshin_link.recalc === "function") {
      global.rs3_rta_v2_bunshin_link.recalc();
    }
  }

  // ----------------------------------------------------------
  // 7. スピンボタン（▲▼）共通処理
  //   ・剣レベル／JP：1刻み
  //   ・お供HP：15刻み（step属性に従う）
  //   ・お供HPは基準値より小さくならないようにし、
  //     15ごとにお供LVを1ずつ上げる
  // ----------------------------------------------------------

  // 汎用：number入力を step 分だけ増減させる
  function adjustNumberInputBySpin(input, direction) {
    if (!input) return;

    var step = parseInt(input.step, 10);
    if (!Number.isFinite(step) || step <= 0) {
      step = 1;
    }

    var min = null;
    if (input.min !== "") {
      var minVal = parseInt(input.min, 10);
      if (Number.isFinite(minVal)) min = minVal;
    }

    var max = null;
    if (input.max !== "") {
      var maxVal = parseInt(input.max, 10);
      if (Number.isFinite(maxVal)) max = maxVal;
    }

    var value = parseInt(input.value, 10);
    if (!Number.isFinite(value)) {
      value = 0;
    }

    value = value + step * direction;

    if (min != null && value < min) value = min;
    if (max != null && value > max) value = max;

    input.value = String(value);
  
  // ★ ここから追加：もともとブラウザがやっていた input/change を自前で飛ばす
  var evInput = new Event("input",  { bubbles: true });
  var evChange = new Event("change", { bubbles: true });
  input.dispatchEvent(evInput);
  input.dispatchEvent(evChange);
}

  // お供HP → お供LV の反映
  function updateSupportLevelFromHp() {
    var hpInput = document.getElementById("support-hp");
    var lvSpan  = document.getElementById("support-lv");
    var sel     = document.getElementById("support-char");

    if (!hpInput || !lvSpan) return;

    var hp = parseInt(hpInput.value, 10);
    if (!Number.isFinite(hp)) {
      hp = 0;
    }

    // 基準HPの決定（指定どおり固定値）
    var baseHp = null;
    if (sel) {
      if (sel.value === "herman") {
        baseHp = 210;
      } else if (sel.value === "tatiana") {
        baseHp = 65;
      }
    }

    // support-char が不明な場合は、min か現在値を基準にしておく
    if (baseHp == null) {
      var min = parseInt(hpInput.min, 10);
      if (Number.isFinite(min)) {
        baseHp = min;
      } else {
        baseHp = hp;
      }
    }

    // 「デフォルト値より小さくならない」ようにクランプ
    if (hp < baseHp) {
      hp = baseHp;
      hpInput.value = String(hp);
    }

    // 念のため min 属性も揃えておく
    hpInput.min = String(baseHp);

    // レベル算出： (HP - 基準HP) / 15 の切り捨て、下限0
    var diff = hp - baseHp;
    var level = 0;
    if (diff > 0) {
      level = Math.floor(diff / 15);
      if (level < 0) level = 0;
    }

    lvSpan.textContent = String(level);
  }

  // スピンボタンが押されたときの処理
  function handleSpinButtonClick(buttonEl) {
    if (!buttonEl.classList.contains("spin-btn")) return;

    // 同じ .spin-wrap 内の input[type=number] を探す
    var wrap = buttonEl.closest(".spin-wrap");
    if (!wrap) return;

    var input = wrap.querySelector("input[type='number']");
    if (!input) return;

    var direction = buttonEl.classList.contains("spin-up") ? +1 : -1;

    adjustNumberInputBySpin(input, direction);

    // お供HPの場合はレベルも更新
    if (input.id === "support-hp") {
      updateSupportLevelFromHp();
    }
  }

  // 初期化：全スピンボタンにイベントを貼る
  function attachSpinHandlers() {
    // 個別に全部に付けてもよいですが、
    // 将来ボタンが増えても動くようにイベント委譲にしておきます。
    var root = document.getElementById("rta-v2-root") || document;
    root.addEventListener("click", function (ev) {
      var target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains("spin-btn")) {
        handleSpinButtonClick(target);
      }
    });

    // お供HPを手入力で変えたときもレベルを再計算
    var hpInput = document.getElementById("support-hp");
    if (hpInput) {
      hpInput.addEventListener("change", updateSupportLevelFromHp);
      hpInput.addEventListener("input", updateSupportLevelFromHp);
    }

    // お供キャラを切り替えたときも基準HP／レベルを再計算
    var sel = document.getElementById("support-char");
    if (sel) {
      sel.addEventListener("change", function () {
        updateSupportLevelFromHp();
      });
    }
  }


  document.addEventListener("DOMContentLoaded", function () {
    initCharParam();

    // スピンボタンのイベントと、お供LV連動を初期化
    attachSpinHandlers();
    updateSupportLevelFromHp();  // 初期表示を基準HP・LV0に揃える
  });

  global.rs3_rta_v2_party_state = {
    getState: function () {
      return {
        main: partyState.main,
        ally1: partyState.ally1,
        ally2: partyState.ally2,
        ally3: partyState.ally3,
        ally4: partyState.ally4
      };
    }
  };

})(this);
