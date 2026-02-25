# APE - Agri-Profit Engine

農業収益最適化エンジン。土壌診断、作物推薦、収益シミュレーション、販路マッチング機能を提供。

## 📂 プロジェクト構成

### コードベース（ローカル）
**場所**: `C:\Users\steam\Dev\Projects\APE\`

```
APE/
├── demo/              # Streamlitデモアプリケーション
├── client_projects/   # 顧客案件（実データ・レポート生成）
└── utilities/         # ユーティリティスクリプト
```

### ドキュメント（このフォルダ）
- `00_事業計画資料_Docs/` - 事業計画、仕様書
- `01_計算ロジック_Logic/` - ロジック説明ドキュメント
- `02_参考文献データ_References/` - 参考文献・データ
- `99_AIプロンプト_Prompts/` - プロンプトテンプレート

## 🚀 開発環境セットアップ

```bash
cd C:\Users\steam\Dev\Projects\APE\demo
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
streamlit run app.py
```

## 📝 最近の更新
- 2026-01-24: NotebookLMでスライド4枚完成
- 2026-01-21: 小林さん向けなす栽培収支シミュレーション完了
- 2026-01-25: 開発環境整理（G→C drive）
