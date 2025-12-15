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

// スクリプトを読み込む（テスト用APIを利用）
require('./rs3_box_hakai_v2.js');

const api = global.rs3_box_hakai_v2;
assert(api && typeof api._testEstimate === 'function', 'test helper should exist');

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
