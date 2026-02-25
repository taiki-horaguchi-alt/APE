# APE Knowledge Architecture: Comprehensive Research Prompt

このプロンプトは、農業利益最大化システム「APE (Agri-Profit Engine)」を開発するために必要な、世界中の専門知識・論文・データを網羅的かつ構造的に収集するための「マスタープロンプト」です。

---

## **Role Definition**
You are the **Chief Research Architect** for a cutting-edge AgTech startup. Your goal is to build the world's most robust knowledge base for "APE," an application that simulates agricultural profits with extreme precision and recommends optimal crops to new farmers.

## **Objective**
Systematically gather, categorize, and summarize 100+ high-value information sources (Academic Papers, Government Reports, Technical Datasets, Algorithms) necessary to build APE, covering both **"New Farmer Discovery"** and **"Existing Farmer Optimization"**.
The output must be structured, covering the 5 Core Domains defined below.

---

## **Core Knowledge Domains (The 5 Pillars of APE)**

### **Domain 1: Agronomic Science (The Biology Engine)**
*Focus: Biological feasibility and "Yield Gap" analysis.*
*   **Soil Science:** Pedology, NPK balance logic, soil-crop matching databases.
*   **Yield Gap Analysis:** Methodologies to calculate the gap between actual vs. potential yield based on local conditions.
*   **Plant Pathology:** Disease resistance data by variety, impact of climate on disease vectors.
*   **Meteorology:** Micro-climate prediction models, GDD calculation.
*   **Keywords:** *Yield Gap Atlas, Crop Suitability Modeling, G x E Interaction, IPM.*

### **Domain 2: Agricultural Economics (The Profit Engine)**
*Focus: Realistic financials and Benchmarking.*
*   **Benchmarking:** Data on "Best Practice" cost structures to diagnose existing farmers' inefficiencies.
*   **Farm Management:** Enterprise budget data, labor cost analysis, depreciation models.
*   **Risk Analysis:** Monte Carlo simulations for yield/price volatility.
*   **Keywords:** *Farm Benchmarking Data, Production Efficiency Analysis, Technical Efficiency (DEA/SFA).*

### **Domain 3: AI & Algorithms (The Intelligence)**
*Focus: Matching, Prediction, and "Kaizen" (Continuous Improvement).*
*   **Kaizen Logic:** Algorithms to identify *why* a farmer is underperforming (Feature Importance analysis).
*   **Recommender Systems:** Content-based vs Collaborative filtering.
*   **Yield Prediction:** RF, XGBoost, LSTM.
*   **Optimization:** Prescriptive analytics for variety switching or timing shifts (Linear Programming).
*   **Keywords:** *Prescriptive Analytics in Agriculture, Gap Analysis Algorithms, Precision Agriculture AI.*

### **Domain 4: Behavioral Science & UX (The Adoption)**
*Focus: Persuading farmers to trust the data.*
*   **Decision Psychology:** How farmers perceive risk, trust in automation, technology adoption barriers (TAM).
*   **Visualization:** Effective ways to present probability and risk to non-experts.
*   **Keywords:** *Farmer Decision Making, Behavioral Economics in Agriculture, Trust in AI, User-Centered Design for Rural Contexts.*

### **Domain 5: System Architecture & Data (The Infrastructure)**
*Focus: Building the scalable platform.*
*   **Data Sources:** Open databases (USDA, FAO, Norin-suisan-sho), Satellite API (Sentinel, Landsat), Weather API.
*   **Tech Stack:** Scalable geospatial databases (PostGIS), Python libraries for agri-science (MetPy, GeoPandas).

---

## **Execution Steps (Instructions to AI)**

**Step 1: Literature Mining**
For each domain, identify at least 10 seminal papers or authoritative reports.
*   **Format:** `[Title] (Year, Author) - [Key Insight for APE]`
*   *Example:* "Random Forests for Global and Regional Crop Yield Predictions (2018) - Demonstrates that RF outperforms Neural Networks for soil-based yield prediction, crucial for APE's rookie mode."

**Step 2: Database & API Hunting**
List specific datasets/APIs available globally and in Japan that can feed the APE engine.
*   **Format:** `[Name] - [Data Points] - [URL/Source]`

**Step 3: Methodology Extraction**
Extract specific formulas or logic structures from the literature (e.g., "How to calculate the 'Difficulty Score' of a tomato variety based on localized humidity data").

**Step 4: Synthesis**
Highlight the "Missing Links" – what data is hard to find, and how can APE synthetically generate or infer it?

---

## **Output Format (Markdown)**

Please output the result in a hierarchical Markdown format, grouped by the 5 Domains. Use tables for the bibliography.

**(Example Table)**
| Domain | Title / Source | Type | Key Insight for APE Logic |
| :--- | :--- | :--- | :--- |
| AI | *Machine Learning based Decision Support...* | Paper | XGBoost is 15% more accurate for small datasets than Deep Learning. |
| Econ | *USDA Fruit & Vegetable Cost of Production* | Data | Provides baseline labor hours per acre for 50+ crops. |

---

**Constraint:**
Focus on **"Actionable Intelligence"**. Do not just list titles; explain *how* APE should use this info (e.g., "Use this formula for the cost simulation module").
