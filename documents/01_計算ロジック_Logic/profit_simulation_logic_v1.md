# APE「完全収支シミュレーション」ロジック設計書

プロンプトに基づき、農業経済学とデータサイエンスの観点から設計した**「究極の農業収支計算ロジック」**です。

## 1. ターゲットユーザー (Target User Mix)
*   **新規就農者 (50%):** 「何を作ればいいかわからない」層向け ⇒ **Discovery Mode (最適作物探索)**
*   **既存農家 (50%):** 「今の作物でもっと稼ぎたい」層向け ⇒ **Optimization Mode (現状改善)**

## 2. 収益シミュレーション・ロジック (Core Logic)

APEは**「生物学的ポテンシャル (Physics)」×「経済的リスク (Economics)」×「行動心理 (Behavior)」**の3層構造で計算を行います。

### A. Discovery Mode (新規・転換向け):
「土地」のポテンシャルを物理計算し、SERFモデルでリスク調整した「推奨作物」を提示します。

#### ① Physics Engine (物理ポテンシャル)
FAO-GAEZのロジックを応用し、理論上の**「潜在収量 (Potential Yield, $Y_p$)」**を算出。
*   $$Y_p = \sum (Rainfall \times Radiation \times SoilEfficiency)$$ - (Van Ittersum et al., 2013)
*   これに対し、初心者補正 ($0.6$) や病害リスク係数を掛けて「予想収量」とする。

#### ② Economic Engine (リスク調整後利益)
単なる「平均利益」ではなく、**SERF (Stochastic Efficiency with Respect to a Function)** を用いて「確実性等価 (Certainty Equivalent)」を算出。
*   $$CE = ln(E[exp(-r_a \times Profit)]) / -r_a$$
    *   $r_a$ (危険回避度): 新規就農者は $0.03$ (高リスク回避)、ベテランは $0.01$ (リスク許容) に設定。
    *   これにより、「平均利益は高いが、全滅リスクもある作物」は新規就農者には推奨されなくなる。

### B. Optimization Mode (既存農家向け): Kaizen Logic
現在の実績($Y_a$)と、理論ポテンシャル($Y_p$)の差分(Yield Gap)を分解解析します。

#### ① Yield Gap Analysis (収量ギャップ分解)
*   **Gap Formula:** $$Y_g = Y_p - Y_a$$
*   **Gap Factors (要因分解):**
    *   XGBoostモデルの **SHAP値 (Feature Importance)** を用いて、Gapの要因を特定。
    *   *例:* "Planting Date (SHAP: -15%)", "Variety Choice (SHAP: -10%)"
    *   これにより「何を直せばGapが埋まるか」を定量的（金額）に提示可能。

---

### ③ 初期投資ギャップ (Capital Gap)
主な投資項目をユーザーが持っている「資産 (Assets)」と照らし合わせ、不足分を算出します。

## 3. 全体構造図 (Logic Flow)

```mermaid
graph TD
    User[ユーザー入力: 土地/資金/経験] --> ResourceCalc[A. リソース判定]
    Env[環境データ: 気象/土壌] --> MatchCalc[B. 適地適作マッチング]
    Market[市場データ: 相場/販路] --> MarketCalc[C. 市場性分析]
    
    ResourceCalc & MatchCalc & MarketCalc --> SimulationEngine{APE Simulation Engine}
    
    SimulationEngine --> Capital[1. 初期投資ギャップ]
    SimulationEngine --> Difficulty[2. 栽培難易度スコア]
    SimulationEngine --> Profit[3. リアル時給 (手取り)]
    SimulationEngine --> Risk[4. 相場変動リスク幅]
    
    Capital & Difficulty & Profit & Risk --> FinalDecision[[総合判定: 推奨ランク]]
```

---

## 2. 詳細計算式 (Detailed Formulas)

