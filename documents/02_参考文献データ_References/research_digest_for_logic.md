# APE Research Digest: Logic & Algorithms Resource
**Purpose:** A detailed extraction of formulas, coefficients, and methodologies from the bibliography to drive the APE Profit Simulator.

---

## **1. Yield Gap Analysis (The Physics of Growth)**
*Source: Van Ittersum et al. (2013), Lobell et al. (2009), GYGA*

### **Core Logic: The Cascade Model**
To simulate "Potential Revenue," we must calculate the theoretical ceiling first.
*   **Formula:** $Y_g = Y_p - Y_a$
    *   $Y_g$: Yield Gap (The "Kaizen Potential" for existing farmers)
    *   $Y_p$: Potential Yield (Biophysical limit)
    *   $Y_a$: Actual Yield (Current user performance)

### **Calculating $Y_p$ (Potential Yield)**
For APE's "Discovery Mode", we simulate $Y_p$ using the **FAO-GAEZ / Wagner-Nelson Method**:
$$Y_p = \sum (R \times \epsilon \times HI)$$
*   $R$: Solar Radiation (MJ/m²) from Open-Meteo API.
*   $\epsilon$: Radiation Use Efficiency (g/MJ). *Standard for C3 crops (Tomato, Wheat): 2.5 - 3.0 g/MJ.*
*   $HI$: Harvest Index (ratio of harvestable part). *Standard for Tomato: 0.6 - 0.7.*

### **Calculating $Y_w$ (Water-Limited Yield)**
For rainfed simulations (no irrigation):
$$Y_w = Y_p \times f(W)$$
*   Where $f(W)$ is the "Water Satisfaction Index" derived from the **French-Schultz Relation**:
    *   Yield = $TE \times (T - E_s)$
    *   $TE$: Transpiration Efficiency (kg/ha/mm). *Benchmark: 20-25 kg/ha/mm for grains.*
    *   T: Transpiration (Crop water use).
    *   $E_s$: Soil Evaporation (Loss).

**APE Application:** Use these physics-based constants to set the "100% Score" bar. Anything less is the "Gap".

---

## **2. Economic Risk & Decision Logic (The Financial Engine)**
*Source: Hardaker et al. (2004), Richardson et al. (2008) - SERF*

### **Ranking Crops with "SERF" (Stochastic Efficiency)**
Instead of ranking by "Average Profit" ($E(x)$), APE ranks by **Certainty Equivalent (CE)**.
*   **Utility Function:** $U(w) = -exp(-r_a \times w)$  (Negative Exponential Utility)
*   **Formula:** $CE(w, r_a) = ln(E[exp(-r_a \times w)]) / -r_a$
    *   $w$: Wealth (Profit outcome from Monte Carlo sim).
    *   $r_a$: Absolute Risk Aversion Coefficient.
    *   **User Profiles ($r_a$ values):**
        *   **New Farmer (High Fear):** $r_a = 0.03 \sim 0.04$ (Heavily penalizes volatility).
        *   **Veteran (Risk Taker):** $r_a = 0.0 \sim 0.01$ (Approaches raw average maximization).

**APE Application:** When a New Farmer uses APE, logic applies $r_a=0.03$. A high-volatility crop (e.g., Green Peppers) will have its CE score slashed, dropping it down the ranking even if average profit is high.

### **Enterprise Budget Benchmarks (The Constants)**
*Source: USDA ARMS, Japan MAFF 2024*
Standard constants for "Optimization Mode" diagnostics.
*   **Labor Ratio (Vegetables):** Should be **35-45%** of Total Revenue. >50% = "Overworked/Inefficient".
*   **Fertilizer/Chem Cost:** Should be **10-15%**. >20% = "Over-application" (Soil degradation risk).
*   **Depreciation:** Should be **10-12%**. >20% = "Over-investment" (Too much machinery).

---

## **3. Behavioral Parameters (The Nudge Engine)**
*Source: Duflo et al. (2011), Thaler & Sunstein (2008)*

### **The "Survival Constraint" (SAFI)**
Farmers will not adopt a "High Profit" plan if it endangers short-term survival.
*   **Logic:** $P(Survival) > Threshold$ must hold true for *every single month*.
*   **Duflo's Finding:** "Present Bias" causes under-investment in seeds/fertilizer.
*   **APE Mitigation:**
    *   If `Cash_Flow_Month_3 < Living_Expenses`: Force "Part-time Job" recommendation.
    *   **"Early Bird" Logic:** If user commits to crop plan 3 months early -> Apply psychological discount (Visualization of "Secured Revenue").

### **Nudge Coefficients**
*   **Social Comparison Effect:** "70% of neighbors do X" increases adoption by **~15-20%** (Kuhfuss 2016).
*   **Default Option Effect:** Setting a recommended variety as default increases selection by **~30-40%** (Thaler).

---

## **4. AI Model Architecture (The Intelligence)**
*Source: Khaki (2019), Cao (2021)*

### **Hybrid Model Strategy**
*   **Component A (Static): XGBoost**
    *   *Input:* Soil Type, Average Rain, Region.
    *   *Output:* "Base Suitability" (0-100).
    *   *Why:* Handles categorical data (Soil IDs) better than Neural Nets.
*   **Component B (Dynamic): LSTM (Long Short-Term Memory)**
    *   *Input:* Rolling 30-day weather vector ($t_{-30}$ to $t_{0}$).
    *   *Output:* "Yield Deviation" (+/- %).
    *   *Why:* Captures sequential patterns (e.g., "warm winter -> early pest outbreak").

### **Explainability (SHAP Values)**
To enable "Kaizen/Optimization Mode," we must calculate SHAP (SHapley Additive exPlanations) values for the XGBoost model.
*   **Output:** "Why is my predicted profit low?"
    *   *Feature 1:* Planting Date (SHAP: -0.4) -> "Too late"
    *   *Feature 2:* Soil pH (SHAP: -0.2) -> "Too acidic"

---
