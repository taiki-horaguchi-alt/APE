
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os

OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\04_顧客案件_Clients\001_小林俊平様_京都綾部_なす\06_販売チャネル戦略_ポートフォリオ_小林俊平様.pdf"
CHART_PATH = 'chart_sales_portfolio.png'

# --- 1. Portfolio Simulation ---
# Target: 350 yen/kg average
# JA only: 250 yen (Risky)
# Direct: 450 yen
# Premium: 600 yen

def create_portfolio_chart():
    labels = ['JA出荷 (安値・大量)', '直売所 (中値・現金)', '契約・個人 (高値・手間)']
    sizes_bad = [100, 0, 0] # 250 yen avg
    sizes_ideal = [60, 30, 10] # Mixed
    
    # Calc average price
    # Bad: 250
    # Ideal: 0.6*250 + 0.3*450 + 0.1*600 = 150 + 135 + 60 = 345 yen (Close to target)
    
    plt.style.use('ggplot')
    plt.rcParams['font.family'] = 'MS Gothic'
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 5))
    
    # Pie 1: Standard Farmer
    ax1.pie(sizes_bad, labels=labels, autopct='%1.1f%%', startangle=90, colors=['silver', 'orange', 'gold'])
    ax1.set_title('一般モデル: 単価250円\n(利益 150万円)')
    
    # Pie 2: Strategic Farmer
    ax2.pie(sizes_ideal, labels=labels, autopct='%1.1f%%', startangle=90, colors=['silver', 'orange', 'gold'])
    ax2.set_title('推奨モデル: 単価345円\n(利益 340万円)')
    
    plt.savefig(CHART_PATH)
    plt.close()

create_portfolio_chart()

# --- 2. Report Gen ---
FONT_PATH = "C:\\Windows\\Fonts\\msgothic.ttc"
try:
    pdfmetrics.registerFont(TTFont('Japanese', FONT_PATH))
    FONT_NAME = 'Japanese'
except:
    FONT_NAME = 'Helvetica'

doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=A4, margin=30)
styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=24, spaceAfter=20, alignment=1, textColor=colors.darkblue)
h1_style = ParagraphStyle('Header1', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=18, spaceBefore=15, spaceAfter=10, textColor=colors.darkblue)
normal_style = ParagraphStyle('Normal_Ja', parent=styles['Normal'], fontName=FONT_NAME, fontSize=11, leading=16)

story = []

story.append(Spacer(1, 40))
story.append(Paragraph("販売チャネル最適化レポート", title_style))
story.append(Paragraph("～ 「誰に売るか」で年収は200万変わる ～", ParagraphStyle('Sub', parent=normal_style, fontSize=14, alignment=1)))
story.append(Spacer(1, 20))

add_h1 = lambda t: story.append(Paragraph(t, h1_style))
add_p = lambda t: story.append(Paragraph(t, normal_style))

add_h1("1. なぜ「JA全量出荷」ではダメなのか？")
add_p("計画上の目標単価「350円/kg」は、実はJA出荷だけでは達成困難な数字です。")
add_p("JAの手取り平均は、市場相場から手数料を引かれるため、良くて<b>250円～280円</b>です。")
add_p("このままでは、収量目標を達成しても利益目標には届きません。")

add_h1("2. 推奨ポートフォリオ (Golden Ratio)")
story.append(Image(CHART_PATH, width=450, height=250))
add_p("小林様の目指すべき黄金比率は<b>「6:3:1」</b>です。")

data = [
    ['チャネル', '比率', '狙い・メリット', '具体的アクション'],
    ['JA出荷 (Base)', '60%', '【量】をはく。売れ残りを防ぐ土台。', '選果場への持ち込み'],
    ['直売所 (Mix)', '30%', '【現金】を稼ぐ。単価450円で粗利UP。', '「あやべ温泉」や道の駅への出荷'],
    ['飲食店 (Top)', '10%', '【ブランド】を作る。単価600円。', '京都市内の料亭・イタリアン営業'],
]
t = Table(data, colWidths=[80, 40, 160, 180])
t.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
]))
story.append(t)

add_h1("3. 小林さんの強みを活かす")
add_p("小林さんは「青果卸」の経験があるため、飲食店や小売店バイヤーとの交渉は得意なはずです。")
add_p("一般の農家が苦手とする「この10%（飲食店開拓）」を最初から攻めることで、初年度から高単価を実現できる可能性があります。")

try:
    doc.build(story)
    print(f"PDF Generated: {OUTPUT_PDF}")
except Exception as e:
    print(f"Error building PDF: {e}")