### ① 初期投資ギャップ (Initial Capital Gap)
自己資金で足りるか、いくら借入が必要かを算出します。
*   `Land_Cost` = **(土地購入費 if 購入)** OR 0 (if 賃借/所有済み)
*   `Required_Cost` = (`Land_Cost` + 機械導入費 + 施設建設費 + 初年度資材費) - (サンクコスト償却分)
*   `Grant_Amount` = 自動判定された補助金の上限額 (例: 認定新規就農者資金)
*   **`Gap` = `Required_Cost` - (`Own_Capital` + `Grant_Amount`)**
    *   ※Gapがプラスの場合、ローン返済計画がPLに追加されます。

### ② 栽培難易度スコア (Difficulty Score)
「その人が、その土地で、その作物を作る」際のリスクを数値化 (1.0〜10.0) します。
*   `Base_Diff` = 作物固有の難易度 (例: トマト=7, 葉物=3)
*   **`Variety_Factor` = 品種による耐病性・生理障害耐性 (例: 耐病性品種は難易度DOWN)**
*   `Climate_Mismatch` = |最適気温 - その土地の予測気温| × 係数 (気候が合わないほど数値増)
*   `Exp_Factor` = 1.0 (ベテラン) 〜 3.0 (初心者)
*   **`Score` = `Base_Diff` × `Variety_Factor` × `Climate_Mismatch` × `Exp_Factor`**
    *   ※Score > 8.0 の場合、「警告: 失敗確率高」を表示。

### ③ リアル時給 (Real Hourly Wage)
「結局、1時間あたりいくら稼げるの？」という労働生産性指標です。
*   `Revenue` = (予想単収 × 栽培面積) × (予想市場単価 × 相場係数)
*   `Land_Rent` = **(地代 if 賃借)** OR 0
*   `Cost` = (資材費 + 燃料費 + `Land_Rent` + 減価償却費 + 借入金返済)
*   `Labor_Hours` = (品目別標準労働時間 × 面積) ÷ (機械化効率係数)
*   **`Hourly_Wage` = (`Revenue` - `Cost`) ÷ `Labor_Hours`**
    *   ※機械化効率係数: トラクター馬力や自動化設備の有無で、労働時間を圧縮します。

### ⑤ 労働ピークと稼働限界 (Labor Peak Analysis)
「週末農業でやりたいが、収穫期に平日も休めないレベルで忙しくなる」リスクを回避します。
*   `Monthly_Labor_Need` = 作物ごとの月別作業時間データ参照
*   `Daily_Peak_Hours` = `Monthly_Labor_Need`の最大月 ÷ 30日
*   `Available_Hours` = **(週末のみ: 16h/週)** OR **(専業: 60h/週)**
*   **判定ロジック:**
    *   IF `Monthly_Labor_Need` > `Available_Hours` THEN "警告: 労働力不足 (雇用が必要)"
    *   結果表示: 「8月は毎日12時間の作業が必要です（週末農業では不可能です）」

### ⑥ 複合経営・二毛作ロジック (Rotation Strategy)
「夏野菜が終わった後に冬野菜」など、2作目による収益最大化を計算します。
*   `Total_Revenue` = Crop_A.Revenue + Crop_B.Revenue
*   `Conflict_Check` = Crop_Aの収穫期とCrop_Bの定植期が重ならないか判定
*   `Soil_Sustainability` = 連作障害リスク係数 (同科作物の連続はNG)

### ⑦ 「生存戦略」キャッシュフロー (Cash Flow Survival)
**「黒字倒産」を防ぐための月次資金繰りシミュレーションです。**
*   **魔の「無収入期間」:** 定植から初収穫までの数ヶ月間（例：イチゴなら6ヶ月）の生活費と運転資金の減少を可視化。
*   `Monthly_Balance_Check`: 毎月の現金残高がマイナスになった時点で **「GAME OVER (資金ショート)」** 警告を出す。
*   **リアルな隠れコスト:**
    *   **地域活動費:** 水利組合費、村の草刈り日当、お祭り寄付金
    *   **廃棄・処理費:** マルチシートや残渣の産業廃棄物処理費
    *   **生活費:** 農業経費とは別に、月20〜30万円の生活費が必ず出ていくことを強制的に組み込む。

