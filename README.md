# ORACLE·脈絡

易經起卦 × 塔羅抽牌 × 脈絡紀錄 × 現實驗證的靜態單頁工具（`oracle-context-v7.5.0.html`）。僅供自我反思與個人紀錄，占卜等象徵系統無法以科學方法驗證具有預測能力，不應取代專業判斷。

主畫面只顯示一行驗證狀態（例如「資料驗證：PASS · 64 卦資料結構正常」）。完整逐項報告可在設定頁點「重跑本地驗證（完整逐項報告）」即時產生，內容與本文件下方一致；本文件是同一份報告的靜態版本，供不開啟頁面時核對。

## Local Validation

以下數字為本檔案 `HEXAGRAMS` 常數（64 筆，每筆含卦序 `n` 與六爻二進位 `bin`）在容器內以 Node.js 實際執行對應驗證函式所得結果，並非手抄或估計值。

### Dataset

| 檢查項目 | 對應函式 | 結果 |
|---|---|---|
| 筆數 | `validateCount()` | 64/64 PASS |
| 卦序 1→64 | `validateSequence()` | PASS |
| 卦序編號唯一 | `validateUnique()` | 64/64 PASS |
| 六爻二進位唯一 | `validateUnique()` | 64/64 PASS |
| 八卦組成（上下卦拼出的六爻與 `bin` 一致） | `validateTrigrams()` | 64/64 PASS |

### 綜卦（上下顛倒）

`validateMutual()`

- 互綜（顛倒後與自身不同的兩卦互為一對）：28/28 對
- 自綜（顛倒後與自身相同）：8/8 卦 — 卦序 1、2、27、28、29、30、61、62（乾、坤、頤、大過、坎、離、中孚、小過）
- 64 卦皆存在對應的綜卦：是
- 結果：PASS（28 對 + 8 卦 = 36 個去重鍵）

### 錯卦（六爻全部陰陽互換）

`validateInverse()`

- 配對數：32/32 對
- 自錯（換爻後與自身相同）：0（64 卦中不存在自錯卦）
- 64 卦皆存在對應的錯卦：是
- 結果：PASS

### 卦序配對（通行本卦序結構）

`validateKingWenPairs()`：檢查第 `2k-1` 卦與第 `2k` 卦（k=1..32）必為綜卦，若該卦自綜則改為錯卦。

- 結果：32/32 對 PASS，無異常配對

### SHA-256（資料表自洽性指紋）

Canonical 表示法：

```js
JSON.stringify(HEXAGRAMS.map(h => ({ n: h.n, bin: h.bin })))
```

實算值：

```
b194606f246d876c3d4db1dc624468d3a971a1c736aa8883474eb9e859c3c4eb
```

檔內 `BASELINE_HEXAGRAM_HASH` 常數與此值相同 → 比對結果 PASS。

**重要限制**：此 Hash PASS 只證明「目前 `HEXAGRAMS` 常數」與「檔內預先固定的 baseline」逐位元組相同，屬於單一檔案內部的自洽性檢查。它**不能**證明 baseline 本身就是正確或符合《周易》文本的卦名／卦序——卦名與卦序的出處目前標示為「外部參考（通行本卦序），未於本頁內驗證出處」，屬於 provenance 層，尚未核對到具體版本或文獻，若需要學術等級的正確性仍需另行查證原始文獻。

若執行環境不提供 `crypto.subtle`（例如以 `file://` 開啟，或部分受限 iframe），Hash 這一項會顯示 `UNAVAILABLE`，此時其餘結構性檢查（筆數／卦序／唯一性／八卦組成／綜卦／錯卦／卦序配對）仍會照常執行，不受影響。

### 銅錢機率抽樣（`testToss()`）

`tossCoin()` 目前使用 `Math.random()`，非密碼學亂數，僅供統計分布模擬，不具備「單次占卜結果可稽核重現」的性質。

實際抽樣一次（N=100,000）：

| 爻值 | 理論機率 | 實測 | 判定（誤差 < 2.5 個百分點） |
|---|---|---|---|
| 6（老陰，動） | 12.5% | 12.50% | PASS |
| 7（少陽） | 37.5% | 36.96% | PASS |
| 8（少陰） | 37.5% | 38.05% | PASS |
| 9（老陽，動） | 12.5% | 12.48% | PASS |

此為單次抽樣結果，重跑會因隨機性而有些微差異；判定門檻固定為與理論值相差小於 2.5 個百分點。

## Tarot Dataset

以下數字為本檔案 `TAROT_CARDS` 常數在容器內以 Node.js 實際執行對應驗證函式所得結果。

