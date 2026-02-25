
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

# --- 1. Generate Cash Flow Chart First ---
def create_cashflow_chart():
    months = np.arange(1, 13)
    # Revenue (Year 2) - Based on previous market analysis
    # June: Early harvest (300k), July-Aug: Peak Volume but low price, Sept-Oct: High Price High Volume
    revenue = np.array([0, 0, 0, 0, 0, 30, 150, 200, 150, 100, 80, 29]) * 10000 
    # Total ~7.4M
    
    # Cost (Year 2) - Spring heavy
    # Jan-Feb: Planning, Mar: Fertilizer/Prep, Apr: Seedlings/Materials, May: Planting labor
    # Total ~3.96M
    cost = np.array([10, 20, 50, 80, 50, 30, 30, 30, 30, 30, 20, 16]) * 10000

    monthly_cf = revenue - cost
    cumulative_cf = np.cumsum(monthly_cf)
    
    # Create Chart
    plt.style.use('ggplot')
    plt.rcParams['font.family'] = 'MS Gothic'
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Bar: Monthly Flow
    ax.bar(months, monthly_cf/10000, color='gray', alpha=0.3, label='月次収支')
    
    # Line: Cumulative
    ax.plot(months, cumulative_cf/10000, color='red', marker='o', linewidth=2, label='累積資金残高 (Cash Balance)')
    
    # Valley of Death Annotation
    min_idx = np.argmin(cumulative_cf)
    min_val = cumulative_cf[min_idx]/10000
    ax.annotate(f'死の谷 (The Valley of Death)\n{min_val}万円', 
                xy=(months[min_idx], min_val), 
                xytext=(months[min_idx], min_val-100),
                arrowprops=dict(facecolor='black', shrink=0.05),
                ha='center', fontsize=12, color='red', fontweight='bold')

    ax.axhline(0, color='black', linewidth=1)
    ax.set_ylabel('金額 (万円)')
    ax.set_xlabel('月')
    ax.set_title('2年目 資金繰りシミュレーション (Cash Flow)')
    ax.legend()
    plt.savefig('chart_cashflow_science.png')
    plt.close()

create_cashflow_chart()

# --- 2. Generate PDF ---
OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\04_顧客案件_Clients\001_小林俊平様_京都綾部_なす\03_資金繰り・科学的根拠レポート_小林俊平様.pdf"
CHART_PATH = 'chart_cashflow_science.png'

# Font
FONT_PATH = "C:\\Windows\\Fonts\\msgothic.ttc"
try:
    pdfmetrics.registerFont(TTFont('Japanese', FONT_PATH))
    FONT_NAME = 'Japanese'
except:
    FONT_NAME = 'Helvetica'

doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=A4, margin=30)
styles = getSampleStyleSheet()

# Styles
title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=24, spaceAfter=20, alignment=1, textColor=colors.darkblue)
h1_style = ParagraphStyle('Header1', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=18, spaceBefore=15, spaceAfter=10, textColor=colors.darkblue)
normal_style = ParagraphStyle('Normal_Ja', parent=styles['Normal'], fontName=FONT_NAME, fontSize=11, leading=16)
quote_style = ParagraphStyle('Quote', parent=normal_style, leftIndent=20, textColor=colors.darkgrey, fontName=FONT_NAME)

story = []

# Title
story.append(Spacer(1, 30))
story.append(Paragraph("資金繰り(Cash Flow)と科学的根拠について", title_style))
story.append(Paragraph("～ なぜ「黒字倒産」が起きるのか？ ～", ParagraphStyle('Sub', parent=normal_style, fontSize=14, alignment=1)))
story.append(Spacer(1, 20))

# Section 1: Scientific Importance
add_h1 = lambda t: story.append(Paragraph(t, h1_style))
add_p = lambda t: story.append(Paragraph(t, normal_style))

add_h1("1. 科学的根拠: The Survival Constraint")
add_p("マサチューセッツ工科大学(MIT)のエスター・デュフロ教授らの研究(Duflo et al., 2011)によれば、農業従事者が最適な投資（肥料や種への投資）を行えない最大の要因は、知識不足ではなく**「収穫前の資金不足 (Present Bias & Liquidity Constraints)」**にあります。")
story.append(Spacer(1, 5))
add_p("APEはこの理論に基づき、単なる「年間利益」ではなく、**「毎月の生存確率 (Survival Constraint)」** を最重要視して設計されています。")
story.append(Paragraph("<i>\"Farmers fail not because they can't grow crops, but because they can't sustain liquidity until harvest.\"</i>", quote_style))

# Section 2: Kobayashi's Cash Flow
add_h1("2. 小林様の資金繰りシミュレーション")
add_p("以下は、2年目（66a）における現金の動きです。")
story.append(Image(CHART_PATH, width=450, height=300))
story.append(Spacer(1, 10))

add_p("<b>⚠️ 危険地帯 (The Valley of Death): 5月～6月</b>")
add_p("グラフの赤い折れ線をご覧ください。3月～5月に肥料・資材・苗代の支払いが集中し、累積赤字が最大 **-200万円以上** に達します。")
add_p("たとえ年間で340万円の利益が出ても、この5月の時点で手元資金が尽きれば、その時点で事業はストップしてしまいます。")

# Section 3: Action Plan
add_h1("3. 必要な運転資金 (Working Capital)")
data = [
    ['項目', '金額', '備考'],
    ['最大赤字幅', '約 210 万円', '5月末時点での累積支出'],
    ['安全マージン', '+ 100 万円', '不測の事態（ポンプ故障等）への備え'],
    ['必要運転資金', '約 310 万円', 'これがないとスタートしてはいけません'],
]
t = Table(data, colWidths=[100, 100, 250])
t.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
    ('TEXTCOLOR', (1,3), (1,3), colors.red),
]))
story.append(t)
story.append(Spacer(1, 10))
add_p("この「310万円」は、設備投資（機械代）とは別に、銀行口座に入っていなければならない現金です。")

# Build
try:
    doc.build(story)
    print(f"PDF Generated: {OUTPUT_PDF}")
except Exception as e:
    print(f"Error building PDF: {e}")