### ⑧ 初心者補正ロジック (Rookie Reality Check)
「地域の平均単収」はベテランも含んだ数字です。初心者が最初から取れるわけがありません。
*   `Rookie_Yield_Rate` = 1年目 60%, 2年目 75%, 3年目 90%
*   `Skill_Growth_Speed` = 研修経験や指導者の有無で成長曲線を調整。

### ⑨ 副業シナジー提案 (Side Hustle Synergy)
「農業だけで食えない期間」を、「将来の農業収益につながる仕事」で埋めるための提案ロジックです。
*   **冬場(農閑期)の仕事:**
    *   **除雪・スキー場スタッフ:** 北国の農家定番。現金収入確保。
    *   **酒造・加工場:** 冬期限定の仕事が多く、食品加工のノウハウが学べる。
*   **戦略的シナジー職種:**
    *   **飲食店ホール/キッチン:** シェフと繋がりができ、将来の「販路」になる（直販ルート開拓）。
    *   **農業法人アルバイト:** プロの技術を盗みながら給料をもらう（技術習得）。
    *   **IT/Web制作:** 自社ECサイト構築やSNS発信力を磨く（広報・販売力強化）。
*   **マッチングロジック:**
    *   IF `Status` = "Sales Weak" THEN Suggest "Restaurant Work"
    *   IF `Status` = "Tech Low" THEN Suggest "Farm Corp Part-time"

---

## 3. 入力インターフェース (UI/UX)

質問に答えるだけの「ウィザード形式」で、バックグラウンドの変数を埋めます。

### Step 0: 働き方と土地 (Lifestyle & Land)
*   Q. 「あなたの就農スタイルは？」
    *   [ ] **ガッツリ専業 (Full-time):** 生活費を全て稼ぐ
    *   [ ] **兼業・副業 (Side Hustle):** 平日は会社、朝夕と週末に農業
    *   [ ] **週末農業 (Weekend):** 土日のみ (レジャー感覚)
*   Q. 「土地はどうしますか？」
    *   [ ] すでに持っている (Owned)
    *   [ ] 借りる予定 (Lease) → 地代計上
    *   [ ] 買う予定 (Purchase) → 土地購入費計上

### Step 1: あなたの「武器」を確認 (Resources)
*   Q. 「トラクターなどの機械は持っていますか？」
    *   [ ] 持っていない (購入必要)
    *   [ ] 実家のものがある (20馬力以下)
    *   [ ] 大型機械がある (50馬力以上) → 機械化効率係数 UP / 初期投資 DOWN

### Step 2: 土地の「健康診断」 (Environment)
*   Q. 「予定地の場所を教えてください（ピン留め）」
    *   → 裏側で気象・土壌データ取得して `Climate_Mismatch` を計算。

### Step 3: ビジネスの「攻め方」 (Strategy)
*   Q. 「どうやって売りたいですか？」
    *   [ ] とにかく高く売りたい (直売・ネット) →手間増、単価増
    *   [ ] 全量買い取ってほしい (市場・契約) →手間減、単価安定
    *   [ ] こだわりの栽培をしたい (有機など) →難易度 UP、単価 UP

---

## 4. 出力イメージ (Result Dashboard)

### 📊 労働カレンダー (Workforce Heatmap)
*   「8月にピーク（1日10時間）」が赤色で表示される。
*   **アドバイス:** 「週末農業希望ですが、8月の収穫期だけは平日の朝夕も作業が必要です。難しい場合は、収穫期がずれる『長ネギ』への変更を推奨します。」

### 🏆 総合判定: Sランク 「大玉トマト (施設栽培)」
*   **働き方適合度:** ★★★★☆ (専業向け)
*   **リアル時給:** 2,400円 (地域平均の1.5倍)
*   **初期投資:** 350万円 (補助金活用で実質150万円)
*   **成功確率:** 85% (気候マッチ度 高)

### 🔄 二毛作オプション提案
*   「トマト収穫後のハウスで『ほうれん草』を作ると、**年間利益が+30万円**アップします（労働ピークは重なりません）。」
