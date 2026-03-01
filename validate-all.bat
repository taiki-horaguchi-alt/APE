@echo off
REM APE 本番環境チェック・テスト実行スクリプト（Windows版）
REM 使用方法: validate-all.bat

setlocal enabledelayedexpansion

echo.
echo ══════════════════════════════════════════════════════════════
echo   🚀 APE 本番環境 検証・テスト スイート
echo ══════════════════════════════════════════════════════════════
echo.

REM Step 1: ビルド検証
echo ──────────────────────────────────────────────────────────────
echo 📦 Step 1️⃣: ビルド検証
echo ──────────────────────────────────────────────────────────────
echo.

call pnpm build
if errorlevel 1 (
  echo ❌ ビルドエラー
  exit /b 1
)
echo ✅ ビルド成功
echo.

REM Step 2: 環境チェック
echo ──────────────────────────────────────────────────────────────
echo 🔍 Step 2️⃣: 本番前チェック
echo ──────────────────────────────────────────────────────────────
echo.

for /f "tokens=*" %%i in (apps\web\.env.local) do set %%i

call node check-env.js
if errorlevel 1 (
  echo ❌ 環境チェックエラー
  exit /b 1
)
echo ✅ 環境チェック成功
echo.

REM Step 3: E2Eテスト
echo ──────────────────────────────────────────────────────────────
echo 🧪 Step 3️⃣: E2Eテスト実行
echo ──────────────────────────────────────────────────────────────
echo.

call pnpm exec playwright test
echo ⚠️  E2Eテスト完了
echo.

REM 完了
echo ══════════════════════════════════════════════════════════════
echo   ✅ 検証・テスト実行完了！
echo ══════════════════════════════════════════════════════════════
echo.
echo 📊 次のステップ:
echo   1. テスト結果を確認
echo   2. E2Eテスト失敗を修正
echo   3. Supabase本番マイグレーション実行
echo   4. 本番環境にデプロイ
echo.

endlocal
