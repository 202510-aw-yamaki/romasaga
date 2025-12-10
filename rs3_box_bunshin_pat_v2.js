// rs3_box_bunshin_pat_v2.js
// ------------------------------------------------------------
// 分身剣想定ダメージ＋形態X ブロック専用スクリプト
//
// 役割：
//   1) 「破壊するものの形態」UI（patternX）の状態管理
//      - 現在選択している形態インデックス（0〜9）の保持
//      - 中央ラベル＋左右ラベル＋「現在：○」表示の更新
//   2) 分身剣想定ダメージ（最小／最大）の計算ラッパー
//      - 計算本体は bunshin_sword_99.js に委譲
//      - 剣レベル・敵 vit・敵斬防が指定されない場合のデフォルト補完
//      - 陣形補正（前列／後列）を最小・最大の両方に適用
//
// 前提：
//   - HTML 側で bunshin_sword_99.js の後に読み込まれること。
//   - ①〜⑤の入力欄：
//       bun-dmg-max-1〜5, bun-dmg-min-1〜5, bun-sword-lv-1〜5
//   - 形態X 表示：
//       .patternx-area 内に id="pattern-x-value" が存在すること
//     （prev/next のラベルやボタンは、あれば連携／なければスキップ）
//
// 丸め規則：
//   - bunshin_sword_99.js と揃えて
//       ・割り算を行うたびに Math.floor で小数点以下切り捨て
//       ・平方根をとるときも Math.floor
//   - 陣形補正 1.25 倍は「×5 → ÷4 → floor」で実装
// ------------------------------------------------------------
(function (global) {
  "use strict";

  // ==========================================================
  // 1. 形態X（破壊するものの形態）管理
  // ==========================================================

  /**
   * 形態10種の定義
   *
   * index 対応：
   *   0: 闇（強）   → 表記: 闇強
   *   1: 形態1      → 表記: ①
   *   2: 形態2      → 表記: ②
   *   3: 形態3      → 表記: ③
   *   4: 形態4      → 表記: ④
   *   5: 闇（弱）   → 表記: 闇弱
   *   6: 獣魔・蒼龍 → 表記: 蒼龍
   *   7: 獣魔・朱鳥 → 表記: 朱鳥
   *   8: 獣魔・白虎 → 表記: 白虎
   *   9: 獣魔・玄武 → 表記: 玄武
   *
   * vit / slash は「敵データ(順番付き).txt」から抽出した値。
   */
  const PATTERN_LIST = [
    // 0: 闇の翼（強）
    { index: 0, code: "dark-strong", symbol: "闇強", label: "破壊するもの(闇の翼:強)",   vit: 50, slash: 28 },
    // 1〜4: 通常形態1〜4
    { index: 1, code: "normal-1",    symbol: "①",   label: "破壊するもの(普通1)",       vit: 45, slash: 45 },
    { index: 2, code: "normal-2",    symbol: "②",   label: "破壊するもの(普通2)",       vit: 46, slash: 33 },
    { index: 3, code: "normal-3",    symbol: "③",   label: "破壊するもの(普通3)",       vit: 40, slash: 28 },
    { index: 4, code: "normal-4",    symbol: "④",   label: "破壊するもの(普通4)",       vit: 40, slash: 23 },
    // 5: 闇の翼（弱）
    { index: 5, code: "dark-weak",   symbol: "闇弱", label: "破壊するもの(闇の翼:弱)",   vit: 35, slash: 11 },
  // 6〜9: 獣魔4体
  { index: 6, code: "beast-wind",  symbol: "蒼龍", label: "破壊するもの(獣魔:蒼龍)",   vit: 40, slash: 20, hp: 14000 },
  { index: 7, code: "beast-fire",  symbol: "朱鳥", label: "破壊するもの(獣魔:朱鳥)",   vit: 35, slash: 16, hp: 12000 },
  { index: 8, code: "beast-earth", symbol: "白虎", label: "破壊するもの(獣魔:白虎)",   vit: 50, slash: 22, hp: 16000 },
  { index: 9, code: "beast-water", symbol: "玄武", label: "破壊するもの(獣魔:玄武)",   vit: 50, slash: 24, hp: 18000 }
];


  // 現在の形態インデックス（0〜9）※初期値は 1（①：形態1）
  let currentPatternIndex = 1;

  // DOM要素（存在しない場合は null のまま）
  let prevLabelEl    = null;
  let currentLabelEl = null;
  let nextLabelEl    = null;
  let prevButtonEl   = null;
  let nextButtonEl   = null;
  let valueLabelEl   = null; // 「現在：○」の値（pattern-x-value）
  let hpValueEl      = null; // 獣魔形態HP表示用（pattern-x-hp-value）

  /**
   * インデックスを 0〜PATTERN_LIST.length-1 の範囲に正規化（ループ）する。
   */
  function normalizePatternIndex(idx) {
    const n = PATTERN_LIST.length;
    if (n === 0) return 0;
    const r = ((idx % n) + n) % n;
    return r;
  }

  /**
   * 指定インデックスの形態情報を取得する。
   */
  function getPatternByIndex(idx) {
    const fixed = normalizePatternIndex(idx);
    return PATTERN_LIST[fixed] || null;
  }

  /**
   * 現在の形態情報を取得する。
   */
  function getCurrentPattern() {
    return getPatternByIndex(currentPatternIndex);
  }

  /**
   * 現在インデックスを指定値に設定する。
   */
  function setPatternIndex(idx) {
    currentPatternIndex = normalizePatternIndex(idx);
    updatePatternDisplay();
  }

  /**
   * 現在インデックスを相対的に移動する（-1, +1 など）。
   */
  function shiftPattern(delta) {
    setPatternIndex(currentPatternIndex + delta);
  }

  /**
   * 形態選択UIのラベル表示を更新する。
   * - 左右ラベル（前後の形態）
   * - 中央ラベル（現在の形態）
   * - 「現在：○」の表示（pattern-x-value）があればそこも同期
   */
function updatePatternDisplay() {
  const cur  = getPatternByIndex(currentPatternIndex);
  const prev = getPatternByIndex(currentPatternIndex - 1);
  const next = getPatternByIndex(currentPatternIndex + 1);

  if (currentLabelEl && cur) {
    currentLabelEl.textContent = cur.symbol;
  }
  if (prevLabelEl && prev) {
    prevLabelEl.textContent = prev.symbol;
  }
  if (nextLabelEl && next) {
    nextLabelEl.textContent = next.symbol;
  }
  if (valueLabelEl && cur) {
    valueLabelEl.textContent = cur.symbol;
  }

  // ★ここから獣魔形態HPの表示（関数の内側）
  if (hpValueEl) {
    if (cur && typeof cur.hp === "number" && cur.hp > 0) {
      hpValueEl.textContent = String(cur.hp);
    } else {
      // 獣魔形態以外や hp 未設定時は「-」
      hpValueEl.textContent = "-";
    }
  }
}



  /**
   * 形態選択UIの初期化。
   * - .patternx-area が無ければ何もしない。
   * - prev/next のラベルやボタンが無い場合は、その部分だけスキップ。
   */
  function initPatternUI() {
    const area = document.querySelector(".patternx-area");
    if (!area) return;

    prevLabelEl    = document.getElementById("pattern-x-prev-label")   || null;
    currentLabelEl = document.getElementById("pattern-x-current-label")|| null;
    nextLabelEl    = document.getElementById("pattern-x-next-label")   || null;
    prevButtonEl   = document.getElementById("pattern-x-prev-button")  || null;
    nextButtonEl   = document.getElementById("pattern-x-next-button")  || null;
    valueLabelEl   = document.getElementById("pattern-x-value")        || null;
    hpValueEl      = document.getElementById("pattern-x-hp-value")     || null;

    // 初期値：1（①：形態1）
    currentPatternIndex = 1;
    updatePatternDisplay();

    if (prevButtonEl) {
      prevButtonEl.addEventListener("click", function () {
        shiftPattern(-1);
      });
    }
    if (nextButtonEl) {
      nextButtonEl.addEventListener("click", function () {
        shiftPattern(+1);
      });
    }
  }

  /**
   * 現在の形態インデックスに対応する敵パラメータ（vit / def）を取得する。
   * overrideIndex が指定されていれば、そのインデックスを優先。
   */
  function getEnemyParamsForPattern(overrideIndex) {
    const idx = (typeof overrideIndex === "number")
      ? normalizePatternIndex(overrideIndex)
      : currentPatternIndex;

    const pat = PATTERN_LIST[idx];
    if (!pat) {
      // 念のためのフォールバック：普通1形態
      return { vit: 45, def: 45 };
    }
    return { vit: pat.vit, def: pat.slash };
  }

  // ==========================================================
  // 2. 分身剣ダメージ計算ラッパー
  // ==========================================================

  /**
   * 分身剣ダメージ計算のデフォルト値。
   */
  const BUNSHIN_DEFAULTS = {
    weaponLv: 20, // 親から剣レベルが届かないときのデフォルト剣レベル
    attack:   25  // bunshin_sword_99 に渡す wea（武器攻撃力）
  };

  /**
   * 陣形補正の既定行（前列／後列）。
   *   - true  : 前列（陣形補正あり）
   *   - false : 後列（補正なし）
   *
   * ①〜③：前列、④〜⑤：後列 という前提。
   */
  const FRONT_SLOTS = [true, true, true, false, false];

  /**
   * 数値変換ヘルパー。
   * 数値でなければ null を返す。
   */
  function toIntOrNull(value) {
    if (value == null || value === "") return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return n | 0;
  }

  /**
   * スロット番号 1〜5 かどうか。
   */
  function isValidSlot(slotNo) {
    return Number.isInteger(slotNo) && slotNo >= 1 && slotNo <= 5;
  }

  /**
   * 陣形補正を適用する。
   * - isFront が true のときだけ係数 1.25 倍を適用する。
   * - 計算規則に合わせて、「割り算ごとに切り捨て」を行う。
   *
   * ここでは 1.25 = 5 / 4 として
   *   tmp = value * 5;
   *   result = floor(tmp / 4);
   * で実装。
   */
  function applyFormationBonus(value, isFront) {
    if (!isFront) {
      return value;
    }
    const tmp = value * 5;              // 掛け算部分
    const result = Math.floor(tmp / 4); // 割り算のタイミングで切り捨て
    return result;
  }

  /**
   * 指定スロットのダメージ欄（最大／最小）をクリアする。
   */
  function clearSlotDamage(slotNo) {
    if (!isValidSlot(slotNo)) return;
    const maxInput = document.getElementById("bun-dmg-max-" + slotNo);
    const minInput = document.getElementById("bun-dmg-min-" + slotNo);
    if (maxInput) maxInput.value = "";
    if (minInput) minInput.value = "";
  }

  /**
   * 分身剣ダメージを計算する（1スロット分の内部処理）。
   *
   * options:
   *   - swordLevel : 剣レベル（省略時 20）
   *   - weaponPower: 武器攻撃力（省略時 25）
   *   - enemyDef   : 敵斬防（省略時：現在の形態から取得）
   *   - enemyVit   : 敵体力（省略時：現在の形態から取得）
   *   - isFront    : true=前列 / false=後列（省略時：スロット番号から判定）
   *
   * 戻り値:
   *   - { min, max, avg, hits } / 計算不能の場合 null
   */
  function calcDamageFromOptions(options, slotNoForDefaultRow) {
    if (!global.bunshin_sword_99 || typeof global.bunshin_sword_99.calcDamage !== "function") {
      console.warn("[rs3_box_bunshin_pat_v2] bunshin_sword_99.calcDamage が見つかりません。bunshin_sword_99.js の読み込みを確認してください。");
      return null;
    }
    if (!options) options = {};

    // 剣レベル
    let lv = toIntOrNull(options.swordLevel);
    if (lv == null) {
      lv = BUNSHIN_DEFAULTS.weaponLv;
    }

    // 武器攻撃力
    let wea = toIntOrNull(options.weaponPower);
    if (wea == null) {
      wea = BUNSHIN_DEFAULTS.attack;
    }

    // 敵防御＆体力
    let def = toIntOrNull(options.enemyDef);
    let vit = toIntOrNull(options.enemyVit);
    if (def == null || vit == null) {
      const p = getEnemyParamsForPattern();
      if (def == null) def = p.def;
      if (vit == null) vit = p.vit;
    }

    // どれか欠けていれば計算しない
    if (lv == null || wea == null || def == null || vit == null) {
      return null;
    }

    // 分身剣本体ロジックの呼び出し
    const result = global.bunshin_sword_99.calcDamage({
      lv:  lv,
      wea: wea,
      def: def,
      vit: vit
      // prev / base / sei は bunshin_sword_99 側の既定値に任せる
    });

    if (!result || typeof result.min !== "number" || typeof result.max !== "number") {
      return null;
    }

    // 前列／後列の判定
    let isFront;
    if (typeof options.isFront === "boolean") {
      isFront = options.isFront;
    } else if (isValidSlot(slotNoForDefaultRow)) {
      isFront = !!FRONT_SLOTS[slotNoForDefaultRow - 1];
    } else {
      isFront = false;
    }

    // 陣形補正を「最小」「最大」の両方に適用する
    const minBase = result.min;
    const maxBase = result.max;

    const minFinal = applyFormationBonus(minBase, isFront);
    const maxFinal = applyFormationBonus(maxBase, isFront);

    return {
      min:  minFinal,
      max:  maxFinal,
      avg:  result.avg,   // 平均値は bunshin_sword_99 側そのまま（必要なら後で検討）
      hits: result.hits
    };
  }

  /**
   * スロット1つ分の「剣レベル表示」と「最小／最大ダメージ」を更新する。
   *
   * @param {number} slotNo 1〜5
   * @param {Object} options calcDamageFromOptions と同等
   */
  function setSlot(slotNo, options) {
    if (!isValidSlot(slotNo)) {
      console.warn("[rs3_box_bunshin_pat_v2] slotNo が 1〜5 の範囲外です:", slotNo);
      return;
    }

    // 剣レベル表示（bun-sword-lv-N）
    const swordLvSpan = document.getElementById("bun-sword-lv-" + slotNo);
    if (swordLvSpan && options && options.swordLevel != null) {
      const lv = toIntOrNull(options.swordLevel);
      swordLvSpan.textContent = (lv != null ? String(lv) : "0");
    }

    const dmg = calcDamageFromOptions(options, slotNo);
    const maxInput = document.getElementById("bun-dmg-max-" + slotNo);
    const minInput = document.getElementById("bun-dmg-min-" + slotNo);

    if (!maxInput && !minInput) {
      return;
    }

    if (!dmg) {
      if (maxInput) maxInput.value = "";
      if (minInput) minInput.value = "";
      return;
    }

    if (maxInput) maxInput.value = String(dmg.max);
    if (minInput) minInput.value = String(dmg.min);
  }

  /**
   * 全スロットをまとめて更新するヘルパー。
   * optionsList は長さ5の配列を想定（欠けていてもよい）。
   */
  function setAllSlots(optionsList) {
    if (!Array.isArray(optionsList)) return;
    for (let i = 0; i < 5; i++) {
      const slotNo = i + 1;
      setSlot(slotNo, optionsList[i]);
    }
  }

  /**
   * 全スロットのダメージ欄をクリアする。
   */
  function clearAllSlots() {
    for (let i = 1; i <= 5; i++) {
      clearSlotDamage(i);
    }
  }

  // ==========================================================
  // 3. DOM初期化と公開API
  // ==========================================================

  document.addEventListener("DOMContentLoaded", function () {
    // 形態選択UIの初期化
    initPatternUI();
    // ダメージ部分は、親側から setSlot / setAllSlots を呼んでもらう前提。
  });

  // 親側（RTA本体など）から呼び出すための公開API
  global.rs3_box_bunshin_pat_v2 = {
    // 形態X関連
    patternList: PATTERN_LIST,
    getCurrentPattern: getCurrentPattern,
    setPatternIndex: setPatternIndex,
    shiftPattern: shiftPattern,

    // 分身ダメージ関連
    setSlot: setSlot,
    setAllSlots: setAllSlots,
    clearSlot: clearSlotDamage,
    clearAllSlots: clearAllSlots
  };

})(this);