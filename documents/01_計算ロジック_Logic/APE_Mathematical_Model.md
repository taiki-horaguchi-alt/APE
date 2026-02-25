# APE Mathematical Model & Logic Specification
**Version:** 1.0 (Research-Backed)
**Source of Truth:**
*   Agro-Physics: Van Ittersum (2013), FAO GAEZ
*   Economics: MAFF Statistics 2024, NARO Manuals
*   Behavior: Duflo (2011), SERF Model

This document defines the **exact mathematical logic** used in the APE Profit Simulator. It moves beyond "AI estimation" to "Data-Driven Engineering".

---

## 1. Core Profit Equation (The Master Formula)
The fundamental equation for any crop $c$ at location $l$:

$$ \text{Profit}_c = (\text{Yield}_c \times \text{Price}_c) - (\text{VariableCost}_c + \text{FixedCost}_c) $$

However, APE refines this into a **Probabilistic Simulation**:

$$ E[\text{Profit}_c] = \int (Y_p \times Gap \times P_{mkt}) - (C_{std} \times \text{Efficiency}) $$

---

## 2. Yield Physics (The Revenue Engine)
Instead of guessing, we calculate the "Biological Potential" and apply penalties (Yield Gap).

### 2.1 Potential Yield ($Y_p$)
For "Optimization Mode" (Existing Farmers), $Y_p$ is calculated using the FAO-GAEZ method:
$$ Y_p = \sum_{d=plant}^{harvest} (R_d \times \epsilon \times HI) $$
*   $R_d$: Daily Solar Radiation (from Open-Meteo API).
*   $\epsilon$: Radiation Use Efficiency (Tomato: 2.5 g/MJ).
*   $HI$: Harvest Index (Tomato: 0.7).

### 2.2 Actual Yield Prediction ($Y_a$)
$$ Y_a = Y_p \times (1 - \text{Gap}_{soil} - \text{Gap}_{pest} - \text{Gap}_{skill}) $$
*   **$\text{Gap}_{skill}$ (Skill Penalty):**
    *   Novice: 0.4 (Based on NARO New Farmer stats).
    *   Veteran: 0.1.
*   **$\text{Gap}_{soil}$ (Soil Penalty):** Derived from XGBoost model using soil data (Clay %, pH).

---

## 3. Cost Engineering (The Expense Engine)
We use **NARO/MAFF Standard Constants** as the baseline, then apply user-specific modifiers.

### 3.1 Labor Cost ($C_{labor}$)
$$ C_{labor} = \text{Area} \times \text{StdHours}_{crop} \times \text{Wage}_{regional} $$
*   **$\text{StdHours}_{crop}$ (Standard Hours):**
    *   *Source:* **NARO Smart Agri Manual (Tomato)**.
    *   *Value:* e.g., 2,200 hours/10a (Conventional) vs 1,800 hours/10a (Smart Agri).
    *   *User Input:* "I use Smart Agri tech?" -> Switches the constant.

### 3.2 Material Cost ($C_{mat}$)
$$ C_{mat} = \text{Area} \times (\text{Fertilizer}_{std} + \text{Seeds}_{std} + \text{Pest}_{std}) $$
*   **Source:** **MAFF 2024 Farm Management Stats**.
*   *Value (Tomato):* Fertilizer = 250,000 JPY/10a.

---

## 4. Risk-Adjusted Ranking (The Decision Engine)
How do we recommend "Safe" crops vs "High Risk/High Return"?
We use the **SERF (Stochastic Efficiency)** model.

$$ \text{Score}_c = \text{CE}_c = \ln(E[\exp(-r_a \times \text{Profit}_c)]) / -r_a $$

*   **$r_a$ (Risk Aversion Coefficient):**
    *   **New Farmer:** $r_a = 0.03$. (Heavily penalizes volatility).
    *   **Investor/Side-Job:** $r_a = 0.01$. (Focuses on average data).
*   **Output:** The ranking user sees is NOT sorted by "Max Profit", but by "Certainty Equivalent".
    *   *Result:* A stable crop like "Komatsuna" might outrank a volatile "Melon" for a beginner, even if Melon has higher max profit.

---

## 5. Kaizen Logic (Optimization Mode)
For existing farmers, we calculate the "Value of Action".

$$ \Delta \text{Profit} = \text{Impact}_{action} \times \text{ProfitMargin} $$

*   **Logic:**
    1.  User inputs current yield ($Y_{user}$).
    2.  System calculates Gap: $Y_g = Y_p - Y_{user}$.
    3.  SHAP Analysis identifies top factor (e.g., "Planting Date").
    4.  **Proposal:** "Shift planting date by 2 weeks."
    5.  **Impact:** Calculated using the NARO Tomato Manual curve (Yield vs Planting Date).
    6.  **$$$:** "This change is worth +¥1.2M/year."

---

## 6. Constants Database (from Downloaded PDFs)
*   **Tomato (Winter/Spring):**
    *   Variable Cost: ¥4.5M / 10a
    *   Labor: 2,300h / 10a
    *   Target Yield: 15t / 10a
*   **Cucumber:**
    *   Variable Cost: ¥3.8M / 10a
    *   Labor: 1,800h / 10a
*   *Constants extracted from `05_Japanese_SmartAgri/MAFF_2024_Farm_Mgmt_Stats_Report.pdf`*
