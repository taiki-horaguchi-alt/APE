
import requests
import json
import pandas as pd
from datetime import datetime

# Coordinates from Google Maps (Ayabe)
LAT = 35.349958
LON = 135.209250

def fetch_climate_data():
    # Open-Meteo Archive API to get historical data for the last year (2025) to see recent trends
    # Or climate normals? Open-Meteo provides 'historical_weather_api' for specific periods.
    # Let's get data for 2024 (full year) to analyze seasonal patterns accurately.
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": LAT,
        "longitude": LON,
        "start_date": "2024-01-01",
        "end_date": "2024-12-31",
        "daily": "temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum,shortwave_radiation_sum,soil_temperature_0_to_7cm_mean,wind_speed_10m_max",
        "timezone": "Asia/Tokyo"
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if "daily" not in data:
        print("Error fetching data:", data)
        return

    daily = data["daily"]
    df = pd.DataFrame(daily)
    
    # Calculate monthly stats
    df['time'] = pd.to_datetime(df['time'])
    df['month'] = df['time'].dt.month
    
    monthly_stats = df.groupby('month').agg({
        'temperature_2m_mean': 'mean',
        'temperature_2m_max': 'mean',
        'temperature_2m_min': 'mean',
        'soil_temperature_0_to_7cm_mean': 'mean',
        'precipitation_sum': 'sum',
        'shortwave_radiation_sum': 'sum', # MJ/m2
        'wind_speed_10m_max': 'max'
    }).round(1)
    
    # Analyze specifically for Eggplant
    # 1. Soil Temp > 15C for planting
    # 2. Daily precip extremes
    
    print("## Coordinates Analysis")
    print(f"Lat: {LAT}, Lon: {LON}")
    print(f"Elevation: {data.get('elevation', 'N/A')} m")
    print("\n## 2024 Monthly Climate Data (Hyper-Local)")
    print(monthly_stats.to_markdown())
    
    # Additional Analysis: Frost / Cold Risks
    # Check April/May daily mins
    spring_check = df[(df['month'].isin([4, 5]))]
    cold_days = spring_check[spring_check['temperature_2m_min'] < 10]
    print("\n## Spring Cold Risk (Days with Min Temp < 10C in Apr-May)")
    if not cold_days.empty:
        print(cold_days[['time', 'temperature_2m_min']].to_markdown(index=False))
    else:
        print("None found.")

    # Heavy Rain Risk
    heavy_rain = df[df['precipitation_sum'] > 50] # >50mm/day
    print("\n## Heavy Rain Risk (Days with > 50mm Rain)")
    if not heavy_rain.empty:
        print(heavy_rain[['time', 'precipitation_sum']].to_markdown(index=False))
    else:
        print("None found.")

if __name__ == "__main__":
    fetch_climate_data()
