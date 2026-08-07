# Kaggle 共享单车租赁量预测回归拟合实验脚本 (Bike Sharing Regression Lab)
# 使用方法: 将本脚本与 bike_sharing_sample.csv 放在同一目录下，在终端中运行: python bike_sharing_lab.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, r2_score

def main():
    print("=== Kaggle / UCI 官方共享单车 Demand 预测回归拟合 ===")
    
    # 1. 读取本地 CSV 数据集文件
    csv_file = 'bike_sharing_sample.csv'
    try:
        df = pd.read_csv(csv_file)
        print(f"成功读取本地数据集: {csv_file}，包含 {len(df)} 条记录。")
    except FileNotFoundError:
        print(f"未找到 {csv_file}，使用内置测试集演示...")
        data = {
            'season': [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'workingday': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1],
            'weathersit': [2, 2, 1, 1, 1, 1, 2, 2, 1, 1],
            'temp': [0.344, 0.363, 0.196, 0.200, 0.227, 0.204, 0.197, 0.165, 0.138, 0.151],
            'hum': [0.806, 0.696, 0.437, 0.590, 0.437, 0.518, 0.499, 0.536, 0.434, 0.483],
            'windspeed': [0.160, 0.249, 0.248, 0.160, 0.187, 0.090, 0.169, 0.267, 0.362, 0.223],
            'cnt': [985, 801, 1349, 1562, 1600, 1606, 1510, 959, 822, 1321]
        }
        df = pd.DataFrame(data)

    # 2. 提取特征矩阵 X 与 预测目标 y (共享单车日总租赁量 cnt)
    feature_cols = ['season', 'workingday', 'weathersit', 'temp', 'hum', 'windspeed']
    X = df[feature_cols]
    y = df['cnt']

    # 3. 划分训练集与测试集 (80% 训练集, 20% 测试集)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. 特征工程: Z-Score 标准化缩放
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 5. 模型拟合: 普通最小二乘线性回归
    lr = LinearRegression()
    lr.fit(X_train_scaled, y_train)
    y_pred = lr.predict(X_test_scaled)

    # 6. 输出特征回归权重与拟合指标
    print("\n学习得到的标准化特征回归系数 (Coefficients):")
    for feat, coef in zip(feature_cols, lr.coef_):
        print(f"  特征 {feat:12s} 权重 w = {coef:8.2f}")

    print(f"\n模型拟合评估:")
    print(f"  测试集均方误差 MSE : {mean_squared_error(y_test, y_pred):.2f}")
    print(f"  测试集拟合优度 R²  : {r2_score(y_test, y_pred):.4f}")

    # 7. 正则化对比: Ridge (L2) 回归
    ridge = Ridge(alpha=1.0).fit(X_train_scaled, y_train)
    y_pred_ridge = ridge.predict(X_test_scaled)
    print(f"  Ridge (L2) 测试集 R²: {r2_score(y_test, y_pred_ridge):.4f}")

if __name__ == '__main__':
    main()
