(function (global) {
  "use strict";

  // ----------------------------------------------------------
  // 分身剣 閃き確率ロジック
  //  ・敵閃きレベル − 分身剣難度の差分 d （-10〜10）
  //  ・王冠 有／無（フォルのみ両方、ビュネは無のみ）
  //  ・その戦闘中の閃き回数 s（0〜8）
  // から「1 行動あたりの閃き確率」を計算する。
  // ----------------------------------------------------------

  // 分身剣の難度・ボスの閃きレベル
  var SPARK_DIFFICULTY_BUNSHIN = 31;
  var SPARK_LEVEL_FORNEUS      = 28;  // d = -3
  var SPARK_LEVEL_BYUNEI       = 29;  // d = -2

  // 差分 -10〜10 を 0〜20 に対応させたときの
  // 「1024スロット中の当たりマス個数 H_base」
  // （＝王冠有り／無しテーブル）
  var H_BASE_WITH_CROWN = [
    0,   // -10 以下
    0,   // -9
    9,   // -8
    14,  // -7
    21,  // -6
    27,  // -5
    37,  // -4
    54,  // -3
    73,  // -2
    85,  // -1
    104, // 0
    117, // 1
    130, // 2
    141, // 3
    150, // 4
    164, // 5
    182, // 6
    188, // 7
    198, // 8
    202, // 9
    214  // 10 以上
  ];

  var H_BASE_WITHOUT_CROWN = [
    0,   // -10 以下
    0,   // -9
    0,   // -8
    0,   // -7
    11,  // -6
    18,  // -5
    24,  // -4
    30,  // -3
    44,  // -2
    60,  // -1
    82,  // 0
    97,  // 1
    108, // 2
    123, // 3
    130, // 4
    141, // 5
    148, // 6
    150, // 7
    164, // 8
    164, // 9
    168  // 10 以上
  ];

  // 差分 d （-10〜10）を 0〜20 のインデックスに
  function clampSparkIndex(diff) {
    var v = Number(diff);
    if (!Number.isFinite(v)) return 10; // 0差をデフォルト扱い
    if (v < -10) return 0;
    if (v > 10)  return 20;
    return v + 10;
  }

  // 差分 d と 王冠有無から H_base を取得
  function getBaseHits(diff, hasCrown) {
    var idx   = clampSparkIndex(diff);
    var table = hasCrown ? H_BASE_WITH_CROWN : H_BASE_WITHOUT_CROWN;
    var n     = table[idx];
    return Number.isFinite(n) ? n : 0;
  }

  // ②で合意したロジック：
  // H_eff = floor( H_base * (8 - s) / 8 ) （s=0〜7）、s>=8なら0
  function computeEffectiveHits(baseHits, sparkCount) {
    var base = Number(baseHits);
    if (!Number.isFinite(base) || base <= 0) return 0;

    var s = Number(sparkCount);
    if (!Number.isFinite(s) || s <= 0) {
      // 0 回なら補正なし
      return base;
    }
    if (s >= 8) {
      // 8 回以上は 0%
      return 0;
    }

    var eff = Math.floor(base * (8 - s) / 8);
    if (eff < 0) eff = 0;
    return eff;
  }

  // 差分 d／王冠有無／閃き回数 s から「1 行動あたり閃き確率（0〜1）」を返す
  function computeSparkRate(diff, hasCrown, sparkCount) {
    var baseHits = getBaseHits(diff, hasCrown);
    var effHits  = computeEffectiveHits(baseHits, sparkCount);

    if (effHits <= 0) return 0;
    return effHits / 1024;
  }

  // HTML内の input / span を読んで、全ての表示を更新する
  function updateAllSparkRates() {
    // 対フォル：王冠 有／無
    var inputFor = document.getElementById("spark-count-forneus");
    var spanForCrown   = document.getElementById("spark-rate-forneus-crown");
    var spanForNoCrown = document.getElementById("spark-rate-forneus-nocrown");

    // 対ビュネ：王冠 無 のみ
    var inputByu = document.getElementById("spark-count-byunei");
    var spanByuNoCrown = document.getElementById("spark-rate-byunei-nocrown");

    // どれか一式でも無いなら何もしない
    if (!inputFor || !spanForCrown || !spanForNoCrown || !inputByu || !spanByuNoCrown) {
      return;
    }

    var cntFor = Number(inputFor.value);
    if (!Number.isFinite(cntFor) || cntFor < 0) cntFor = 0;
    if (cntFor > 8) cntFor = 8;

    var cntByu = Number(inputByu.value);
    if (!Number.isFinite(cntByu) || cntByu < 0) cntByu = 0;
    if (cntByu > 8) cntByu = 8;

    // 差分 d = 敵閃きレベル − 分身剣難度
    var diffFor = SPARK_LEVEL_FORNEUS - SPARK_DIFFICULTY_BUNSHIN; // -3
    var diffByu = SPARK_LEVEL_BYUNEI  - SPARK_DIFFICULTY_BUNSHIN; // -2

    // フォル：王冠有／無の両方を計算
    var probForCrown   = computeSparkRate(diffFor, true,  cntFor);
    var probForNoCrown = computeSparkRate(diffFor, false, cntFor);

    // ビュネ：王冠 無 のみ
    var probByuNoCrown = computeSparkRate(diffByu, false, cntByu);

    // % 表記にして反映（HTMLの初期値が 0.00% なので小数2桁で揃える）
    spanForCrown.textContent   = (probForCrown   * 100).toFixed(2) + "%";
    spanForNoCrown.textContent = (probForNoCrown * 100).toFixed(2) + "%";
    spanByuNoCrown.textContent = (probByuNoCrown * 100).toFixed(2) + "%";
  }


  function initSparkSpin() {
    // 閃き確率ボックスのルート
    var root = document.getElementById("rta-v2-top-ls") || document;
    if (!root) return;

    // クリックイベントを一括で受け取る
    root.addEventListener("click", function (ev) {
      var target = ev.target;
      if (!(target instanceof HTMLElement)) return;

      // .spin-btn（▲／▼）以外は無視
      var btn = target.closest(".spin-btn");
      if (!btn) return;

      // 同じスピンボックス内の input を取得
      var box = btn.closest(".spin-box");
      if (!box) return;

      /** @type {HTMLInputElement | null} */
      var input = box.querySelector(".spark-count-input");
      if (!input) return;

      // ▲なら +1、▼なら -1（step属性に従う）
      var direction = btn.classList.contains("spin-up") ? 1 : -1;

      var step = Number(input.step);
      if (!Number.isFinite(step) || step <= 0) {
        step = 1;
      }

      var value = Number(input.value);
      if (!Number.isFinite(value)) {
        value = 0;
      }

      value += step * direction;

      // min / max を尊重
      if (input.min !== "") {
        var min = Number(input.min);
        if (Number.isFinite(min) && value < min) {
          value = min;
        }
      }
      if (input.max !== "") {
        var max = Number(input.max);
        if (Number.isFinite(max) && value > max) {
          value = max;
        }
      }

      input.value = String(value);

      // 今後、確率計算ロジックを別JSで付けても動くように input/change を飛ばしておく
      var evInput = new Event("input", { bubbles: true });
      var evChange = new Event("change", { bubbles: true });
      input.dispatchEvent(evInput);
      input.dispatchEvent(evChange);
    });



    // 閃き回数が手入力で変わったときも確率を再計算
    var inputFor = document.getElementById("spark-count-forneus");
    if (inputFor) {
      inputFor.addEventListener("input", updateAllSparkRates);
      inputFor.addEventListener("change", updateAllSparkRates);
    }

    var inputByu = document.getElementById("spark-count-byunei");
    if (inputByu) {
      inputByu.addEventListener("input", updateAllSparkRates);
      inputByu.addEventListener("change", updateAllSparkRates);
    }

    // 初期表示（0 回時）の閃き確率を計算しておく
    updateAllSparkRates();



  }

  // DOM構築完了時に初期化
  document.addEventListener("DOMContentLoaded", initSparkSpin);

  // 将来、外から再初期化したくなったとき用に簡単なAPIも出しておく
  global.rs3_box_spark_v2 = {
    init: initSparkSpin
  };

})(this);
