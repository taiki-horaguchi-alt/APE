# Crop yield prediction using deep neural networks
**Authors:** S. Khaki, L. Wang
**Journal:** Frontiers in Plant Science (2019)
**Source URL:** https://www.frontiersin.org/journals/plant-science/articles/10.3389/fpls.2019.00621/full

## 1. Introduction
Crop yield is a highly complex trait determined by multiple factors such as genotype, environment, and their interactions... (See abstract)

## 2. Data
In the 2018 Syngenta Crop Challenge, participants were asked to use real-world data to predict the performance of corn hybrids in 2017... The dataset included 2,267 experimental hybrids planted in 2,247 locations...
The training data included three sets: genotype, yield performance, and environment (weather and soil). The genotype dataset contained genetic information for all experimental hybrids, each having 19,465 genetic markers. The environment dataset contained 8 soil variables (clay, silt, sand, AWC, pH, OM, CEC, KSAT) and 72 weather variables.

## 3. Methodology
### 3.1 Data Preprocessing
The genotype data were coded in {-1, 0, 1} values. Approximately 37% of the genotype data had missing values. We used a 97% call rate to discard markers... reducing markers to 627.

### 3.3 Yield Prediction Using Deep Neural Networks
We trained two deep neural networks, one for yield and the other for check yield...
**Hyperparameters:** Each network has 21 hidden layers and 50 neurons in each layer. Initialization: Xavier. Optimizer: Adam (lr=0.03%). Batch normalization used.
**Structure:** The input layer takes in genotype data (G), weather data (W), and soil data (S). Odd numbered layers have a residual shortcut connection.

## 4. Results
The two deep neural networks were implemented in Python using Tensorflow. Training took ~1.4h on a Tesla K20m GPU.
Results suggest that the Deep Neural Networks (DNN) outperformed Lasso, Shallow Neural Networks (SNN), and Regression Trees (RT). The DNN was particularly effective prediction yield and check yield (RMSE ~11% of average).

