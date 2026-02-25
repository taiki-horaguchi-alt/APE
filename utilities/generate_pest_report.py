
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

OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\04_顧客案件_Clients\001_小林俊平様_京都綾部_なす\07_病害虫防除カレンダー_初期版.pdf"

# --- 1. No Chart, just visual Table in PDF ---
# Simple script focusing on the visual calendar table.

# --- 2. Report Gen ---
FONT_PATH = "C:\\Windows\\Fonts\\msgothic.ttc"
try:
    pdfmetrics.registerFont(TTFont('Japanese', FONT_PATH))
    FONT_NAME = 'Japanese'
except:
    FONT_NAME = 'Helvetica'

doc = SimpleDocTemplate(OUTPUT_PDF, pagesize=A4, margin=30)
styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=24, spaceAfter=20, alignment=1, textColor=colors.darkgreen)
h1_style = ParagraphStyle('Header1', parent=styles['Heading1'], fontName=FONT_NAME, fontSize=18, spaceBefore=15, spaceAfter=10, textColor=colors.darkgreen)
normal_style = ParagraphStyle('Normal_Ja', parent=styles['Normal'], fontName=FONT_NAME, fontSize=11, leading=16)

story = []

story.append(Spacer(1, 40))
story.append(Paragraph("なす重要病害虫 防除カレンダー", title_style))
story.append(Paragraph("～ 「出たから撒く」では手遅れになる ～", ParagraphStyle('Sub', parent=normal_style, fontSize=14, alignment=1)))
story.append(Spacer(1, 20))

add_h1 = lambda t: story.append(Paragraph(t, h1_style))
add_p = lambda t: story.append(Paragraph(t, normal_style))

add_h1("1. なすの3大天敵")
add_p("これらが出たら、収益はほぼゼロになると思ってください。")
data_enemy = [
    ['敵', '発生時期', '被害', '有効薬剤(例)'],
    ['アザミウマ', '5月～10月', '実が傷だらけ(茶色)になり出荷不可', 'スピノエース, ベネビア'],
    ['ハダニ', '梅雨明け', '葉が枯れて光合成停止', 'カネマイト, ダニサラバ'],
    ['青枯病', '6月～8月', '株ごと枯死(回復不能)', 'バリダシン(予防のみ)'],
]
t1 = Table(data_enemy, colWidths=[80, 80, 180, 120])
t1.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('BACKGROUND', (0,0), (-1,0), colors.lightgreen),
]))
story.append(t1)

add_h1("2. 年間防除スケジュール (Prevention Map)")
add_p("「発生予察」に基づく先手の防除計画です。")

# Simple Calendar Table
data_cal = [
    ['月', '重点ターゲット', 'アクション'],
    ['5月', 'アブラムシ', '定植時に「ベストガード粒剤」を植穴処理 (最重要)'],
    ['6月', 'オオタバコガ', '実に入られる前にフェロモントラップ設置'],
    ['7月', 'ハダニ・青枯病', '梅雨明け直後にダニ剤散布。排水対策確認。'],
    ['8月', 'アザミウマ', '高温で爆発的に増える。3日おきの観察必須。'],
    ['9月', '全般', '台風通過後は必ず「殺菌剤」を撒く（傷口保護）。'],
]
t2 = Table(data_cal, colWidths=[40, 120, 300])
t2.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('BACKGROUND', (0,0), (-1,0), colors.lightgrey),
    ('TEXTCOLOR', (1,2), (1,2), colors.red), # July warning
]))
story.append(t2)

add_h1("3. アドバイス")
add_p("農薬は「ローテーション（種類を変える）」しないと、すぐに抵抗性がついて効かなくなります（特にハダニ）。")
add_p("地域のJAが発行する**「防除暦（ぼうじょごよみ）」**を必ず入手し、それをベースに計画を立ててください。")

try:
    doc.build(story)
    print(f"PDF Generated: {OUTPUT_PDF}")
except Exception as e:
    print(f"Error building PDF: {e}")
