
import os
import requests
import re
import time
from urllib.parse import urljoin, unquote

# Target Page
TARGET_PAGE = "https://www.naro.go.jp/smart-nogyo/katsuyo-sanchi-shien/tebikisho.html"

# Save Directory
SAVE_DIR = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\references\papers\05_Japanese_SmartAgri"
os.makedirs(SAVE_DIR, exist_ok=True)

# Headers
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
}

def clean_filename(url):
    # Extract filename from URL
    filename = url.split("/")[-1]
    # Decode URL encoding (e.g. %E3%83...)
    filename = unquote(filename)
    # Remove query parameters
    if "?" in filename:
        filename = filename.split("?")[0]
    # Ensure it ends in .pdf
    if not filename.lower().endswith(".pdf"):
        filename += ".pdf"
    
    # Replace invalid characters
    return re.sub(r'[\\/*?:"<>|]', "", filename)

def bulk_download():
    print(f"Fetching page: {TARGET_PAGE}")
    try:
        response = requests.get(TARGET_PAGE, headers=HEADERS, timeout=30)
        response.raise_for_status() # Check for errors
        
        # Regex to find all hrefs passing to .pdf
        # Captures: href="...pdf"
        # We look for relative or absolute paths
        pdf_links = re.findall(r'href=["\']([^"\']+\.pdf)["\']', response.text, re.IGNORECASE)
        
        # Deduplicate
        pdf_links = sorted(list(set(pdf_links)))
        
        print(f"Found {len(pdf_links)} PDF links.")
        
        for i, link in enumerate(pdf_links, 1):
            full_url = urljoin(TARGET_PAGE, link)
            filename = clean_filename(full_url)
            save_path = os.path.join(SAVE_DIR, filename)
            
            # Skip if already exists (and has size > 0)
            if os.path.exists(save_path) and os.path.getsize(save_path) > 0:
                print(f"[{i}/{len(pdf_links)}] Skipping existing: {filename}")
                continue
            
            print(f"[{i}/{len(pdf_links)}] Downloading: {filename} from {full_url}")
            
            try:
                pdf_resp = requests.get(full_url, headers=HEADERS, stream=True, timeout=60)
                if pdf_resp.status_code == 200:
                    with open(save_path, 'wb') as f:
                        for chunk in pdf_resp.iter_content(chunk_size=8192):
                            f.write(chunk)
                    print("   -> Success")
                else:
                    print(f"   -> Failed (Status: {pdf_resp.status_code})")
            except Exception as e:
                print(f"   -> Error: {e}")
            
            time.sleep(1.5) # Polite delay
            
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    bulk_download()
