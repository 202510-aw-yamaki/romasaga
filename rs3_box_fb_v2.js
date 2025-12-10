// rs3_box_fb_v2.js
// ------------------------------------------------------------
// フォル＆ビュネ HP ブロック専用スクリプト（v2）
//
// 役割：
//  1) フォルネウス／ビューネイのHP管理
//     - 最大HPを基準に、ダメージ入力ごとに残りHPを更新
//     - 残りHPの履歴管理（リターン用）
//     - 直前ダメージの表示（4桁ゼロ埋め）
//  2) HP0判定による画面レイアウト切り替え
//     - フォル残りHP <= 0 かつ ビュネ残りHP <= 0 のとき
//       #rta-v2-root のクラスを layout-hp-zero に切り替え
//     - それ以外のとき layout-hp-normal に戻す
//
// 対象要素（ID）:
//  - フォル側:
//      forneus-max-hp        : 最大HP表示（初期値 28000）
//      forneus-damage        : ダメージ入力テキスト
//      forneus-remaining     : 残りHP表示
//      forneus-last-damage   : 直前ダメージ表示
//      forneus-reset         : リセットボタン
//      forneus-return        : リターンボタン
//  - ビュネ側:
//      byunei-max-hp         : 最大HP表示（初期値 9000）
//      byunei-damage         : ダメージ入力テキスト
//      byunei-remaining      : 残りHP表示
//      byunei-last-damage    : 直前ダメージ表示
//      byunei-reset          : リセットボタン
//      byunei-return         : リターンボタン
//
// 注意:
//  - このスクリプトは、bunshin_sword_99.js など他のJSとは独立して動作する。
//  - #rta-v2-root が存在しない単体HTMLで開いた場合、HP計算のみ動作し、
//    レイアウトクラスの切り替えはスキップされる。
// ------------------------------------------------------------
(function (global) {
  "use strict";

  // ==========================================================
  // 1. レイアウト切り替え：HP変更時に呼び出される関数
  // ==========================================================

  /**
   * フォル／ビュネの残りHPから、「HP>0モード／HP0モード」を判定し、
   * #rta-v2-root のクラスを layout-hp-normal / layout-hp-zero のどちらかに切り替える。
   *
   * 判定ルール:
   *   - forneus-remaining <= 0 かつ byunei-remaining <= 0 のとき HP0モード
   *   - 上記以外は HP>0モード
   */
  function onBossHPChanged() {
    const forneusRemainEl = document.getElementById("forneus-remaining");
    const byuneiRemainEl  = document.getElementById("byunei-remaining");
    const root            = document.getElementById("rta-v2-root");

    // 必須要素のいずれかが無ければ何もしない
    if (!forneusRemainEl || !byuneiRemainEl || !root) {
      return;
    }

    // テキストから数値に変換（数値化できない場合は 0 とみなす）
    const f = Number(forneusRemainEl.textContent) || 0;
    const b = Number(byuneiRemainEl.textContent)  || 0;

    if (f <= 0 && b <= 0) {
      // HP0モード：layout-hp-zero のみ付与
      root.classList.add("layout-hp-zero");
      root.classList.remove("layout-hp-normal");
    } else {
      // 通常モード：layout-hp-normal のみ付与
      root.classList.add("layout-hp-normal");
      root.classList.remove("layout-hp-zero");
    }
  }

  // ==========================================================
  // 2. 直前ダメージ用の表示フォーマット
  // ==========================================================

  /**
   * 直前ダメージの表示用に、4桁ゼロ埋めなどを行う。
   * - 0 以下や数値変換できない場合は "0000"
   * - 10000 以上はそのまま文字列化
   * - それ以外は 4桁ゼロ埋め（例: 123 → "0123"）
   */
  function formatLastDamage(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      return "0000";
    }
    const intVal = Math.floor(n);
    if (intVal >= 10000) {
      return String(intVal);
    }
    return String(intVal).padStart(4, "0");
  }

  // ==========================================================
  // 3. ボスHP計算ロジック（フォル／ビュネ共通）
  // ==========================================================

  /**
   * ボスHPの入力欄に対して、
   *   - Enterキーによるダメージ確定と残りHP減算
   *   - リセットボタンによる初期化
   *   - リターンボタンによる一手戻し
   * をセットアップするユーティリティ。
   *
   * @param {string} inputId       ダメージ入力欄のID
   * @param {string} remainingId   残りHP表示欄のID
   * @param {number} initialMaxHP  最大HP（初期残りHP＝この値）
   * @param {string} resetId       リセットボタンのID
   * @param {string} returnId      リターンボタンのID
   * @param {string} lastDamageId  直前ダメージ表示欄のID（不要なら null）
   *
   * @returns {object|null} APIオブジェクト
   *   - setMaxHP(newMaxHP): 最大HPを変更し、残りHPと履歴をリセット
   */
  function setupBossEnterDamage(inputId, remainingId, initialMaxHP, resetId, returnId, lastDamageId) {
    const input      = document.getElementById(inputId);
    const remainSpan = document.getElementById(remainingId);
    const resetBtn   = document.getElementById(resetId);
    const returnBtn  = document.getElementById(returnId);
    const lastDmgSpan = lastDamageId ? document.getElementById(lastDamageId) : null;

    // 入力欄または残りHP欄が無ければセットアップを行わない
    if (!input || !remainSpan) {
      return null;
    }

    // 最大HP・残りHP・履歴の初期化
    let maxHP    = initialMaxHP;
    let remaining = maxHP;
    let history   = [maxHP]; // 残りHPの履歴（先頭が初期値）
    let dmgHistory = [];     // 入力ダメージの履歴

    // 初期表示
    remainSpan.textContent = remaining;
    onBossHPChanged();
    if (lastDmgSpan) {
      lastDmgSpan.textContent = formatLastDamage(0);
    }

    // 入力中に数字以外が入らないようにクリーニング（マイナス記号は許可）
    input.addEventListener("input", function () {
      const cleaned = input.value.replace(/[^\d-]/g, "");
      if (cleaned !== input.value) {
        input.value = cleaned;
      }
    });

    // Enterキーでダメージ確定 → 残りHP減算／回復
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();

        const cleaned = input.value.replace(/[^\d-]/g, "");
        if (cleaned === "") return;

        const dmg = Number(cleaned);
        // 数値でないものと「0」は無効。それ以外（正・負）は有効。
        if (!Number.isFinite(dmg) || dmg === 0) {
          input.value = "";
          return;
        }

        // 正の値：ダメージ
        // 負の値：回復（ただし 0 ～ maxHP の範囲にクランプ）
        let next = remaining - dmg;  // dmg<0 のときは増える
        if (next < 0) {
          next = 0;
        } else if (next > maxHP) {
          next = maxHP;
        }
        remaining = next;

        history.push(remaining);
        dmgHistory.push(dmg);

        remainSpan.textContent = remaining;
        onBossHPChanged();

        if (lastDmgSpan) {
          lastDmgSpan.textContent = formatLastDamage(dmg);
        }

        input.value = "";

      }
    });


    // リターンボタン：一手前の残りHPに戻す
    if (returnBtn) {
      returnBtn.addEventListener("click", function () {
        if (history.length > 1) {
          // 最新の履歴を1つ削除し、直前の値を現在値とする
          history.pop();
          remaining = history[history.length - 1];
          remainSpan.textContent = remaining;
          onBossHPChanged();

          if (dmgHistory.length > 0) {
            dmgHistory.pop();
          }
          const last = dmgHistory.length > 0 ? dmgHistory[dmgHistory.length - 1] : 0;
          if (lastDmgSpan) {
            lastDmgSpan.textContent = formatLastDamage(last);
          }
        }
      });
    }

    // 外部から最大HPを変更するためのAPI
    return {
      /**
       * 最大HPを変更し、残りHPと履歴をリセットする。
       * @param {number} newMaxHP
       */
      setMaxHP: function (newMaxHP) {
        const n = Number(newMaxHP);
        if (!Number.isFinite(n) || n <= 0) {
          return;
        }
        maxHP    = Math.floor(n);
        remaining = maxHP;
        history   = [maxHP];
        dmgHistory = [];

        remainSpan.textContent = remaining;
        onBossHPChanged();

        if (lastDmgSpan) {
          lastDmgSpan.textContent = formatLastDamage(0);
        }

        input.value = "";
      }
    };
  }

  // ==========================================================
  // 4. DOMContentLoaded 時の初期化
  // ==========================================================

  document.addEventListener("DOMContentLoaded", function () {
    // フォル／ビュネの最大HPは、基本的に画面上の表示値から取得する。
    // 取得できない場合はデフォルト値 28000 / 9000 を使用する。

    let forneusMax = 28000;
    let byuneiMax  = 9000;

    // お供レベル補正の「基礎HP」を保持しておく変数
    let baseForneusMax = forneusMax;
    let baseByuneiMax  = byuneiMax;

    const forneusMaxSpan = document.getElementById("forneus-max-hp");
    if (forneusMaxSpan) {
      const v = Number(forneusMaxSpan.textContent.replace(/[^\d]/g, ""));
      if (Number.isFinite(v) && v > 0) {
        forneusMax = Math.floor(v);
      }
    }
    // 画面上から最終的に決まった値を基礎HPとして採用
    baseForneusMax = forneusMax;

    const byuneiMaxSpan = document.getElementById("byunei-max-hp");
    if (byuneiMaxSpan) {
      const v = Number(byuneiMaxSpan.textContent.replace(/[^\d]/g, ""));
      if (Number.isFinite(v) && v > 0) {
        byuneiMax = Math.floor(v);
      }
    }
    // 画面上から最終的に決まった値を基礎HPとして採用
    baseByuneiMax = byuneiMax;


    // フォル／ビュネのHP入力欄に対して、Enter・リセット・リターンの挙動を設定
    const forneusAPI = setupBossEnterDamage(
      "forneus-damage",
      "forneus-remaining",
      forneusMax,
      "forneus-reset",
      "forneus-return",
      "forneus-last-damage"
    );

    const byuneiAPI = setupBossEnterDamage(
      "byunei-damage",
      "byunei-remaining",
      byuneiMax,
      "byunei-reset",
      "byunei-return",
      "byunei-last-damage"
    );

    // 画面上の最大HP表示を書き換えたい場合に備えて、簡易APIを公開しておく。
    // 必須ではないが、将来拡張用。
    global.rs3_box_fb_v2 = {
      setForneusMaxHP: function (hp) {
        if (forneusAPI) {
          forneusAPI.setMaxHP(hp);
          if (forneusMaxSpan) {
            forneusMaxSpan.textContent = String(Math.floor(Number(hp) || 0));
          }
        }
      },
      setByuneiMaxHP: function (hp) {
        if (byuneiAPI) {
          byuneiAPI.setMaxHP(hp);
          if (byuneiMaxSpan) {
            byuneiMaxSpan.textContent = String(Math.floor(Number(hp) || 0));
          }
        }
      },

      /**
       * お供レベルに応じてフォル／ビュネの最大HPを更新する。
       *
       * 式:
       *   基礎HP + (基礎HP / 32) * お供LV   （小数点以下切り捨て）
       *
       * 基礎HP:
       *   フォル  : baseForneusMax
       *   ビュネ  : baseByuneiMax
       *
       * @param {number} level お供レベル (0 以上)
       */
      setOtomoLevel: function (level) {
        const raw = Number(level);
        if (!Number.isFinite(raw) || raw < 0) {
          return;
        }
        const lv = Math.floor(raw);

        // フォル最大HP
        const forneusBase = baseForneusMax;
        const forneusHp = Math.floor(forneusBase + (forneusBase / 32) * lv);

        // ビュネ最大HP
        const byuneiBase = baseByuneiMax;
        const byuneiHp = Math.floor(byuneiBase + (byuneiBase / 32) * lv);

        // フォル側に反映
        if (forneusAPI) {
          forneusAPI.setMaxHP(forneusHp);
        }
        if (forneusMaxSpan) {
          forneusMaxSpan.textContent = String(forneusHp);
        }

        // ビュネ側に反映
        if (byuneiAPI) {
          byuneiAPI.setMaxHP(byuneiHp);
        }
        if (byuneiMaxSpan) {
          byuneiMaxSpan.textContent = String(byuneiHp);
        }

        // タイトル横の「お供レベル」表示も更新
        const forneusLvSpan = document.getElementById("forneus-otomo-level-display");
        if (forneusLvSpan) {
          forneusLvSpan.textContent = String(lv);
        }
        const byuneiLvSpan = document.getElementById("byunei-otomo-level-display");
        if (byuneiLvSpan) {
          byuneiLvSpan.textContent = String(lv);
        }
      },

      // HP判定だけ手動で再評価したい場合用
      recalcLayoutByHP: onBossHPChanged
    };
  });


})(this);