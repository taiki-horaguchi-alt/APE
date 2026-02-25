
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
import os

OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\04_顧客案件_Clients\001_小林俊平様_京都綾部_なす\04_初期投資・必要道具リスト_チェックシート.pdf"

# Font
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
story.append(Paragraph("初期投資・必要道具リスト チェックシート", title_style))
story.append(Paragraph("～ 買い物・手配の抜け漏れ防止用 ～", ParagraphStyle('Sub', parent=normal_style, fontSize=14, alignment=1)))
story.append(Spacer(1, 20))

add_h1 = lambda t: story.append(Paragraph(t, h1_style))
add_p = lambda t: story.append(Paragraph(t, normal_style))

add_h1("1. 優先度 S (絶対にないと始まらない)")
add_p("2月の段階で手配を完了させてください。特に「苗」は予約必須です。")

data_s = [
    ['チェック', '品目', '予算目安', '備考/選び方'],
    ['□', 'なす苗 (千両二号)', '8万円', '接木苗(台木:トルバム)を指定すること。'],
    ['□', '管理機 (5-6馬力)', '20万円', '中古でOK。「ヤンマーポチ」等が使いやすい。'],
    ['□', '軽トラック', '50万円', '4WD必須。農道はぬかるみます。'],
    ['□', '動力噴霧器 (セット動噴)', '10万円', '背負い式は不可(重すぎる)。ホース50m付き。'],
    ['□', '肥料 (牛糞堆肥)', '4万円', '2tダンプ1杯分。近くの畜産農家を探す。'],
]
t1 = Table(data_s, colWidths=[40, 100, 80, 280])
t1.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('BACKGROUND', (0,0), (-1,0), colors.lightgreen),
    ('ALIGN', (0,0), (0,-1), 'CENTER'),
]))
story.append(t1)

add_h1("2. 優先度 A (4月までに揃える)")
add_p("定植準備（畝立て）に使う資材です。")

data_a = [
    ['チェック', '品目', '予算目安', '備考/選び方'],
    ['□', '黒マルチ (135cm幅)', '1万円', '雑草抑制・地温確保用。'],
    ['□', '支柱 (180cm/20mm)', '20万円', 'イボ竹。太さ20mm以上ないと台風で折れる。'],
    ['□', '誘引紐・クリップ', '3万円', '「くきたっち」等の資材があると作業が3倍速い。'],
    ['□', '防風ネット (2m幅)', '5万円', '4mm目合い。風上だけでも設置する。'],
]
t2 = Table(data_a, colWidths=[40, 100, 80, 280])
t2.setStyle(TableStyle([
    ('FONT', (0,0), (-1,-1), FONT_NAME),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('BACKGROUND', (0,0), (-1,0), colors.lightyellow),
    ('ALIGN', (0,0), (0,-1), 'CENTER'),
]))
story.append(t2)

add_h1("3. コスト削減の裏技")
add_p("・<b>支柱:</b> 新品を買うと高いです。離農する農家さんから「譲ってもらう」のが最強です。地域の会合で声をかけてみてください。")
add_p("・<b>管理機:</b> 最初は「レンタル」でも構いません（JAレンタル農機など）。")

try:
    doc.build(story)
    print(f"PDF Generated: {OUTPUT_PDF}")
except Exception as e:
    print(f"Error building PDF: {e}")
