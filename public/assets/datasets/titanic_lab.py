# Kaggle 泰坦尼克号生存预测二分类逻辑回归实验脚本 (titanic_lab.py)
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

# 1. 读取 Kaggle Titanic 样例数据集 CSV
df = pd.read_csv('titanic_sample.csv')

# 2. 简易特征工程与缺失值处理
# 将性别 Sex 映射为数值 (female=1, male=0)
df['Sex_Code'] = df['Sex'].map({'female': 1, 'male': 0})
# 用中位数填补年龄 Age 缺失值
df['Age_Clean'] = df['Age'].fillna(df['Age'].median())

# 3. 提取特征矩阵 X 与 目标向量 y (1: 生存, 0: 未生存)
feature_cols = ['Pclass', 'Sex_Code', 'Age_Clean', 'SibSp', 'Parch', 'Fare']
X = df[feature_cols]
y = df['Survived']

# 4. 划分训练集与测试集 (80% 训练, 20% 测试)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 5. Z-Score 特征标准化缩放
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 6. 拟合逻辑回归二分类模型
model = LogisticRegression(C=1.0, solver='lbfgs', random_state=42)
model.fit(X_train_scaled, y_train)

# 7. 预测与全套评估
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]

print("== Kaggle 泰坦尼克号生存预测 (Titanic Survival Prediction Lab) ==")
print("混淆矩阵 Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))
print("\n分类性能评估报告:")
print(classification_report(y_test, y_pred, target_names=['Unsurvived (未生存)', 'Survived (生存)']))
print(f"ROC-AUC 得分: {roc_auc_score(y_test, y_prob):.4f}")