資料來源：使用者提供的 `a4.html`（一份用 React 寫成、按花色分組的靜態塔羅速查表元件，程式碼裡有 `break-inside-avoid` 這個列印用 CSS 屬性，確認原本是設計成可印出來的參考表，不是抽牌工具）。已實際開啟該檔案並解析其中的資料陣列取得下列 78 筆卡牌資料，逐筆含 `id`／`name`／`loveU`（感情正位）／`loveR`（感情逆位）／`careerU`（事業正位）／`careerR`（事業逆位）／`suit`。牌名、牌義文字本身出處未進一步查證，只做結構層級的檢查。

| 檢查項目 | 對應函式 | 結果 |
|---|---|---|
| 總張數 | `validateTarotCount()` | 78/78 PASS |
| id 唯一 | `validateTarotUnique()` | 78/78 PASS |
| 花色分布 | `validateTarotSuitCounts()` | 大阿爾克那 22/22、權杖 14/14、聖杯 14/14、寶劍 14/14、錢幣 14/14，PASS |
| 欄位完整性（六個欄位皆為非空字串／合法花色） | `validateTarotFields()` | PASS |

### 抽牌邏輯

- 單張抽取：`Math.floor(Math.random()*78)` 均勻選一張。
- 正逆位：`Math.random()<0.5` 各 50%，與易經銅錢法同一亂數來源（`Math.random()`），同樣不是密碼學亂數。
- 實測 20,000 次抽樣：正位 49.82%～50.37%、逆位 49.63%～50.18%（兩次獨立抽樣皆落在合理範圍），78 張牌全部有被抽到過。

### 解讀模式對應（本頁自訂規則，非資料本身既定）

資料只有「感情」「事業」兩組欄位，但問題分類有工作／感情／學業／其他四種。目前規則：`category==='love'` 時用 `loveU`/`loveR`，其餘三個分類（工作、學業、其他）一律對應 `careerU`/`careerR`。這是把「事業」欄位擴大解讀為「非感情類」的簡化，不是使用者逐項確認過的對應關係，之後若要調整（例如學業獨立一組解讀）需要重新設計資料結構。

### 紀錄結構差異

塔羅紀錄與易經紀錄共用同一個 `records` 陣列與大部分欄位（`question`／`category`／`subcategory`／`projectId`／`realityChecks` 等），但核心結果欄位不同：易經紀錄的 `primary` 含 `bin`（六爻二進位），另有 `lines`／`changed`／`movingLines`；塔羅紀錄改用 `card: {id, name, suit, orientation, orientationLabel, mode, modeLabel, meaning}`，`primary` 只有 `{name, sym}`，`changed` 固定為 `null`、`movingLines` 固定為空陣列（塔羅沒有「變卦」這個概念）。`isValidRecord()` 依 `system` 欄位分流檢查兩種結構。

## 資料損壞保護（LocalStorage）

- 正常紀錄存於 `oracle_v7_records`。
- `loadRecords()` 讀取時若整份 JSON 可解析、但陣列中個別項目結構不符，該項目不會被丟棄，而是移入隔離區 `oracle_v7_quarantine`，並在頁面上顯示警示。結構檢查依紀錄的 `system` 欄位分流：易經紀錄要求 `primary.bin`（6 元素）與 `lines`（6 元素）；塔羅紀錄要求 `card.id`／`card.name`／`card.orientation`（`upright` 或 `reversed`）與 `primary.name`。
- 若整份 `oracle_v7_records` 本身無法解析為 JSON，原始字串會備份到 `oracle_v7_corrupt_backup`（同一份內容只備份一次；不同內容的壞資料另開 `oracle_v7_corrupt_backup_<timestamp>` key，不會互相覆蓋）。
- 「清除所有本機紀錄」只清除 `oracle_v7_records` 與 `oracle_v7_projects`，不會動到隔離區或無法解析備份。
- 設定頁可檢視隔離區筆數／備份 key、複製隔離區 JSON、單獨清除隔離區。
- 目前隔離區只提供「保存＋匯出」，尚未提供「結構修復後重新併入正常紀錄」的還原功能。

## 尚未完成（不在本次驗證範圍內）

- 每日指引：介面已保留分頁但功能未實作。
- 隔離區還原：需要先定義「哪些結構缺陷可自動修補、哪些需要人工確認」的規則。
- `Math.random()` 改為 `crypto.getRandomValues()`：目前分布通過統計檢定（易經銅錢法與塔羅抽牌皆同），是否改用密碼學亂數屬於行為變更，尚未決定。
- 塔羅牌義文字（`loveU`/`loveR`/`careerU`/`careerR`）本身未查證出處，只做過結構層級（張數、唯一性、花色分布、欄位完整性）的檢查。
- 塔羅的「感情/事業」二分對應四個問題分類，是本頁自訂的簡化規則，未經使用者逐項確認（見上方「解讀模式對應」）。
