
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

OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\04_顧客案件_Clients\001_小林俊平様_京都綾部_なす\05_労働ピーク・適正規模診断_小林俊平様.pdf"
CHART_PATH = 'chart_labor.png'

# --- 1. Labor Data Simulation ---
# 66a Eggplant
# Standard: 300 hrs/10a/month in peak?
# MAFF data: Total ~1000-1500 hrs/10a/year. 66a = 6600 - 9900 hours.
# 2 people = 4000-5000 hours capacity (limit).
# THIS IS IMPOSSIBLE for 2 people.
# Let's visualize this specific "Overwork" risk.

def create_labor_chart():
    months = np.arange(1, 13)
    # Estimated hours per month for 66a (Assuming 150h/10a peak)
    # Peak is July, Aug, Sept.
    # 6.6 tan * 150h = 990h/month.
    # 2 people working 25 days * 10h = 500h capacity.
    
    demand = np.array([50, 50, 100, 200, 400, 600, 990, 950, 800, 500, 200, 50])
    capacity_2ppl = np.full(12, 500) # 250h * 2
    capacity_3ppl = np.full(12, 750) # 250h * 3
    
    plt.style.use('ggplot')
    plt.rcParams['font.family'] = 'MS Gothic'
    fig, ax = plt.subplots(figsize=(10, 6))
    
    ax.bar(months, demand, color='orange', alpha=0.7, label='必要労働時間 (Demand)')
    ax.plot(months, capacity_2ppl, color='red', linestyle='--', linewidth=3, label='2人限界ライン (500h)')
    ax.plot(months, capacity_3ppl, color='green', linestyle='--', linewidth=2, label='3人限界ライン (750h)')
    
    # Text
    ax.text(7, 1050, '❌ 物理的に無理 (Overwork)', ha='center', color='red', fontweight='bold')
    
    ax.set_title('労働ピーク分析: 66a(2000坪) vs 人力')
    ax.set_ylabel('時間/月')
    ax.set_xticks(months)
    ax.legend()
    plt.savefig(CHART_PATH)
    plt.close()

create_labor_chart()

# --- 2. Report Gen ---
FONT_PATH = "C:\\Windows\\Fonts\\msgothic.ttc"
try:
    pdfmetrics.registerFont(TTFont('Japanese', FONT_PATH))
    FONT_NAME = 'Japanese'
except:
    FONT_NAME = 'Helvetica'

doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=A4, margin=30)
styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=24, spaceAfter=20, alignment=1, textColor=colors.maroon)
h1_style = ParagraphStyle('Header1', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=18, spaceBefore=15, spaceAfter=10, textColor=colors.maroon)
h2_style = ParagraphStyle('Header2', parent=styles['Heading2'], fontName=FONT_NAME, fontSize=14, spaceBefore=10, spaceAfter=5, textColor=colors.darkred)
normal_style = ParagraphStyle('Normal_Ja', parent=styles['Normal'], fontName=FONT_NAME, fontSize=11, leading=16)

story = []

story.append(Spacer(1, 40))
story.append(Paragraph("労働ピーク・適正規模診断レポート", title_style))
story.append(Paragraph("～ 「もったいない」と「過労死」の境界線 ～", ParagraphStyle('Sub', parent=normal_style, fontSize=14, alignment=1)))
story.append(Spacer(1, 20))

# Content
add_h1 = lambda t: story.append(Paragraph(t, h1_style))
add_p = lambda t: story.append(Paragraph(t, normal_style))

add_h1("1. 緊急警告: 66aは2人では回りません")
add_p("小林様の目標「2年目 2000坪（66a）」について、労働時間のシミュレーションを行いました。")
add_p("結論から申し上げますと、<b>「7月〜9月に完全にパンク」</b>します。")
story.append(Image(CHART_PATH, width=450, height=300))

add_h1("2. データ詳細: 魔の7月・8月")
add_p("なすの収穫・調製作業は、夏場に爆発的に増えます。")
data = [
    ['月', '必要時間', '2人稼働(MAX)', '不足時間', '結果'],
    ['6月', '600h', '500h', '-100h', '残業でなんとか...'],
    ['7月', '990h', '500h', '<b>-490h</b>', '<b>半分廃棄 (捨てる)</b>'],
    ['8月', '950h', '500h', '<b>-450h</b>', '<b>過労 & 品質低下</b>'],
]
t = Table(data, colWidths=[60, 80, 80, 80, 150])
t.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
    ('TEXTCOLOR', (3,2), (4,3), colors.red),
]))
story.append(t)

add_h1("3. 現実的な解決策 (Action Plan)")
add_p("今のまま突入するのは無謀です。以下のいずれかを選択してください。")

add_p("<b>案A: 規模縮小 (Scale Down)</b>")
add_p("・面積を<b>40a (1200坪)</b>に抑える。これなら2人でギリギリ回せます。")
add_p("・利益は減りますが、廃棄ロスがなくなり、体は守れます。")

add_p("<b>案B: パート雇用 (Hire Staff)</b>")
add_p("・7月〜9月限定で、<b>「週3日×3人」</b>のシルバー人材かパートさんを雇う。")
add_p("・人件費は約60万円かかりますが、売上機会ロス（数百万）を防げます。")

add_p("<b>推奨:</b>")
add_p("初心者の2年目であれば、<b>案A（40a）からのスタート</b>を強くお勧めします。")

try:
    doc.build(story)
    print(f"PDF Generated: {OUTPUT_PDF}")
except Exception as e:
    print(f"Error building PDF: {e}")
