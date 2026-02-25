# APE Comprehensive Knowledge Base
**Version:** 1.0
**Last Updated:** 2026-01-19
**Purpose:** Master reference for implementing APE's 5 Core Engines.

---

## **Domain 1: Agronomic Science (The Biology Engine)**
*Focus: Biological feasibility, Yield Gap Analysis, and Risk Calculation.*

| Category | Title / Source | Type | Actionable Intelligence for APE Logic |
| :--- | :--- | :--- | :--- |
| **Yield Gap** | **Global Yield Gap Atlas (GYGA)** | Database/Methodology | Use "Potential Yield (Yp)" and "Water-limited Yield (Yw)" methodologies to set the *theoretical maximum* for a user's location. The difference between Yp and the user's current yield is the **"Kaizen Potential" (Upside)** shown in Optimization Mode. |
| **Soil** | **Harmonized World Soil Database (HWSD) v1.2** | Database | Use 30 arc-second raster data for base soil properties (pH, Texture, OC). APE's "Soil Score" will ingest this data to filter distinct crops (e.g., avoiding acid-intolerant crops on low pH soil). |
| **Suitability** | **FAO Agro-Ecological Zones (GAEZ v4)** | Framework | Adapt the GAEZ logic for APE's "Discovery Mode". It evaluates land suitability based on climatic and edaphic (soil) requirements. APE can simplify this to a "Suitability Score (0-100)". |
| **Growth Model** | **Growing Degree Days (GDD)** | Formula | Implement standard GDD formulas to predict harvest windows. Essential for the "Labor Peak" and "Market Timing" simulator. |

## **Domain 2: Agricultural Economics (The Profit Engine)**
*Focus: Realistic Financials, Cost Benchmarking, and Risk Analysis.*

| Category | Title / Source | Type | Actionable Intelligence for APE Logic |
| :--- | :--- | :--- | :--- |
| **Benchmarking** | **USDA Commodity Costs and Returns / ARMS** | Database | Provide baseline "Cost of Production" (Labor, Fertilizer, Seed) for major crops. Use as the default values for the Profit Simulator when user data is missing. |
| **Benchmarking** | **Japan MAFF Statistical Yearbook (農林水産省 統計)** | Database | Use Japan-specific "Management Balance (農業経営統計)" for localized benchmarking. Compare user's expense ratio against the "Top 20% Farmers" to diagnose inefficiencies (e.g., "Your fertilizer cost is 30% higher than the regional best"). |
| **Risk** | **Stochastic Efficiency with Respect to a Function (SERF)** | Algorithm/Method | Use SERF to rank crop options not just by *average profit*, but by *risk-adjusted profit*. APE will penalize high-volatility crops for "Risk-Averse" (New Farmer) profiles. |
| **Enterprise** | **University of Nebraska/Ohio State Budget Calculators** | Tool Reference | Reference their UI/UX for inputting cost data. APE should adopt their granular breakdown (Variable vs Fixed Costs) to ensure the "Cash Flow" simulation is accurate. |

## **Domain 3: AI & Algorithms (The Intelligence)**
*Focus: Prediction, Matching, and Optimization Logic.*

| Category | Title / Source | Type | Actionable Intelligence for APE Logic |
| :--- | :--- | :--- | :--- |
| **Yield Pred** | **XGBoost vs LSTM for Crop Yield Prediction** | Methodology | **Use XGBoost** for structured "static" data (soil, average climate) in the *Suitability Score*. **Use LSTM** for time-series weather analysis in short-term *Harvest Timing* predictions. Hybrid models are best but start with XGBoost for robustness on smaller datasets. |
| **Recommender** | **Random Forest for Crop Selection** | Algorithm | Use Random Forest to classify "Optimal Crops" based on input features (Soil, Location, Budget). Studies show 95%+ accuracy for suitability classification. |
| **Optimization** | **Prescriptive Analytics (Linear Programming)** | Algorithm | Use LP for the **"Rotation Strategy"** module. Objective Function: Maximize Profit. Constraints: Labor limits (hours/month), Soil health (no repeated families), Cash flow (min monthly balance). |
| **Kaizen** | **Feature Importance Analysis (SHAP values)** | Logic | Use SHAP values on the XGBoost model to explain *why* a yield is low. Output to user: "Your yield is low primarily due to 'Planting Date' (Impact: -15%) and 'Nitrogen' (Impact: -10%)." |

## **Domain 4: Behavioral Science & UX (The Adoption)**
*Focus: Converting data into trust and action.*

| Category | Title / Source | Type | Actionable Intelligence for APE Logic |
| :--- | :--- | :--- | :--- |
| **Adoption** | **Technology Adoption Model (TAM) Meta-Analyses** | Theory | **"Perceived Usefulness"** and **"Perceived Ease of Use"** are critical. APE's UI must assume *zero* IT literacy. Inputs must be "sliders and buttons," not "spreadsheets." |
| **Decision** | **Nudge Theory in Agriculture** | Strategy | **Default Options:** Pre-fill all simulation values with regional averages (Nudge: Status Quo Bias). **Social Comparison:** Show "Your neighbors are earning X% more with this variety" (Nudge: Herding/Social Norms). |
| **Risk Psych** | **Loss Aversion Bias** | Insight | Frame recommendations not just as "Potential Gain" but as **"Avoiding Loss."** (e.g., "Switching varieties prevents a potential 20% loss from disease"). |

## **Domain 5: System Architecture & Data (The Infrastructure)**
*Focus: Open Data and API integration.*

| Category | Title / Source | Type | Actionable Intelligence for APE Logic |
| :--- | :--- | :--- | :--- |
| **Satellite** | **Sentinel-2 / Landsat** | API | Use for Normalized Difference Vegetation Index (NDVI) history of the plot. Helps estimate "Soil Health" and valid arable land area automatically. |
| **Weather** | **Open-Meteo / JMA API** | API | Free historical and forecast weather data. Essential for GDD calculation and frost risk assessment. |
| **Tech Stack** | **PostGIS + Python (GeoPandas/XGBoost)** | Stack | Standard, scalable open-source stack. PostGIS for all location-based queries (soil, weather grids). |

---

## **Gap Analysis (Missing Links)**

1.  **High-Resolution Variety Data:**
    *   *Problem:* General "Tomato" data exists, but specific "Momotaro vs CF Chika" disease resistance data is proprietary or scattered.
    *   *Solution:* APE must build a **proprietary "Variety Dictionary"**, crowdsourced from seed company catalogs (Sakata, Takii) and user feedback loops.

2.  **Real-Time Local Market Prices:**
    *   *Problem:* JA market data is often aggregated or delayed.
    *   *Solution:* Scrape public wholesale market pages (Toyosu, Ota) daily. For local direct sales, implement a "User Reported Price" feature (Waze for Veggies).

3.  **New Farmer "Failure Mode" Data:**
    *   *Problem:* Most studies focus on survivors. Failure data is survivorship bias.
    *   *Solution:* Specifically target specific "Bankruptcy Case Studies" (as done in bibliography research) to reverse-engineer failure points (e.g., "ran out of cash in Month 8").
