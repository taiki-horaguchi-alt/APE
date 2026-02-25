
import os
import requests
import time

# Target Directory
SAVE_DIR = r"h:\マイドライブ\antigravity\scratch\Business_Plans\03_APE\references\papers\jp"
os.makedirs(SAVE_DIR, exist_ok=True)

# Headers to mimic browser (critical for MAFF/NARO)
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Referer": "https://www.google.com/"
}


import re
from urllib.parse import urljoin

# List of high-value Japanese Papers/Reports
# Format: (URL, Filename, Is_Page)
TARGETS = [
    # 1. MAFF Farm Management Statistics (Already downloaded, but keeping for reference logic)
    # ("https://www.maff.go.jp/j/tokei/kouhyou/noukei/einou/pdf/einou_24.pdf", "MAFF_2024_Farm_Mgmt_Stats_Report.pdf", False),
    
    # 2. NARO Smart Agri Manuals (Direct Links found by Browser Agent)
    # General Horticulture
    ("https://www.naro.go.jp/smart-nogyo/katsuyo-sanchi-shien/files/A01.pdf", "NARO_SmartAgri_General_Manual.pdf", False),
    # Tomato Specific (Mini Tomato)
    ("https://www.naro.go.jp/smart-nogyo/katsuyo-sanchi-shien/files/E08.pdf", "NARO_SmartAgri_Tomato_Manual.pdf", False),
    # Large Scale Tomato (Saitama)
    ("https://www.naro.go.jp/publicity_report/publication/files/Large-scale_facility_gardening_manual_Saitama.pdf", "NARO_LargeScale_Tomato_Saitama.pdf", False)
]

def download_from_page(page_url, filename_hint):
    print(f"Scraping page for PDF: {page_url}")
    try:
        response = requests.get(page_url, headers=HEADERS, timeout=30)
        if response.status_code != 200:
            print(f"Failed to access page: {response.status_code}")
            return

        # Simple Regex to find .pdf links
        # Looking for href="..." that ends in .pdf
        pdf_links = re.findall(r'href=["\'](.*\.pdf)["\']', response.text, re.IGNORECASE)
        
        if not pdf_links:
            print("No PDF links found on page.")
            return

        # Prioritize links that might contain 'manual' or 'tomato' or 'smart'
        target_pdf_url = pdf_links[0] # Default to first
        for link in pdf_links:
            if "manual" in link or "tomato" in link or "seika" in link:
                target_pdf_url = link
                break
        
        # Construct absolute URL
        full_pdf_url = urljoin(page_url, target_pdf_url)
        print(f"Found PDF Link: {full_pdf_url}")
        
        # Reuse download_file logic
        download_file(full_pdf_url, filename_hint)

    except Exception as e:
        print(f"Error scraping page: {e}")

def download_file(url, filename):
    print(f"Attempting to download: {filename} from {url}")
    try:
        response = requests.get(url, headers=HEADERS, stream=True, timeout=60)
        if response.status_code == 200:
            filepath = os.path.join(SAVE_DIR, filename)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"SUCCESS: Saved to {filepath}")
        else:
            print(f"FAILED: Status Code {response.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")
    time.sleep(2)

if __name__ == "__main__":
    print("Starting Deep Research Download...")
    for url, name, is_page in TARGETS:
        if is_page:
            download_from_page(url, name)
        else:
            download_file(url, name)

