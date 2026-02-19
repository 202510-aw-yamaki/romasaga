(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (typeof initCharSlotBox === "function") {
      initCharSlotBox("rta-v2-top-lm");
    }

    // DOM構築 → キャラスロットHTML生成 → RS3_CHAR_DATA 初期化の順序を保証
    if (window.rs3_rta_v2_char_module &&
        typeof window.rs3_rta_v2_char_module.init === "function") {
      window.rs3_rta_v2_char_module.init();
    }

    if (window.rs3_rta_v2_bunshin_link &&
        typeof window.rs3_rta_v2_bunshin_link.init === "function") {
      window.rs3_rta_v2_bunshin_link.init();
    }

    if (window.rs3_box_hakai_v2 &&
        typeof window.rs3_box_hakai_v2.init === "function") {
      window.rs3_box_hakai_v2.init();
    }
    // ------------------------------------------------------
    // お供用リセットボタン：「起動直後の状態」に戻す
    // ------------------------------------------------------
    const resetBtn = document.querySelector(
      "#rta-v2-top-lm > div > table > tbody > " +
      "tr.rta-v2-char-row-otomo-header > " +
      "td.support-reset-header > button"
    );

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        // 「rs3_rta_v2_kidou.html」を開いた直後の状態に戻す
        location.reload();
      });
    }

    // ------------------------------------------------------
    // お供レベル & フォル／ビュネHP連動
    // ------------------------------------------------------
    const supportCharSelect = document.getElementById("support-char");
    const supportHpInput    = document.getElementById("support-hp");
    const supportLvSpan     = document.getElementById("support-lv");
    const forneusLvSpan     = document.getElementById("forneus-otomo-level-display");
    const byuneiLvSpan      = document.getElementById("byunei-otomo-level-display");

    // お供周りの要素が無ければ、ここから先は何もしない
    if (!supportHpInput || !supportLvSpan) {
      return;
    }

    // ハーマン／タチアナの「デフォルトHP」
    const BASE_SUPPORT_HP = {
      herman: 210,
      tatiana: 65
    };

    function getCurrentSupportKey() {
      if (!supportCharSelect) return "herman";
      const v = supportCharSelect.value;
      if (v === "tatiana") return "tatiana";
      return "herman"; // デフォルトはハーマン扱い
    }

    function getBaseSupportHp() {
      const key = getCurrentSupportKey();
      return BASE_SUPPORT_HP[key] || 0;
    }

    // 差分 / 15 を使って お供LV を算出
    function calcOtomoLevel(currentHp, baseHp) {
      const diff = currentHp - baseHp;
      if (!Number.isFinite(diff) || diff <= 0) return 0;
      return Math.max(0, Math.floor(diff / 15));
    }

    // お供HP → お供LV → フォル／ビュネHP を反映
    function applyOtomoLevel() {
      const baseHp = getBaseSupportHp();
      if (baseHp <= 0) {
        // 基礎値がおかしい場合は全部 0 扱い
        supportLvSpan.textContent = "0";
        if (forneusLvSpan) forneusLvSpan.textContent = "0";
        if (byuneiLvSpan)  byuneiLvSpan.textContent  = "0";
        return;
      }

      let currentHp = Number(supportHpInput.value);
      if (!Number.isFinite(currentHp) || currentHp <= 0) {
        currentHp = baseHp;
      }

      // 「デフォルト値より小さくならない」制約
      if (currentHp < baseHp) {
        currentHp = baseHp;
        supportHpInput.value = String(baseHp);
      }

      const otomoLv = calcOtomoLevel(currentHp, baseHp);

      // 上部「お供LV」
      supportLvSpan.textContent = String(otomoLv);

      // 下部フォル／ビュネ側の「お供LV 表示」
      if (forneusLvSpan) forneusLvSpan.textContent = String(otomoLv);
      if (byuneiLvSpan)  byuneiLvSpan.textContent  = String(otomoLv);

      // フォル／ビュネの最大HP更新
      if (window.rs3_box_fb_v2) {
        const forneusBase = 28000;
        const byuneiBase  = 9000;

        // 基礎HP + (基礎HP / 32) * お供LV を小数点以下切り捨て
        const forneusHp = Math.floor(forneusBase + (forneusBase / 32) * otomoLv);
        const byuneiHp  = Math.floor(byuneiBase  + (byuneiBase  / 32) * otomoLv);

        if (typeof window.rs3_box_fb_v2.setForneusMaxHP === "function") {
          window.rs3_box_fb_v2.setForneusMaxHP(forneusHp);
        }
        if (typeof window.rs3_box_fb_v2.setByuneiMaxHP === "function") {
          window.rs3_box_fb_v2.setByuneiMaxHP(byuneiHp);
        }
      }
    }

    // お供HPのスピン＆直接入力で反映
    supportHpInput.addEventListener("input",  applyOtomoLevel);
    supportHpInput.addEventListener("change", applyOtomoLevel);

    // お供キャラ（ハーマン／タチアナ）変更時も再計算
    if (supportCharSelect) {
      supportCharSelect.addEventListener("change", function () {
        // rs3_rta_v2_char_param.js 側で基礎HPを書き換えた後に反映したいので、少し後ろにずらす
        setTimeout(applyOtomoLevel, 0);
      });
    }

    // 起動直後の表示を同期
    applyOtomoLevel();
  });
})();
