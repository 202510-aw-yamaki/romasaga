function initCharSlotBox(containerId) {
  var root = document.getElementById(containerId);
  if (!root) {
    return;
  }

  root.innerHTML = `
          <div class="rta-v2-inner-block block-char-otomo">
            <table class="rta-v2-char-table">
                  <thead>
                    <tr>
                      <!-- A列：見出し上は空欄 -->
                      <th class="col-role"></th>
                      <!-- B列：剣レベル -->
                      <th class="col-a">剣レベ</th>
                      <!-- C列：JP -->
                      <th class="col-b">JP</th>
                    </tr>
                  </thead>
                  <tbody>

                    <!-- 行2：主 -->
                    <tr class="rta-v2-char-row-main">
                      <td class="char-name-cell">
                        <div class="char-cell">
                          <span class="char-role-label">主:</span>
                          <span class="crown-icon"></span>
                          <select class="char-select" id="char-main">
                            <option value="">選択なし</option>
                            <option value="hero1">主人公A</option>
                            <option value="hero2">主人公B</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input sword-input"
                            id="sword-main"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="主人公の剣レベル">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input jp-input"
                            id="jp-main"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="主人公のJP">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                    </tr>

                    <!-- 行3：仲 -->
                    <tr class="rta-v2-char-row-main">
                      <td class="char-name-cell">
                        <div class="char-cell">
                          <span class="char-role-label">仲:</span>
                          <span class="crown-icon"></span>
                          <select class="char-select" id="char-ally1">
                            <option value="">選択なし</option>
                            <option value="ally1a">仲間1A</option>
                            <option value="ally1b">仲間1B</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input sword-input"
                            id="sword-ally1"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間１の剣レベル">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input jp-input"
                            id="jp-ally1"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間１のJP">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                    </tr>

                    <!-- 行4：仲 -->
                    <tr class="rta-v2-char-row-main">
                      <td class="char-name-cell">
                        <div class="char-cell">
                          <span class="char-role-label">仲:</span>
                          <span class="crown-icon"></span>
                          <select class="char-select" id="char-ally2">
                            <option value="">選択なし</option>
                            <option value="ally2a">仲間2A</option>
                            <option value="ally2b">仲間2B</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input sword-input"
                            id="sword-ally2"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間２の剣レベル">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input jp-input"
                            id="jp-ally2"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間２のJP">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                    </tr>

                    <!-- 行5：仲 -->
                    <tr class="rta-v2-char-row-main">
                      <td class="char-name-cell">
                        <div class="char-cell">
                          <span class="char-role-label">仲:</span>
                          <span class="crown-icon"></span>
                          <select class="char-select" id="char-ally3">
                            <option value="">選択なし</option>
                            <option value="ally3a">仲間3A</option>
                            <option value="ally3b">仲間3B</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input sword-input"
                            id="sword-ally3"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間３の剣レベル">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input jp-input"
                            id="jp-ally3"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間３のJP">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                    </tr>

                    <!-- 行6：仲 -->
                    <tr class="rta-v2-char-row-main">
                      <td class="char-name-cell">
                        <div class="char-cell">
                          <span class="char-role-label">仲:</span>
                          <span class="crown-icon"></span>
                          <select class="char-select" id="char-ally4">
                            <option value="">選択なし</option>
                            <option value="ally4a">仲間4A</option>
                            <option value="ally4b">仲間4B</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input sword-input"
                            id="sword-ally4"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間４の剣レベル">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input jp-input"
                            id="jp-ally4"
                            min="0"
                            max="50"
                            value="0"
                            step="1"
                            aria-label="仲間４のJP">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                    </tr>

                    <!-- 行7：お供LVチェック ヘッダ行 -->
                    <tr class="rta-v2-char-row-otomo-header">
                      <td class="char-name-cell otomo-header-cell">
                        <span class="char-role-label">お供LVチェック</span>
                      </td>
                      <td class="support-hp-header">
                        HP
                      </td>
                      <td class="support-reset-header">
                        <button type="button" class="support-reset-btn">
                          リセット
                        </button>
                      </td>
                    </tr>

                    <!-- 行8：お供行（供：キャラスロット＋HP＋お供LV） -->
                    <tr class="rta-v2-char-row-otomo">
                      <td class="char-name-cell">
                        <div class="char-cell">
                          <span class="char-role-label">供:</span>
                          <select class="char-select" id="support-char">
                            <!-- 本番では rs3chrparam.js から
                                 ハーマン／タチアナのみを取得する想定 -->
                            <option value="herman">ハーマン</option>
                            <option value="tatiana">タチアナ</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <div class="spin-wrap">
                          <input
                            type="number"
                            class="num-input"
                            id="support-hp"
                            min="0"
                            max="999"
                            value="210"
                            step="15"
                            aria-label="お供の現在HP">
                          <button type="button" class="spin-btn spin-up">▲</button>
                          <button type="button" class="spin-btn spin-down">▼</button>
                        </div>
                      </td>
                      <td>
                        <span class="support-lv-label">お供LV:</span>
                        <span id="support-lv">0</span>
                      </td>
                    </tr>

                  </tbody>
                </table>
          </div>`;
}
