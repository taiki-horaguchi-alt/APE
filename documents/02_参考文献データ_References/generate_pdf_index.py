
import requests
import re
from urllib.parse import urljoin, unquote
import os

TARGET_PAGE = "https://www.naro.go.jp/smart-nogyo/katsuyo-sanchi-shien/tebikisho.html"
SAVE_DIR = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\references\papers\05_Japanese_SmartAgri"
INDEX_FILE = os.path.join(SAVE_DIR, "00_INDEX_list.md")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def generate_index():
    print(f"Fetching page for indexing: {TARGET_PAGE}")
    try:
        response = requests.get(TARGET_PAGE, headers=HEADERS, timeout=30)
        # We need to parse valid HTML. Simple regex might miss the relationship between text and link.
        # Let's try to assume a simple structure: <a href="...">Title</a>
        # Or better, just grab all 'a' tags and see.
        
        # Using simple regex to capture href and immediate text might be flaky, but let's try.
        # Pattern: <a [^>]*href=["']([^"']+\.pdf)["'][^>]*>(.*?)</a>
        # This is very rough. 
        
        # Better approach: split by </a> and look backwards for href.
        content = response.text
        
        pdf_map = {}
        
        # Find all PDF links
        # We want to map "Relative URL" -> "Link Text"
        
        # Simple extraction of "href" and "text" is hard with regex alone on raw HTML.
        # But let's try finding the anchor tag blocks.
        
        matches = re.findall(r'<a\s+(?:[^>]*?\s+)?href=["\']([^"\']+\.pdf)["\'][^>]*>(.*?)</a>', content, re.IGNORECASE | re.DOTALL)
        
        lines = ["# スマート農業技術導入手引き書 PDF Index\n"]
        lines.append("| Filename | Manual Title (Japanese) |")
        lines.append("| :--- | :--- |")
        
        for href, text in matches:
            filename = unquote(href.split("/")[-1])
            if "?" in filename: filename = filename.split("?")[0]
            
            # Clean HTML tags from text
            clean_text = re.sub(r'<[^>]+>', '', text).strip()
            clean_text = clean_text.replace("\n", " ").replace("\r", "")
            
            if not clean_text:
                clean_text = "(No Title)"
                
            lines.append(f"| {filename} | {clean_text} |")
            
        with open(INDEX_FILE, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
            
        print(f"Index created at {INDEX_FILE} with {len(matches)} entries.")

    except Exception as e:
        print(f"Error creating index: {e}")

if __name__ == "__main__":
    generate_index()
