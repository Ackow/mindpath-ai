# Scikit-Learn 手写数字识别多分类逻辑回归实验脚本 (digits_lab.py)
import numpy as np
import pandas as pd
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

# 1. 加载经典 Scikit-Learn 手写数字数据集 (1,797 样本, 64 维像素特征, 10 分类 0~9)
digits = load_digits()
X, y = digits.data, digits.target

print(f"数据集维度: {X.shape} (1797 个样本, 64 维 8x8 图像像素)")
print(f"类别分布: {np.bincount(y)}")

# 2. 划分训练集与测试集 (80% 训练集, 20% 测试集)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. 特征缩放 (Z-Score 标准化)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. 构建并训练 Softmax 多分类逻辑回归模型 (multi_class='multinomial')
model = LogisticRegression(
    multi_class='multinomial',
    solver='lbfgs',
    max_iter=1000,
    random_state=42
)
model.fit(X_train_scaled, y_train)

# 5. 测试集预测与评估
y_pred = model.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)

print("== Scikit-Learn 手写数字识别 Softmax 回归实验 (Digits Lab) ==")
print(f"测试集准确率 Accuracy: {acc * 100:.2f}%")
print("
混淆矩阵 (Confusion Matrix 10x10):")
print(confusion_matrix(y_test, y_pred))
print("
分类指标报告 (Classification Report):")
print(classification_report(y_test, y_pred))
