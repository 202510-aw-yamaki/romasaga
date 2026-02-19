// rs3_rta_v2_bunshin_link.js
// ------------------------------------------------------------
// 役割：
//   ・パーティ内の5枠（主＋仲間1〜4）に A〜E の内部IDを振る
//   ・陣形スロット①〜⑤ で A〜E を選択（表示はキャラ名）できるようにする
//   ・陣形①〜⑤に割り当てられた A〜E に基づき、
//       - 分身ダメージスロット1〜5の剣レベルを参照
//       - rs3_box_bunshin_pat_v2.setSlot(...) を呼び出して
//         最小／最大ダメージを更新する
//
// 前提：HTML 側
//   ・キャラスロット：
//       - 主人公   select: id="char-main"
//       - 仲間1〜4 select: id="char-ally1"〜"char-ally4"
//       - 剣レベル input: id="sword-main" / "sword-ally1"〜"sword-ally4"
//   ・陣形スロット：
//       - select#formation-slot-1〜5
//   ・分身ダメージブロック：
//       - rs3_box_bunshin_pat_v2.js が先に読み込まれている
//       - bun-sword-lv-N / bun-dmg-max-N / bun-dmg-min-N は
//         rs3_box_bunshin_pat_v2.js 側が面倒を見る
//
// このファイルでは「A〜E ↔ 主/仲1〜4 ↔ 陣形①〜⑤」の対応と、
// 「剣レベル → 分身DMG更新」の橋渡しのみを担当する。
//
(function (global) {
  "use strict";

  // ==========================================================
  // 0. 内部定数・状態
  // ==========================================================

  const PARTY_ROLES = [
    {
      id: "A",
      roleKey: "main",
      charSelectId: "char-main",
      swordInputId: "sword-main",
      labelPrefix: "主"
    },
    {
      id: "B",
      roleKey: "ally1",
      charSelectId: "char-ally1",
      swordInputId: "sword-ally1",
      labelPrefix: "仲1"
    },
    {
      id: "C",
      roleKey: "ally2",
      charSelectId: "char-ally2",
      swordInputId: "sword-ally2",
      labelPrefix: "仲2"
    },
    {
      id: "D",
      roleKey: "ally3",
      charSelectId: "char-ally3",
      swordInputId: "sword-ally3",
      labelPrefix: "仲3"
    },
    {
      id: "E",
      roleKey: "ally4",
      charSelectId: "char-ally4",
      swordInputId: "sword-ally4",
      labelPrefix: "仲4"
    }
  ];

  const PARTY_ROLE_BY_ID = (function buildPartyRoleMap() {
    const map = Object.create(null);
    PARTY_ROLES.forEach(function (conf) {
      map[conf.id] = conf;
    });
    return map;
  })();

  const FORMATION_INDEXES = [1, 2, 3, 4, 5];

  /**
   * 陣形スロットごとの割り当て状態
   *   key: スロット番号（1〜5）
   *   value: PARTY_ROLES の id（"A"〜"E"）または null
   *
   * 初期状態ではすべて null（＝デフォルトは「なし」）。
   */
  const formationState = {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null
  };

  // ==========================================================
  // 1. 汎用ヘルパー
  // ==========================================================

  function byId(id) {
    return document.getElementById(id) || null;
  }

  function getIntFromInput(inputEl) {
    if (!inputEl) return null;
    const v = Number(inputEl.value);
    if (!Number.isFinite(v)) return null;
    if (v < 0) return null;
    return Math.floor(v);
  }

  function getCharLabelForRole(roleConfig) {
    if (!roleConfig) return "（未設定）";

    const sel = byId(roleConfig.charSelectId);
    if (!sel) {
      return roleConfig.labelPrefix + ":（選択欄無し）";
    }

    const opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.textContent) {
      return roleConfig.labelPrefix + ":（未選択）";
    }

    const name = opt.textContent.trim();
    if (!name) {
      return roleConfig.labelPrefix + ":（未選択）";
    }
    return roleConfig.labelPrefix + ":" + name;
  }

  function getUsedPartyRoleIds() {
    const used = new Set();
    FORMATION_INDEXES.forEach(function (idx) {
      const roleId = formationState[idx];
      if (roleId) {
        used.add(roleId);
      }
    });
    return used;
  }

  // ==========================================================
  // 2. 陣形スロット select の構築・更新
  // ==========================================================

  function rebuildFormationSelectForIndex(slotIndex, usedRoleIds) {
    const selectId = "formation-slot-" + slotIndex;
    const sel = byId(selectId);
    if (!sel) return;

    const currentRoleId = formationState[slotIndex] || "";

    sel.innerHTML = "";

    // 先頭に「なし」
    const optNone = document.createElement("option");
    optNone.value = "";
    optNone.textContent = "なし";
    sel.appendChild(optNone);

    PARTY_ROLES.forEach(function (roleConf) {
      const roleId = roleConf.id;
      const opt = document.createElement("option");
      opt.value = roleId;
      opt.textContent = getCharLabelForRole(roleConf);

      if (usedRoleIds.has(roleId) && roleId !== currentRoleId) {
        opt.disabled = true;
      }

      sel.appendChild(opt);
    });

    // value 設定（null のときは "なし"）
    if (currentRoleId) {
      sel.value = currentRoleId;
    } else {
      sel.value = "";
    }
  }

  function rebuildAllFormationSelects() {
    const used = getUsedPartyRoleIds();
    FORMATION_INDEXES.forEach(function (idx) {
      rebuildFormationSelectForIndex(idx, used);
    });
  }

  function onFormationSelectChange(slotIndex, event) {
    const sel = event.currentTarget;
    const value = sel.value;

    formationState[slotIndex] = value || null;

    rebuildAllFormationSelects();
    recalcAllBunshinDamage();
  }

  // ==========================================================
  // 3. 分身ダメージ再計算まわり
  // ==========================================================

  function getSwordLevelForPartyRole(roleId) {
    const roleConf = PARTY_ROLE_BY_ID[roleId];
    if (!roleConf) return null;

    const input = byId(roleConf.swordInputId);
    return getIntFromInput(input);
  }

  function getSwordLevelForFormationSlot(slotIndex) {
    const roleId = formationState[slotIndex];
    if (!roleId) return null;
    return getSwordLevelForPartyRole(roleId);
  }

  function isBunshinBoxAvailable() {
    return !!(global.rs3_box_bunshin_pat_v2 &&
              typeof global.rs3_box_bunshin_pat_v2.setSlot === "function" &&
              typeof global.rs3_box_bunshin_pat_v2.clearSlot === "function");
  }

  function recalcAllBunshinDamage() {
    const bunshinAvailable = isBunshinBoxAvailable();
    const api = bunshinAvailable ? global.rs3_box_bunshin_pat_v2 : null;

    if (bunshinAvailable && api) {
      FORMATION_INDEXES.forEach(function (slotIndex) {
        const roleId = formationState[slotIndex];

        if (!roleId) {
          api.clearSlot(slotIndex);
          return;
        }

        const swordLv = getSwordLevelForPartyRole(roleId);

        if (swordLv == null) {
          api.clearSlot(slotIndex);
          return;
        }

        api.setSlot(slotIndex, {
          swordLevel: swordLv
        });
      });
    }

    if (global.rs3_box_hakai_v2 &&
        typeof global.rs3_box_hakai_v2.refreshPatternTable === "function") {
      global.rs3_box_hakai_v2.refreshPatternTable();
    }
  }

  // ==========================================================
  // 4. 初期化処理
  // ==========================================================

  function attachFormationSelectHandlers() {
    FORMATION_INDEXES.forEach(function (idx) {
      const sel = byId("formation-slot-" + idx);
      if (!sel) return;
      sel.addEventListener("change", onFormationSelectChange.bind(null, idx));
    });
  }

  function attachCharSelectHandlers() {
    PARTY_ROLES.forEach(function (roleConf) {
      const sel = byId(roleConf.charSelectId);
      if (!sel) return;

      sel.addEventListener("change", function () {
        rebuildAllFormationSelects();
        recalcAllBunshinDamage();
      });
    });
  }

  function attachSwordInputHandlers() {
    PARTY_ROLES.forEach(function (roleConf) {
      const input = byId(roleConf.swordInputId);
      if (!input) return;

      input.addEventListener("change", function () {
        recalcAllBunshinDamage();
      });
      input.addEventListener("input", function () {
        recalcAllBunshinDamage();
      });
    });
  }

  function attachPatternXHandlers() {
    const prevBtn = byId("pattern-x-prev-button");
    const nextBtn = byId("pattern-x-next-button");

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        recalcAllBunshinDamage();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        recalcAllBunshinDamage();
      });
    }
  }

  let initialized = false;

  function initBunshinLink() {
    if (initialized) {
      // 初期化済みでも最新状態へ合わせて再計算だけ走らせる
      recalcAllBunshinDamage();
      rebuildAllFormationSelects();
      return;
    }

    rebuildAllFormationSelects();

    attachFormationSelectHandlers();
    attachCharSelectHandlers();
    attachSwordInputHandlers();
    attachPatternXHandlers();

    recalcAllBunshinDamage();
    initialized = true;
  }

  global.rs3_rta_v2_bunshin_link = {
    getFormationState: function () {
      const copy = {};
      FORMATION_INDEXES.forEach(function (idx) {
        copy[idx] = formationState[idx] || null;
      });
      return copy;
    },
    init: initBunshinLink,
    recalc: recalcAllBunshinDamage,
    rebuildFormationSelects: rebuildAllFormationSelects,
    getSwordForSlot: getSwordLevelForFormationSlot
  };

})(this);
