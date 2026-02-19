function initRightTecBox(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn("initRightTecBox: container not found", containerId);
    return;
  }

  container.innerHTML = `
        <!-- HP>0：技チェックリスト -->
        <div class="rta-v2-inner-block block-techlist">
          <table class="tlist-table">
                <thead>
                  <tr>
                    <th class="col-tech">技名</th>
                    <th class="col-gokui">極</th>
                    <th class="col-main">閃</th>
                  </tr>
                </thead>
                <tbody>

                  <!-- 1〜12行目：固定技リスト -->

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">なぎ払い</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-1" aria-label="なぎ払いの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-1" aria-label="なぎ払いを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">かすみ二段</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-2" aria-label="かすみ二段の極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-2" aria-label="かすみ二段を主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">失礼剣</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-3" aria-label="失礼剣の極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-3" aria-label="失礼剣を主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">十文字切り</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-4" aria-label="十文字切りの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-4" aria-label="十文字切りを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">飛水断ち</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-5" aria-label="飛水断ちの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-5" aria-label="飛水断ちを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">龍尾返し</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-6" aria-label="龍尾返しの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-6" aria-label="龍尾返しを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">疾風剣</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-7" aria-label="疾風剣の極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-7" aria-label="疾風剣を主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">バックスタップ</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-8" aria-label="バックスタップの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-8" aria-label="バックスタップを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">亜空間斬り</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-9" aria-label="亜空間斬りの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-9" aria-label="亜空間斬りを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">残像剣</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-10" aria-label="残像剣の極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-10" aria-label="残像剣を主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">五月雨斬り</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-11" aria-label="五月雨斬りの極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-11" aria-label="五月雨斬りを主が閃いたチェック">
                    </td>
                  </tr>

                  <tr>
                    <td class="tech-name-cell">
                      <span class="tech-name-text">分身剣</span>
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-gokui" id="gokui-12" aria-label="分身剣の極意化済チェック">
                    </td>
                    <td class="tech-check-cell">
                      <input type="checkbox" class="chk-main" id="main-12" aria-label="分身剣を主が閃いたェック">
                    </td>
                  </tr>

                </tbody>
              </table>
        </div>

        <!-- HP<=0：分身DMG＋形態X -->
        <div class="rta-v2-inner-block block-bunshin-pat">
          <!-- 貼り付け位置:ここから（bunshinpat-box 本体） --><div class="bunshinpat-box">

      <!-- 上部：分身剣想定ダメージ一覧 -->
      <div class="bunshin-dmg-area">

        <!-- タイトル -->
        <div class="bunshin-title">分身剣想定ダメージ</div>

        <!-- ① -->
        <div class="bunshin-entry" data-slot="1">
          <div class="bunshin-row">
            <div class="slot-label">①キャラ</div>
            <div class="dmg-label">最大</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-max-1" value="0"></div>
          </div>
          <div class="bunshin-row">
            <div class="slot-label">
              剣レベ<span class="sword-lv" id="bun-sword-lv-1">0</span>
            </div>
            <div class="dmg-label">最小</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-min-1" value="0"></div>
          </div>
        </div>

        <!-- ② -->
        <div class="bunshin-entry" data-slot="2">
          <div class="bunshin-row">
            <div class="slot-label">②キャラ</div>
            <div class="dmg-label">最大</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-max-2" value="0"></div>
          </div>
          <div class="bunshin-row">
            <div class="slot-label">
              剣レベ<span class="sword-lv" id="bun-sword-lv-2">0</span>
            </div>
            <div class="dmg-label">最小</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-min-2" value="0"></div>
          </div>
        </div>

        <!-- ③ -->
        <div class="bunshin-entry" data-slot="3">
          <div class="bunshin-row">
            <div class="slot-label">③キャラ</div>
            <div class="dmg-label">最大</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-max-3" value="0"></div>
          </div>
          <div class="bunshin-row">
            <div class="slot-label">
              剣レベ<span class="sword-lv" id="bun-sword-lv-3">0</span>
            </div>
            <div class="dmg-label">最小</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-min-3" value="0"></div>
          </div>
        </div>

        <!-- ④ -->
        <div class="bunshin-entry" data-slot="4">
          <div class="bunshin-row">
            <div class="slot-label">④キャラ</div>
            <div class="dmg-label">最大</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-max-4" value="0"></div>
          </div>
          <div class="bunshin-row">
            <div class="slot-label">
              剣レベ<span class="sword-lv" id="bun-sword-lv-4">0</span>
            </div>
            <div class="dmg-label">最小</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-min-4" value="0"></div>
          </div>
        </div>

        <!-- ⑤ -->
        <div class="bunshin-entry" data-slot="5">
          <div class="bunshin-row">
            <div class="slot-label">⑤キャラ</div>
            <div class="dmg-label">最大</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-max-5" value="0"></div>
          </div>
          <div class="bunshin-row">
            <div class="slot-label">
              剣レベ<span class="sword-lv" id="bun-sword-lv-5">0</span>
            </div>
            <div class="dmg-label">最小</div>
            <div><input type="text" class="dmg-input" id="bun-dmg-min-5" value="0"></div>
          </div>
        </div>
      </div>

      <!-- 下部：PATTERN X 表示 -->
      <!-- 破壊するものの形態選択エリア
           ・中央の四角が左右より大きい構成
           ・形態10種（強／①〜④／弱／風／火／土／水）をループしながら選択
           ・破壊ツール側の自動パターン推察とは接続しない -->
      <div class="patternx-area">

        <!-- 見出し -->
        <div class="patternx-title">破壊するものの形態</div>

        <!-- 形態選択の表示行
             [左表示] [左ボタン] [中央表示] [右ボタン] [右表示] の5要素構造 -->
        <div class="patternx-row patternx-selector">
          <!-- 左：現在形態の1つ前を表示する小さめのボックス -->
          <div class="patternx-box patternx-box-sub">
            <span class="patternx-label patternx-label-sub" id="pattern-x-prev-label">－</span>
          </div>

          <!-- 左ボタン：1つ左の形態へ移動 -->
          <button type="button" class="patternx-arrow" id="pattern-x-prev-button">◀</button>

          <!-- 中央：現在選択中の形態を表示する大きいボックス -->
          <div class="patternx-box patternx-box-main">
            <span class="patternx-label patternx-label-main" id="pattern-x-current-label">未</span>
          </div>

          <!-- 右ボタン：1つ右の形態へ移動 -->
          <button type="button" class="patternx-arrow" id="pattern-x-next-button">▶</button>

          <!-- 右：現在形態の1つ後を表示する小さめのボックス -->
          <div class="patternx-box patternx-box-sub">
            <span class="patternx-label patternx-label-sub" id="pattern-x-next-label">－</span>
          </div>
        </div>

        <div class="patternx-row patternx-hp-row">
         <span class="patternx-hp-label">獣魔形態HP</span>
         <span class="patternx-hp-value" id="pattern-x-hp-value">-</span>
        </div>

        <!-- 形態定義リスト（内部用）
             ・このリストの順番が currentIndex(0〜9) の順番と一致する
             ・data-symbol に画面表示用の1文字ラベル（強・①〜④・弱・風・火・土・水）
             ・data-name に元の名称（闇（強）など）を保持する -->
        <ul class="patternx-def-list" id="pattern-x-def-list">
          <li data-index="0" data-symbol="闇強" data-name="闇（強）">闇（強）</li>
          <li data-index="1" data-symbol="①" data-name="形態1">形態1</li>
          <li data-index="2" data-symbol="②" data-name="形態2">形態2</li>
          <li data-index="3" data-symbol="③" data-name="形態3">形態3</li>
          <li data-index="4" data-symbol="④" data-name="形態4">形態4</li>
          <li data-index="5" data-symbol="闇弱" data-name="闇（弱）">闇（弱）</li>
          <li data-index="6" data-symbol="蒼龍" data-name="獣魔・蒼龍">獣魔・蒼龍</li>
          <li data-index="7" data-symbol="朱鳥" data-name="獣魔・朱鳥">獣魔・朱鳥</li>
          <li data-index="8" data-symbol="白虎" data-name="獣魔・白虎">獣魔・白虎</li>
          <li data-index="9" data-symbol="玄武" data-name="獣魔・玄武">獣魔・玄武</li>
        </ul>

        <!-- 開発メモ：
             ・currentIndex は 0〜9 の整数で、このリストの data-index と対応させる。
               0: 闇（強）、1: 形態1、…、9: 獣魔・玄武
             ・ラベルの更新ルール（JavaScript側）：
               - 中央: currentIndex の data-symbol を pattern-x-current-label に表示（色は黒）
               - 左  : (currentIndex - 1 + 10) % 10 の data-symbol を pattern-x-prev-label に表示（色は灰色）
               - 右  : (currentIndex + 1) % 10 の data-symbol を pattern-x-next-label に表示（色は灰色）
             ・色分けは CSS 側で
               - .patternx-label-main を黒
               - .patternx-label-sub を灰色
               として指定している。 -->
      </div>

    </div>
          <!-- 貼り付け位置:ここまで -->
        </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  initRightTecBox("rta-v2-top-right");
});
