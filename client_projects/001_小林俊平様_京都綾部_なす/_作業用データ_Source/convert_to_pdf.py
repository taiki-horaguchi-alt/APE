
import markdown
import pdfkit
import os

# Install wkhtmltopdf binary manually if needed or assume it's in PATH.
# Actually, pdfkit requires wkhtmltopdf installed on the OS.
# If not available, we might need another pure python solution like weasyprint.
# Switching logic to check typical paths or fallback.

# Let's try weasyprint first as it's cleaner for python-only envs if libraries are present.
# But libraries like pango/cairo are often missing in bare python envs.
# Let's try a very simple approach: HTML first, then tell user to print to PDF?
# No, user asked provided a PDF. 

# Alternative: reportlab.
# Parsing MD to Reportlab is complex.
# 
# Let's try converting MD -> HTML -> PDF using 'xhtml2pdf' (pisa).
# It's pure python.
# pip install xhtml2pdf

from xhtml2pdf import pisa

INPUT_MD = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\APE_Kobayashi_Master_Report.md"
OUTPUT_PDF = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\APE_Kobayashi_Master_Report.pdf"

def convert_md_to_pdf(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Convert MD to HTML with extensions
    html_content = markdown.markdown(text, extensions=['tables', 'fenced_code', 'toc'])
    
    # Add CSS for professional look
    # Japan typeface is tricky in PDF generation. Must specify font.
    # IPAexGothic is standard in many envs, or we use a widely available one.
    # xhtml2pdf has some font support.
    
    full_html = f"""
    <html>
    <head>
    <style>
        @page {{
            size: A4;
            margin: 2cm;
            @frame footer_frame {{
                -pdf-frame-content: footerContent;
                bottom: 1cm;
                margin-left: 2cm;
                margin-right: 2cm;
                height: 1cm;
            }}
        }}
        body {{
            font-family: "HeiseiMin-W3", "MSGothic", "IPAexGothic", sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }}
        h1 {{
            color: #2E7D32; /* Farming Green */
            border-bottom: 2px solid #2E7D32;
            padding-bottom: 5px;
            font-size: 24pt;
            margin-top: 30px;
        }}
        h2 {{
            color: #1B5E20;
            background-color: #E8F5E9;
            padding: 5px 10px;
            font-size: 16pt;
            margin-top: 25px;
            border-left: 5px solid #2E7D32;
        }}
        h3 {{
            color: #388E3C;
            font-size: 14pt;
            margin-top: 20px;
            border-bottom: 1px dotted #ccc;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }}
        th {{
            background-color: #f2f2f2;
            color: #333;
        }}
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        blockquote {{
            background: #f9f9f9;
            border-left: 10px solid #ccc;
            margin: 1.5em 10px;
            padding: 0.5em 10px;
            font-style: italic;
        }}
        img {{
            max-width: 100%;
            height: auto;
            margin: 20px auto;
            display: block;
            border: 1px solid #eee;
        }}
        .footer {{
            text-align: right;
            font-size: 9pt;
            color: #999;
        }}
    </style>
    </head>
    <body>
    {html_content}
    <div id="footerContent" class="footer">
        APE Project - Agricultural Profit Engine
    </div>
    </body>
    </html>
    """
    
    # Save HTML for debug
    html_path = input_path.replace('.md', '.html')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
        
    # Convert to PDF
    with open(output_path, "wb") as pdf_file:
        pisa_status = pisa.CreatePDF(full_html, dest=pdf_file, encoding='utf-8')
        
    if pisa_status.err:
        print("Error converting to PDF")
    else:
        print(f"PDF saved to: {output_path}")

if __name__ == "__main__":
    convert_md_to_pdf(INPUT_MD, OUTPUT_PDF)
