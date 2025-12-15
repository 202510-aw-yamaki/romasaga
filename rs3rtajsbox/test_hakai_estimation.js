const assert = require('assert');

// 簡易DOMスタブ
if (!global.window) {
  global.window = global;
}
if (!global.document) {
  global.document = {};
}
if (typeof global.document.getElementById !== 'function') {
  global.document.getElementById = function () { return null; };
}
if (typeof global.document.addEventListener !== 'function') {
  global.document.addEventListener = function () { return null; };
}
if (typeof global.document.querySelector !== 'function') {
  global.document.querySelector = function () { return null; };
}

// 依存順にスクリプトを読み込む
require('./bunshin_sword_99.js');
require('./rs3_box_bunshin_pat_v2.js');
require('./rs3_box_hakai_v2.js');

const api = global.rs3_box_hakai_v2;
const patApi = global.rs3_box_bunshin_pat_v2;
assert(api && typeof api._testEstimate === 'function', 'test helper should exist');
assert(patApi && typeof patApi.computeDamageRange === 'function', 'pat helper should exist');

// 人工的な patternTable（slot1 のみ有効、それ以外は 0-0）
const baseSlot = { min: 0, max: 0 };
const patternTable = {
  '①': [ { min: 100, max: 199 }, baseSlot, baseSlot, baseSlot, baseSlot ],
  '②': [ { min: 200, max: 299 }, baseSlot, baseSlot, baseSlot, baseSlot ],
  '③': [ { min: 300, max: 399 }, baseSlot, baseSlot, baseSlot, baseSlot ],
  '④': [ { min: 400, max: 499 }, baseSlot, baseSlot, baseSlot, baseSlot ]
};

function runCase(damage, expectedForm) {
  const estimation = api._testEstimate(patternTable, { 1: damage });
  assert(estimation.form === expectedForm, `damage ${damage} should map to ${expectedForm}, got ${estimation.form}`);
}

runCase(150, '①');
runCase(250, '②');
runCase(350, '③');
runCase(450, '④');

console.log('test_hakai_estimation: OK');

// --- 乱数幅テーブルの一貫性チェック ---
// 剣レベルと陣形スロット（前列/後列）の補正を含め、PAT ボックスと破壊ボックスの乱数幅が一致することを確認する
const swordLevels = [20, 22, 24, 26, 28];
const dummyFormation = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
global.rs3_rta_v2_bunshin_link = {
  getSwordForSlot: function (slot) {
    return swordLevels[slot - 1];
  },
  getFormationState: function () {
    // スナップショットが取れるように単純なコピーを返す
    const copy = {};
    Object.keys(dummyFormation).forEach(function (k) {
      copy[k] = dummyFormation[k];
    });
    return copy;
  }
};

api.refreshPatternTable();
const builtTable = api.debugGetPatternTable();

function getEnemyParams(symbol) {
  const pat = patApi.patternList.find(p => p.symbol === symbol);
  return pat ? { vit: pat.vit, def: pat.slash || pat.def } : null;
}

['①', '②', '③', '④'].forEach(function (symbol) {
  const enemy = getEnemyParams(symbol);
  assert(enemy, 'enemy params should exist for ' + symbol);

  for (let slot = 1; slot <= 5; slot++) {
    const expected = patApi.computeDamageRange({
      swordLevel: swordLevels[slot - 1],
      weaponPower: 25,
      enemyDef: enemy.def,
      enemyVit: enemy.vit
    }, slot);

    const actual = builtTable[symbol][slot - 1];
    assert.deepStrictEqual(actual, { min: expected.min, max: expected.max }, `range mismatch ${symbol} slot${slot}`);
  }
});

// 乱数幅が一致している前提で、実際の値から形態推察が一意になることを確認する
const targetRange = builtTable['③'][1]; // スロット2（前列）
const midDamage = Math.floor((targetRange.min + targetRange.max) / 2);
const estimation = api._testEstimate(builtTable, { 2: midDamage });
assert.strictEqual(estimation.form, '③', 'should infer form ③ from mid damage');

console.log('test_hakai_estimation (range parity): OK');
