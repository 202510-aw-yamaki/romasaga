// rs3_box_hakai_v2.js
// #rta-v2-bottom の中に、破壊ボックス一式（左ダメージ＋右形態）を丸ごと生成するスクリプト。
// ・HTML構造生成
// ・HP減算／ターン管理
// ・破壊形態①〜④の推察ロジック
// ・獣魔撃破／リターン／闇移行／リセット
// までをこのファイル内で完結させる。 :contentReference[oaicite:0]{index=0}

(function () {
  'use strict';

  const global = window;

  // =========================================================
  // 1. HTML生成
  // =========================================================

  function buildHakaiBoxHtml() {
    // いままで rs3_box_hakai_v2.html の <div id="rta-v2-bottom"> の中に書いていた内容を
    // そのままテンプレートにしたものです。
    return `
    <div class="hakai-bottom-box">

      <!-- 左：分身剣ダメージ入力 -->
      <div class="hakai-dmg-area">

        <!-- 見出し＋上部ボタン（獣魔撃破／リターン／闇移行） -->
        <div class="hakai-dmg-header">
          <div class="hakai-dmg-title">分身剣ダメージ入力</div>
          <div class="hakai-dmg-header-buttons">
            <button id="beast-btn" type="button" class="hakai-header-btn">
              獣魔撃破
            </button>
            <button id="return-btn" type="button" class="hakai-header-btn">
              リターン
            </button>
            <button id="dark-btn" type="button" class="hakai-header-btn">
              闇移行
            </button>
          </div>
        </div>

        <!-- ダメージ入力 ①〜⑤ ＋ ターン数 -->
        <div class="dmg-grid">
          <!-- 1段目：①②③ -->
          <div class="dmg-slot current" data-slot="0">
            <span class="slot-label">①</span>
            <input id="dmg-1" class="dmg-input" inputmode="numeric" pattern="[0-9]*">
          </div>
          <div class="dmg-slot" data-slot="1">
            <span class="slot-label">②</span>
            <input id="dmg-2" class="dmg-input" inputmode="numeric" pattern="[0-9]*">
          </div>
          <div class="dmg-slot" data-slot="2">
            <span class="slot-label">③</span>
            <input id="dmg-3" class="dmg-input" inputmode="numeric" pattern="[0-9]*">
          </div>

          <!-- 2段目：ターン数／④／⑤ -->
          <div class="turn-cell">
            <div class="turn-count-value" id="turn-count">0ターン</div>
          </div>
          <div class="dmg-slot" data-slot="3">
            <span class="slot-label">④</span>
            <input id="dmg-4" class="dmg-input" inputmode="numeric" pattern="[0-9]*">
          </div>
          <div class="dmg-slot" data-slot="4">
            <span class="slot-label">⑤</span>
            <input id="dmg-5" class="dmg-input" inputmode="numeric" pattern="[0-9]*">
          </div>
        </div>

        <!-- 下段：残りHP＋ターン終了＋リセット -->
        <div class="hakai-bottom-row">
          <div class="hakai-bottom-left">
            <div class="hp-panel">
              <div class="hp-caption">残りHP</div>
              <div class="hp-value" id="hakai-hp">7500</div>
            </div>

            <button id="endturn-btn" type="button" class="hakai-bottom-btn">
              ターン終了
            </button>
          </div>

          <button id="reset-btn" type="button" class="hakai-bottom-btn hakai-reset-right">
            リセット
          </button>
        </div>

      </div><!-- /.hakai-dmg-area -->

      <!-- 右：現在形態＋8ターン履歴 -->
      <div class="hakai-pattern-area">

        <!-- 上段：推察された現在形態（初期値は①） -->
        <div class="pattern-current-box">
          <span class="pattern-current-label">現在形態</span>
          <span class="pattern-current-value" id="pattern-current-shape">①</span>
        </div>

        <!-- 下段：8ターン分の履歴（4行×4列） -->
        <table class="pattern-history-table">
          <tbody>
            <tr>
              <td class="hist-turn-label">1T</td>
              <td class="hist-form-cell" id="hist-form-1">①</td>
              <td class="hist-turn-label">5T</td>
              <td class="hist-form-cell" id="hist-form-5">？</td>
            </tr>
            <tr>
              <td class="hist-turn-label">2T</td>
              <td class="hist-form-cell" id="hist-form-2">？</td>
              <td class="hist-turn-label">6T</td>
              <td class="hist-form-cell" id="hist-form-6">？</td>
            </tr>
            <tr>
              <td class="hist-turn-label">3T</td>
              <td class="hist-form-cell" id="hist-form-3">？</td>
              <td class="hist-turn-label">7T</td>
              <td class="hist-form-cell" id="hist-form-7">？</td>
            </tr>
            <tr>
              <td class="hist-turn-label">4T</td>
              <td class="hist-form-cell" id="hist-form-4">？</td>
              <td class="hist-turn-label">8T</td>
              <td class="hist-form-cell" id="hist-form-8">？</td>
            </tr>
          </tbody>
        </table>

      </div><!-- /.hakai-pattern-area -->

    </div><!-- /.hakai-bottom-box -->
    `;
  }

  // =========================================================
  // 2. 敵パラメータ（分身Patと同じ値をここにも持つ）
  // =========================================================

  // PATTERN_LIST から破壊形態①〜④に対応する vit / slash(def) を参照する。
  // ※必要最低限：index 1〜4 のみを持つ。
  const HAKAI_PATTERNS = [
    { index: 1, symbol: "①", vit: 45, def: 45 },
    { index: 2, symbol: "②", vit: 46, def: 33 },
    { index: 3, symbol: "③", vit: 40, def: 28 },
    { index: 4, symbol: "④", vit: 40, def: 23 }
  ];

  function getEnemyParamsForSymbol(symbol) {
    const pat = HAKAI_PATTERNS.find(p => p.symbol === symbol);
    if (!pat) {
      // 念のためフォールバック：①
      return { vit: 45, def: 45 };
    }
    return { vit: pat.vit, def: pat.def };
  }

  // =========================================================
  // 3. 破壊ボックス内部状態
  // =========================================================

  const hakaiState = {
    hp: 7500,          // 現在の本体HP（ゲーム内と同じ7500。減算は/10）
    turn: 1,           // 経過ターン数
    lastEdit: null,    // 直近に編集したスロット番号(1〜5)
    lastHp: null,      // リターン用：編集前のHP
    editHistory: [],   // 同一ターン内のダメージ入力履歴（リターン用スタック）
    history: ["①","？","？","？","？","？","？","？"], // 1T〜8Tの形態履歴
    currentForm: "①", // 現在形態（初期値①）
    darkMode: false,   // 闇突入フラグ
    patternTable: null, // 形態①〜④ × スロット1〜5 の {min, max} テーブル
    // --- hakai_v2_js 形態推察・ログ ここから
    patternMeta: null  // 乱数幅テーブル生成時のロールID／剣レベルスナップショット
    // --- hakai_v2_js 形態推察・ログ ここまで
  };


  function el(id) {
    return document.getElementById(id);
  }

  // =========================================================
  // 4. 剣レベル取得の差し込みポイント
  // =========================================================

  /**
   * フォーメーションのスロット（1〜5）にいるキャラの「分身剣レベル」を返す。
   * rs3_rta_v2_bunshin_link.js 側のロジックを再利用し、重複定義による齟齬を防ぐ。
   *
   * もし bunshin_link が未読み込みの場合のみ、同じマッピングに基づく簡易 DOM 参照でフォールバックする。
   */
  function getSwordLevelForSlot(slotIndex) {
    const SWORD_INPUT_ID_BY_ROLE = {
      A: "sword-main",
      B: "sword-ally1",
      C: "sword-ally2",
      D: "sword-ally3",
      E: "sword-ally4"
    };

    function clampSwordLevel(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(50, Math.floor(n)));
    }

    // 1. bunshin_link 側のAPIがあればそれを優先して使う
    if (global.rs3_rta_v2_bunshin_link) {
      const link = global.rs3_rta_v2_bunshin_link;

      if (typeof link.getSwordForSlot === "function") {
        return clampSwordLevel(link.getSwordForSlot(slotIndex));
      }

      // getSwordForSlot が無い場合でも formation 情報が取れるなら DOM 参照に流用する
      if (typeof link.getFormationState === "function") {
        const formation = link.getFormationState();
        const roleFromFormation = formation && formation[slotIndex];
        if (roleFromFormation && SWORD_INPUT_ID_BY_ROLE[roleFromFormation]) {
          const input = document.getElementById(SWORD_INPUT_ID_BY_ROLE[roleFromFormation]);
          if (input) {
            return clampSwordLevel(input.value);
          }
        }
      }
    }

    // 2. フォールバック：DOM直参照（bunshin_link の PARTY_ROLES と同一マッピング）
    const sel = document.getElementById("formation-slot-" + slotIndex);
    if (!sel) return 0;

    const roleId = sel.value; // "", "A"〜"E"
    const swordId = SWORD_INPUT_ID_BY_ROLE[roleId];
    if (!swordId) return 0;

    const input = document.getElementById(swordId);
    if (!input) return 0;

    return clampSwordLevel(input.value);
  }

  // --- hakai_v2_js 形態推察・ログ ここから
  function getFormationRoleForSlot(slotIndex) {
    if (global.rs3_rta_v2_bunshin_link &&
        typeof global.rs3_rta_v2_bunshin_link.getFormationState === "function") {
      const formation = global.rs3_rta_v2_bunshin_link.getFormationState();
      return (formation && formation[slotIndex]) || null;
    }

    const sel = document.getElementById("formation-slot-" + slotIndex);
    if (!sel) return null;
    const roleId = sel.value;
    return roleId || null;
  }

  // =========================================================
  // 5. 形態①〜④ × スロット1〜5 の乱数幅テーブルを構築
  // =========================================================

  function rebuildPatternDamageTable() {
    if (!window.bunshin_sword_99 || typeof window.bunshin_sword_99.calcDamage !== "function") {
      // 分身剣計算ロジックが未読み込みの場合は何もしない
      hakaiState.patternTable = null;
      hakaiState.patternMeta = null;
      return;
    }

    const table = {}; // { "①": [ {min,max}, ...slot5 ], ... }
    const rolesSnapshot = [];
    const swordSnapshot = [];

    // 形態①〜④
    HAKAI_PATTERNS.forEach(pat => {
      const formSymbol = pat.symbol;
      const enemy = getEnemyParamsForSymbol(formSymbol);
      const slots = [];

      for (let slot = 1; slot <= 5; slot++) {
        // スナップショット保存：いまの陣形と剣レベルを把握しておく
        // （ダメージスロットとの紐付けを確実にするため）
        const roleId = getFormationRoleForSlot(slot);
        const swordLv = getSwordLevelForSlot(slot);
        if (rolesSnapshot.length < slot) {
          rolesSnapshot.push(roleId);
          swordSnapshot.push(swordLv);
        }

        const lv = Math.max(0, Math.min(50, Number(swordLv) || 0));

        const params = {
          lv: lv,
          wea: 25,          // 武器攻撃力は25固定
          def: enemy.def,   // 斬防
          vit: enemy.vit,   // 体力
          prev: 99          // 分身剣用デフォルト
          // base / sei は calcDamage 側の分身剣デフォルトを使用
        };

        const res = window.bunshin_sword_99.calcDamage(params);
        slots.push({
          min: Number(res && res.min) || 0,
          max: Number(res && res.max) || 0
        });
      }

      table[formSymbol] = slots;
    });

    hakaiState.patternTable = table;
    hakaiState.patternMeta = {
      roles: rolesSnapshot,
      swordLevels: swordSnapshot
    };

    // --- hakai_v2_js 形態推察・ログ 修正ここから
    // 乱数幅テーブルが組めているか一度だけ確認できるようにログを残す
    console.log("hakai_v2_js: built patternTable", hakaiState.patternTable, hakaiState.patternMeta);
    // --- hakai_v2_js 形態推察・ログ 修正ここまで
  }

  // =========================================================
  // 6. 表示更新系
  // =========================================================

  function updateHpDisplay() {
    const hpElem = el("hakai-hp");
    if (hpElem) hpElem.textContent = String(hakaiState.hp);
  }

  function updateTurnDisplay() {
    const tElem = el("turn-count");
    if (tElem) tElem.textContent = `${hakaiState.turn}ターン`;
  }

  function updateFormDisplays() {
    const cur = el("pattern-current-shape");
    if (cur) cur.textContent = hakaiState.currentForm;

    for (let i = 0; i < 8; i++) {
      const cell = el(`hist-form-${i + 1}`);
      if (cell) cell.textContent = hakaiState.history[i];
    }
  }

  // =========================================================
  // 7. 形態推察ロジック
  // =========================================================

  // --- hakai_v2_js 形態推察・ログ 修正ここから
  // formation-slot(①〜⑤) → roleId(A〜E) → sword input → patternTable → 推察結果
  // の流れで分身剣の乱数幅を把握し、入力ダメージから現在形態を推察する。
  // --- hakai_v2_js 形態推察・ログ 修正ここまで

  function ensurePatternTableUpToDate() {
    const currentRoles = [];
    const currentSwords = [];

    for (let slot = 1; slot <= 5; slot++) {
      currentRoles.push(getFormationRoleForSlot(slot));
      currentSwords.push(getSwordLevelForSlot(slot));
    }

    if (!hakaiState.patternTable ||
        !hakaiState.patternMeta ||
        !Array.isArray(hakaiState.patternMeta.roles) ||
        !Array.isArray(hakaiState.patternMeta.swordLevels)) {
      rebuildPatternDamageTable();
      return;
    }

    const prevRoles = hakaiState.patternMeta.roles;
    const prevSwords = hakaiState.patternMeta.swordLevels;

    const isSameRoles = prevRoles.length === currentRoles.length &&
      prevRoles.every((v, idx) => v === currentRoles[idx]);
    const isSameSwords = prevSwords.length === currentSwords.length &&
      prevSwords.every((v, idx) => v === currentSwords[idx]);

    if (!isSameRoles || !isSameSwords) {
      rebuildPatternDamageTable();
    }
  }

  /**
   * 現在ターン中に入力されているダメージ（非0）と patternTable を使って
   * そのターンの形態（①〜④）を推察する。
   * - 乱数幅の重複がない前提なので、一致する形態は高々1つ。
   * - 一致なしの場合は、直前の currentForm を維持する。
   */
  function analyzeSlotDamage(slotIndex, damageValue, table) {
    const ranges = {};
    const matchedForms = [];

    HAKAI_PATTERNS.forEach(pat => {
      const slotRanges = table && table[pat.symbol];
      const range = slotRanges && slotRanges[slotIndex - 1];
      if (range) {
        ranges[pat.symbol] = { min: range.min, max: range.max };
        if (damageValue >= range.min && damageValue <= range.max) {
          matchedForms.push(pat.symbol);
        }
      }
    });

    return { ranges, matchedForms };
  }

  function computeFormEstimation() {
    ensurePatternTableUpToDate();
    const table = hakaiState.patternTable;
    const result = {
      form: hakaiState.currentForm,
      candidateForms: [],
      nonZeroSlots: [],
      perSlotMatches: [],
      intersectionForms: [],
      table
    };

    if (!table) {
      return result;
    }

    for (let slot = 1; slot <= 5; slot++) {
      const input = el(`dmg-${slot}`);
      if (!input) continue;
      const raw = input.value.trim();
      if (raw === "") continue;
      const v = Number(raw);
      if (!Number.isFinite(v)) continue;
      if (v === 0) continue; // 0は推察に使わない
      result.nonZeroSlots.push({ slot, value: v });
    }

    if (result.nonZeroSlots.length === 0) {
      return result;
    }

    // まずスロット単位でのマッチ結果を集計
    result.nonZeroSlots.forEach(nz => {
      const analysis = analyzeSlotDamage(nz.slot, nz.value, table);
      result.perSlotMatches.push({
        slot: nz.slot,
        value: nz.value,
        matchedForms: analysis.matchedForms,
        ranges: analysis.ranges
      });
    });

    // A: 全スロット共通の形態（積集合）を優先
    if (result.perSlotMatches.length > 0) {
      let common = result.perSlotMatches[0].matchedForms.slice();
      for (let i = 1; i < result.perSlotMatches.length; i++) {
        const next = result.perSlotMatches[i].matchedForms;
        common = common.filter(f => next.indexOf(f) !== -1);
      }
      result.intersectionForms = common;
      if (common.length === 1) {
        result.form = common[0];
        result.candidateForms = common.slice();
        return result;
      }
    }

    // B: 共通形態がない場合、どこか1スロットだけ一意ならそれを採用
    const uniqueSlot = result.perSlotMatches.find(m => m.matchedForms.length === 1);
    if (uniqueSlot) {
      result.form = uniqueSlot.matchedForms[0];
      result.candidateForms = uniqueSlot.matchedForms.slice();

      // 他スロットで矛盾がある場合は警告に残す
      const conflictingSlots = result.perSlotMatches.filter(m => {
        if (m === uniqueSlot) return false;
        if (m.matchedForms.length === 0) return true;
        return m.matchedForms.indexOf(result.form) === -1;
      });
      if (conflictingSlots.length > 0) {
        console.warn("hakai_v2_js: unique slot decided form but other slots conflicted", {
          decidedBy: uniqueSlot,
          conflictingSlots
        });
      }

      return result;
    }

    // C: それでも決まらない場合は現状維持＋詳細ログ
    console.warn("hakai_v2_js: form estimation not decisive", {
      nonZeroSlots: result.nonZeroSlots,
      perSlotMatches: result.perSlotMatches,
      intersectionForms: result.intersectionForms,
      patternTableSnippet: table
    });

    return result;
  }

  function estimateFormFromInputs() {
    const estimation = computeFormEstimation();
    return estimation.form;
  }

  /**
   * ダメージ入力（非0）が入ったタイミングで現在形態を更新する。
   * - ただし闇モード中は変化させない。
   */
  function updateCurrentFormFromInputs(estimationResult) {
    if (hakaiState.darkMode) return;
    const estimation = estimationResult || computeFormEstimation();
    hakaiState.currentForm = estimation.form;
    updateFormDisplays();
  }

  function logDamageInference(slotIndex, damageValue, estimationResult) {
    const estimation = estimationResult || computeFormEstimation();
    const table = estimation.table || hakaiState.patternTable;
    const roleId = (hakaiState.patternMeta && hakaiState.patternMeta.roles && hakaiState.patternMeta.roles[slotIndex - 1])
      || getFormationRoleForSlot(slotIndex);
    const swordLevel = (hakaiState.patternMeta && hakaiState.patternMeta.swordLevels && hakaiState.patternMeta.swordLevels[slotIndex - 1])
      || getSwordLevelForSlot(slotIndex);
    const slotAnalysis = analyzeSlotDamage(slotIndex, damageValue, table);

    if (damageValue > 0 && slotAnalysis.matchedForms.length !== 1) {
      console.warn("hakai_v2_js: expected exactly 1 form match for slot", {
        slotIndex,
        damageValue,
        matchedForms: slotAnalysis.matchedForms
      });
    }

    const reason = (function () {
      if (slotAnalysis.matchedForms.length === 1) {
        return `matched ${slotAnalysis.matchedForms[0]} for slot ${slotIndex}`;
      }
      if (slotAnalysis.matchedForms.length === 0) {
        return "no form matched this damage value";
      }
      return `multiple forms matched this damage value: ${slotAnalysis.matchedForms.join(',')}`;
    })();

    console.log({
      damageSlotIndex: slotIndex,
      formationSlotIndex: slotIndex,
      partyId: roleId,
      swordLevel: swordLevel,
      inputDamage: damageValue,
      usedTableKey: `lv${swordLevel}`,
      candidateRanges: slotAnalysis.ranges,
      matchedFormsForSlot: slotAnalysis.matchedForms,
      overallCandidates: estimation.candidateForms,
      matchedForm: estimation.form,
      matchReason: reason
    });
  }

  function handleDamageInputChange(slotIndex) {
    const input = el(`dmg-${slotIndex}`);
    if (!input) return;

    const raw = input.value.trim();
    const dmg = Number(raw);

    // HP減算を先に適用
    applyDamage(slotIndex);

    // 形態推察（最新の乱数テーブルで実施）
    const estimation = computeFormEstimation();

    if (raw !== "" && Number.isFinite(dmg)) {
      logDamageInference(slotIndex, dmg, estimation);
    }

    updateCurrentFormFromInputs(estimation);
  }

  function handlePartyDataChange() {
    rebuildPatternDamageTable();
    const estimation = computeFormEstimation();
    updateCurrentFormFromInputs(estimation);
  }

  function attachPartyDataChangeHandlers() {
    for (let slot = 1; slot <= 5; slot++) {
      const sel = el(`formation-slot-${slot}`);
      if (sel) {
        sel.addEventListener("change", handlePartyDataChange);
      }
    }

    ["sword-main", "sword-ally1", "sword-ally2", "sword-ally3", "sword-ally4"].forEach(id => {
      const input = el(id);
      if (input) {
        input.addEventListener("change", handlePartyDataChange);
      }
    });

    ["char-main", "char-ally1", "char-ally2", "char-ally3", "char-ally4"].forEach(id => {
      const sel = el(id);
      if (sel) {
        sel.addEventListener("change", handlePartyDataChange);
      }
    });
  }
  // --- hakai_v2_js 形態推察・ログ ここまで

  // =========================================================
  // 8. HP・ターン・各種ボタン挙動
  // =========================================================

  function applyDamage(slotId) {
    const input = el(`dmg-${slotId}`);
    if (!input) return;

    const raw = input.value.trim();
    if (raw === "") return;

    let v = Number(raw);
    if (!Number.isFinite(v)) return;

    // 「マイナス値入力で回復」は破壊ボックス仕様に合わせて実装する場合、
    // ここで v<0 を許容し、そのまま /10 でHPに反映させる。
    const dmgUnit = Math.floor(v / 10);
    if (!Number.isFinite(dmgUnit) || dmgUnit === 0) {
      // 0ダメージ（または 0超だが /10 で0になる低値）は HP 変動なし。
      // HP変動がない入力は履歴に積まない。
      hakaiState.lastEdit = slotId;
      hakaiState.lastHp = hakaiState.hp;
      return;
    }

    // リターン用履歴に1件追加（同一ターン内だけ保持）
    if (!Array.isArray(hakaiState.editHistory)) {
      hakaiState.editHistory = [];
    }
    hakaiState.editHistory.push({
      slot: slotId,
      prevHp: hakaiState.hp
    });

    // 互換用フィールドも更新
    hakaiState.lastEdit = slotId;
    hakaiState.lastHp = hakaiState.hp;

    const nextHp = hakaiState.hp - dmgUnit;
    hakaiState.hp = nextHp < 0 ? 0 : nextHp;

    updateHpDisplay();
  }


  /**
   * 1ターンを締めてターン数＋履歴を更新する。
   * - 形態移行はターン単位。ターン中の形態変化はしない。
   * - ただし「現在形態」はダメージ入力時点で前倒し表示されている。
   */
  /**
   * 1ターンを締めてターン数＋履歴を更新する。
   * - 右のスロットは「そのターンの最終形態」を記録する。
   * - 1T目は常に①固定。2T目以降のみ推察結果を書き込む。
   */
  function endTurn() {
    if (hakaiState.darkMode) {
      // 闇モード中もターン数はカウント継続
      // 「いまのターン」の行に闇を確定させる
      if (hakaiState.turn >= 1 && hakaiState.turn <= 8) {
        hakaiState.history[hakaiState.turn - 1] = "闇";
      }
      updateFormDisplays();

      // 次のターンへ
      hakaiState.turn++;
      updateTurnDisplay();

      // 入力欄はクリアしておく
      for (let i = 1; i <= 5; i++) {
        const inp = el(`dmg-${i}`);
        if (inp) inp.value = "";
      }

      // ターン終了後は ①ダメージスロットにフォーカスを戻す
      const firstInput = el("dmg-1");
      if (firstInput) {
        firstInput.focus();
        firstInput.select();
      }

      return;
    }

    // ★通常時：
    // 「いまのターン」のダメージから推察された形態を
    // 右スロットの「そのターンの行」に確定する。
    //
    // 1T目は常に①のままでよい仕様なので、
    // 書き込むのは 2T目以降だけにする。
    if (hakaiState.turn >= 2 && hakaiState.turn <= 8) {
      hakaiState.history[hakaiState.turn - 1] = hakaiState.currentForm;
    }
    updateFormDisplays();

    // 次のターンへ
    hakaiState.turn++;
    updateTurnDisplay();

    // 入力欄クリア
    for (let i = 1; i <= 5; i++) {
      const inp = el(`dmg-${i}`);
      if (inp) inp.value = "";
    }

    // ターン終了後は ①ダメージスロットにフォーカスを戻す
    const firstInput = el("dmg-1");
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }

    // 次ターン開始時点では、右スロットの「そのターンの行」はまだ「？」のまま。
    // そのターンのダメージ入力が進み、形態推察が一意に確定したら
    // endTurn() 呼び出し時にそのターンの行へ書き込まれる。
  }



  function revertLastEdit() {
    // 同一ターン内のダメージ入力履歴がなければ何もしない
    if (!Array.isArray(hakaiState.editHistory) || hakaiState.editHistory.length === 0) {
      return;
    }

    // 直近のダメージ入力1件分を取り出す
    const last = hakaiState.editHistory.pop(); // { slot, prevHp }

    // 対象スロットの入力をクリアしつつ、カーソルも戻す
    const input = el(`dmg-${last.slot}`);
    if (input) {
      input.value = "";

      // カーソルを「最後に巻き戻したスロット」に戻す
      input.focus();
      input.select();
    }

    // HPを巻き戻す
    hakaiState.hp = last.prevHp;
    updateHpDisplay();

    // 入力が1つ減ったので、現在形態も改めて推察し直す
    if (!hakaiState.darkMode) {
      hakaiState.currentForm = estimateFormFromInputs();
      updateFormDisplays();
    }

    // 既存フィールドも履歴の末尾に合わせて更新（使っていないが整合性のため）
    if (hakaiState.editHistory.length > 0) {
      const prev = hakaiState.editHistory[hakaiState.editHistory.length - 1];
      hakaiState.lastEdit = prev.slot;
      hakaiState.lastHp = prev.prevHp;
    } else {
      hakaiState.lastEdit = null;
      hakaiState.lastHp = null;
    }
  }



  function beastBreak() {
    // 獣魔撃破ボタン：本体HPに500ダメージ（そのまま）
    hakaiState.lastHp = hakaiState.hp;
    hakaiState.lastEdit = null; // スロット入力ではないので lastEdit はクリア
    const nextHp = hakaiState.hp - 500;
    hakaiState.hp = nextHp < 0 ? 0 : nextHp;
    updateHpDisplay();
  }

  function enterDarkMode() {
    hakaiState.darkMode = true;
    hakaiState.currentForm = "闇";

    // 以降のターンは履歴上も闇で塗りつぶす前提。
    for (let i = 0; i < 8; i++) {
      if (hakaiState.history[i] === "？") {
        hakaiState.history[i] = "闇";
      }
    }
    updateFormDisplays();
  }

  function resetAll() {
    hakaiState.hp = 7500;
    hakaiState.turn = 1;
    hakaiState.lastEdit = null;
    hakaiState.lastHp = null;
    hakaiState.editHistory = []; // リターン用履歴もリセット
    hakaiState.history = ["①","？","？","？","？","？","？","？"];
    hakaiState.currentForm = "①";
    hakaiState.darkMode = false;


    for (let i = 1; i <= 5; i++) {
      const inp = el(`dmg-${i}`);
      if (inp) inp.value = "";
    }

    rebuildPatternDamageTable();
    updateHpDisplay();
    updateTurnDisplay();
    updateFormDisplays();
  }

  // =========================================================
  // 9. イベント初期化
  // =========================================================

  function initHakaiLogic() {
    // まず乱数幅テーブルを構築
    rebuildPatternDamageTable();

    // ダメージ入力欄
    for (let slot = 1; slot <= 5; slot++) {
      const inp = el(`dmg-${slot}`);
      if (!inp) continue;

      inp.addEventListener("change", function () {
        handleDamageInputChange(slot);
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();

          if (slot < 5) {
            // ①〜④までは次のダメージスロットへフォーカス
            const nextInput = el(`dmg-${slot + 1}`);
            if (nextInput) {
              nextInput.focus();
              nextInput.select();
            }
          } else {
            // ⑤スロットで Enter → 「ターン終了」ボタンへフォーカス
            const endTurnBtn = el("endturn-btn");
            if (endTurnBtn) {
              endTurnBtn.focus();
            }
          }
        }
      });
    }

    // ボタン類
    const beastBtn = el("beast-btn");
    if (beastBtn) {
      beastBtn.addEventListener("click", function () {
        beastBreak();
      });
    }

    const returnBtn = el("return-btn");
    if (returnBtn) {
      returnBtn.addEventListener("click", function () {
        revertLastEdit();
      });
    }

    const darkBtn = el("dark-btn");
    if (darkBtn) {
      darkBtn.addEventListener("click", function () {
        enterDarkMode();
      });
    }

    const endTurnBtn = el("endturn-btn");
    if (endTurnBtn) {
      endTurnBtn.addEventListener("click", function () {
        endTurn();
      });

      // フォーカスが「ターン終了」ボタン上にある状態で Enter でもターン終了できるようにする
      endTurnBtn.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          endTurnBtn.click();
        }
      });
    }


    const resetBtn = el("reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        resetAll();
      });
    }

    // 陣形・キャラ・剣レベル変更時の再計算
    attachPartyDataChangeHandlers();

    // 初期表示
    updateHpDisplay();
    updateTurnDisplay();
    updateFormDisplays();
  }

  // =========================================================
  // 10. 全体初期化（HTML生成＋ロジック初期化）
  // =========================================================

  function initHakaiBoxFromJs() {
    // HTML側は <div id="hakai-bottom-root"></div> だけ残しておいてください。
    var root = document.getElementById('hakai-bottom-root');
    if (!root) return;

    // 中身を JS でまるごと生成
    root.innerHTML = buildHakaiBoxHtml();

    // 生成後にロジック初期化
    initHakaiLogic();
  }

  let initialized = false;

  function ensureInitialized() {
    if (initialized) return;
    initialized = true;
    initHakaiBoxFromJs();
  }

  // 乱数幅テーブルの再構築だけを外部から呼び出せるように公開
  global.rs3_box_hakai_v2 = global.rs3_box_hakai_v2 || {};
  global.rs3_box_hakai_v2.refreshPatternTable = function () {
    rebuildPatternDamageTable();
  };
  global.rs3_box_hakai_v2.debugGetPatternTable = function () {
    return JSON.parse(JSON.stringify(hakaiState.patternTable || null));
  };
  global.rs3_box_hakai_v2.debugDump = function () {
    return {
      formation: (global.rs3_rta_v2_bunshin_link &&
                  typeof global.rs3_rta_v2_bunshin_link.getFormationState === "function" &&
                  global.rs3_rta_v2_bunshin_link.getFormationState()) || null,
      patternTable: hakaiState.patternTable,
      currentForm: hakaiState.currentForm,
      history: hakaiState.history.slice()
    };
  };

  // --- hakai_v2_js 形態推察・ログ 修正ここから
  // テスト用：任意の patternTable とダメージ入力を与えて形態推察を実行する
  global.rs3_box_hakai_v2._testEstimate = function (patternTable, damageMap) {
    const prevTable = hakaiState.patternTable;
    const prevMeta = hakaiState.patternMeta;
    const prevForm = hakaiState.currentForm;

    hakaiState.patternTable = patternTable;
    hakaiState.patternMeta = {
      roles: [null, null, null, null, null],
      swordLevels: [0, 0, 0, 0, 0]
    };
    hakaiState.currentForm = "①";

    const map = damageMap || {};
    const stubInputs = {};
    for (let i = 1; i <= 5; i++) {
      const key = `dmg-${i}`;
      const v = map[i];
      stubInputs[key] = { value: (v != null ? String(v) : "") };
    }

    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = function (id) {
      if (Object.prototype.hasOwnProperty.call(stubInputs, id)) {
        return stubInputs[id];
      }
      return originalGetElementById(id);
    };

    try {
      return computeFormEstimation();
    } finally {
      document.getElementById = originalGetElementById;
      hakaiState.patternTable = prevTable;
      hakaiState.patternMeta = prevMeta;
      hakaiState.currentForm = prevForm;
    }
  };
  // --- hakai_v2_js 形態推察・ログ 修正ここまで
  global.rs3_box_hakai_v2.init = function () {
    ensureInitialized();
  };

  // 外部から明示的に init を呼ぶ前提に切り替え
})();
