# RS3 RTA Tool Portfolio

このリポジトリは、RS3 RTA 用のツール本体と、起動版、作成時の参考資料を分けて管理しています。

## 主要ファイル

- `rs3_rta_tool.html`
  - 単体で完結するツール本体です（画像のみ外部参照）。
- `README.md`
  - このファイルです。

## 画像フォルダ（単体版用）

- `rs3rtagazou/nolight.png`
  - 分身剣「適正なし」アイコン画像。
- `rs3rtagazou/oukan.png`
  - 分身剣「王冠あり」アイコン画像。

## 起動版アプリ一式

- `rs3_rta_v2_app/rs3_rta_v2_kidou.html`
  - 起動用 HTML。CSS / JS を外部参照して動作します。

### CSS（`rs3_rta_v2_app/rs3rtacssbox`）

- `rs3_rta_v2_kidou.css` : 全体レイアウト。
- `rs3_box_char_v2.css` : キャラ・お供枠。
- `rs3_box_spark_v2.css` : 分身剣閃き枠。
- `rs3_box_fm_v2.css` : 陣形枠。
- `rs3_box_tlist_v2.css` : 技チェック枠。
- `rs3_box_bunshin_pat_v2.css` : 分身ダメージ/形態推察枠。
- `rs3_box_fb_v2.css` : フォルネウス/ビューネイ HP 枠。
- `rs3_box_hakai_v2.css` : 破壊するもの管理枠。

### JS（`rs3_rta_v2_app/rs3rtajsbox`）

- `rs3_rta_v2_kidou_layout.js` : 画面レイアウト生成。
- `char_slot.js` : キャラスロット UI。
- `rs3chrparam.js` : キャラ基礎データ。
- `rs3_rta_v2_char_param.js` : キャラパラメータ制御。
- `right_tec.js` : 右側技リスト制御。
- `bunshin_sword_99.js` : 分身剣ダメージ計算。
- `rs3_box_bunshin_pat_v2.js` : 分身ダメージ/形態推察ロジック。
- `rs3_box_fb_v2.js` : フォルネウス/ビューネイ HP 制御。
- `rs3_rta_v2_bunshin_link.js` : キャラ情報と分身計算の連携。
- `rs3_box_spark_v2.js` : 閃き関連ロジック。
- `rs3_box_hakai_v2.js` : 破壊するもの下段ロジック。
- `rs3_rta_v2_kidou_boot.js` : 起動時初期化。
- `test_hakai_estimation.js` : 形態推察テスト用スクリプト。

### 起動版用画像（`rs3_rta_v2_app/rs3rtagazou`）

- `nolight.png` : アイコン画像。
- `oukan.png` : アイコン画像。

## 参考資料（作成時メモ・元データ）

- `reference_materials/roma3乱数.txt`
  - 乱数関連メモ。
- `reference_materials/roma3乱数出現回数.txt`
  - 乱数出現回数メモ。
- `reference_materials/乱数表.xls`
  - 乱数表（表計算ファイル）。
- `reference_materials/分身剣.txt`
  - 分身剣関連メモ。
- `reference_materials/技適正.csv`
  - 技適正データ。
- `reference_materials/閃き適正.txt`
  - 閃き適正メモ。
- `reference_materials/まとめ/*`
  - 各ボックスの個別 HTML など、作成過程のまとめファイル。
