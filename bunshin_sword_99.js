// bunshin_sword_99.js
// ======================================
// RS3 分身剣ダメージ計算（RTA用・簡略版）
//
// ■前提（内部注釈・画面には出さない想定）
//   - 直前行動は 99 固定（今回は仕様として 99 決め打ち）
//   - 命中判定は全て「命中する」前提（＝全ヒット時のダメージ）
//   - Ultimagarden / calc.js の「分身技」(type 2) ロジックをベース
//   - 増幅(術レベル / 陣形 / 装備 / シャドウ等) はすべて無し扱い
//
// 返り値は「防御・体力で軽減後」の min/max/avg（期待値）とヒット数。
// ======================================

(function (global) {
  "use strict";

  // Math.floor のショートカット（calc.js の M と同じ役割）
  function M(x) {
    return Math.floor(x);
  }

  // 剣クラス用 C値テーブル（lv 0〜50）
  // 元: calc.js の cc[lv][1] をそのまま抽出
  const RS3_SWORD_C = [
    // lv:  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
    2,   3,  3,  4,  4,  5,  6,  6,  7,  7,
    // lv: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
    8,   9,  9, 10, 10, 11, 12, 12, 13, 13,
    // lv: 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
    14, 15, 15, 16, 16, 17, 18, 19, 19, 20,
    // lv: 30, 31, 32, 33, 34, 35, 36, 37, 38, 39
    21, 22, 22, 23, 24, 25, 26, 26, 27, 27,
    // lv: 40, 41, 42, 43, 44, 45, 46, 47, 48, 49
    27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
    // lv: 50
    35
  ];

  /**
   * 分身剣ダメージ計算（剣専用）
   *
   * params = {
   *   lv:   技レベル(0〜50),
   *   wea:  武器攻撃力,
   *   def:  敵のDEF(斬防),
   *   vit:  敵のVIT,
   *   // 以降は分身剣特有パラメータ（省略可・デフォルトは分身剣想定）
   *   prev: 直前行動パラメータ（省略時は 99 固定）,
   *   base: 基礎ダメージ $kiso   （デフォルト 8）,
   *   sei:  成長度       $sei    （デフォルト 1 = 分身剣用）
   * }
   *
   * 返り値:
   * {
   *   min:  最小ダメージ（乱数・多段・DEF/VIT軽減後）,
   *   max:  最大ダメージ,
   *   avg:  平均ダメージ（(min+max)/2）,
   *   hits: ヒット数 n
   * }
   */
  function calcBunshinkenDamage(params) {
    const lv  = (params.lv  | 0);
    const wea = (params.wea | 0);
    const def = (params.def | 0);
    const vit = (params.vit | 0);

    // ★直前行動は 99 固定前提（指定が無ければ 99）
    const prev = (params.prev != null ? (params.prev | 0) : 99);

    // ★分身剣固有のパラメータ（kiso=8, sei=1 が Ultimagarden のリストと一致）
    const base = (params.base != null ? (params.base | 0) : 8);
    const sei  = (params.sei  != null ? (params.sei  | 0) : 1);

    // lv を 0〜50 にクランプして C値取得（剣専用）
    const lvClamped = Math.max(0, Math.min(50, lv));
    const c = RS3_SWORD_C[lvClamped];

    let epar = 0;
    let ewea = 0;

    if (prev > 20)        epar = prev - 19;
    if (wea > M(def / 2)) ewea = wea - M(def / 2);

    // ---- calc.js の case 2（分身技）のロジック ----
    let d1 = base;

    // d1 += M( ( $c*$prev + M( $c*(50-$c)/8 ) )/4 ) * 3;
    d1 += M((c * prev + M(c * (50 - c) / 8)) / 4) * 3;

    // d1 += M( (3 + $c + M($epar/2) )*$ewea/2 );
    d1 += M((3 + c + M(epar / 2)) * ewea / 2);

    // ここまでで「乱数なし 1ヒット分の土台ダメージ」

    // ---- 乱数幅（min/max） ----
    let dMin = d1;
    let dMax = d1;

    if (lvClamped > 0) {
      dMin += 1;
      dMax += lvClamped * 3;
    }

    // ---- 分身技のヒット数 n ----
    let n;
    if (sei > 0 && sei !== 3) {
      // n = M($lv/$sei/10) + $sei; （分身剣なら sei=1 → n = floor(lv/10)+1）
      n = M(lvClamped / sei / 10) + sei;
    } else if (sei === 3) {
      // n = M($lv/18) + 2;
      n = M(lvClamped / 18) + 2;
    } else {
      n = 1;
    }

    // if($type == 2) { d1 *= n; d2 *= n; } の部分
    dMin *= n;
    dMax *= n;

    // ---- DEF/VIT 軽減（defe 相当）----
    function applyDefVit(d) {
      // d = M( d * (128 - $def - M($vit/2) )/128 ) - $def*2;
      d = M(d * (128 - def - M(vit / 2)) / 128) - def * 2;
      if (d > 9999) return 9999;
      if (d < 0)    return 0;
      return d;
    }

    const minAfter = applyDefVit(dMin);
    const maxAfter = applyDefVit(dMax);
    const avg      = (minAfter + maxAfter) / 2;

    return {
      min:  minAfter,
      max:  maxAfter,
      avg:  avg,
      hits: n
    };
  }

  // グローバルに公開（必要に応じて名前は変えてOK）
  global.bunshin_sword_99 = {
    SWORD_C: RS3_SWORD_C,
    calcDamage: calcBunshinkenDamage
  };

})(typeof window !== "undefined" ? window : this);
