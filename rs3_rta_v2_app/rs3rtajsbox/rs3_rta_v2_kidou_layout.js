(function () {
  if (document.getElementById("rta-v2-root")) {
    return;
  }

  const templateHtml = `
  <!--
    開発メモ：
    ・class="layout-hp-normal" : HP>0（通常モード）
    ・class="layout-hp-zero"   : HP<=0（HP0モード）
    を body 直下の #rta-v2-root に付け替えて表示を確認してください。
  -->
  <div id="rta-v2-root" class="layout-hp-normal">

    <!-- 上段：左（メイン＋サブ）＋右 -->
    <div class="rta-v2-top-row">

      <!-- 左列：メイン＋サブ -->
      <div class="rta-v2-top-left">

        <!-- 左上メイン：キャラ＋お供レベル -->
        <div id="rta-v2-top-lm"></div>

        <!-- 左上サブ：SPARK / FORMATION（HP状態で切替） -->
        <div id="rta-v2-top-ls">
          <!-- HP>0：分身剣閃きブロック -->
          <div class="rta-v2-inner-block block-spark">
            <table class="spark-outer">
                  <thead>
                    <tr>
                      <th colspan="3" class="spark-title">
                        分身剣閃き確率
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <!-- 本体は colspan=3 の中に内部テーブルを持つ -->
                      <td colspan="3" class="spark-container-cell">
                        <table class="spark-inner">
                          <tbody>
                            <!-- 対フォル：2行（王冠 有／王冠 無） -->
                            <tr>
                              <td class="spark-label" rowspan="2">対フォル</td>
                              <td class="spark-row" rowspan="2">
                                閃き回数
                                <span class="spin-box">
                                  <input
                                    type="number"
                                    class="num-input spark-count-input"
                                    id="spark-count-forneus"
                                    min="0"
                                    max="8"
                                    value="0"
                                    step="1"
                                    aria-label="対フォルの閃き回数">
                                  <div class="spin-buttons">
                                    <button type="button" class="spin-btn spin-up">▲</button>
                                    <button type="button" class="spin-btn spin-down">▼</button>
                                  </div>
                                </span>
                              </td>
                              <td class="spark-row">
                                <span class="spark-crown-label">王冠 有</span>
                                <span class="spark-rate" id="spark-rate-forneus-crown">0.00%</span>
                              </td>
                            </tr>
                            <tr>
                              <td class="spark-row">
                                <span class="spark-crown-label">王冠 無</span>
                                <span class="spark-rate" id="spark-rate-forneus-nocrown">0.00%</span>
                              </td>
                            </tr>

                            <!-- 対ビュネ：1行（王冠 無 のみ） -->
                            <tr>
                              <td class="spark-label">対ビュネ</td>
                              <td class="spark-row">
                                閃き回数
                                <span class="spin-box">
                                  <input
                                    type="number"
                                    class="num-input spark-count-input"
                                    id="spark-count-byunei"
                                    min="0"
                                    max="8"
                                    value="0"
                                    step="1"
                                    aria-label="対ビュネの閃き回数">
                                  <div class="spin-buttons">
                                    <button type="button" class="spin-btn spin-up">▲</button>
                                    <button type="button" class="spin-btn spin-down">▼</button>
                                  </div>
                                </span>
                              </td>
                              <td class="spark-row">
                                <span class="spark-crown-label">王冠 無</span>
                                <span class="spark-rate" id="spark-rate-byunei-nocrown">0.00%</span>
                              </td>
                            </tr>

                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
          </div>

          <!-- HP<=0：陣形スロットブロック -->
          <div class="rta-v2-inner-block block-formation">
            <div class="formation-block">
                  <div class="formation-title">陣形配置</div>

                  <div class="formation-grid">
              <!-- 上から ④ → ② → ① → ③ → ⑤ のくの字配置 -->

              <!-- ④：一番上・右寄せ -->
              <div class="formation-cell formation-cell-4">
                <span class="formation-label">④</span>
                <select id="formation-slot-4" class="formation-select">
                  <option value="">キャラ名</option>
                </select>
              </div>

              <!-- ②：上から2つ目・やや右寄せ -->
              <div class="formation-cell formation-cell-2">
                <span class="formation-label">②</span>
                <select id="formation-slot-2" class="formation-select">
                  <option value="">キャラ名</option>
                </select>
              </div>

              <!-- ①：中央・左寄せ -->
              <div class="formation-cell formation-cell-1">
                <span class="formation-label">①</span>
                <select id="formation-slot-1" class="formation-select">
                  <option value="">キャラ名</option>
                </select>
              </div>

              <!-- ③：下から2つ目・やや右寄せ -->
              <div class="formation-cell formation-cell-3">
                <span class="formation-label">③</span>
                <select id="formation-slot-3" class="formation-select">
                  <option value="">キャラ名</option>
                </select>
              </div>

              <!-- ⑤：一番下・右寄せ -->
              <div class="formation-cell formation-cell-5">
                <span class="formation-label">⑤</span>
                <select id="formation-slot-5" class="formation-select">
                  <option value="">キャラ名</option>
                </select>
              </div>
            </div>


                </div>
          </div>
        </div>

      </div><!-- /.rta-v2-top-left -->

      <!-- 右上：技リスト or 分身DMG＋形態X -->
      <div id="rta-v2-top-right"></div>


    </div><!-- /.rta-v2-top-row -->

    <!-- 下段：フォル＆ビュネHP or 破壊ツール下段 -->
    <div id="rta-v2-bottom">

      <!-- HP>0：フォル＆ビュネHP -->
      <div class="rta-v2-inner-block block-fb-hp">
        <div id="boss-fb-area">
              <div class="boss-wrapper">

                <!-- フォル -->
                <div class="boss-box" id="boss-forneus">
                  <div class="boss-title">
                    フォル
                    <span class="otomo-label">
                      お供レベル：<span id="forneus-otomo-level-display">0</span>
                    </span>
                  </div>

                  <div class="boss-row-text">
                    最大HP:
                    <span class="boss-hp-static" id="forneus-max-hp">28000</span>
                    <!-- 見えないダミーボタン（56×23のスペース確保用） -->
                    <button
                      type="button"
                      class="boss-btn boss-btn-space"
                      aria-hidden="true"
                      tabindex="-1"></button>
                    <button type="button" class="boss-btn" id="forneus-return">リターン</button>
                  </div>


                  <div class="boss-row-text">
                    <label>ダメージ入力：
                      <input type="text"
                             id="forneus-damage"
                             class="boss-dmg-input"
                             inputmode="numeric"
                             pattern="[0-9]*"
                             value="">
                    </label>
                  </div>

                  <div class="boss-remaining">
                    残りHP:
                    <span id="forneus-remaining" class="boss-remaining-value">28000</span>
                    <span class="boss-last-damage-label">直前<br>ダメージ:</span>
                    <span id="forneus-last-damage" class="boss-last-damage-value">0000</span>
                  </div>
                </div>

                <!-- ビュネ -->
                <div class="boss-box" id="boss-byunei">
                  <div class="boss-title">
                    ビュネ
                    <span class="otomo-label">
                      お供レベル：<span id="byunei-otomo-level-display">0</span>
                    </span>
                  </div>
                <div class="boss-row-text">
                  最大HP:
                  <span class="boss-hp-static" id="byunei-max-hp">9000</span>
                  <!-- 見えないダミーボタン（56×23のスペース確保用） -->
                  <button
                    type="button"
                    class="boss-btn boss-btn-space"
                    aria-hidden="true"
                    tabindex="-1"></button>
                  <button type="button" class="boss-btn" id="byunei-return">リターン</button>
                </div>


                  <div class="boss-row-text">
                    <label>ダメージ入力：
                      <input type="text"
                             id="byunei-damage"
                             class="boss-dmg-input"
                             inputmode="numeric"
                             pattern="[0-9]*"
                             value="">
                    </label>
                  </div>

                  <div class="boss-remaining">
                    残りHP:
                    <span id="byunei-remaining" class="boss-remaining-value">9000</span>
                    <span class="boss-last-damage-label">直前<br>ダメージ:</span>
                    <span id="byunei-last-damage" class="boss-last-damage-value">0000</span>
                  </div>
                </div>

              </div><!-- /.boss-wrapper -->
            </div><!-- /#boss-fb-area -->
      </div>

      <!-- HP<=0：破壊ツール下段 -->
      <div class="rta-v2-inner-block block-hakai-bottom">
        <div id="hakai-bottom-root"></div>
      </div>
    </div>

  </div><!-- /#rta-v2-root -->
  `;

  document.body.insertAdjacentHTML("afterbegin", templateHtml);
})();
