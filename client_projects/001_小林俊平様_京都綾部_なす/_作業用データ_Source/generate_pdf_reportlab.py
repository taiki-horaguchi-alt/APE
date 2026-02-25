
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os

# Define Paths
OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\APE_Kobayashi_Master_Report.pdf"

# --- Fonts ---
# Trying to find a Japanese font. 
# Windows usually has 'msgothic.ttc' or 'meiryo.ttc'.
FONT_PATH = "C:\\Windows\\Fonts\\msgothic.ttc"
if not os.path.exists(FONT_PATH):
    # Fallback if not found, use default but Japanese won't render.
    # In this environment, let's try standard fonts if available or just proceed with warning.
    # Assuming user has Japanese fonts on Windows.
    pass

try:
    pdfmetrics.registerFont(TTFont('Japanese', FONT_PATH))
    FONT_NAME = 'Japanese'
except:
    FONT_NAME = 'Helvetica' # Fallback, but text will be garbled.

# --- Content ---
doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=A4, margin=30)
styles = getSampleStyleSheet()

# Custom Styles
title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=24, spaceAfter=20, alignment=1, textColor=colors.darkgreen)
h1_style = ParagraphStyle('Header1', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=18, spaceBefore=15, spaceAfter=10, textColor=colors.darkgreen)
h2_style = ParagraphStyle('Header2', parent=styles['Heading2'], fontName=FONT_NAME, fontSize=14, spaceBefore=10, spaceAfter=5, textColor=colors.darkblue)
normal_style = ParagraphStyle('Normal_Ja', parent=styles['Normal'], fontName=FONT_NAME, fontSize=11, leading=16)

story = []

# Title Page
story.append(Spacer(1, 100))
story.append(Paragraph("農業経営計画書：なす露地栽培事業", title_style))
story.append(Paragraph("小林 俊平 様", ParagraphStyle('Subject', parent=normal_style, fontSize=16, alignment=1)))
story.append(Spacer(1, 20))
story.append(Paragraph("2026年1月21日", ParagraphStyle('Date', parent=normal_style, fontSize=12, alignment=1)))
story.append(Paragraph("作成: APE Project Lead 洞口 大輝", ParagraphStyle('Author', parent=normal_style, fontSize=12, alignment=1)))
story.append(PageBreak())

# Content Helper
def add_h1(text):
    story.append(Paragraph(text, h1_style))

def add_h2(text):
    story.append(Paragraph(text, h2_style))

def add_p(text):
    story.append(Paragraph(text, normal_style))
    story.append(Spacer(1, 8))

def add_img(path, width=400):
    if os.path.exists(path):
        img = Image(path, width=width, height=width*0.6)
        story.append(img)
        story.append(Spacer(1, 10))

# --- Report Body (Simplified extraction from MD content) ---

add_h1("1. 事業概要とビジョン")
add_h2("1.1 ビジョン")
add_p("「経験」と「データ」を融合させ、不確実性の高い農業を「計算できる経営」へと変革します。")
add_h2("1.2 栽培品目: なす（露地）")
add_p("選定理由: 関西圏の底堅い需要、京都ブランド（京なす）の優位性、そして小林様の技術習得に適した品目であること。")
add_h2("1.3 ロードマップ")
add_p("・1年目 (5a): 「失敗のデータを取る」。赤字回避が目標。<br/>・2年目 (66a): 「生計を立てる」。利益350万円目標。")

add_h1("2. 市場分析と販売戦略")
add_p("市場価格は季節によって大きく変動します。以下のグラフは過去5年の傾向です。")
add_img(r"h:\マイドライブ\antigravity\scratch\chart_price.png")
add_p("7-8月は単価が安くなります。狙い目は「3-5月」と「9-10月」です。特に関西市場は京なすへの評価が高く、単価+50〜100円が期待できます。")

add_h1("3. 生産計画と気候リスク管理")
add_p("綾部市新庄町の2024年実測データに基づく気候分析です。")
add_img(r"h:\マイドライブ\antigravity\scratch\chart_climate.png")
add_h2("3大リスク")
add_p("1. 5月上旬の遅霜（5.4℃）: トンネル必須。<br/>2. 5月末の豪雨（109mm/日）: 高畝・排水対策必須。<br/>3. 9月の台風: 支柱強化必須。")

add_h1("4. 収支シミュレーション")
add_p("2年目（66a）のキャッシュフロー予測です。")
add_img(r"h:\マイドライブ\antigravity\scratch\chart_profit.png")
add_p("売上740万円、経費396万円、営業利益343万円を見込みます。9-10月の売上が年間の4割を占める「秋勝負」のモデルです。")

add_h1("5. 結論")
add_p("1年目はデータを取ることに集中し、無理な収益化は目指さないでください。2年目からの「秋出し戦略」で確実に収益化できます。")

# Build
try:
    doc.build(story)
    print(f"PDF Generated: {OUTPUT_PDF}")
except Exception as e:
    print(f"Error building PDF: {e}")

