
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import japanize_matplotlib

# Style settings
plt.style.use('ggplot')
plt.rcParams['font.family'] = 'IPAexGothic'

def create_climate_chart():
    # Ayabe Climate Data (2024 Historical & Normal)
    months = np.arange(1, 13)
    # Normal values (Approx from JMA)
    temp_avg = [2.5, 3.0, 6.5, 12.0, 17.0, 21.0, 25.0, 26.5, 22.5, 16.5, 10.5, 5.0]
    precip = [103, 97, 114, 109, 137, 159, 189, 146, 210, 152, 90, 92]
    
    fig, ax1 = plt.subplots(figsize=(10, 6))

    # Precipitation
    ax1.bar(months, precip, color='skyblue', label='降水量(mm)', alpha=0.7)
    ax1.set_ylabel('降水量 (mm)')
    ax1.set_ylim(0, 300)

    # Temperature
    ax2 = ax1.twinx()
    ax2.plot(months, temp_avg, color='orange', marker='o', linewidth=3, label='平均気温(℃)')
    ax2.set_ylabel('気温 (℃)')
    ax2.set_ylim(-5, 35)

    # Critical Lines
    ax2.axhline(y=10, color='blue', linestyle='--', alpha=0.5, label='なす生育限界(10℃)')
    ax2.axhline(y=15, color='red', linestyle='--', alpha=0.5, label='定植適温(15℃)')

    plt.title('京都府綾部市の気候特性と栽培リスク')
    fig.legend(loc="upper left", bbox_to_anchor=(0.15, 0.85))
    plt.savefig('chart_climate.png')
    plt.close()

def create_price_chart():
    months = np.arange(1, 13)
    # Estimated trends based on report
    # Tokyo (Commodity)
    price_tokyo = [480, 500, 480, 420, 380, 320, 220, 240, 340, 400, 500, 550]
    # Osaka (Brand)
    price_osaka = [460, 480, 450, 400, 360, 300, 200, 220, 320, 380, 450, 500]
    # Kyonasu Premium (Osaka + Premium)
    price_kyonasu = [x + 80 if x > 0 else 0 for x in price_osaka]

    plt.figure(figsize=(10, 6))
    plt.plot(months, price_tokyo, label='東京市場(大田)', linestyle='--', color='gray')
    plt.plot(months, price_osaka, label='大阪市場(一般なす)', color='blue')
    plt.plot(months, price_kyonasu, label='大阪市場(京なす想定)', color='purple', linewidth=3)

    plt.axvspan(6.5, 8.5, color='yellow', alpha=0.2, label='値崩れ危険ゾーン')
    plt.axvspan(8.5, 10.5, color='orange', alpha=0.2, label='狙い目ゾーン(秋)')

    plt.xlabel('月')
    plt.ylabel('卸売単価 (円/kg)')
    plt.title('市場別なす卸売価格トレンド (5年平均モデル)')
    plt.legend()
    plt.xticks(months)
    plt.grid(True)
    plt.savefig('chart_price.png')
    plt.close()

def create_profit_chart():
    # Year 2 Monthly Cash Flow Simulation
    months = np.arange(1, 13)
    # Revenue: Starts late June, Peaks July-Aug, Dips Sept, Ends Oct/Nov
    revenue = [0, 0, 0, 0, 0, 30, 150, 200, 150, 100, 80, 29] # x10k yen (total ~739k) roughly scaled
    # Scaled to match 7.4M total
    revenue = np.array(revenue) * 10 
    
    # Cost: High in Spring (Prep), Constant in Summer (Labor/Mat)
    # Total 3.96M
    cost = [10, 20, 50, 80, 50, 30, 30, 30, 30, 30, 20, 16] # x10k
    cost = np.array(cost) 

    cumulative_profit = np.cumsum(revenue - cost)

    fig, ax1 = plt.subplots(figsize=(10, 6))
    
    ax1.bar(months, revenue, color='green', alpha=0.6, label='月間売上(万円)')
    ax1.bar(months, -cost, color='red', alpha=0.6, label='月間経費(万円)')
    ax1.set_ylabel('月次収支 (万円)')

    ax2 = ax1.twinx()
    ax2.plot(months, cumulative_profit, color='blue', marker='o', linewidth=2, label='累積利益(万円)')
    ax2.set_ylabel('累積利益 (万円)')
    
    plt.title('2年目(6.6反) キャッシュフロー予測')
    
    # Lines
    ax2.axhline(0, color='black', linewidth=1)
    
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper left')
    
    plt.grid(True)
    plt.savefig('chart_profit.png')
    plt.close()

if __name__ == "__main__":
    create_climate_chart()
    create_price_chart()
    create_profit_chart()
    print("Charts generated.")
